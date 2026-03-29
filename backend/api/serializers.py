from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Hexagram, Interpretation, Line, LotteryResult, NumberStatistics, PredictionHistory


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "password", "email"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"], email=validated_data["email"], password=validated_data["password"]
        )
        return user


class LotteryResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LotteryResult
        fields = "__all__"


class PredictionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionHistory
        fields = "__all__"


class NumberStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NumberStatistics
        fields = "__all__"


# --- I-Ching Serializers ---


class LineSerializer(serializers.ModelSerializer):
    nature = serializers.CharField(source="get_nature_display")
    auspiciousness = serializers.CharField(source="get_auspiciousness_display")

    class Meta:
        model = Line
        fields = ["position", "original_text", "translation", "xiao_xiang", "nature", "auspiciousness"]


class HexagramSerializer(serializers.ModelSerializer):
    lines = LineSerializer(many=True, read_only=True)

    class Meta:
        model = Hexagram
        fields = ["name", "sequence", "original_text", "translation", "xiang_chuan", "tuan_chuan", "lines"]


class InterpretationSerializer(serializers.ModelSerializer):
    topic = serializers.CharField(source="get_topic_display")

    class Meta:
        model = Interpretation
        fields = ["topic", "content", "suggestions"]
