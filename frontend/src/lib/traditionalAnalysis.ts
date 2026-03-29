import { Solar } from 'lunar-javascript';

// --- Helper Functions ---

export const getStemInfo = (stem: string) => {
    const map: Record<string, { element: string, polarity: number }> = {
        '甲': { element: '木', polarity: 1 }, // Yang
        '乙': { element: '木', polarity: 0 }, // Yin
        '丙': { element: '火', polarity: 1 },
        '丁': { element: '火', polarity: 0 },
        '戊': { element: '土', polarity: 1 },
        '己': { element: '土', polarity: 0 },
        '庚': { element: '金', polarity: 1 },
        '辛': { element: '金', polarity: 0 },
        '壬': { element: '水', polarity: 1 },
        '癸': { element: '水', polarity: 0 }
    };
    return map[stem] || { element: '土', polarity: 1 };
};

export const getCharWuxing = (char: string) => {
    const map: Record<string, string> = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
        '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };
    return map[char] || '土';
};

export const getWuxingRelation = (me: string, other: string) => {
    const relations = ['木', '火', '土', '金', '水'];
    const meIdx = relations.indexOf(me);
    const otherIdx = relations.indexOf(other);
    if (meIdx === -1 || otherIdx === -1) return 'unknown';

    if (meIdx === otherIdx) return 'same';
    if ((meIdx + 1) % 5 === otherIdx) return 'produces'; // Me produces Other
    if ((meIdx + 2) % 5 === otherIdx) return 'controls'; // Me controls Other
    if ((otherIdx + 1) % 5 === meIdx) return 'produced_by'; // Other produces Me
    if ((otherIdx + 2) % 5 === meIdx) return 'controlled_by'; // Other controls Me
    return 'unknown';
};

export const getTenGod = (dayGan: string, targetGan: string) => {
    const dayInfo = getStemInfo(dayGan);
    const targetInfo = getStemInfo(targetGan);
    const relation = getWuxingRelation(dayInfo.element, targetInfo.element);
    const samePolarity = dayInfo.polarity === targetInfo.polarity;

    if (relation === 'same') return samePolarity ? '比肩' : '劫财';
    if (relation === 'produces') return samePolarity ? '食神' : '伤官';
    if (relation === 'controls') return samePolarity ? '偏财' : '正财';
    if (relation === 'controlled_by') return samePolarity ? '七杀' : '正官';
    if (relation === 'produced_by') return samePolarity ? '偏印' : '正印';
    return '比肩'; // Default
};

export const getHiddenStems = (zhi: string): string[] => {
    const map: Record<string, string[]> = {
        '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
        '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '戊', '庚'],
        '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
        '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
    };
    return map[zhi] || [];
};

export const getShenSha = (zhi: string, dayGan: string, dayZhi: string, yearZhi: string) => {
    const list: string[] = [];
    // Tian Yi Gui Ren
    const tianYiMap: Record<string, string[]> = {
        '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
        '乙': ['子', '申'], '己': ['子', '申'],
        '丙': ['亥', '酉'], '丁': ['亥', '酉'],
        '壬': ['卯', '巳'], '癸': ['卯', '巳'],
        '辛': ['午', '寅']
    };
    if (tianYiMap[dayGan]?.includes(zhi)) list.push('天乙贵人');

    // Wen Chang
    const wenChangMap: Record<string, string> = {
        '甲': '巳', '乙': '午', '丙': '申', '戊': '申',
        '丁': '酉', '己': '酉', '庚': '亥', '辛': '子',
        '壬': '寅', '癸': '卯'
    };
    if (wenChangMap[dayGan] === zhi) list.push('文昌贵人');

    // Tao Hua
    const checkTaoHua = (baseZhi: string) => {
        if (['申', '子', '辰'].includes(baseZhi) && zhi === '酉') return true;
        if (['寅', '午', '戌'].includes(baseZhi) && zhi === '卯') return true;
        if (['巳', '酉', '丑'].includes(baseZhi) && zhi === '午') return true;
        if (['亥', '卯', '未'].includes(baseZhi) && zhi === '子') return true;
        return false;
    };
    if (checkTaoHua(yearZhi) || checkTaoHua(dayZhi)) list.push('桃花');

    // Yi Ma
    const checkYiMa = (baseZhi: string) => {
        if (['申', '子', '辰'].includes(baseZhi) && zhi === '寅') return true;
        if (['寅', '午', '戌'].includes(baseZhi) && zhi === '申') return true;
        if (['巳', '酉', '丑'].includes(baseZhi) && zhi === '亥') return true;
        if (['亥', '卯', '未'].includes(baseZhi) && zhi === '巳') return true;
        return false;
    };
    if (checkYiMa(yearZhi) || checkYiMa(dayZhi)) list.push('驿马');

    // Tai Ji Nobleman (Tai Ji Gui Ren)
    const taiJiMap: Record<string, string[]> = {
        '甲': ['子', '午'], '乙': ['子', '午'],
        '丙': ['酉', '卯'], '丁': ['酉', '卯'],
        '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
        '庚': ['寅', '亥'], '辛': ['寅', '亥'],
        '壬': ['巳', '申'], '癸': ['巳', '申']
    };
    if (taiJiMap[dayGan]?.includes(zhi)) list.push('太极贵人');

    // Hua Gai (Arts/Religion)
    const checkHuaGai = (baseZhi: string) => {
        if (['寅', '午', '戌'].includes(baseZhi) && zhi === '戌') return true;
        if (['巳', '酉', '丑'].includes(baseZhi) && zhi === '丑') return true;
        if (['申', '子', '辰'].includes(baseZhi) && zhi === '辰') return true;
        if (['亥', '卯', '未'].includes(baseZhi) && zhi === '未') return true;
        return false;
    };
    if (checkHuaGai(yearZhi) || checkHuaGai(dayZhi)) list.push('华盖');

    // Jiang Xing (Leadership)
    const checkJiangXing = (baseZhi: string) => {
         if (['寅', '午', '戌'].includes(baseZhi) && zhi === '午') return true;
         if (['巳', '酉', '丑'].includes(baseZhi) && zhi === '酉') return true;
         if (['申', '子', '辰'].includes(baseZhi) && zhi === '子') return true;
         if (['亥', '卯', '未'].includes(baseZhi) && zhi === '卯') return true;
         return false;
    };
    if (checkJiangXing(yearZhi)) list.push('将星');

    // Lu Shen (Prosperity)
    const luShenMap: Record<string, string> = {
        '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
        '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
        '壬': '亥', '癸': '子'
    };
    if (luShenMap[dayGan] === zhi) list.push('禄神');

    // Yang Ren (Sheep Blade)
    const yangRenMap: Record<string, string> = {
        '甲': '卯', '乙': '辰', '丙': '午', '丁': '未',
        '戊': '午', '己': '未', '庚': '酉', '辛': '戌',
        '壬': '子', '癸': '丑'
    };
    if (yangRenMap[dayGan] === zhi) list.push('羊刃');

    return list;
};

// --- Hexagram Helpers ---

// Upper (row 1-8) x Lower (col 1-8) -> Hexagram Name
const HEXAGRAM_MATRIX = [
    [], // 0 placeholder
    ['', '乾', '履', '同人', '无妄', '姤', '讼', '遁', '否'], // 1 Upper 乾
    ['', '夬', '兑', '革', '随', '大过', '困', '咸', '萃'], // 2 Upper 兑
    ['', '大有', '睽', '离', '噬嗑', '鼎', '未济', '旅', '晋'], // 3 Upper 离
    ['', '大壮', '归妹', '丰', '震', '恒', '解', '小过', '豫'], // 4 Upper 震
    ['', '小畜', '中孚', '家人', '益', '巽', '涣', '渐', '观'], // 5 Upper 巽
    ['', '需', '节', '既济', '屯', '井', '坎', '蹇', '比'], // 6 Upper 坎
    ['', '大畜', '损', '贲', '颐', '蛊', '蒙', '艮', '剥'], // 7 Upper 艮
    ['', '泰', '临', '明夷', '复', '升', '师', '谦', '坤']  // 8 Upper 坤
];

export const getHexagramName = (upper: number, lower: number) => {
    if (upper < 1 || upper > 8 || lower < 1 || lower > 8) return '未知';
    return HEXAGRAM_MATRIX[upper][lower];
};

export interface HexagramInfo {
    name: string;
    upper: number;
    lower: number;
    element_relation: string; // Relation between Upper (Guest/Object) and Lower (Host/Subject) usually?
    // In Plum Blossom:
    // Body (Ti) = Trigram WITHOUT moving line
    // Application (Yong) = Trigram WITH moving line
}

export interface HexagramData {
    original: HexagramInfo;
    changed: HexagramInfo;
    nuclear: HexagramInfo; // Hu Gua
    movingLine: number; // 1-6
    judgment: {
        score: number; // 0-100
        summary: string; // 吉/凶
        description: string;
    };
}

export const calculateHexagram = (date: Date, numbers?: { red: number[], blue: number }): HexagramData => {
    // Plum Blossom Method (Mei Hua Yi Shu)

    let upper = 0;
    let lower = 0;
    let movingLine = 0;

    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    // Time Based (if numbers not provided)
    // Year: Zhi Index (1-12)
    // Month: Lunar Month
    // Day: Lunar Day
    // Hour: Zhi Index (1-12)
    const yearZhiIndex = lunar.getYearZhiIndexExact() + 1; // 1-12 (Zi=1)
    const month = lunar.getMonth();
    const day = lunar.getDay();
    const timeZhiIndex = lunar.getTimeZhiIndex() + 1; // 1-12

    if (numbers) {
        // Number Based
        // 1. Upper Trigram = Sum of Red Balls % 8
        const sumRed = numbers.red.reduce((a, b) => a + b, 0);
        upper = sumRed % 8;
        if (upper === 0) upper = 8;

        // 2. Lower Trigram = (Blue Ball + Day + Hour?) % 8
        // To make it deterministic based on input, let's use Blue Ball + Date Digits
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // 20230501
        const dateSum = dateStr.split('').reduce((a, c) => a + parseInt(c), 0);

        lower = (numbers.blue + dateSum) % 8;
        if (lower === 0) lower = 8;

        // 3. Moving Line = (Sum Red + Blue + Date Sum) % 6
        const totalSum = sumRed + numbers.blue + dateSum;
        movingLine = totalSum % 6;
        if (movingLine === 0) movingLine = 6;
    } else {
        // Time Based
        const upperSum = yearZhiIndex + month + day;
        upper = upperSum % 8;
        if (upper === 0) upper = 8;

        const lowerSum = upperSum + timeZhiIndex;
        lower = lowerSum % 8;
        if (lower === 0) lower = 8;

        movingLine = lowerSum % 6;
        if (movingLine === 0) movingLine = 6;
    }

    // Original Hexagram
    const originalName = getHexagramName(upper, lower);

    // Changed Hexagram (Bian Gua)
    // Flip the bit of the moving line
    // Trigrams are 3 bits.
    // Upper: lines 4,5,6. Lower: lines 1,2,3.
    // Map Trigram number to bits (Top to Bottom? or Bottom to Top?)
    // Standard Binary for Trigrams (Bottom to Top):
    // 1(Qian 111), 2(Dui 110), 3(Li 101), 4(Zhen 100), 5(Xun 011), 6(Kan 010), 7(Gen 001), 8(Kun 000)
    // Wait, the standard "Xian Tian" number is:
    // Qian=1, Dui=2, Li=3, Zhen=4, Xun=5, Kan=6, Gen=7, Kun=8
    // Let's verify binary (1=Yang, 0=Yin):
    // Qian (111) -> 7? No, simple mapping is easier.

    const trigramBits: Record<number, number[]> = {
        1: [1,1,1], // 乾
        2: [1,1,0], // 兑 (Top is Yin) - Wait, Dui is ☱ (Yin on top). Bottom-up: 1,1,0.
        3: [1,0,1], // 离 ☲ (Yin middle). 1,0,1.
        4: [1,0,0], // 震 ☳ (Yang bottom). 1,0,0.
        5: [0,1,1], // 巽 ☴ (Yin bottom). 0,1,1.
        6: [0,1,0], // 坎 ☵ (Yang middle). 0,1,0.
        7: [0,0,1], // 艮 ☶ (Yang top). 0,0,1.
        8: [0,0,0]  // 坤 ☷
    };

    // Helper to find trigram key from bits
    const findTrigram = (bits: number[]) => {
        for (let i = 1; i <= 8; i++) {
            if (trigramBits[i].join(',') === bits.join(',')) return i;
        }
        return 8; // Fallback
    };

    let newUpper = upper;
    let newLower = lower;

    if (movingLine <= 3) {
        // Change in Lower Trigram
        const bits = [...trigramBits[lower]];
        bits[movingLine - 1] = bits[movingLine - 1] === 1 ? 0 : 1; // Flip (0-indexed in array)
        newLower = findTrigram(bits);
    } else {
        // Change in Upper Trigram
        const bits = [...trigramBits[upper]];
        bits[movingLine - 4] = bits[movingLine - 4] === 1 ? 0 : 1;
        newUpper = findTrigram(bits);
    }

    const changedName = getHexagramName(newUpper, newLower);

    // Nuclear Hexagram (Hu Gua)
    // Lower Hu: Lines 2,3,4
    // Upper Hu: Lines 3,4,5
    // Need full 6 lines of Original.
    // Lower lines: trigramBits[lower]
    // Upper lines: trigramBits[upper]
    const fullLines = [...trigramBits[lower], ...trigramBits[upper]]; // 0-5 indices. 0 is bottom.

    const huLowerBits = [fullLines[1], fullLines[2], fullLines[3]];
    const huUpperBits = [fullLines[2], fullLines[3], fullLines[4]];

    const huLower = findTrigram(huLowerBits);
    const huUpper = findTrigram(huUpperBits);
    const nuclearName = getHexagramName(huUpper, huLower);

    // Judgment (Ti Yong)
    // Determine Ti (Body) and Yong (Application)
    let ti = 0; // Trigram ID
    let yong = 0; // Trigram ID

    if (movingLine <= 3) {
        ti = upper; // Upper is Body (unchanged)
        yong = lower; // Lower is Application (changed)
    } else {
        ti = lower;
        yong = upper;
    }

    const tiElement = getTrigramElement(ti);
    const yongElement = getTrigramElement(yong);
    // const relation = getWuxingRelation(tiElement, yongElement); // Relation of Ti to Yong? No, usually Yong acts on Ti.

    // Check relation: Yong produces Ti (Great), Ti produces Yong (Drain), Yong controls Ti (Bad), Ti controls Yong (Money), Same (Good)
    let score = 60;
    let summary = "平";
    let desc = "";

    // Note: getWuxingRelation(me, other) -> returns relation from perspective of 'me'
    // We want to know what Yong does to Ti.
    // so getWuxingRelation(yong, ti)

    const wuxingRel = getWuxingRelation(yongElement, tiElement);

    if (wuxingRel === 'produces') {
        score = 95;
        summary = "大吉";
        desc = "用卦生体卦，诸事顺遂，大吉大利。";
    } else if (wuxingRel === 'same') {
        score = 85;
        summary = "吉";
        desc = "体用比和，势均力敌，吉利。";
    } else if (wuxingRel === 'controlled_by') {
        // Yong is controlled by Ti (Ti controls Yong)
        score = 75;
        summary = "小吉";
        desc = "体卦克用卦，虽有劳碌，但可得财。";
    } else if (wuxingRel === 'produced_by') {
        // Yong is produced by Ti (Ti produces Yong)
        score = 45;
        summary = "小凶";
        desc = "体卦生用卦，泄气耗损，需防失脱。";
    } else if (wuxingRel === 'controls') {
        // Yong controls Ti
        score = 20;
        summary = "凶";
        desc = "用卦克体卦，压力重重，诸事不利。";
    }

    return {
        original: { name: originalName, upper, lower, element_relation: '' },
        changed: { name: changedName, upper: newUpper, lower: newLower, element_relation: '' },
        nuclear: { name: nuclearName, upper: huUpper, lower: huLower, element_relation: '' },
        movingLine,
        judgment: { score, summary, description: desc }
    };
};

const getTrigramElement = (idx: number) => {
    // 1乾金, 2兑金, 3离火, 4震木, 5巽木, 6坎水, 7艮土, 8坤土
    const map: Record<number, string> = {
        1: '金', 2: '金', 3: '火', 4: '木', 5: '木', 6: '水', 7: '土', 8: '土'
    };
    return map[idx] || '土';
};

// --- Main Calculation Function ---

export interface AnalysisResult {
    fiveElementsData: { name: string; value: number }[];
    yinYangData: { name: string; value: number; fill: string }[];
    sizeData: { name: string; value: number; fill: string }[];
    tenGodsData: { name: string; value: number }[];
    tenGodsGroupData: { subject: string; A: number; fullMark: number }[];
    shenshaData: { subject: string; A: number; fullMark: number }[];
    daYunData: { name: string; value: number; year: string }[];
    hexagramData: HexagramData;
    info: {
        wuxing: string;
        yinyang: string;
        size: string;
        tengods: string;
        shensha: string;
        dayun: string;
        hexagram: string;
    };
}

export const calculateAnalysisData = (date: Date, numbers?: { red: number[], blue: number }): AnalysisResult => {
    console.log("[Analysis] Start calculation for:", date.toISOString());
    const startTime = performance.now();

    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    // 1. Five Elements (Wuxing)
    const wuxingCounts = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };

    const yearGan = eightChar.getYearGan();
    const yearZhi = eightChar.getYearZhi();
    const monthGan = eightChar.getMonthGan();
    const monthZhi = eightChar.getMonthZhi();
    const dayGan = eightChar.getDayGan();
    const dayZhi = eightChar.getDayZhi();
    const timeGan = eightChar.getTimeGan();
    const timeZhi = eightChar.getTimeZhi();

    const allChars = [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, timeGan, timeZhi];

    allChars.forEach(char => {
        const wx = getCharWuxing(char);
        if (wx in wuxingCounts) wuxingCounts[wx as keyof typeof wuxingCounts]++;
    });

    const fiveElementsData = Object.entries(wuxingCounts).map(([name, value]) => ({
        name, value: value || 0.1
    }));

    // Calculate Useful Element (Simple)
    const dayMasterElement = getStemInfo(dayGan).element;
    const seasonBranch = monthZhi;
    const seasonElement = getCharWuxing(seasonBranch);
    const isStrong = dayMasterElement === seasonElement || getWuxingRelation(seasonElement, dayMasterElement) === 'produces';

    const elements = ['木', '火', '土', '金', '水'];
    const dmIdx = elements.indexOf(dayMasterElement);
    let usefulElement = '';
    if (isStrong) {
        usefulElement = elements[(dmIdx + 2) % 5]; // Wealth (Control) as primary useful for lottery (Money)
    } else {
        usefulElement = elements[(dmIdx + 4) % 5]; // Resource
    }

    // 2. Yin Yang
    let yangCount = 0;
    const yangChars = ['甲', '丙', '戊', '庚', '壬', '子', '寅', '辰', '午', '申', '戌'];
    allChars.forEach(p => {
        if (yangChars.includes(p)) yangCount++;
    });
    const yinCount = 8 - yangCount;
    const yinYangData = [
        { name: '阳', value: yangCount, fill: '#ef4444' },
        { name: '阴', value: yinCount, fill: '#3b82f6' }
    ];

    // 3. Size Distribution (Based on Numbers)
    const sizeData = [
        { name: '小 (1-11)', value: 0, fill: '#10b981' },
        { name: '中 (12-22)', value: 0, fill: '#f59e0b' },
        { name: '大 (23-33)', value: 0, fill: '#ef4444' }
    ];
    if (numbers) {
        numbers.red.forEach(n => {
            if (n <= 11) sizeData[0].value++;
            else if (n <= 22) sizeData[1].value++;
            else sizeData[2].value++;
        });
        if (numbers.blue <= 8) sizeData[0].value += 0.5;
        else sizeData[2].value += 0.5;
    }

    // 4. Ten Gods (Shi Shen)
    const tenGodsCounts: Record<string, number> = {
        '比肩': 0, '劫财': 0, '食神': 0, '伤官': 0, '偏财': 0, '正财': 0, '七杀': 0, '正官': 0, '偏印': 0, '正印': 0
    };

    [yearGan, monthGan, timeGan].forEach(stem => {
        const god = getTenGod(dayGan, stem);
        tenGodsCounts[god]++;
    });

    [yearZhi, monthZhi, dayZhi, timeZhi].forEach(zhi => {
        const hidden = getHiddenStems(zhi);
        hidden.forEach(stem => {
            const god = getTenGod(dayGan, stem);
            tenGodsCounts[god]++;
        });
    });

    const tenGodsData = Object.entries(tenGodsCounts)
        .filter(([, count]) => count > 0)
        .map(([name, value]) => ({ name, value }));

    // 4.1 Ten Gods Groups (For Radar Chart / Lines)
    const tenGodsGroups: Record<string, number> = {
        '比劫': (tenGodsCounts['比肩'] || 0) + (tenGodsCounts['劫财'] || 0),
        '食伤': (tenGodsCounts['食神'] || 0) + (tenGodsCounts['伤官'] || 0),
        '财星': (tenGodsCounts['偏财'] || 0) + (tenGodsCounts['正财'] || 0),
        '官杀': (tenGodsCounts['七杀'] || 0) + (tenGodsCounts['正官'] || 0),
        '印星': (tenGodsCounts['偏印'] || 0) + (tenGodsCounts['正印'] || 0)
    };

    const tenGodsGroupData = Object.entries(tenGodsGroups).map(([subject, count]) => ({
        subject,
        A: Math.min(100, count * 20 + 20), // Normalize for radar
        fullMark: 100
    }));

    // 5. Shen Sha (Gods and Evils)
    const shenshaList: string[] = [];
    [yearZhi, monthZhi, dayZhi, timeZhi].forEach(zhi => {
        shenshaList.push(...getShenSha(zhi, dayGan, dayZhi, yearZhi));
    });

    const shenshaCounts = shenshaList.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const shenshaCategories = ['天乙贵人', '文昌贵人', '桃花', '驿马', '太极贵人', '华盖', '将星', '禄神', '羊刃'];
    const shenshaData = shenshaCategories.map(cat => ({
        subject: cat,
        A: (shenshaCounts[cat] || 0) * 20 + 20, // Adjusted multiplier for more categories
        fullMark: 100
    }));

    // 6. Da Yun Trend (10 Years)
    const yun = eightChar.getYun(1); // Gender 1 (Male default)
    const daYunArr = yun.getDaYun();
    const daYunData = daYunArr.slice(0, 8).map((dy) => {
        const dyGan = dy.getGanZhi().substring(0, 1);
        const dyZhi = dy.getGanZhi().substring(1, 2);
        const dyGanWx = getCharWuxing(dyGan);
        const dyZhiWx = getCharWuxing(dyZhi);

        let score = 60; // Base score

        // 1. Gan Relationship
        const ganRel = getWuxingRelation(dyGanWx, dayMasterElement);
        const dayRel = getWuxingRelation(dayMasterElement, dyGanWx);

        if (ganRel === 'produces') score += 15; // Resource (Produces Me)
        else if (dayRel === 'produces') score += 5; // Output (Me produces)
        else if (dyGanWx === dayMasterElement) score += 10; // Peer (Same)
        else if (ganRel === 'controls') score -= 10; // Kill (Controls Me)
        else if (dayRel === 'controls') score += 20; // Wealth (Me controls)

        // 2. Zhi Relationship
        if (getWuxingRelation(dyZhiWx, dayMasterElement) === 'produces') score += 10;
        else if (dyZhiWx === usefulElement) score += 15;

        // 3. Useful Element Bonus
        if (dyGanWx === usefulElement) score += 15;

        // Clamp score
        score = Math.min(100, Math.max(30, score));

        return {
            name: `${dy.getStartYear()}起`,
            value: Math.round(score),
            year: dy.getGanZhi()
        };
    });

    // 7. Hexagram Prediction (New)
    const hexagramData = calculateHexagram(date, numbers);

    const endTime = performance.now();
    console.log(`[Analysis] Calculation took ${(endTime - startTime).toFixed(2)}ms`);

    return {
        fiveElementsData,
        yinYangData,
        sizeData,
        tenGodsData,
        tenGodsGroupData,
        shenshaData,
        daYunData,
        hexagramData,
        info: {
            wuxing: "五行分布显示" + (wuxingCounts['金'] > 2 ? "金气过旺" : "五行相对平衡") + "，建议关注相克数字。",
            yinyang: yangCount > yinCount ? "阳气过盛，宜选偶数或小号调和。" : "阴气主要，宜选奇数或大号提振。",
            size: "大小分布呈现" + (sizeData[2].value > 2 ? "大号偏多" : "中小号为主") + "的趋势，符合近期走势。",
            tengods: "十神中" + (tenGodsCounts['偏财'] + tenGodsCounts['正财'] > 2 ? "财星高照，" : "财星平稳，") + "映射六亲眷属关系，预示" + (usefulElement ? `喜用神为${usefulElement}，` : "") + "运势波动。",
            shensha: `命盘中出现${Object.keys(shenshaCounts).join('、') || '一般'}等神煞，` + (Object.keys(shenshaCounts).some(s => s.includes('贵')) ? "贵人相助，运势亨通。" : "平稳为主，需自强不息。"),
            dayun: "未来十年大运走势" + ((daYunData[1]?.value || 0) > 60 ? "稳步上升" : "起伏较大") + "，特别是在" + (daYunData.length > 0 ? daYunData.reduce((prev, curr) => prev.value > curr.value ? prev : curr).name : "某") + "运程中机会较多。",
            hexagram: `本卦为${hexagramData.original.name}，变卦为${hexagramData.changed.name}。${hexagramData.judgment.description}`
        }
    };
};
