import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import BreedIdentifier from './components/BreedIdentifier';
import BatchIntake from './components/BatchIntake';
import Settings from './components/Settings';
import Clients from './components/Clients';
import Pets from './components/Pets';
import Appointments from './components/Appointments';
import Messages from './components/Messages';
import BreederWatch from './components/BreederWatch';
import Auth from './components/Auth';
import { AppView, BusinessConfig, User } from './types';
import { Bot } from 'lucide-react';

const DEFAULT_CONFIG: BusinessConfig = {
  businessName: 'PawCRM Grooming',
  ownerName: 'Jane Doe',
  email: 'jane@pawcrm.com',
  phone: '(555) 123-4567',
  address: '123 Puppy Lane, Dogville, CA 90210',
  cancellationPolicy: 'Please provide at least 24 hours notice for cancellations to avoid a fee.',
  calendlyUrl: '',
  mailchimpApiKey: '',
  stripeConnected: false,
  quickbooksConnected: false,
  googleCalendarConnected: false,
  notifications: {
    emailReminders: true,
    smsReminders: true,
    allowClientPreference: false,
    marketingEmails: false,
    newClientAlerts: true,
    dailySummary: true
  }
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // Check for auth (mock)
    const savedUser = localStorage.getItem('pawcrm_user');
    if (savedUser) {
      setIsAuthenticated(true);
    }

    // Load config
    const savedConfig = localStorage.getItem('pawcrm_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          notifications: {
            ...DEFAULT_CONFIG.notifications,
            ...(parsed.notifications || {})
          }
        });
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('pawcrm_user', JSON.stringify(user));
    // Update config with login details if needed
    const newConfig = { ...config, ownerName: user.name, businessName: user.businessName, email: user.email };
    setConfig(newConfig);
    localStorage.setItem('pawcrm_config', JSON.stringify(newConfig));
    setIsAuthenticated(true);
  };

  const handleSaveConfig = (newConfig: BusinessConfig) => {
    setConfig(newConfig);
    localStorage.setItem('pawcrm_config', JSON.stringify(newConfig));
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} />;
      case AppView.CLIENTS:
        return <Clients onNavigate={setCurrentView} />;
      case AppView.APPOINTMENTS:
        return <Appointments onNavigate={setCurrentView} />;
      case AppView.PETS:
        return <Pets />;
      case AppView.AI_ASSISTANT:
        return <AIAssistant />;
      case AppView.BREED_IDENTIFIER:
        return <BreedIdentifier />;
      case AppView.BATCH_INTAKE:
        return <BatchIntake />;
      case AppView.MESSAGES:
        return <Messages config={config} />;
      case AppView.SETTINGS:
        return <Settings config={config} onSave={handleSaveConfig} />;
      case AppView.BREEDER_WATCH:
        return <BreederWatch />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="bg-white p-12 rounded-3xl shadow-soft border border-slate-200 text-center max-w-md">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot size={32} className="text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h2>
              <p className="text-slate-500 mb-6">The {currentView.toLowerCase().replace('_', ' ')} module is currently under development.</p>
              <button 
                onClick={() => setCurrentView(AppView.DASHBOARD)}
                className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
              >
                Return Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        ownerName={config.ownerName}
      />
      
      <main className="flex-1 overflow-y-auto relative scroll-smooth w-full">
        {renderView()}

        {/* Floating AI Action Button (Only show if not on AI screen) */}
        {currentView !== AppView.AI_ASSISTANT && (
          <button 
            onClick={() => setCurrentView(AppView.AI_ASSISTANT)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 z-50 group"
            title="Ask Pet AI"
          >
            <Bot size={28} className="group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </main>
    </div>
  );
};

export default App;