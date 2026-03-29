from django.contrib.auth.models import User
from django.test import TestCase

from api.models import LotteryResult
from api.services.prediction_service import PredictionService
from api.services.statistics_service import StatisticsService
from api.services.traditional_service import TraditionalService


class ServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        # Create some lottery results
        LotteryResult.objects.create(
            issue_number="2024001", draw_date="2024-01-01", red_balls=[1, 2, 3, 4, 5, 6], blue_ball=1, prize_pool=100
        )
        LotteryResult.objects.create(
            issue_number="2024002", draw_date="2024-01-02", red_balls=[2, 3, 4, 5, 6, 7], blue_ball=2, prize_pool=100
        )

    def test_prediction_service(self):
        # Test predict with algorithms
        result = PredictionService.predict(["random"], self.user)
        self.assertIn("red", result)
        self.assertIn("blue", result)
        self.assertIn("confidence", result)
        self.assertEqual(len(result["red"]), 6)

        # Test predict random
        result = PredictionService.predict(["random"])
        self.assertEqual(len(result["red"]), 6)

    def test_traditional_service(self):
        # Test traditional predict
        result = TraditionalService.predict("meihua", "2024-01-01 12:00:00", 1, self.user)
        self.assertIn("numbers", result)
        self.assertIn("details", result)
        self.assertIn("metadata", result["details"][0])
        self.assertIn("created_at", result, "created_at field missing in response")

        # Test error handling
        result = TraditionalService.predict("invalid", "xxxx", 1)
        self.assertIn("error", result)

    def test_traditional_service_extended(self):
        # Test new methods
        for method in ["bazi", "heluo", "timespace"]:
            result = TraditionalService.predict(method, "2024-01-01 12:00:00", 1, self.user)
            self.assertIn("numbers", result, f"Method {method} failed")

        # Test multiple methods
        methods = ["meihua", "bazi"]
        result = TraditionalService.predict(methods, "2024-01-01 12:00:00", 1, self.user)
        self.assertIn("numbers", result)
        self.assertIn("details", result)

    def test_statistics_service(self):
        stats = StatisticsService.get_statistics()
        self.assertIn("red_frequency", stats)
        self.assertIn("blue_frequency", stats)
        self.assertIn("hot_numbers", stats)
        self.assertTrue(len(stats["red_frequency"]) > 0)
