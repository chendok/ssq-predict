from django.db import transaction

from api.algorithms import PredictionEngine
from api.models import LotteryResult, PredictionHistory


class PredictionService:
    @staticmethod
    @transaction.atomic
    def predict(algorithms, user=None):
        # Fetch historical data (e.g., last 1000 issues)
        history = LotteryResult.objects.all().order_by("-issue_number")[:1000]
        historical_data = [{"red": item.red_balls, "blue": item.blue_ball} for item in history]

        # Initialize engine with data
        engine = PredictionEngine(historical_data=historical_data)

        # Run prediction
        prediction = engine.predict(algorithms)

        # Add overall confidence score if not present (simple average)
        if "confidence" not in prediction:
            scores = []
            if "xgboost" in prediction:
                scores.append(0.85)
            if "neural" in prediction:
                scores.append(0.80)
            if "markov" in prediction:
                scores.append(0.75)
            if "random" in prediction:
                scores.append(0.50)
            prediction["confidence"] = sum(scores) / len(scores) if scores else 0.5

        # Save history if user is authenticated
        if user and user.is_authenticated:
            PredictionHistory.objects.create(
                user=user,
                predicted_numbers=prediction,
                algorithms_used=algorithms,
                confidence_score=prediction["confidence"],
            )

        return prediction
