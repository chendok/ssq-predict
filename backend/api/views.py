import asyncio
from io import StringIO

from django.contrib.auth.models import User
from django.core.management import call_command
from rest_framework import generics, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LotteryResult, PredictionHistory
from .serializers import LotteryResultSerializer, PredictionHistorySerializer, RegisterSerializer, UserSerializer
from .services.ai_service import ai_service
from .services.gods_and_sha_service import GodsAndShaService
from .services.iching_service import IChingService
from .services.prediction_service import PredictionService
from .services.statistics_service import StatisticsService
from .services.traditional_service import TraditionalService


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key}, status=status.HTTP_201_CREATED)


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user_id": user.pk, "username": user.username, "email": user.email})


class PredictionHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = PredictionHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user)


class LotteryResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LotteryResult.objects.all()
    serializer_class = LotteryResultSerializer
    filterset_fields = ["issue_number", "draw_date"]


class AIInterpretationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Interpret prediction results using AI.
        Input: {
            "type": "prediction" | "traditional",
            "data": { ... }
        }
        """
        data_type = request.data.get("type")
        raw_data = request.data.get("data")

        if not raw_data:
            return Response({"error": "Data is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Run async AI service in sync view
            if data_type == "prediction":
                result = asyncio.run(ai_service.interpret_prediction(raw_data))
            elif data_type == "traditional":
                result = asyncio.run(ai_service.interpret_traditional(raw_data))
            else:
                return Response({"error": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)

            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PredictionView(APIView):
    def post(self, request):
        algorithms = request.data.get("algorithms", ["random"])
        prediction = PredictionService.predict(algorithms, request.user)
        return Response(prediction)


class TraditionalPredictionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Input: {
            "method": "meihua" | "qimen" | "liuyao",
            "ganzhi": "丙午年 庚寅月 甲子日",
            "count": 1 (optional)
        }
        """
        method = request.data.get("method", "meihua")
        ganzhi = request.data.get("ganzhi")
        count = int(request.data.get("count", 1))

        if not ganzhi:
            return Response({"error": "ganzhi is required"}, status=status.HTTP_400_BAD_REQUEST)

        result = TraditionalService.predict(method, ganzhi, count, request.user)

        if isinstance(result, dict) and "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        return Response(result)


class DivinationGodsAndShaYearlyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        date_str = request.query_params.get("date")
        data = GodsAndShaService.get_yearly_sha(date_str)
        return Response(data)


class DivinationGodsAndShaNobleView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        date_str = request.query_params.get("date")
        data = GodsAndShaService.get_noble_stars(date_str)
        return Response(data)


class StatisticsView(APIView):
    def get(self, request):
        stats = StatisticsService.get_statistics()
        return Response(stats)


# --- I-Ching (Zhou Yi) Views ---


class HexagramDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, name):
        """
        GET /gua/{name}
        """
        data = IChingService.get_hexagram_info(name)
        if not data:
            return Response({"error": "Hexagram not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)


class LineDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, name, position):
        """
        GET /gua/{name}/yao/{position}
        """
        try:
            pos = int(position)
        except ValueError:
            return Response({"error": "Invalid position"}, status=status.HTTP_400_BAD_REQUEST)

        data = IChingService.get_line_info(name, pos)
        if not data:
            return Response({"error": "Line not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)


class DivinationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        POST /divination
        Input: {
            "topic": "career" | "wealth" | ...,
            "hexagram_name": "乾",
            "moving_lines": [1, 2] (optional)
        }
        """
        topic = request.data.get("topic")
        hexagram_name = request.data.get("hexagram_name")
        moving_lines = request.data.get("moving_lines", [])

        if not topic or not hexagram_name:
            return Response({"error": "topic and hexagram_name are required"}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(moving_lines, list):
            return Response({"error": "moving_lines must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        result = IChingService.divination(topic, hexagram_name, moving_lines)
        if "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        return Response(result)


class UpdateLotteryDataView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Trigger lottery data scraping and update.
        """
        try:
            out = StringIO()
            call_command("scrape_ssq", stdout=out)
            output = out.getvalue()

            return Response({"success": True, "message": "数据更新成功", "output": output}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"success": False, "message": f"数据更新失败: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
