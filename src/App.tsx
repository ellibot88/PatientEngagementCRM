import { useState, useEffect, useCallback } from 'react';
import type { Patient, EngagementEvent, AppDBDocument, QueryFilters, DomoUser } from './types';
import { getPatients, searchPatients, getLocations, PAGE_SIZE } from './services/patients';
import { getEvents, derivePatientStates, logAssign, logUnassign, logCalled, logUncalled, logComment } from './services/engagement';
import { getUsers, getCurrentUser } from './services/users';
import FilterBar, { type FilterType } from './components/FilterBar';
import DataFilters from './components/DataFilters';
import PatientTable from './components/PatientTable';
import CommentModal from './components/CommentModal';
import FeedbackModal from './components/FeedbackModal';
import { submitFeedback } from './services/feedback';
import UserBadge from './components/UserBadge';
import { MessageSquarePlus } from 'lucide-react';

const DEFAULT_FILTERS: QueryFilters = {
  location: null,
  appointmentDate: null,
  sortBy: 'Appointment Date',
  sortDirection: 'ascending',
};

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [events, setEvents] = useState<AppDBDocument<EngagementEvent>[]>([]);
  const [users, setUsers] = useState<DomoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<DomoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [queryFilters, setQueryFilters] = useState<QueryFilters>(DEFAULT_FILTERS);
  const [locations, setLocations] = useState<string[]>([]);
  const [commentModal, setCommentModal] = useState<{
    patient: Patient;
    comment: string;
  } | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Derive state from events
  const patientStates = derivePatientStates(events);

  // Fetch a page of patients with current filters
  const fetchPage = useCallback(async (page: number, filters: QueryFilters, search?: string) => {
    setLoading(true);
    try {
      let results: Patient[];
      if (search?.trim()) {
        results = await searchPatients(search.trim(), filters);
        setHasMore(false);
      } else {
        results = await getPatients({ offset: (page - 1) * PAGE_SIZE, filters });
        setHasMore(results.length >= PAGE_SIZE);
      }
      setPatients(results);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([
      getPatients({ offset: 0, filters: DEFAULT_FILTERS }),
      getEvents(),
      getUsers(),
      getCurrentUser().catch(() => null),
      getLocations(),
    ])
      .then(([p, e, u, me, locs]) => {
        setPatients(p);
        setHasMore(p.length >= PAGE_SIZE);
        setEvents(e);
        setUsers(u);
        setCurrentUser(me);
        setLocations(locs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Refetch when filters change
  const handleFilterChange = (newFilters: Partial<QueryFilters>) => {
    const merged = { ...queryFilters, ...newFilters };
    setQueryFilters(merged);
    setCurrentPage(1);
    fetchPage(1, merged, searchTerm);
  };

  // Page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPage(page, queryFilters, searchTerm);
  };

  // Sort toggle
  const handleSort = (column: string) => {
    const newDir = queryFilters.sortBy === column && queryFilters.sortDirection === 'ascending'
      ? 'descending' as const
      : 'ascending' as const;
    handleFilterChange({ sortBy: column, sortDirection: newDir });
  };

  // Search with debounce
  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchPage(1, queryFilters);
      setCurrentPage(1);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchPage(1, queryFilters, searchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Helper to get patient key and display name
  const patientKey = (p: Patient) => String(p['Patient Account Number']);
  const patientDisplayName = (p: Patient) => `${p['Patient First Name']} ${p['Patient Last Name']}`;

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

  // Feedback
  const handleSubmitFeedback = async (data: { category: string; message: string }) => {
    if (!currentUser) return;
    try {
      await submitFeedback({
        category: data.category,
        message: data.message,
        userId: String(currentUser.id),
        userName: currentUser.displayName,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
    setFeedbackOpen(false);
  };

  // Filter patients by engagement status (client-side on current page)
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
          <button className="btn-feedback" onClick={() => setFeedbackOpen(true)}>
            <MessageSquarePlus size={16} />
            <span>Feedback</span>
          </button>
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

      <DataFilters
        locations={locations}
        selectedLocation={queryFilters.location}
        onLocationChange={(loc) => handleFilterChange({ location: loc })}
        selectedDate={queryFilters.appointmentDate}
        onDateChange={(date) => handleFilterChange({ appointmentDate: date })}
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
        loading={loading}
        currentPage={currentPage}
        hasNextPage={hasMore && filter === 'all' && !searchTerm.trim()}
        onPageChange={handlePageChange}
        sortBy={queryFilters.sortBy}
        sortDirection={queryFilters.sortDirection}
        onSort={handleSort}
      />

      {commentModal && (
        <CommentModal
          patientName={patientDisplayName(commentModal.patient)}
          initialComment={commentModal.comment}
          onSave={handleSaveComment}
          onClose={() => setCommentModal(null)}
        />
      )}

      {feedbackOpen && (
        <FeedbackModal
          onSubmit={handleSubmitFeedback}
          onClose={() => setFeedbackOpen(false)}
        />
      )}
    </div>
  );
}
