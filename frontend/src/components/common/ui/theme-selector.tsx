import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/common/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/ui/popover';
import { Palette } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Palette size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <h3 className="font-semibold mb-4">主题设置</h3>
        <div className="space-y-3">
          {availableThemes.map((themeOption) => (
            <Button
              key={themeOption.value}
              variant={theme === themeOption.value ? "default" : "ghost"}
              className={`w-full justify-start ${theme === themeOption.value ? 'border-2 border-primary' : ''}`}
              onClick={() => setTheme(themeOption.value)}
            >
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full mr-3`}
                  style={{
                    backgroundColor: themeOption.value === 'default' ? '#1e293b' :
                                    themeOption.value === 'gold' ? '#0a0a0a' :
                                    themeOption.value === 'tech' ? '#0f172a' :
                                    '#f8f4f0'
                  }}
                />
                <span>{themeOption.label}</span>
              </div>
            </Button>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            选择一个主题以个性化您的体验。主题设置会被保存，下次访问时会自动应用。
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSelector;
