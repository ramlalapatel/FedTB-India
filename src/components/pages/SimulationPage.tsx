import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Sliders, 
  Download, 
  TrendingUp, 
  Database, 
  Building2, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { 
  HospitalClient, 
  SimulationConfig, 
  RoundMetric, 
  HospitalId 
} from '../../types/federated';
import { INITIAL_HOSPITALS } from '../../data/hospitals';
import { computeRoundMetrics, generateFullSimulation } from '../../utils/federatedEngine';
import { exportMetricsToCsv } from '../../utils/exportReport';
import { TooltipHelper } from '../TooltipHelper';

interface SimulationPageProps {
  onOpenReport: () => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({ onOpenReport }) => {
  // Configuration state
  const [config, setConfig] = useState<SimulationConfig>({
    numClients: 5,
    activeClientIds: ['aiims-delhi', 'kem-mumbai', 'gsvm-kanpur', 'phc-barabanki', 'rggh-chennai'],
    totalRounds: 15,
    localEpochs: 3,
    learningRate: 0.01,
    algorithm: 'FedProx',
    fedProxMu: 0.01,
    clientParticipationFraction: 0.8,
    differentialPrivacy: true,
    dpNoiseMultiplier: 0.8,
    dpClippingNorm: 1.5,
    secureAggregation: true,
    networkSimulationSpeedMs: 600, // delay between live rounds
  });

  const [hospitals, setHospitals] = useState<HospitalClient[]>(INITIAL_HOSPITALS);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [metricsHistory, setMetricsHistory] = useState<RoundMetric[]>([]);
  const [selectedChartTab, setSelectedChartTab] = useState<'accuracy' | 'loss' | 'perClient' | 'threeParadigms'>('accuracy');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize simulation with full or partial metrics
  useEffect(() => {
    // Generate initial history if empty
    if (metricsHistory.length === 0) {
      const full = generateFullSimulation(config, hospitals);
      setMetricsHistory(full);
      setCurrentRound(full.length);
    }
  }, []);

  // Live round execution timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentRound((prev) => {
          if (prev >= config.totalRounds) {
            setIsPlaying(false);
            return prev;
          }
          const nextRound = prev + 1;
          const newMetric = computeRoundMetrics(nextRound, config, hospitals);
          setMetricsHistory((history) => {
            const updated = [...history.filter((m) => m.round < nextRound), newMetric];
            return updated;
          });
          return nextRound;
        });
      }, config.networkSimulationSpeedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, config, hospitals]);

  const handleStart = () => {
    if (currentRound >= config.totalRounds) {
      // Restart from round 1
      setCurrentRound(1);
      const firstMetric = computeRoundMetrics(1, config, hospitals);
      setMetricsHistory([firstMetric]);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStep = () => {
    setIsPlaying(false);
    if (currentRound < config.totalRounds) {
      const nextRound = currentRound + 1;
      const newMetric = computeRoundMetrics(nextRound, config, hospitals);
      setMetricsHistory((history) => [
        ...history.filter((m) => m.round < nextRound),
        newMetric,
      ]);
      setCurrentRound(nextRound);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentRound(0);
    setMetricsHistory([]);
  };

  const handleRunFullInstantly = () => {
    setIsPlaying(false);
    const full = generateFullSimulation(config, hospitals);
    setMetricsHistory(full);
    setCurrentRound(config.totalRounds);
  };

  const latestMetric = metricsHistory.find((m) => m.round === currentRound) || metricsHistory[metricsHistory.length - 1];

  return (
    <div className="space-y-8 py-4">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Federated Simulation Dashboard</h1>
            <TooltipHelper termKey="fedavg" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulating multi-site collaborative training on non-IID Indian hospital chest radiographs.
          </p>
        </div>

        {/* Playback Control Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{currentRound === 0 ? 'Start Training' : 'Resume'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleStep}
            disabled={currentRound >= config.totalRounds || isPlaying}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs border border-slate-700 transition-colors"
            title="Step 1 round forward"
          >
            <SkipForward className="w-4 h-4" />
            <span>Step Round</span>
          </button>

          <button
            onClick={handleRunFullInstantly}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            title="Compute full rounds instantly"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Run All</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Reset training"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => exportMetricsToCsv(metricsHistory, config)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            title="Download CSV metrics"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>ROUND</span>
            <Activity className={`w-3.5 h-3.5 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {currentRound} / {config.totalRounds}
          </div>
          <div className="text-xs text-cyan-400 mt-0.5">
            {currentRound === 0 ? 'Initialized' : isPlaying ? 'Active Training' : 'Completed'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>ACCURACY</span>
            <TooltipHelper termKey="fedavg" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {latestMetric ? `${latestMetric.globalAccuracy}%` : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            vs {latestMetric ? `${latestMetric.centralizedAccuracy}%` : '--'} Central
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>LOSS</span>
            <span className="text-slate-500">Cross-Ent</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {latestMetric ? latestMetric.globalLoss : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Categorical Loss</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>AUC-ROC</span>
            <TooltipHelper termKey="auc_roc" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1 tabular-nums">
            {latestMetric ? latestMetric.aucRoc : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            F1: {latestMetric ? `${latestMetric.f1Score}%` : '--'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>PRIVACY (ε)</span>
            <TooltipHelper termKey="epsilon" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {config.differentialPrivacy ? `ε=${latestMetric?.dpEpsilonSpent || '2.8'}` : 'Plain'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {config.secureAggregation ? 'SecAgg Verified' : 'Standard'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>DATA SAVED</span>
            <span className="text-emerald-400">&gt; 99%</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {latestMetric ? `${latestMetric.bandwidthSavedPercent}%` : '99.8%'}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {latestMetric ? `${latestMetric.cumulativeTransmissionMb} MB` : '0 MB'} transferred
          </div>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Charts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Simulation Hyperparameters
                </h2>
              </div>
              <TooltipHelper termKey="fedprox" />
            </div>

            {/* Aggregation Algorithm selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Aggregation Algorithm</span>
                <span className="text-cyan-400 font-mono font-semibold">{config.algorithm}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, algorithm: 'FedAvg' })}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    config.algorithm === 'FedAvg'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FedAvg
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, algorithm: 'FedProx' })}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    config.algorithm === 'FedProx'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FedProx (Non-IID)
                </button>
              </div>
            </div>

            {/* FedProx Mu Proximal Parameter */}
            {config.algorithm === 'FedProx' && (
              <div className="space-y-1 p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Proximal Term (μ)</span>
                  <span className="font-mono text-cyan-400 tabular-nums">{config.fedProxMu}</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.05"
                  step="0.005"
                  value={config.fedProxMu}
                  onChange={(e) => setConfig({ ...config, fedProxMu: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <span className="text-xs text-slate-400 block">
                  Mitigates client weight drift across non-IID clinics
                </span>
              </div>
            )}

            {/* Communication Rounds Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Communication Rounds</span>
                <span className="font-mono text-white tabular-nums">{config.totalRounds}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={config.totalRounds}
                onChange={(e) => setConfig({ ...config, totalRounds: parseInt(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Local Epochs Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Local Epochs (E)</span>
                <span className="font-mono text-white tabular-nums">{config.localEpochs}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={config.localEpochs}
                onChange={(e) => setConfig({ ...config, localEpochs: parseInt(e.target.value) })}
                className="w-full accent-cyan-400"
              />
              <span className="text-xs text-slate-400">Iterations computed locally before gradient upload</span>
            </div>

            {/* Learning Rate Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Learning Rate (η)</span>
                <span className="font-mono text-white tabular-nums">{config.learningRate}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.05"
                step="0.005"
                value={config.learningRate}
                onChange={(e) => setConfig({ ...config, learningRate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Client Participation Fraction (C) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Client Participation Fraction (C)</span>
                <span className="font-mono text-white tabular-nums">
                  {Math.round(config.clientParticipationFraction * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.2"
                value={config.clientParticipationFraction}
                onChange={(e) =>
                  setConfig({ ...config, clientParticipationFraction: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400"
              />
              <span className="text-xs text-slate-400">Randomly samples hospital clients per round</span>
            </div>

            {/* Privacy Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between cursor-pointer text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Differential Privacy (DP-SGD)</span>
                </span>
                <input
                  type="checkbox"
                  checked={config.differentialPrivacy}
                  onChange={(e) => setConfig({ ...config, differentialPrivacy: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Secure Aggregation (SecAgg)</span>
                </span>
                <input
                  type="checkbox"
                  checked={config.secureAggregation}
                  onChange={(e) => setConfig({ ...config, secureAggregation: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-950 border-slate-700"
                />
              </label>
            </div>
          </div>

          {/* Hospital Enclave Mini Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>Active Hospital Nodes</span>
              <span className="text-cyan-400 font-mono">5 / 5 Participating</span>
            </div>
            <div className="space-y-1.5 text-slate-400 font-mono">
              {hospitals.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-0.5 border-b border-slate-800/60 last:border-none">
                  <span className="truncate max-w-[170px] text-slate-300">{h.city} ({h.tier.slice(0, 10)})</span>
                  <span className="text-cyan-400 tabular-nums">
                    {latestMetric?.clientAccuracies?.[h.id] ? `${latestMetric.clientAccuracies[h.id]}%` : `${h.localAccuracy}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            {/* Chart Mode Tab Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  onClick={() => setSelectedChartTab('accuracy')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedChartTab === 'accuracy'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Global Accuracy
                </button>
                <button
                  onClick={() => setSelectedChartTab('threeParadigms')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedChartTab === 'threeParadigms'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3 Paradigms Comparison
                </button>
                <button
                  onClick={() => setSelectedChartTab('loss')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedChartTab === 'loss'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Loss Decay
                </button>
                <button
                  onClick={() => setSelectedChartTab('perClient')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedChartTab === 'perClient'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Per-Client Acc
                </button>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {metricsHistory.length} rounds plotted
              </div>
            </div>

            {/* Chart Stage */}
            <div className="h-80 w-full">
              {selectedChartTab === 'accuracy' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Communication Round', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="globalAccuracy" name={`Federated (${config.algorithm})`} stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="centralizedAccuracy" name="Centralized Upper Bound" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {selectedChartTab === 'threeParadigms' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Communication Round', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[45, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="centralizedAccuracy" name="1. Centralized (Illegal under DPDP Act)" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="globalAccuracy" name="2. Federated Learning (Privacy Preserved)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="localOnlyMeanAccuracy" name="3. Local-Only Isolated (No Federation)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {selectedChartTab === 'loss' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1.2]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="globalLoss" name="Global Cross-Entropy Loss" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {selectedChartTab === 'perClient' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[45, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="clientAccuracies.aiims-delhi" name="AIIMS Delhi (2.8k CXR)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="clientAccuracies.kem-mumbai" name="KEM Mumbai (1.9k CXR)" stroke="#a855f7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="clientAccuracies.gsvm-kanpur" name="GSVM Kanpur (1.2k CXR)" stroke="#f97316" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="clientAccuracies.phc-barabanki" name="Barabanki PHC (420 CXR)" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="clientAccuracies.rggh-chennai" name="RGGH Chennai (1.6k CXR)" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Key Clinical Insight Note */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Clinical Insight from Federated Trajectory:</span> Notice how Barabanki Rural PHC (only 420 X-rays) would plateau at ~71% accuracy if training in isolation due to severe sample scarcity. Under FedTB-India, its test accuracy jumps to &gt;88%, directly benefiting from apex tertiary knowledge at AIIMS without transferring a single private patient record!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Round Metrics Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Per-Round Communication & Diagnostic Metrics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking convergence parameters, confusion metrics, and transmission costs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportMetricsToCsv(metricsHistory, config)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors"
            >
              <span>Full Audit Report</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Round</th>
                <th className="py-2.5 px-3 text-right">Global Acc</th>
                <th className="py-2.5 px-3 text-right">Loss</th>
                <th className="py-2.5 px-3 text-right">Precision</th>
                <th className="py-2.5 px-3 text-right">Recall</th>
                <th className="py-2.5 px-3 text-right">F1-Score</th>
                <th className="py-2.5 px-3 text-right">AUC-ROC</th>
                <th className="py-2.5 px-3 text-right">Round Payload</th>
                <th className="py-2.5 px-3 text-right">Bandwidth Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
              {metricsHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500">
                    No rounds completed yet. Click "Start Training" to launch simulation.
                  </td>
                </tr>
              ) : (
                [...metricsHistory].reverse().map((m) => (
                  <tr key={m.round} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-semibold text-cyan-400">Round #{m.round}</td>
                    <td className="py-2 px-3 text-right text-white font-semibold">{m.globalAccuracy}%</td>
                    <td className="py-2 px-3 text-right text-amber-400">{m.globalLoss}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{m.precision}%</td>
                    <td className="py-2 px-3 text-right text-slate-300">{m.recall}%</td>
                    <td className="py-2 px-3 text-right text-slate-200">{m.f1Score}%</td>
                    <td className="py-2 px-3 text-right text-purple-400 font-semibold">{m.aucRoc}</td>
                    <td className="py-2 px-3 text-right text-slate-400">{m.roundTransmissionMb} MB</td>
                    <td className="py-2 px-3 text-right text-emerald-400">{m.bandwidthSavedPercent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
