import Query from '@domoinc/query';
import type { Patient } from '../types';

const PAGE_SIZE = 25;

const COLUMNS = [
  'Patient Account Number',
  'Patient First Name',
  'Patient Last Name',
  'Patient Phone',
  'Patient Date Of Birth',
];

export async function getPatients(offset = 0): Promise<Patient[]> {
  const data = await new Query()
    .select(COLUMNS)
    .orderBy('Patient Last Name', 'ascending')
    .offset(offset)
    .limit(PAGE_SIZE)
    .fetch('patients');

  return data as Patient[];
}

export async function searchPatients(term: string): Promise<Patient[]> {
  const firstNameResults = new Query()
    .select(COLUMNS)
    .where('Patient First Name').contains(term)
    .orderBy('Patient Last Name', 'ascending')
    .limit(PAGE_SIZE)
    .fetch('patients');

  const lastNameResults = new Query()
    .select(COLUMNS)
    .where('Patient Last Name').contains(term)
    .orderBy('Patient Last Name', 'ascending')
    .limit(PAGE_SIZE)
    .fetch('patients');

  const [first, last] = await Promise.all([firstNameResults, lastNameResults]);
  const seen = new Set<number>();
  const merged: Patient[] = [];
  for (const row of [...(first as Patient[]), ...(last as Patient[])]) {
    if (!seen.has(row['Patient Account Number'])) {
      seen.add(row['Patient Account Number']);
      merged.push(row);
    }
  }
  return merged;
}

export { PAGE_SIZE };
