import { useState, useEffect, useCallback } from 'react';
import type { Patient, EngagementEvent, AppDBDocument, PatientState, DomoUser } from './types';
import { getPatients, searchPatients, PAGE_SIZE } from './services/patients';
import { getEvents, derivePatientStates, logAssign, logUnassign, logCalled, logUncalled, logComment } from './services/engagement';
import { getUsers, getCurrentUser } from './services/users';
import FilterBar, { type FilterType } from './components/FilterBar';
import PatientTable from './components/PatientTable';
import CommentModal from './components/CommentModal';
import UserBadge from './components/UserBadge';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [events, setEvents] = useState<AppDBDocument<EngagementEvent>[]>([]);
  const [users, setUsers] = useState<DomoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<DomoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [commentModal, setCommentModal] = useState<{
    patient: Patient;
    comment: string;
  } | null>(null);

  // Derive state from events
  const patientStates = derivePatientStates(events);

  // Initial load
  useEffect(() => {
    Promise.all([
      getPatients(0),
      getEvents(),
      getUsers(),
      getCurrentUser().catch(() => null),
    ])
      .then(([p, e, u, me]) => {
        setPatients(p);
        setHasMore(p.length >= PAGE_SIZE);
        setEvents(e);
        setUsers(u);
        setCurrentUser(me);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load more patients
  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const more = await getPatients(patients.length);
      setPatients((prev) => [...prev, ...more]);
      setHasMore(more.length >= PAGE_SIZE);
    } catch (err) {
      console.error('Failed to load more patients:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [patients.length]);

  // Search with debounce
  useEffect(() => {
    if (!searchTerm.trim()) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPatients(searchTerm.trim());
        setPatients(results);
        setHasMore(false);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Reset when search cleared
  useEffect(() => {
    if (searchTerm.trim() === '' && !loading) {
      setLoading(true);
      getPatients(0)
        .then((p) => {
          setPatients(p);
          setHasMore(p.length >= PAGE_SIZE);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [searchTerm]);

  const refreshEvents = async () => {
    try {
      const e = await getEvents();
      setEvents(e);
    } catch (err) {
      console.error('Failed to refresh events:', err);
    }
  };

  // Assign current user to patient
  const handleAssign = async (patient: Patient) => {
    if (!currentUser) return;
    try {
      const created = await logAssign(patientKey(patient), patientDisplayName(patient), currentUser);
      setEvents((prev) => [...prev, created]);
    } catch (err) {
      console.error('Failed to assign patient:', err);
    }
  };

  // Unassign
  const handleUnassign = async (patient: Patient) => {
    if (!currentUser) return;
    try {
      const created = await logUnassign(patientKey(patient), patientDisplayName(patient), currentUser);
      setEvents((prev) => [...prev, created]);
    } catch (err) {
      console.error('Failed to unassign:', err);
    }
  };

  // Toggle called
  const handleToggleCalled = async (patient: Patient, currentlyCalled: boolean) => {
    if (!currentUser) return;
    try {
      const created = currentlyCalled
        ? await logUncalled(patientKey(patient), patientDisplayName(patient), currentUser)
        : await logCalled(patientKey(patient), patientDisplayName(patient), currentUser);
      setEvents((prev) => [...prev, created]);
    } catch (err) {
      console.error('Failed to toggle called:', err);
    }
  };

  // Comments
  const handleOpenComments = (patient: Patient, comment: string) => {
    setCommentModal({ patient, comment });
  };

  const handleSaveComment = async (text: string) => {
    if (!commentModal || !currentUser) return;
    try {
      const created = await logComment(patientKey(commentModal.patient), patientDisplayName(commentModal.patient), currentUser, text);
      setEvents((prev) => [...prev, created]);
    } catch (err) {
      console.error('Failed to save comment:', err);
    }
    setCommentModal(null);
  };

  // Helper to get patient key and display name
  const patientKey = (p: Patient) => String(p['Patient Account Number']);
  const patientDisplayName = (p: Patient) => `${p['Patient First Name']} ${p['Patient Last Name']}`;

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const state = patientStates.get(patientKey(p));
    switch (filter) {
      case 'unassigned':
        return !state?.assignedToUserId;
      case 'mine':
        return state && currentUser && state.assignedToUserId === String(currentUser.id);
      case 'called':
        return state?.called;
      case 'uncalled':
        return state && state.assignedToUserId && !state.called;
      default:
        return true;
    }
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>Patient Engagement CRM</h1>
          <span className="patient-count">{filteredPatients.length} patients</span>
        </div>
        <div className="header-right">
          {currentUser && (
            <UserBadge name={currentUser.displayName} avatarKey={currentUser.avatarKey} size={28} />
          )}
        </div>
      </header>

      <FilterBar
        active={filter}
        onChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <PatientTable
        patients={filteredPatients}
        patientStates={patientStates}
        currentUser={currentUser}
        users={users}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
        onToggleCalled={handleToggleCalled}
        onOpenComments={handleOpenComments}
        loading={loading || loadingMore}
        hasMore={hasMore && filter === 'all' && !searchTerm.trim()}
        onLoadMore={handleLoadMore}
      />

      {commentModal && (
        <CommentModal
          patientName={patientDisplayName(commentModal.patient)}
          initialComment={commentModal.comment}
          onSave={handleSaveComment}
          onClose={() => setCommentModal(null)}
        />
      )}
    </div>
  );
}
