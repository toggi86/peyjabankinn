from rest_framework import serializers

from .models import (
    BonusChoices,
    BonusQuestion,
    BonusQuestionChoices,
    Competition,
    Game,
    Team,
    UserBonusAnswer,
    UserGuess,
)


class BonusChoicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = BonusChoices
        fields = ["id", "choice"]


class BonusQuestionChoicesSerializer(serializers.ModelSerializer):
    choice = BonusChoicesSerializer(read_only=True)

    class Meta:
        model = BonusQuestionChoices
        fields = ["id", "choice", "question"]


class BonusQuestionSerializer(serializers.ModelSerializer):
    choices = BonusQuestionChoicesSerializer(
        source="available_question_choices", many=True, read_only=True
    )

    correct_answer = serializers.SerializerMethodField()

    class Meta:
        model = BonusQuestion
        fields = ["id", "question", "competition", "choices", "correct_answer"]

    def get_correct_answer(self, obj):
        if obj.correct_choice:
            return BonusQuestionChoicesSerializer(obj.correct_choice).data
        return None


class CompetitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competition
        fields = ["id", "name"]


class UserBonusAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBonusAnswer
        fields = ["id", "user", "question", "answer"]
        read_only_fields = ["user"]

    def get_queryset(self):
        return UserBonusAnswer.objects.filter(user=self.request.user)


class TeamSerializer(serializers.ModelSerializer):

    class Meta:
        model = Team
        fields = ['name', 'country_code', 'flag_url']

class GameSerializer(serializers.ModelSerializer):
    team_home = TeamSerializer(read_only=True)
    team_away = TeamSerializer(read_only=True)

    class Meta:
        model = Game
        fields = '__all__'

class UserGuessSerializer(serializers.ModelSerializer):
    match = GameSerializer(read_only=True)

    class Meta:
        model = UserGuess
        fields = '__all__'

class UserGuessCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGuess
        fields = ['id', 'match', 'guess_home', 'guess_away']

