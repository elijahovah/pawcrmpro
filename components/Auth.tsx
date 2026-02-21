import React, { useState } from 'react';
import { Dog, Mail, Lock, ArrowRight, User, Loader2, Check } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      onLogin({
        name: isLogin ? 'Carol Danvers' : formData.name,
        email: formData.email,
        businessName: isLogin ? 'PawCRM Grooming' : formData.businessName
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[120px] opacity-40"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/50 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px]">
        
        {/* Left Side: Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-4">
              <Dog size={28} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Welcome back' : 'Start your journey'}
            </h1>
            <p className="text-slate-500 mt-2">
              {isLogin 
                ? 'Enter your details to access your grooming workspace.' 
                : 'Join thousands of groomers managing their business with AI.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                   <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Jane Doe"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Business Name</label>
                   <div className="relative">
                      <Dog className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        required
                        type="text" 
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="e.g. Happy Paws"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                   </div>
                </div>
              </>
            )}

            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
               <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    required
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    required
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
               </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 font-bold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Right Side: Showcase */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-indigo-600 to-indigo-800 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-[60px] -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold leading-tight">Run your grooming business on autopilot.</h2>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                 <div className="p-2 bg-white/20 rounded-lg">
                    <Check size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold">AI Breed Identification</h3>
                    <p className="text-indigo-200 text-sm">Instantly identify breeds and get grooming tips.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                 <div className="p-2 bg-white/20 rounded-lg">
                    <Check size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold">Smart Scheduling</h3>
                    <p className="text-indigo-200 text-sm">Automated reminders via SMS and Email.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm text-indigo-200">
               <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
               System Operational v2.5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;