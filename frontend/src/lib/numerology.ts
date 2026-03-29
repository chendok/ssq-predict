import { Solar } from 'lunar-javascript';
import { AlgorithmDetail } from '@/components/common/design/AlgorithmCard';

// Configuration and Constants
const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const GAN_MAP: Record<string, number> = Object.fromEntries(GAN.map((g, i) => [g, i + 1]));
const ZHI_MAP: Record<string, number> = Object.fromEntries(ZHI.map((z, i) => [z, i + 1]));

// Bagua to Five Elements
const BAGUA_ELEMENTS: Record<number, string> = {
    1: "Metal", 2: "Metal", 3: "Fire", 4: "Wood",
    5: "Wood", 6: "Water", 7: "Earth", 8: "Earth"
};

// Number to Element Mapping (1-33)
const NUMBER_ELEMENT_MAP: Record<string, number[]> = {
    "Water": [1, 6, 11, 16, 21, 26, 31],
    "Fire": [2, 7, 12, 17, 22, 27, 32],
    "Wood": [3, 8, 13, 18, 23, 28, 33],
    "Metal": [4, 9, 14, 19, 24, 29],
    "Earth": [5, 10, 15, 20, 25, 30]
};

interface TimeObj {
    yearGan: number; yearZhi: number;
    monthGan: number; monthZhi: number;
    dayGan: number; dayZhi: number;
    timeGan: number; timeZhi: number;
    ganzhi_str: string;
    raw: { year: string; month: string; day: string; time: string };
}

export class TimeParser {
    static parse(dateInput?: string | Date): TimeObj {
        let dt: Date;
        if (!dateInput) {
            dt = new Date();
        } else if (typeof dateInput === 'string') {
            // Check for GanZhi
            if (/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(dateInput)) {
                return TimeParser._parse_ganzhi(dateInput);
            }
            dt = new Date(dateInput);
            if (isNaN(dt.getTime())) throw new Error("Invalid date format");
        } else {
            dt = dateInput;
        }

        const solar = Solar.fromYmdHms(dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
        const lunar = solar.getLunar();

        const year_gz = lunar.getYearInGanZhi();
        const month_gz = lunar.getMonthInGanZhi();
        const day_gz = lunar.getDayInGanZhi();
        const time_gz = lunar.getTimeInGanZhi();

        const ganzhi_str = `${year_gz}年 ${month_gz}月 ${day_gz}日 ${time_gz}时`;

        return {
            yearGan: GAN_MAP[year_gz[0]] || 1, yearZhi: ZHI_MAP[year_gz[1]] || 1,
            monthGan: GAN_MAP[month_gz[0]] || 1, monthZhi: ZHI_MAP[month_gz[1]] || 1,
            dayGan: GAN_MAP[day_gz[0]] || 1, dayZhi: ZHI_MAP[day_gz[1]] || 1,
            timeGan: GAN_MAP[time_gz[0]] || 1, timeZhi: ZHI_MAP[time_gz[1]] || 1,
            ganzhi_str,
            raw: { year: year_gz, month: month_gz, day: day_gz, time: time_gz }
        };
    }

    static _parse_ganzhi(ganzhi_str: string): TimeObj {
        const matches = ganzhi_str.match(/([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])/g);
        if (!matches || matches.length < 3) {
            throw new Error("Invalid Ganzhi format. Expected at least Year, Month, Day.");
        }

        const [year, month, day, time = "甲子"] = matches;

        return {
            yearGan: GAN_MAP[year[0]] || 1, yearZhi: ZHI_MAP[year[1]] || 1,
            monthGan: GAN_MAP[month[0]] || 1, monthZhi: ZHI_MAP[month[1]] || 1,
            dayGan: GAN_MAP[day[0]] || 1, dayZhi: ZHI_MAP[day[1]] || 1,
            timeGan: GAN_MAP[time[0]] || 1, timeZhi: ZHI_MAP[time[1]] || 1,
            ganzhi_str,
            raw: { year, month, day, time }
        };
    }
}

export class HexagramHelper {
    static getLines(upper: number, lower: number): number[] {
        // Map 1-8 to [l1, l2, l3] where l1 is bottom
        const map: Record<number, number[]> = {
            1: [1, 1, 1], // Qian
            2: [1, 1, 0], // Dui
            3: [1, 0, 1], // Li
            4: [1, 0, 0], // Zhen
            5: [0, 1, 1], // Xun
            6: [0, 1, 0], // Kan
            7: [0, 0, 1], // Gen
            8: [0, 0, 0]  // Kun
        };
        // Hexagram lines 1-6. Lower is 1-3, Upper is 4-6.
        return [...(map[lower] || []), ...(map[upper] || [])];
    }
}

class MeihuaEngine {
    process(time_obj: TimeObj) {
        const { yearZhi, monthZhi, dayZhi, timeZhi = 1 } = time_obj;

        const sum_upper = yearZhi + monthZhi + dayZhi;
        let upper = sum_upper % 8;
        if (upper === 0) upper = 8;

        const sum_lower = sum_upper + timeZhi;
        let lower = sum_lower % 8;
        if (lower === 0) lower = 8;

        let moving = sum_lower % 6;
        if (moving === 0) moving = 6;

        return {
            type: "Meihua",
            upper,
            lower,
            moving_line: moving,
            wang_palace: moving > 3 ? upper : lower
        };
    }
}

class QimenEngine {
    process(time_obj: TimeObj) {
        const { monthZhi, dayGan, dayZhi } = time_obj;
        const is_yang = monthZhi >= 1 && monthZhi <= 6;

        let ju_num = (dayGan + dayZhi) % 9;
        if (ju_num === 0) ju_num = 9;

        let palace_idx = (ju_num + dayGan) % 9;
        if (palace_idx === 0) palace_idx = 9;

        const palace_elements: Record<number, string> = {
            1: "Water", 2: "Earth", 3: "Wood", 4: "Wood", 5: "Earth",
            6: "Metal", 7: "Metal", 8: "Earth", 9: "Fire"
        };

        return {
            type: "Qimen",
            ju: `${is_yang ? 'Yang' : 'Yin'} ${ju_num}`,
            zhifu_star: `Star-${palace_idx}`,
            zhifu_palace: palace_idx,
            wang_element: palace_elements[palace_idx]
        };
    }
}

class LiuyaoEngine {
    process(time_obj: TimeObj) {
        // Simple PRNG seeding simulation
        const seed = time_obj.yearGan + time_obj.yearZhi + time_obj.monthGan +
                     time_obj.monthZhi + time_obj.dayGan + time_obj.dayZhi + (time_obj.timeZhi || 0);

        // Simple Linear Congruential Generator
        let state = seed;
        const rand = () => {
            state = (state * 1664525 + 1013904223) % 4294967296;
            return state / 4294967296;
        };

        const lines = Array(6).fill(0).map(() => Math.floor(rand() * 4));

        const get_trigram = (l1: number, l2: number, l3: number) => {
            const val = ((l1 === 1 || l1 === 3) ? 1 : 0) +
                        ((l2 === 1 || l2 === 3) ? 2 : 0) +
                        ((l3 === 1 || l3 === 3) ? 4 : 0);
            const map_val: Record<number, number> = {7:1, 3:2, 5:3, 1:4, 6:5, 2:6, 4:7, 0:8};
            return map_val[val] || 1;
        };

        const lower = get_trigram(lines[0], lines[1], lines[2]);
        const upper = get_trigram(lines[3], lines[4], lines[5]);

        const moving_idx = lines.findIndex(x => x === 2 || x === 3) + 1 || 1;
        const wang_palace = moving_idx > 3 ? upper : lower;

        return {
            type: "Liuyao",
            upper,
            lower,
            moving_line: moving_idx,
            wang_palace
        };
    }
}

class HeluoEngine {
    process(time_obj: TimeObj) {
        // 1. Calculate Heavenly and Earthly Numbers from GanZhi
        // Gan: Jia=6, Yi=2, Bing=8, Ding=7, Wu=10, Ji=5, Geng=9, Xin=4, Ren=1, Gui=3 (He Tu Map)
        // Zhi: Zi=1/6, Chou=5/10... Simplified Mapping for Heluo:
        const gan_vals: Record<number, number> = {1:6, 2:2, 3:8, 4:7, 5:10, 6:5, 7:9, 8:4, 9:1, 10:3};
        const zhi_vals: Record<number, number> = {
            1:1, 2:5, 3:3, 4:8, 5:5, 6:2, 7:7, 8:5, 9:4, 10:9, 11:5, 12:6
        }; // Standard Heluo Zhi mapping is complex, using simplified He Tu correlation here.

        let heaven_sum = 0; // Odd
        let earth_sum = 0;  // Even

        const add = (v: number) => {
            if (v % 2 !== 0) heaven_sum += v;
            else earth_sum += v;
        };

        [time_obj.yearGan, time_obj.monthGan, time_obj.dayGan, time_obj.timeGan].forEach(g => add(gan_vals[g] || 0));
        [time_obj.yearZhi, time_obj.monthZhi, time_obj.dayZhi, time_obj.timeZhi].forEach(z => add(zhi_vals[z] || 0));

        // 2. Map to Trigrams
        // Remove 10s/25s to get remainder
        let h_rem = heaven_sum % 25;
        if (h_rem === 0) h_rem = 25;
        let e_rem = earth_sum % 30;
        if (e_rem === 0) e_rem = 30;

        // Map Remainder to Gua (1,6 Water; 2,7 Fire...)
        // Simplified Logic: 1,6->Kan(6); 2,7->Li(3); 3,8->Zhen(4)/Xun(5); 4,9->Dui(2)/Qian(1); 5,10->Gen(7)/Kun(8)
        const get_gua = (n: number) => {
            const base = n % 10;
            if (base === 1 || base === 6) return 6; // Kan (Water)
            if (base === 2 || base === 7) return 3; // Li (Fire)
            if (base === 3 || base === 8) return 4; // Zhen (Wood) - simplified
            if (base === 4 || base === 9) return 1; // Qian (Metal) - simplified
            return 8; // Kun (Earth)
        };

        const upper = get_gua(heaven_sum);
        const lower = get_gua(earth_sum);

        return {
            type: "Heluo",
            upper,
            lower,
            heaven_sum,
            earth_sum,
            wang_palace: upper // Use upper as main indicator
        };
    }
}

class TimeSpaceEngine {
    process(time_obj: TimeObj) {
        // Simulate Space using hash of ganzhi + random
        const str = time_obj.ganzhi_str;
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
        const space_num = Math.abs(hash) % 100;

        // Upper = (Year+Month+Day+Space) % 8
        const raw_upper = time_obj.yearZhi + time_obj.monthZhi + time_obj.dayZhi + space_num;
        let upper = raw_upper % 8;
        if (upper === 0) upper = 8;

        // Lower = (Hour+Minute+Space) % 8 -> using timeZhi + random part
        const raw_lower = time_obj.timeZhi + (space_num % 12);
        let lower = raw_lower % 8;
        if (lower === 0) lower = 8;

        // Moving = Sum % 6
        let moving = (raw_upper + raw_lower) % 6;
        if (moving === 0) moving = 6;

        return {
            type: "TimeSpace",
            upper,
            lower,
            moving_line: moving,
            wang_palace: moving > 3 ? upper : lower
        };
    }
}

class BaziGuaEngine {
    process(time_obj: TimeObj) {
        const { dayGan, monthZhi } = time_obj;

        // 1. Determine Day Master Element
        // 1-2 Wood, 3-4 Fire, 5-6 Earth, 7-8 Metal, 9-10 Water
        const dm_el = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"][dayGan-1];

        // 2. Determine Season Element (Month Zhi)
        // In/Mao=Wood, Si/Wu=Fire, Shen/You=Metal, Hai/Zi=Water, Others=Earth
        let season_el = "Earth";
        if ([3, 4].includes(monthZhi)) season_el = "Wood";
        else if ([6, 7].includes(monthZhi)) season_el = "Fire";
        else if ([9, 10].includes(monthZhi)) season_el = "Metal";
        else if ([12, 1].includes(monthZhi)) season_el = "Water";

        // 3. Simple Strength Check
        const is_strong = dm_el === season_el; // Very simplified

        // 4. Determine Useful Element (Opposite if strong, Same if weak)
        // Cycle: Wood -> Fire -> Earth -> Metal -> Water
        const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
        const dm_idx = elements.indexOf(dm_el);

        let useful_el = "";
        if (is_strong) {
            // Weakening: Child (Output) or Controller (Official)
            useful_el = elements[(dm_idx + 3) % 5]; // Controller (e.g. Wood strong -> Metal)
        } else {
            // Strengthening: Mother (Resource) or Same (Friend)
            useful_el = elements[(dm_idx + 4) % 5]; // Mother (e.g. Wood weak -> Water)
        }

        // 5. Map Useful Element to Gua
        // Metal->1/2, Wood->4/5, Water->6, Fire->3, Earth->7/8
        const el_gua_map: Record<string, number> = {
            "Metal": 1, "Wood": 4, "Water": 6, "Fire": 3, "Earth": 8
        };

        const gua = el_gua_map[useful_el] || 1;

        return {
            type: "BaziGua",
            upper: gua,
            lower: (gua % 8) + 1, // Variation
            wang_element: useful_el,
            wang_palace: gua
        };
    }
}

class Selector {
    wang_element: string;
    producing: Record<string, string>;
    mother: Record<string, string>;

    constructor(wang_element: string) {
        this.wang_element = wang_element;
        this.producing = {
            "Wood": "Fire", "Fire": "Earth", "Earth": "Metal", "Metal": "Water", "Water": "Wood"
        };
        this.mother = Object.fromEntries(Object.entries(this.producing).map(([k, v]) => [v, k]));
    }

    get_pool() {
        const pool = [...(NUMBER_ELEMENT_MAP[this.wang_element] || [])];
        const mother = this.mother[this.wang_element];
        if (mother) pool.push(...(NUMBER_ELEMENT_MAP[mother] || []));
        return Array.from(new Set(pool)).sort((a, b) => a - b);
    }

    select_red() {
        const pool = this.get_pool();
        const source = pool.length < 6 ? Array.from({length: 33}, (_, i) => i + 1) : pool;

        // Random sample 6
        const shuffled = [...source].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 6).sort((a, b) => a - b);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select_blue(engine_res: any) {
        const etype = engine_res.type;
        let val = 1;
        if (etype === "Meihua" || etype === "Liuyao" || etype === "TimeSpace") {
            const m = engine_res.moving_line;
            const raw = m + 10;
            val = (raw - 1) % 16 + 1;
        } else if (etype === "Qimen") {
            const z = engine_res.zhifu_palace;
            val = (z % 16) + 1;
        } else if (etype === "Heluo") {
            val = (engine_res.heaven_sum + engine_res.earth_sum) % 16 + 1;
        } else if (etype === "BaziGua") {
            // Map useful element to Blue ball
            const map: Record<string, number> = {"Metal": 1, "Wood": 4, "Water": 6, "Fire": 3, "Earth": 8};
            val = map[engine_res.wang_element] || 1;
            val = (val + 5) % 16 + 1; // Shift to make it interesting
        }
        return val;
    }
}

class Balancer {
    check(reds: number[], level = 0) {
        // Odd/Even
        const odds = reds.filter(x => x % 2 !== 0).length;
        const valid_oe = [2, 3, 4].includes(odds) || level >= 2;

        // Big/Small
        const smalls = reds.filter(x => x <= 16).length;
        const valid_bs = [2, 3, 4].includes(smalls) || level >= 3;

        // Five Elements
        const elements = new Set();
        reds.forEach(r => {
            Object.entries(NUMBER_ELEMENT_MAP).forEach(([e, nums]) => {
                if (nums.includes(r)) elements.add(e);
            });
        });
        const cnt = elements.size;
        const valid_elem = (cnt >= 2 && cnt <= 3) || level >= 1;

        return valid_oe && valid_bs && valid_elem;
    }
}

export interface AlgorithmMeta {
  id: string;
  name: string;
  desc: string;
  details: AlgorithmDetail;
}

export const ALGORITHM_META: Record<string, AlgorithmMeta> = {
  "meihua": {
    id: "meihua",
    name: "梅花易数",
    desc: "基于时间起卦，灵动迅捷",
    details: {
      principle: "核心机制是'时间切片'，非常契合彩票开奖的'特定时刻随机性'。通过时间参数映射红蓝球具有较高的逻辑自洽性。",
      usage: "短期趋势，临场灵感，蓝球定胆",
      params: "预测时间 (年月日时)",
      steps: "1. 时间起卦\n2. 互卦变卦\n3. 体用生克"
    }
  },
  "qimen": {
    id: "qimen",
    name: "奇门遁甲",
    desc: "时空能量模型，运筹帷幄",
    details: {
      principle: "侧重于'方位'与'选择'。彩票是纯随机数字，不涉及空间方位（除非考虑购彩方位）。强行映射到数字上略显牵强，但在'择时'上有优势。",
      usage: "购彩方位选择，购彩时间选择，五行强弱分析",
      params: "预测时间 (年月日时)",
      steps: "1. 定局数\n2. 排地盘天盘\n3. 找值符值使"
    }
  },
  "liuyao": {
    id: "liuyao",
    name: "六爻预测",
    desc: "纳甲筮法，细节入微",
    details: {
      principle: "擅长判断吉凶祸福（Yes/No）。将33个红球映射到六个爻位非常困难，容易出现信息丢失。适合预测'中奖概率'而非'具体号码'。",
      usage: "中奖运势预测，排除法杀号，奇偶趋势",
      params: "预测时间",
      steps: "1. 起卦\n2. 装纳甲\n3. 判世应"
    }
  },
  "heluo": {
    id: "heluo",
    name: "河洛理数",
    desc: "数理之源，全息对应",
    details: {
      principle: "直接基于'河图洛书'的数字生成逻辑。它是最纯粹的'数理'方法，与彩票的数字本质高度契合。天地数的计算直接对应数字集合。",
      usage: "红球胆码，数字组合，和值分析",
      params: "预测时间",
      steps: "1. 计算天地数\n2. 配卦\n3. 取数"
    }
  },
  "timespace": {
    id: "timespace",
    name: "时空全象",
    desc: "多维折叠，全息映射",
    details: {
      principle: "融合了时间与空间（经纬度）。如果你认为'在哪里买'会影响结果，这是最佳选择。增加了变量维度，适合寻找特定时空的'共振数'。",
      usage: "跨区域购彩，复杂参数映射，冷热号分析",
      params: "预测时间，地理位置",
      steps: "1. 时间空间哈希\n2. 映射卦象\n3. 取数"
    }
  },
  "bazi": {
    id: "bazi",
    name: "八字喜用",
    desc: "个人命理，专属定制",
    details: {
      principle: "彩票中奖往往被视为'个人运势'。此方法完全基于个人八字喜用神，寻找与个人磁场共振的'幸运数字'。从玄学角度看，这是最'个性化'的方案。",
      usage: "个人专属号码，守号策略，五行补缺",
      params: "出生日期",
      steps: "1. 排八字\n2. 定旺衰\n3. 取喜用神"
    }
  }
};

export class TraditionalPredictor {
    static predict(method: string, dateInput?: string | Date, count = 1) {
        try {
            const time_obj = TimeParser.parse(dateInput);

            const results = [];
            for (let i = 0; i < count; i++) {
                let engine;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let eng_res: any;

        if (method === "meihua") {
            engine = new MeihuaEngine();
            eng_res = engine.process(time_obj);
        } else if (method === "qimen") {
            engine = new QimenEngine();
            eng_res = engine.process(time_obj);
        } else if (method === "liuyao") {
            engine = new LiuyaoEngine();
            eng_res = engine.process(time_obj);
        } else if (method === "heluo") {
            engine = new HeluoEngine();
            eng_res = engine.process(time_obj);
        } else if (method === "timespace") {
            engine = new TimeSpaceEngine();
            eng_res = engine.process(time_obj);
        } else if (method === "bazi") {
            engine = new BaziGuaEngine();
            eng_res = engine.process(time_obj);
        } else {
            throw new Error("Unknown method");
        }

        let wang_el = BAGUA_ELEMENTS[eng_res.wang_palace || 1] || eng_res.wang_element || "Metal";
        if (method === "qimen" || method === "bazi") wang_el = eng_res.wang_element;

                const selector = new Selector(wang_el);
                const balancer = new Balancer();

                let reds: number[] = [];
                let tries = 0;
                let level = 0;

                while (tries < 1000) {
                    reds = selector.select_red();
                    if (balancer.check(reds, level)) break;
                    tries++;
                    if (tries > 800) level = 3;
                    else if (tries > 500) level = 2;
                    else if (tries > 200) level = 1;
                }

                const blue = selector.select_blue(eng_res);

                // Stats
                const odds = reds.filter(x => x % 2 !== 0).length;
                const smalls = reds.filter(x => x <= 16).length;
                const elem_dist: Record<string, number> = {};
                reds.forEach(r => {
                    Object.entries(NUMBER_ELEMENT_MAP).forEach(([e, nums]) => {
                        if (nums.includes(r)) elem_dist[e] = (elem_dist[e] || 0) + 1;
                    });
                });

                results.push({
                    method: method,
                    numbers: { red: reds, blue: blue },
                    metadata: {
                        ganzhi: time_obj.ganzhi_str,
                        wang_element: wang_el,
                        engine_raw: eng_res,
                        retries: tries,
                        level: level,
                        stats: {
                            five_elements: elem_dist,
                            odd_even: `${odds}:${6-odds}`,
                            big_small: `${smalls}:${6-smalls}`
                        }
                    }
                });
            }
            return {
                numbers: results[0].numbers, // Use first result as main
                details: results
            };
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
