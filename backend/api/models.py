from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import gettext_lazy as _


class LotteryResult(models.Model):
    issue_number = models.CharField(max_length=20, unique=True)
    draw_date = models.DateField()
    red_balls = models.JSONField()  # Store as a list of integers
    blue_ball = models.IntegerField()
    prize_pool = models.BigIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-draw_date"]

    def __str__(self):
        return f"Issue {self.issue_number} ({self.draw_date})"


class PredictionHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="predictions", null=True, blank=True)
    predicted_numbers = models.JSONField()  # {'red': [], 'blue': []}
    algorithms_used = models.JSONField()  # List of algorithm names
    confidence_score = models.FloatField(null=True, blank=True)
    actual_result = models.JSONField(null=True, blank=True)
    is_accurate = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Prediction by {self.user} at {self.created_at}"


class NumberStatistics(models.Model):
    BALL_TYPES = (
        ("red", "Red"),
        ("blue", "Blue"),
    )
    ball_number = models.IntegerField()
    ball_type = models.CharField(max_length=10, choices=BALL_TYPES)
    frequency = models.IntegerField(default=0)
    omission_count = models.IntegerField(default=0)
    is_hot = models.BooleanField(default=False)
    statistics_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-statistics_date", "ball_type", "ball_number"]

    def __str__(self):
        return f"{self.ball_type} {self.ball_number} - Freq: {self.frequency}"


# --- I-Ching (Zhou Yi) Models ---


class Hexagram(models.Model):
    name = models.CharField(max_length=20, unique=True, verbose_name=_("Hexagram Name"))
    sequence = models.PositiveIntegerField(unique=True, verbose_name=_("Sequence"))
    original_text = models.TextField(verbose_name=_("Original Text"))  # 卦辞原文
    translation = models.TextField(verbose_name=_("Translation"))  # 白话译文
    xiang_chuan = models.TextField(verbose_name=_("Xiang Chuan"))  # 象传
    tuan_chuan = models.TextField(verbose_name=_("Tuan Chuan"))  # 彖传

    class Meta:
        ordering = ["sequence"]
        verbose_name = _("Hexagram")
        verbose_name_plural = _("Hexagrams")

    def __str__(self):
        return f"{self.sequence}. {self.name}"


class Line(models.Model):
    AUSPICIOUSNESS_CHOICES = (
        ("great_fortune", _("Great Fortune")),
        ("fortune", _("Fortune")),
        ("average", _("Average")),
        ("misfortune", _("Misfortune")),
        ("great_misfortune", _("Great Misfortune")),
    )

    hexagram = models.ForeignKey(Hexagram, on_delete=models.CASCADE, related_name="lines")
    position = models.PositiveSmallIntegerField(verbose_name=_("Position"))  # 1-6
    original_text = models.TextField(verbose_name=_("Original Text"))  # 爻辞原文
    translation = models.TextField(verbose_name=_("Translation"))  # 爻辞译文
    xiao_xiang = models.TextField(verbose_name=_("Xiao Xiang"))  # 小象传
    nature = models.PositiveSmallIntegerField(
        choices=((0, _("Yin")), (1, _("Yang"))), verbose_name=_("Nature")
    )  # 0: Yin, 1: Yang
    auspiciousness = models.CharField(max_length=20, choices=AUSPICIOUSNESS_CHOICES, verbose_name=_("Auspiciousness"))

    class Meta:
        ordering = ["hexagram", "position"]
        unique_together = ("hexagram", "position")
        verbose_name = _("Line")
        verbose_name_plural = _("Lines")

    def __str__(self):
        return f"{self.hexagram.name} - Line {self.position}"


class Interpretation(models.Model):
    TOPIC_CHOICES = (
        ("career", _("Career")),
        ("wealth", _("Wealth")),
        ("emotion", _("Emotion")),
        ("health", _("Health")),
        ("litigation", _("Litigation")),
        ("travel", _("Travel")),
        ("exam", _("Exam")),
    )

    hexagram = models.ForeignKey(Hexagram, on_delete=models.CASCADE, related_name="interpretations")
    line = models.ForeignKey(Line, on_delete=models.CASCADE, null=True, blank=True, related_name="interpretations")
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES, verbose_name=_("Topic"))
    content = models.TextField(verbose_name=_("Content"))
    suggestions = models.JSONField(default=list, verbose_name=_("Suggestions"))  # List of strings

    class Meta:
        ordering = ["hexagram", "line", "topic"]
        # If interpretation is for a line, hexagram+line+topic must be unique
        # If for hexagram (line=null), hexagram+topic must be unique.
        # Django's unique_together doesn't handle NULL well in some DBs for uniqueness constraints the way we want
        # (multiple NULLs allowed usually), but for logic, we treat (hexagram, topic, line) as unique key.
        indexes = [
            models.Index(fields=["hexagram", "topic"]),
            models.Index(fields=["line", "topic"]),
        ]
        verbose_name = _("Interpretation")
        verbose_name_plural = _("Interpretations")

    def __str__(self):
        target = f"Line {self.line.position}" if self.line else "Hexagram"
        return f"{self.hexagram.name} ({target}) - {self.get_topic_display()}"
