import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Zone } from '../types';
import { protocols } from '../components/features/ProtocolChecklist';
import ZoneBadge from '../components/ui/ZoneBadge';

export function ProtocolsPage() {
  const { user } = useApp(); const canSeeRed = user && ['SUPERVISOR', 'DOKTER', 'ADMIN'].includes(user.role);
  return <><header className="page-header"><div><span className="eyebrow">Standarisasi intervensi</span><h1>Protokol berdasarkan zona</h1><p>Ringkasan pengingat kerja; tetap gunakan SPO resmi dan asesmen klinis.</p></div></header><div className="notice warning clinical-banner"><ShieldAlert /><div><strong>Keselamatan pasien adalah prioritas.</strong><p>Konten ini bukan order medis dan tidak menggantikan protokol kegawatdaruratan RS, clinical judgement, atau instruksi DPJP.</p></div></div><section className="protocol-grid">{(['HIJAU', 'KUNING', 'MERAH'] as Zone[]).map((zone) => <article className={`protocol-card card-${zone.toLowerCase()}`} key={zone}><ZoneBadge zone={zone} size="lg" />{zone === 'MERAH' && !canSeeRed ? <div className="locked"><LockKeyhole /><strong>Akses terbatas</strong><p>Detail protokol Merah tersedia untuk Perawat Mahir, Dokter, dan Admin. Perawat Pelaksana wajib melakukan eskalasi segera.</p></div> : <ol>{protocols[zone].map((item) => <li key={item}>{item}</li>)}</ol>}</article>)}</section></>;
}
