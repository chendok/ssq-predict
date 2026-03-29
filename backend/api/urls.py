from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AIInterpretationView,
    CustomAuthToken,
    DivinationGodsAndShaNobleView,
    DivinationGodsAndShaYearlyView,
    DivinationView,
    HexagramDetailView,
    LineDetailView,
    LotteryResultViewSet,
    PredictionHistoryViewSet,
    PredictionView,
    RegisterView,
    StatisticsView,
    TraditionalPredictionView,
    UpdateLotteryDataView,
)

router = DefaultRouter()
router.register(r"history", LotteryResultViewSet)
router.register(r"predictions", PredictionHistoryViewSet, basename="prediction-history")

urlpatterns = [
    path("", include(router.urls)),
    path("predict/", PredictionView.as_view(), name="predict"),
    path("predict/traditional/", TraditionalPredictionView.as_view(), name="predict-traditional"),
    path("interpret/", AIInterpretationView.as_view(), name="interpret"),
    path("statistics/", StatisticsView.as_view(), name="statistics"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomAuthToken.as_view(), name="login"),
    # I-Ching URLs
    path("gua/<str:name>/", HexagramDetailView.as_view(), name="hexagram-detail"),
    path("gua/<str:name>/yao/<int:position>/", LineDetailView.as_view(), name="line-detail"),
    path("divination/", DivinationView.as_view(), name="divination"),
    path("divination/gods-and-sha/yearly", DivinationGodsAndShaYearlyView.as_view(), name="gods-and-sha-yearly"),
    path("divination/gods-and-sha/noble", DivinationGodsAndShaNobleView.as_view(), name="gods-and-sha-noble"),
    path("update-data/", UpdateLotteryDataView.as_view(), name="update-data"),
]
