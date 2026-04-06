import { Phone, PhoneOff, MessageSquare, UserPlus, UserMinus } from 'lucide-react';
import type { Patient, PatientState, DomoUser } from '../types';
import UserBadge from './UserBadge';

interface PatientRowProps {
  patient: Patient;
  state: PatientState | undefined;
  currentUser: DomoUser | null;
  users: DomoUser[];
  onAssign: (patient: Patient) => void;
  onUnassign: (patient: Patient) => void;
  onToggleCalled: (patient: Patient, currentlyCalled: boolean) => void;
  onOpenComments: (patient: Patient, currentComment: string) => void;
}

export default function PatientRow({
  patient,
  state,
  currentUser,
  users,
  onAssign,
  onUnassign,
  onToggleCalled,
  onOpenComments,
}: PatientRowProps) {
  const isAssigned = !!state?.assignedToUserId;
  const isCalled = state?.called ?? false;
  const isMyAssignment = currentUser && state?.assignedToUserId === String(currentUser.id);

  // Look up avatar from users list
  const assignedUser = isAssigned
    ? users.find((u) => String(u.id) === state!.assignedToUserId)
    : undefined;

  return (
    <tr className={`patient-row${isCalled ? ' called' : ''}`}>
      <td>{patient['Patient Account Number']}</td>
      <td>{patient['Patient First Name']}</td>
      <td>{patient['Patient Last Name']}</td>
      <td>{patient['Patient Phone']}</td>
      <td>{patient['Patient Date Of Birth']}</td>
      <td className="assigned-cell">
        {isAssigned ? (
          <div className="assigned-info">
            <UserBadge
              name={state!.assignedToName!}
              avatarKey={assignedUser?.avatarKey}
              size={22}
            />
            {isMyAssignment && (
              <button
                className="icon-btn danger"
                title="Unassign"
                onClick={() => onUnassign(patient)}
              >
                <UserMinus size={14} />
              </button>
            )}
          </div>
        ) : (
          <button className="btn-assign" onClick={() => onAssign(patient)}>
            <UserPlus size={14} />
            <span>Assign to Me</span>
          </button>
        )}
      </td>
      <td className="call-cell">
        {isAssigned && (
          <div className="call-status">
            <button
              className={`icon-btn call-toggle${isCalled ? ' called' : ''}`}
              title={isCalled ? 'Mark uncalled' : 'Mark called'}
              onClick={() => onToggleCalled(patient, isCalled)}
            >
              {isCalled ? <Phone size={16} /> : <PhoneOff size={16} />}
            </button>
            {isCalled && state!.calledAt && (
              <span className="called-timestamp" title={`Called by ${state!.calledByName}`}>
                {new Date(state!.calledAt).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </td>
      <td className="comment-cell">
        {isAssigned && (
          <button
            className={`icon-btn comment-btn${state!.latestComment ? ' has-comment' : ''}`}
            title={state!.latestComment || 'Add comment'}
            onClick={() => onOpenComments(patient, state!.latestComment)}
          >
            <MessageSquare size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}
