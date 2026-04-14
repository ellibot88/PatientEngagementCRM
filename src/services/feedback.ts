import domo from 'ryuu.js';

const COLLECTION = 'Feedback';
const BASE = `/domo/datastores/v1/collections/${COLLECTION}/documents`;

export interface FeedbackEntry {
  category: string;
  message: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export async function submitFeedback(entry: FeedbackEntry) {
  return domo.post(BASE, { content: entry });
}
