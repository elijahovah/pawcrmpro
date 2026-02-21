import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Users, Sparkles, Clock, CheckCircle, Smartphone, Monitor, ChevronRight, BarChart, RefreshCw, Loader2, Calendar, User, Dog } from 'lucide-react';
import { MarketingCampaign, BusinessConfig } from '../types';
import { generateMarketingCopy, generateAppointmentReminder } from '../services/geminiService';

// Mock History Data
const MOCK_CAMPAIGNS: MarketingCampaign[] = [
    {
        id: '1',
        name: 'Spring Shedding Special',
        type: 'Email',
        audience: 'Dog Owners',
        sentDate: '2023-04-10',
        status: 'Sent',
        stats: { sent: 856, opened: 642, clicked: 128 }
    },
    {
        id: '2',
        name: 'Holiday Hours Update',
        type: 'SMS',
        audience: 'All Clients',
        sentDate: '2023-12-20',
        status: 'Sent',
        stats: { sent: 1248, clicked: 980 }
    },
    {
        id: '3',
        name: 'Puppy Promo',
        type: 'Email',
        audience: 'Puppy Owners',
        sentDate: '2024-01-15',
        status: 'Scheduled',
        stats: { sent: 0 }
    }
];

interface MessagesProps {
    config?: BusinessConfig;
}

const Messages: React.FC<MessagesProps> = ({ config }) => {
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [channel, setChannel] = useState<'Email' | 'SMS'>('SMS');
    const [audience, setAudience] = useState('All Clients');
    const [messageType, setMessageType] = useState<'BROADCAST' | 'REMINDER'>('REMINDER');
    
    // Compose State
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Reminder Details State
    const [reminderDetails, setReminderDetails] = useState({
        clientName: 'Jane Doe',
        petName: 'Bella',
        service: 'Full Groom',
        appointmentTime: 'Tomorrow at 10:00 AM'
    });

    const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReminderDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleMagicDraft = async () => {
        setIsGenerating(true);
        let result = { subject: '', content: '' };
        
        if (messageType === 'BROADCAST') {
            if (!topic) {
                setIsGenerating(false);
                return;
            }
            result = await generateMarketingCopy(topic, channel, audience);
        } else {
            result = await generateAppointmentReminder(
                reminderDetails.clientName,
                reminderDetails.petName,
                reminderDetails.service,
                reminderDetails.appointmentTime,
                channel,
                config?.cancellationPolicy
            );
        }

        if (channel === 'Email') setSubject(result.subject);
        setContent(result.content);
        setIsGenerating(false);
    };

    return (
        <div className="max-w-[1600px] mx-auto p-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Client Communication</h1>
                    <p className="text-slate-500 mt-1">Broadcast updates, promotions, and reminders.</p>
                </div>
                
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('compose')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'compose' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Compose New
                    </button>
                    <button 
                         onClick={() => setActiveTab('history')}
                         className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Campaign History
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'compose' ? (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                    
                    {/* Left: Editor */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 flex flex-col overflow-y-auto">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                {channel === 'Email' ? <Mail size={18} /> : <MessageSquare size={18} />}
                            </span>
                            Configure Message
                        </h2>

                        <div className="space-y-6 flex-1">
                            {/* Message Type Toggle */}
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                <button
                                    onClick={() => setMessageType('BROADCAST')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${messageType === 'BROADCAST' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Broadcast Campaign
                                </button>
                                <button
                                    onClick={() => setMessageType('REMINDER')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${messageType === 'REMINDER' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Appointment Reminder
                                </button>
                            </div>

                            {/* Channel Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setChannel('Email')}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${channel === 'Email' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                                >
                                    <Mail size={20} /> Email
                                </button>
                                <button 
                                    onClick={() => setChannel('SMS')}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${channel === 'SMS' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                                >
                                    <MessageSquare size={20} /> SMS
                                </button>
                            </div>

                            {/* Audience (Only for Broadcast) */}
                            {messageType === 'BROADCAST' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Audience</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                        <select 
                                            value={audience}
                                            onChange={(e) => setAudience(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 appearance-none"
                                        >
                                            <option>All Clients (1,248)</option>
                                            <option>Dog Owners (856)</option>
                                            <option>Cat Owners (392)</option>
                                            <option>Inactive &gt; 6 Months (145)</option>
                                            <option>Puppy Program (85)</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-3.5 text-slate-400 rotate-90" size={16} />
                                    </div>
                                </div>
                            )}

                            {/* AI Prompt Section */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                                        <Sparkles size={14} /> AI Magic Draft
                                    </label>
                                </div>
                                
                                {messageType === 'BROADCAST' ? (
                                    <div className="space-y-3">
                                        <input 
                                            type="text" 
                                            placeholder={`e.g., ${channel === 'Email' ? 'Summer grooming discount for dogs' : 'Reminder we are closed for Labor Day'}`}
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Client Name</label>
                                            <div className="relative">
                                                <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                                <input name="clientName" value={reminderDetails.clientName} onChange={handleReminderChange} className="w-full pl-8 pr-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Pet Name</label>
                                            <div className="relative">
                                                <Dog size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                                <input name="petName" value={reminderDetails.petName} onChange={handleReminderChange} className="w-full pl-8 pr-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Service</label>
                                            <input name="service" value={reminderDetails.service} onChange={handleReminderChange} className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Time</label>
                                            <div className="relative">
                                                <Clock size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                                <input name="appointmentTime" value={reminderDetails.appointmentTime} onChange={handleReminderChange} className="w-full pl-8 pr-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleMagicDraft}
                                    disabled={isGenerating || (messageType === 'BROADCAST' && !topic)}
                                    className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    Generate {messageType === 'BROADCAST' ? 'Campaign Draft' : 'Reminder Message'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {channel === 'Email' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Subject Line</label>
                                        <input 
                                            type="text" 
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Enter a catchy subject..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Message Body</label>
                                    <textarea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Type your message here..."
                                        rows={8}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 resize-none leading-relaxed"
                                    ></textarea>
                                    <div className="text-right mt-2 text-xs text-slate-400">
                                        {content.length} characters
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                                <Clock size={18} /> Schedule
                            </button>
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                                <Send size={18} /> Send {messageType === 'BROADCAST' ? 'Broadcast' : 'Reminder'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex flex-col h-full bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden relative">
                         <div className="absolute top-0 left-0 right-0 p-4 bg-white/50 backdrop-blur-sm border-b border-white/50 z-10 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                {channel === 'SMS' ? <Smartphone size={16} /> : <Monitor size={16} />} 
                                Live Preview
                            </span>
                         </div>
                         
                         <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                            {channel === 'SMS' ? (
                                /* SMS Preview Frame */
                                <div className="w-[320px] bg-white rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-slate-800 z-20 flex justify-center">
                                        <div className="w-24 h-4 bg-slate-900 rounded-b-xl"></div>
                                    </div>
                                    <div className="bg-slate-50 h-[600px] flex flex-col pt-12 pb-8 px-4">
                                        <div className="text-center mb-6">
                                            <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold text-slate-500">P</div>
                                            <p className="text-xs font-bold text-slate-400">PawCRM</p>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            {content ? (
                                                <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tl-sm text-sm shadow-sm leading-relaxed">
                                                    {content}
                                                    <br/>
                                                    <br/>
                                                    <span className="text-[10px] opacity-70">Reply STOP to unsubscribe.</span>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-200 h-24 rounded-2xl animate-pulse w-3/4"></div>
                                            )}
                                        </div>
                                        <div className="mt-auto">
                                            <div className="h-10 border border-slate-300 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Email Preview Frame */
                                <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-100 border-b border-slate-200 p-3 flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <div className="p-8">
                                        <div className="border-b border-slate-100 pb-6 mb-6">
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{subject || <span className="text-slate-300 italic">Subject Line...</span>}</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">P</div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">PawCRM Grooming</p>
                                                    <p className="text-xs text-slate-500">to {messageType === 'REMINDER' ? reminderDetails.clientName : audience}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {content || <div className="space-y-3 opacity-30">
                                                <div className="h-4 bg-slate-300 rounded w-full"></div>
                                                <div className="h-4 bg-slate-300 rounded w-5/6"></div>
                                                <div className="h-4 bg-slate-300 rounded w-4/6"></div>
                                            </div>}
                                        </div>
                                        {content && (
                                            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                                                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm">
                                                    {messageType === 'REMINDER' ? 'Confirm Appointment' : 'Book Now'}
                                                </button>
                                                <p className="mt-6 text-xs text-slate-400">
                                                    123 Puppy Lane, Dogville, CA 90210 • <a href="#" className="underline">Unsubscribe</a>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            ) : (
                /* History Tab */
                <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden animate-fadeIn">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Campaign Name</th>
                                <th className="px-6 py-4">Audience</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Performance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {MOCK_CAMPAIGNS.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${campaign.type === 'Email' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {campaign.type === 'Email' ? <Mail size={16} /> : <MessageSquare size={16} />}
                                            </div>
                                            <span className="font-bold text-slate-900">{campaign.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{campaign.audience}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{campaign.sentDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            campaign.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            campaign.status === 'Scheduled' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {campaign.status === 'Sent' ? (
                                            <div className="flex gap-4 text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400">Sent</span>
                                                    <span className="font-bold">{campaign.stats.sent}</span>
                                                </div>
                                                {campaign.stats.opened && (
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-400">Open Rate</span>
                                                        <span className="font-bold text-emerald-600">{Math.round((campaign.stats.opened / campaign.stats.sent) * 100)}%</span>
                                                    </div>
                                                )}
                                                {campaign.stats.clicked && (
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-400">Clicks</span>
                                                        <span className="font-bold text-indigo-600">{campaign.stats.clicked}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic text-xs">No data yet</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs">View Report</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Messages;