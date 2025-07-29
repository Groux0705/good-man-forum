import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, Home, Layers, Settings, User, ChevronDown, BookOpen, Menu, X, Trophy, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import SearchBox from './SearchBox';
import ThemeSelector from './ThemeSelector';
import { NotificationBell } from './NotificationBell';
import { LevelInfo } from '../types';
import LevelProgress from './ui/LevelProgress';
import PointDisplay from './ui/PointDisplay';

const Header: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [userExperience, setUserExperience] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchUserLevelInfo();
    }
  }, [user]);

  // 监听用户balance和level变化，自动刷新level信息
  useEffect(() => {
    if (user) {
      fetchUserLevelInfo();
    }
  }, [user?.balance, user?.level]);

  const fetchUserLevelInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/points/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setLevelInfo(result.data.levelInfo);
        setUserExperience(result.data.user.experience);
      }
    } catch (error) {
      console.error('Error fetching level info:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b theme-border header-glass">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center space-x-3 sm:space-x-6 min-w-0">
          <Link to="/" className="flex items-center space-x-2 hover-glow min-w-0">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg theme-bg-primary text-white float-gentle flex-shrink-0">
              <span className="text-xs sm:text-sm font-bold">GM</span>
            </div>
            <span className="text-sm sm:text-lg font-semibold theme-text hidden sm:inline truncate">Good Man Forum</span>
            <span className="text-sm font-semibold theme-text sm:hidden">GM</span>
          </Link>
          
          {/* 桌面导航 */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center space-x-2 button-glass hover-lift">
                <Home className="h-4 w-4" />
                <span>首页</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/courses" className="flex items-center space-x-2 button-glass hover-lift">
                <BookOpen className="h-4 w-4" />
                <span>课程</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/nodes" className="flex items-center space-x-2 button-glass hover-lift">
                <Layers className="h-4 w-4" />
                <span>节点</span>
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* 移动端菜单按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden touch-manipulation"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <div className="hidden md:flex items-center space-x-2">
            <SearchBox />
          </div>

          <ThemeSelector />
          
          {/* 通知铃铛 - 仅在用户已登录时显示 */}
          {user && <NotificationBell />}

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button size="sm" asChild className="touch-manipulation">
                <Link to="/create" className="flex items-center space-x-2 theme-button">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">发表主题</span>
                </Link>
              </Button>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 sm:space-x-3 rounded-full theme-surface px-2 sm:px-3 py-1.5 theme-hover transition-colors touch-manipulation"
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.username}
                      fallback={user.username.charAt(0).toUpperCase()}
                      size="sm"
                      className="w-6 h-6 sm:w-8 sm:h-8"
                    />
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium theme-text">{user.username}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs theme-text-secondary">Lv.{user.level}</span>
                          {levelInfo && (
                            <span className="text-xs">{levelInfo.badge}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Coins className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs theme-text-secondary">{user.balance}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 theme-text-secondary" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-72 dropdown-glass border rounded-lg shadow-lg z-50">
                        {levelInfo && (
                          <div className="p-4 border-b theme-border">
                            <div className="mb-3">
                              <LevelProgress 
                                level={user.level} 
                                levelInfo={levelInfo}
                                className="mb-2"
                              />
                              <PointDisplay 
                                balance={user.balance}
                                experience={userExperience}
                                showExperience={true}
                                size="sm"
                                className=""
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs theme-text-secondary">
                              <span>{levelInfo.title}</span>
                              <Link 
                                to="/leaderboard" 
                                className="flex items-center space-x-1 hover:theme-text transition-colors"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <Trophy className="h-3 w-3" />
                                <span>排行榜</span>
                              </Link>
                            </div>
                          </div>
                        )}
                        <div className="p-2 space-y-1">
                          <Link
                            to={`/user/${user.id}`}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md hover-lift transition-colors text-sm theme-text touch-manipulation"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span>个人主页</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center space-x-3 px-3 py-2 rounded-md hover-lift transition-colors text-sm theme-text touch-manipulation"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4 flex-shrink-0" />
                            <span>个人设置</span>
                          </Link>
                          <hr className="my-1 theme-border" />
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                              navigate('/login');
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover-lift transition-colors text-sm text-left theme-text touch-manipulation"
                          >
                            <LogOut className="h-4 w-4 flex-shrink-0" />
                            <span>退出登录</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="sm" asChild className="touch-manipulation">
                <Link to="/login" className="theme-button-secondary text-sm">登录</Link>
              </Button>
              <Button size="sm" asChild className="touch-manipulation">
                <Link to="/register" className="theme-button text-sm">注册</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* 移动端导航菜单 */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute top-full left-0 right-0 z-50 lg:hidden dropdown-glass border-t theme-border">
            <nav className="container px-3 py-4 space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-3 px-3 py-3 rounded-md hover-lift transition-colors theme-text touch-manipulation"
                onClick={() => setShowMobileMenu(false)}
              >
                <Home className="h-4 w-4 theme-primary" />
                <span>首页</span>
              </Link>
              <Link
                to="/courses"
                className="flex items-center space-x-3 px-3 py-3 rounded-md hover-lift transition-colors theme-text touch-manipulation"
                onClick={() => setShowMobileMenu(false)}
              >
                <BookOpen className="h-4 w-4 theme-primary" />
                <span>课程中心</span>
              </Link>
              <Link
                to="/nodes"
                className="flex items-center space-x-3 px-3 py-3 rounded-md hover-lift transition-colors theme-text touch-manipulation"
                onClick={() => setShowMobileMenu(false)}
              >
                <Layers className="h-4 w-4 theme-primary" />
                <span>节点列表</span>
              </Link>
              
              {/* 移动端搜索 */}
              <div className="pt-2 border-t theme-border md:hidden">
                <div className="px-3 py-2">
                  <SearchBox />
                </div>
              </div>
              
              {/* 移动端用户操作 */}
              {user && (
                <div className="pt-2 border-t theme-border">
                  <Link
                    to="/create"
                    className="flex items-center space-x-3 px-3 py-3 rounded-md hover-lift transition-colors theme-text touch-manipulation"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Plus className="h-4 w-4 theme-primary" />
                    <span>发表主题</span>
                  </Link>
                  <Link
                    to={`/user/${user.id}`}
                    className="flex items-center space-x-3 px-3 py-3 rounded-md hover-lift transition-colors theme-text touch-manipulation"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User className="h-4 w-4 theme-primary" />
                    <span>个人主页</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-3 py-3 rounded-md hover-lift transition-colors theme-text touch-manipulation"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings className="h-4 w-4 theme-primary" />
                    <span>个人设置</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-md hover-lift transition-colors theme-text touch-manipulation"
                  >
                    <LogOut className="h-4 w-4 theme-primary" />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;