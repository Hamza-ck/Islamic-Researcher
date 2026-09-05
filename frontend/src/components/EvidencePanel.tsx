import { RawSearchResult } from '../types';
import { FolioCard } from './FolioCard';

export function EvidencePanel({
  sources,
  arabicFontSize,
  selectedId,
  onSelect,
}: {
  sources: RawSearchResult[];
  arabicFontSize: 'normal' | 'large' | 'huge';
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  if (!sources.length) {
    return (
      <div className="rounded-2xl border border-white/10 p-6 text-sm text-slate-400">
        No evidence units selected. If the corpus is empty or offline, this is expected.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {sources.map((folio, i) => (
        <button
          key={folio.id}
          type="button"
          className="block w-full text-left"
          onClick={() => onSelect?.(folio.id)}
        >
          <FolioCard
            folio={folio}
            index={i}
            arabicFontSize={arabicFontSize}
            isHighlighted={selectedId === folio.id}
          />
        </button>
      ))}
    </div>
  );
}
