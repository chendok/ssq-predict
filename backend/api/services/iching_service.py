import logging

from django.core.cache import cache

from api.models import Hexagram, Interpretation, Line

logger = logging.getLogger(__name__)


class IChingService:
    HEXAGRAM_CACHE_TIMEOUT = 3600  # 1 hour
    INTERPRETATION_CACHE_TIMEOUT = 1800  # 30 minutes

    @staticmethod
    def get_hexagram_info(name):
        cache_key = f"hexagram_{name}"
        data = cache.get(cache_key)

        if data:
            return data

        try:
            hexagram = Hexagram.objects.prefetch_related("lines").get(name=name)
            lines_data = []
            for line in hexagram.lines.all():
                lines_data.append(
                    {
                        "position": line.position,
                        "original_text": line.original_text,
                        "translation": line.translation,
                        "xiao_xiang": line.xiao_xiang,
                        "nature": line.get_nature_display(),
                        "auspiciousness": line.get_auspiciousness_display(),
                    }
                )

            data = {
                "name": hexagram.name,
                "sequence": hexagram.sequence,
                "original_text": hexagram.original_text,
                "translation": hexagram.translation,
                "xiang_chuan": hexagram.xiang_chuan,
                "tuan_chuan": hexagram.tuan_chuan,
                "lines": lines_data,
            }
            cache.set(cache_key, data, IChingService.HEXAGRAM_CACHE_TIMEOUT)
            return data
        except Hexagram.DoesNotExist:
            return None

    @staticmethod
    def get_line_info(hexagram_name, position):
        cache_key = f"hexagram_{hexagram_name}_line_{position}"
        data = cache.get(cache_key)

        if data:
            return data

        try:
            line = Line.objects.select_related("hexagram").get(hexagram__name=hexagram_name, position=position)
            data = {
                "hexagram": line.hexagram.name,
                "position": line.position,
                "original_text": line.original_text,
                "translation": line.translation,
                "xiao_xiang": line.xiao_xiang,
                "nature": line.get_nature_display(),
                "auspiciousness": line.get_auspiciousness_display(),
            }
            cache.set(cache_key, data, IChingService.HEXAGRAM_CACHE_TIMEOUT)  # Cache line info same as hexagram
            return data
        except Line.DoesNotExist:
            return None

    @staticmethod
    def divination(topic, hexagram_name, moving_lines=[]):
        """
        Get interpretation based on topic and moving lines.
        """
        # Validate inputs
        if not hexagram_name:
            return {"error": "Hexagram name is required"}

        try:
            hexagram = Hexagram.objects.get(name=hexagram_name)
        except Hexagram.DoesNotExist:
            return {"error": "Hexagram not found"}

        # Determine which interpretation to fetch
        # Logic:
        # 0 moving lines: Hexagram interpretation
        # 1 moving line: That Line's interpretation
        # >1 moving lines: For this specific requirement "Pan Ci", we will aggregate or prioritize.
        # Given 1.3 "每主题每卦", let's prioritize the Hexagram interpretation but attach Line details if relevant.
        # OR, strictly follow traditional rules.
        # Let's try to find specific line interpretation first if only 1 moving line.

        target_line_pos = None
        if len(moving_lines) == 1:
            target_line_pos = moving_lines[0]

        # Cache Key for Interpretation
        cache_key = f"interpretation_{hexagram.id}_{target_line_pos}_{topic}"
        result = cache.get(cache_key)

        if result:
            return result

        # Fetch from DB
        try:
            if target_line_pos:
                # Try to find Line interpretation
                interp = Interpretation.objects.filter(
                    hexagram=hexagram, line__position=target_line_pos, topic=topic
                ).first()

                # Fallback to Hexagram interpretation if Line specific not found
                if not interp:
                    interp = Interpretation.objects.filter(hexagram=hexagram, line__isnull=True, topic=topic).first()
            else:
                # Hexagram interpretation
                interp = Interpretation.objects.filter(hexagram=hexagram, line__isnull=True, topic=topic).first()

            if not interp:
                # Fallback generic message
                result = {
                    "hexagram": hexagram.name,
                    "topic": topic,
                    "content": "暂无详细判词，请参考卦辞。",
                    "suggestions": [],
                }
            else:
                result = {
                    "hexagram": hexagram.name,
                    "line": target_line_pos,
                    "topic": interp.get_topic_display(),
                    "content": interp.content,
                    "suggestions": interp.suggestions,
                }

            cache.set(cache_key, result, IChingService.INTERPRETATION_CACHE_TIMEOUT)
            return result

        except Exception as e:
            logger.error(f"Divination error: {e}")
            return {"error": "Internal error during divination"}
