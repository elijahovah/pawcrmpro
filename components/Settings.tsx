import React, { useState, useEffect } from 'react';
import { Save, User, Store, Bell, Shield, Mail, Link, Calendar, Check, FileText, CreditCard, PieChart } from 'lucide-react';
import { BusinessConfig, NotificationPreferences } from '../types';

interface SettingsProps {
    config: BusinessConfig;
    onSave: (newConfig: BusinessConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config: initialConfig, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'notifications'>('general');
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setConfig(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
    setSaved(false);
  };

  const toggleIntegration = (key: 'stripeConnected' | 'quickbooksConnected' | 'googleCalendarConnected') => {
      setConfig(prev => ({ ...prev, [key]: !prev[key] }));
      setSaved(false);
  };

  const handleSave = () => {
      onSave(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Settings</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}
          >
            <Store size={18} /> General
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}
          >
            <Link size={18} /> Integrations
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-600 hover:bg-white hover:text-indigo-600'}`}
          >
            <Bell size={18} /> Notifications
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-soft">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4 mb-4">
                 <h2 className="text-xl font-bold text-slate-900">Business Profile</h2>
                 <p className="text-slate-500 text-sm">Manage your grooming salon details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Business Name</label>
                    <input 
                      type="text" 
                      name="businessName"
                      value={config.businessName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Owner Name</label>
                    <input 
                      type="text" 
                      name="ownerName"
                      value={config.ownerName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                        type="email" 
                        name="email"
                        value={config.email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900" 
                        />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={config.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900" 
                    />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={config.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900" 
                    />
                 </div>
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <FileText size={14} /> Cancellation Policy (for Reminders)
                    </label>
                    <textarea 
                      name="cancellationPolicy"
                      value={config.cancellationPolicy || ''}
                      onChange={handleChange}
                      rows={2}
                      placeholder="e.g. Please provide 24 hours notice..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 resize-none" 
                    />
                 </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5'}`}
                >
                    <Save size={18} /> {saved ? 'Saved Successfully' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
             <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-slate-900">External Integrations</h2>
                    <p className="text-slate-500 text-sm">Connect your favorite tools to automate your workflow.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Google Calendar */}
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all hover:shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500 overflow-hidden">
                                {/* Simple Google Calendar Icon Representation */}
                                <div className="relative w-8 h-8 bg-white flex items-center justify-center rounded text-xs font-bold border border-slate-100">
                                    <span className="text-blue-600">31</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Google Calendar</h3>
                                <p className="text-slate-600 text-sm">Sync appointments directly to your Google Calendar.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleIntegration('googleCalendarConnected')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${config.googleCalendarConnected ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                            {config.googleCalendarConnected ? 'Connected' : 'Connect'}
                        </button>
                    </div>

                    {/* Calendly */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500">
                                <Calendar size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900">Calendly</h3>
                                <p className="text-slate-600 text-sm mt-1">Embed your booking page for client self-scheduling.</p>
                                
                                <div className="mt-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Scheduling Link</label>
                                    <input 
                                        type="text" 
                                        name="calendlyUrl"
                                        placeholder="https://calendly.com/your-name"
                                        value={config.calendlyUrl}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mailchimp */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all hover:shadow-md">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-sm text-slate-900">
                                <Mail size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900">Mailchimp</h3>
                                <p className="text-slate-600 text-sm mt-1">Sync your client list for automated email marketing campaigns.</p>
                                
                                <div className="mt-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">API Key</label>
                                    <input 
                                        type="password" 
                                        name="mailchimpApiKey"
                                        placeholder="md-xxxxxxxxxxxxxxxxxxxx"
                                        value={config.mailchimpApiKey}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 text-sm"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Your API key is stored securely.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stripe */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all hover:shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#635BFF] rounded-xl flex items-center justify-center shadow-sm text-white">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Stripe Payments</h3>
                                <p className="text-slate-600 text-sm">Accept credit cards and manage invoices.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleIntegration('stripeConnected')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${config.stripeConnected ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                            {config.stripeConnected ? 'Connected' : 'Connect Stripe'}
                        </button>
                    </div>

                    {/* QuickBooks */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-all hover:shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#2CA01C] rounded-xl flex items-center justify-center shadow-sm text-white">
                                <PieChart size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">QuickBooks Online</h3>
                                <p className="text-slate-600 text-sm">Sync transactions for easy accounting.</p>
                            </div>
                        </div>
                         <button 
                            onClick={() => toggleIntegration('quickbooksConnected')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${config.quickbooksConnected ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                            {config.quickbooksConnected ? 'Connected' : 'Connect'}
                        </button>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5'}`}
                    >
                        <Save size={18} /> {saved ? 'Integrations Updated' : 'Save Integrations'}
                    </button>
                </div>
             </div>
          )}

          {activeTab === 'notifications' && (
              <div className="space-y-8 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
                      <p className="text-slate-500 text-sm">Manage how you and your clients receive alerts.</p>
                  </div>

                  {/* Client Communication Group */}
                  <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <Mail size={16} /> Client Communication
                      </h3>
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                          <div className="p-5 flex items-center justify-between">
                             <div>
                                <h4 className="font-bold text-slate-900">Email Appointment Reminders</h4>
                                <p className="text-sm text-slate-500 mt-1">Send automatic emails to clients 24h before appointment.</p>
                             </div>
                             <button 
                                onClick={() => handleNotificationToggle('emailReminders')}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${config.notifications.emailReminders ? 'bg-indigo-600' : 'bg-slate-300'}`}
                             >
                                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${config.notifications.emailReminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </button>
                          </div>
                          
                          <div className="p-5 flex items-center justify-between">
                             <div>
                                <h4 className="font-bold text-slate-900">SMS Appointment Reminders</h4>
                                <p className="text-sm text-slate-500 mt-1">Send text message alerts (requires SMS credits).</p>
                             </div>
                             <button 
                                onClick={() => handleNotificationToggle('smsReminders')}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${config.notifications.smsReminders ? 'bg-indigo-600' : 'bg-slate-300'}`}
                             >
                                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${config.notifications.smsReminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </button>
                          </div>

                          <div className="p-5 flex items-center justify-between">
                             <div>
                                <h4 className="font-bold text-slate-900">Client Preference Selection</h4>
                                <p className="text-sm text-slate-500 mt-1">Allow clients to choose their preferred channel (Email/SMS).</p>
                             </div>
                             <button 
                                onClick={() => handleNotificationToggle('allowClientPreference')}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${config.notifications.allowClientPreference ? 'bg-indigo-600' : 'bg-slate-300'}`}
                             >
                                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${config.notifications.allowClientPreference ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </button>
                          </div>

                          <div className="p-5 flex items-center justify-between">
                             <div>
                                <h4 className="font-bold text-slate-900">Marketing Campaigns</h4>
                                <p className="text-sm text-slate-500 mt-1">Receive copies of all automated marketing emails.</p>
                             </div>
                             <button 
                                onClick={() => handleNotificationToggle('marketingEmails')}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${config.notifications.marketingEmails ? 'bg-indigo-600' : 'bg-slate-300'}`}
                             >
                                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${config.notifications.marketingEmails ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </button>
                          </div>
                      </div>
                  </div>

                  {/* Business Alerts Group */}
                  <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <Shield size={16} /> Business Alerts
                      </h3>
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                          <div className="p-5 flex items-center justify-between">
                             <div>
                                <h4 className="font-bold text-slate-900">New Client Registration</h4>
                                <p className="text-sm text-slate-500 mt-1">Get notified when a new client creates a profile via intake.</p>
                             </div>
                             <button 
                                onClick={() => handleNotificationToggle('newClientAlerts')}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${config.notifications.newClientAlerts ? 'bg-indigo-600' : 'bg-slate-300'}`}
                             >
                                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${config.notifications.newClientAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </button>
                          </div>

                          <div className="p-5 flex items-center justify-between">
                             <div>
                                <h4 className="font-bold text-slate-900">Daily Business Summary</h4>
                                <p className="text-sm text-slate-500 mt-1">Receive an end-of-day email with revenue and stats.</p>
                             </div>
                             <button 
                                onClick={() => handleNotificationToggle('dailySummary')}
                                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${config.notifications.dailySummary ? 'bg-indigo-600' : 'bg-slate-300'}`}
                             >
                                 <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${config.notifications.dailySummary ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </button>
                          </div>
                      </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5'}`}
                    >
                        <Save size={18} /> {saved ? 'Preferences Saved' : 'Save Preferences'}
                    </button>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;