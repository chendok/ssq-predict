from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from api.models import Hexagram, Interpretation, Line


class IChingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create dummy data
        self.hexagram = Hexagram.objects.create(
            name="TestGua",
            sequence=100,
            original_text="Orig",
            translation="Trans",
            xiang_chuan="Xiang",
            tuan_chuan="Tuan",
        )
        self.line = Line.objects.create(
            hexagram=self.hexagram,
            position=1,
            original_text="LineOrig",
            translation="LineTrans",
            xiao_xiang="Xiao",
            nature=1,
            auspiciousness="great_fortune",
        )
        self.interpretation = Interpretation.objects.create(
            hexagram=self.hexagram, line=None, topic="career", content="Career Content", suggestions=["Sug1", "Sug2"]
        )

    def test_get_hexagram(self):
        url = reverse("hexagram-detail", args=[self.hexagram.name])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "TestGua")
        self.assertEqual(len(response.data["lines"]), 1)

    def test_get_line(self):
        url = reverse("line-detail", args=[self.hexagram.name, 1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["original_text"], "LineOrig")

    def test_divination_hexagram_only(self):
        url = reverse("divination")
        data = {"topic": "career", "hexagram_name": "TestGua", "moving_lines": []}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["content"], "Career Content")

    def test_divination_with_moving_line_fallback(self):
        # We didn't create line specific interpretation, should fallback to hexagram generic or default
        # Actually in our logic:
        # if target_line_pos: try Line Interp -> if not, try Hexagram Interp (line=null)
        # So it should return "Career Content" (Hexagram level)
        url = reverse("divination")
        data = {"topic": "career", "hexagram_name": "TestGua", "moving_lines": [1]}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["content"], "Career Content")

    def test_divination_missing_params(self):
        url = reverse("divination")
        data = {"topic": "career"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
