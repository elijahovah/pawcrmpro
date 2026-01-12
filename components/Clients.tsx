import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, MapPin, X, PawPrint, MessageSquare, Sparkles, Loader2, ScanLine, Edit2, Trash2 } from 'lucide-react';
import { Client, Pet, AppView } from '../types';
import { generateClientFollowUp } from '../services/geminiService';
import { dataService } from '../services/dataService';

interface ClientsProps {
  onNavigate?: (view: AppView) => void;
}

const Clients: React.FC<ClientsProps> = ({ onNavigate }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newPet, setNewPet] = useState<Partial<Pet>>({ name: '', breed: '', age: 0, gender: 'Male', weight: '', medicalNotes: '' });
  const [followUpResult, setFollowUpResult] = useState<{subject: string, content: string, type: 'Email' | 'SMS'} | null>(null);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await dataService.getClients();
      setClients(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.pets.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
        id: `c_${Date.now()}`,
        name: newClientName,
        email: newClientEmail,
        phone: '', address: '', joinDate: new Date().toISOString().split('T')[0],
        status: 'Active', notes: '', pets: [], totalSpent: 0
    };
    await dataService.saveClient(newClient);
    await loadClients();
    setShowAddClientModal(false);
    setNewClientName(''); setNewClientEmail('');
  }

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newPet.name) return;
    const newPetRecord: Pet = {
      id: `p_${Date.now()}`,
      ownerId: selectedClient.id, 
      name: newPet.name!,
      breed: newPet.breed || 'Unknown',
      age: newPet.age || 0,
      gender: newPet.gender as 'Male' | 'Female',
      weight: newPet.weight || 'N/A',
      medicalNotes: newPet.medicalNotes || 'None',
      avatarUrl: `https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop`
    };
    
    const updatedClient = { 
        ...selectedClient, 
        pets: [...selectedClient.pets, newPetRecord] 
    };
    
    setSelectedClient(updatedClient);
    await dataService.saveClient(updatedClient);
    await loadClients();
    setNewPet({ name: '', breed: '', age: 0, gender: 'Male', weight: '', medicalNotes: '' });
    setShowAddPetModal(false);
  };

  const handleGenerateFollowUp = async (type: 'Email' | 'SMS') => {
      if (!selectedClient) return;
      setIsGeneratingFollowUp(true);
      const petName = selectedClient.pets.length > 0 ? selectedClient.pets[0].name : 'your pet';
      const result = await generateClientFollowUp(selectedClient.name, petName, selectedClient.lastVisit || 'recently', type);
      setFollowUpResult({ ...result, type });
      setIsGeneratingFollowUp(false);
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="flex h-full relative">
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${selectedClient ? 'w-2/3 lg:w-3/4' : 'w-full'}`}>
        <div className="p-8 pb-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Client CRM</h1>
                <div className="flex gap-3">
                    <button onClick={() => onNavigate?.(AppView.BATCH_INTAKE)} className="bg-white border border-slate-200 text-indigo-600 px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"><ScanLine size={18} /> Scan Cards</button>
                    <button onClick={() => setShowAddClientModal(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"><Plus size={18} /> Add Client</button>
                </div>
            </div>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search clients, pets, or email..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 pb-8">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <div 
                        key={client.id} 
                        onClick={() => setSelectedClient(client)}
                        className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-soft cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col ${selectedClient?.id === client.id ? 'ring-2 ring-indigo-500 bg-indigo-50/10' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{client.name}</h3>
                                <div className="flex flex-col gap-1 mt-2 text-sm text-slate-500">
                                    {client.email && <div className="flex items-center gap-2 truncate max-w-[180px]" title={client.email}><Mail size={14} className="shrink-0"/> <span className="truncate">{client.email}</span></div>}
                                    {client.phone && <div className="flex items-center gap-2"><Phone size={14} className="shrink-0"/> {client.phone}</div>}
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                {client.status}
                            </span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                                <span>Registered Pets ({client.pets.length})</span>
                                {client.pets.length === 0 && <span className="text-indigo-500 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedClient(client); setTimeout(() => setShowAddPetModal(true), 100); }}>+ Add Pet</span>}
                            </h4>
                            <div className="space-y-2">
                                {client.pets.length > 0 ? client.pets.map(pet => (
                                    <div key={pet.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors bg-white border border-slate-100 group/pet">
                                        <img 
                                            src={pet.avatarUrl} 
                                            alt={pet.name} 
                                            className="w-10 h-10 rounded-full object-cover bg-slate-200 shrink-0" 
                                        />
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm text-slate-900 truncate">{pet.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{pet.breed}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400 font-medium">No pets added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>
      
      {selectedClient && (
          <div className="w-[400px] bg-white border-l border-slate-200 h-full shadow-2xl overflow-y-auto animate-slideInRight z-20 p-6 flex flex-col">
              <div className="flex justify-between mb-6 items-center">
                  <h2 className="text-xl font-bold text-slate-900">Client Details</h2>
                  <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
              </div>
              
              <div className="text-center mb-8 relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-inner">
                      {selectedClient.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h3>
                  <p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1">
                      <MapPin size={14} /> {selectedClient.address || 'No address provided'}
                  </p>
                  <div className="flex justify-center gap-3 mt-4">
                      <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"><Phone size={18}/></button>
                      <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"><Mail size={18}/></button>
                      <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"><Edit2 size={18}/></button>
                  </div>
              </div>

              {selectedClient.originalCardUrl && (
                  <div className="mb-6 p-1 border border-slate-200 rounded-2xl bg-slate-50">
                      <div className="relative group overflow-hidden rounded-xl">
                        <img src={selectedClient.originalCardUrl} alt="Intake" className="w-full object-cover max-h-40 blur-[2px] hover:blur-0 transition-all duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold group-hover:opacity-0 transition-opacity">View Intake Card</span>
                        </div>
                      </div>
                  </div>
              )}

              <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center justify-between">
                      <h4 className="font-bold flex items-center gap-2 text-slate-800"><PawPrint size={18} className="text-indigo-500"/> Pets</h4>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{selectedClient.pets.length}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedClient.pets.map(pet => (
                        <div key={pet.id} className="p-4 border border-slate-200 rounded-2xl flex gap-4 hover:border-indigo-300 hover:shadow-sm transition-all bg-white group">
                            <img src={pet.avatarUrl} className="w-14 h-14 rounded-xl object-cover bg-slate-100 shadow-sm" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-slate-900">{pet.name}</div>
                                    <button className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                                </div>
                                <div className="text-sm font-medium text-slate-500">{pet.breed}</div>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">{pet.gender}</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">{pet.age} yrs</span>
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
                  
                  <button onClick={() => setShowAddPetModal(true)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 transition-all hover:bg-indigo-50/50">
                      <Plus size={18}/> Add Another Pet
                  </button>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-800"><Sparkles size={16} className="text-amber-500"/> AI Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleGenerateFollowUp('Email')} className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                          <Mail size={16}/> Email Follow-up
                      </button>
                      <button onClick={() => handleGenerateFollowUp('SMS')} className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                          <MessageSquare size={16}/> SMS Reminder
                      </button>
                  </div>
              </div>
          </div>
      )}

      {showAddClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-100 animate-popIn">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Add Client</h3>
                    <button onClick={() => setShowAddClientModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleAddClient} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                          <input type="text" placeholder="e.g. John Smith" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" required />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                          <input type="email" placeholder="john@example.com" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" required />
                      </div>
                      <div className="flex gap-3 pt-4">
                          <button type="button" onClick={() => setShowAddClientModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                          <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">Save Client</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showAddPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-popIn">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Add Pet</h3>
                    <button onClick={() => setShowAddPetModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <form onSubmit={handleAddPet} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pet Name</label>
                            <input type="text" value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" required />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Breed</label>
                             <input type="text" value={newPet.breed} onChange={e => setNewPet({...newPet, breed: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age (Years)</label>
                             <input type="number" value={newPet.age} onChange={e => setNewPet({...newPet, age: parseInt(e.target.value) || 0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" />
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowAddPetModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">Save Pet</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {followUpResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setFollowUpResult(null)}>
              <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-popIn" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center"><Sparkles size={20}/></div>
                      <div>
                          <h3 className="font-bold text-lg text-slate-900">{followUpResult.type} Draft</h3>
                          <p className="text-xs text-slate-500">Generated by Gemini AI</p>
                      </div>
                  </div>
                  
                  {followUpResult.type === 'Email' && (
                      <div className="mb-4">
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject</label>
                          <div className="font-bold text-slate-800 text-sm">{followUpResult.subject}</div>
                      </div>
                  )}
                  
                  <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {followUpResult.content}
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                      <button onClick={() => setFollowUpResult(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Discard</button>
                      <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                          <SendIcon size={16}/> Send
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const SendIcon = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

export default Clients;