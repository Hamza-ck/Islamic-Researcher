import React from 'react';

interface FormattedContentProps {
  content: string;
  onCitationClick?: (citation: string) => void;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({
  content,
  onCitationClick,
}) => {
  if (!content) return null;

  // Split into paragraphs / blocks by double newlines or single newlines
  const lines = content.split('\n');

  const renderInline = (text: string): React.ReactNode => {
    // Regex matching bold, italic, and citation patterns
    // e.g. **bold**, *italic*, and (Quran 2:215 / Sahih al-Bukhari ...)
    const citationRegex = /\((Quran\s+\d+:\d+|Sahih\s+[a-zA-Z\s]+(?:,\s*Hadith\s+\d+)?|Sunan\s+[a-zA-Z\s]+(?:,\s*Hadith\d+)?|Jami\s+[a-zA-Z\s]+|Tafsir\s+[a-zA-Z\s]+)\)/gi;

    // First replace citations with special tokens or parse segments
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Simple markdown inline parser for **bold** and *italic*
    const formatBasicMarkdown = (raw: string): React.ReactNode[] => {
      const subParts: React.ReactNode[] = [];
      const boldItalicRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = boldItalicRegex.exec(raw)) !== null) {
        if (match.index > lastIndex) {
          subParts.push(raw.substring(lastIndex, match.index));
        }
        const token = match[0];
        if (token.startsWith('**') && token.endsWith('**')) {
          subParts.push(
            <strong key={`b-${keyIdx++}`} className="font-semibold text-slate-100">
              {token.slice(2, -2)}
            </strong>
          );
        } else if (token.startsWith('*') && token.endsWith('*')) {
          subParts.push(
            <em key={`i-${keyIdx++}`} className="italic text-emerald-300/90 font-serif">
              {token.slice(1, -1)}
            </em>
          );
        }
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < raw.length) {
        subParts.push(raw.substring(lastIndex));
      }
      return subParts;
    };

    // Parse citations
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = citationRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        const preText = remaining.substring(lastIndex, match.index);
        parts.push(...formatBasicMarkdown(preText));
      }
      const citFull = match[0]; // e.g. (Quran 2:215)
      const citInner = match[1]; // e.g. Quran 2:215

      parts.push(
        <button
          key={`cit-${keyIdx++}`}
          type="button"
          onClick={() => onCitationClick?.(citInner)}
          className="inline-flex items-center px-2 py-0.5 mx-1 rounded-md text-xs font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 hover:border-emerald-400/40 transition-all cursor-pointer shadow-sm"
          title={`View primary source: ${citInner}`}
        >
          {citFull}
        </button>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < remaining.length) {
      parts.push(...formatBasicMarkdown(remaining.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : text;
  };

  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-3 space-y-2.5 pl-1">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-slate-200 text-sm sm:text-base leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <div className="flex-1">{renderInline(item)}</div>
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(
        <hr key={`hr-${i}`} className="my-5 border-t border-white/[0.08]" />
      );
      continue;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      flushList();
      const headingText = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-base sm:text-lg font-bold text-white mt-5 mb-2.5 flex items-center gap-2 tracking-tight"
        >
          <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 shrink-0" />
          <span>{renderInline(headingText)}</span>
        </h3>
      );
      continue;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      flushList();
      const headingText = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-lg sm:text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2.5 tracking-tight border-b border-white/[0.06] pb-2"
        >
          <span className="w-2 h-5 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500 shrink-0" />
          <span>{renderInline(headingText)}</span>
        </h2>
      );
      continue;
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      flushList();
      const headingText = trimmed.replace(/^#\s+/, '');
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-xl sm:text-2xl font-extrabold text-white mt-6 mb-3 tracking-tight"
        >
          {renderInline(headingText)}
        </h1>
      );
      continue;
    }

    // List item (starts with * or - or numbered like 1.)
    if (/^(\*|-)\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^(\*|-)\s+/, ''));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${i}`}
        className="text-slate-200 text-sm sm:text-base leading-relaxed my-2 font-normal"
      >
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{elements}</div>;
};
