import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()} role="presentation">
    <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <header><h1>{title}</h1><button className="icon-button" onClick={onClose} aria-label="Tutup"><X /></button></header>
      <div className="modal-body">{children}</div>
    </section>
  </div>;
}
