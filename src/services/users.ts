import domo from 'ryuu.js';
import type { DomoUser } from '../types';

export async function getUsers(): Promise<DomoUser[]> {
  return domo.get('/domo/users/v1?includeDetails=true&limit=500') as any;
}

export async function getCurrentUser(): Promise<DomoUser> {
  const userId = (domo as any).env?.userId;
  if (!userId) throw new Error('No user context available');
  return domo.get(`/domo/users/v1/${userId}`) as any;
}
