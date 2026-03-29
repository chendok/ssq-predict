import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart2,
  Home,
  History,
  Zap,
  Menu,
  X,
  ChevronRight,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/ui/button';
import ThemeSelector from '@/components/common/ui/theme-selector';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/history', label: '历史数据', icon: History },
    { path: '/analysis', label: '深度分析', icon: BarChart2 },
    { path: '/prediction', label: '智能预测', icon: Zap },
    { path: '/astro', label: '传统术数', icon: Compass },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          scrolled ? "bg-background/80 backdrop-blur-md border-border shadow-sm py-2" : "bg-transparent py-4"
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group z-50">
            <div className="relative w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
              <span className="text-primary-foreground font-bold text-lg">S</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-ball-red rounded-full border-2 border-background"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">SSQ Master</span>
              <span className="text-xs text-muted-foreground font-medium">双色球预测大师</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center bg-secondary/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all duration-300 text-base font-medium",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary rounded-full shadow-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon size={20} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeSelector />
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl text-lg font-medium transition-colors border border-transparent",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={20} className="opacity-50" />
                </Link>
              ))}

              <div className="h-px bg-border my-4" />

              <div className="p-4 rounded-xl bg-secondary/50">
                <h4 className="font-medium mb-3">主题设置</h4>
                <ThemeSelector />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 container mx-auto px-4 md:px-6 relative z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                <span className="text-lg font-bold">SSQ Master</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
                基于现代人工智能技术与传统中华术数智慧相结合的创新型下一代双色球预测平台。
                我们通过深度学习算法分析历史数据，同时融合梅花易数、奇门遁甲等传统预测方法，为彩票爱好者提供多维度的分析工具和决策参考。 我们的目标不是鼓励赌博，而是通过科学与文化的碰撞，探索数字背后的规律与乐趣。
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">平台服务</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/analysis" className="hover:text-primary transition-colors">数据分析</Link></li>
                <li><Link to="/prediction" className="hover:text-primary transition-colors">智能预测</Link></li>
                <li><Link to="/astro" className="hover:text-primary transition-colors">传统术数</Link></li>
                <li><Link to="/history" className="hover:text-primary transition-colors">历史回溯</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">关于与帮助</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">关于我们</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors">隐私政策</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">服务条款</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>© 2026 SSQ Master. All rights reserved.</p>
            <p className="mt-2 md:mt-0 flex items-center">
              <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
              系统运行正常 | v1.0.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
