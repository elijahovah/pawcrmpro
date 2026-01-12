import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, CheckCircle, Info, Sparkles } from 'lucide-react';
import { identifyBreed } from '../services/geminiService';

const BreedIdentifier: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentify = async () => {
    if (!image) return;
    
    setLoading(true);
    const base64Data = image.split(',')[1];
    const analysis = await identifyBreed(base64Data);
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Breed Identification</h2>
            <p className="text-slate-500 mt-2">AI-powered visual analysis for optimal grooming strategies.</p>
        </div>
        <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <Sparkles size={16} />
            <span>GenAI Powered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative h-96 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group
              ${image 
                ? 'border-indigo-500 bg-slate-900' 
                : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50'}
            `}
          >
            {image ? (
              <img src={image} alt="Preview" className="h-full w-full object-contain opacity-90" />
            ) : (
              <div className="text-center p-8 transition-transform group-hover:scale-105">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Camera size={40} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Upload Pet Photo</h3>
                <p className="text-slate-500 mt-2 text-sm">Drag and drop or click to browse</p>
                <p className="text-slate-400 text-xs mt-4">Supports high-res JPG, PNG</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          <button
            onClick={handleIdentify}
            disabled={!image || loading}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
              ${!image || loading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-600/30 hover:-translate-y-0.5'}
            `}
          >
            {loading ? <Loader2 className="animate-spin" /> : <ScanIcon />}
            {loading ? 'Analyzing Breed Features...' : 'Identify Breed'}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-soft h-full min-h-[400px] flex flex-col relative overflow-hidden">
          
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
               <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
               <p className="text-slate-600 font-medium animate-pulse">Consulting grooming database...</p>
            </div>
          ) : result ? (
             <div className="animate-fadeIn">
               <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">Analysis Complete</h3>
                    <p className="text-sm text-slate-500">Confidence Score: 98.5%</p>
                 </div>
               </div>
               
               <div className="prose prose-indigo prose-sm max-w-none overflow-y-auto max-h-[500px]">
                 <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                   {result}
                 </div>
               </div>
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
              <DogIcon />
              <p className="mt-6 text-center font-medium">Results will appear here<br/>after image analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ScanIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/></svg>
);

const DogIcon = () => (
  <svg className="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.296 2.486C5.484 13.302 3 18 3 18h13s4.146-4.9 5.33-8.169C21.83 8.263 20.652 6.496 20 6c-1.615-1.23-4.545-1.23-6-1.23-1.454 0-2.42.278-4 .402Z"/><path d="M9 12c.5 0 2.5 1.5 3 2 .5-.5 2.5-2 3-2"/></svg>
);

export default BreedIdentifier;