from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    flag_url = models.URLField(blank=True, null=True)  # optional image

    def __str__(self):
        return self.name

class Game(models.Model):
    team_home = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='home_matches')
    team_away = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='away_matches')
    match_date = models.DateTimeField()
    score_home = models.PositiveIntegerField(blank=True, null=True)
    score_away = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.team_home} vs {self.team_away} on {self.match_date}"

class UserGuess(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='guesses')
    match = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='guesses')
    guess_home = models.PositiveIntegerField()
    guess_away = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'match')

    def __str__(self):
        return f"{self.user.username}'s guess for {self.match}"

