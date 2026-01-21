from django.contrib import admin

from import_export.admin import ImportExportModelAdmin

from api.models import (
    Team,
    Game,
    UserGuess,
    BonusQuestion,
    BonusQuestionChoices,
    BonusChoices,
    Competition,
    UserBonusAnswer,
)

from .resources import GameResource

admin.site.register(Team)
admin.site.register(UserGuess)
admin.site.register(BonusQuestion)
admin.site.register(BonusQuestionChoices)
admin.site.register(BonusChoices)
admin.site.register(Competition)
admin.site.register(UserBonusAnswer)

@admin.register(Game)
class GameAdmin(ImportExportModelAdmin):
    resource_class = GameResource
    list_display = ('team_home', 'team_away', 'match_date', 'group', 'competition')
    list_filter = ('competition', 'group', 'match_date')
    search_fields = ('team_home__name', 'team_away__name', 'venue')
