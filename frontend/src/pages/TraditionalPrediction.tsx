import React, { useState, useEffect, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Variants } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { traditionalApi } from '@/api/traditional';
import { predictionApi } from '@/api/prediction';
import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui/card';
import { DatePicker } from '@/components/common/ui/date-picker';
import { ChinaRegionSelector } from '@/components/common/ui/china-region-selector';
import { format } from "date-fns";
import {
  Zap,
  RefreshCw,
  Compass,
  BookOpen,
  Info,
  MapPin,
  Layers,
  User,
  Settings,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PageHeader,
  LotteryBall,
  AlgorithmCard
} from '@/components/common/design';
import { ALGORITHM_META, AlgorithmMeta } from '@/lib/numerology';
import TraditionalAnalysisDashboard from '@/components/traditional/TraditionalAnalysisDashboard';

// --- Type Definitions ---

/**
 * 预测元数据接口
 * 包含五行、阴阳、八卦等详细信息
 */
interface PredictionMetadata {
  ganzhi: string;
  wang_element: string;
  stats: {
    five_elements: Record<string, number>;
    odd_even: string;
    big_small: string;
  };
  iching?: {
    upper_gua: number;
    lower_gua: number;
    moving_line: number;
    hexagram_id: string;
  };
  engine_raw?: unknown;
}

/**
 * 预测详情项接口
 */
interface PredictionDetail {
  method: string;
  numbers: {
    red: number[];
    blue: number
  };
  metadata: PredictionMetadata;
}

/**
 * 预测结果接口
 */
interface PredictionResult {
  numbers: {
    red: number[];
    blue: number;
  };
  details?: PredictionDetail[];
  created_at?: string;
}

/**
 * AI解读结果接口
 */
interface InterpretationResult {
  original_text: string;
  translation: string;
  symbolism: string;
  suggestion: string;
  error?: string;
}

/**
 * 图表数据项接口
 */
// interface ChartEntry {
//   name: string;
//   value: number;
//   fill?: string;
// }

// --- Constants ---

const METHOD_ICONS: Record<string, LucideIcon> = {
  meihua: Compass,
  qimen: Layers,
  liuyao: Moon,
  heluo: BookOpen,
  timespace: MapPin,
  bazi: User
};

const SLIDE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0, overflow: 'hidden' },
  visible: { opacity: 1, height: 'auto', marginTop: 24, overflow: 'visible', transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { opacity: 0, height: 0, marginTop: 0, overflow: 'hidden', transition: { duration: 0.2, ease: 'easeInOut' } }
};

const ANIMATION_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const ANIMATION_ITEM: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

/**
 * 获取当前日期以后的下一个开奖日期
 * 双色球开奖日：周二(2)、周四(4)、周日(0)
 * 如果当日是开奖日，且时间没有到21:00，则默认为当日
 */
const getNextDrawDate = (): Date => {
  const today = new Date();
  const day = today.getDay(); // 0:Sun, 1:Mon, ...
  const hour = today.getHours();

  // 检查是否为开奖日且未到21:00
  const isDrawDay = [0, 2, 4].includes(day);
  if (isDrawDay && hour < 21) {
    return today;
  }

  let addDays = 0;

  // 计算下一个开奖日 (Strictly after today if today is not draw day or passed cut-off)
  switch (day) {
    case 0: addDays = 2; break; // Sun -> Tue
    case 1: addDays = 1; break; // Mon -> Tue
    case 2: addDays = 2; break; // Tue -> Thu
    case 3: addDays = 1; break; // Wed -> Thu
    case 4: addDays = 3; break; // Thu -> Sun
    case 5: addDays = 2; break; // Fri -> Sun
    case 6: addDays = 1; break; // Sat -> Sun
    default: addDays = 1;
  }

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + addDays);
  return nextDate;
};

/**
 * TraditionalPrediction Component
 * 传统术数预测页面，包含算法选择、参数配置、结果展示及图表分析
 */
const TraditionalPrediction: React.FC = () => {
  // --- State Management ---

  // 1. Form/Input State
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['meihua']);
  const [date, setDate] = useState<Date | undefined>(getNextDrawDate());
  const [birthDate, setBirthDate] = useState<Date | undefined>(new Date(2000, 0, 1));
  const [location, setLocation] = useState<string>('');

  // 2. Prediction Data State
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 3. AI Interpretation State
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
  const [interpreting, setInterpreting] = useState<boolean>(false);

  // 4. UI/Visualization State
  // const [chartsReady, setChartsReady] = useState<boolean>(false);


  // --- Derived State (useMemo) ---

  const showBirthDate = useMemo(() => selectedMethods.includes('bazi'), [selectedMethods]);
  const showLocation = useMemo(() => selectedMethods.includes('timespace'), [selectedMethods]);

  const predictionDate = useMemo(() => {
    return prediction?.created_at ? new Date(prediction.created_at) : new Date();
  }, [prediction]);


  // --- Event Handlers ---

  /**
   * 切换算法选择
   */
  const toggleMethod = (id: string): void => {
    if (selectedMethods.includes(id)) {
      if (selectedMethods.length > 1) {
        setSelectedMethods(prev => prev.filter(m => m !== id));
      }
    } else {
      setSelectedMethods(prev => [...prev, id]);
    }
  };

  /**
   * 执行预测
   */
  const handlePredict = async (): Promise<void> => {
    if (!date) {
      setError('请选择预测时间');
      return;
    }

    if (showBirthDate && !birthDate) {
      setError('八字算法需要提供出生日期');
      return;
    }

    setError('');
    setLoading(true);
    setPrediction(null);
    setInterpretation(null);
    // setChartsReady(false);

    try {
      const targetDate = showBirthDate && birthDate ? birthDate : date;
      const targetDateStr = format(targetDate, 'yyyy-MM-dd HH:mm:ss');

      const response = await traditionalApi.predict(selectedMethods, targetDateStr);
      setPrediction(response.data);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      console.error('Prediction failed:', err);
      setError(axiosError.response?.data?.error || '预测失败，请检查网络或重试');
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---

  /**
   * 当预测结果更新时，触发AI解读和图表延时加载
   */
  useEffect(() => {
    if (prediction) {
      // 1. AI Interpretation
      const interpretTraditional = async (): Promise<void> => {
        setInterpreting(true);
        try {
          // Cast prediction to any/unknown as API might expect specific structure,
          // but we pass the whole object for context
          const res = await predictionApi.interpret('traditional', prediction as unknown as Record<string, unknown>);
          const data = res.data as InterpretationResult;
          if (!data.error) {
            setInterpretation(data);
          }
        } catch (err) {
          console.error('Interpretation failed', err);
        } finally {
          setInterpreting(false);
        }
      };

      interpretTraditional();

      // 2. Charts Delay (to fix Recharts animation width issue)
      // const timer = setTimeout(() => setChartsReady(true), 500);
      // return () => clearTimeout(timer);
    }
  }, [prediction]);

  // --- Render Helpers ---

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-10">
        <PageHeader
          title="传统术数推演"
          description="融合梅花、奇门、六爻、河洛、时空、八字核心算法，探索时空能量与数字的奥秘。"
          icon={Compass}
          gradient="from-primary to-warning"
        />

        {/* Algorithm Selection Card */}
        <Card className="border-border/50 shadow-md">
           <CardHeader>
             <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>选择预测算法</span>
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
               {Object.values(ALGORITHM_META).map((m: AlgorithmMeta) => (
                 <AlgorithmCard
                   key={m.id}
                   id={m.id}
                   title={m.name}
                   description={m.desc}
                   icon={METHOD_ICONS[m.id] || Compass}
                   selected={selectedMethods.includes(m.id)}
                   onClick={() => toggleMethod(m.id)}
                   details={m.details}
                 />
               ))}
             </div>
           </CardContent>
        </Card>

        {/* Parameters Configuration Card */}
        <Card className="border-t-4 border-t-primary shadow-md">
          <CardHeader className="text-center">
            <CardTitle>推演参数设置</CardTitle>
            <CardDescription>
              请配置推演所需的时间参数，部分算法需要额外信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className="w-full max-w-5xl flex flex-wrap gap-8 justify-center">
              {/* Prediction Date */}
              <AnimatePresence mode="sync">
                <motion.div
                  key="prediction-date"
                  variants={SLIDE_IN_VARIANTS}
                  initial="visible"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center space-y-2 min-w-[320px] w-[320px]"
                >
                  <label className="text-sm font-medium flex items-center justify-center w-full">
                    <Zap className="w-4 h-4 mr-2 text-primary flex-shrink-0"/>
                    <span>预测日期</span>
                  </label>
                  <DatePicker
                    date={date}
                    setDate={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Birth Date (Conditional) */}
              <AnimatePresence mode="sync">
                {showBirthDate && (
                  <motion.div
                    variants={SLIDE_IN_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col items-center space-y-2 min-w-[320px] w-[320px]"
                  >
                    <label className="text-sm font-medium flex items-center justify-center w-full">
                      <User className="w-4 h-4 mr-2 text-primary flex-shrink-0"/>
                      <span>出生日期</span>
                      <span className="text-xs text-muted-foreground ml-2">(八字算法)</span>
                    </label>
                    <DatePicker
                      date={birthDate}
                      setDate={setBirthDate}
                      disabled={(d) => d > new Date()}
                      captionLayout="dropdown"
                      startMonth={new Date(1900, 0)}
                      endMonth={new Date()}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location (Conditional) */}
              <AnimatePresence mode="sync">
                {showLocation && (
                  <motion.div
                    variants={SLIDE_IN_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col items-center space-y-2 min-w-[320px] w-[320px]"
                  >
                    <label className="text-sm font-medium flex items-center justify-center w-full">
                      <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0"/>
                      <span>地理位置</span>
                      <span className="text-xs text-muted-foreground ml-2">(时空法)</span>
                    </label>
                    <ChinaRegionSelector
                      value={location}
                      onChange={setLocation}
                      className="w-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              size="lg"
              onClick={handlePredict}
              disabled={loading}
              className="min-w-[180px] bg-primary hover:bg-primary/90 text-primary-foreground mt-8"
            >
              {loading ? <RefreshCw className="animate-spin mr-2" /> : <Layers className="mr-2" />}
              开始传统预测
            </Button>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center justify-center w-full max-w-md animate-in slide-in-from-top-2">
                <Info size={16} className="mr-2" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Display */}
        <AnimatePresence mode="wait">
          {prediction && (
            <motion.div variants={ANIMATION_CONTAINER} initial="hidden" animate="show" className="space-y-8">

              {/* 1. Lottery Balls Result */}
              <motion.div variants={ANIMATION_ITEM}>
                <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Compass size={180} /></div>
                  <CardHeader className="text-center pb-2 relative z-10">
                    <CardTitle className="text-2xl font-bold">推演结果</CardTitle>
                    <CardDescription>
                      {prediction.details
                        ? `综合 ${prediction.details.length} 种算法模型`
                        : '算法模型'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="flex flex-wrap justify-center gap-4 py-10">
                      {prediction.numbers.red.map((num: number, idx: number) => (
                        <LotteryBall
                          key={`red-${num}`}
                          number={num}
                          variant="red"
                          size="lg"
                          delay={idx * 0.1}
                        />
                      ))}
                      <LotteryBall
                        number={prediction.numbers.blue}
                        variant="blue"
                        size="lg"
                        delay={0.7}
                        className="ml-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 2. Deep Analysis (Hexagrams & AI) */}
              <div className="space-y-8">
                {/* AI Interpretation */}
                <motion.div variants={ANIMATION_ITEM}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="mr-2 text-primary" size={20}/>
                        {interpreting && <RefreshCw className="animate-spin mr-2 h-4 w-4"/>}
                        AI 深度判词
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {interpretation ? (
                        <>
                          <div className="bg-muted/30 p-4 rounded-lg border border-border">
                             <p className="font-serif font-bold text-lg mb-2 text-primary">"{interpretation.original_text}"</p>
                             <p className="text-sm text-muted-foreground leading-relaxed">{interpretation.translation}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase text-muted-foreground">象征意义</span>
                            <p className="text-sm mt-1">{interpretation.symbolism}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase text-muted-foreground">决策建议</span>
                            <p className="text-sm mt-1 text-primary font-medium">{interpretation.suggestion}</p>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          正在生成深度解读...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* 3. Deep Analysis Dashboard */}
              <motion.div variants={ANIMATION_ITEM}>
                 <TraditionalAnalysisDashboard
                   date={predictionDate}
                   numbers={prediction.numbers}
                 />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default TraditionalPrediction;
