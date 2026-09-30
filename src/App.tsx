import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { ReportModal } from './components/ReportModal';
import { OverviewPage } from './components/pages/OverviewPage';
import { SimulationPage } from './components/pages/SimulationPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { DetectionDemoPage } from './components/pages/DetectionDemoPage';
import { ModelComparisonPage } from './components/pages/ModelComparisonPage';
import { EthicsLimitationsPage } from './components/pages/EthicsLimitationsPage';
import { INITIAL_HOSPITALS } from './data/hospitals';
import { generateFullSimulation } from './utils/federatedEngine';
import { SimulationConfig } from './types/federated';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Shared simulation config & metrics
  const [sharedConfig] = useState<SimulationConfig>({
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
    networkSimulationSpeedMs: 600,
  });

  const [metrics] = useState(() =>
    generateFullSimulation(sharedConfig, INITIAL_HOSPITALS)
  );

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <OverviewPage
            onGoToSimulation={() => setActiveTab('simulation')}
            onGoToDemo={() => setActiveTab('demo')}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationPage onOpenReport={() => setIsReportModalOpen(true)} />
        )}

        {activeTab === 'privacy' && <PrivacyPage />}

        {activeTab === 'demo' && <DetectionDemoPage />}

        {activeTab === 'comparison' && <ModelComparisonPage />}

        {activeTab === 'ethics' && <EthicsLimitationsPage />}
      </main>

      {/* Global Medical Disclaimer Footer */}
      <Footer />

      {/* Full Audit Report & Export Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        metrics={metrics}
        config={sharedConfig}
        hospitals={INITIAL_HOSPITALS}
      />
    </div>
  );
}
