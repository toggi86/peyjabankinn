from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Team, Game, UserGuess
from django.utils import timezone
from datetime import timedelta
import random

class Command(BaseCommand):
    help = "Generate test users, teams, matches and guesses"

    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=100, help='Number of users to create')
        parser.add_argument('--teams', type=int, default=8, help='Number of teams to create')

    def handle(self, *args, **options):
        num_users = options['users']
        num_teams = options['teams']

        # --- Users ---
        users = []
        for i in range(1, num_users + 1):
            username = f"user{i:03d}"
            u, created = User.objects.get_or_create(username=username)
            if created:
                u.set_password("password123")
                u.save()
            users.append(u)
        self.stdout.write(self.style.SUCCESS(f"Created {len(users)} users"))

        # --- Teams ---
        team_names = ["Iceland", "Denmark", "Norway", "Sweden", "France", "Germany", "Spain", "Croatia"][:num_teams]
        teams = []
        for t in team_names:
            team, created = Team.objects.get_or_create(name=t)
            teams.append(team)
        self.stdout.write(self.style.SUCCESS(f"Created {len(teams)} teams"))

        # --- Matches ---
        matches = []
        start_date = timezone.now()
        for i in range(len(teams)):
            for j in range(i+1, len(teams)):
                m, created = Game.objects.get_or_create(
                    team_home=teams[i],
                    team_away=teams[j],
                    match_date=start_date + timedelta(days=len(matches)),
                    score_home=random.randint(20, 35),
                    score_away=random.randint(20, 35)
                )
                matches.append(m)
        self.stdout.write(self.style.SUCCESS(f"Created {len(matches)} matches"))

        # --- Guesses ---
        for idx, user in enumerate(users):
            for match in matches:
                if idx < 10:
                    home_guess = match.score_home + random.randint(-2, 2)
                    away_guess = match.score_away + random.randint(-2, 2)
                else:
                    home_guess = random.randint(15, 40)
                    away_guess = random.randint(15, 40)
                UserGuess.objects.create(
                    user=user,
                    match=match,
                    guess_home=home_guess,
                    guess_away=away_guess
                )
        self.stdout.write(self.style.SUCCESS(f"Created {len(users)*len(matches)} guesses"))
