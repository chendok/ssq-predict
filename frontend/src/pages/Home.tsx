import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Activity, BarChart2, Zap, ArrowRight, Loader2, Compass } from 'lucide-react';
import { predictionApi } from '@/api/prediction';
import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Badge } from '@/components/common/ui/badge';
import { motion } from 'framer-motion';

interface LotteryResult {
  issue_number: string;
  draw_date: string;
  red_balls: number[];
  blue_ball: number;
}

const Home: React.FC = () => {
  const [latestResult, setLatestResult] = useState<LotteryResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        const response = await predictionApi.getHistory({ page: 1, page_size: 1 });
        if (response.data && response.data.results && response.data.results.length > 0) {
          setLatestResult(response.data.results[0]);
        }
      } catch (error) {
        console.error('Failed to fetch latest result:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestResult();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="space-y-16 py-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
            v1.0 正式上线
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-info to-accent">
            双色球 AI 预测大师
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            融合前沿机器学习算法与海量历史数据分析，为您提供科学、精准的双色球走势洞察与号码推荐服务。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link to="/prediction">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-lg shadow-primary/25 rounded-full">
                <Zap className="mr-2 h-5 w-5" /> 开始智能预测
              </Button>
            </Link>
            <Link to="/astro">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-lg shadow-primary/25 rounded-full">
                <Compass className="mr-2 h-5 w-5" /> 开始传统预测
              </Button>
            </Link>
            <Link to="/analysis">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12 rounded-full hover:bg-secondary">
                <BarChart2 className="mr-2 h-5 w-5" /> 查看数据分析
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Latest Result */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">最新开奖结果</CardTitle>
              <CardDescription>实时同步官方开奖数据</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[160px]">
              {loading ? (
                <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>正在获取最新数据...</p>
                </div>
              ) : latestResult ? (
                <div className="space-y-6 w-full">
                  <div className="flex justify-between items-center text-sm text-muted-foreground px-4 py-2 bg-secondary/50 rounded-full mx-auto max-w-sm">
                    <span>第 <span className="text-foreground font-mono font-bold">{latestResult.issue_number}</span> 期</span>
                    <span>{latestResult.draw_date}</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {latestResult.red_balls.map((num, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                      >
                        <Badge
                          variant="red"
                          className="w-12 h-12 md:w-14 md:h-14 rounded-full text-lg md:text-xl font-bold flex items-center justify-center shadow-lg shadow-ball-red/30"
                        >
                          {num}
                        </Badge>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + 0.5, type: "spring" }}
                    >
                      <Badge
                        variant="blue"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full text-lg md:text-xl font-bold flex items-center justify-center shadow-lg shadow-ball-blue/30"
                      >
                        {latestResult.blue_ball}
                      </Badge>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">暂无数据</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-6"
        >
          {[
            {
              icon: Activity,
              title: "历史数据",
              desc: "完整的历史开奖数据查询，支持按期号、日期筛选，直观展示历史走势。",
              link: "/history",
              color: "text-info",
              bg: "bg-info/10"
            },
            {
              icon: BarChart2,
              title: "深度分析",
              desc: "多维度数据分析，包括冷热号、遗漏值、奇偶比等专业图表展示。",
              link: "/analysis",
              color: "text-success",
              bg: "bg-success/10"
            },
            {
              icon: Zap,
              title: "智能预测",
              desc: "基于马尔可夫链、神经网络等多种算法模型，提供智能选号建议。",
              link: "/prediction",
              color: "text-primary",
              bg: "bg-primary/10"
            },
            {
              icon: Compass,
              title: "传统术数",
              desc: "融合梅花易数、奇门遁甲等传统智慧，推演号码走势。",
              link: "/astro",
              color: "text-warning",
              bg: "bg-warning/10"
            }
          ].map((feature, idx) => (
            <motion.div key={idx} variants={item}>
              <Link to={feature.link} className="group h-full block">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-card">
                  <CardHeader>
                    <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.desc}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                      立即查看 <ArrowRight className="ml-1 w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
