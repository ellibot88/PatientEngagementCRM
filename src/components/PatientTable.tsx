import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Patient, PatientState, DomoUser } from '../types';
import PatientRow from './PatientRow';
import Pagination from './Pagination';

interface PatientTableProps {
  patients: Patient[];
  patientStates: Map<string, PatientState>;
  currentUser: DomoUser | null;
  users: DomoUser[];
  onAssign: (patient: Patient) => void;
  onUnassign: (patient: Patient) => void;
  onToggleCalled: (patient: Patient, currentlyCalled: boolean) => void;
  onOpenComments: (patient: Patient, currentComment: string) => void;
  loading: boolean;
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  sortBy: string;
  sortDirection: 'ascending' | 'descending';
  onSort: (column: string) => void;
}

const SORT_COLUMNS: { key: string; label: string }[] = [
  { key: 'Patient Account Number', label: 'Account #' },
  { key: 'Patient First Name', label: 'First Name' },
  { key: 'Patient Last Name', label: 'Last Name' },
  { key: 'Resources', label: 'Resources' },
  { key: 'Appointment Type Name', label: 'Appt Type' },
  { key: 'Location', label: 'Location' },
  { key: 'Appointment Date', label: 'Appt Date' },
  { key: 'Start Time', label: 'Start Time' },
  { key: 'Patient Phone', label: 'Phone' },
  { key: 'Patient Date Of Birth', label: 'DOB' },
];

export default function PatientTable({
  patients,
  patientStates,
  currentUser,
  users,
  onAssign,
  onUnassign,
  onToggleCalled,
  onOpenComments,
  loading,
  currentPage,
  hasNextPage,
  onPageChange,
  sortBy,
  sortDirection,
  onSort,
}: PatientTableProps) {
  if (!loading && patients.length === 0) {
    return <div className="empty-state">No patients found.</div>;
  }

  return (
    <div className="table-container">
      <table className="patient-table">
        <thead>
          <tr>
            {SORT_COLUMNS.map((col) => (
              <th
                key={col.key}
                className="sortable-th"
                onClick={() => onSort(col.key)}
              >
                <span className="th-content">
                  {col.label}
                  {sortBy === col.key && (
                    sortDirection === 'ascending'
                      ? <ChevronUp size={14} className="sort-icon" />
                      : <ChevronDown size={14} className="sort-icon" />
                  )}
                </span>
              </th>
            ))}
            <th>Assigned To</th>
            <th>Call Status</th>
            <th style={{ width: 48 }}></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <PatientRow
              key={p['Patient Account Number']}
              patient={p}
              state={patientStates.get(String(p['Patient Account Number']))}
              currentUser={currentUser}
              users={users}
              onAssign={onAssign}
              onUnassign={onUnassign}
              onToggleCalled={onToggleCalled}
              onOpenComments={onOpenComments}
            />
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        {loading ? (
          <div className="loading-text">Loading...</div>
        ) : (
          <Pagination
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            onPageChange={onPageChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
