export interface Patient {
  'Patient Account Number': string;
  'Patient First Name': string;
  'Patient Last Name': string;
  'Resources': string;
  'Appointment Type Name': string;
  'Location': string;
  'Appointment Date': string;
  'Start Time': string;
  'Patient Phone': string;
  'Patient Date Of Birth': string;
}

// Activity log event types
export type EngagementEventType = 'ASSIGNED' | 'UNASSIGNED' | 'CALLED' | 'UNCALLED' | 'COMMENT';

export interface EngagementEvent {
  eventType: EngagementEventType;
  patientId: string;
  patientName: string;
  userId: string;
  userName: string;
  timestamp: string;
  comment?: string;
}

// Derived state from activity log (computed, not stored)
export interface PatientState {
  patientId: string;
  patientName: string;
  assignedToUserId: string | null;
  assignedToName: string | null;
  assignedAt: string | null;
  called: boolean;
  calledAt: string | null;
  calledByUserId: string | null;
  calledByName: string | null;
  latestComment: string;
  events: AppDBDocument<EngagementEvent>[];
}

export interface AppDBDocument<T> {
  id: string;
  content: T;
}

export interface DomoUser {
  id: number;
  displayName: string;
  avatarKey: string;
  role: string;
  detail?: {
    title: string;
    email: string;
    phoneNumber: string;
    employeeNumber: number;
    pending: boolean;
  };
}
