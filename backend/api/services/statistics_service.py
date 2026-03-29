from collections import Counter

from api.models import LotteryResult


class StatisticsService:
    @staticmethod
    def get_statistics(limit=100):
        # Fetch data, ordered by date descending (newest first)
        history = LotteryResult.objects.all().order_by("-draw_date")

        if not history.exists():
            return StatisticsService._get_empty_stats()

        # Convert to list for processing
        full_history = list(history)  # Newest first
        recent_history = full_history[:limit]

        # 1. Frequency Analysis (Hot/Cold)
        freq_stats = StatisticsService._calculate_frequency(full_history)

        # 2. Odd/Even Analysis
        odd_even_stats = StatisticsService._calculate_odd_even(recent_history)

        # 3. Big/Small Analysis
        big_small_stats = StatisticsService._calculate_big_small(recent_history)

        # 4. Interval Analysis (3 Zones)
        interval_stats = StatisticsService._calculate_interval(recent_history)

        # 5. Consecutive & Repeated
        seq_repeat_stats = StatisticsService._calculate_seq_repeat(recent_history)

        # 6. Omission Analysis
        omission_stats = StatisticsService._calculate_omission(full_history)

        # Extract hot numbers for backward compatibility
        hot_reds = [item["number"] for item in freq_stats["red"] if item["tag"] == "hot"]
        hot_blues = [item["number"] for item in freq_stats["blue"] if item["tag"] == "hot"]

        return {
            # Backward compatibility fields
            "red_frequency": freq_stats["red"],
            "blue_frequency": freq_stats["blue"],
            "hot_numbers": {"red": hot_reds, "blue": hot_blues},
            # New structure fields
            "frequency": freq_stats,
            "odd_even": odd_even_stats,
            "big_small": big_small_stats,
            "interval": interval_stats,
            "consecutive_repeated": seq_repeat_stats,
            "omission": omission_stats,
        }

    @staticmethod
    def _get_empty_stats():
        return {
            "red_frequency": [],
            "blue_frequency": [],
            "hot_numbers": {"red": [], "blue": []},
            "frequency": {"red": [], "blue": []},
            "odd_even": [],
            "big_small": [],
            "interval": [],
            "consecutive_repeated": [],
            "omission": {"red": {}, "blue": {}},
        }

    @staticmethod
    def _calculate_frequency(history):
        all_reds = []
        all_blues = []
        for item in history:
            all_reds.extend(item.red_balls)
            all_blues.append(item.blue_ball)

        red_counts = Counter(all_reds)
        blue_counts = Counter(all_blues)

        # Calculate average frequency for Hot/Cold classification
        total_red_appearances = sum(red_counts.values())
        avg_red_freq = total_red_appearances / 33 if total_red_appearances else 0

        total_blue_appearances = sum(blue_counts.values())
        avg_blue_freq = total_blue_appearances / 16 if total_blue_appearances else 0

        red_freq = []
        for i in range(1, 34):
            count = red_counts.get(i, 0)
            tag = "hot" if count > avg_red_freq else ("cold" if count < avg_red_freq else "warm")
            red_freq.append({"number": i, "count": count, "tag": tag})

        blue_freq = []
        for i in range(1, 17):
            count = blue_counts.get(i, 0)
            tag = "hot" if count > avg_blue_freq else ("cold" if count < avg_blue_freq else "warm")
            blue_freq.append({"number": i, "count": count, "tag": tag})

        return {"red": red_freq, "blue": blue_freq}

    @staticmethod
    def _calculate_odd_even(history):
        # 0:6 to 6:0 ratios
        ratios = Counter()
        trend = []

        for item in history:
            odds = sum(1 for n in item.red_balls if n % 2 != 0)
            evens = 6 - odds
            ratio_str = f"{odds}:{evens}"
            ratios[ratio_str] += 1
            trend.append({"issue": item.issue_number, "odds": odds, "evens": evens})

        return {"ratios": dict(ratios), "trend": trend[::-1]}  # Reverse to show oldest first in charts

    @staticmethod
    def _calculate_big_small(history):
        # Small: 1-16, Big: 17-33
        ratios = Counter()
        trend = []

        for item in history:
            small = sum(1 for n in item.red_balls if 1 <= n <= 16)
            big = sum(1 for n in item.red_balls if 17 <= n <= 33)
            ratio_str = f"{small}:{big}"
            ratios[ratio_str] += 1
            trend.append({"issue": item.issue_number, "small": small, "big": big})

        return {"ratios": dict(ratios), "trend": trend[::-1]}

    @staticmethod
    def _calculate_interval(history):
        # Zone 1: 1-11, Zone 2: 12-22, Zone 3: 23-33
        zone_counts = {"zone1": 0, "zone2": 0, "zone3": 0}
        trend = []

        for item in history:
            z1 = sum(1 for n in item.red_balls if 1 <= n <= 11)
            z2 = sum(1 for n in item.red_balls if 12 <= n <= 22)
            z3 = sum(1 for n in item.red_balls if 23 <= n <= 33)

            zone_counts["zone1"] += z1
            zone_counts["zone2"] += z2
            zone_counts["zone3"] += z3

            trend.append({"issue": item.issue_number, "z1": z1, "z2": z2, "z3": z3})

        return {"total_counts": zone_counts, "trend": trend[::-1]}

    @staticmethod
    def _calculate_seq_repeat(history):
        # Consecutive (neighbors with diff 1)
        # Repeated (same number as previous draw)

        # Sort history by date ascending for repeated number calculation
        sorted_history = sorted(history, key=lambda x: x.draw_date)

        consecutive_counts = Counter()  # 0, 1 (2-link), 2 (3-link), etc.
        repeated_counts = Counter()  # 0, 1, 2, 3... repeated numbers

        trend = []

        for i, item in enumerate(sorted_history):
            # Consecutive
            reds = sorted(item.red_balls)
            consecutive_pairs = 0
            for j in range(len(reds) - 1):
                if reds[j + 1] - reds[j] == 1:
                    consecutive_pairs += 1
            consecutive_counts[consecutive_pairs] += 1

            # Repeated (Compare with previous)
            repeated_num_count = 0
            if i > 0:
                prev_reds = set(sorted_history[i - 1].red_balls)
                curr_reds = set(item.red_balls)
                repeated_num_count = len(curr_reds.intersection(prev_reds))
                repeated_counts[repeated_num_count] += 1

            trend.append({"issue": item.issue_number, "consecutive": consecutive_pairs, "repeated": repeated_num_count})

        return {
            "consecutive_dist": dict(consecutive_counts),
            "repeated_dist": dict(repeated_counts),
            "trend": trend,  # Already sorted oldest first
        }

    @staticmethod
    def _calculate_omission(history):
        # Full history needed, newest first in 'history' list, so reverse it
        sorted_history = sorted(history, key=lambda x: x.draw_date)

        # Init stats
        red_stats = {i: {"current": 0, "max": 0, "history": []} for i in range(1, 34)}
        blue_stats = {i: {"current": 0, "max": 0, "history": []} for i in range(1, 17)}

        last_red_idx = {i: -1 for i in range(1, 34)}
        last_blue_idx = {i: -1 for i in range(1, 17)}

        total_draws = len(sorted_history)

        for idx, item in enumerate(sorted_history):
            # Red
            for num in range(1, 34):
                if num in item.red_balls:
                    # Calculate gap
                    gap = idx - last_red_idx[num] - 1
                    if last_red_idx[num] != -1:  # Skip first appearance for gap stats if we want strict gaps
                        red_stats[num]["history"].append(gap)
                        if gap > red_stats[num]["max"]:
                            red_stats[num]["max"] = gap
                    last_red_idx[num] = idx

            # Blue
            b = item.blue_ball
            gap = idx - last_blue_idx[b] - 1
            if last_blue_idx[b] != -1:
                blue_stats[b]["history"].append(gap)
                if gap > blue_stats[b]["max"]:
                    blue_stats[b]["max"] = gap
            last_blue_idx[b] = idx

        # Finalize current omission
        for i in range(1, 34):
            curr = total_draws - 1 - last_red_idx[i]
            red_stats[i]["current"] = curr
            if curr > red_stats[i]["max"]:
                red_stats[i]["max"] = curr
            # Average
            gaps = red_stats[i]["history"] + [curr]
            red_stats[i]["avg"] = sum(gaps) / len(gaps) if gaps else 0

        for i in range(1, 17):
            curr = total_draws - 1 - last_blue_idx[i]
            blue_stats[i]["current"] = curr
            if curr > blue_stats[i]["max"]:
                blue_stats[i]["max"] = curr
            gaps = blue_stats[i]["history"] + [curr]
            blue_stats[i]["avg"] = sum(gaps) / len(gaps) if gaps else 0

        return {"red": red_stats, "blue": blue_stats}
