import csv
from django.core.management.base import BaseCommand
from api.models import (
    BonusChoices,
    BonusQuestion,
    BonusQuestionChoices,
    Competition,
    Game,
    Team,
)
from datetime import datetime
from zoneinfo import ZoneInfo

# Map team names to ISO alpha-2 country codes
COUNTRY_CODES = {
    "Spain": "ES",
    "Serbia": "RS",
    "Germany": "DE",
    "Austria": "AT",
    "Denmark": "DK",
    "Portugal": "PT",
    "North Macedonia": "MK",
    "Romania": "RO",
    "France": "FR",
    "Norway": "NO",
    "Czech Republic": "CZ",
    "Ukraine": "UA",
    "Slovenia": "SI",
    "Faroe Islands": "FO",
    "Montenegro": "ME",
    "Switzerland": "CH",
    "Sweden": "SE",
    "Croatia": "HR",
    "Netherlands": "NL",
    "Georgia": "GE",
    "Hungary": "HU",
    "Iceland": "IS",
    "Italy": "IT",
    "Poland": "PL",
}

class Command(BaseCommand):
    help = "Import EHF EURO 2026 preliminary matches and teams with country codes"

    def handle(self, *args, **options):
        csv_file = "euro_prelim_matches_with_flags.csv"

        with open(csv_file, encoding="utf-8") as f:
            reader = csv.DictReader(f)

            teams_cache = {}

            competition = Competition.objects.get(short_name='Euro 2026')

            for row in reader:
                # --- TEAMS ---
                for team_field in ["team_home", "team_away"]:
                    name = row[team_field]
                    if name not in teams_cache:
                        country_code = COUNTRY_CODES.get(name)
                        if not country_code:
                            self.stdout.write(self.style.WARNING(f"No country code for {name}, skipping"))
                            continue
                        team, created = Team.objects.get_or_create(name=name)
                        team.country_code = country_code
                        team.save()
                        teams_cache[name] = team

                # --- MATCH ---
                date_str = f"{row['date']} {row['time']}"  # "15 January 2026 18:00"
                local_time = datetime.strptime(date_str, "%d %B %Y %H:%M")
                local_time = local_time.replace(tzinfo=ZoneInfo("Europe/Copenhagen"))
                match_date_utc = local_time.astimezone(ZoneInfo("UTC"))

                home_team = teams_cache.get(row["team_home"])
                away_team = teams_cache.get(row["team_away"])
                if not home_team or not away_team:
                    continue  # Skip if team not in cache

                match, created = Game.objects.get_or_create(
                    team_home=home_team,
                    team_away=away_team,
                    match_date=match_date_utc,
                    competition=competition,
                    defaults={
                        "venue": row["venue"],
                        "group": row["group"]
                    }
                )
                if not created:
                    # Update venue/group if already exists
                    match.venue = row["venue"]
                    match.group = row["group"]
                    match.save()

                all_icelandic_players = [
                    "Andri Már Rúnarsson",
                    "Arnar Freyr Arnarsson",
                    "Bjarki Már Elísson",
                    "Björgvin Páll Gústavsson",
                    "Einar Þorsteinn Ólafsson",
                    "Elliði Snær Viðarsson",
                    "Elvar Örn Jónsson",
                    "Gísli Þorgeir Kristjánsson",
                    "Haukur Þrastarsson",
                    "Janus Daði Smárason",
                    "Orri Freyr Þorkelsson",
                    "Óðinn Þór Ríkharðsson",
                    "Ómar Ingi Magnússon",
                    "Teitur Örn Einarsson"
                    "Viggó Kristjánsson",
                    "Viktor Gísli Hallgrímsson",
                    "Ýmir Örn Gíslason",
                ]

                all_teams = list(COUNTRY_CODES.keys())

                bonus_question_data = [
                    {
                        "question": "1. sæti",
                        "choices": all_teams,
                    },
                    {
                        "question": "2. sæti",
                        "choices": all_teams,
                    },
                    {
                        "question": "3. sæti",
                        "choices": all_teams,
                    },
                    {
                        "question": "Markahæstur",
                        "choices": all_icelandic_players,
                    },
                    {
                        "question": "Flestar 2 mínútur",
                        "choices": all_icelandic_players,
                    },
                    {
                        "question": "Hversu mörg víti verja markmennirnir?",
                        "choices": [str(i) for i in range(1, 10)] + ['10+']
                    },
                    {
                        "question": "Hversu mörg rauð spjöld fáum við?",
                        "choices": [str(i) for i in range(1, 10)] + ['10+']
                    }
                ]
                for item in bonus_question_data:
                    question, _ = BonusQuestion.objects.get_or_create(
                        question=item['question'],
                        competition=competition
                    )

                    for choice_text in item["choices"]:
                        choice, _ = BonusChoices.objects.get_or_create(choice=choice_text)

                        BonusQuestionChoices.objects.get_or_create(
                            question=question,
                            choice=choice
                        )

        self.stdout.write(self.style.SUCCESS("Teams (with country codes) and matches imported successfully."))
