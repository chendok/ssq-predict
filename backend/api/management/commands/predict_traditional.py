import json

from django.core.management.base import BaseCommand

from api.algorithms import TraditionalPredictor


class Command(BaseCommand):
    help = "Run Traditional Numerology Prediction"

    def add_arguments(self, parser):
        parser.add_argument("--method", type=str, default="meihua", help="meihua | qimen | liuyao")
        parser.add_argument("--ganzhi", type=str, required=True, help="GanZhi string (e.g. 丙午年 庚寅月 甲子日)")
        parser.add_argument("--count", type=int, default=1, help="Number of predictions")

    def handle(self, *args, **options):
        method = options["method"]
        ganzhi = options["ganzhi"]
        count = options["count"]

        predictor = TraditionalPredictor()
        result = predictor.predict(method, ganzhi, count)

        self.stdout.write(json.dumps(result, indent=2, ensure_ascii=False))
