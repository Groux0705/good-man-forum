import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import PageTransition from './components/ui/PageTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TopicDetail from './pages/TopicDetail';
import CreateTopic from './pages/CreateTopic';
import NodeList from './pages/NodeList';
import NodeDetail from './pages/NodeDetail';
import SearchResults from './pages/SearchResults';
import UserSettings from './pages/UserSettings';
import UserProfile from './pages/UserProfile';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonLearning from './pages/LessonLearning';
import AnimationDemo from './pages/AnimationDemo';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './styles/theme.css';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 需要隐藏导航栏的特殊页面
const FOCUSED_PAGES = ['/login', '/register', '/terms-of-service', '/privacy-policy'];

function AppContent() {
  const location = useLocation();
  const isFocusedPage = FOCUSED_PAGES.includes(location.pathname);

  return (
    <div className="min-h-screen theme-bg theme-text relative">
      {/* 背景虚化的导航栏 */}
      {isFocusedPage && (
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-primary/12" />
          <div className="absolute inset-0 backdrop-blur-xl" />
          <div className="relative z-10 opacity-20 blur-sm">
            <Header />
          </div>
        </div>
      )}
      
      {/* 正常显示的导航栏 */}
      {!isFocusedPage && <Header />}
      
      <main className={`flex-1 ${isFocusedPage ? 'relative z-20' : ''}`}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/topic/:id" element={<TopicDetail />} />
            <Route path="/create" element={<CreateTopic />} />
            <Route path="/nodes" element={<NodeList />} />
            <Route path="/node/:name" element={<NodeDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonLearning />} />
            <Route path="/demo" element={<AnimationDemo />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </PageTransition>
      </main>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-background)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;