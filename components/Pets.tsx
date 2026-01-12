import React, { useState, useEffect } from 'react';
import { Search, Dog, Cat, Syringe, Weight, Loader2 } from 'lucide-react';
import { Pet } from '../types';
import { dataService } from '../services/dataService';

const Pets: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPets = async () => {
            const data = await dataService.getPets();
            setPets(data);
            setLoading(false);
        };
        fetchPets();
    }, []);

    const filteredPets = pets.filter(pet => 
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto p-8">
       <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Pet Registry</h1>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search pets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map(pet => (
                <div key={pet.id} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100">
                        <img src={pet.avatarUrl} alt={pet.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">{pet.age} yrs</div>
                    </div>
                    <div>
                        <div className="flex justify-between items-start"><h3 className="text-xl font-bold text-slate-900">{pet.name}</h3>{pet.breed.includes('Cat') ? <Cat size={20} className="text-indigo-400"/> : <Dog size={20} className="text-indigo-400"/>}</div>
                        <p className="text-slate-500 font-medium text-sm">{pet.breed}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                             <span className="px-2 py-1 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-1"><Weight size={12} /> {pet.weight}</span>
                             {pet.medicalNotes !== 'None' && <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-100"><Syringe size={12} /> Medical</span>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{(pet.ownerName || 'O').charAt(0)}</div>
                            <span className="text-sm text-slate-600">{pet.ownerName || 'Unknown Owner'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
export default Pets;