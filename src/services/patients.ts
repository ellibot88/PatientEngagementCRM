import Query from '@domoinc/query';
import type { Patient, QueryFilters } from '../types';

const PAGE_SIZE = 25;

const COLUMNS = [
  'Patient Account Number',
  'Patient First Name',
  'Patient Last Name',
  'Resources',
  'Appointment Type Name',
  'Location',
  'Appointment Date',
  'Start Time',
  'Patient Phone',
  'Patient Date Of Birth',
];

interface GetPatientsParams {
  offset?: number;
  filters?: QueryFilters;
}

function applyFilters(query: any, filters?: QueryFilters): any {
  let q = query;
  if (filters?.location) {
    q = q.where('Location').equals(filters.location);
  }
  if (filters?.appointmentDate) {
    q = q.where('Appointment Date').equals(filters.appointmentDate);
  }
  q = q.orderBy(
    filters?.sortBy ?? 'Appointment Date',
    filters?.sortDirection ?? 'ascending'
  );
  return q;
}

export async function getPatients(params: GetPatientsParams = {}): Promise<Patient[]> {
  let query = new Query().select(COLUMNS);
  query = applyFilters(query, params.filters);
  query = query.offset(params.offset ?? 0).limit(PAGE_SIZE);

  return query.fetch('patients') as Promise<Patient[]>;
}

export async function searchPatients(term: string, filters?: QueryFilters): Promise<Patient[]> {
  let q1 = new Query().select(COLUMNS).where('Patient First Name').contains(term);
  let q2 = new Query().select(COLUMNS).where('Patient Last Name').contains(term);

  // Apply location/date filters after the name filter
  if (filters?.location) {
    q1 = q1.where('Location').equals(filters.location);
    q2 = q2.where('Location').equals(filters.location);
  }
  if (filters?.appointmentDate) {
    q1 = q1.where('Appointment Date').equals(filters.appointmentDate);
    q2 = q2.where('Appointment Date').equals(filters.appointmentDate);
  }

  const sortBy = filters?.sortBy ?? 'Appointment Date';
  const sortDir = filters?.sortDirection ?? 'ascending';
  q1 = q1.orderBy(sortBy, sortDir).limit(PAGE_SIZE);
  q2 = q2.orderBy(sortBy, sortDir).limit(PAGE_SIZE);

  const [first, last] = await Promise.all([q1.fetch('patients'), q2.fetch('patients')]);
  const seen = new Set<string>();
  const merged: Patient[] = [];
  for (const row of [...(first as Patient[]), ...(last as Patient[])]) {
    if (!seen.has(row['Patient Account Number'])) {
      seen.add(row['Patient Account Number']);
      merged.push(row);
    }
  }
  return merged;
}

export async function getLocations(): Promise<string[]> {
  const data = await new Query()
    .select(['Location'])
    .limit(5000)
    .fetch('patients') as { Location: string }[];
  return [...new Set(data.map((r) => r.Location).filter(Boolean))].sort();
}

export { PAGE_SIZE };
