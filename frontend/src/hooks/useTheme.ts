import { useState, useEffect } from 'react';

type Theme = 'default' | 'gold' | 'tech' | 'chinese';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    return 'default';
  });

  useEffect(() => {
    // 移除所有主题类
    document.documentElement.classList.remove('default', 'theme-gold', 'theme-tech', 'theme-chinese');
    // 添加当前主题类
    if (theme === 'default') {
      document.documentElement.classList.add('default');
    } else {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setThemeByName = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme: setThemeByName,
    availableThemes: [
      { value: 'default', label: '默认主题' },
      { value: 'gold', label: '黑金尊贵' },
      { value: 'tech', label: '科技深蓝' },
      { value: 'chinese', label: '国风雅致' }
    ] as { value: Theme; label: string }[]
  };
}
