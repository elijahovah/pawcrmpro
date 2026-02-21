import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, MapPin, MoreHorizontal, Filter, X, PawPrint, DollarSign, Calendar, ScanLine, FileText, Image as ImageIcon, Save, Dog, Scale, Syringe, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { Client, Pet, AppView } from '../types';
import { generateClientFollowUp } from '../services/geminiService';

// Mock Data Generator
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah@skynet.com',
    phone: '(555) 019-2834',
    address: '123 Tech Blvd, Los Angeles, CA',
    joinDate: '2023-01-15',
    status: 'Active',
    notes: 'Prefers morning appointments. Terminator is reactive to other male dogs.',
    totalSpent: 1250,
    lastVisit: '2023-11-10',
    originalCardUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&h=400&fit=crop', // Mock Handwritten Card
    pets: [
      {
        id: 'p1',
        ownerId: '1',
        name: 'Terminator',
        breed: 'German Shepherd',
        age: 5,
        gender: 'Male',
        weight: '85 lbs',
        medicalNotes: 'Hip dysplasia monitor.',
        avatarUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=100&h=100&fit=crop'
      }
    ]
  },
  {
    id: '2',
    name: 'John Wick',
    email: 'john@continental.com',
    phone: '(555) 999-1111',
    address: '89 Continental Way, New York, NY',
    joinDate: '2023-03-22',
    status: 'Active',
    notes: 'Very protective of Daisy. Needs express service.',
    totalSpent: 850,
    lastVisit: '2023-11-15',
    pets: [
      {
        id: 'p2',
        ownerId: '2',
        name: 'Daisy',
        breed: 'Beagle',
        age: 1,
        gender: 'Female',
        weight: '22 lbs',
        medicalNotes: 'None',
        avatarUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=100&h=100&fit=crop'
      }
    ]
  },
  {
    id: '3',
    name: 'Ellen Ripley',
    email: 'ripley@nostromo.space',
    phone: '(555) 426-1979',
    address: 'LV-426 Colony',
    joinDate: '2022-11-05',
    status: 'Inactive',
    notes: 'Jonesy is an escape artist. Double latch crates.',
    totalSpent: 450,
    lastVisit: '2023-08-20',
    pets: [
      {
        id: 'p3',
        ownerId: '3',
        name: 'Jonesy',
        breed: 'Orange Tabby',
        age: 8,
        gender: 'Male',
        weight: '12 lbs',
        medicalNotes: 'Anxiety',
        avatarUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop'
      }
    ]
  },
];

interface ClientsProps {
  onNavigate?: (view: AppView) => void;
}

const Clients: React.FC<ClientsProps> = ({ onNavigate }) => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewCardModal, setViewCardModal] = useState<string | null>(null);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  
  // Follow Up State
  const [followUpResult, setFollowUpResult] = useState<{subject: string, content: string, type: 'Email' | 'SMS'} | null>(null);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  
  // New Pet Form State
  const [newPet, setNewPet] = useState<Partial<Pet>>({
    name: '',
    breed: '',
    age: 0,
    gender: 'Male',
    weight: '',
    medicalNotes: ''
  });

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.pets.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newPet.name) return;

    const newPetRecord: Pet = {
      id: `p${Date.now()}`,
      ownerId: selectedClient.id,
      name: newPet.name,
      breed: newPet.breed || 'Unknown',
      age: newPet.age || 0,
      gender: newPet.gender as 'Male' | 'Female',
      weight: newPet.weight || 'N/A',
      medicalNotes: newPet.medicalNotes || 'None',
      avatarUrl: `https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop` // Default placeholder
    };

    // Update Clients State
    const updatedClients = clients.map(c => {
      if (c.id === selectedClient.id) {
        return { ...c, pets: [...c.pets, newPetRecord] };
      }
      return c;
    });

    setClients(updatedClients);
    // Update currently selected client to reflect changes immediately
    setSelectedClient({ ...selectedClient, pets: [...selectedClient.pets, newPetRecord] });
    
    // Reset and Close
    setNewPet({ name: '', breed: '', age: 0, gender: 'Male', weight: '', medicalNotes: '' });
    setShowAddPetModal(false);
  };

  const handleGenerateFollowUp = async (type: 'Email' | 'SMS') => {
      if (!selectedClient) return;
      setIsGeneratingFollowUp(true);
      // Use first pet for now or generic
      const petName = selectedClient.pets.length > 0 ? selectedClient.pets[0].name : 'your pet';
      const lastVisit = selectedClient.lastVisit || 'recently';
      
      const result = await generateClientFollowUp(selectedClient.name, petName, lastVisit, type);
      setFollowUpResult({ ...result, type });
      setIsGeneratingFollowUp(false);
  };

  return (
    <div className="flex h-full">
      {/* Client List Section */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${selectedClient ? 'w-2/3' : 'w-full'}`}>
        <div className="p-8 pb-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Client CRM</h1>
                    <p className="text-slate-500 mt-1">Manage relationships and pet profiles.</p>
                </div>
                <div className="flex gap-3">
                    {/* Link to Batch Intake */}
                    <button 
                        onClick={() => onNavigate && onNavigate(AppView.BATCH_INTAKE)}
                        className="bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
                    >
                        <ScanLine size={18} /> Scan Cards
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all hover:-translate-y-0.5">
                        <Plus size={18} /> Add Client
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or pet..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
                <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium">
                    <Filter size={18} /> Filter
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-xs tracking-wider sticky top-0">
                        <tr>
                            <th className="px-6 py-4">Client Name</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Pets</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredClients.map(client => (
                            <tr 
                                key={client.id} 
                                onClick={() => setSelectedClient(client)}
                                className={`cursor-pointer transition-colors hover:bg-indigo-50/50 ${selectedClient?.id === client.id ? 'bg-indigo-50' : ''}`}
                            >
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{client.name}</div>
                                    <div className="text-xs text-slate-400">Since {client.joinDate}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-slate-600"><Mail size={12}/> {client.email}</div>
                                        <div className="flex items-center gap-2 text-slate-500"><Phone size={12}/> {client.phone}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-2">
                                        {client.pets.map(pet => (
                                            <img key={pet.id} src={pet.avatarUrl} alt={pet.name} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" title={pet.name} />
                                        ))}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">{client.pets.length} Pet{client.pets.length !== 1 && 's'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredClients.length === 0 && (
                     <div className="p-12 text-center text-slate-400">
                        No clients found matching "{searchTerm}"
                     </div>
                )}
            </div>
        </div>
      </div>

      {/* Client Detail Slide-over */}
      {selectedClient && (
          <div className="w-[400px] bg-white border-l border-slate-200 h-full shadow-2xl overflow-y-auto animate-slideInRight z-20">
              <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                      <h2 className="text-xl font-bold text-slate-900">Client Profile</h2>
                      <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                          {selectedClient.name.charAt(0)}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h3>
                      <p className="text-slate-500 flex items-center justify-center gap-1 mt-1 text-sm"><MapPin size={14}/> {selectedClient.address}</p>
                      
                      <div className="flex justify-center gap-4 mt-6">
                          <button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                              <Phone size={20} />
                          </button>
                          <button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                              <Mail size={20} />
                          </button>
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between">
                         <div className="text-center flex-1 border-r border-slate-200">
                             <div className="text-xs text-slate-500 uppercase font-bold tracking-wide">Last Visit</div>
                             <div className="font-bold text-slate-900 mt-1">{selectedClient.lastVisit}</div>
                         </div>
                         <div className="text-center flex-1">
                             <div className="text-xs text-slate-500 uppercase font-bold tracking-wide">Total Spent</div>
                             <div className="font-bold text-emerald-600 mt-1">${selectedClient.totalSpent}</div>
                         </div>
                      </div>

                      {/* Original Card Thumbnail */}
                      {selectedClient.originalCardUrl && (
                          <div className="border border-indigo-100 bg-indigo-50/50 rounded-2xl p-4">
                              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                                  <FileText size={16} className="text-indigo-600" /> Original Intake Card
                              </h4>
                              <div 
                                onClick={() => setViewCardModal(selectedClient.originalCardUrl || null)}
                                className="relative h-32 w-full rounded-xl overflow-hidden cursor-pointer group border border-indigo-100 bg-white"
                              >
                                  <img 
                                    src={selectedClient.originalCardUrl} 
                                    alt="Intake Card" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                  />
                                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                          <ImageIcon size={12} /> View Full
                                      </span>
                                  </div>
                              </div>
                          </div>
                      )}

                      <div>
                          <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                              <PawPrint size={18} className="text-indigo-600" /> Pets
                          </h4>
                          <div className="space-y-3">
                              {selectedClient.pets.map(pet => (
                                  <div key={pet.id} className="p-4 border border-slate-200 rounded-2xl flex gap-4 hover:border-indigo-200 transition-colors group">
                                      <img src={pet.avatarUrl} alt={pet.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                            <div className="font-bold text-slate-900">{pet.name}</div>
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{pet.gender}</span>
                                          </div>
                                          <div className="text-sm text-slate-500">{pet.breed}, {pet.age}yo</div>
                                      </div>
                                  </div>
                              ))}
                              <button 
                                onClick={() => setShowAddPetModal(true)}
                                className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                              >
                                  <Plus size={16} /> Add Pet
                              </button>
                          </div>
                      </div>

                      <div>
                          <h4 className="font-bold text-slate-900 mb-3">Private Notes</h4>
                          <textarea 
                            className="w-full p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-yellow-300 resize-none"
                            rows={4}
                            defaultValue={selectedClient.notes}
                          ></textarea>
                      </div>
                      
                      {/* AI Follow-Up Section */}
                      <div className="pt-6 border-t border-slate-100">
                          <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                              <Sparkles size={16} className="text-indigo-600" /> AI Follow-Up
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                  onClick={() => handleGenerateFollowUp('Email')}
                                  disabled={isGeneratingFollowUp}
                                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                              >
                                  {isGeneratingFollowUp ? <Loader2 size={16} className="animate-spin"/> : <Mail size={16} />}
                                  Draft Email
                              </button>
                              <button 
                                  onClick={() => handleGenerateFollowUp('SMS')}
                                  disabled={isGeneratingFollowUp}
                                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                              >
                                   {isGeneratingFollowUp ? <Loader2 size={16} className="animate-spin"/> : <MessageSquare size={16} />}
                                  Draft SMS
                              </button>
                          </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                          <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">
                              Book Appointment
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Add Pet Modal */}
      {showAddPetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Plus size={20} className="text-indigo-600" /> Add New Pet
                </h3>
                <button onClick={() => setShowAddPetModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X size={20} />
                </button>
             </div>
             
             <form onSubmit={handleAddPet} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pet Name</label>
                      <input 
                        required
                        type="text" 
                        value={newPet.name}
                        onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="e.g. Max"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Breed</label>
                      <input 
                        type="text" 
                        value={newPet.breed}
                        onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="e.g. Golden Retriever"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Age (yrs)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={newPet.age}
                        onChange={(e) => setNewPet({...newPet, age: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Gender</label>
                      <select 
                        value={newPet.gender}
                        onChange={(e) => setNewPet({...newPet, gender: e.target.value as any})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Weight</label>
                      <input 
                        type="text" 
                        value={newPet.weight}
                        onChange={(e) => setNewPet({...newPet, weight: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="e.g. 25 lbs"
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                     <Syringe size={14} /> Medical / Behavior Notes
                   </label>
                   <textarea 
                     value={newPet.medicalNotes}
                     onChange={(e) => setNewPet({...newPet, medicalNotes: e.target.value})}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                     rows={3}
                     placeholder="Allergies, aggressive behavior, etc."
                   />
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                     type="button" 
                     onClick={() => setShowAddPetModal(false)}
                     className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                   >
                     <Save size={18} /> Save Pet
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Full Size Card Modal */}
      {viewCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn" onClick={() => setViewCardModal(null)}>
              <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl p-2 overflow-hidden" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setViewCardModal(null)} className="absolute top-4 right-4 bg-white/50 hover:bg-white p-2 rounded-full text-slate-900 transition-colors z-10">
                      <X size={24} />
                  </button>
                  <img src={viewCardModal} alt="Full Intake Card" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
              </div>
          </div>
      )}
      
      {/* Follow-up Result Modal */}
      {followUpResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setFollowUpResult(null)}>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Sparkles size={16} className="text-indigo-600"/>
                          Generated {followUpResult.type}
                      </h3>
                      <button onClick={() => setFollowUpResult(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      {followUpResult.type === 'Email' && (
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                              <div className="font-medium text-slate-900 border-b border-slate-100 pb-2">{followUpResult.subject}</div>
                          </div>
                      )}
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                          <div className="mt-1 p-4 bg-slate-50 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap border border-slate-100">
                              {followUpResult.content}
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => {navigator.clipboard.writeText(followUpResult.content); setFollowUpResult(null);}} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                              Copy Text
                          </button>
                          <button onClick={() => setFollowUpResult(null)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all">
                              Send Now
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Clients;