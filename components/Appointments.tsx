import React, { useState, useEffect } from 'react';
import { Calendar, Link, ExternalLink, Clock, User, Settings as SettingsIcon, RefreshCw, Check } from 'lucide-react';
import { AppView } from '../types';

interface AppointmentsProps {
  onNavigate: (view: AppView) => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ onNavigate }) => {
  const [calendlyUrl, setCalendlyUrl] = useState<string>('');
  const [googleSync, setGoogleSync] = useState(false);

  useEffect(() => {
    // In a real app, this would come from a context or database
    const savedConfig = localStorage.getItem('pawcrm_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.calendlyUrl) {
        setCalendlyUrl(config.calendlyUrl);
      }
      if (config.googleCalendarConnected) {
          setGoogleSync(true);
      }
    }
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your schedule and bookings.</p>
        </div>
        <div className="flex gap-3">
             {googleSync && (
                 <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                     <RefreshCw size={18} /> Sync with Google
                 </button>
             )}
            <button 
                onClick={() => onNavigate(AppView.SETTINGS)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
                <SettingsIcon size={18} /> Configure Booking
            </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden flex flex-col relative">
        {calendlyUrl ? (
          <div className="flex-1 w-full h-full bg-slate-50">
             {/* Note: In a real environment, you would verify this URL is safe */}
            <iframe 
              src={calendlyUrl} 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              title="Calendly Scheduling"
              className="min-h-[600px]"
            ></iframe>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Calendar size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Connect Your Calendar</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Integrate with Calendly to allow clients to self-book appointments based on your availability. The scheduling interface will appear directly here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate(AppView.SETTINGS)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <Link size={18} /> Connect Calendly
              </button>
              <a 
                href="https://calendly.com" 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:border-indigo-300 hover:text-indigo-600 flex items-center gap-2 transition-all"
              >
                Create Account <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Clock size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Next Up</h3>
            </div>
            <p className="text-slate-600 text-sm mb-1">1:00 PM - Nail Trim</p>
            <p className="text-slate-900 font-bold">Max (Golden Retriever)</p>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <User size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Waitlist</h3>
            </div>
            <p className="text-slate-600 text-sm mb-1">3 clients waiting</p>
            <button className="text-indigo-600 text-xs font-bold uppercase tracking-wide mt-1">View List</button>
         </div>
      </div>
    </div>
  );
};

export default Appointments;