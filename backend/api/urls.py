from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeamViewSet,
    GameViewSet,
    UserGuessViewSet,
    leaderboard,
    BonusChoicesViewSet,
    BonusQuestionViewSet,
    BonusQuestionChoicesViewSet,
    UserBonusAnswerViewSet,
)

router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'matches', GameViewSet, basename='match')
router.register(r'guesses', UserGuessViewSet, basename='guess')
router.register("bonus-choices", BonusChoicesViewSet)
router.register("bonus-questions", BonusQuestionViewSet)
router.register("bonus-question-choices", BonusQuestionChoicesViewSet)
router.register("bonus-answers", UserBonusAnswerViewSet, basename="bonus-answers")

urlpatterns = [
    path('', include(router.urls)),
    path("scores/", leaderboard),
]

