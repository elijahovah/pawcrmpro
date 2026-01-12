import React, { useState, useEffect } from 'react';
import { Users, Dog, Calendar, DollarSign, Plus, Search, Bell, ArrowUpRight, ArrowRight, ScanLine, Sun, CloudRain, Clock } from 'lucide-react';
import StatsCard from './StatsCard';
import { Appointment, AppView } from '../types';
import { dataService } from '../services/dataService';

const GROOMING_QUOTES = [
  "\"The best therapist has fur and four legs.\"",
  "\"A dog is the only thing on earth that loves you more than he loves himself.\"",
  "\"Grooming is not just about looking good, it's about feeling good.\"",
  "\"Every matted coat is just a fluffy transformation waiting to happen.\"",
  "\"Patience is the groomer's superpower.\""
];

const WeatherWidget = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm text-slate-600">
            <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-lg font-bold text-slate-900 leading-none">
                    {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
                <div className="bg-amber-100 text-amber-500 p-1.5 rounded-full">
                    <Sun size={18} />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">72°F</p>
                    <p className="text-[10px] font-medium text-slate-400">Sunny</p>
                </div>
            </div>
        </div>
    );
};

const RevenueChart = ({ data }: { data: number[] }) => {
    const max = Math.max(...data, 100);
    return (
        <div className="relative h-64 w-full mt-4">
            {data.some(d => d > 0) ? (
                <>
                <div className="absolute inset-0 flex items-end justify-between px-2 gap-2">
                    {data.map((val, i) => {
                        const height = (val / max) * 100;
                        return (
                            <div key={i} className="w-full bg-indigo-50 rounded-t-sm relative group">
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 opacity-80 rounded-t-sm hover:opacity-100 transition-all duration-300" 
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity shadow-lg z-10">
                                        ${val.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-full h-px bg-slate-100 border-t border-dashed border-slate-200"></div>
                    ))}
                </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full flex-col text-slate-400 text-sm italic">
                    <DollarSign size={32} className="mb-2 opacity-20" />
                    <p>No revenue data recorded for this year.</p>
                </div>
            )}
        </div>
    );
};

interface DashboardProps {
    onNavigate?: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [quote, setQuote] = useState(GROOMING_QUOTES[0]);
  const [metrics, setMetrics] = useState({ clients: 0, pets: 0, appointments: 0, revenue: 0 });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [popularServices, setPopularServices] = useState<{name: string, percentage: number, count: number}[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Groomer');

  useEffect(() => {
    // Random quote
    setQuote(GROOMING_QUOTES[Math.floor(Math.random() * GROOMING_QUOTES.length)]);

    // Fetch Real Data
    const loadDashboardData = async () => {
        try {
            const settings = await dataService.getSettings();
            if (settings) setUserName(settings.ownerName.split(' ')[0]);

            const clients = await dataService.getClients();
            const pets = await dataService.getPets();
            const appointments = await dataService.getAppointments();

            // Calculate Metrics
            const totalClients = clients.length;
            const totalPets = pets.length;
            const pendingApts = appointments.filter(a => a.status !== 'Completed').length;
            
            // Estimate Revenue (Mock calculation based on appointments since we don't store price yet)
            // Assuming average price $80
            const completedApts = appointments.filter(a => a.status === 'Completed');
            const calculatedRevenue = completedApts.length * 80;

            setMetrics({
                clients: totalClients,
                pets: totalPets,
                appointments: pendingApts,
                revenue: calculatedRevenue
            });

            setRecentAppointments(appointments.slice(0, 3));

            // Calculate Popular Services
            const serviceCounts: Record<string, number> = {};
            appointments.forEach(a => {
                serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
            });
            const totalServices = appointments.length || 1;
            const sortedServices = Object.entries(serviceCounts)
                .map(([name, count]) => ({
                    name,
                    count,
                    percentage: (count / totalServices) * 100
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 4);
            
            setPopularServices(sortedServices);

            // Calculate Monthly Revenue for the current year
            const monthlyRevenue = new Array(12).fill(0);
            const currentYear = new Date().getFullYear();
            
            completedApts.forEach(apt => {
                // If appointment has a date, use it, otherwise ignore for chart or fallback
                // Assuming appointments without date might be old legacy or immediate walk-ins
                // For this logic, we try to parse ISO date strings
                if (apt.date) {
                    const d = new Date(apt.date);
                    if (d.getFullYear() === currentYear) {
                        monthlyRevenue[d.getMonth()] += 80; // Add standard service fee
                    }
                }
            });
            setRevenueData(monthlyRevenue);

        } catch (e) {
            console.error("Dashboard data load error", e);
        } finally {
            setLoading(false);
        }
    };

    loadDashboardData();
  }, []);

  const navigateTo = (view: AppView) => {
      if (onNavigate) onNavigate(view);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fadeIn">
      
      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good morning, {userName}! ☀️</h1>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-medium italic">
            <p>{quote}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           {/* Weather Widget */}
           <WeatherWidget />

           {/* Search Bar */}
           <div className="relative flex-1 md:w-64 group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
             <input 
              type="text" 
              placeholder="Search..." 
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
            value={metrics.clients} 
            trend="Active" 
            trendUp={true} 
            icon={<Users size={22} />} 
            description="Active accounts in CRM"
        />
        <StatsCard 
            title="Active Pets" 
            value={metrics.pets} 
            trend="Registered" 
            trendUp={true} 
            icon={<Dog size={22} />} 
            description="Checked in registry"
        />
        <StatsCard 
            title="Today's Appointments" 
            value={metrics.appointments} 
            trend="Pending" 
            trendUp={true} 
            icon={<Calendar size={22} />} 
            description="Upcoming bookings"
        />
        <StatsCard 
            title="Est. Revenue" 
            value={`$${metrics.revenue.toLocaleString()}`} 
            trend="YTD" 
            trendUp={true} 
            icon={<DollarSign size={22} />} 
            description="Total completed service value"
        />
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200 shadow-soft hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Revenue Trend</h2>
                    <p className="text-sm text-slate-500">Gross income for {new Date().getFullYear()}</p>
                  </div>
                  <button className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
                      View Report
                  </button>
              </div>
              <RevenueChart data={revenueData} />
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
                  {popularServices.length > 0 ? popularServices.map((service, idx) => (
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
                  )) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                        <p>No service data available.</p>
                    </div>
                  )}
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
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 min-h-[200px]">
            {recentAppointments.length > 0 ? (
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
                    {recentAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <img src={apt.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop'} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200 border-2 border-white shadow-sm" />
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
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <Calendar size={32} className="mb-2 opacity-50"/>
                    <p>No appointments scheduled yet.</p>
                </div>
            )}
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
              {[
                  { id: 1, text: "Call Mrs. Robinson about rescheduling", done: false },
                  { id: 2, text: "Order new shampoo supplies", done: false },
                  { id: 3, text: "Update vet records for Max", done: true },
              ].map(task => (
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