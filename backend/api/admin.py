from django.contrib import admin

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

admin.site.register(Team)
admin.site.register(Game)
admin.site.register(UserGuess)
admin.site.register(BonusQuestion)
admin.site.register(BonusQuestionChoices)
admin.site.register(BonusChoices)
admin.site.register(Competition)
admin.site.register(UserBonusAnswer)