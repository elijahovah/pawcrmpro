import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
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
import { Bot, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { dataService } from './services/dataService';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary for Production Stability
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-6">We encountered an unexpected error. Please try refreshing the page.</p>
            <button 
                onClick={() => window.location.reload()} 
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
                <RefreshCw size={18} /> Reload Application
            </button>
            {process.env.NODE_ENV !== 'production' && (
                <div className="mt-6 p-4 bg-slate-100 rounded-lg text-left overflow-auto max-h-40 text-xs font-mono text-slate-700">
                    {this.state.error?.toString()}
                </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const DEFAULT_CONFIG: BusinessConfig = {
  businessName: 'PawCRM Grooming',
  ownerName: 'Jane Doe',
  email: 'jane@pawcrm.com',
  phone: '(555) 123-4567',
  address: '123 Puppy Lane, Dogville, CA 90210',
  cancellationPolicy: 'Please provide at least 24 hours notice for cancellations.',
  logoUrl: '',
  brandColor: '#4f46e5',
  brandTagline: '',
  calendlyUrl: '',
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // Check both local storage (persistent) and session storage (tab only)
      const savedUser = localStorage.getItem('pawcrm_user') || sessionStorage.getItem('pawcrm_user');
      if (savedUser) setIsAuthenticated(true);

      try {
        const savedConfig = await dataService.getSettings();
        if (savedConfig) {
          setConfig({ ...DEFAULT_CONFIG, ...savedConfig, notifications: { ...DEFAULT_CONFIG.notifications, ...(savedConfig.notifications || {}) } });
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const handleLogin = (user: User, keepSignedIn: boolean) => {
    if (keepSignedIn) {
        localStorage.setItem('pawcrm_user', JSON.stringify(user));
    } else {
        sessionStorage.setItem('pawcrm_user', JSON.stringify(user));
    }
    const newConfig = { ...config, ownerName: user.name, businessName: user.businessName, email: user.email };
    setConfig(newConfig);
    dataService.saveSettings(newConfig);
    setIsAuthenticated(true);
  };

  const handleSaveConfig = async (newConfig: BusinessConfig) => {
    setConfig(newConfig);
    await dataService.saveSettings(newConfig);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;
  if (!isAuthenticated) return <Auth onLogin={handleLogin} />;

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard onNavigate={setCurrentView} />;
      case AppView.CLIENTS: return <Clients onNavigate={setCurrentView} />;
      case AppView.APPOINTMENTS: return <Appointments onNavigate={setCurrentView} />;
      case AppView.PETS: return <Pets />;
      case AppView.AI_ASSISTANT: return <AIAssistant />;
      case AppView.BREED_IDENTIFIER: return <BreedIdentifier />;
      case AppView.BATCH_INTAKE: return <BatchIntake />;
      case AppView.MESSAGES: return <Messages config={config} />;
      case AppView.SETTINGS: return <Settings config={config} onSave={handleSaveConfig} />;
      case AppView.BREEDER_WATCH: return <BreederWatch />;
      default: return <div>View Not Found</div>;
    }
  };

  return (
    <ErrorBoundary>
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900" style={{ '--brand-color': config.brandColor } as React.CSSProperties}>
          <Sidebar currentView={currentView} onChangeView={setCurrentView} config={config} />
          <main className="flex-1 overflow-y-auto relative scroll-smooth w-full">
            {renderView()}
            {currentView !== AppView.AI_ASSISTANT && (
              <button onClick={() => setCurrentView(AppView.AI_ASSISTANT)} style={{ backgroundColor: config.brandColor }} className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50">
                <Bot size={28} />
              </button>
            )}
          </main>
        </div>
    </ErrorBoundary>
  );
};

export default App;