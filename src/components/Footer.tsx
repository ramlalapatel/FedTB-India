import React from 'react';
import { AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-8 px-4 sm:px-6 transition-colors print:hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Prominent Medical & Regulatory Disclaimer Callout */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="leading-relaxed">
            <span className="font-semibold text-amber-300">MEDICAL DISCLAIMER & INTENDED USE:</span>{' '}
            FedTB-India is an academic research and technical simulation demonstration illustrating privacy-preserving federated deep learning algorithms (FedAvg, FedProx, DP-SGD). It is <strong>NOT</strong> a certified medical device, does not provide clinical diagnostic opinions, and must never supersede evaluated radiological review or confirmatory microbiological assays (e.g. Sputum Smear, GeneXpert MTB/RIF).
          </div>
        </div>

        {/* Data Protection and Regulatory Alignment */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-500 border-b border-slate-900 pb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">
              Compliant with the Digital Personal Data Protection Act (DPDP Act 2023, India) · No patient DICOM images transferred.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Aligned with National Tuberculosis Elimination Programme (NTEP) End TB Strategy.</span>
          </div>
        </div>

        {/* Metadata and Citations */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">FedTB-India</span>
            <span aria-hidden="true">·</span>
            <span>Federated Deep Learning Platform</span>
            <span aria-hidden="true">·</span>
            <span>Research Edition v2.4</span>
          </div>

          <div className="flex items-center gap-3">
            <span>McMahan et al. (FedAvg)</span>
            <span aria-hidden="true">·</span>
            <span>Li et al. (FedProx)</span>
            <span aria-hidden="true">·</span>
            <span>Abadi et al. (DP-SGD)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
