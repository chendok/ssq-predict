import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui/card';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { Activity, Zap, Shield, TrendingUp, Info, AlertCircle } from 'lucide-react';
import { calculateAnalysisData } from '@/lib/traditionalAnalysis';
import { traditionalApi } from '@/api/traditional';
import NobleYearlyChart, { NobleStarData } from './NobleYearlyChart';
import { format } from 'date-fns';

interface DashboardProps {
  date?: Date; // The date of prediction
  numbers?: { red: number[], blue: number }; // The predicted numbers for "Size Distribution"
}

// Helper to generate chart data and analysis
const useAnalysisData = (date: Date, numbers?: { red: number[], blue: number }) => {
  return useMemo(() => {
    try {
      return calculateAnalysisData(date, numbers);
    } catch (error) {
      console.error("[Dashboard] Failed to calculate analysis data:", error);
      // Return a safe fallback
      return {
        fiveElementsData: [],
        yinYangData: [],
        sizeData: [],
        tenGodsData: [],
        tenGodsGroupData: [],
        shenshaData: [],
        daYunData: [],
        hexagramData: {
            original: { name: '加载中...', upper: 1, lower: 1, element_relation: '' },
            changed: { name: '加载中...', upper: 1, lower: 1, element_relation: '' },
            nuclear: { name: '加载中...', upper: 1, lower: 1, element_relation: '' },
            movingLine: 0,
            judgment: { score: 60, summary: '暂无', description: '数据加载中...' }
        },
        info: {
          wuxing: "数据加载中...",
          yinyang: "数据加载中...",
          size: "数据加载中...",
          tengods: "数据加载中...",
          shensha: "数据加载中...",
          dayun: "数据加载中...",
          hexagram: "数据加载中..."
        }
      };
    }
  }, [date, numbers]);
};

const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#ef4444', '#a855f7']; // Gold, Wood, Water, Fire, Earth colors approx
const TEN_GODS_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

// Simple Trigram Line Mapping (Bottom to Top)
const TRIGRAM_BITS: Record<number, number[]> = {
  1: [1, 1, 1], // Qian
  2: [1, 1, 0], // Dui
  3: [1, 0, 1], // Li
  4: [1, 0, 0], // Zhen
  5: [0, 1, 1], // Xun
  6: [0, 1, 0], // Kan
  7: [0, 0, 1], // Gen
  8: [0, 0, 0]  // Kun
};

interface HexagramRenderProps {
  upper: number;
  lower: number;
  movingLine?: number; // 1-6
  size?: number;
}

const HexagramRender: React.FC<HexagramRenderProps> = ({ upper, lower, movingLine, size = 60 }) => {
  if (!upper || !lower) return null;
  // Combine lines: Lower Trigram (lines 1-3) + Upper Trigram (lines 4-6)
  // Our TRIGRAM_BITS is bottom-to-top [line1, line2, line3]
  const lines = [...(TRIGRAM_BITS[lower] || []), ...(TRIGRAM_BITS[upper] || [])];

  return (
    <div className="flex flex-col-reverse gap-1.5" style={{ width: size }}>
      {lines.map((bit, idx) => {
        const lineNum = idx + 1; // 1-based index from bottom
        const isMoving = lineNum === movingLine;

        return (
          <div key={idx} className="relative flex items-center justify-center h-3 group">
             {/* Moving Dot Indicator */}
            {isMoving && (
               <div className="absolute -left-4 w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            )}

            {/* Line Drawing */}
            {bit === 1 ? (
              // Yang Line (Solid)
              <div className={`w-full h-full bg-primary rounded-sm transition-opacity ${isMoving ? 'opacity-80' : 'opacity-100'}`} />
            ) : (
              // Yin Line (Broken)
              <div className={`w-full h-full flex justify-between transition-opacity ${isMoving ? 'opacity-80' : 'opacity-100'}`}>
                <div className="w-[42%] h-full bg-primary rounded-sm" />
                <div className="w-[42%] h-full bg-primary rounded-sm" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TraditionalAnalysisDashboard: React.FC<DashboardProps> = ({ date = new Date(), numbers }) => {
  const { fiveElementsData, yinYangData, sizeData, tenGodsData, tenGodsGroupData, hexagramData, info } = useAnalysisData(date, numbers);
  const [chartsReady, setChartsReady] = useState(false);

  // Backend Shen Sha state
  const [nobleStars, setNobleStars] = useState<NobleStarData[]>([]);
  const [yearlySha, setYearlySha] = useState<NobleStarData[]>([]);
  const [godsShaLoading, setGodsShaLoading] = useState(false);
  const [godsShaError, setGodsShaError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Implement deferred rendering to fix measurement issues in animated containers
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [date, numbers]);

  // Fetch Backend Shen Sha Data
  useEffect(() => {
    const fetchGodsSha = async () => {
      setGodsShaLoading(true);
      setGodsShaError(false);
      try {
        const dateStr = format(date, 'yyyy-MM-dd HH:mm:ss');
        // Ensure promises are handled even if one fails
        const results = await Promise.allSettled([
          traditionalApi.getNobleStars(dateStr),
          traditionalApi.getYearlySha(dateStr)
        ]);

        const nobleRes = results[0];
        const yearlyRes = results[1];

        let hasError = false;

        if (nobleRes.status === 'fulfilled') setNobleStars(nobleRes.value.data.nobleStars || []);
        else hasError = true;

        if (yearlyRes.status === 'fulfilled') {
             setYearlySha(yearlyRes.value.data.yearlySha || []);
        } else hasError = true;

        if (hasError) {
             throw new Error("Partial data load failure");
        }

      } catch (err) {
        console.error("[Dashboard] Failed to fetch gods and sha data:", err);
        setGodsShaError(true);
        if (retryCount < 2) {
            setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        }
      } finally {
        setGodsShaLoading(false);
      }
    };

    if (chartsReady) {
      fetchGodsSha();
    }
  }, [date, chartsReady, retryCount]);

  const renderEmptyState = (title: string, error?: boolean) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
      <AlertCircle className={`w-8 h-8 mb-2 opacity-20 ${error ? 'text-destructive opacity-50' : ''}`} />
      <p className="text-xs">{error ? `${title}数据加载失败` : `暂无${title}数据`}</p>
      {error && (
        <button
          onClick={() => setRetryCount(0)}
          className="mt-2 text-xs text-primary underline hover:text-primary/80"
        >
          重试
        </button>
      )}
    </div>
  );

  const renderSkeleton = () => (
      <div className="flex-1 h-full min-h-[200px] animate-pulse bg-secondary/10 rounded-lg flex items-center justify-center">
          <div className="h-4 w-24 bg-secondary/20 rounded"></div>
      </div>
  );

  if (!chartsReady) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="h-[400px] animate-pulse">
            <div className="h-full bg-secondary/20 rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">传统术数深度仪表板</h2>
        </div>

        {/* Row 1: Core Analysis (Five Elements, YinYang, Size) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Five Elements */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">五行能量分布</CardTitle>
                    <CardDescription>金木水火土生克关系</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px] flex flex-col">
                    <div className="flex-1 h-[200px]">
                        {fiveElementsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fiveElementsData}
                                        cx="50%" cy="50%"
                                        innerRadius={40} outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {fiveElementsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : renderEmptyState("五行")}
                    </div>
                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                        <h4 className="text-xs font-semibold text-primary mb-1 flex items-center">
                            <Info className="w-3 h-3 mr-1" /> 能量解读
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {info.wuxing}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Yin Yang */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">阴阳平衡分析</CardTitle>
                    <CardDescription>乾坤调和度评估</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px] flex flex-col">
                    <div className="flex-1 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={yinYangData}
                                    cx="50%" cy="50%"
                                    startAngle={180} endAngle={0}
                                    innerRadius={50} outerRadius={80}
                                    dataKey="value"
                                >
                                    {yinYangData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                         <h4 className="text-xs font-semibold text-primary mb-1 flex items-center">
                            <Info className="w-3 h-3 mr-1" /> 平衡建议
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {info.yinyang}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Size Distribution */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">大小吉凶格局</CardTitle>
                    <CardDescription>号码数值区间分布</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px] flex flex-col">
                    <div className="flex-1 h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sizeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <YAxis tick={{fontSize: 10}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {sizeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                         <h4 className="text-xs font-semibold text-primary mb-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> 趋势预测
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {info.size}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Row 2: Extended Analysis (Ten Gods, Shen Sha, Da Yun) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 4. Ten Gods (Pie Chart & Radar for Relations) */}
            <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">十神分布图谱</CardTitle>
                    <CardDescription>六亲眷属关系映射</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col min-h-[320px]">
                     <div className="flex-1 h-[220px] grid grid-cols-2 gap-2">
                        {tenGodsData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={tenGodsData}
                                            cx="50%" cy="50%"
                                            innerRadius={30}
                                            outerRadius={50}
                                            dataKey="value"
                                            labelLine={false}
                                        >
                                            {tenGodsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={TEN_GODS_COLORS[index % TEN_GODS_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={tenGodsGroupData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                                        <Radar name="关系强度" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </>
                        ) : renderEmptyState("十神")}
                    </div>
                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                         <h4 className="text-xs font-semibold text-primary mb-1 flex items-center">
                            <Zap className="w-3 h-3 mr-1" /> 财运解析
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {info.tengods}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 5. Shen Sha (ECharts for Noble/Yearly) */}
            <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">神煞吉凶分析</CardTitle>
                    <CardDescription>贵人与流年神煞影响</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col min-h-[320px]">
                        {godsShaLoading ? renderSkeleton() : (
                            nobleStars.length > 0 ? (
                                <NobleYearlyChart
                                    nobleStars={nobleStars}
                                    yearlySha={yearlySha}
                                    loading={false}
                                />
                            ) : renderEmptyState("神煞", godsShaError && nobleStars.length === 0)
                        )}
                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                         <h4 className="text-xs font-semibold text-primary mb-1 flex items-center">
                            <Shield className="w-3 h-3 mr-1" /> 吉凶提示
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {info.shensha}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 6. Hexagram Analysis (I-Ching / Mei Hua Yi Shu) */}
            <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">周易六十四卦运势</CardTitle>
                    <CardDescription>皇极经世时空推演</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col min-h-[320px]">
                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                        <div className="flex items-center justify-center w-full space-x-6">
                            {/* Original Hexagram */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground mb-2">本卦</span>
                                <div className="bg-secondary/20 p-2 rounded-lg border border-border/50">
                                    <HexagramRender
                                        upper={hexagramData?.original.upper}
                                        lower={hexagramData?.original.lower}
                                        movingLine={hexagramData?.movingLine}
                                        size={48}
                                    />
                                </div>
                                <span className="text-sm font-bold mt-2 text-primary">{hexagramData?.original.name || '未知'}</span>
                            </div>

                            {/* Transition Arrow */}
                            <div className="flex flex-col items-center text-muted-foreground/30">
                                <span className="text-[10px] mb-1">变</span>
                                <TrendingUp className="w-5 h-5" />
                            </div>

                            {/* Changed Hexagram */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-muted-foreground mb-2">变卦</span>
                                <div className="bg-secondary/20 p-2 rounded-lg border border-border/50">
                                    <HexagramRender
                                        upper={hexagramData?.changed.upper}
                                        lower={hexagramData?.changed.lower}
                                        size={48}
                                    />
                                </div>
                                <span className="text-sm font-bold mt-2 text-primary">{hexagramData?.changed.name || '未知'}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center space-x-2 text-[10px] text-muted-foreground bg-secondary/10 px-3 py-1 rounded-full">
                            <span>互卦: {hexagramData?.nuclear.name}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>动爻: {hexagramData?.movingLine ? `第${hexagramData.movingLine}爻` : '无'}</span>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-primary flex items-center">
                                <Activity className="w-3 h-3 mr-1" /> 卦象判词
                            </h4>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                (hexagramData?.judgment.score || 0) >= 80 ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                (hexagramData?.judgment.score || 0) <= 40 ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                            }`}>
                                {hexagramData?.judgment.summary || '平'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {hexagramData?.judgment.description || '暂无详细解卦数据'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default TraditionalAnalysisDashboard;
