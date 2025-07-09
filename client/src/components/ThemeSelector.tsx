import React, { useState } from 'react';
import { useTheme, ThemeType } from '../contexts/ThemeContext';
import { Palette, Sun, Moon, Droplets, Zap, Leaf, Flame, Check } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeIcons: Record<ThemeType, React.ComponentType<{ className?: string }>> = {
    light: Sun,
    dark: Moon,
    blue: Droplets,
    purple: Zap,
    green: Leaf,
    orange: Flame,
  };

  const handleThemeChange = (theme: ThemeType) => {
    setTheme(theme);
    setIsOpen(false);
  };

  const CurrentIcon = themeIcons[currentTheme];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-surface transition-colors duration-200 flex items-center space-x-2"
        style={{
          backgroundColor: isOpen ? 'var(--color-surface)' : 'transparent',
          color: 'var(--color-text)'
        }}
      >
        <CurrentIcon className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">主题</span>
      </button>

      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 主题选择器 */}
          <div
            className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg border z-50 p-4"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                选择主题
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {availableThemes.map((theme) => {
                const Icon = themeIcons[theme.name as ThemeType];
                const isSelected = currentTheme === theme.name;
                
                return (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name as ThemeType)}
                    className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 relative"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-surface)' : 'transparent',
                      border: isSelected ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
                      color: 'var(--color-text)'
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{theme.displayName}</div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                主题设置会自动保存到本地存储
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;