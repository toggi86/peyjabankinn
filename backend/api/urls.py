from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, GameViewSet, UserGuessViewSet, leaderboard

router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'matches', GameViewSet, basename='match')
router.register(r'guesses', UserGuessViewSet, basename='guess')

urlpatterns = [
    path('', include(router.urls)),
    path("scores/", leaderboard),
]

