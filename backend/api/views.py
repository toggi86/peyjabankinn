from django.contrib.auth import get_user_model

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import viewsets, permissions

from api.models import Team, Game, UserGuess
from api.serializers import TeamSerializer, GameSerializer, UserGuessSerializer, UserGuessCreateSerializer
from api.permissions import IsOwner

User = get_user_model()

class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.AllowAny]

class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

class UserGuessViewSet(viewsets.ModelViewSet):
    queryset = UserGuess.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserGuessCreateSerializer
        return UserGuessSerializer

    def get_queryset(self):
        # Users can only see their own guesses
        return UserGuess.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def leaderboard(request):
    users = User.objects.all()
    results = []

    for user in users:
        guesses = UserGuess.objects.filter(user=user).select_related("match")
        points = 0
        exact_correct = 0
        correct_result_count = 0
        one_score_correct_count = 0

        for g in guesses:
            m = g.match
            if m.score_home is None or m.score_away is None:
                continue

            guess_diff = g.guess_home - g.guess_away
            real_diff = m.score_home - m.score_away

            correct_result = (
                (guess_diff > 0 and real_diff > 0) or
                (guess_diff < 0 and real_diff < 0) or
                (guess_diff == 0 and real_diff == 0)
            )

            home_correct = g.guess_home == m.score_home
            away_correct = g.guess_away == m.score_away

            if home_correct and away_correct:
                points += 5
                exact_correct += 1
            elif correct_result and (home_correct or away_correct):
                points += 3
                one_score_correct_count += 1
            elif correct_result:
                points += 1

            if correct_result:
                correct_result_count += 1

        total_guesses = guesses.count()
        accuracy = round((exact_correct / total_guesses) * 100, 1) if total_guesses else 0
        avg_points = round(points / total_guesses, 2) if total_guesses else 0

        results.append({
            "user": user.username,
            "points": points,
            "exact": exact_correct,
            "one_score": one_score_correct_count,
            "total_guesses": total_guesses,
            "win_percentage": round((correct_result_count / total_guesses) * 100, 1) if total_guesses else 0,
            "accuracy": accuracy,
            "avg_points": avg_points,
        })

    # Sort by points first, then exact, then win_percentage
    results.sort(key=lambda x: (-x["points"], -x["exact"], -x["win_percentage"]))
    return Response(results)
