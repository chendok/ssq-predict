import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { User, Settings, Crown, LogOut, History, Zap, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { predictionApi } from '@/api/prediction';
import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/ui/card';
import { Badge } from '@/components/common/ui/badge';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PredictionHistoryItem {
  id: number;
  created_at: string;
  predicted_numbers: { red: number[], blue: number };
  algorithms_used: string[];
  confidence_score: number;
}

const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const response = await predictionApi.getHistory();
          setHistory(response.data.results || []);
        } catch (error) {
          console.error('Failed to fetch history:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-20 px-4">
          <Card className="text-center shadow-xl border-t-4 border-t-primary">
            <CardContent className="pt-12 pb-10 px-8">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <User size={40} className="text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold mb-3">欢迎来到双色球预测大师</h1>
              <p className="text-muted-foreground mb-8">登录后即可查看您的预测历史，享受更多个性化服务。</p>
              <Button size="lg" onClick={handleLogin} className="w-full rounded-full">
                立即登录 / 注册
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-6">个人中心</h1>

          {/* User Info Card */}
          <Card className="overflow-hidden border-border/50 shadow-md mb-8">
            <div className="h-24 bg-gradient-to-r from-primary/80 to-accent/80"></div>
            <CardContent className="relative pt-0 px-8 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-6 gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-card bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow text-center md:text-left mb-2">
                  <h2 className="text-2xl font-bold">{user?.username}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div className="flex gap-3 mb-2">
                   <Button variant="outline" size="sm" className="rounded-full">
                     <Settings className="w-4 h-4 mr-2" /> 设置
                   </Button>
                   <Button variant="destructive" size="sm" onClick={handleLogout} className="rounded-full">
                     <LogOut className="w-4 h-4 mr-2" /> 退出
                   </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-xl flex items-center gap-4 border border-border/50">
                  <div className="p-2 bg-warning/10 text-warning rounded-lg">
                    <Crown size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">会员等级</div>
                    <div className="font-semibold">普通会员</div>
                  </div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-xl flex items-center gap-4 border border-border/50">
                   <div className="p-2 bg-success/10 text-success rounded-lg">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">账号状态</div>
                    <div className="font-semibold">安全</div>
                  </div>
                </div>
                <div className="bg-secondary/30 p-4 rounded-xl flex items-center gap-4 border border-border/50">
                   <div className="p-2 bg-info/10 text-info rounded-lg">
                    <History size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">预测次数</div>
                    <div className="font-semibold">{history.length} 次</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prediction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  <span>我的预测记录</span>
                </CardTitle>
                <CardDescription>查看过往的预测结果与算法组合</CardDescription>
              </div>
              <Badge variant="secondary">{history.length} 条记录</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-muted-foreground">加载记录中...</span>
                </div>
              ) : history.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {history.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-muted/30 transition-colors group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {new Date(item.created_at).toLocaleDateString()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        {item.confidence_score !== null && item.confidence_score !== undefined && (
                          <Badge variant="secondary" className="w-fit bg-success/10 text-success border-success/20">
                            <Zap size={12} className="mr-1" />
                            置信度 {(item.confidence_score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        {item.predicted_numbers.red.map((num, idx) => (
                          <Badge
                            key={`red-${idx}`}
                            variant="red"
                            className="w-8 h-8 flex items-center justify-center rounded-full p-0 text-sm font-bold shadow-sm"
                          >
                            {num}
                          </Badge>
                        ))}
                        <Badge
                          variant="blue"
                          className="w-8 h-8 flex items-center justify-center rounded-full p-0 text-sm font-bold shadow-sm"
                        >
                          {item.predicted_numbers.blue}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-muted-foreground flex gap-2">
                          <span className="font-medium">算法组合:</span>
                          <span>{item.algorithms_used.join(', ')}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">暂无预测记录</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    您还没有进行过任何预测。开始您的第一次智能预测吧！
                  </p>
                  <Button onClick={() => navigate('/prediction')}>
                    开始预测
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
