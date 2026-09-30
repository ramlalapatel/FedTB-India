import React from 'react';
import { 
  ShieldAlert, 
  Scale, 
  Users, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  BookOpen, 
  HeartHandshake, 
  Database 
} from 'lucide-react';
import { TooltipHelper } from '../TooltipHelper';

export const EthicsLimitationsPage: React.FC = () => {
  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Ethics, Non-IID Limitations & Indian Regulatory Framework
          </h1>
          <TooltipHelper termKey="dpdp_act" />
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Critical examination of algorithmic bias, model poisoning vulnerabilities, clinical validation necessities, and statutory compliance under the Digital Personal Data Protection Act (DPDP Act 2023).
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Non-IID Data & Demographic Bias in India */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <Users className="w-5 h-5 shrink-0" />
            <span>1. Non-IID Bias & Population Disparities</span>
            <TooltipHelper termKey="non_iid" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            In India, tuberculosis manifestations vary drastically across geographical, nutritional, and socio-economic strata. A model trained predominantly on urban apex hospitals (like AIIMS New Delhi) can underperform severely when deployed in tribal or rural belts.
          </p>

          <ul className="space-y-2 text-xs text-slate-400">
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Hardware & Scanner Drift:</strong> Tertiary centers use multi-million rupee Siemens digital X-ray units, while rural PHCs rely on portable Allengers MARS systems with lower resolution and radiation scatter.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Demographic & Nutritional Factors:</strong> Severe malnutrition in rural cohorts frequently alters the classic apical cavitary pattern to subtle basal infiltrates or primary progressive TB.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Pediatric Diagnostic Gap:</strong> TB in children is notoriously paucibacillary with atypical radiographic presentation; federated models must ensure pediatric data is represented without class starvation.
            </li>
          </ul>
        </div>

        {/* 2. Adversarial Model Poisoning & Byzantine Faults */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>2. Model Poisoning & Byzantine Vulnerabilities</span>
            <TooltipHelper termKey="model_poisoning" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            In a federated network with tens of district health centers, not all nodes can be assumed benign or well-calibrated. A compromised edge workstation or a faulty detector could inject corrupted gradients.
          </p>

          <ul className="space-y-2 text-xs text-slate-400">
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Gradient Inversion / Poisoning:</strong> A malicious participant could intentionally flip classification labels or magnify gradient norms to cause model divergence.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Byzantine-Robust Defenses:</strong> Standard FedAvg is vulnerable to single-node poisoning. FedTB-India implements L2 gradient clipping and recommends Krum, Trimmed Mean, or Coordinate-Wise Median aggregation.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Backdoor Triggers:</strong> Ensuring malicious actors cannot embed stealth triggers (e.g., a specific hospital watermark causing the model to misclassify TB as normal).
            </li>
          </ul>
        </div>

        {/* 3. Clinical Validation & Radiologist-in-the-Loop */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
            <HeartHandshake className="w-5 h-5 shrink-0" />
            <span>3. Clinical Validation & Clinician-in-the-Loop</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            AI must augment, never replace, qualified healthcare personnel. In clinical tuberculosis management, chest radiography is a screening tool, while microbiological confirmation remains the gold standard.
          </p>

          <ul className="space-y-2 text-xs text-slate-400">
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Microbiological Correlation:</strong> AI radiograph screening must immediately route suspicious cases to sputum smear microscopy or rapid molecular GeneXpert MTB/RIF cartridge tests.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Explainability via Grad-CAM:</strong> Clinicians must inspect activation heatmaps to verify that the model is detecting true parenchymal consolidation rather than patient jewelry, labels, or ECG leads.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Prospective Clinical Trials:</strong> Retrospective high AUC on benchmark datasets does not guarantee diagnostic efficacy in an active primary healthcare camp without rigorous prospective trials.
            </li>
          </ul>
        </div>

        {/* 4. Statutory Regulations: India DPDP Act 2023 & CDSCO */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <Scale className="w-5 h-5 shrink-0" />
            <span>4. Regulatory Mandates: DPDP Act 2023 & CDSCO SaMD</span>
            <TooltipHelper termKey="dpdp_act" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The regulatory landscape in India has fundamentally transformed with the enactment of the Digital Personal Data Protection Act (DPDP Act 2023) and CDSCO guidelines for Software as a Medical Device (SaMD).
          </p>

          <ul className="space-y-2 text-xs text-slate-400">
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Data Fiduciary Obligations:</strong> Healthcare institutions cannot aggregate patient records into commercial multi-tenant clouds without explicit, revokable consent. Penalties reach ₹250 crore.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">Federated Legal Compliance:</strong> Because patient radiographs never leave hospital grounds, federated learning satisfies statutory "processing locality" and purpose limitation rules.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-slate-200">ABDM Integration:</strong> Aligns with the Ayushman Bharat Digital Mission (ABDM) electronic health records standards and ISO/IEC 27559 privacy requirements.
            </li>
          </ul>
        </div>
      </div>

      {/* Benchmark Datasets Ground Truth Disclosure */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Benchmark Dataset Ground Truth Disclosure</span>
          <TooltipHelper termKey="shenzhen_montgomery" />
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The simulated convergence curves and radiological vision demo in FedTB-India are grounded in validated clinical benchmarks from the <strong>Shenzhen Chest X-ray Dataset</strong> (662 frontal radiographs, Shenzhen No. 3 People’s Hospital, China) and the <strong>Montgomery County Tuberculosis Set</strong> (138 radiographs, Dept of Health & Human Services, Maryland, USA), alongside simulated multi-site distribution profiles calibrated against epidemiological data from India’s Central TB Division (CTD).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-slate-400">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="text-white">Shenzhen Set:</strong> 336 TB Cases · 326 Normal Controls · Confirmed by Sputum Acid-Fast Bacilli Smear.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="text-white">Montgomery County Set:</strong> 58 TB Cases · 80 Normal Controls · Verified Clinical Follow-up & Treatment.
          </div>
        </div>
      </div>
    </div>
  );
};
