import { RoundMetric, SimulationConfig, HospitalClient } from '../types/federated';

/**
 * Downloads full simulation per-round metrics as a clean CSV file
 */
export function exportMetricsToCsv(
  metrics: RoundMetric[],
  config: SimulationConfig,
  filename = 'fedtb-india-simulation-metrics.csv'
) {
  if (!metrics || metrics.length === 0) return;

  const headers = [
    'Round',
    'Global_Accuracy_Percent',
    'Global_Loss',
    'Precision_Percent',
    'Recall_Percent',
    'F1_Score',
    'AUC_ROC',
    'Centralized_Accuracy_Percent',
    'Local_Only_Mean_Accuracy_Percent',
    'Active_Clients',
    'Round_Transmission_MB',
    'Cumulative_Transmission_MB',
    'Bandwidth_Saved_Percent',
    'DP_Epsilon_Spent',
    'Gradient_Drift_Norm',
    'Timestamp',
  ];

  const rows = metrics.map((m) => [
    m.round,
    m.globalAccuracy,
    m.globalLoss,
    m.precision,
    m.recall,
    m.f1Score,
    m.aucRoc,
    m.centralizedAccuracy,
    m.localOnlyMeanAccuracy,
    m.activeClientCount,
    m.roundTransmissionMb,
    m.cumulativeTransmissionMb,
    m.bandwidthSavedPercent,
    m.dpEpsilonSpent,
    m.gradientDriftNorm,
    `"${m.timestamp}"`,
  ]);

  const configMeta = [
    `# FedTB-India Simulation Run Export`,
    `# Date: ${new Date().toISOString()}`,
    `# Algorithm: ${config.algorithm}`,
    `# Total Rounds: ${config.totalRounds}`,
    `# Local Epochs: ${config.localEpochs}`,
    `# Learning Rate: ${config.learningRate}`,
    `# Differential Privacy Enabled: ${config.differentialPrivacy}`,
    `# DP Noise Multiplier (sigma): ${config.dpNoiseMultiplier}`,
    `# DP Clipping Norm (C): ${config.dpClippingNorm}`,
    `# Secure Aggregation: ${config.secureAggregation}`,
    ``,
  ].join('\n');

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    encodeURIComponent(
      configMeta +
        headers.join(',') +
        '\n' +
        rows.map((e) => e.join(',')).join('\n')
    );

  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
