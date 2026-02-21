import React, { useState, useEffect } from 'react';
import { Users, Dog, Calendar, DollarSign, Plus, Search, Bell, ArrowUpRight, ArrowRight, ScanLine, UploadCloud, Sparkles } from 'lucide-react';
import StatsCard from './StatsCard';
import { Appointment, AppView } from '../types';

// Mock Data
const RECENT_APPOINTMENTS: Appointment[] = [
  { id: '1', clientName: 'Sarah Conner', petName: 'Terminator', service: 'Full Groom', time: '10:00 AM', status: 'Confirmed', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: '2', clientName: 'John Wick', petName: 'Daisy', service: 'Bath & Brush', time: '11:30 AM', status: 'Pending', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
  { id: '3', clientName: 'Ellen Ripley', petName: 'Jonesy', service: 'Nail Trim', time: '1:00 PM', status: 'Completed', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
];

const TASKS = [
  { id: 1, text: "Call Mrs. Robinson about rescheduling", done: false },
  { id: 2, text: "Order new shampoo supplies", done: false },
  { id: 3, text: "Update vet records for Max", done: true },
];

const POPULAR_SERVICES = [
    { name: 'Full Grooming', percentage: 45, count: 124 },
    { name: 'Bath & Brush', percentage: 30, count: 82 },
    { name: 'Nail Trim', percentage: 15, count: 41 },
    { name: 'Teeth Cleaning', percentage: 10, count: 28 },
];

const GROOMING_QUOTES = [
  "\"The best therapist has fur and four legs.\"",
  "\"A dog is the only thing on earth that loves you more than he loves himself.\"",
  "\"Grooming is not just about looking good, it's about feeling good.\"",
  "\"Every matted coat is just a fluffy transformation waiting to happen.\"",
  "\"Patience is the groomer's superpower.\""
];

const RevenueChart = () => (
    <div className="relative h-64 w-full mt-4">
        {/* Simple CSS-based Area Chart simulation */}
        <div className="absolute inset-0 flex items-end justify-between px-2 gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div key={i} className="w-full bg-indigo-50 rounded-t-sm relative group">
                    <div 
                        className="absolute bottom-0 left-0 right-0 bg-indigo-500 opacity-80 rounded-t-sm hover:opacity-100 transition-all duration-300" 
                        style={{ height: `${h}%` }}
                    >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity shadow-lg">
                            ${h * 120}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-full h-px bg-slate-100 border-t border-dashed border-slate-200"></div>
            ))}
        </div>
    </div>
);

interface DashboardProps {
    onNavigate?: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [quote, setQuote] = useState(GROOMING_QUOTES[0]);

  useEffect(() => {
    // Random quote on mount
    setQuote(GROOMING_QUOTES[Math.floor(Math.random() * GROOMING_QUOTES.length)]);
  }, []);

  const navigateTo = (view: AppView) => {
      if (onNavigate) onNavigate(view);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good morning, Carol! ☀️</h1>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-medium italic">
            <Sparkles size={14} className="text-yellow-500" />
            <p>{quote}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           {/* Search Bar */}
           <div className="relative flex-1 md:w-80 group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
             <input 
              type="text" 
              placeholder="Search clients, pets, or invoices..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
             />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm relative transition-all hover:scale-105 active:scale-95">
             <Bell size={20} />
             <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
           </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
            title="Total Clients" 
            value="1,248" 
            trend="+24" 
            trendUp={true} 
            icon={<Users size={22} />} 
            description="Active accounts in CRM"
        />
        <StatsCard 
            title="Active Pets" 
            value="856" 
            trend="+12" 
            trendUp={true} 
            icon={<Dog size={22} />} 
            description="Checked in last 6 months"
        />
        <StatsCard 
            title="Today's Appointments" 
            value="8" 
            trend="Full Capacity" 
            trendUp={true} 
            icon={<Calendar size={22} />} 
            description="3 pending confirmation"
        />
        <StatsCard 
            title="Monthly Revenue" 
            value="$12,450" 
            trend="+8.2%" 
            trendUp={true} 
            icon={<DollarSign size={22} />} 
            description="vs. $11,500 last month"
        />
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 shadow-soft hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Revenue Trend</h2>
                    <p className="text-sm text-slate-500">Gross income over last 12 months</p>
                  </div>
                  <button className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
                      View Report
                  </button>
              </div>
              <RevenueChart />
              <div className="flex justify-between mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                  <span>Dec</span>
              </div>
          </div>

          {/* Service Popularity */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 shadow-soft hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Top Services</h2>
              <div className="space-y-6 flex-1">
                  {POPULAR_SERVICES.map((service, idx) => (
                      <div key={idx}>
                          <div className="flex justify-between text-sm font-medium mb-2">
                              <span className="text-slate-700">{service.name}</span>
                              <span className="text-slate-500">{service.count} bookings</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${service.percentage}%` }}
                              ></div>
                          </div>
                      </div>
                  ))}
              </div>
              <button className="mt-6 w-full py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                  View Service Menu <ArrowRight size={16} />
              </button>
          </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Appointments (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Recent Appointments</h2>
            <button 
                onClick={() => navigateTo(AppView.APPOINTMENTS)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-transform hover:translate-x-1"
            >
                View All <ArrowUpRight size={16}/>
            </button>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {RECENT_APPOINTMENTS.map((apt) => (
                    <tr key={apt.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={apt.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200 border-2 border-white shadow-sm" />
                          <div>
                            <div className="font-bold text-slate-900">{apt.clientName}</div>
                            <div className="text-xs text-slate-500 font-medium">{apt.petName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{apt.service}</td>
                      <td className="px-6 py-4 text-slate-500">{apt.time}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border
                          ${apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            apt.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                            'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-slate-400 hover:text-indigo-600 font-medium text-sm transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Tasks (Right 1/3) */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigateTo(AppView.CLIENTS)}
                className="p-6 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                    <Plus size={24} />
                </div>
                <span className="text-sm font-bold">Add Client</span>
              </button>
              
              <button 
                onClick={() => navigateTo(AppView.APPOINTMENTS)}
                className="p-6 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:border-indigo-500 hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <div className="p-2 bg-slate-100 text-slate-600 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Calendar size={24} />
                </div>
                <span className="text-sm font-bold">Book Apt</span>
              </button>

              <button 
                onClick={() => navigateTo(AppView.BATCH_INTAKE)}
                className="col-span-2 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                <div className="p-1.5 bg-white/20 rounded-lg">
                    <ScanLine size={18} />
                </div>
                <span className="text-sm font-bold">Scan Handwritten Intake</span>
              </button>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">My Tasks</h2>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 p-5 shadow-soft space-y-4">
              {TASKS.map(task => (
                <div key={task.id} className="flex items-start gap-3 group p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                  <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                      {task.done && <Plus size={14} className="rotate-45" />}
                  </div>
                  <span className={`text-sm font-medium transition-all ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
              <button className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 border-t border-slate-100 mt-2 pt-4 transition-colors">
                  + Add New Task
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;