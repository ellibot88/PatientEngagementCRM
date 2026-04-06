import domo from 'ryuu.js';
import type { EngagementEvent, EngagementEventType, AppDBDocument, PatientState, DomoUser } from '../types';

const COLLECTION = 'PatientEngagement';
const BASE = `/domo/datastores/v1/collections/${COLLECTION}/documents`;

// Fetch all events
export async function getEvents(): Promise<AppDBDocument<EngagementEvent>[]> {
  return domo.get(BASE) as any;
}

// Create a new event
async function createEvent(
  eventType: EngagementEventType,
  patientId: string,
  patientName: string,
  user: DomoUser,
  comment?: string
): Promise<AppDBDocument<EngagementEvent>> {
  const content: EngagementEvent = {
    eventType,
    patientId,
    patientName,
    userId: String(user.id),
    userName: user.displayName,
    timestamp: new Date().toISOString(),
    ...(comment !== undefined && { comment }),
  };
  return domo.post(BASE, { content }) as any;
}

export async function logAssign(patientId: string, patientName: string, user: DomoUser) {
  return createEvent('ASSIGNED', patientId, patientName, user);
}

export async function logUnassign(patientId: string, patientName: string, user: DomoUser) {
  return createEvent('UNASSIGNED', patientId, patientName, user);
}

export async function logCalled(patientId: string, patientName: string, user: DomoUser) {
  return createEvent('CALLED', patientId, patientName, user);
}

export async function logUncalled(patientId: string, patientName: string, user: DomoUser) {
  return createEvent('UNCALLED', patientId, patientName, user);
}

export async function logComment(patientId: string, patientName: string, user: DomoUser, comment: string) {
  return createEvent('COMMENT', patientId, patientName, user, comment);
}

// Derive current state per patient from the full event log
export function derivePatientStates(events: AppDBDocument<EngagementEvent>[]): Map<string, PatientState> {
  const states = new Map<string, PatientState>();

  // Sort events chronologically
  const sorted = [...events].sort(
    (a, b) => new Date(a.content.timestamp).getTime() - new Date(b.content.timestamp).getTime()
  );

  for (const event of sorted) {
    const e = event.content;
    let state = states.get(e.patientId);

    if (!state) {
      state = {
        patientId: e.patientId,
        patientName: e.patientName,
        assignedToUserId: null,
        assignedToName: null,
        assignedAt: null,
        called: false,
        calledAt: null,
        calledByUserId: null,
        calledByName: null,
        latestComment: '',
        events: [],
      };
      states.set(e.patientId, state);
    }

    state.events.push(event);

    switch (e.eventType) {
      case 'ASSIGNED':
        state.assignedToUserId = e.userId;
        state.assignedToName = e.userName;
        state.assignedAt = e.timestamp;
        break;
      case 'UNASSIGNED':
        state.assignedToUserId = null;
        state.assignedToName = null;
        state.assignedAt = null;
        state.called = false;
        state.calledAt = null;
        state.calledByUserId = null;
        state.calledByName = null;
        break;
      case 'CALLED':
        state.called = true;
        state.calledAt = e.timestamp;
        state.calledByUserId = e.userId;
        state.calledByName = e.userName;
        break;
      case 'UNCALLED':
        state.called = false;
        state.calledAt = null;
        state.calledByUserId = null;
        state.calledByName = null;
        break;
      case 'COMMENT':
        state.latestComment = e.comment ?? '';
        break;
    }
  }

  return states;
}
