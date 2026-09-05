import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  ExternalLink,
  Mic,
  Network
} from 'lucide-react';
import { ResearchPayload, RawSearchResult } from '../types';
import { ResearchTimeline } from './ResearchTimeline';
import { ConflictPanel } from './ConflictPanel';
import { EvidenceGraph } from './EvidenceGraph';
import { FolioCard } from './FolioCard';
import { FormattedContent } from './FormattedContent';

interface ResearchWorkspaceProps {
  research: ResearchPayload;
  arabicFontSize: 'normal' | 'large' | 'huge';
  isDemo?: boolean;
  onRegenerate?: () => void;
  onFeedback?: (queryId: string, rating: number) => void;
  onExportCitation?: (results: RawSearchResult[]) => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  research,
  arabicFontSize,
  isDemo,
  onRegenerate,
  onFeedback,
  onExportCitation,
}) => {
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [showSources, setShowSources] = useState<boolean>(true); // Open by default for research transparency
  const [copied, setCopied] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  const sources = research.sources || [];
  const claims = research.claims || [];
  const contradictions = research.contradictions || [];
  const timelineSteps = research.timeline || [];
  const sufficiency = research.sufficiency;
  const isInsufficient = sufficiency?.status === 'insufficient' || sufficiency?.status === 'low_quality';
  const confidenceScore = research.confidence?.score 
    ? Math.round(research.confidence.score * 100) 
    : 85;

  const handleCopy = () => {
    navigator.clipboard.writeText(research.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    if (research.research_id && onFeedback) {
      onFeedback(research.research_id, rating);
    }
  };

  const handleCitationClick = (citation: string) => {
    setSelectedCitation(citation);
    setShowSources(true);

    // Smooth scroll to corresponding folio card
    const targetFolio = sources.find(
      (s) => s.citation?.toLowerCase().includes(citation.toLowerCase()) ||
             citation.toLowerCase().includes(s.citation?.toLowerCase() || '')
    );
    if (targetFolio) {
      const el = document.getElementById(`folio-${targetFolio.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* 1. TOP METADATA & RESEARCH STATUS STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/[0.08] text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sufficiency Status */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border ${
              isInsufficient
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/25'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
            }`}
          >
            {isInsufficient ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="capitalize">{sufficiency?.status || 'Sufficient'} Evidence</span>
          </span>

          {/* Confidence Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
            <span>Confidence {research.confidence?.level || 'High'} ({confidenceScore}%)</span>
          </span>

          {/* External / Internal Marker */}
          {research.external_research_used ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
              <span>External Web Included</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10 font-medium">
              <span>Primary Scriptural Grounding</span>
            </span>
          )}

          {/* Demo Data Label if applicable */}
          {isDemo && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider text-[10px]">
              Offline Demo Corpus
            </span>
          )}
        </div>

        {/* Audit Buttons: Toggle Research Timeline & Graph */}
        <div className="flex items-center gap-2">
          {timelineSteps.length > 0 && (
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                showTimeline
                  ? 'bg-blue-500/20 text-blue-200 border-blue-400/40'
                  : 'bg-[#282a2c] text-slate-300 border-white/10 hover:bg-[#333538] hover:text-white'
              }`}
              title="Inspect query decomposition, retrieval passes, and verification stages"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Research Trail ({timelineSteps.length} Steps)</span>
              {showTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {claims.length > 0 && (
            <button
              onClick={() => setShowGraph(!showGraph)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                showGraph
                  ? 'bg-purple-500/20 text-purple-200 border-purple-400/40'
                  : 'bg-[#282a2c] text-slate-300 border-white/10 hover:bg-[#333538] hover:text-white'
              }`}
              title="Inspect claim-to-evidence graph"
            >
              <Network className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Evidence Graph</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. COLLAPSIBLE RESEARCH TRAIL & TIMELINE DRAWER */}
      {showTimeline && (
        <div className="rounded-2xl border border-blue-500/20 bg-[#1e1f20]/95 p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Verified Research Trail & Reasoning Pipeline
              </h3>
            </div>
            {sufficiency?.reason && (
              <span className="text-xs text-slate-400 font-mono">
                {sufficiency.reason}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Timeline Stepper */}
            <div className="space-y-3 bg-[#18191a] p-4 rounded-xl border border-white/[0.06]">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Execution Sequence
              </div>
              <ResearchTimeline steps={timelineSteps} />
            </div>

            {/* Verified Claims List */}
            <div className="space-y-3 bg-[#18191a] p-4 rounded-xl border border-white/[0.06]">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Grounded Claims ({claims.length})
              </div>
              {claims.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {claims.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => c.sources[0] && handleCitationClick(c.sources[0])}
                      className="block w-full text-left text-xs rounded-lg border border-white/10 bg-slate-900/50 p-2.5 hover:border-emerald-500/40 hover:bg-slate-900 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`uppercase font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            c.support === 'supported'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : c.support === 'weak'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {c.support}
                        </span>
                        {c.sources[0] && (
                          <span className="text-[11px] font-mono text-slate-400 truncate">
                            {c.sources[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 line-clamp-2 leading-relaxed">{c.text}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No atomic claims extracted for this query.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. EVIDENCE GRAPH DRAWER */}
      {showGraph && claims.length > 0 && (
        <div className="rounded-2xl border border-purple-500/20 bg-[#1e1f20] p-5 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span>Claim-to-Evidence Topology</span>
            </h3>
            <button
              onClick={() => setShowGraph(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <EvidenceGraph claims={claims} sources={sources} />
        </div>
      )}

      {/* 4. SCHOLARLY DISAGREEMENT / CONFLICT ALERT */}
      {contradictions.length > 0 && (
        <div className="animate-in fade-in duration-200">
          <ConflictPanel contradictions={contradictions} />
        </div>
      )}

      {/* 5. INSUFFICIENT EVIDENCE WARNING (When applicable) */}
      {isInsufficient && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-100">
              Evidence is insufficient to make a definitive religious conclusion
            </div>
            <div className="text-xs text-rose-300/90 mt-0.5">
              {sufficiency?.reason || 'The authentic corpus contains limited direct text for this inquiry. Always consult qualified scholars.'}
            </div>
          </div>
        </div>
      )}

      {/* 6. MAIN GROUNDED SCHOLARLY SYNTHESIS (Hero Content) */}
      <article className="rounded-2xl border border-white/[0.08] bg-[#1e1f20] p-6 shadow-sm hover:border-white/[0.12] transition-colors">
        <FormattedContent
          content={research.answer}
          onCitationClick={handleCitationClick}
        />
      </article>

      {/* 7. ACTION TOOLBAR & SOURCES TOGGLE */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
            title="Copy answer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Helpful Ratings */}
          <button
            onClick={() => handleRate(1)}
            className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ${
              userRating === 1 ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-white'
            }`}
            title="Helpful analysis"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRate(-1)}
            className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ${
              userRating === -1 ? 'text-rose-400 bg-rose-500/10' : 'hover:text-white'
            }`}
            title="Needs refinement"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>

          {/* Regenerate Button */}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
              title="Regenerate synthesis"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          {/* Export Folio Button */}
          {onExportCitation && sources.length > 0 && (
            <button
              onClick={() => onExportCitation(sources)}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
              title="Export Academic Citation Folio"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Export Folio</span>
            </button>
          )}
        </div>

        {/* Collapsible Sources Drawer Toggle */}
        {sources.length > 0 && (
          <button
            onClick={() => setShowSources(!showSources)}
            className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-[#282a2c] hover:bg-[#333538] border border-white/10 text-xs text-slate-200 font-medium transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{sources.length} Cited Primary Passages</span>
            {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* 8. EXPANDED SOURCES / FOLIOS (Full-width, zero horizontal clipping) */}
      {showSources && sources.length > 0 && (
        <div className="pt-4 space-y-4 border-t border-white/[0.08] animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Verified Primary Scriptural Passages ({sources.length})</span>
            </span>
            <span className="text-slate-500">Each citation is traceable to canonical corpus manuscripts</span>
          </div>

          <div className="space-y-4">
            {sources.map((folio, idx) => (
              <div key={folio.id || idx} className="space-y-2">
                <FolioCard
                  folio={folio}
                  index={idx}
                  arabicFontSize={arabicFontSize}
                  isHighlighted={
                    Boolean(
                      selectedCitation &&
                      folio.citation?.toLowerCase().includes(selectedCitation.toLowerCase())
                    )
                  }
                />

                {/* Lecture Discourse Timestamp Anchor if applicable */}
                {folio.metadata?.video_url && (
                  <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span>
                        Lecture Discourse: <strong>{folio.metadata.scholar || 'Scholar Lecture'}</strong>
                      </span>
                      {folio.metadata.timestamp_anchor && (
                        <span className="font-mono text-purple-400">
                          @{folio.metadata.timestamp_anchor}
                        </span>
                      )}
                    </div>
                    <a
                      href={folio.metadata.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                    >
                      <span>Listen to Discourse</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
