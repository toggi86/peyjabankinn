from django.contrib import admin

from api.models import (
    Team,
    Game,
    UserGuess
)

admin.site.register(Team)
admin.site.register(Game)
admin.site.register(UserGuess)
