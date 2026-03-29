import random
import time
from datetime import datetime, timedelta

from django.test import TestCase

from api.algorithms.numerology import TimeParser, TraditionalPredictor


class TraditionalNumerologyTest(TestCase):
    def setUp(self):
        self.predictor = TraditionalPredictor()
        self.sample_ganzhi = "丙午年 庚寅月 甲子日"

    def test_time_parser(self):
        parser = TimeParser()
        res = parser.parse(self.sample_ganzhi)
        self.assertEqual(res["yearGan"], 3)  # Bing
        self.assertEqual(res["dayZhi"], 1)  # Zi

    def test_meihua_engine(self):
        res = self.predictor.predict("meihua", self.sample_ganzhi)
        self.assertIn("numbers", res)
        self.assertEqual(len(res["numbers"]["red"]), 6)
        self.assertIsInstance(res["numbers"]["blue"], int)

    def test_qimen_engine(self):
        res = self.predictor.predict("qimen", self.sample_ganzhi)
        self.assertIn("numbers", res)

    def test_liuyao_engine(self):
        res = self.predictor.predict("liuyao", self.sample_ganzhi)
        self.assertIn("numbers", res)

    def test_invalid_inputs(self):
        """Test system behavior with invalid inputs"""
        # Invalid date format
        res = self.predictor.predict("meihua", "invalid-date-string")
        self.assertIn("error", res)

        # Empty input (should default to now, success)
        res = self.predictor.predict("meihua", "")
        self.assertNotIn("error", res)

        # None input (should default to now, success)
        res = self.predictor.predict("meihua", None)
        self.assertNotIn("error", res)

    def test_leap_month(self):
        """Test known leap month date (2020-04-23 is Leap 4th Month in Lunar)"""
        # 2020-05-23 is Leap 4th Month 1st Day in Lunar
        date_str = "2020-05-23 12:00:00"
        res = self.predictor.predict("meihua", date_str)
        self.assertNotIn("error", res)
        # Check metadata to see if it handled it (optional, just ensuring no crash)

    def test_midnight_crossing(self):
        """Test midnight crossing (Zi hour ambiguity)"""
        # 23:30 should be considered late Zi hour (next day or same day depending on system)
        # 00:30 is early Zi hour
        # Ensure no crash

        # Late Zi: 23:30:00
        res_late = self.predictor.predict("meihua", "2023-01-01 23:30:00")
        self.assertNotIn("error", res_late)

        # Early Zi: 00:30:00
        res_early = self.predictor.predict("meihua", "2023-01-02 00:30:00")
        self.assertNotIn("error", res_early)

        # Compare Ganzhi - should be same Hour Ganzhi usually if same day boundary logic holds
        # But day might differ.

    def test_solar_term_transition(self):
        """Test solar term transition dates (Jie Qi)"""
        # Li Chun usually around Feb 4
        # 2024 Li Chun is Feb 4 16:26:53
        # Test just before and after

        # Before
        res_before = self.predictor.predict("meihua", "2024-02-04 12:00:00")
        self.assertNotIn("error", res_before)

        # After
        res_after = self.predictor.predict("meihua", "2024-02-04 18:00:00")
        self.assertNotIn("error", res_after)

    def test_edge_cases(self):
        """Test edge cases like leap years and year boundaries"""
        # Leap Year Day
        res = self.predictor.predict("meihua", "2024-02-29 12:00:00")
        self.assertNotIn("error", res)
        self.assertIn("numbers", res)

        # End of Year
        res = self.predictor.predict("qimen", "2023-12-31 23:59:59")
        self.assertNotIn("error", res)

        # Start of Year
        res = self.predictor.predict("liuyao", "2024-01-01 00:00:00")
        self.assertNotIn("error", res)

        # Future Date (far future)
        res = self.predictor.predict("meihua", "2099-12-31 12:00:00")
        self.assertNotIn("error", res)

        # Past Date (far past)
        res = self.predictor.predict("meihua", "1901-01-01 12:00:00")
        self.assertNotIn("error", res)

    def test_invalid_ganzhi_chars(self):
        """Test with valid structure but invalid chars"""
        # 'X' is not a valid stem/branch
        res = self.predictor.predict("meihua", "X子年 庚寅月 甲子日")
        self.assertIn("error", res)

    def test_robustness_1000_runs(self):
        """
        Requirement: Continuous 1000 random generated real historical dates.
        We will generate 1000 random dates between 1980 and 2030.
        """
        start_date = datetime(1980, 1, 1)
        end_date = datetime(2030, 12, 31)
        delta = end_date - start_date
        total_seconds = int(delta.total_seconds())

        methods = ["meihua", "qimen", "liuyao"]

        success_count = 0
        total_runs = 1000
        start_time = time.time()

        print(f"\nStarting {total_runs} runs robustness test...")

        for i in range(total_runs):
            # Generate random date
            random_seconds = random.randrange(total_seconds)
            random_date = start_date + timedelta(seconds=random_seconds)
            date_str = random_date.strftime("%Y-%m-%d %H:%M:%S")

            # Random method
            method = random.choice(methods)

            try:
                res = self.predictor.predict(method, date_str)
                if "error" not in res and "numbers" in res:
                    # Validate structure
                    nums = res["numbers"]
                    if len(nums.get("red", [])) == 6 and isinstance(nums.get("blue"), int):
                        success_count += 1
                    else:
                        print(f"Invalid structure at {i}: {res}")
                else:
                    print(f"Failed at {i}: {date_str} - {res.get('error')}")
            except Exception as e:
                print(f"Exception at {i}: {date_str} - {e}")

        duration = time.time() - start_time
        print(f"1000 runs completed in {duration:.2f}s. Success rate: {success_count}/{total_runs}")

        self.assertEqual(success_count, total_runs, "Success rate must be 100%")

    def test_monte_carlo_performance(self):
        # Kept for backward compatibility but reduced scope as 1000_runs covers it
        pass
