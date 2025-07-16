import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, Home, Layers, Settings, User, ChevronDown, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import SearchBox from './SearchBox';
import ThemeSelector from './ThemeSelector';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b theme-border header-glass">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2 hover-glow">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg theme-bg-primary text-white float-gentle">
              <span className="text-sm font-bold">GM</span>
            </div>
            <span className="text-lg font-semibold theme-text">Good Man Forum</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
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

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <SearchBox />
          </div>

          <ThemeSelector />

          {user ? (
            <div className="flex items-center space-x-3">
              <Button size="sm" asChild>
                <Link to="/create" className="flex items-center space-x-2 theme-button">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">发表主题</span>
                </Link>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 rounded-full theme-surface px-3 py-1.5 theme-hover transition-colors"
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.username}
                      fallback={user.username.charAt(0).toUpperCase()}
                      size="sm"
                    />
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium theme-text">{user.username}</p>
                      <p className="text-xs theme-text-secondary">Lv.{user.level}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 theme-text-secondary" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 dropdown-glass border rounded-lg shadow-lg z-50">
                        <div className="p-2 space-y-1">
                          <Link
                            to={`/user/${user.id}`}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md hover-lift transition-colors text-sm theme-text"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>个人主页</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center space-x-3 px-3 py-2 rounded-md hover-lift transition-colors text-sm theme-text"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>个人设置</span>
                          </Link>
                          <hr className="my-1 theme-border" />
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                              navigate('/login');
                            }}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover-lift transition-colors text-sm text-left theme-text"
                          >
                            <LogOut className="h-4 w-4" />
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
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="theme-button-secondary">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register" className="theme-button">注册</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;