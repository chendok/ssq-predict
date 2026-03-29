from django.test import TestCase

from api.services.gods_and_sha_service import GodsAndShaService


class GodsAndShaServiceTest(TestCase):
    def test_get_yearly_sha_structure(self):
        res = GodsAndShaService.get_yearly_sha("2024-01-01 12:00:00")
        self.assertIn("yearlySha", res)
        self.assertIn("influenceChart", res)
        self.assertIsInstance(res["yearlySha"], list)
        self.assertIsInstance(res["influenceChart"], list)

        if res["yearlySha"]:
            item = res["yearlySha"][0]
            self.assertIn("name", item)
            self.assertIn("value", item)
            self.assertIn("desc", item)

    def test_get_noble_stars_structure(self):
        res = GodsAndShaService.get_noble_stars("2024-01-01 12:00:00")
        self.assertIn("nobleStars", res)
        self.assertIsInstance(res["nobleStars"], list)

        if res["nobleStars"]:
            item = res["nobleStars"][0]
            self.assertIn("name", item)
            self.assertIn("value", item)
            self.assertIn("desc", item)

    def test_empty_input_handling(self):
        # Should not crash with None or empty
        res1 = GodsAndShaService.get_yearly_sha(None)
        res2 = GodsAndShaService.get_noble_stars("")
        self.assertNotIn("error", res1)
        self.assertNotIn("error", res2)
