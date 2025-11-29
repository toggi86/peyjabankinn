from rest_framework import viewsets, permissions
from api.models import Team, Game, UserGuess
from api.serializers import TeamSerializer, GameSerializer, UserGuessSerializer, UserGuessCreateSerializer
from api.permissions import IsOwner

class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.AllowAny]

class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

class UserGuessViewSet(viewsets.ModelViewSet):
    queryset = UserGuess.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserGuessCreateSerializer
        return UserGuessSerializer

    def get_queryset(self):
        # Users can only see their own guesses
        return UserGuess.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

