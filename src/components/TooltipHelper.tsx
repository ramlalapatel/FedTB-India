import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, BookOpen, AlertCircle, X } from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/glossary';

interface TooltipHelperProps {
  termKey?: keyof typeof GLOSSARY_TERMS;
  customTitle?: string;
  customDescription?: string;
  customClinical?: string;
  label?: string; // If provided, displays label text alongside or in place of icon
  align?: 'left' | 'right' | 'center';
  badgeStyle?: boolean;
}

export const TooltipHelper: React.FC<TooltipHelperProps> = ({
  termKey,
  customTitle,
  customDescription,
  customClinical,
  label,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const termData = termKey ? GLOSSARY_TERMS[termKey] : null;
  const title = customTitle || termData?.term || 'Technical Parameter';
  const description = customDescription || termData?.detailedExplanation || termData?.shortDesc || '';
  const clinical = customClinical || termData?.clinicalImpact || '';

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const alignmentClasses =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  return (
    <div className="relative inline-flex items-center align-middle" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 rounded p-0.5 group"
        title={`How it works: ${title}`}
        aria-label={`Learn how ${title} works`}
      >
        {label && <span className="text-inherit text-xs">{label}</span>}
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-50 w-72 md:w-84 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-left text-xs ${alignmentClasses}`}
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-100 text-sm">
              <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
              aria-label="Close tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-slate-300 leading-relaxed mb-3">{description}</p>

          {clinical && (
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-200">
              <div className="flex items-center gap-1 font-medium text-cyan-300 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Clinical & Legal Relevance</span>
              </div>
              <p className="text-slate-300 leading-normal">{clinical}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
