import { useState } from 'react';
import { X } from 'lucide-react';

interface CommentModalProps {
  patientName: string;
  initialComment: string;
  onSave: (comment: string) => void;
  onClose: () => void;
}

export default function CommentModal({ patientName, initialComment, onSave, onClose }: CommentModalProps) {
  const [text, setText] = useState(initialComment);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Comments — {patientName}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <textarea
          className="comment-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add notes about this patient..."
          rows={6}
        />
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(text)}>Save</button>
        </div>
      </div>
    </div>
  );
}
