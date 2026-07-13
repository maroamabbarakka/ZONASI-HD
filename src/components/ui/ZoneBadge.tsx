import { AlertOctagon, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Zone } from '../../types';
import { getZoneLabel } from '../../utils/zonasiCalculator';

interface Props { zone: Zone; size?: 'sm' | 'md' | 'lg' | 'xl'; showIcon?: boolean; }

export function ZoneBadge({ zone, size = 'md', showIcon = true }: Props) {
  const Icon = zone === 'HIJAU' ? CheckCircle : zone === 'KUNING' ? AlertTriangle : AlertOctagon;
  return (
    <span className={`zone-badge zone-${zone.toLowerCase()} zone-${size}`} role="status" aria-label={`Status ${getZoneLabel(zone)}`}>
      {showIcon && <Icon aria-hidden="true" />}{getZoneLabel(zone)}
    </span>
  );
}

export default ZoneBadge;
