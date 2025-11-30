from rest_framework import serializers
from .models import Team, Game, UserGuess

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
        fields = ['match', 'guess_home', 'guess_away']

