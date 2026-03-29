import logging
import random
import re
from collections import Counter
from datetime import datetime

from lunar_python import Solar

# Configuration and Constants
GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
GAN_MAP = {g: i + 1 for i, g in enumerate(GAN)}
ZHI_MAP = {z: i + 1 for i, z in enumerate(ZHI)}

# Five Elements: Metal, Wood, Water, Fire, Earth
# Bagua to Five Elements
# Qian(1, Metal), Dui(2, Metal), Li(3, Fire), Zhen(4, Wood), Xun(5, Wood), Kan(6, Water), Gen(7, Earth), Kun(8, Earth)
BAGUA_ELEMENTS = {1: "Metal", 2: "Metal", 3: "Fire", 4: "Wood", 5: "Wood", 6: "Water", 7: "Earth", 8: "Earth"}

# Number to Element Mapping (1-33)
NUMBER_ELEMENT_MAP = {
    "Water": [1, 6, 11, 16, 21, 26, 31],
    "Fire": [2, 7, 12, 17, 22, 27, 32],
    "Wood": [3, 8, 13, 18, 23, 28, 33],
    "Metal": [4, 9, 14, 19, 24, 29],
    "Earth": [5, 10, 15, 20, 25, 30],
}

# Logger
logger = logging.getLogger(__name__)


class TimeParser:
    @staticmethod
    def parse(date_str=None):
        """
        Parses date string (YYYY-MM-DD HH:MM:SS) or manual GanZhi string.
        If date_str is standard date format, converts to GanZhi using lunar-python.
        If date_str contains GanZhi chars, parses manually.
        Default to current time if None.
        """
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Check if it looks like GanZhi (contains Chinese chars)
        if any(c in "甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥" for c in date_str):
            return TimeParser._parse_ganzhi(date_str)
        else:
            return TimeParser._parse_date(date_str)

    @staticmethod
    def _parse_date(date_str):
        try:
            # Try parsing with time
            dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                # Try parsing date only, default to 12:00:00
                temp_dt = datetime.strptime(date_str, "%Y-%m-%d")
                dt = temp_dt.replace(hour=12, minute=0, second=0)
            except ValueError:
                logger.error(f"Date parse failed for input: {date_str}")
                raise ValueError(f"Invalid date format: '{date_str}'. Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS")

        # Validate date range for safety (1900-2100 is reasonable for this context)
        if not (1900 <= dt.year <= 2100):
            raise ValueError(f"Date out of supported range (1900-2100): {dt.year}")

        try:
            solar = Solar.fromYmdHms(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)
            lunar = solar.getLunar()

            # Lunar Python returns GanZhi string like "甲子"
            year_gz = lunar.getYearInGanZhi()
            month_gz = lunar.getMonthInGanZhi()
            day_gz = lunar.getDayInGanZhi()
            time_gz = lunar.getTimeInGanZhi()

            ganzhi_str = f"{year_gz}年 {month_gz}月 {day_gz}日 {time_gz}时"

            return {
                "yearGan": GAN_MAP[year_gz[0]],
                "yearZhi": ZHI_MAP[year_gz[1]],
                "monthGan": GAN_MAP[month_gz[0]],
                "monthZhi": ZHI_MAP[month_gz[1]],
                "dayGan": GAN_MAP[day_gz[0]],
                "dayZhi": ZHI_MAP[day_gz[1]],
                "timeGan": GAN_MAP[time_gz[0]],
                "timeZhi": ZHI_MAP[time_gz[1]],
                "ganzhi_str": ganzhi_str,
                "raw": {"year": year_gz, "month": month_gz, "day": day_gz, "time": time_gz},
            }
        except Exception as e:
            logger.error(f"Lunar conversion failed: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to convert date to Lunar calendar: {str(e)}")

    @staticmethod
    def _parse_ganzhi(ganzhi_str):
        # Simple regex to extract pairs
        matches = re.findall(r"([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])", ganzhi_str)
        if len(matches) < 3:
            logger.warning(f"Insufficient GanZhi pairs found in: {ganzhi_str}")
            raise ValueError("Invalid Ganzhi format. Expected at least Year, Month, Day (e.g. '甲子年 乙丑月 丙寅日').")

        try:
            # Default time if missing (use Rat hour as start of day)
            time_pair = matches[3] if len(matches) > 3 else ("甲", "子")

            return {
                "yearGan": GAN_MAP[matches[0][0]],
                "yearZhi": ZHI_MAP[matches[0][1]],
                "monthGan": GAN_MAP[matches[1][0]],
                "monthZhi": ZHI_MAP[matches[1][1]],
                "dayGan": GAN_MAP[matches[2][0]],
                "dayZhi": ZHI_MAP[matches[2][1]],
                "timeGan": GAN_MAP[time_pair[0]],
                "timeZhi": ZHI_MAP[time_pair[1]],
                "ganzhi_str": ganzhi_str,
                "raw": {
                    "year": "".join(matches[0]),
                    "month": "".join(matches[1]),
                    "day": "".join(matches[2]),
                    "time": "".join(time_pair),
                },
            }
        except KeyError as e:
            logger.error(f"Invalid GanZhi character mapping: {e}")
            raise ValueError(f"Invalid GanZhi character: {e}")
        except Exception as e:
            logger.error(f"GanZhi parsing error: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to parse GanZhi string: {str(e)}")


class MeihuaEngine:
    def process(self, time_obj):
        y_zhi = time_obj["yearZhi"]
        m_zhi = time_obj["monthZhi"]
        d_zhi = time_obj["dayZhi"]
        t_zhi = time_obj.get("timeZhi", 1)  # Default to Zi hour if missing

        # Upper: (Year + Month + Day) % 8
        sum_upper = y_zhi + m_zhi + d_zhi
        upper = sum_upper % 8
        if upper == 0:
            upper = 8

        # Lower: (Year + Month + Day + Time) % 8
        sum_lower = sum_upper + t_zhi
        lower = sum_lower % 8
        if lower == 0:
            lower = 8

        # Moving Yao: Lower Sum % 6
        moving = sum_lower % 6
        if moving == 0:
            moving = 6

        return {
            "type": "Meihua",
            "upper": upper,
            "lower": lower,
            "moving_line": moving,
            "wang_palace": upper if moving > 3 else lower,
        }


class QimenEngine:
    def process(self, time_obj):
        # Simplified Day Qimen
        # 1. Determine Ju (Yang/Yin).
        month_zhi = time_obj["monthZhi"]
        is_yang = 1 <= month_zhi <= 6

        # 2. Determine Ju Number.
        day_sum = time_obj["dayGan"] + time_obj["dayZhi"]
        ju_num = day_sum % 9
        if ju_num == 0:
            ju_num = 9

        # 3. Determine Leader (Zhi Fu)
        palace_idx = (ju_num + time_obj["dayGan"]) % 9
        if palace_idx == 0:
            palace_idx = 9

        # Map Palace 1-9 to Element
        palace_elements = {
            1: "Water",
            2: "Earth",
            3: "Wood",
            4: "Wood",
            5: "Earth",
            6: "Metal",
            7: "Metal",
            8: "Earth",
            9: "Fire",
        }

        return {
            "type": "Qimen",
            "ju": f"{'Yang' if is_yang else 'Yin'} {ju_num}",
            "zhifu_star": f"Star-{palace_idx}",
            "zhifu_palace": palace_idx,
            "wang_element": palace_elements[palace_idx],
        }


class LiuyaoEngine:
    def process(self, time_obj):
        seed = (
            time_obj["yearGan"]
            + time_obj["yearZhi"]
            + time_obj.get("monthGan", 0)
            + time_obj["monthZhi"]
            + time_obj["dayGan"]
            + time_obj["dayZhi"]
            + time_obj.get("timeZhi", 0)
        )

        random.seed(seed)
        lines = [random.choice([0, 1, 2, 3]) for _ in range(6)]

        def get_trigram(l1, l2, l3):
            # 0=Yin(8), 1=Yang(7), 2=Moving Yin(6->7), 3=Moving Yang(9->8)
            # Standard Trigram: Bottom line is bit 0, Middle bit 1, Top bit 2
            # Yang (1,3) -> 1, Yin (0,2) -> 0
            val = (1 if l1 in [1, 3] else 0) + (2 if l2 in [1, 3] else 0) + (4 if l3 in [1, 3] else 0)
            # Map binary value to Gua Num (Fuxi order or King Wen? Using standard binary map here)
            # 111(7)->Qian(1), 011(3)->Dui(2), 101(5)->Li(3), 001(1)->Zhen(4)
            # 110(6)->Xun(5), 010(2)->Kan(6), 100(4)->Gen(7), 000(0)->Kun(8)
            map_val = {7: 1, 3: 2, 5: 3, 1: 4, 6: 5, 2: 6, 4: 7, 0: 8}
            return map_val[val]

        lower = get_trigram(lines[0], lines[1], lines[2])
        upper = get_trigram(lines[3], lines[4], lines[5])

        moving_idx = next((i + 1 for i, x in enumerate(lines) if x in [2, 3]), 1)

        wang_palace = upper if moving_idx > 3 else lower

        return {
            "type": "Liuyao",
            "upper": upper,
            "lower": lower,
            "moving_line": moving_idx,
            "wang_palace": wang_palace,
            "lines": lines,
        }


class HeluoEngine:
    def process(self, time_obj):
        # 1. Calculate Heavenly and Earthly Numbers from GanZhi
        gan_vals = {1: 6, 2: 2, 3: 8, 4: 7, 5: 10, 6: 5, 7: 9, 8: 4, 9: 1, 10: 3}
        zhi_vals = {1: 1, 2: 5, 3: 3, 4: 8, 5: 5, 6: 2, 7: 7, 8: 5, 9: 4, 10: 9, 11: 5, 12: 6}

        heaven_sum = 0  # Odd
        earth_sum = 0  # Even

        def add(v):
            nonlocal heaven_sum, earth_sum
            if v % 2 != 0:
                heaven_sum += v
            else:
                earth_sum += v

        for g in [time_obj["yearGan"], time_obj["monthGan"], time_obj["dayGan"], time_obj["timeGan"]]:
            add(gan_vals.get(g, 0))
        for z in [time_obj["yearZhi"], time_obj["monthZhi"], time_obj["dayZhi"], time_obj["timeZhi"]]:
            add(zhi_vals.get(z, 0))

        # 2. Map to Trigrams
        h_rem = heaven_sum % 25
        if h_rem == 0:
            h_rem = 25
        e_rem = earth_sum % 30
        if e_rem == 0:
            e_rem = 30

        def get_gua(n):
            base = n % 10
            if base in [1, 6]:
                return 6  # Kan (Water)
            if base in [2, 7]:
                return 3  # Li (Fire)
            if base in [3, 8]:
                return 4  # Zhen (Wood)
            if base in [4, 9]:
                return 1  # Qian (Metal)
            return 8  # Kun (Earth)

        upper = get_gua(heaven_sum)
        lower = get_gua(earth_sum)

        return {
            "type": "Heluo",
            "upper": upper,
            "lower": lower,
            "heaven_sum": heaven_sum,
            "earth_sum": earth_sum,
            "wang_palace": upper,
        }


class TimeSpaceEngine:
    def process(self, time_obj):
        # Simulate Space using hash of ganzhi + simple deterministic logic
        s = time_obj["ganzhi_str"]
        hash_val = 0
        for char in s:
            hash_val = (hash_val << 5) - hash_val + ord(char)
        space_num = abs(hash_val) % 100

        # Upper = (Year+Month+Day+Space) % 8
        raw_upper = time_obj["yearZhi"] + time_obj["monthZhi"] + time_obj["dayZhi"] + space_num
        upper = raw_upper % 8
        if upper == 0:
            upper = 8

        # Lower = (Hour+Minute+Space) % 8 -> using timeZhi + random part
        # Simulating minute via hash
        minute_sim = space_num % 12
        raw_lower = time_obj["timeZhi"] + minute_sim
        lower = raw_lower % 8
        if lower == 0:
            lower = 8

        # Moving = Sum % 6
        moving = (raw_upper + raw_lower) % 6
        if moving == 0:
            moving = 6

        return {
            "type": "TimeSpace",
            "upper": upper,
            "lower": lower,
            "moving_line": moving,
            "wang_palace": upper if moving > 3 else lower,
        }


class BaziEngine:
    def process(self, time_obj):
        day_gan = time_obj["dayGan"]
        month_zhi = time_obj["monthZhi"]

        # 1. Determine Day Master Element
        # 1-2 Wood, 3-4 Fire, 5-6 Earth, 7-8 Metal, 9-10 Water
        elements_map = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"]
        dm_el = elements_map[day_gan - 1]

        # 2. Determine Season Element (Month Zhi)
        # In/Mao=Wood, Si/Wu=Fire, Shen/You=Metal, Hai/Zi=Water, Others=Earth
        if month_zhi in [3, 4]:
            season_el = "Wood"
        elif month_zhi in [6, 7]:
            season_el = "Fire"
        elif month_zhi in [9, 10]:
            season_el = "Metal"
        elif month_zhi in [12, 1]:
            season_el = "Water"
        else:
            season_el = "Earth"

        # 3. Simple Strength Check
        is_strong = dm_el == season_el

        # 4. Determine Useful Element
        elements = ["Wood", "Fire", "Earth", "Metal", "Water"]
        dm_idx = elements.index(dm_el)

        if is_strong:
            # Controller (Official)
            useful_el = elements[(dm_idx + 3) % 5]
        else:
            # Mother (Resource)
            useful_el = elements[(dm_idx + 4) % 5]

        # 5. Map Useful Element to Gua
        el_gua_map = {"Metal": 1, "Wood": 4, "Water": 6, "Fire": 3, "Earth": 8}
        gua = el_gua_map.get(useful_el, 1)

        return {"type": "Bazi", "upper": gua, "lower": (gua % 8) + 1, "wang_element": useful_el, "wang_palace": gua}


class Selector:
    def __init__(self, wang_element):
        self.wang_element = wang_element
        self.producing = {"Wood": "Fire", "Fire": "Earth", "Earth": "Metal", "Metal": "Water", "Water": "Wood"}
        self.mother = {v: k for k, v in self.producing.items()}

    def get_pool(self):
        pool = list(NUMBER_ELEMENT_MAP[self.wang_element])
        mother = self.mother[self.wang_element]
        pool.extend(NUMBER_ELEMENT_MAP[mother])
        return sorted(list(set(pool)))

    def select_red(self):
        pool = self.get_pool()
        if len(pool) < 6:
            all_nums = list(range(1, 34))
            return sorted(random.sample(all_nums, 6))
        return sorted(random.sample(pool, 6))

    def select_blue(self, engine_res):
        etype = engine_res["type"]
        val = 1
        if etype in ["Meihua", "Liuyao", "TimeSpace"]:
            m = engine_res["moving_line"]
            raw = m + 10
            val = (raw - 1) % 16 + 1
        elif etype == "Qimen":
            z = engine_res["zhifu_palace"]
            val = (z % 16) + 1
        elif etype == "Heluo":
            val = (engine_res["heaven_sum"] + engine_res["earth_sum"]) % 16 + 1
        elif etype == "Bazi":
            map_el = {"Metal": 1, "Wood": 4, "Water": 6, "Fire": 3, "Earth": 8}
            val = map_el.get(engine_res["wang_element"], 1)
            val = (val + 5) % 16 + 1

        return val


class Balancer:
    def __init__(self):
        self.max_retries = 1000
        self.logs = []

    def check(self, reds, level=0):
        # 5.1 Odd/Even
        odds = sum(1 for x in reds if x % 2 != 0)
        evens = 6 - odds
        ratio_oe = (odds, evens)
        valid_oe = ratio_oe in [(3, 3), (4, 2), (2, 4)]
        if level >= 2:
            valid_oe = True

        # 5.2 Big/Small (1-16 Small, 17-33 Big)
        smalls = sum(1 for x in reds if x <= 16)
        bigs = 6 - smalls
        ratio_bs = (smalls, bigs)
        valid_bs = ratio_bs in [(3, 3), (4, 2), (2, 4)]
        if level >= 3:
            valid_bs = True

        # 5.3 Five Elements Coverage
        elements = set()
        for r in reds:
            for e, nums in NUMBER_ELEMENT_MAP.items():
                if r in nums:
                    elements.add(e)
                    break
        cnt = len(elements)
        valid_elem = 2 <= cnt <= 3
        if level >= 1:
            valid_elem = True

        return valid_oe and valid_bs and valid_elem


class TraditionalPredictor:
    def predict(self, methods, date_input=None, count=1):
        """
        methods: List of strings (e.g. ["meihua", "heluo"])
        date_input: Can be a YYYY-MM-DD HH:MM:SS string OR a GanZhi string.
        """
        try:
            import hashlib

            from django.core.cache import cache

            # Ensure methods is always a list
            if not isinstance(methods, list):
                methods = [methods]

            # Stable cache key
            method_str = ",".join(sorted(methods))
            cache_key_raw = f"trad_pred_{method_str}_{date_input}_{count}"
            cache_key = "tp_" + hashlib.md5(cache_key_raw.encode()).hexdigest()

            cached_res = cache.get(cache_key)
            if cached_res:
                return cached_res

            parser = TimeParser()
            try:
                time_obj = parser.parse(date_input)
            except Exception as e:
                logger.error(f"Prediction failed at TimeParsing: {str(e)}")
                return {"error": str(e)}

            final_results = []

            # For each count (prediction round)
            for _ in range(count):
                round_predictions = []

                # Run each method
                for method in methods:
                    try:
                        if method == "meihua":
                            engine = MeihuaEngine()
                        elif method == "qimen":
                            engine = QimenEngine()
                        elif method == "liuyao":
                            engine = LiuyaoEngine()
                        elif method == "heluo":
                            engine = HeluoEngine()
                        elif method == "timespace":
                            engine = TimeSpaceEngine()
                        elif method == "bazi":
                            engine = BaziEngine()
                        else:
                            logger.warning(f"Unknown method skipped: {method}")
                            continue

                        eng_res = engine.process(time_obj)

                        # Determine Wang Element
                        wang_el = "Metal"
                        if "wang_element" in eng_res:
                            wang_el = eng_res["wang_element"]
                        elif "wang_palace" in eng_res:
                            wang_el = BAGUA_ELEMENTS.get(eng_res["wang_palace"], "Metal")

                        selector = Selector(wang_el)
                        balancer = Balancer()

                        reds = []
                        blue = 0
                        tries = 0
                        level = 0

                        while tries < 200:
                            reds = selector.select_red()
                            if balancer.check(reds, level):
                                break
                            tries += 1
                            if tries > 150:
                                level = 3
                            elif tries > 100:
                                level = 2
                            elif tries > 50:
                                level = 1

                        blue = selector.select_blue(eng_res)

                        # Stats
                        odds = sum(1 for x in reds if x % 2 != 0)
                        smalls = sum(1 for x in reds if x <= 16)
                        elem_dist = Counter()
                        for r in reds:
                            for e, nums in NUMBER_ELEMENT_MAP.items():
                                if r in nums:
                                    elem_dist[e] += 1

                        # Fetch I-Ching details if applicable
                        iching_details = self._get_iching_details(eng_res)

                        round_predictions.append(
                            {
                                "method": method,
                                "numbers": {"red": reds, "blue": blue},
                                "metadata": {
                                    "ganzhi": time_obj["ganzhi_str"],
                                    "wang_element": wang_el,
                                    "engine_raw": eng_res,
                                    "retries": tries,
                                    "level": level,
                                    "stats": {
                                        "odd_even": f"{odds}:{6 - odds}",
                                        "big_small": f"{smalls}:{6 - smalls}",
                                        "five_elements": dict(elem_dist),
                                    },
                                    "iching": iching_details,
                                },
                            }
                        )

                    except Exception as e:
                        logger.error(f"Method {method} failed: {e}", exc_info=True)
                        continue

                if not round_predictions:
                    continue

                # Always use combination logic - aggregate results from all methods
                all_reds = []
                all_blues = []
                for p in round_predictions:
                    all_reds.extend(p["numbers"]["red"])
                    all_blues.append(p["numbers"]["blue"])

                # Top 6 frequent reds
                red_counts = Counter(all_reds).most_common()
                final_reds = sorted([n for n, c in red_counts[:6]])
                if len(final_reds) < 6:
                    # Fill rest
                    needed = 6 - len(final_reds)
                    existing = set(final_reds)
                    pool = [x for x in range(1, 34) if x not in existing]
                    final_reds.extend(random.sample(pool, needed))
                    final_reds.sort()

                # Most frequent blue
                final_blue = Counter(all_blues).most_common(1)[0][0]

                final_results.append({"numbers": {"red": final_reds, "blue": final_blue}, "details": round_predictions})

            if not final_results:
                return {"error": "All prediction methods failed. Please try again with different parameters."}

            result = final_results if count > 1 else final_results[0]
            cache.set(cache_key, result, 600)  # Cache for 10 mins
            return result

        except Exception as e:
            logger.critical(f"Unexpected critical error in TraditionalPredictor: {str(e)}", exc_info=True)
            return {"error": "An unexpected system error occurred during prediction."}

    def _get_iching_details(self, eng_res):
        """
        Fetch Hexagram and Line text from Database based on engine result.
        """
        try:
            upper = eng_res.get("upper")
            lower = eng_res.get("lower")
            moving = eng_res.get("moving_line")

            if not upper or not lower:
                return None

            return {
                "upper_gua": upper,
                "lower_gua": lower,
                "moving_line": moving,
                "hexagram_id": f"{upper}-{lower}",
            }
        except Exception as e:
            logger.warning(f"Failed to fetch I-Ching details: {e}")
            return None
