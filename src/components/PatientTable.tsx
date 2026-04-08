import type { Patient, PatientState, DomoUser } from '../types';
import PatientRow from './PatientRow';

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
  hasMore: boolean;
  onLoadMore: () => void;
}

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
  hasMore,
  onLoadMore,
}: PatientTableProps) {
  if (!loading && patients.length === 0) {
    return <div className="empty-state">No patients found.</div>;
  }

  return (
    <div className="table-container">
      <table className="patient-table">
        <thead>
          <tr>
            <th>Account #</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Resources</th>
            <th>Appt Type</th>
            <th>Location</th>
            <th>Appt Date</th>
            <th>Start Time</th>
            <th>Phone</th>
            <th>DOB</th>
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
        {loading && <div className="loading-text">Loading...</div>}
        {!loading && hasMore && (
          <button className="btn-load-more" onClick={onLoadMore}>
            Load More
          </button>
        )}
        {!loading && !hasMore && patients.length > 0 && (
          <div className="end-text">All patients loaded</div>
        )}
      </div>
    </div>
  );
}
