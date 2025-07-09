import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'light' | 'dark' | 'blue' | 'purple' | 'green' | 'orange';

interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

const themes: Record<ThemeType, Theme> = {
  light: {
    name: 'light',
    displayName: '亮色模式',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  dark: {
    name: 'dark',
    displayName: '暗色模式',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#374151',
      accent: '#22d3ee',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#fb7185',
      info: '#60a5fa',
    },
  },
  blue: {
    name: 'blue',
    displayName: '蓝色主题',
    colors: {
      primary: '#2563eb',
      secondary: '#475569',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#1e40af',
      textSecondary: '#475569',
      border: '#bae6fd',
      accent: '#0ea5e9',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
    },
  },
  purple: {
    name: 'purple',
    displayName: '紫色主题',
    colors: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#581c87',
      textSecondary: '#6b7280',
      border: '#d8b4fe',
      accent: '#a855f7',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#7c3aed',
    },
  },
  green: {
    name: 'green',
    displayName: '绿色主题',
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d',
      textSecondary: '#6b7280',
      border: '#bbf7d0',
      accent: '#10b981',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#059669',
    },
  },
  orange: {
    name: 'orange',
    displayName: '橙色主题',
    colors: {
      primary: '#ea580c',
      secondary: '#6b7280',
      background: '#fff7ed',
      surface: '#fed7aa',
      text: '#9a3412',
      textSecondary: '#6b7280',
      border: '#fed7aa',
      accent: '#f97316',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#ea580c',
    },
  },
};

interface ThemeContextType {
  currentTheme: ThemeType;
  theme: Theme;
  setTheme: (theme: ThemeType) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    // 初始化时就从localStorage读取
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as ThemeType;
      if (savedTheme && themes[savedTheme]) {
        return savedTheme;
      }
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // 应用主题CSS变量
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // 动态计算透明度变量
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // 为主要颜色创建透明度变量
    const primaryRgb = hexToRgb(theme.colors.primary);
    const surfaceRgb = hexToRgb(theme.colors.surface);
    const backgroundRgb = hexToRgb(theme.colors.background);
    
    if (primaryRgb) {
      root.style.setProperty('--color-primary-50', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`);
      root.style.setProperty('--color-primary-100', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
      root.style.setProperty('--color-primary-200', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`);
      root.style.setProperty('--color-primary-300', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`);
      root.style.setProperty('--color-primary-500', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)`);
      root.style.setProperty('--color-primary-700', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.7)`);
      root.style.setProperty('--color-primary-900', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.9)`);
    }
    
    if (surfaceRgb) {
      root.style.setProperty('--color-surface-50', `rgba(${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}, 0.05)`);
      root.style.setProperty('--color-surface-100', `rgba(${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}, 0.1)`);
      root.style.setProperty('--color-surface-200', `rgba(${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}, 0.2)`);
      root.style.setProperty('--color-surface-300', `rgba(${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}, 0.3)`);
      root.style.setProperty('--color-surface-500', `rgba(${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}, 0.5)`);
      root.style.setProperty('--color-surface-700', `rgba(${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}, 0.7)`);
      root.style.setProperty('--color-surface-900', `rgba(${surfaceRgb.r}, ${surfaceRgb.g}, ${surfaceRgb.b}, 0.9)`);
    }
    
    if (backgroundRgb) {
      root.style.setProperty('--color-background-50', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.05)`);
      root.style.setProperty('--color-background-100', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.1)`);
      root.style.setProperty('--color-background-200', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.2)`);
      root.style.setProperty('--color-background-300', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.3)`);
      root.style.setProperty('--color-background-500', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.5)`);
      root.style.setProperty('--color-background-700', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.7)`);
      root.style.setProperty('--color-background-900', `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, 0.9)`);
    }

    // 保存主题到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', currentTheme);
    }
  }, [currentTheme]);

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
  };

  const availableThemes = Object.values(themes);

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    setTheme,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};