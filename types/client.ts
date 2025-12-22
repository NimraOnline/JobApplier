// Core client identity - shared across the app
export interface Client {
  id: string;
  name: string;
  slug: string; // URL-friendly version
  email: string; // Add this for the emails data
}

// Dashboard-specific client data
export interface ClientAssignment {
  id: string;
  client: string; // This should reference Client.id eventually
  clientId: string;
  resume: string;
  questionnaire: string;
  applications: number;
  matches: number;
}

// Email data structure
export interface ClientEmail {
  id: number;
  from: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
  isImportant: boolean;
}

// Form data types (unchanged)
export interface ApplicationFormData {
  jobUrl: string;
}

export interface JobMatchFormData {
  emlFile: File | null;
  dateMatched: string;
}

export interface ClientFormProps {
  client: Client;
  onApplicationSubmit: (data: ApplicationFormData & { clientId: string }) => void;
  onJobMatchSubmit: (data: JobMatchFormData & { clientId: string }) => void;
}
