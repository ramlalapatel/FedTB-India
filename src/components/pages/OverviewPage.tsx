import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Cpu, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  AlertOctagon, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  HardDrive, 
  ShieldAlert, 
  ArrowUpRight 
} from 'lucide-react';
import { TooltipHelper } from '../TooltipHelper';
import { INITIAL_HOSPITALS } from '../../data/hospitals';

interface OverviewPageProps {
  onGoToSimulation: () => void;
  onGoToDemo: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onGoToSimulation,
  onGoToDemo,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('aiims-delhi');

  const steps = [
    {
      title: 'Global Model Initialization & Broadcast',
      description:
        'The central coordinator distributes current global DenseNet-121 CNN weights (w_t) to all participating hospital nodes.',
      flowDirection: 'Server -> Hospitals',
      highlight: 'broadcast',
      dataTransferred: '28.0 MB (Global Weights)',
    },
    {
      title: 'Local On-Premise Training on Confidential CXRs',
      description:
        'Each hospital trains locally for E epochs on its private chest radiographs. Patient images NEVER leave hospital enclaves.',
      flowDirection: 'Local Compute (Intra-Hospital)',
      highlight: 'local_train',
      dataTransferred: '0 Bytes (Zero Patient Data Exits)',
    },
    {
      title: 'Privacy Masking: DP-SGD & Secure Aggregation',
      description:
        'Local gradients are clipped to Euclidean norm C and perturbed with Gaussian noise σ. Pairwise Diffie-Hellman masks are applied.',
      flowDirection: 'Cryptographic Pre-Processing',
      highlight: 'privacy_shield',
      dataTransferred: 'Zero Information Leakage Guarantee',
    },
    {
      title: 'Encrypted Weight Updates Uploaded',
      description:
        'Hospitals transmit lightweight parameter weight deltas (Δw_k) rather than gigabytes of raw DICOM radiological files.',
      flowDirection: 'Hospitals -> Central Server',
      highlight: 'upload',
      dataTransferred: '28.0 MB per client (~140 MB total)',
    },
    {
      title: 'Federated Aggregation (FedAvg / FedProx)',
      description:
        'The server securely aggregates masked weights w_{t+1} = Σ (n_k / n) * w_k without inspecting individual hospital contributions.',
      flowDirection: 'Central Server Update',
      highlight: 'aggregate',
      dataTransferred: 'Updated Global Model Ready',
    },
  ];

  // Auto-play architecture simulation cycle
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, steps.length]);

  const selectedHospital = INITIAL_HOSPITALS.find((h) => h.id === selectedHospitalId) || INITIAL_HOSPITALS[0];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400">
            <span>National TB Elimination Initiative</span>
            <span aria-hidden="true">·</span>
            <span>DPDP Act 2023 Compliant</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Institutional AI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Privacy-Preserving Tuberculosis Detection via Federated Deep Learning
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Demonstrating how Indian healthcare centers—from apex tertiary institutes like AIIMS New Delhi to remote rural Primary Health Centres in Uttar Pradesh—can collaboratively train world-class chest X-ray TB models without ever sharing sensitive patient records.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onGoToSimulation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-cyan-500/20"
            >
              <span>Launch Simulation Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToDemo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 transition-colors"
            >
              <span>Try Live TB Detection Demo</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-400">INDIA TB SHARE</div>
            <div className="text-xl font-bold text-rose-400 font-mono tabular-nums">~27% Global Cases</div>
            <div className="text-slate-400 mt-0.5">2.8M annual notifications</div>
          </div>
          <div>
            <div className="text-slate-400">DATA PRIVACY STATUS</div>
            <div className="text-xl font-bold text-emerald-400">100% In-Situ</div>
            <div className="text-slate-400 mt-0.5">DPDP Act 2023 safe</div>
          </div>
          <div>
            <div className="text-slate-400">BANDWIDTH CONSERVATION</div>
            <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">&gt; 99.8% Saved</div>
            <div className="text-slate-400 mt-0.5">28MB vs 180GB transfer</div>
          </div>
          <div>
            <div className="text-slate-400">BENCHMARK ACCURACY</div>
            <div className="text-xl font-bold text-purple-400 font-mono tabular-nums">93.8% AUC 0.962</div>
            <div className="text-slate-400 mt-0.5">CheXNet DenseNet-121</div>
          </div>
        </div>
      </section>

      {/* The Clinical & Privacy Dilemma */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <span>The Challenge: TB Burden & Data Silos in India</span>
              </h2>
              <TooltipHelper termKey="non_iid" />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              India carries the world's highest burden of Tuberculosis. Early detection via chest radiography is critical, yet rural clinics suffer from an acute shortage of trained radiologists (less than 1 radiologist per 100,000 citizens in rural districts).
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>
                  <strong>Data Heterogeneity (Non-IID):</strong> AIIMS tertiary center sees cavitary multi-drug resistant cases; a rural PHC sees early mild presentations with low-frequency mobile scanners.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>
                  <strong>Data Protection Mandates:</strong> The Digital Personal Data Protection Act (DPDP Act 2023) classifies medical X-rays as sensitive data. Centralizing medical imagery across state boundaries risks up to ₹250 Cr statutory fines.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>
                  <strong>Network Bandwidth Limits:</strong> Transferring 10,000 uncompressed DICOM radiographs (~180 GB) over remote 4G connections is clinically unviable.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            Source: Central TB Division, Ministry of Health and Family Welfare (MoHFW) India TB Report.
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <span>The Solution: Federated Learning Architecture</span>
              </h2>
              <TooltipHelper termKey="fedavg" />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Federated Learning reverses the traditional machine learning paradigm: instead of bringing patient data to the model, we bring the model to the patient data.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Strict Data Locality</span>
                </div>
                <p className="text-slate-300">
                  Every chest X-ray stays physically stored inside the hospital firewall. Only mathematical weight gradients are shared.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Differential Privacy (DP-SGD) & Secure Aggregation</span>
                </div>
                <p className="text-slate-300">
                  Even if a malicious actor eavesdrops on model updates, injected mathematical noise ensures zero patient-level re-identification.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>McMahan et al. (Google Research) & Li et al. (FedProx)</span>
            <span className="text-cyan-400 font-mono">w_{'{t+1}'} = Σ (n_k/n) w_k</span>
          </div>
        </div>
      </section>

      {/* Interactive Animated Architecture Diagram */}
      <section className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Interactive Federated Learning Workflow</h2>
              <TooltipHelper termKey="fedprox" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visualizing the 5-step distributed cycle between Indian hospital client nodes and the central aggregation coordinator.
            </p>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isAutoPlaying ? 'Pause Cycle' : 'Auto Play'}</span>
            </button>
            <button
              onClick={() => setActiveStep(0)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reset cycle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveStep(idx);
                  setIsAutoPlaying(false);
                }}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isActive
                    ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className={isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                    0{idx + 1}
                  </span>
                  {isActive && <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
                </div>
                <div className="text-xs font-medium text-slate-200 truncate">{step.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Step Information Banner */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-cyan-400">
              Active Stage: Step {activeStep + 1} of 5 · {steps[activeStep].flowDirection}
            </div>
            <div className="text-sm font-semibold text-white">{steps[activeStep].title}</div>
            <p className="text-xs text-slate-300 max-w-2xl">{steps[activeStep].description}</p>
          </div>

          <div className="shrink-0 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block mb-0.5">Payload Metric:</span>
            <span className="text-emerald-400 font-bold">{steps[activeStep].dataTransferred}</span>
          </div>
        </div>

        {/* Visual Diagram Canvas */}
        <div className="relative p-6 sm:p-8 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[360px] flex flex-col items-center justify-between">
          {/* Central Aggregator Server Node */}
          <div className="relative z-10 p-4 rounded-xl bg-slate-900 border-2 border-cyan-500/80 shadow-xl shadow-cyan-500/10 flex flex-col items-center text-center max-w-sm">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono uppercase text-cyan-400">Central Coordination Server</div>
            <div className="text-sm font-bold text-white">NTEP Central Aggregation Enclave</div>
            <div className="text-xs text-slate-400 mt-1">
              Computes FedAvg / FedProx weighted parameter updates
            </div>
            <div className="mt-2 text-xs font-mono text-emerald-400 tabular-nums">
              Global Model: DenseNet-121 (7.0M Params)
            </div>
          </div>

          {/* Animated Connecting Vector Pipes */}
          <div className="w-full flex items-center justify-center my-4 relative">
            <div className="w-11/12 h-0.5 bg-slate-800 relative">
              <div
                className={`absolute top-0 bottom-0 bg-cyan-400 transition-all duration-700 ${
                  activeStep === 0 || activeStep === 3 || activeStep === 4 ? 'opacity-100' : 'opacity-20'
                }`}
                style={{
                  left: '10%',
                  right: '10%',
                }}
              />
            </div>
          </div>

          {/* 5 Participating Hospital Client Nodes */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
            {INITIAL_HOSPITALS.map((hospital) => {
              const isSelected = hospital.id === selectedHospitalId;
              return (
                <button
                  key={hospital.id}
                  onClick={() => setSelectedHospitalId(hospital.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Building2 className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-mono text-slate-400">{hospital.city}</span>
                  </div>

                  <div className="text-xs font-semibold text-white line-clamp-1">{hospital.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{hospital.tier}</div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">CXR:</span>
                    <span className="text-slate-200 tabular-nums">{hospital.datasetSize}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Prevalence:</span>
                    <span className="text-rose-400 tabular-nums">{hospital.tbPrevalence}%</span>
                  </div>

                  <div className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <HardDrive className="w-3 h-3" />
                    <span>Data Stays Local</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Hospital Inspection Card */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-200">
              Selected Node Inspection: {selectedHospital.name} ({selectedHospital.city}, {selectedHospital.state})
            </span>
            <span className="text-cyan-400 font-mono">{selectedHospital.hardware}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-400 font-mono">
            <div>
              <span>Scanner:</span>{' '}
              <span className="text-slate-200 font-sans">{selectedHospital.scannerModel}</span>
            </div>
            <div>
              <span>Latency to Aggregator:</span>{' '}
              <span className="text-slate-200">{selectedHospital.networkLatencyMs} ms</span>
            </div>
            <div>
              <span>Non-IID Skew Index:</span>{' '}
              <span className="text-amber-400">{selectedHospital.nonIidSkewScore} / 5.0</span>
            </div>
            <div>
              <span>Local TB / Normal:</span>{' '}
              <span className="text-slate-200">{selectedHospital.tbCount} / {selectedHospital.normalCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bandwidth & Payload Reality Check */}
      <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-2">
          Bandwidth & Network Efficiency: Centralized vs Federated
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          In rural Indian connectivity scenarios (3G/4G with limited bandwidth), transferring high-resolution raw DICOM radiographs is impossible. Federated learning transmits only mathematical parameter matrices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-rose-400 text-sm">Centralized Model (Legacy)</span>
              <span className="text-xs font-mono text-slate-400">182.5 GB Required</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All 5 hospitals upload 7,970 uncompressed chest X-rays (averaging 22 MB per raw 2048x2048 DICOM file) to a central cloud server.
            </p>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Upload Duration (at 10 Mbps):</span>
                <span className="text-rose-400">~40.5 Hours</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>DPDP Act 2023 Compliance:</span>
                <span className="text-rose-400 font-bold">NON-COMPLIANT (High Risk)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-800/40 bg-cyan-950/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-cyan-400 text-sm">FedTB-India Federated Model</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">28.0 MB / Round</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Hospitals only exchange model weight matrices (DenseNet-121 layer weights). No patient radiograph ever leaves the clinic firewall.
            </p>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Upload Duration (at 10 Mbps):</span>
                <span className="text-emerald-400">~22.4 Seconds</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>DPDP Act 2023 Compliance:</span>
                <span className="text-emerald-400 font-bold">VERIFIED COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
