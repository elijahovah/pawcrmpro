import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Check, AlertCircle, Loader2, ArrowRight, RefreshCw, Download, ScanLine, Image as ImageIcon, X, Plus, Eye } from 'lucide-react';
import { processBatchIntake, processBatchIntakeImage } from '../services/geminiService';
import { Client, Pet } from '../types';

interface ParsedIntakeRow {
  ownerFirstName: string;
  ownerLastName: string;
  clientName: string;
  address: string;
  phoneNumber: string;
  homePhone: string;
  cellPhone: string;
  email: string;
  petName: string;
  petBreed: string;
  petSex: string;
  petAge: string;
  petWeight: string;
  petColor: string;
  allergies: string;
  spayedNeutered: boolean;
  vaccinationsCurrent: boolean;
  vetInfo: string;
  medicalIssues: string;
  temperament: string[];
  groomingNotes: string;
  referralSource: string;
  notes: string;
  sourceFileName?: string;
  sourceImageDataUrl?: string;
  qaApproved?: boolean;
}

const STORAGE_KEY = 'pawcrm_clients';

const BatchIntake: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedIntakeRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [qaIndex, setQaIndex] = useState<number | null>(null);
  const [modalPreview, setModalPreview] = useState<{ type: 'image' | 'text', content: string, name: string } | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
  };

  const getString = (entry: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      const value = entry[key];
      if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    }
    return '';
  };

  const getBoolean = (entry: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      const value = entry[key];
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['yes', 'true', 'checked', 'x'].includes(normalized)) return true;
        if (['no', 'false', 'unchecked'].includes(normalized)) return false;
      }
    }
    return false;
  };

  const getStringArray = (entry: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      const value = entry[key];
      if (Array.isArray(value)) {
        return value.filter((v) => typeof v === 'string' && v.trim().length > 0).map((v) => (v as string).trim());
      }
      if (typeof value === 'string' && value.trim()) {
        return value.split(',').map((v) => v.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const normalizeRow = (entry: Record<string, unknown>, sourceFileName: string, sourceImageDataUrl?: string): ParsedIntakeRow => {
    const ownerFirstName = getString(entry, ['ownerFirstName', 'firstName']);
    const ownerLastName = getString(entry, ['ownerLastName', 'lastName']);
    const clientName = getString(entry, ['clientName', 'ownerName']) || `${ownerFirstName} ${ownerLastName}`.trim();
    const homePhone = getString(entry, ['homePhone']);
    const cellPhone = getString(entry, ['cellPhone', 'phoneNumber']);

    return {
      ownerFirstName,
      ownerLastName,
      clientName,
      address: getString(entry, ['address']),
      phoneNumber: getString(entry, ['phoneNumber']) || cellPhone || homePhone,
      homePhone,
      cellPhone,
      email: getString(entry, ['email']),
      petName: getString(entry, ['petName']),
      petBreed: getString(entry, ['petBreed', 'breed']),
      petSex: getString(entry, ['petSex', 'sex']),
      petAge: getString(entry, ['petAge', 'age']),
      petWeight: getString(entry, ['petWeight', 'weight']),
      petColor: getString(entry, ['petColor', 'color']),
      allergies: getString(entry, ['allergies']),
      spayedNeutered: getBoolean(entry, ['spayedNeutered']),
      vaccinationsCurrent: getBoolean(entry, ['vaccinationsCurrent']),
      vetInfo: getString(entry, ['vetInfo']),
      medicalIssues: getString(entry, ['medicalIssues']),
      temperament: getStringArray(entry, ['temperament']),
      groomingNotes: getString(entry, ['groomingNotes']),
      referralSource: getString(entry, ['referralSource']),
      notes: getString(entry, ['notes']),
      sourceFileName,
      sourceImageDataUrl,
      qaApproved: true
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const totalFiles = [...files, ...selectedFiles];

      if (totalFiles.length > 10) {
        setError("Maximum 10 files allowed at once.");
        const limitedFiles = totalFiles.slice(0, 10);
        setFiles(limitedFiles);
        processPreviews(limitedFiles);
      } else {
        setError(null);
        setFiles(totalFiles);
        processPreviews(totalFiles);
      }
    }
    // Reset input value to allow selecting the same file again if needed (though redundant with multiple)
    if (fileRef.current) fileRef.current.value = '';
  };

  const processPreviews = (fileList: File[]) => {
    fileList.forEach(file => {
      if (isImageFile(file) && !previews[file.name]) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => ({ ...prev, [file.name]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    // Optional: could cleanup preview URL here if we were using createObjectUrl to save memory
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const resetAll = () => {
    setStep(1);
    setParsedData([]);
    setFiles([]);
    setPreviews({});
    setError(null);
    setImportResult(null);
    setQaIndex(null);
    setProgress({ current: 0, total: 0 });
  };

  const handlePreview = async (file: File) => {
    if (isImageFile(file)) {
        const src = previews[file.name];
        if (src) {
            setModalPreview({ type: 'image', content: src, name: file.name });
        }
    } else {
        try {
            const text = await file.text();
            setModalPreview({ type: 'text', content: text, name: file.name });
        } catch (e) {
            console.error("Error reading file", e);
            setError("Could not read file content.");
        }
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setImportResult(null);
    setParsedData([]);
    setProgress({ current: 0, total: files.length });

    try {
      const allData: ParsedIntakeRow[] = [];
      
      // Process files sequentially to avoid Rate Limiting (429 Errors)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Add a delay between requests to be gentle on the API (avoid 429s)
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        let jsonResponse = "[]";
        try {
            if (isImageFile(file)) {
                // Get base64
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const res = reader.result as string;
                        const parts = res.split(',');
                        if (parts.length > 1) {
                            resolve(parts[1]);
                        } else {
                            resolve(res); // Fallback if no prefix
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                jsonResponse = await processBatchIntakeImage(base64Data, file.type || 'image/jpeg');
            } else {
                const text = await file.text();
                jsonResponse = await processBatchIntake(text);
            }
            
            const cleanJson = jsonResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);
            
            if (Array.isArray(data)) {
                const normalizedRows = data
                  .filter((entry) => entry && typeof entry === 'object')
                  .map((entry) =>
                    normalizeRow(
                      entry as Record<string, unknown>,
                      file.name,
                      isImageFile(file) ? previews[file.name] : undefined
                    )
                  );
                allData.push(...normalizedRows);
            }
        } catch (e: any) {
            const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
            console.error(`Error processing file ${file.name}:`, errorMessage);
            // We continue processing other files even if one fails
        }
        
        // Update progress
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      if (allData.length > 0) {
        setParsedData(allData);
        setQaIndex(0);
        setStep(2);
      } else {
        throw new Error("No valid data found. Check console for rate limit errors or ensure images are legible.");
      }

    } catch (err: any) {
      console.error("Processing failed", err);
      setError(err.message || "We couldn't process the files. Please ensure they are legible images or valid text files.");
    } finally {
      setProcessing(false);
    }
  };

  const parseGender = (sex: string): 'Male' | 'Female' => {
    const normalized = sex.trim().toLowerCase();
    if (normalized === 'f' || normalized === 'female') return 'Female';
    return 'Male';
  };

  const parseAge = (ageText: string) => {
    const match = ageText.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  const updateRow = (index: number, updates: Partial<ParsedIntakeRow>) => {
    setParsedData((prev) => prev.map((row, i) => (i === index ? { ...row, ...updates } : row)));
  };

  const importToCRM = () => {
    const rowsToImport = parsedData.filter((row) => row.qaApproved !== false);
    if (!rowsToImport.length) {
      setError('No QA-approved rows to import. Mark at least one row as approved.');
      return;
    }

    let existingClients: Client[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) existingClients = parsed as Client[];
      }
    } catch (e) {
      console.error('Failed loading existing clients', e);
    }

    let imported = 0;

    for (const row of rowsToImport) {
      const clientName = row.clientName || `${row.ownerFirstName} ${row.ownerLastName}`.trim() || 'Unknown Client';
      const keyPhone = row.phoneNumber || row.cellPhone || row.homePhone;
      const existingIndex = existingClients.findIndex(
        (c) =>
          c.name.toLowerCase() === clientName.toLowerCase() &&
          (keyPhone ? c.phone === keyPhone : true)
      );

      const pet: Pet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: row.petName || 'Unknown Pet',
        breed: row.petBreed || 'Unknown',
        age: parseAge(row.petAge),
        gender: parseGender(row.petSex),
        weight: row.petWeight || 'N/A',
        color: row.petColor || '',
        allergies: row.allergies || '',
        spayedNeutered: row.spayedNeutered,
        vaccinationsCurrent: row.vaccinationsCurrent,
        vetInfo: row.vetInfo || '',
        temperament: row.temperament || [],
        groomingNotes: row.groomingNotes || '',
        medicalNotes: row.medicalIssues || row.notes || '',
        avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop'
      };

      if (existingIndex >= 0) {
        const client = existingClients[existingIndex];
        const petExists = client.pets.some((p) => p.name.toLowerCase() === pet.name.toLowerCase());
        if (!petExists) {
          existingClients[existingIndex] = { ...client, pets: [...client.pets, pet] };
          imported += 1;
        }
      } else {
        const newClient: Client = {
          id: `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: clientName,
          firstName: row.ownerFirstName || '',
          lastName: row.ownerLastName || '',
          email: row.email || '',
          phone: keyPhone || '',
          homePhone: row.homePhone || '',
          cellPhone: row.cellPhone || '',
          address: row.address || '',
          joinDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          referralSource: row.referralSource || '',
          notes: row.notes || row.groomingNotes || '',
          pets: [pet],
          originalCardUrl: row.sourceImageDataUrl
        };
        existingClients.push(newClient);
        imported += 1;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingClients));
    setImportResult(`Imported ${imported} QA-approved records into Client CRM.`);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Batch Client Intake</h2>
          <p className="text-slate-500 mt-2">Upload text lists OR <span className="text-indigo-600 font-bold">scan handwritten profile cards</span>.</p>
        </div>
        {step === 1 && (
            <button className="text-sm font-medium text-indigo-600 flex items-center gap-2 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                <Download size={16} />
                Download Template
            </button>
        )}
      </div>

      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-16 text-center shadow-soft animate-fadeIn">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Icons */}
            <div className="flex justify-center gap-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <ScanLine size={32} />
                </div>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <UploadCloud size={32} />
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Upload Intake Files</h3>
                <p className="text-slate-500">Supports handwritten cards (JPG/PNG) or digital lists (TXT/CSV). <br/>Up to 10 files at once.</p>
            </div>

            {/* Upload Area / File List */}
            <div className="min-h-[200px] border-2 border-dashed border-slate-300 rounded-3xl p-6 bg-slate-50/50">
                
                {files.length === 0 ? (
                    <div 
                        onClick={() => fileRef.current?.click()}
                        className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors py-12"
                    >
                        <UploadCloud size={48} className="text-slate-300 mb-4" />
                        <p className="text-slate-600 font-semibold">Click to select files</p>
                        <p className="text-slate-400 text-sm mt-1">or drag and drop here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {files.map((f, idx) => (
                            <div key={idx} className="relative group bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-left hover:shadow-md transition-shadow flex flex-col h-full">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 cursor-pointer hover:scale-110"
                                >
                                    <X size={14} />
                                </button>
                                
                                <div className="aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center border border-slate-100 relative">
                                    {isImageFile(f) && previews[f.name] ? (
                                        <img src={previews[f.name]} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText size={32} className="text-indigo-400" />
                                    )}
                                    
                                    {/* Preview Button Overlay */}
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handlePreview(f); }}
                                            className="bg-white text-slate-800 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-1"
                                        >
                                            <Eye size={12} /> View
                                        </button>
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-slate-700 truncate mt-auto">{f.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{(f.size / 1024).toFixed(0)} KB</div>
                            </div>
                        ))}
                        
                        {files.length < 10 && (
                            <div 
                                onClick={() => fileRef.current?.click()}
                                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-all bg-white"
                            >
                                <Plus size={24} />
                                <span className="text-xs font-bold mt-1">Add More</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden Input */}
            <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" multiple accept=".txt,.csv,.json,.jpg,.jpeg,.png,.webp" />

            {/* Actions */}
            <div className="space-y-4">
                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center gap-3 text-rose-700 text-sm">
                        <AlertCircle size={20} className="shrink-0" />
                        {error}
                    </div>
                )}

                <button
                onClick={handleProcess}
                disabled={files.length === 0 || processing}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 transition-all"
                >
                {processing ? <Loader2 className="animate-spin" /> : <ArrowRight size={24} />}
                {processing ? `Processing... (${progress.current}/${progress.total})` : `Process ${files.length > 0 ? files.length : ''} Intake Files`}
                </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden animate-fadeIn">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Review Import Data</h3>
              <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-sm text-slate-500 font-medium">{parsedData.length} entries extracted from {files.length} files</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setQaIndex(qaIndex ?? 0)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Open QA View
              </button>
              <button 
                onClick={resetAll} 
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} /> Start Over
              </button>
              <button
                onClick={importToCRM}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center gap-2 font-bold transition-all hover:-translate-y-0.5"
              >
                <Check size={18} /> Import to CRM
              </button>
            </div>
          </div>

          {importResult && (
            <div className="mx-6 mt-4 p-3 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 text-sm font-medium">
              {importResult}
            </div>
          )}
          
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Pet Name</th>
                  <th className="px-6 py-4">Breed</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Vitals</th>
                  <th className="px-6 py-4">QA</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedData.length > 0 ? parsedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{row.clientName || <span className="text-rose-400 italic">Missing</span>}</td>
                    <td className="px-6 py-4 font-medium">{row.petName || <span className="text-rose-400 italic">Missing</span>}</td>
                    <td className="px-6 py-4">
                      {row.petBreed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                            {row.petBreed}
                          </span>
                      ) : <span className="text-slate-300 italic">Unknown</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{row.phoneNumber || "N/A"}</td>
                    <td className="px-6 py-4 text-xs">
                      <div>Sex: {row.petSex || 'N/A'} | Age: {row.petAge || 'N/A'}</div>
                      <div>Wt: {row.petWeight || 'N/A'} | Color: {row.petColor || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQaIndex(idx)}
                          className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold"
                        >
                          Review
                        </button>
                        <label className="inline-flex items-center gap-1 text-slate-600">
                          <input
                            type="checkbox"
                            checked={row.qaApproved !== false}
                            onChange={(e) => updateRow(idx, { qaApproved: e.target.checked })}
                          />
                          Ready
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={row.notes || row.medicalIssues}>
                      {row.notes || row.medicalIssues || row.groomingNotes || "-"}
                    </td>
                  </tr>
                )) : (
                   <tr>
                     <td colSpan={7} className="p-12 text-center text-slate-400">
                       <div className="flex flex-col items-center gap-2">
                         <AlertCircle size={24} />
                         <span>No valid data found in file.</span>
                       </div>
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>

          {qaIndex !== null && parsedData[qaIndex] && (
            <div className="m-6 border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="font-semibold text-slate-800">Intake QA View</div>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => setQaIndex((prev) => (prev && prev > 0 ? prev - 1 : 0))}
                    className="px-2 py-1 rounded border border-slate-200 bg-white"
                  >
                    Prev
                  </button>
                  <span className="text-slate-600">Row {qaIndex + 1} / {parsedData.length}</span>
                  <button
                    onClick={() => setQaIndex((prev) => (prev !== null && prev < parsedData.length - 1 ? prev + 1 : prev))}
                    className="px-2 py-1 rounded border border-slate-200 bg-white"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setQaIndex(null)}
                    className="px-2 py-1 rounded border border-slate-200 bg-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-4 border-r border-slate-200 bg-slate-50 min-h-[420px] flex items-center justify-center">
                  {parsedData[qaIndex].sourceImageDataUrl ? (
                    <img
                      src={parsedData[qaIndex].sourceImageDataUrl}
                      alt={parsedData[qaIndex].sourceFileName || 'Source card'}
                      className="max-w-full max-h-[520px] rounded-lg border border-slate-200 bg-white"
                    />
                  ) : (
                    <div className="text-sm text-slate-500 text-center">
                      No source image attached for this row.
                      <div className="mt-1 text-xs">{parsedData[qaIndex].sourceFileName || ''}</div>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3 max-h-[620px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Owner First Name" value={parsedData[qaIndex].ownerFirstName} onChange={(e) => updateRow(qaIndex, { ownerFirstName: e.target.value })} />
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Owner Last Name" value={parsedData[qaIndex].ownerLastName} onChange={(e) => updateRow(qaIndex, { ownerLastName: e.target.value })} />
                  </div>
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Client Name" value={parsedData[qaIndex].clientName} onChange={(e) => updateRow(qaIndex, { clientName: e.target.value })} />
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Address" value={parsedData[qaIndex].address} onChange={(e) => updateRow(qaIndex, { address: e.target.value })} />

                  <div className="grid grid-cols-3 gap-3">
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Primary Phone" value={parsedData[qaIndex].phoneNumber} onChange={(e) => updateRow(qaIndex, { phoneNumber: e.target.value })} />
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Home Phone" value={parsedData[qaIndex].homePhone} onChange={(e) => updateRow(qaIndex, { homePhone: e.target.value })} />
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Cell Phone" value={parsedData[qaIndex].cellPhone} onChange={(e) => updateRow(qaIndex, { cellPhone: e.target.value })} />
                  </div>
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Email" value={parsedData[qaIndex].email} onChange={(e) => updateRow(qaIndex, { email: e.target.value })} />

                  <div className="grid grid-cols-2 gap-3">
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Pet Name" value={parsedData[qaIndex].petName} onChange={(e) => updateRow(qaIndex, { petName: e.target.value })} />
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Breed" value={parsedData[qaIndex].petBreed} onChange={(e) => updateRow(qaIndex, { petBreed: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Sex" value={parsedData[qaIndex].petSex} onChange={(e) => updateRow(qaIndex, { petSex: e.target.value })} />
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Age" value={parsedData[qaIndex].petAge} onChange={(e) => updateRow(qaIndex, { petAge: e.target.value })} />
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Weight" value={parsedData[qaIndex].petWeight} onChange={(e) => updateRow(qaIndex, { petWeight: e.target.value })} />
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Color" value={parsedData[qaIndex].petColor} onChange={(e) => updateRow(qaIndex, { petColor: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Allergies" value={parsedData[qaIndex].allergies} onChange={(e) => updateRow(qaIndex, { allergies: e.target.value })} />
                    <input className="px-3 py-2 border rounded-lg text-sm" placeholder="Vet Info" value={parsedData[qaIndex].vetInfo} onChange={(e) => updateRow(qaIndex, { vetInfo: e.target.value })} />
                  </div>
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Temperament (comma-separated)" value={parsedData[qaIndex].temperament.join(', ')} onChange={(e) => updateRow(qaIndex, { temperament: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
                  <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Medical Issues" value={parsedData[qaIndex].medicalIssues} onChange={(e) => updateRow(qaIndex, { medicalIssues: e.target.value })} />
                  <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Grooming Notes" value={parsedData[qaIndex].groomingNotes} onChange={(e) => updateRow(qaIndex, { groomingNotes: e.target.value })} />
                  <input className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Referral Source" value={parsedData[qaIndex].referralSource} onChange={(e) => updateRow(qaIndex, { referralSource: e.target.value })} />
                  <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="General Notes" value={parsedData[qaIndex].notes} onChange={(e) => updateRow(qaIndex, { notes: e.target.value })} />

                  <div className="flex items-center gap-6 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={parsedData[qaIndex].spayedNeutered} onChange={(e) => updateRow(qaIndex, { spayedNeutered: e.target.checked })} />
                      Spayed/Neutered
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={parsedData[qaIndex].vaccinationsCurrent} onChange={(e) => updateRow(qaIndex, { vaccinationsCurrent: e.target.checked })} />
                      Vaccinations Current
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={parsedData[qaIndex].qaApproved !== false} onChange={(e) => updateRow(qaIndex, { qaApproved: e.target.checked })} />
                      QA Approved
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {modalPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setModalPreview(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 truncate pr-4">
                        {modalPreview.type === 'image' ? <ImageIcon size={18} className="text-indigo-600"/> : <FileText size={18} className="text-indigo-600"/>}
                        <span className="truncate">{modalPreview.name}</span>
                    </h3>
                    <button onClick={() => setModalPreview(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-auto bg-slate-100/50 flex-1 flex flex-col items-center justify-center">
                    {modalPreview.type === 'image' ? (
                        <img src={modalPreview.content} alt="Preview" className="max-w-full max-h-full rounded-lg shadow-sm border border-slate-200 object-contain" />
                    ) : (
                        <div className="w-full h-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-auto">
                            <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed">
                                {modalPreview.content}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BatchIntake;
