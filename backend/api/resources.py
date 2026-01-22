import datetime

from zoneinfo import ZoneInfo

from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from .models import Game, Team, Competition

class GameResource(resources.ModelResource):
    team_home = fields.Field(
        column_name='team_home',
        attribute='team_home',
        widget=ForeignKeyWidget(Team, 'name')
    )
    team_away = fields.Field(
        column_name='team_away',
        attribute='team_away',
        widget=ForeignKeyWidget(Team, 'name')
    )
    competition = fields.Field(
        column_name='competition',
        attribute='competition',
        widget=ForeignKeyWidget(Competition, 'short_name')
    )

    class Meta:
        model = Game
        import_id_fields = ('team_home', 'team_away', 'match_date')
        fields = ('team_home', 'team_away', 'match_date', 'group', 'venue', 'competition')

    def before_import_row(self, row, **kwargs):
        """
        Convert the ISO string from CSV into a UTC datetime
        before Django tries to save the model.
        """
        raw_date = row.get('match_date')
        if raw_date:
            dt = datetime.datetime.fromisoformat(raw_date)
            dt = dt.replace(tzinfo=ZoneInfo("Europe/Copenhagen"))
            row['match_date'] = dt.astimezone(ZoneInfo("UTC"))
