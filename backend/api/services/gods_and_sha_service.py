import logging
from datetime import datetime

from lunar_python import Lunar

logger = logging.getLogger(__name__)


class GodsAndShaService:
    @staticmethod
    def get_yearly_sha(date_str=None):
        """
        Calculate yearly sha (流年神煞) - Using Year XiongSha and Day XiongSha
        Returns: { "yearlySha": NobleStarData[], "influenceChart": { name, value }[] }
        """
        try:
            dt = GodsAndShaService._parse_date(date_str)
            lunar = Lunar.fromDate(dt)

            # 1. Get yearly bad stars (Xiong Sha) if available
            year_xiong_sha = []
            if hasattr(lunar, "getYearXiongSha"):
                year_xiong_sha = lunar.getYearXiongSha()

            # 2. Get bad stars (Xiong Sha) for the day
            day_xiong_sha = []
            if hasattr(lunar, "getDayXiongSha"):
                day_xiong_sha = lunar.getDayXiongSha()

            combined_sha = sorted(list(set(year_xiong_sha + day_xiong_sha)))

            sha_list = []
            for name in combined_sha:
                sha_list.append(
                    {
                        "name": name,
                        "value": 40,  # Default negative value
                        "desc": GodsAndShaService._get_desc(name, "凶煞"),
                    }
                )

            eight_char = lunar.getEightChar()
            year_zhi = eight_char.getYearZhi()
            day_zhi = eight_char.getDayZhi()

            if GodsAndShaService._is_tao_hua(year_zhi, day_zhi):
                sha_list.append({"name": "桃花", "value": 80, "desc": "异性缘佳，但也可能招惹是非"})

            if GodsAndShaService._is_yi_ma(year_zhi, day_zhi):
                sha_list.append({"name": "驿马", "value": 70, "desc": "奔波劳碌，变动频繁"})

            ji_pct = 50
            if hasattr(lunar, "getYearJiShen") and hasattr(lunar, "getDayJiShen"):
                ji_shen_count = len(lunar.getYearJiShen()) + len(lunar.getDayJiShen())
                sha_count = len(sha_list)
                total = ji_shen_count + sha_count
                if total > 0:
                    ji_pct = int((ji_shen_count / total) * 100)

            sha_pct = 100 - ji_pct

            influence_chart = [{"name": "吉神强度", "value": ji_pct}, {"name": "凶煞强度", "value": sha_pct}]

            return {"yearlySha": sha_list, "influenceChart": influence_chart}
        except Exception as e:
            logger.error(f"Failed to calculate yearly sha: {str(e)}", exc_info=True)
            return {
                "yearlySha": [],
                "influenceChart": [{"name": "吉神强度", "value": 50}, {"name": "凶煞强度", "value": 50}],
                "error": str(e),
            }

    @staticmethod
    def get_noble_stars(date_str=None):
        """
        Calculate noble stars (贵人) - Using Year JiShen and Day JiShen
        Returns: { "nobleStars": NobleStarData[] }
        """
        try:
            dt = GodsAndShaService._parse_date(date_str)
            lunar = Lunar.fromDate(dt)

            # Combine Year and Day JiShen
            ji_shen_list = []
            if hasattr(lunar, "getYearJiShen"):
                ji_shen_list.extend(lunar.getYearJiShen())
            if hasattr(lunar, "getDayJiShen"):
                ji_shen_list.extend(lunar.getDayJiShen())

            ji_shen_list = sorted(list(set(ji_shen_list)))

            noble_stars = []
            for name in ji_shen_list:
                noble_stars.append(
                    {
                        "name": name,
                        "value": 80,  # Default positive value
                        "desc": GodsAndShaService._get_desc(name, "吉神"),
                    }
                )

            return {"nobleStars": noble_stars}
        except Exception as e:
            logger.error(f"Failed to calculate noble stars: {str(e)}", exc_info=True)
            return {"nobleStars": [], "error": str(e)}

    @staticmethod
    def _parse_date(date_str):
        if not date_str:
            return datetime.now()
        try:
            return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                return datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                return datetime.now()

    @staticmethod
    def _get_desc(name, type_str):
        # Simple description mapping
        descs = {
            "天德": "上天之德，逢凶化吉",
            "月德": "月亮之德，阴阳调和",
            "天恩": "上天恩赐，百事大吉",
            "母仓": "如母爱抚，万物滋生",
            "月恩": "月亮恩惠，利于祈福",
            "四相": "四季辅佐，利于耕作",
            "时德": "时辰之德，所求皆遂",
            "天喜": "天赐喜庆，利于婚嫁",
            "民日": "亲民之日，利于修造",
            "三合": "三方会合，利于合作",
            "临日": "太阳临照，威严凛然",
            "时阴": "时辰之阴，利于安葬",
            "鸣吠": "鸡鸣狗吠，安居乐业",
            "死神": "死亡之神，诸事不宜",
            "月破": "月令冲破，诸事不成",
            "大耗": "大损耗财，不宜开市",
            "五鬼": "五鬼缠身，防备小人",
            "朱雀": "朱雀口舌，防备争执",
            "白虎": "白虎血光，防备灾祸",
            "天狗": "天狗食日，防备损耗",
            "吊客": "吊唁之客，防备丧事",
            "披麻": "披麻戴孝，防备亲忧",
            "灾煞": "灾难之煞，防备意外",
            "劫煞": "劫夺之煞，防备破财",
            "咸池": "桃花泛滥，防备酒色",
            "月厌": "月亮厌弃，不宜婚嫁",
            "地火": "大地之火，不宜栽种",
            "四击": "四方冲击，不宜远行",
            "大煞": "极大凶煞，诸事不宜",
        }
        return descs.get(name, f"{type_str}之一，请谨慎行事" if type_str == "凶煞" else f"{type_str}之一，诸事顺利")

    @staticmethod
    def _is_tao_hua(year_zhi, day_zhi):
        # Check if Day Branch is Tao Hua of Year Branch
        # Shen-Zi-Chen -> You
        if year_zhi in ["申", "子", "辰"] and day_zhi == "酉":
            return True
        # Yin-Wu-Xu -> Mao
        if year_zhi in ["寅", "午", "戌"] and day_zhi == "卯":
            return True
        # Si-You-Chou -> Wu
        if year_zhi in ["巳", "酉", "丑"] and day_zhi == "午":
            return True
        # Hai-Mao-Wei -> Zi
        if year_zhi in ["亥", "卯", "未"] and day_zhi == "子":
            return True
        return False

    @staticmethod
    def _is_yi_ma(year_zhi, day_zhi):
        # Check if Day Branch is Yi Ma of Year Branch
        # Shen-Zi-Chen -> Yin
        if year_zhi in ["申", "子", "辰"] and day_zhi == "寅":
            return True
        # Yin-Wu-Xu -> Shen
        if year_zhi in ["寅", "午", "戌"] and day_zhi == "申":
            return True
        # Si-You-Chou -> Hai
        if year_zhi in ["巳", "酉", "丑"] and day_zhi == "亥":
            return True
        # Hai-Mao-Wei -> Si
        if year_zhi in ["亥", "卯", "未"] and day_zhi == "巳":
            return True
        return False
