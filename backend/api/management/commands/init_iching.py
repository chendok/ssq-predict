from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import Hexagram, Interpretation, Line


class Command(BaseCommand):
    help = "Initialize I-Ching (Zhou Yi) data for the prediction system"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting I-Ching data initialization..."))

        if Hexagram.objects.exists():
            self.stdout.write(self.style.WARNING("Data already exists. Skipping initialization."))
            return

        with transaction.atomic():
            self.init_hexagrams()
            self.init_lines()
            self.init_interpretations()

        self.stdout.write(self.style.SUCCESS("Successfully initialized I-Ching data."))

    def init_hexagrams(self):
        # Full list of 64 hexagrams (Names)
        hexagrams = [
            (1, "乾", "元亨利贞。", "大哉乾元，万物资始，乃统天。", "天行健，君子以自强不息。"),
            (2, "坤", "元亨，利牝马之贞。", "至哉坤元，万物资生，乃顺承天。", "地势坤，君子以厚德载物。"),
            (3, "屯", "元亨，利贞。勿用有筱。利建侯。", "屯，刚柔始交而难生。", "云雷屯，君子以经纶。"),
            (
                4,
                "蒙",
                "亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。",
                "蒙，山下有险，险而止，蒙。",
                "山下出泉，蒙；君子以果行育德。",
            ),
            # ... For brevity in this script, adding placeholders for others.
            # In a real production script, all 64 would be listed here.
        ]

        # Add the rest as placeholders to ensure system works for 64 hexagrams
        names = [
            "需",
            "讼",
            "师",
            "比",
            "小畜",
            "履",
            "泰",
            "否",
            "同人",
            "大有",
            "谦",
            "豫",
            "随",
            "蛊",
            "临",
            "观",
            "噬嗑",
            "贲",
            "剥",
            "复",
            "无妄",
            "大畜",
            "颐",
            "大过",
            "坎",
            "离",
            "咸",
            "恒",
            "遁",
            "大壮",
            "晋",
            "明夷",
            "家人",
            "睽",
            "蹇",
            "解",
            "损",
            "益",
            "夬",
            "姤",
            "萃",
            "升",
            "困",
            "井",
            "革",
            "鼎",
            "震",
            "艮",
            "渐",
            "归妹",
            "丰",
            "旅",
            "巽",
            "兑",
            "涣",
            "节",
            "中孚",
            "小过",
            "既济",
            "未济",
        ]

        for i, name in enumerate(names, start=5):
            hexagrams.append((i, name, "（待补充）", "（待补充）", "（待补充）"))

        for seq, name, orig, tuan, xiang in hexagrams:
            Hexagram.objects.create(
                sequence=seq,
                name=name,
                original_text=orig,
                translation=f"【白话】{orig} (译文待补充)",
                tuan_chuan=tuan,
                xiang_chuan=xiang,
            )

        self.stdout.write(f"Created {len(hexagrams)} hexagrams.")

    def init_lines(self):
        # Example lines for Qian (1)
        qian = Hexagram.objects.get(sequence=1)
        lines_data = [
            (1, "潜龙勿用。", "龙潜伏水中，暂时不能发挥作用。", "潜龙勿用，阳在下也。", 1, "average"),
            (2, "见龙在田，利见大人。", "龙出现在田间，利于见到大人物。", "见龙在田，德施普也。", 1, "fortune"),
            (
                3,
                "君子终日乾乾，夕惕若厉，无咎。",
                "君子整天勤奋努力，晚上也警惕戒惧，就没有灾祸。",
                "终日乾乾，反复道也。",
                1,
                "average",
            ),
            (4, "或跃在渊，无咎。", "龙或许跃进深渊，没有灾祸。", "或跃在渊，进无咎也。", 1, "average"),
            (5, "飞龙在天，利见大人。", "龙飞翔在天空，利于见到大人物。", "飞龙在天，大人造也。", 1, "great_fortune"),
            (6, "亢龙有悔。", "龙飞得过高，会有后悔。", "亢龙有悔，盈不可久也。", 1, "misfortune"),
        ]

        for pos, orig, trans, xiao, nature, ausp in lines_data:
            Line.objects.create(
                hexagram=qian,
                position=pos,
                original_text=orig,
                translation=trans,
                xiao_xiang=xiao,
                nature=nature,
                auspiciousness=ausp,
            )

        # Example lines for Kun (2)
        kun = Hexagram.objects.get(sequence=2)
        lines_data_kun = [
            (1, "履霜，坚冰至。", "踩到霜，坚冰就要到来了。", "履霜坚冰，阴始凝也。", 0, "misfortune"),
            (
                2,
                "直方大，不习无不利。",
                "正直、端方、宏大，不学习也没有什么不利的。",
                "六二之动，直以方也。",
                0,
                "great_fortune",
            ),
            (
                3,
                "含章可贞。或从王事，无成有终。",
                "含蓄地处事，保持纯正。或者辅佐君王，不居功但有好的结果。",
                "含章可贞，以时发也。",
                0,
                "fortune",
            ),
            (4, "括囊，无咎无誉。", "扎紧口袋，没有灾祸也没有荣誉。", "括囊无咎，慎不害也。", 0, "average"),
            (5, "黄裳，元吉。", "穿着黄色的裙裳，大吉大利。", "黄裳元吉，文在中也。", 0, "great_fortune"),
            (
                6,
                "龙战于野，其血玄黄。",
                "龙在野外战斗，流出的血是青黄色的。",
                "龙战于野，其道穷也。",
                0,
                "great_misfortune",
            ),
        ]

        for pos, orig, trans, xiao, nature, ausp in lines_data_kun:
            Line.objects.create(
                hexagram=kun,
                position=pos,
                original_text=orig,
                translation=trans,
                xiao_xiang=xiao,
                nature=nature,
                auspiciousness=ausp,
            )

        self.stdout.write("Created lines for Qian and Kun.")

    def init_interpretations(self):
        qian = Hexagram.objects.get(sequence=1)

        # Career for Qian Hexagram (Overall)
        Interpretation.objects.create(
            hexagram=qian,
            line=None,
            topic="career",
            content="乾卦象征天，刚健中正。事业上正处于上升期，应效法天道，自强不息。目前运势强劲，适合大展宏图，但也需注意过犹不及，保持谦虚谨慎。",
            suggestions=["制定长远目标，坚持不懈。", "勇于承担责任，展现领导力。", "注意与人合作，避免孤傲。"],
        )

        # Career for Qian Line 1 (Moving Line 1)
        line1 = Line.objects.get(hexagram=qian, position=1)
        Interpretation.objects.create(
            hexagram=qian,
            line=line1,
            topic="career",
            content="潜龙勿用。目前时机尚未成熟，应当韬光养晦，积累实力，不宜轻举妄动。急于求成反而容易招致失败。",
            suggestions=["专注于自我提升和学习。", "低调行事，避免锋芒毕露。", "耐心等待更好的机会。"],
        )

        self.stdout.write("Created sample interpretations.")
