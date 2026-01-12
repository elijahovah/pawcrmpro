import React, { useState, useEffect } from 'react';
import { Save, Store, Bell, Link, Mail, FileText, Palette, Image as ImageIcon, Sparkles, Loader2, Upload } from 'lucide-react';
import { BusinessConfig, NotificationPreferences } from '../types';
import { generateBrandIdentity } from '../services/geminiService';
import { dataService } from '../services/dataService';

interface SettingsProps {
    config: BusinessConfig;
    onSave: (newConfig: BusinessConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config: initialConfig, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'notifications' | 'branding'>('general');
  const [saved, setSaved] = useState(false);
  const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(initialConfig);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { setConfig(initialConfig); }, [initialConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setConfig({ ...config, [e.target.name]: e.target.value }); setSaved(false); };
  const handleNotificationToggle = (key: keyof NotificationPreferences) => { setConfig(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: !prev.notifications[key] } })); setSaved(false); };
  const toggleIntegration = (key: 'stripeConnected' | 'quickbooksConnected' | 'googleCalendarConnected') => { setConfig(prev => ({ ...prev, [key]: !prev[key] })); setSaved(false); };

  const handleGenerateBrand = async () => {
    setIsGeneratingBrand(true);
    const result = await generateBrandIdentity(config.businessName);
    setConfig(prev => ({ ...prev, brandTagline: result.tagline }));
    setIsGeneratingBrand(false);
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      const url = await dataService.uploadFile(file, 'branding', `logo_${Date.now()}`);
      if (url) setConfig(prev => ({ ...prev, logoUrl: url }));
      setIsUploading(false);
  };

  const handleSave = () => { onSave(config); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Settings</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}><Store size={18} /> General</button>
          <button onClick={() => setActiveTab('branding')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'branding' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}><Palette size={18} /> Branding</button>
          <button onClick={() => setActiveTab('integrations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}><Link size={18} /> Integrations</button>
          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}><Bell size={18} /> Notifications</button>
        </div>
        <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-soft">
          {activeTab === 'general' && (
            <div className="space-y-6">
               <h2 className="text-xl font-bold">Business Profile</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Business Name</label><input type="text" name="businessName" value={config.businessName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Owner Name</label><input type="text" name="ownerName" value={config.ownerName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Email</label><input type="email" name="email" value={config.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                 <div><label className="text-xs font-bold text-slate-500 uppercase">Phone</label><input type="text" name="phone" value={config.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                 <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Address</label><input type="text" name="address" value={config.address} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
                 <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Cancellation Policy</label><textarea name="cancellationPolicy" value={config.cancellationPolicy} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-slate-50 border rounded-xl" /></div>
               </div>
            </div>
          )}
          {activeTab === 'branding' && (
            <div className="space-y-8">
               <h2 className="text-xl font-bold">Brand Identity</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Logo</label>
                        <div className="flex gap-2">
                             <input type="text" name="logoUrl" placeholder="https://..." value={config.logoUrl || ''} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm" />
                             <label className="bg-slate-100 p-3 rounded-xl cursor-pointer hover:bg-slate-200 text-slate-600 flex items-center justify-center">{isUploading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20}/>}<input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload}/></label>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Brand Color</label>
                        <div className="flex gap-3 items-center"><input type="color" name="brandColor" value={config.brandColor || '#4f46e5'} onChange={handleChange} className="w-12 h-12 rounded-xl cursor-pointer border-none" /><input type="text" name="brandColor" value={config.brandColor || '#4f46e5'} onChange={handleChange} className="flex-1 px-4 py-3 bg-slate-50 border rounded-xl text-sm font-mono" /></div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tagline</label>
                        <div className="flex gap-2"><input type="text" name="brandTagline" value={config.brandTagline || ''} onChange={handleChange} className="flex-1 px-4 py-3 bg-slate-50 border rounded-xl text-sm" /><button onClick={handleGenerateBrand} disabled={isGeneratingBrand} className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">{isGeneratingBrand ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}</button></div>
                      </div>
                  </div>
                  <div className="bg-slate-100 rounded-2xl p-6 flex items-center justify-center border border-slate-200">
                      <div className="w-64 bg-white rounded-xl shadow-lg overflow-hidden">
                          <div className="h-32 flex flex-col items-center justify-center relative p-4 text-center" style={{ backgroundColor: config.brandColor || '#4f46e5' }}>
                              {config.logoUrl && <img src={config.logoUrl} className="w-12 h-12 bg-white rounded-lg object-contain p-1 mb-2 shadow-sm" />}
                              <h3 className="text-white font-bold text-sm">{config.businessName || 'Your Business'}</h3>
                              <p className="text-white/80 text-xs mt-1">{config.brandTagline || 'Tagline'}</p>
                          </div>
                          <div className="p-4 space-y-2"><div className="h-2 bg-slate-100 rounded w-3/4"></div><div className="h-2 bg-slate-100 rounded w-full"></div></div>
                      </div>
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'integrations' && (
             <div className="space-y-6">
                <h2 className="text-xl font-bold">External Integrations</h2>
                <div className="bg-slate-50 p-6 rounded-2xl border flex justify-between items-center"><div><h3 className="font-bold">Google Calendar</h3><p className="text-slate-600 text-sm">Sync appointments.</p></div><button onClick={() => toggleIntegration('googleCalendarConnected')} className={`px-4 py-2 rounded-lg font-bold text-sm ${config.googleCalendarConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200'}`}>{config.googleCalendarConnected ? 'Connected' : 'Connect'}</button></div>
             </div>
          )}
          {activeTab === 'notifications' && (
              <div className="space-y-6"><h2 className="text-xl font-bold">Notification Preferences</h2><div className="bg-slate-50 rounded-2xl border divide-y"><div className="p-5 flex justify-between"><span>Email Reminders</span><button onClick={() => handleNotificationToggle('emailReminders')} className={`w-14 h-8 rounded-full p-1 transition-all ${config.notifications.emailReminders ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${config.notifications.emailReminders ? 'translate-x-6' : ''}`}></div></button></div></div></div>
          )}
          <div className="pt-6 flex justify-end border-t mt-6"><button onClick={handleSave} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}><Save size={18} /> {saved ? 'Saved' : 'Save Changes'}</button></div>
        </div>
      </div>
    </div>
  );
};
export default Settings;