import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Dog, 
  Bot, 
  ScanLine, 
  MessageSquare, 
  Settings, 
  LogOut,
  UploadCloud,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { AppView, BusinessConfig } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  config: BusinessConfig;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, config }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: AppView.CLIENTS, label: 'Clients', icon: <Users size={18} /> },
    { id: AppView.APPOINTMENTS, label: 'Appointments', icon: <Calendar size={18} /> },
    { id: AppView.PETS, label: 'Pets', icon: <Dog size={18} /> },
    { id: AppView.AI_ASSISTANT, label: 'AI Assistant', icon: <Bot size={18} /> },
    { id: AppView.BREED_IDENTIFIER, label: 'Breed ID', icon: <ScanLine size={18} /> },
    { id: AppView.MESSAGES, label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: AppView.BREEDER_WATCH, label: 'Breeder Watch', icon: <ShieldAlert size={18} /> },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavClick = (view: AppView) => {
    onChangeView(view);
    setIsOpen(false);
  };

  const brandColor = config.brandColor || '#4f46e5';

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-white text-slate-800 rounded-xl shadow-lg border border-slate-200"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shrink-0 shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="p-8 flex items-center gap-3">
          {config.logoUrl ? (
            <img 
                src={config.logoUrl} 
                alt="Logo" 
                className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-100" 
            />
          ) : (
            <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: brandColor }}
            >
                <Dog size={24} />
            </div>
          )}
          <div>
            <h1 className="font-bold text-slate-900 text-lg tracking-tight leading-tight max-w-[150px] truncate">
                {config.businessName}
            </h1>
            <p 
                className="text-[10px] uppercase tracking-widest font-bold truncate max-w-[150px]"
                style={{ color: brandColor }}
            >
                {config.brandTagline || "Pro Edition"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden hover:scale-[1.02] active:scale-[0.98]
                ${currentView === item.id 
                  ? 'bg-slate-50 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
               style={{ color: currentView === item.id ? brandColor : undefined }}
            >
              <div className="flex items-center gap-3 relative z-10">
                <span className={`${currentView === item.id ? '' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                {item.label}
              </div>
              {currentView === item.id && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }}></div>
              )}
            </button>
          ))}

          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-8">Tools</p>
          
          <button 
            onClick={() => handleNavClick(AppView.BATCH_INTAKE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
              ${currentView === AppView.BATCH_INTAKE 
                ? 'bg-slate-50 border border-slate-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            style={{ color: currentView === AppView.BATCH_INTAKE ? brandColor : undefined }}
          >
             <UploadCloud size={18} />
             <span>Batch Intake</span>
          </button>

           <button 
            onClick={() => handleNavClick(AppView.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
              ${currentView === AppView.SETTINGS 
                ? 'bg-slate-50 border border-slate-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
             style={{ color: currentView === AppView.SETTINGS ? brandColor : undefined }}
          >
             <Settings size={18} />
             <span>Settings</span>
          </button>

        </nav>

        {/* User Profile / Sign Out */}
        <div className="p-4 border-t border-slate-100">
          <div 
              onClick={() => handleNavClick(AppView.SETTINGS)}
              className="bg-slate-50 rounded-xl p-3 flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-colors hover:scale-[1.02]"
          >
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-xs" style={{ color: brandColor }}>
                      {getInitials(config.ownerName || "Jane Doe")}
                  </div>
                  <div className="text-left">
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{config.ownerName || "Jane Doe"}</p>
                      <p className="text-[10px] text-slate-500">Business Owner</p>
                  </div>
              </div>
              <LogOut size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;