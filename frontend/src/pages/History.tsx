import React, { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/common/ui/button';
import { predictionApi } from '@/api/prediction';
import { Card, CardContent } from '@/components/common/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/common/ui/table';
import { Loader2, ChevronLeft, ChevronRight, Calendar, CircleDollarSign, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LotteryResult {
  id: number;
  issue_number: string;
  draw_date: string;
  red_balls: number[];
  blue_ball: number;
  prize_pool: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [updateMessage, setUpdateMessage] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await predictionApi.getHistory({ page }) as { data: PaginatedResponse<LotteryResult> };
      setHistory(response.data.results || []);
      setTotalPages(Math.ceil(response.data.count / 50));
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleUpdateData = async () => {
    if (updating) return;

    setUpdating(true);
    setUpdateStatus('idle');
    setUpdateMessage('');

    try {
      const response = await predictionApi.updateData();
      setUpdateStatus('success');
      setUpdateMessage(response.data?.message || '数据更新成功');
      await fetchHistory();

      setTimeout(() => {
        setUpdateStatus('idle');
        setUpdateMessage('');
      }, 3000);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      setUpdateStatus('error');
      setUpdateMessage(axiosError.response?.data?.message || '数据更新失败，请重试');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">历史开奖数据</h1>
              <p className="text-muted-foreground mt-1">
                查看双色球历史开奖详情与走势
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <Button
                onClick={handleUpdateData}
                disabled={updating}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    更新中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    更新数据
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> 上一页
              </Button>
              <div className="text-sm font-medium">
                第 {page} / {totalPages} 页
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                下一页 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {updateStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 p-4 rounded-lg mb-4 ${
                  updateStatus === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {updateStatus === 'success' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="flex-1">{updateMessage}</span>
                {updateStatus === 'error' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateData}
                    disabled={updating}
                    className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                  >
                    重试
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <Card className="border-border/50 shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">期号</TableHead>
                  <TableHead className="w-[120px]">开奖日期</TableHead>
                  <TableHead>红球</TableHead>
                  <TableHead className="w-[80px]">蓝球</TableHead>
                  <TableHead className="text-right">奖池金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.issue_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {item.draw_date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {item.red_balls.map((ball, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow-sm"
                            >
                              {ball}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {item.blue_ball}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <div className="flex items-center justify-end text-green-600">
                          <CircleDollarSign className="h-3 w-3 mr-1" />
                          {(item.prize_pool / 100000000).toFixed(2)}亿
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HistoryPage;
