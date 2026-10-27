import { useEffect, useId, useRef } from 'react';
import Icon from './Icon.jsx';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}) {
  const ref = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    if (open && !ref.current.open) ref.current.showModal();
    else if (!open && ref.current.open) ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button
        className="icon-button dialog-close"
        aria-label="Close confirmation"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <span className="dialog-symbol">
        <Icon name="calendar" size={27} />
      </span>
      <h2 id={titleId}>{title}</h2>
      <p id={descriptionId}>{description}</p>
      <div className="dialog-actions">
        <button className="button button-outline" onClick={onClose} autoFocus>
          Keep event
        </button>
        <button className="button button-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
