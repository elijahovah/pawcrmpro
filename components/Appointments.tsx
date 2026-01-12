import React, { useState, useEffect } from 'react';
import { Calendar, Link, Clock, RefreshCw, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { AppView, Appointment } from '../types';
import { dataService } from '../services/dataService';

interface AppointmentsProps {
  onNavigate: (view: AppView) => void;
}

const Appointments: React.FC<AppointmentsProps> = ({ onNavigate }) => {
  const [calendlyUrl, setCalendlyUrl] = useState<string>('');
  const [googleSync, setGoogleSync] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        try {
            const settings = await dataService.getSettings();
            if (settings) {
                if (settings.calendlyUrl) setCalendlyUrl(settings.calendlyUrl);
                if (settings.googleCalendarConnected) setGoogleSync(true);
            }
            const apts = await dataService.getAppointments();
            setAppointments(apts);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-indigo-600"/></div>;

  return (
    <div className="max-w-[1600px] mx-auto p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
        <div className="flex gap-3">
             {googleSync && <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"><RefreshCw size={18} /> Sync with Google</button>}
            <button onClick={() => onNavigate(AppView.SETTINGS)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"><SettingsIcon size={18} /> Configure</button>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden flex flex-col relative">
        {calendlyUrl ? (
          <div className="flex-1 w-full h-full bg-slate-50"><iframe src={calendlyUrl} width="100%" height="100%" frameBorder="0" title="Calendly" className="min-h-[600px]"></iframe></div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm"><Calendar size={40} /></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Connect Your Calendar</h2>
            <button onClick={() => onNavigate(AppView.SETTINGS)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-all"><Link size={18} /> Connect Calendly</button>
          </div>
        )}
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Clock size={20} /></div><h3 className="font-bold text-slate-900">Next Up</h3></div>
            {appointments.length > 0 ? <><p className="text-slate-600 text-sm mb-1">{appointments[0].time} - {appointments[0].service}</p><p className="text-slate-900 font-bold">{appointments[0].petName} ({appointments[0].clientName})</p></> : <p className="text-slate-400 text-sm">No appointments scheduled.</p>}
         </div>
      </div>
    </div>
  );
};
export default Appointments;