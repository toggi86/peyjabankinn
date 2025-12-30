from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Competition(models.Model):
    short_name = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    start_date = models.DateTimeField()

    def __str__(self):
        return self.name

class BonusChoices(models.Model):
    choice = models.CharField(max_length=200)

    def __str__(self):
        return self.choice


class BonusQuestion(models.Model):
    question = models.CharField(max_length=500)
    competition = models.ForeignKey(
        Competition, on_delete=models.SET_NULL, null=True, blank=True, db_index=True
    )

    # correct answer -- points to a per-question choice row
    correct_choice = models.ForeignKey(
        "BonusQuestionChoices",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="correct_for_question"
    )

    # Many-to-many through model -> allows unique choices per question
    question_choices = models.ManyToManyField(
        BonusChoices,
        through="BonusQuestionChoices",
        related_name="used_in_questions"
    )

    def __str__(self):
        return self.question

    @property
    def lock_datetime(self):
        return self.competition.start_date


class BonusQuestionChoices(models.Model):
    choice = models.ForeignKey(BonusChoices, on_delete=models.CASCADE)
    question = models.ForeignKey(
        BonusQuestion,
        on_delete=models.CASCADE,
        related_name="available_question_choices"
    )

    def __str__(self):
        return f"{self.question} → {self.choice}"


class UserBonusAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bonus_answers")
    question = models.ForeignKey(BonusQuestion, on_delete=models.CASCADE, related_name="answers")
    answer = models.ForeignKey(
        BonusQuestionChoices,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_answers"
    )

    class Meta:
        unique_together = ("user", "question")  # only one guess per question

    def __str__(self):
        return f"{self.user.username} → {self.question} : {self.answer}"

    @property
    def lock_datetime(self):
        return self.question.competition.start_date


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    country_code = models.CharField(
        max_length=2,
        help_text="ISO 3166-1 alpha-2 code (e.g., 'ES' for Spain, 'DK' for Denmark)",
        blank=True,
        null=True,
    )

    @property
    def flag_url(self):
        """
        Returns the flag image URL from FlagsAPI (https://flagsapi.com/)
        """
        if not self.country_code:
            return None
        return f"https://flagsapi.com/{self.country_code.upper()}/flat/64.png"

    def __str__(self):
        return self.name

class Game(models.Model):
    team_home = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='home_matches')
    team_away = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='away_matches')
    match_date = models.DateTimeField()
    score_home = models.PositiveIntegerField(blank=True, null=True)
    score_away = models.PositiveIntegerField(blank=True, null=True)
    group = models.CharField(max_length=2)
    venue = models.CharField(max_length=200, blank=True, null=True)
    competition = models.ForeignKey(Competition, on_delete=models.SET_NULL, null=True, blank=True, db_index=True)

    def __str__(self):
        return f"{self.team_home} vs {self.team_away} on {self.match_date}"

class UserGuess(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='guesses')
    match = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='guesses')
    guess_home = models.PositiveIntegerField(blank=True, null=True)
    guess_away = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'match')

    def __str__(self):
        return f"{self.user.username}'s guess for {self.match}"

    @property
    def lock_datetime(self):
        return self.match.match_date

