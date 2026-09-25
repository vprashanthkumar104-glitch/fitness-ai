import React, { useState } from 'react';
import { Page } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { AuthPage } from './components/pages/AuthPage';
import { AIFeaturesPage } from './components/pages/AIFeaturesPage';
import { ContactPage } from './components/pages/ContactPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { KnowledgeBasePage } from './components/pages/KnowledgeBasePage';
import { FitnessChatbot } from './components/chat/FitnessChatbot';
import { motion, AnimatePresence } from 'motion/react';

function FitnessApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { user, signOutUser } = useAuth();

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'about':
        return <AboutPage setCurrentPage={setCurrentPage} />;
      case 'features':
        return <AIFeaturesPage setCurrentPage={setCurrentPage} />;
      case 'knowledge':
        return <KnowledgeBasePage setCurrentPage={setCurrentPage} />;
      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />;
      case 'auth':
        return <AuthPage setCurrentPage={setCurrentPage} onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        userEmail={user?.email || null}
        onSignOut={handleSignOut}
      />

      {/* Main Content View with Smooth Page Transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* Floating AI Fitness Chatbot (available across the app) */}
      <FitnessChatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FitnessApp />
    </AuthProvider>
  );
}


