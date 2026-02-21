import React, { useState } from 'react';
import { Search, Filter, Dog, Cat, Syringe, Weight } from 'lucide-react';
import { Pet } from '../types';

// Using mock data for display
const MOCK_PETS: (Pet & { ownerName: string })[] = [
    {
        id: 'p1',
        ownerId: '1',
        ownerName: 'Sarah Connor',
        name: 'Terminator',
        breed: 'German Shepherd',
        age: 5,
        gender: 'Male',
        weight: '85 lbs',
        medicalNotes: 'Hip dysplasia monitor.',
        avatarUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=500&h=500&fit=crop'
    },
    {
        id: 'p2',
        ownerId: '2',
        ownerName: 'John Wick',
        name: 'Daisy',
        breed: 'Beagle',
        age: 1,
        gender: 'Female',
        weight: '22 lbs',
        medicalNotes: 'None',
        avatarUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&h=500&fit=crop'
    },
    {
        id: 'p3',
        ownerId: '3',
        ownerName: 'Ellen Ripley',
        name: 'Jonesy',
        breed: 'Orange Tabby',
        age: 8,
        gender: 'Male',
        weight: '12 lbs',
        medicalNotes: 'Anxiety',
        avatarUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop'
    },
     {
        id: 'p4',
        ownerId: '4',
        ownerName: 'Charlie Brown',
        name: 'Snoopy',
        breed: 'Beagle',
        age: 6,
        gender: 'Male',
        weight: '25 lbs',
        medicalNotes: 'None',
        avatarUrl: 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=500&h=500&fit=crop'
    }
];

const Pets: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPets = MOCK_PETS.filter(pet => 
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="max-w-[1600px] mx-auto p-8">
       <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pet Registry</h1>
                <p className="text-slate-500 mt-1">Total database of {MOCK_PETS.length} furry friends.</p>
            </div>
            <div className="flex gap-4">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search pets..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
                <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium">
                    <Filter size={18} /> Filter
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map(pet => (
                <div key={pet.id} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-soft hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100">
                        <img src={pet.avatarUrl} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                            {pet.age} yrs
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-slate-900">{pet.name}</h3>
                            {pet.breed.includes('Tabby') || pet.breed.includes('Cat') ? <Cat size={20} className="text-indigo-400"/> : <Dog size={20} className="text-indigo-400"/>}
                        </div>
                        <p className="text-slate-500 font-medium text-sm">{pet.breed}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                             <span className="px-2 py-1 bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-1">
                                <Weight size={12} /> {pet.weight}
                             </span>
                             {pet.medicalNotes !== 'None' && (
                                <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-100">
                                    <Syringe size={12} /> Medical
                                </span>
                             )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                {pet.ownerName.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600">{pet.ownerName}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Pets;