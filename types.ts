import React from 'react';

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CLIENTS = 'CLIENTS',
  APPOINTMENTS = 'APPOINTMENTS',
  PETS = 'PETS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  BREED_IDENTIFIER = 'BREED_IDENTIFIER',
  BATCH_INTAKE = 'BATCH_INTAKE',
  MESSAGES = 'MESSAGES',
  SETTINGS = 'SETTINGS',
  BREEDER_WATCH = 'BREEDER_WATCH',
}

export interface User {
  email: string;
  name: string;
  businessName: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  description?: string;
  brandColor?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  petName: string;
  service: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
  avatarUrl?: string;
  notes?: string;
  date?: string;
}

export interface NotificationPreferences {
  emailReminders: boolean;
  smsReminders: boolean;
  allowClientPreference: boolean;
  marketingEmails: boolean;
  newClientAlerts: boolean;
  dailySummary: boolean;
}

export interface BusinessConfig {
  id?: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  cancellationPolicy: string;
  
  // Branding
  logoUrl?: string;
  brandColor: string;
  brandTagline?: string;

  // Integrations
  calendlyUrl?: string;
  mailchimpApiKey?: string;
  stripeConnected?: boolean;
  quickbooksConnected?: boolean;
  googleCalendarConnected?: boolean;
  
  notifications: NotificationPreferences;
}

export interface Pet {
  id: string;
  ownerId?: string;
  ownerName?: string; // Denormalized for display
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  weight: string;
  medicalNotes: string;
  avatarUrl: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  notes: string;
  pets: Pet[];
  lastVisit?: string;
  totalSpent?: number;
  originalCardUrl?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'Email' | 'SMS';
  audience: string;
  sentDate: string;
  status: 'Draft' | 'Sent' | 'Scheduled';
  stats: {
    sent: number;
    opened?: number;
    clicked?: number;
  }
}

export interface BreederReport {
  id: string;
  kennelName: string;
  breederName: string;
  location: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  reportCount: number;
  lastReported: string;
  flags: string[];
  description: string;
}