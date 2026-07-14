import { Download, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISSED_KEY = 'zonasi-hd-install-prompt-dismissed-v1';

function isAndroidBrowser() {
  return /Android/i.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches;
}

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAndroidBrowser() || localStorage.getItem(DISMISSED_KEY) === 'true') return;
    const showTimer = window.setTimeout(() => setVisible(true), 1200);
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const handleInstalled = () => {
      localStorage.setItem(DISMISSED_KEY, 'true');
      setVisible(false);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!visible) return null;

  const close = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') close();
  };

  return <div className="install-prompt-backdrop" role="presentation">
    <section className="install-prompt" role="dialog" aria-modal="true" aria-label="Install aplikasi ZONASI-HD">
      <button className="install-close" onClick={close} aria-label="Tutup"><X /></button>
      <div className="install-icon"><Smartphone /></div>
      <span className="eyebrow">Akses lebih cepat</span>
      <h2>Install ZONASI-HD di layar utama</h2>
      <p>Buka aplikasi seperti aplikasi Android biasa, lebih cepat saat digunakan di unit, dan tetap mudah diakses untuk pemantauan pasien.</p>
      <ul>
        <li>Tidak perlu mengetik alamat website berulang.</li>
        <li>Tampilan lebih nyaman di layar ponsel.</li>
        <li>Cocok untuk akses cepat petugas saat pelayanan.</li>
      </ul>
      <div className="install-actions">
        <button className="button secondary" onClick={close}>Nanti saja</button>
        {installEvent ? <button className="button primary" onClick={() => void install()}><Download /> Install aplikasi</button> : <button className="button primary" onClick={close}>Saya mengerti</button>}
      </div>
      {!installEvent && <small>Jika tombol install belum muncul, buka menu browser ⋮ lalu pilih “Tambahkan ke layar utama”.</small>}
    </section>
  </div>;
}
