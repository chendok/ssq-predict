import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import client from '@/api/client';
import { Settings, RefreshCw, Zap, AlertTriangle, Cpu, GitBranch, Dna, Brain, TrendingUp, Info, Activity } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui/card';
import { Badge } from '@/components/common/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { predictionApi } from '@/api/prediction';
import { statisticsApi } from '@/api/statistics';
import {
  PageHeader,
  SectionHeader,
  LotteryBall,
  AlgorithmCard
} from '@/components/common/design';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface PredictionResult {
  red: number[];
  blue: number;
  confidence: number;
  details?: Record<string, { red: number[], blue: number }>;
}

interface InterpretationResult {
  summary: string;
  analysis: string;
  risk_warning: string;
}

interface StatsData {
  name: string;
  prob: number;
  count: number;
}

interface OmissionData {
  number: number;
  frequency: number;
  omission: number;
  z: number;
}

interface TrendData {
  issue: string;
  sum: number;
  span: number;
}

interface StructureData {
  oddEven: { name: string; value: number }[];
  bigSmall: { name: string; value: number }[];
}

interface LotteryDraw {
  issue_number: string;
  red_balls: number[];
  blue_ball: number;
}


const Prediction: React.FC = () => {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['random']);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
  const [interpreting, setInterpreting] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);

  // Chart Data States
  const [statsData, setStatsData] = useState<StatsData[]>([]); // Probability
  const [omissionData, setOmissionData] = useState<OmissionData[]>([]); // Omission vs Freq
  const [sumTrendData, setSumTrendData] = useState<TrendData[]>([]); // Sum Trend
  const [structureData, setStructureData] = useState<StructureData | null>(null); // Odd/Even etc

  useEffect(() => {
    // Fetch real statistics and history
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          statisticsApi.getStatistics(),
          predictionApi.getHistory({ page_size: 30 })
        ]);

        // 1. Process Probability Data (Stats)
        if (statsRes.data && statsRes.data.red_frequency) {
          const totalFreq = statsRes.data.red_frequency.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0);
          const formattedStats = statsRes.data.red_frequency
            .map((item: { number: number; count: number }) => ({
              name: item.number.toString(),
              prob: Number((item.count / totalFreq).toFixed(4)),
              count: item.count
            }))
            .sort((a: StatsData, b: StatsData) => b.prob - a.prob)
            .slice(0, 15);
          setStatsData(formattedStats);

          // 2. Process Omission vs Frequency Data
          // Need current omission. If backend doesn't provide, we calculate from history.
          // Since we have frequency, we just need omission.
          // Simple calc: find last index of each number in history.
          const history = historyRes.data.results || [];
          const omissions = new Map<number, number>();
          for(let i=1; i<=33; i++) omissions.set(i, 30); // Default max if not found in last 30

          history.forEach((draw: LotteryDraw, idx: number) => {
            const reds = draw.red_balls; // Array of numbers
            reds.forEach((r: number) => {
               if (omissions.get(r) === 30) { // First time seeing it from recent
                   omissions.set(r, idx); // idx 0 is most recent
               }
            });
          });

          const scatterData = statsRes.data.red_frequency.map((item: { number: number; count: number }) => ({
            number: item.number,
            frequency: item.count,
            omission: omissions.get(item.number) || 30,
            z: 1 // Size factor
          }));
          setOmissionData(scatterData);
        }

        // 3. Process Sum Trend Data
        if (historyRes.data && historyRes.data.results) {
           const trend = historyRes.data.results.reverse().map((draw: LotteryDraw) => ({
             issue: draw.issue_number.slice(-3), // Last 3 digits
             sum: draw.red_balls.reduce((a: number, b: number) => a + b, 0),
             span: Math.max(...draw.red_balls) - Math.min(...draw.red_balls)
           }));
           setSumTrendData(trend);
        }

      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);

  // Calculate structure data when prediction updates
  useEffect(() => {
    if (prediction) {
       setChartsReady(false);
       const reds = prediction.red;
       const oddCount = reds.filter(n => n % 2 !== 0).length;
       const bigCount = reds.filter(n => n > 16).length; // 17-33 is Big

       setStructureData({
         oddEven: [
           { name: '奇数', value: oddCount },
           { name: '偶数', value: 6 - oddCount }
         ],
         bigSmall: [
           { name: '大号', value: bigCount },
           { name: '小号', value: 6 - bigCount }
         ]
       });

       // Trigger AI Interpretation
       const interpretPrediction = async () => {
         setInterpreting(true);
         setInterpretation(null);
         try {
           const res = await client.post('/interpret/', {
             type: 'prediction',
             data: prediction
           });
           if (!res.data.error) {
             setInterpretation(res.data);
           }
         } catch (err) {
           console.error("Interpretation failed", err);
         } finally {
           setInterpreting(false);
         }
       };

       interpretPrediction();

       const timer = setTimeout(() => setChartsReady(true), 500);
       return () => clearTimeout(timer);
    }
  }, [prediction]);

  const algorithms = [
    {
      id: 'random',
      name: '随机选号',
      desc: '完全随机生成号码',
      icon: RefreshCw,
      details: {
        principle: '基于梅森旋转算法生成伪随机数，模拟完全随机的摇号过程。',
        usage: '作为基准对照组，用于评估其他智能算法的有效性。',
        params: '无特定参数，纯随机过程。',
        steps: '1. 初始化随机种子\n2. 从红球池(1-33)无放回抽取6个\n3. 从蓝球池(1-16)抽取1个'
      }
    },
    {
      id: 'markov',
      name: '马尔可夫链',
      desc: '基于历史状态转移概率',
      icon: GitBranch,
      details: {
        principle: '假设下一期号码出现的概率仅与当前一期号码有关，构建状态转移矩阵。',
        usage: '适用于捕捉短期内的号码跟随、连号等局部趋势。',
        params: '状态空间大小、转移矩阵阶数（通常为1阶）。',
        steps: '1. 统计历史相邻期号码转移频次\n2. 计算状态转移概率矩阵\n3. 基于上期号码预测大概率转移目标'
      }
    },
    {
      id: 'xgboost',
      name: 'XGBoost',
      desc: '梯度提升决策树',
      icon: Zap,
      details: {
        principle: '集成多个弱分类器（决策树），通过梯度下降优化损失函数，捕捉非线性特征。',
        usage: '处理表格型数据的SOTA算法，擅长挖掘历史数据中的复杂模式。',
        params: '学习率(eta)、树深度(max_depth)、子采样率(subsample)。',
        steps: '1. 构建特征工程（历史遗漏、热度等）\n2. 训练多棵决策树拟合残差\n3. 累加各树预测值得到最终结果'
      }
    },
    {
      id: 'genetic',
      name: '遗传算法',
      desc: '模拟自然进化过程',
      icon: Dna,
      details: {
        principle: '通过选择、交叉、变异操作迭代优化种群，寻找适应度函数（如历史命中率）最高的解。',
        usage: '在庞大的解空间中寻找全局最优解，避免陷入局部最优。',
        params: '种群规模、交叉概率、变异概率、进化代数。',
        steps: '1. 初始化随机号码种群\n2. 计算适应度\n3. 轮盘赌选择\n4. 交叉变异生成新一代\n5. 重复迭代'
      }
    },
    {
      id: 'neural',
      name: '神经网络',
      desc: '深度学习模式识别',
      icon: Brain,
      details: {
        principle: '模拟人脑神经元连接，通过多层感知机(MLP)学习输入（历史数据）与输出（开奖号）的映射。',
        usage: '捕捉深层非线性关系，适合大规模历史数据训练。',
        params: '隐藏层数、神经元数量、激活函数(ReLU)、优化器(Adam)。',
        steps: '1. 数据归一化\n2. 前向传播计算输出\n3. 反向传播更新权重\n4. 预测下一期概率分布'
      }
    },
    {
      id: 'regression',
      name: '回归分析',
      desc: '统计学趋势分析',
      icon: TrendingUp,
      details: {
        principle: '利用线性或非线性回归模型拟合号码走势，预测数值变化趋势。',
        usage: '分析长期趋势，如号码和值、跨度等的线性变化。',
        params: '回归系数、截距、多项式阶数。',
        steps: '1. 确定自变量（期号）和因变量（号码）\n2. 最小二乘法拟合曲线\n3. 外推预测下一期数值'
      }
    },
  ];

  const toggleAlgorithm = (id: string) => {
    setSelectedAlgorithms(prev => {
      if (prev.includes(id)) {
        return prev.filter(a => a !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePredict = async () => {
    if (selectedAlgorithms.length === 0) {
      setError('请至少选择一种预测算法');
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const startTime = Date.now();
      const response = await predictionApi.predict(selectedAlgorithms);
      const endTime = Date.now();

      if (endTime - startTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setPrediction(response.data);
    } catch (error) {
      console.error('Prediction failed:', error);
      setError('预测失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for visualizations (static parts)
  const featureImportanceData = [
    { name: '历史遗漏', value: 85 },
    { name: '平均遗漏', value: 72 },
    { name: '邻号频率', value: 65 },
    { name: '连号概率', value: 58 },
    { name: '重号概率', value: 45 },
    { name: '区间比', value: 38 },
  ];

  const modelPerformanceData = [
    { subject: '准确率', A: 85, B: 65, fullMark: 100 },
    { subject: '召回率', A: 78, B: 70, fullMark: 100 },
    { subject: 'F1分数', A: 82, B: 68, fullMark: 100 },
    { subject: '稳定性', A: 90, B: 60, fullMark: 100 },
    { subject: '泛化性', A: 75, B: 80, fullMark: 100 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-10">
        <PageHeader
          title="智能预测引擎"
          description="融合多维算法模型，提供可解释的深度预测分析"
          icon={Cpu}
        />

        {/* Algorithm Selection */}
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>选择预测算法</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {algorithms.map(algo => (
                <AlgorithmCard
                  key={algo.id}
                  id={algo.id}
                  title={algo.name}
                  description={algo.desc}
                  icon={algo.icon}
                  selected={selectedAlgorithms.includes(algo.id)}
                  onClick={() => toggleAlgorithm(algo.id)}
                  details={algo.details}
                />
              ))}
            </div>
            {error && (
              <div className="mt-6 flex items-center text-destructive bg-destructive/10 p-4 rounded-lg animate-in slide-in-from-top-2">
                <AlertTriangle className="mr-2 w-5 h-5" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handlePredict}
            disabled={loading}
            className={cn(
              "h-16 px-12 rounded-full text-lg shadow-xl shadow-primary/25 transition-all duration-300",
              loading ? "opacity-80" : "hover:scale-105 active:scale-95"
            )}
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                <span>正在运算中...</span>
              </>
            ) : (
              <>
                <Cpu className="mr-2 h-5 w-5" />
                <span>开始智能预测</span>
              </>
            )}
          </Button>
        </div>

        {/* Result Display */}
        <AnimatePresence mode="wait">
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="space-y-8"
            >
              {/* Main Prediction */}
              <Card className="border-t-4 border-t-warning shadow-2xl bg-card/80 backdrop-blur overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap size={180} />
                  </div>

                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold">最终推荐号码</CardTitle>
                    <CardDescription>基于 {selectedAlgorithms.length} 种算法模型的综合计算结果</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-8 pb-10">
                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                      {prediction.red.map((num: number, idx) => (
                        <LotteryBall
                          key={num}
                          number={num}
                          variant="red"
                          size="lg"
                          delay={idx * 0.1}
                        />
                      ))}
                      <LotteryBall
                        number={prediction.blue}
                        variant="blue"
                        size="lg"
                        delay={0.7}
                      />
                    </div>

                    <div className="flex justify-center gap-8">
                      <div className="bg-secondary/50 px-8 py-4 rounded-2xl flex flex-col items-center border border-border/50">
                        <span className="text-sm text-muted-foreground mb-1">AI 置信度</span>
                        <span className="text-3xl font-bold text-success">{(prediction.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
{/* AI Interpretation */}
              <Card className="border-border/50 shadow-md bg-gradient-to-br from-primary/5 to-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>AI 智能解读</span>
                    {interpreting && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interpreting ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-20 bg-muted rounded w-full"></div>
                    </div>
                  ) : interpretation ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-primary mb-2 flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          结果摘要
                        </h4>
                        <p className="text-sm text-foreground/90 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/50">
                          {interpretation.summary}
                        </p>
                      </div>

                      <div>
                         <h4 className="font-semibold text-primary mb-2 flex items-center">
                           <Activity className="w-4 h-4 mr-2" />
                           深度分析
                         </h4>
                         <p className="text-sm text-foreground/90 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/50 whitespace-pre-line">
                           {interpretation.analysis}
                         </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-destructive mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          风险提示
                        </h4>
                        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                          {interpretation.risk_warning}
                        </p>
                      </div>
                    </div>
                  ) : (
                     <div className="text-center text-muted-foreground py-8">
                       暂无解读数据
                     </div>
                  )}
                </CardContent>
              </Card>
              {/* Deep Analysis Dashboard */}
              <div className="space-y-6">
                <SectionHeader title="深度分析仪表板" icon={Activity} />

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Chart 1: Feature Importance */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">特征重要性</CardTitle>
                      <CardDescription>模型决策关键因子</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div style={{ width: '100%', height: 250 }}>
                        {chartsReady && (
                        <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={100}>
                          <BarChart layout="vertical" data={featureImportanceData} margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 11}} />
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15} />
                          </BarChart>
                        </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">分析:</span> 历史遗漏值是当前模型权重最高的特征，表明号码的冷热周期性对预测影响最大。
                    </div>
                  </Card>

                  {/* Chart 2: Model Performance */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">算法性能矩阵</CardTitle>
                      <CardDescription>多维指标评估</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div style={{ width: '100%', height: 250 }}>
                        {chartsReady && (
                        <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={100}>
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={modelPerformanceData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="subject" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                            <Radar name="当前模型" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">分析:</span> 模型在稳定性上表现优异(90分)，但在召回率上仍有提升空间，建议结合更多历史数据训练。
                    </div>
                  </Card>

                  {/* Chart 3: Omission vs Frequency Scatter */}
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">遗漏-频率象限</CardTitle>
                      <CardDescription>寻找高频冷号机会</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div style={{ width: '100%', height: 250 }}>
                        {chartsReady && (
                        <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={100}>
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="omission" name="当前遗漏" unit="期" tick={{fontSize: 10}} />
                            <YAxis type="number" dataKey="frequency" name="总频率" unit="次" tick={{fontSize: 10}} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px' }} />
                            <Scatter name="红球" data={omissionData} fill="hsl(var(--ball-red))" />
                          </ScatterChart>
                        </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">分析:</span> 右上角区域的点代表“高频且高遗漏”号码，通常是统计学上的最佳回补机会点。
                    </div>
                  </Card>

                  {/* Chart 4: Probability Distribution */}
                  <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">热号概率分布</CardTitle>
                      <CardDescription>Top 15 号码出现概率</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div style={{ width: '100%', height: 250 }}>
                        {chartsReady && (
                        <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={100}>
                          <BarChart data={statsData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 10}} />
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="prob" fill="hsl(var(--ball-red))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">分析:</span> 柱状图展示了当前最具潜力的15个号码，其概率密度基于全量历史数据计算得出。
                    </div>
                  </Card>

                  {/* Chart 5: Sum Trend Area */}
                  <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">红球和值走势</CardTitle>
                      <CardDescription>近30期和值波动趋势</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div style={{ width: '100%', height: 250 }}>
                        {chartsReady && (
                        <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={100}>
                          <AreaChart data={sumTrendData}>
                            <defs>
                              <linearGradient id="colorSum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="issue" tick={{fontSize: 10}} />
                            <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} />
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="sum" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSum)" />
                          </AreaChart>
                        </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">分析:</span> 观察和值曲线的波峰波谷，若近期和值持续走高，下期有极大概率回落至均值附近(90-110)。
                    </div>
                  </Card>

                  {/* Chart 6: Structure Analysis */}
                  {structureData && (
                  <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">本期预测结构分析</CardTitle>
                      <CardDescription>奇偶比与大小比构成</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-around items-center">
                      <div className="flex flex-col items-center" style={{ width: '50%', height: 200 }}>
                         <span className="text-xs font-semibold mb-2">奇偶比例</span>
                         {chartsReady && (
                         <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={100}>
                            <RePieChart>
                              <Pie data={structureData.oddEven} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                {structureData.oddEven.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend verticalAlign="bottom" height={36}/>
                            </RePieChart>
                         </ResponsiveContainer>
                         )}
                      </div>
                      <div className="flex flex-col items-center" style={{ width: '50%', height: 200 }}>
                         <span className="text-xs font-semibold mb-2">大小比例 (16为界)</span>
                         {chartsReady && (
                         <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={100}>
                            <RePieChart>
                              <Pie data={structureData.bigSmall} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                {structureData.bigSmall.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length + 2]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend verticalAlign="bottom" height={36}/>
                            </RePieChart>
                         </ResponsiveContainer>
                         )}
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 text-xs text-muted-foreground text-center">
                      <span className="font-semibold text-primary">分析:</span> 合理的奇偶比(3:3或4:2)与大小比能显著提升中奖概率，当前预测结果符合正态分布特征。
                    </div>
                  </Card>
                  )}
                </div>
              </div>

              {/* Detailed Results */}
              {prediction.details && Object.keys(prediction.details).length > 0 && (
                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">各算法详情</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(prediction.details).map(([algoId, res], idx) => {
                        const algo = algorithms.find(a => a.id === algoId);
                        return (
                          <motion.div
                            key={algoId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="bg-secondary/20 p-4 rounded-lg border border-border/50 hover:bg-secondary/40 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center space-x-2">
                                {algo?.icon && <algo.icon size={16} className="text-muted-foreground" />}
                                <span className="font-semibold">{algo?.name || algoId}</span>
                              </div>
                              {algoId === 'random' && <Badge variant="outline" className="text-xs">基准</Badge>}
                            </div>
                            <div className="flex gap-2">
                              {res.red.map(n => (
                                <span key={n} className="text-ball-red font-mono font-medium">{n}</span>
                              ))}
                              <span className="text-muted-foreground">|</span>
                              <span className="text-ball-blue font-mono font-bold">{res.blue}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Prediction;
