import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return <Modal title={title} onClose={onCancel} compact>
    <div className="confirm-dialog">
      <div className={`confirm-icon ${danger ? 'danger' : ''}`}><AlertTriangle /></div>
      <p>{message}</p>
      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className={`button ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </Modal>;
}
