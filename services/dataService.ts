import { Client, Pet, Appointment, BusinessConfig, MarketingCampaign, BreederReport } from '../types';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Configuration ---
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const dataService = {
  
  // --- File Storage ---
  uploadFile: async (file: File, bucket: string, path: string): Promise<string | null> => {
    if (supabase) {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicUrl;
    }
    // Fallback: Return a base64 string
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });
  },

  // --- Clients ---
  getClients: async (): Promise<Client[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('clients').select('*, pets(*)');
      if (error) throw error;
      return data || [];
    }
    const local = localStorage.getItem('pawcrm_clients');
    return local ? JSON.parse(local) : [];
  },

  saveClient: async (client: Client): Promise<void> => {
    if (supabase) {
      const { pets, ...clientData } = client;
      // 1. Upsert Client
      const { error: cError } = await supabase.from('clients').upsert(clientData);
      if (cError) throw cError;
      
      // 2. Upsert Pets (Merged with Owner ID)
      if (pets && pets.length > 0) {
        const petsWithOwner = pets.map(p => ({ 
            ...p, 
            ownerId: client.id, // Strictly Enforce the relationship
        }));
        
        // Exclude denormalized display fields for DB save
        const cleanPets = petsWithOwner.map(({ ownerName, ...rest }) => rest);

        const { error: pError } = await supabase.from('pets').upsert(cleanPets);
        if (pError) throw pError;
      }
      return;
    }
    // LocalStorage
    const current = await dataService.getClients();
    const index = current.findIndex(c => c.id === client.id);
    if (index >= 0) {
      current[index] = client;
    } else {
      current.push(client);
    }
    localStorage.setItem('pawcrm_clients', JSON.stringify(current));
  },

  // --- Pets ---
  // Merged Retrieval: Fetches clients with pets to ensure owner context is preserved
  getPets: async (): Promise<Pet[]> => {
    if (supabase) {
      const { data: clients, error } = await supabase.from('clients').select('id, name, pets(*)');
      if (error) throw error;
      if (!clients) return [];
      // Flatten the structure
      const allPets = clients.flatMap(client => 
        (client.pets as Pet[]).map(p => ({
          ...p,
          ownerId: client.id,
          ownerName: client.name 
        }))
      );
      return allPets;
    }

    // LocalStorage Fallback logic
    const clients = await dataService.getClients();
    const allPets = clients.flatMap(c => 
      c.pets.map(p => ({...p, ownerName: c.name, ownerId: c.id}))
    );
    return allPets;
  },

  // --- Appointments ---
  getAppointments: async (): Promise<Appointment[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('appointments').select('*, clients(name)');
      if (error) {
         const { data: simpleData, error: simpleError } = await supabase.from('appointments').select('*');
         if (simpleError) throw simpleError;
         return simpleData || [];
      }
      return data?.map((apt: any) => ({
          ...apt,
          clientName: apt.clients?.name || apt.clientName 
      })) || [];
    }
    const local = localStorage.getItem('pawcrm_appointments');
    return local ? JSON.parse(local) : [];
  },

  saveAppointment: async (apt: Appointment): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('appointments').upsert(apt);
      if (error) throw error;
      return;
    }
    const current = await dataService.getAppointments();
    const index = current.findIndex(a => a.id === apt.id);
    if (index >= 0) {
      current[index] = apt;
    } else {
      current.push(apt);
    }
    localStorage.setItem('pawcrm_appointments', JSON.stringify(current));
  },

  // --- Campaigns ---
  getCampaigns: async (): Promise<MarketingCampaign[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('campaigns').select('*');
      if (error) throw error;
      return data || [];
    }
    const local = localStorage.getItem('pawcrm_campaigns');
    return local ? JSON.parse(local) : [];
  },

  saveCampaign: async (campaign: MarketingCampaign): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('campaigns').upsert(campaign);
      if (error) throw error;
      return;
    }
    const current = await dataService.getCampaigns();
    const index = current.findIndex(c => c.id === campaign.id);
    if (index >= 0) {
      current[index] = campaign;
    } else {
      current.push(campaign);
    }
    localStorage.setItem('pawcrm_campaigns', JSON.stringify(current));
  },

  // --- Breeder Reports ---
  getBreederReports: async (): Promise<BreederReport[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('breeder_reports').select('*');
      if (error) throw error;
      return data || [];
    }
    const local = localStorage.getItem('pawcrm_breeder_reports');
    return local ? JSON.parse(local) : [];
  },

  saveBreederReport: async (report: BreederReport): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('breeder_reports').upsert(report);
      if (error) throw error;
      return;
    }
    const current = await dataService.getBreederReports();
    const index = current.findIndex(r => r.id === report.id);
    if (index >= 0) {
      current[index] = report;
    } else {
      current.push(report);
    }
    localStorage.setItem('pawcrm_breeder_reports', JSON.stringify(current));
  },

  // --- Settings ---
  getSettings: async (): Promise<BusinessConfig | null> => {
    if (supabase) {
       const { data } = await supabase.from('business_config').select('*').single();
       return data;
    }
    const local = localStorage.getItem('pawcrm_config');
    return local ? JSON.parse(local) : null;
  },

  saveSettings: async (config: BusinessConfig): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('business_config').upsert(config);
      if (error) throw error;
      return;
    }
    localStorage.setItem('pawcrm_config', JSON.stringify(config));
  }
};
