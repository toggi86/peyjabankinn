from django.contrib.auth import get_user_model
from django.db.models import (
    F,
    Case,
    When,
    IntegerField,
    Value,
    Count,
    Sum
)
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import (
    viewsets,
    permissions,
)

from api.models import (
    Team,
    Game,
    UserGuess,
)
from api.serializers import (
    GameSerializer,
    TeamSerializer,
    UserGuessSerializer,
    UserGuessCreateSerializer,
)
from api.permissions import (
    IsOwner,
    IsStaffOrReadOnly
)

User = get_user_model()

class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.AllowAny]

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all().order_by('match_date')
    serializer_class = GameSerializer
    permission_classes = [IsStaffOrReadOnly]

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
    """
    Optimized leaderboard using database aggregation.
    Scoring rules:
      - 1 point: correct result only
      - 3 points: correct result + one number correct
      - 5 points: exact score
    """

    # Annotate each guess with points
    guesses_with_points = UserGuess.objects.annotate(
        home_correct=Case(
            When(guess_home=F('match__score_home'), then=Value(1)),
            default=Value(0),
            output_field=IntegerField()
        ),
        away_correct=Case(
            When(guess_away=F('match__score_away'), then=Value(1)),
            default=Value(0),
            output_field=IntegerField()
        ),
        guess_diff=F('guess_home') - F('guess_away'),
        real_diff=F('match__score_home') - F('match__score_away')
    ).annotate(
        result_correct=Case(
            When(
                guess_diff__gt=0, real_diff__gt=0, then=Value(1)
            ),
            When(
                guess_diff__lt=0, real_diff__lt=0, then=Value(1)
            ),
            When(
                guess_diff=0, real_diff=0, then=Value(1)
            ),
            default=Value(0),
            output_field=IntegerField()
        )
    ).annotate(
        points=Case(
            When(home_correct=1, away_correct=1, then=Value(5)),
            When(result_correct=1, home_correct=1, then=Value(3)),
            When(result_correct=1, away_correct=1, then=Value(3)),
            When(result_correct=1, then=Value(1)),
            default=Value(0),
            output_field=IntegerField()
        ),
        one_score=Case(
            When(result_correct=1, then=Case(
                When(home_correct=1, away_correct=0, then=Value(1)),
                When(home_correct=0, away_correct=1, then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )),
            default=Value(0),
            output_field=IntegerField()
        )
    )

    # Aggregate per user
    users_scores = guesses_with_points.values('user__username').annotate(
        points=Sum('points'),
        exact=Sum(Case(
            When(home_correct=1, away_correct=1, then=1),
            default=0,
            output_field=IntegerField()
        )),
        one_score=Sum('one_score'),
        total_guesses=Count('id'),
        correct_results=Sum('result_correct'),
    )

    # Add percentages & average points
    leaderboard_data = []
    for u in users_scores:
        total = u['total_guesses'] or 1
        leaderboard_data.append({
            "user": u['user__username'],
            "points": u['points'],
            "exact": u['exact'],
            "one_score": u['one_score'],
            "total_guesses": u['total_guesses'],
            "win_percentage": round((u['correct_results']/total)*100, 1),
            "avg_points": round(u['points']/total, 2)
        })

    # Sort
    leaderboard_data.sort(key=lambda x: (-x["points"], -x["exact"], -x["win_percentage"]))
    return Response(leaderboard_data)