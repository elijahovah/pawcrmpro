import React, { useState, useRef } from 'react';
import { UploadCloud, Check, Loader2, ArrowRight, RefreshCw, X } from 'lucide-react';
import { processBatchIntake, processBatchIntakeImage } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { Client, Pet } from '../types';

const BatchIntake: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isImageFile = (file: File) => file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles: File[] = Array.from(e.target.files);
      setFiles([...files, ...selectedFiles]);
      selectedFiles.forEach(file => {
          if (isImageFile(file)) {
              const reader = new FileReader();
              reader.onload = () => setPreviews(prev => ({ ...prev, [file.name]: reader.result as string }));
              reader.readAsDataURL(file);
          }
      });
    }
  };

  const removeFile = (index: number) => { const newFiles = [...files]; newFiles.splice(index, 1); setFiles(newFiles); };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true); setParsedData([]); setProgress({ current: 0, total: files.length });
    try {
      const allData: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Simulation delay removed for live deployment
        let jsonResponse = "[]";
        if (isImageFile(file)) {
            const base64Data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });
            jsonResponse = await processBatchIntakeImage(base64Data, file.type || 'image/jpeg');
        } else {
            const text = await file.text();
            jsonResponse = await processBatchIntake(text);
        }
        try {
            const cleanJson = jsonResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);
            if (Array.isArray(data)) {
                 // Tag data with the file source so we can link the image later
                 const dataWithSource = data.map(d => ({ ...d, _sourceFileIndex: i }));
                 allData.push(...dataWithSource);
            }
        } catch (e) { console.error("Parse error", e); }
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }
      setParsedData(allData); setStep(2);
    } catch (err: any) { setError("Processing failed."); } finally { setProcessing(false); }
  };

  const handleImportToCRM = async () => {
      setImporting(true);
      try {
          for (const row of parsedData) {
              if (!row.clientName || !row.petName) continue;
              
              // Upload the original image if available
              let uploadedCardUrl = '';
              if (row._sourceFileIndex !== undefined && files[row._sourceFileIndex] && isImageFile(files[row._sourceFileIndex])) {
                   const file = files[row._sourceFileIndex];
                   const path = `intake/${Date.now()}_${file.name}`;
                   const url = await dataService.uploadFile(file, 'intake_cards', path);
                   if (url) uploadedCardUrl = url;
              }

              const newClient: Client = {
                  id: `c_${Date.now()}_${Math.random()}`,
                  name: row.clientName,
                  email: '',
                  phone: row.phoneNumber || '',
                  address: '',
                  joinDate: new Date().toISOString().split('T')[0],
                  status: 'Active',
                  notes: row.notes || '',
                  pets: [],
                  totalSpent: 0,
                  originalCardUrl: uploadedCardUrl // Save the URL to DB
              };

              const newPet: Pet = {
                  id: `p_${Date.now()}_${Math.random()}`,
                  ownerId: newClient.id,
                  name: row.petName,
                  breed: row.petBreed || 'Unknown',
                  age: 0,
                  gender: 'Male',
                  weight: 'N/A',
                  medicalNotes: '',
                  avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop'
              };
              newClient.pets.push(newPet);
              await dataService.saveClient(newClient);
          }
          setImportSuccess(true);
      } catch (e) { setError("Failed to save to database."); } finally { setImporting(false); }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-10">Batch Client Intake</h2>
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-16 text-center shadow-soft">
            <div className="min-h-[200px] border-2 border-dashed border-slate-300 rounded-3xl p-6 bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer" onClick={() => fileRef.current?.click()}>
                {files.length === 0 ? <><UploadCloud size={48} className="text-slate-300 mb-4"/><p className="text-slate-500 font-bold">Click to Upload Intake Files</p></> : 
                <div className="grid grid-cols-5 gap-4 w-full">{files.map((f, i) => (<div key={i} className="bg-white p-2 rounded border border-slate-200 text-xs truncate relative group">{f.name}<button onClick={(e) => {e.stopPropagation(); removeFile(i)}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>))}</div>}
            </div>
            <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" multiple accept=".txt,.csv,.jpg,.png" />
            <button onClick={handleProcess} disabled={files.length === 0 || processing} className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">{processing ? <Loader2 className="animate-spin"/> : <ArrowRight />} {processing ? `Processing ${progress.current}/${progress.total}` : 'Process Files'}</button>
        </div>
      )}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10">
            <h3 className="text-lg font-bold">{parsedData.length} Records</h3>
            <div className="flex gap-3">
              <button onClick={() => {setStep(1); setFiles([]);}} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg flex items-center gap-2"><RefreshCw size={16} /> Start Over</button>
              {importSuccess ? <button disabled className="px-6 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2 font-bold"><Check size={18} /> Imported!</button> : <button onClick={handleImportToCRM} disabled={importing} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-bold">{importing ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Import to CRM</button>}
            </div>
          </div>
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider border-b border-slate-200 sticky top-0"><tr><th className="px-6 py-4">Client</th><th className="px-6 py-4">Pet</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Notes</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{parsedData.map((row, idx) => (<tr key={idx} className="hover:bg-indigo-50/30"><td className="px-6 py-4 font-bold">{row.clientName}</td><td className="px-6 py-4">{row.petName} ({row.petBreed})</td><td className="px-6 py-4 font-mono text-xs">{row.phoneNumber}</td><td className="px-6 py-4 text-slate-500 truncate max-w-xs">{row.notes}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default BatchIntake;