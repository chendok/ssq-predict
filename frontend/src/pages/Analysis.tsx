import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import ReactECharts from 'echarts-for-react';
import { statisticsApi } from '@/api/statistics';
import { Loader2, AlertCircle, BarChart, TrendingUp, PieChart, Activity, Layers, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui/card';
import { Badge } from '@/components/common/ui/badge';
import { motion } from 'framer-motion';

interface FrequencyItem {
  number: number;
  count: number;
  tag: string;
}

interface StatisticsData {
  // Backward compatibility
  red_frequency: FrequencyItem[];
  blue_frequency: FrequencyItem[];
  hot_numbers?: {
    red: number[];
    blue: number[];
  };

  // New structure
  frequency: {
    red: FrequencyItem[];
    blue: FrequencyItem[];
  };
  odd_even: {
    ratios: Record<string, number>;
    trend: Record<string, unknown>[];
  };
  big_small: {
    ratios: Record<string, number>;
    trend: Record<string, unknown>[];
  };
  interval: {
    total_counts: { zone1: number; zone2: number; zone3: number };
    trend: Record<string, unknown>[];
  };
  consecutive_repeated: {
    consecutive_dist: Record<string, number>;
    repeated_dist: Record<string, number>;
    trend: Record<string, unknown>[];
  };
  omission: {
    red: Record<string, { current: number; max: number; avg: number }>;
    blue: Record<string, { current: number; max: number; avg: number }>;
  };
}

const Analysis: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await statisticsApi.getStatistics();
        setStats(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        setError('获取统计数据失败，请稍后重试。');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // 1. 频率分析 (Frequency)
  const getRedBarOption = () => {
    if (!stats || !stats.frequency?.red) return {};
    const data = stats.frequency.red;
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        textStyle: { color: '#fff' },
        borderColor: '#374151'
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.number),
        axisLabel: { interval: 0, color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      series: [
        {
          data: data.map((item) => item.count),
          type: 'bar',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: '#ef4444' }, { offset: 1, color: '#991b1b' }]
            },
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '60%',
        },
      ],
    };
  };

  const getBlueBarOption = () => {
    if (!stats || !stats.frequency?.blue) return {};
    const data = stats.frequency.blue;
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        textStyle: { color: '#fff' },
        borderColor: '#374151'
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.number),
        axisLabel: { color: '#9CA3AF' },
        axisLine: { lineStyle: { color: '#374151' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } }
      },
      series: [
        {
          data: data.map((item) => item.count),
          type: 'bar',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#1e3a8a' }]
            },
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '50%',
        },
      ],
    };
  };

  // 2. 奇偶比分析 (Odd/Even)
  const getOddEvenPieOption = () => {
    if (!stats || !stats.odd_even) return {};
    const data = Object.entries(stats.odd_even.ratios).map(([name, value]) => ({ name, value }));
    return {
      tooltip: { trigger: 'item' },
      legend: { top: '5%', left: 'center', textStyle: { color: '#9CA3AF' } },
      series: [
        {
          name: '奇偶比',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#1f2937', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' } },
          labelLine: { show: false },
          data: data
        }
      ]
    };
  };

  // 3. 大小比分析 (Big/Small)
  const getBigSmallPieOption = () => {
    if (!stats || !stats.big_small) return {};
    const data = Object.entries(stats.big_small.ratios).map(([name, value]) => ({ name, value }));
    return {
      tooltip: { trigger: 'item' },
      legend: { top: '5%', left: 'center', textStyle: { color: '#9CA3AF' } },
      series: [
        {
          name: '大小比',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#1f2937', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' } },
          labelLine: { show: false },
          data: data
        }
      ]
    };
  };

  // 4. 区间分布 (Interval)
  const getIntervalBarOption = () => {
    if (!stats || !stats.interval) return {};
    const { zone1, zone2, zone3 } = stats.interval.total_counts;
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['一区 (1-11)', '二区 (12-22)', '三区 (23-33)'],
        axisLabel: { color: '#9CA3AF' }
      },
      yAxis: { type: 'value', axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#374151', type: 'dashed' } } },
      series: [
        {
          data: [
            { value: zone1, itemStyle: { color: '#fbbf24' } },
            { value: zone2, itemStyle: { color: '#f59e0b' } },
            { value: zone3, itemStyle: { color: '#d97706' } }
          ],
          type: 'bar',
          barWidth: '40%',
          label: { show: true, position: 'top', color: '#fff' }
        }
      ]
    };
  };

  // 5. 连号与重号 (Consecutive & Repeated)
  const getSeqRepeatOption = () => {
    if (!stats || !stats.consecutive_repeated) return {};
    const cons = stats.consecutive_repeated.consecutive_dist;
    const reps = stats.consecutive_repeated.repeated_dist;

    // Combine data for display
    const categories = ['0连号', '1组连号', '2组连号', '0重号', '1个重号', '2个重号', '3个重号'];
    const data = [
        cons['0'] || 0, cons['1'] || 0, cons['2'] || 0,
        reps['0'] || 0, reps['1'] || 0, reps['2'] || 0, reps['3'] || 0
    ];

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#9CA3AF', interval: 0, rotate: 30 }
      },
      yAxis: { type: 'value', axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#374151', type: 'dashed' } } },
      series: [
        {
          data: data,
          type: 'bar',
          barWidth: '40%',
          itemStyle: { color: '#8b5cf6' },
          label: { show: true, position: 'top', color: '#fff' }
        }
      ]
    };
  };

  // 6. 遗漏值分析 (Omission)
  const getOmissionOption = () => {
    if (!stats || !stats.omission) return {};
    const redStats = stats.omission.red;
    const numbers = Object.keys(redStats).map(Number).sort((a, b) => a - b);

    // Sort logic to make sure keys are valid numbers
    const sortedNumbers = numbers.filter(n => !isNaN(n));

    return {
      tooltip: {
          trigger: 'axis',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (params: any) => {
             // params is array of series data
             if (!params || params.length < 2) return '';
             const num = params[0].name;
             const current = params[0].value;
             const max = params[1].value;
             return `号码: ${num}<br/>当前遗漏: ${current}<br/>历史最大遗漏: ${max}`;
          }
      },
      legend: { data: ['当前遗漏', '最大遗漏'], textStyle: { color: '#9CA3AF' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: sortedNumbers,
        axisLabel: { color: '#9CA3AF' }
      },
      yAxis: { type: 'value', axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#374151', type: 'dashed' } } },
      series: [
        {
          name: '当前遗漏',
          type: 'bar',
          data: sortedNumbers.map(n => redStats[n].current),
          itemStyle: { color: '#10b981' }
        },
        {
          name: '最大遗漏',
          type: 'bar',
          data: sortedNumbers.map(n => redStats[n].max),
          itemStyle: { color: '#059669', opacity: 0.5 }
        }
      ]
    };
  };

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">数据分析</h1>
          <p className="text-muted-foreground mt-1">基于历史大数据的 6 种核心分析方法深度挖掘</p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <span className="text-muted-foreground animate-pulse">正在分析历史数据...</span>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg flex items-center justify-center text-destructive">
             <AlertCircle className="mr-2 h-5 w-5" />
             <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. 频率统计法 */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="h-full border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart className="h-5 w-5 text-ball-red" />
                      <span>1. 红球频率统计 (热/冷号)</span>
                    </CardTitle>
                    <CardDescription>红球 1-33 号码历史出现次数与热度分析</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={getRedBarOption()} style={{ height: '300px', width: '100%' }} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="h-full border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart className="h-5 w-5 text-ball-blue" />
                      <span>蓝球频率统计</span>
                    </CardTitle>
                    <CardDescription>蓝球 1-16 号码历史出现次数统计</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={getBlueBarOption()} style={{ height: '300px', width: '100%' }} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 2 & 3. 奇偶比 & 大小比 */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="h-full border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5 text-purple-500" />
                      <span>2. 奇偶比分析</span>
                    </CardTitle>
                    <CardDescription>红球奇偶数量配比分布 (奇数:偶数)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={getOddEvenPieOption()} style={{ height: '300px', width: '100%' }} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="h-full border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5 text-indigo-500" />
                      <span>3. 大小比分析</span>
                    </CardTitle>
                    <CardDescription>红球大小号分布 (小号:1-16, 大号:17-33)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={getBigSmallPieOption()} style={{ height: '300px', width: '100%' }} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 4 & 5. 区间分布 & 连号重号 */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="h-full border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Layers className="h-5 w-5 text-amber-500" />
                      <span>4. 区间分布分析 (三区)</span>
                    </CardTitle>
                    <CardDescription>一区(1-11)、二区(12-22)、三区(23-33)出号统计</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={getIntervalBarOption()} style={{ height: '300px', width: '100%' }} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card className="h-full border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Hash className="h-5 w-5 text-emerald-500" />
                      <span>5. 连号与重号分析</span>
                    </CardTitle>
                    <CardDescription>连号(相邻号)与重号(重复上期)出现频次</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={getSeqRepeatOption()} style={{ height: '300px', width: '100%' }} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 6. 遗漏值分析 & 热门推荐 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-rose-500" />
                      <span>6. 遗漏值分析 (核心指标)</span>
                    </CardTitle>
                    <CardDescription>红球当前遗漏 vs 历史最大遗漏 (寻找回补机会)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={getOmissionOption()} style={{ height: '400px', width: '100%' }} />
                  </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <Card className="border-border/50 shadow-md bg-gradient-to-br from-card to-secondary/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>热门号码推荐 (基于频率统计)</span>
                  </CardTitle>
                  <CardDescription>根据近期冷热趋势智能筛选的高频号码</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-secondary/30 p-6 rounded-xl border border-border/50">
                      <h3 className="text-ball-red font-bold mb-4 flex items-center text-lg">
                        <span className="text-xl mr-2">🔥</span> 红球热号
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {stats?.hot_numbers?.red?.map((num: number) => (
                          <Badge
                            key={num}
                            variant="red"
                            className="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold shadow-lg shadow-ball-red/20"
                          >
                            {num}
                          </Badge>
                        )) || <span className="text-muted-foreground">暂无数据</span>}
                      </div>
                    </div>
                    <div className="bg-secondary/30 p-6 rounded-xl border border-border/50">
                      <h3 className="text-ball-blue font-bold mb-4 flex items-center text-lg">
                        <span className="text-xl mr-2">💎</span> 蓝球热号
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {stats?.hot_numbers?.blue?.map((num: number) => (
                          <Badge
                            key={num}
                            variant="blue"
                            className="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold shadow-lg shadow-ball-blue/20"
                          >
                            {num}
                          </Badge>
                        )) || <span className="text-muted-foreground">暂无数据</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analysis;
