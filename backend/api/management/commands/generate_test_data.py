import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from api.models import Game, UserGuess, Competition  # adjust import

User = get_user_model()

class Command(BaseCommand):
    help = "Generate test users and guesses for existing matches in the current competition"

    def add_arguments(self, parser):
        parser.add_argument(
            '--num_users',
            type=int,
            default=5,
            help='Number of test users to create',
        )
        parser.add_argument(
            '--competition_id',
            type=int,
            default=None,
            help='ID of the competition to use (default: first competition)',
        )

    def handle(self, *args, **options):
        num_users = options['num_users']
        competition_id = options['competition_id']

        # -------------------------
        # 1) Get competition
        # -------------------------
        if competition_id:
            try:
                competition = Competition.objects.get(id=competition_id)
            except Competition.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Competition {competition_id} not found"))
                return
        else:
            competition = Competition.objects.first()
            if not competition:
                self.stdout.write(self.style.ERROR("No competition found"))
                return

        matches = Game.objects.filter(competition=competition)
        if not matches.exists():
            self.stdout.write(self.style.WARNING("No matches found in this competition"))
            return

        # -------------------------
        # 2) Create users
        # -------------------------
        users = []
        for i in range(num_users):
            username = f"testuser{i+1}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"email": f"{username}@example.com", "is_active": True}
            )
            if created:
                user.set_password("password123")
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
            users.append(user)

        # -------------------------
        # 3) Generate guesses
        # -------------------------
        for user in users:
            for match in matches:
                # Skip if guess already exists
                if UserGuess.objects.filter(user=user, match=match).exists():
                    continue

                guess_home = random.randint(0, match.score_home or 5) if match.score_home is not None else random.randint(0, 5)
                guess_away = random.randint(0, match.score_away or 5) if match.score_away is not None else random.randint(0, 5)

                UserGuess.objects.create(
                    user=user,
                    match=match,
                    guess_home=guess_home,
                    guess_away=guess_away
                )

            self.stdout.write(self.style.SUCCESS(f"Added guesses for {user.username} ({matches.count()} matches)"))

        self.stdout.write(self.style.SUCCESS(f"Test data generation complete: {num_users} users, {matches.count()} matches each."))
