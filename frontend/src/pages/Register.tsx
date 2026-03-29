import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/common/ui/card';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.register({ username, email, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/');
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as AxiosError<any>;
      console.error('Registration failed:', error);
      if (error.response?.data) {
        // Handle DRF validation errors
        const errorMsg = Object.values(error.response.data).flat().join(', ');
        setError(errorMsg || '注册失败，请稍后重试。');
      } else {
        setError('注册失败，请稍后重试。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-border bg-card/30 backdrop-blur-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                注册账号
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                创建您的专属账号，开启智能预测之旅
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg mb-6 text-sm flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="用户名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="邮箱地址"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="设置密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      注册中...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> 注册
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
              <div>
                已有账号？{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline underline-offset-4"
                >
                  直接登录
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Register;
