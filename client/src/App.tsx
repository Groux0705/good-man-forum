import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen theme-bg theme-text">
              <Header />
              <main className="flex-1">
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
                </Routes>
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
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;