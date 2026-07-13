import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { HDSession } from '../../types';

export function IDWGTrendChart({ sessions }: { sessions: HDSession[] }) {
  const data = [...sessions].slice(0, 12).reverse().map((session) => ({
    tanggal: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(session.session_date)),
    idwg: session.idwg_pct,
  }));
  if (!data.length) return <div className="empty-state">Belum ada sesi untuk ditampilkan.</div>;
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 14, right: 14, left: -18, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#dbe4e5" /><XAxis dataKey="tanggal" fontSize={12} /><YAxis domain={[0, (max: number) => Math.max(7, Math.ceil(max + 1))]} unit="%" fontSize={12} />
    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'IDWG']} />
    <ReferenceLine y={3} stroke="#ca8a04" strokeDasharray="5 4" label={{ value: '3%', fill: '#854d0e', fontSize: 11 }} />
    <ReferenceLine y={5} stroke="#dc2626" strokeDasharray="5 4" label={{ value: '5%', fill: '#991b1b', fontSize: 11 }} />
    <Line type="monotone" dataKey="idwg" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, fill: '#0f766e' }} />
  </LineChart></ResponsiveContainer></div>;
}
