import React, { useState } from 'react';
import { ShieldAlert, Search, AlertTriangle, MapPin, Flag, ChevronRight, ShieldCheck, Siren, Copy, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { analyzeBreederText } from '../services/geminiService';
import { BreederReport } from '../types';

// Mock Database of Reports
const MOCK_REPORTS: BreederReport[] = [
    {
        id: '1',
        kennelName: 'Tiny Teacup Pups',
        breederName: 'Unknown',
        location: 'Miami, FL',
        riskLevel: 'High',
        reportCount: 12,
        lastReported: '2 days ago',
        flags: ['Sick puppies', 'Fake health certs', 'Ghosted after deposit', 'No visits allowed'],
        description: 'Multiple reports of puppies arriving with Parvo. Breeder refuses refunds and blocks numbers after delivery. Photos on website are stolen.'
    },
    {
        id: '2',
        kennelName: 'Golden Valley Retrievers',
        breederName: 'John Smith',
        location: 'Lancaster, PA',
        riskLevel: 'Medium',
        reportCount: 3,
        lastReported: '1 week ago',
        flags: ['Kennel conditions', 'Overbreeding'],
        description: 'Dogs appear to be kept in outdoor runs with minimal socialization. Puppies are healthy but shy/fearful. High volume breeder.'
    },
    {
        id: '3',
        kennelName: 'Exotic Frenchies 4 U',
        breederName: 'Sarah J.',
        location: 'Dallas, TX',
        riskLevel: 'High',
        reportCount: 8,
        lastReported: '3 weeks ago',
        flags: ['Merle fraud', 'Genetic defects', 'Cash App only'],
        description: 'Selling "rare" colors that do not exist in breed standard. Puppies developed severe respiratory issues by 6 months. Refuses to show parents.'
    }
];

const BreederWatch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [scanText, setScanText] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ riskLevel: string, summary: string, redFlags: string[], questionsToAsk: string[] } | null>(null);

    const filteredReports = MOCK_REPORTS.filter(r => 
        r.kennelName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleScan = async () => {
        if (!scanText.trim()) return;
        setIsScanning(true);
        const result = await analyzeBreederText(scanText);
        setScanResult(result);
        setIsScanning(false);
    };

    return (
        <div className="max-w-[1600px] mx-auto p-8 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-rose-600" size={32} />
                        Breeder Watch
                    </h1>
                    <p className="text-slate-500 mt-1">Community-sourced directory & AI fraud detection.</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm max-w-lg">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p><strong>Disclaimer:</strong> This database is based on user-submitted reports and AI analysis. Please verify all information independently.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full min-h-0">
                {/* Left: Directory */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Report Directory</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search kennel name, breeder, or city..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {filteredReports.map(report => (
                            <div key={report.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            {report.kennelName}
                                            {report.riskLevel === 'High' && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] uppercase font-bold rounded-full tracking-wide">High Risk</span>}
                                            {report.riskLevel === 'Medium' && <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] uppercase font-bold rounded-full tracking-wide">Caution</span>}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><UserIcon size={14}/> {report.breederName}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14}/> {report.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-rose-600">{report.reportCount}</div>
                                        <div className="text-xs text-slate-400 font-medium uppercase">Reports</div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {report.flags.map((flag, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                            {flag}
                                        </span>
                                    ))}
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 italic border-l-4 border-rose-400">
                                    "{report.description}"
                                </div>
                                
                                <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                                    <span>Last reported: {report.lastReported}</span>
                                    <button className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                                        View Full Details <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: AI Scanner */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                                <Sparkles className="text-yellow-400" /> Red Flag Scanner
                            </h2>
                            <p className="text-indigo-200 mb-6">Paste an email, text message, or website description from a breeder. Our AI will analyze it for signs of scams or unethical practices.</p>
                            
                            <textarea 
                                value={scanText}
                                onChange={(e) => setScanText(e.target.value)}
                                placeholder="Paste breeder communication here..."
                                className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none mb-4"
                            ></textarea>

                            <button 
                                onClick={handleScan}
                                disabled={isScanning || !scanText}
                                className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {isScanning ? <Loader2 className="animate-spin" /> : <Siren size={20} />}
                                {isScanning ? 'Analyzing Patterns...' : 'Scan for Danger'}
                            </button>
                        </div>
                    </div>

                    {scanResult && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-8 animate-fadeIn flex-1">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm text-2xl
                                    ${scanResult.riskLevel === 'High' ? 'bg-rose-100 text-rose-600' : 
                                      scanResult.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                                      'bg-emerald-100 text-emerald-600'}`}>
                                    {scanResult.riskLevel === 'High' ? <AlertCircle size={32} /> : 
                                     scanResult.riskLevel === 'Medium' ? <AlertTriangle size={32} /> : 
                                     <ShieldCheck size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Risk Assessment: {scanResult.riskLevel}</h3>
                                    <p className="text-slate-500 text-sm mt-1">{scanResult.summary}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Flag size={16} className="text-rose-500" /> Detected Red Flags
                                    </h4>
                                    {scanResult.redFlags.length > 0 ? (
                                        <ul className="space-y-2">
                                            {scanResult.redFlags.map((flag, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-rose-50 p-2 rounded-lg">
                                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></span>
                                                    {flag}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No obvious red flags detected in this text.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-indigo-600" /> Recommended Questions
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-3">Ask these to verify the breeder:</p>
                                    <div className="space-y-3">
                                        {scanResult.questionsToAsk.map((q, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 group cursor-pointer hover:bg-indigo-100 transition-colors">
                                                <span className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                                                <p className="text-sm font-medium text-indigo-900 flex-1">{q}</p>
                                                <Copy size={14} className="text-indigo-400 group-hover:text-indigo-600" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserIcon = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default BreederWatch;