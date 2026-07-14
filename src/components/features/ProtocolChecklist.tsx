import type { UserRole, Zone } from '../../types';

const protocols: Record<Zone, string[]> = {
  HIJAU: ['Edukasi rutin pembatasan cairan', 'Catat hasil pada Kartu Kendali', 'Pertahankan pemantauan standar'],
  KUNING: ['Kaji asupan cairan dan natrium', 'Evaluasi target UF dan toleransi pasien', 'Monitoring lebih ketat selama HD', 'Edukasi pasien dan keluarga', 'Eskalasi bila kondisi klinis memburuk'],
  MERAH: ['Lakukan asesmen kegawatdaruratan segera', 'Aktifkan protokol edema paru unit', 'Kolaborasi dengan Perawat Mahir dan hubungi DPJP', 'Laksanakan oksigenasi/suction sesuai asesmen, kewenangan, dan SPO RS', 'Pantau tanda vital serta respons pasien', 'Dokumentasikan instruksi medis dan seluruh tindakan'],
};

export function ProtocolChecklist({ zone, role, selected, onChange }: { zone: Zone; role: UserRole; selected: string[]; onChange: (items: string[]) => void }) {
  const restricted = zone === 'MERAH' && role === 'PERAWAT';
  return (
    <div className="protocol-box">
      <div className="section-heading"><h3>Protokol {zone}</h3><span className="eyebrow">Checklist tindakan</span></div>
      {restricted && <div className="notice danger">Perawat Pelaksana wajib segera mengeskalasi pasien Zona Merah kepada Perawat Mahir/DPJP. Checklist tindakan Merah hanya dapat dicatat oleh Perawat Mahir atau Dokter.</div>}
      <div className="check-list">
        {protocols[zone].map((item) => <label key={item} className={restricted ? 'disabled' : ''}>
          <input type="checkbox" disabled={restricted} checked={selected.includes(item)} onChange={(event) => onChange(event.target.checked ? [...selected, item] : selected.filter((value) => value !== item))} />
          <span>{item}</span>
        </label>)}
      </div>
      <p className="clinical-note">Panduan layar tidak menggantikan asesmen klinis, SPO rumah sakit, atau instruksi dokter.</p>
    </div>
  );
}

export { protocols };
