import django_filters
from .models import (
    BonusQuestion,
    UserBonusAnswer,
    Game,
    UserGuess,
)


class BonusQuestionFilter(django_filters.FilterSet):
    competition = django_filters.NumberFilter(field_name="competition_id")

    class Meta:
        model = BonusQuestion
        fields = ["competition"]


class UserBonusAnswerFilter(django_filters.FilterSet):
    competition = django_filters.NumberFilter(
        field_name="question__competition_id"
    )

    class Meta:
        model = UserBonusAnswer
        fields = ["competition"]


class GameFilter(django_filters.FilterSet):
    competition = django_filters.NumberFilter(field_name="competition_id")

    class Meta:
        model = Game
        fields = ["competition"]


class UserGuessFilter(django_filters.FilterSet):
    competition = django_filters.NumberFilter(
        field_name="match__competition_id"
    )

    class Meta:
        model = UserGuess
        fields = ["competition"]

