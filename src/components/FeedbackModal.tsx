import { useState } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  onSubmit: (data: { category: string; message: string }) => void;
  onClose: () => void;
}

const CATEGORIES = ['Bug Report', 'Feature Request', 'General Feedback'];

export default function FeedbackModal({ onSubmit, onClose }: FeedbackModalProps) {
  const [category, setCategory] = useState(CATEGORIES[2]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    await onSubmit({ category, message: message.trim() });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Submit Feedback</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="feedback-form">
          <label className="filter-label">Category</label>
          <select
            className="filter-select feedback-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label className="filter-label" style={{ marginTop: 12 }}>Message</label>
          <textarea
            className="comment-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind..."
            rows={5}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
          >
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
