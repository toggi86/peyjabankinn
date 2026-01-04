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
from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.decorators import (
    action,
    api_view,
    permission_classes,
)
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import (
    viewsets,
    permissions,
)

from api.filters import (
    BonusQuestionFilter,
    GameFilter,
    UserBonusAnswerFilter,
    UserGuessFilter,
)
from api.models import (
    BonusChoices,
    BonusQuestion,
    BonusQuestionChoices,
    Competition,
    Game,
    Team,
    UserBonusAnswer,
    UserGuess,
)
from api.serializers import (
    BonusChoicesSerializer,
    BonusQuestionSerializer,
    BonusQuestionChoicesSerializer,
    CompetitionSerializer,
    GameSerializer,
    TeamSerializer,
    UserBonusAnswerSerializer,
    UserGuessSerializer,
    UserGuessCreateSerializer,
)
from api.permissions import (
    BeforeObjectDatePermission,
    IsOwner,
    IsStaffOrReadOnly,
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
    filter_backends = [DjangoFilterBackend]
    filterset_class = GameFilter

class UserGuessViewSet(viewsets.ModelViewSet):
    queryset = UserGuess.objects.all()
    permission_classes = [
        BeforeObjectDatePermission,
        permissions.IsAuthenticated,
        IsOwner
    ]
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserGuessFilter

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserGuessCreateSerializer
        return UserGuessSerializer

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        match = serializer.validated_data.get('match')
        if timezone.now() > match.match_date:
            raise PermissionDenied("Guesses are locked for this match")
        serializer.save(user=self.request.user)


class BonusQuestionViewSet(viewsets.ModelViewSet):
    queryset = BonusQuestion.objects.all().order_by("id").distinct()
    serializer_class = BonusQuestionSerializer
    permission_classes = [IsStaffOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_class = BonusQuestionFilter

    @action(detail=True, methods=["post"], permission_classes=[IsStaffOrReadOnly])
    def set_correct(self, request, pk=None):
        question = self.get_object()
        choice_id = request.data.get("choice_id")

        try:
            choice = BonusQuestionChoices.objects.get(id=choice_id, question=question)
        except BonusQuestionChoices.DoesNotExist:
            return Response({"error": "Invalid choice for this question"}, status=400)

        question.correct_choice = choice
        question.save()

        return Response({"status": "correct answer saved"})


class CompetitionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer


class UserBonusAnswerViewSet(viewsets.ModelViewSet):
    serializer_class = UserBonusAnswerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserBonusAnswerFilter
    permission_classes = [
        permissions.IsAuthenticated,
        IsOwner,
        BeforeObjectDatePermission,
    ]

    def get_queryset(self):
        return UserBonusAnswer.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        competition = serializer.validated_data["question"].competition

        if timezone.now() > competition.start_date:
            raise PermissionDenied("Bonus answers are locked once the competition starts.")

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)  # ensure user doesn't change


class BonusChoicesViewSet(viewsets.ModelViewSet):
    queryset = BonusChoices.objects.all()
    serializer_class = BonusChoicesSerializer
    permission_classes = [IsStaffOrReadOnly]


class BonusQuestionChoicesViewSet(viewsets.ModelViewSet):
    queryset = BonusQuestionChoices.objects.all()
    serializer_class = BonusQuestionChoicesSerializer
    permission_classes = [IsStaffOrReadOnly]

@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def leaderboard(request):
    """
    Leaderboard including:
      - Match guessing points (0–5)
      - Bonus questions (5 points per correct answer)
    """

    competition_id = request.query_params.get("competition")

    # --------------------------
    # 1) MATCH GUESS SCORING (FILTERED)
    # --------------------------
    guesses = UserGuess.objects.all()

    if competition_id:
        guesses = guesses.filter(match__competition_id=competition_id)

    guesses_with_points = guesses.annotate(
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
            When(guess_diff__gt=0, real_diff__gt=0, then=Value(1)),
            When(guess_diff__lt=0, real_diff__lt=0, then=Value(1)),
            When(guess_diff=0, real_diff=0, then=Value(1)),
            default=Value(0),
            output_field=IntegerField()
        )
    ).annotate(
        points=Case(
            When(home_correct=1, away_correct=1, then=Value(5)),        # exact
            When(result_correct=1, home_correct=1, then=Value(3)),      # result + one number
            When(result_correct=1, away_correct=1, then=Value(3)),      # result + one number
            When(result_correct=1, then=Value(1)),                      # correct result
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

    # --------------------------
    # 2) AGGREGATE MATCH SCORES PER USER
    # --------------------------
    match_scores = guesses_with_points.values(
        "user_id", "user__username"
    ).annotate(
        match_points=Sum("points"),
        exact=Sum(Case(
            When(home_correct=1, away_correct=1, then=1),
            default=0,
            output_field=IntegerField()
        )),
        one_score=Sum("one_score"),
        total_guesses=Count("id"),
        correct_results=Sum("result_correct"),
    )

    match_by_user = {row["user_id"]: row for row in match_scores}

    # --------------------------
    # 3) BONUS QUESTION SCORING (FILTERED)
    # --------------------------
    bonus_answers = UserBonusAnswer.objects.all()

    if competition_id:
        bonus_answers = bonus_answers.filter(
            question__competition_id=competition_id
        )

    bonus_scores = bonus_answers.annotate(
        is_correct=Case(
            When(answer=F("question__correct_choice"), then=Value(1)),
            default=Value(0),
            output_field=IntegerField()
        ),
        bonus_points=F("is_correct") * 6
    ).values("user_id").annotate(
        total_bonus_points=Sum("bonus_points"),
        correct_bonus=Sum("is_correct"),
        total_bonus=Count("id")
    )

    bonus_by_user = {row["user_id"]: row for row in bonus_scores}

    # --------------------------
    # 4) MERGE MATCH + BONUS SCORES
    # --------------------------
    leaderboard_data = []

    for user_id, m in match_by_user.items():

        b = bonus_by_user.get(user_id, {
            "total_bonus_points": 0,
            "correct_bonus": 0,
            "total_bonus": 0
        })

        total_points = m["match_points"] + b["total_bonus_points"]
        leaderboard_data.append({
            "user": m["user__username"],
            "points": total_points,
            "match_points": m["match_points"],
            "bonus_points": b["total_bonus_points"],
            "exact": m["exact"],
            "one_score": m["one_score"],
            "correct_bonus": b["correct_bonus"]
        })

    # --------------------------
    # 5) SORT LEADERBOARD
    # --------------------------
    leaderboard_data.sort(
        key=lambda x: (-x["points"], -x["exact"])
    )

    return Response(leaderboard_data)

