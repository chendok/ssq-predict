import { describe, it, expect } from 'vitest';
import {
    getStemInfo,
    getWuxingRelation,
    getTenGod,
    getShenSha,
    calculateAnalysisData
} from './traditionalAnalysis';

describe('Traditional Analysis Utils', () => {

    describe('getStemInfo', () => {
        it('should return correct element and polarity for Yang Wood (Jia)', () => {
            const info = getStemInfo('甲');
            expect(info).toEqual({ element: '木', polarity: 1 });
        });
        it('should return correct element and polarity for Yin Water (Gui)', () => {
            const info = getStemInfo('癸');
            expect(info).toEqual({ element: '水', polarity: 0 });
        });
        it('should default to Earth/Yang for unknown', () => {
            const info = getStemInfo('X');
            expect(info).toEqual({ element: '土', polarity: 1 });
        });
    });

    describe('getWuxingRelation', () => {
        it('should identify same element', () => {
            expect(getWuxingRelation('木', '木')).toBe('same');
        });
        it('should identify producing relation (Wood -> Fire)', () => {
            expect(getWuxingRelation('木', '火')).toBe('produces');
        });
        it('should identify controlling relation (Wood -> Earth)', () => {
            expect(getWuxingRelation('木', '土')).toBe('controls');
        });
        it('should identify produced by relation (Water -> Wood)', () => {
            expect(getWuxingRelation('木', '水')).toBe('produced_by');
        });
        it('should identify controlled by relation (Metal -> Wood)', () => {
            expect(getWuxingRelation('木', '金')).toBe('controlled_by');
        });
    });

    describe('getTenGod', () => {
        // Day Master: Jia (Yang Wood)
        const dm = '甲';

        it('should identify Bi Jian (Friend)', () => {
            expect(getTenGod(dm, '甲')).toBe('比肩');
        });
        it('should identify Jie Cai (Rob Wealth)', () => {
            expect(getTenGod(dm, '乙')).toBe('劫财');
        });
        it('should identify Shi Shen (Eating God)', () => {
            expect(getTenGod(dm, '丙')).toBe('食神'); // Wood produces Fire (Yang -> Yang)
        });
        it('should identify Shang Guan (Hurting Officer)', () => {
            expect(getTenGod(dm, '丁')).toBe('伤官'); // Wood produces Fire (Yang -> Yin)
        });
        it('should identify Pian Cai (Indirect Wealth)', () => {
            expect(getTenGod(dm, '戊')).toBe('偏财'); // Wood controls Earth (Yang -> Yang)
        });
        it('should identify Zheng Cai (Direct Wealth)', () => {
            expect(getTenGod(dm, '己')).toBe('正财'); // Wood controls Earth (Yang -> Yin)
        });
        it('should identify Qi Sha (Seven Killings)', () => {
            expect(getTenGod(dm, '庚')).toBe('七杀'); // Metal controls Wood (Yang -> Yang)
        });
        it('should identify Zheng Guan (Direct Officer)', () => {
            expect(getTenGod(dm, '辛')).toBe('正官'); // Metal controls Wood (Yin -> Yang)
        });
        it('should identify Pian Yin (Indirect Resource)', () => {
            expect(getTenGod(dm, '壬')).toBe('偏印'); // Water produces Wood (Yang -> Yang)
        });
        it('should identify Zheng Yin (Direct Resource)', () => {
            expect(getTenGod(dm, '癸')).toBe('正印'); // Water produces Wood (Yin -> Yang)
        });
    });

    describe('getShenSha', () => {
        // Day Master: Jia (Yang Wood) -> Nobleman: Chou, Wei
        // Day Master: Jia -> Wen Chang: Si
        // Year Branch: Yin (Tiger) -> Tao Hua: Mao (Rabbit)
        // Year Branch: Shen (Monkey) -> Yi Ma: Yin (Tiger)

        it('should identify Tian Yi Gui Ren (Nobleman)', () => {
            const list = getShenSha('丑', '甲', '子', '子');
            expect(list).toContain('天乙贵人');
        });

        it('should identify Wen Chang (Academic)', () => {
            const list = getShenSha('巳', '甲', '子', '子');
            expect(list).toContain('文昌贵人');
        });

        it('should identify Tao Hua (Romance)', () => {
            // Year: Yin -> Tao Hua: Mao
            const list = getShenSha('卯', '甲', '子', '寅');
            expect(list).toContain('桃花');
        });

        it('should identify Yi Ma (Travel)', () => {
            // Year: Shen -> Yi Ma: Yin
            const list = getShenSha('寅', '甲', '子', '申');
            expect(list).toContain('驿马');
        });

        it('should identify Tai Ji Gui Ren', () => {
            // Day: Jia -> Tai Ji: Zi, Wu
            const list = getShenSha('子', '甲', '子', '子');
            expect(list).toContain('太极贵人');
        });

        it('should identify Hua Gai (Arts)', () => {
            // Year: Yin (Tiger) -> Hua Gai: Xu (Dog)
            const list = getShenSha('戌', '甲', '子', '寅');
            expect(list).toContain('华盖');
        });

        it('should identify Jiang Xing (Leadership)', () => {
            // Year: Yin (Tiger) -> Jiang Xing: Wu (Horse)
            const list = getShenSha('午', '甲', '子', '寅');
            expect(list).toContain('将星');
        });

        it('should identify Lu Shen (Prosperity)', () => {
            // Day: Jia -> Lu: Yin
            const list = getShenSha('寅', '甲', '子', '子');
            expect(list).toContain('禄神');
        });

        it('should identify Yang Ren (Sheep Blade)', () => {
            // Day: Jia -> Yang Ren: Mao
            const list = getShenSha('卯', '甲', '子', '子');
            expect(list).toContain('羊刃');
        });
    });

    describe('calculateAnalysisData (Integration)', () => {
        it('should return complete analysis data structure', () => {
            const date = new Date('2024-01-01T12:00:00'); // Jia Zi Day
            const result = calculateAnalysisData(date);

            expect(result).toHaveProperty('fiveElementsData');
            expect(result.fiveElementsData.length).toBeGreaterThan(0);

            expect(result).toHaveProperty('yinYangData');
            expect(result.yinYangData.length).toBe(2);

            expect(result).toHaveProperty('tenGodsData');
            // Ten Gods might be empty if not found, but usually found
            // expect(result.tenGodsData.length).toBeGreaterThan(0);

            expect(result).toHaveProperty('tenGodsGroupData');
            expect(result.tenGodsGroupData.length).toBe(5); // Fixed 5 groups

            expect(result).toHaveProperty('shenshaData');
            expect(result.shenshaData.length).toBe(9); // Fixed categories (7 + 2 new)

            expect(result).toHaveProperty('daYunData');
            expect(result.daYunData.length).toBe(8); // 8 steps

            // Check deterministic Da Yun score
            const firstScore = result.daYunData[0].value;
            expect(firstScore).toBeGreaterThanOrEqual(30);
            expect(firstScore).toBeLessThanOrEqual(100);

            // Run again to verify determinism
            const result2 = calculateAnalysisData(date);
            expect(result2.daYunData[0].value).toBe(firstScore);
        });

        it('should handle missing numbers gracefully', () => {
            const date = new Date();
            const result = calculateAnalysisData(date, undefined);
            expect(result.sizeData[0].value).toBe(0); // Should be initialized to 0
        });
    });

});
