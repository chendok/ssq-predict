import logging

from django.db import transaction
from django.utils import timezone

from api.algorithms import TraditionalPredictor
from api.models import PredictionHistory

logger = logging.getLogger(__name__)


class TraditionalService:
    @staticmethod
    def predict(methods, ganzhi, count, user=None):
        # 1. Input Validation - only accept list of methods
        valid_methods = ["meihua", "qimen", "liuyao", "heluo", "timespace", "bazi"]

        if not isinstance(methods, list):
            methods = [methods]

        for m in methods:
            if m not in valid_methods:
                return {"error": f"Invalid method: {m}. Must be one of {', '.join(valid_methods)}."}

        if not isinstance(count, int) or count < 1 or count > 100:
            return {"error": "Count must be an integer between 1 and 100."}

        predictor = TraditionalPredictor()

        # 2. Prediction (Computationally intensive, keep outside transaction)
        try:
            result = predictor.predict(methods, ganzhi, count)
        except Exception as e:
            logger.error(f"Prediction algorithm failed: {str(e)}", exc_info=True)
            return {"error": "Internal prediction error"}

        if isinstance(result, dict) and "error" in result:
            logger.warning(f"Prediction logic returned error: {result['error']}")
            return result

        # 3. Persistence (Transaction safe)
        if user and user.is_authenticated:
            try:
                with transaction.atomic():
                    algos = [f"traditional_{m}" for m in methods]

                    if count == 1:
                        if "numbers" in result:
                            PredictionHistory.objects.create(
                                user=user,
                                predicted_numbers=result["numbers"],
                                algorithms_used=algos,
                                confidence_score=None,
                            )
                    else:
                        history_entries = []
                        for res in result:
                            if "numbers" in res:
                                history_entries.append(
                                    PredictionHistory(
                                        user=user,
                                        predicted_numbers=res["numbers"],
                                        algorithms_used=algos,
                                        confidence_score=None,
                                    )
                                )
                        if history_entries:
                            PredictionHistory.objects.bulk_create(history_entries)

            except Exception as e:
                logger.error(f"Failed to save prediction history: {str(e)}", exc_info=True)

        # Add created_at for frontend
        if isinstance(result, dict):
            result["created_at"] = timezone.now().isoformat()
        elif isinstance(result, list):
            # For multiple results, we might not be able to attach it easily to the list root
            # But the frontend usually handles single result for dashboard
            pass

        return result
