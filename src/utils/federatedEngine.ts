import { HospitalClient, SimulationConfig, RoundMetric, HospitalId } from '../types/federated';

/**
 * Computes simulated realistic round metrics for FedTB-India.
 * Incorporates non-IID client skew, FedAvg vs FedProx regularization,
 * and DP-SGD noise-utility degradation.
 */
export function computeRoundMetrics(
  round: number,
  config: SimulationConfig,
  hospitals: HospitalClient[]
): RoundMetric {
  const t = round;
  const maxR = config.totalRounds;
  const progressRatio = Math.min(1.0, t / maxR);

  // Saturation curve: 1 - exp(-k * t)
  const baseCurve = 1 - Math.exp(-0.28 * t);

  // Centralized performance (ideal upper bound)
  const centralizedAcc = +(68.0 + 26.8 * (1 - Math.exp(-0.35 * t)) + (Math.sin(t * 0.4) * 0.2)).toFixed(2);

  // Federated base curve
  let fedAccBase = 62.5 + 30.2 * baseCurve;

  // Algorithm adjustment: FedProx handles non-IID drift better than FedAvg
  if (config.algorithm === 'FedProx') {
    const muEffect = Math.min(1.2, config.fedProxMu * 20);
    fedAccBase += 0.85 + muEffect * 0.4;
  } else {
    // FedAvg suffers slight client drift jitter
    fedAccBase -= 0.6 + Math.sin(t * 0.7) * 0.4;
  }

  // Differential privacy penalty: higher noise sigma reduces accuracy slightly
  let dpAccuracyPenalty = 0;
  let dpEpsilonSpent = 0;
  if (config.differentialPrivacy) {
    // Abadi et al. Moments Accountant approximation: epsilon grows as sqrt(rounds) * q / sigma
    const samplingRatio = config.clientParticipationFraction;
    dpEpsilonSpent = +(
      (samplingRatio * Math.sqrt(t * config.localEpochs) * 1.8) /
      Math.max(0.1, config.dpNoiseMultiplier)
    ).toFixed(2);

    dpAccuracyPenalty = +(config.dpNoiseMultiplier * 1.35 * (config.dpClippingNorm / 2.5)).toFixed(2);
  }

  const globalAccuracy = +(
    Math.min(94.2, Math.max(55.0, fedAccBase - dpAccuracyPenalty))
  ).toFixed(2);

  // Global cross-entropy loss decreases over rounds
  const globalLoss = +(
    0.85 * Math.exp(-0.22 * t) +
    0.14 +
    (config.differentialPrivacy ? config.dpNoiseMultiplier * 0.04 : 0) +
    Math.random() * 0.015
  ).toFixed(3);

  // Clinical diagnostic metrics
  const recall = +(Math.min(96.5, globalAccuracy + 1.2 - Math.random() * 0.6)).toFixed(2);
  const precision = +(Math.min(95.8, globalAccuracy - 0.8 + Math.random() * 0.5)).toFixed(2);
  const f1Score = +( (2 * precision * recall) / (precision + recall) ).toFixed(2);
  const aucRoc = +(0.72 + (globalAccuracy / 100) * 0.25).toFixed(3);

  // Per-client local accuracies (reflecting individual hospital dataset sizes and class skews)
  const clientAccuracies: Record<HospitalId, number> = {} as any;
  const clientLosses: Record<HospitalId, number> = {} as any;
  let localOnlySum = 0;

  hospitals.forEach((h) => {
    // Non-IID skew impact on client
    const skewFactor = (h.nonIidSkewScore - 2.5) * 0.8;
    const sizeBonus = Math.log10(h.datasetSize / 300) * 1.8;

    // In federated learning, each client benefits from global model aggregation
    const clientFedAcc = +(
      globalAccuracy +
      sizeBonus -
      skewFactor -
      (config.algorithm === 'FedAvg' ? h.nonIidSkewScore * 0.4 : 0.1)
    ).toFixed(2);

    // In local-only training (without federation), small hospitals plateau severely!
    const clientLocalOnlyAcc = +(
      52.0 +
      Math.min(32.0, (h.datasetSize / 2800) * 26 + (1 - Math.exp(-0.15 * t)) * 8)
    ).toFixed(2);

    clientAccuracies[h.id] = Math.min(96.0, Math.max(50.0, clientFedAcc));
    clientLosses[h.id] = +(0.95 * Math.exp(-0.2 * t) + (5 - h.datasetSize / 800) * 0.05).toFixed(3);
    localOnlySum += clientLocalOnlyAcc;
  });

  const localOnlyMeanAccuracy = +(localOnlySum / hospitals.length).toFixed(2);

  // Bandwidth & payload metrics
  // DenseNet-121 weight delta tensor = ~28 MB per client round
  const activeClientCount = Math.max(
    2,
    Math.round(hospitals.length * config.clientParticipationFraction)
  );
  const roundTransmissionMb = +(activeClientCount * 28.0).toFixed(1);
  const cumulativeTransmissionMb = +(roundTransmissionMb * t).toFixed(1);

  // Total patient radiographs if sent centrally = ~182.5 GB
  const centralizedDataTransferGb = 182.5;
  const bandwidthSavedPercent = +(
    (1 - (cumulativeTransmissionMb / 1024) / centralizedDataTransferGb) * 100
  ).toFixed(2);

  // Gradient drift norm
  const gradientDriftNorm = +(
    0.45 * Math.exp(-0.18 * t) +
    (config.algorithm === 'FedProx' ? 0.04 : 0.12)
  ).toFixed(3);

  return {
    round: t,
    globalAccuracy,
    globalLoss,
    precision,
    recall,
    f1Score,
    aucRoc,
    centralizedAccuracy: Math.min(95.6, centralizedAcc),
    localOnlyMeanAccuracy,
    clientAccuracies,
    clientLosses,
    activeClientCount,
    roundTransmissionMb,
    cumulativeTransmissionMb,
    centralizedDataTransferGb,
    bandwidthSavedPercent,
    dpEpsilonSpent,
    gradientDriftNorm,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Pre-computes full history for a given configuration
 */
export function generateFullSimulation(
  config: SimulationConfig,
  hospitals: HospitalClient[]
): RoundMetric[] {
  const metrics: RoundMetric[] = [];
  for (let r = 1; r <= config.totalRounds; r++) {
    metrics.push(computeRoundMetrics(r, config, hospitals));
  }
  return metrics;
}

/**
 * Privacy-utility trade-off curve calculation (Epsilon vs Accuracy)
 */
export function generatePrivacyUtilityPoints(): Array<{
  epsilon: number;
  label: string;
  accuracy: number;
  auc: number;
  privacyGuarantee: string;
  recommended: boolean;
}> {
  const epsilons = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10.0, 15.0];
  return epsilons.map((eps) => {
    // Logistic decay of noise degradation
    const acc = +(94.0 - 18.0 * Math.exp(-0.65 * eps)).toFixed(1);
    const auc = +(0.965 - 0.14 * Math.exp(-0.7 * eps)).toFixed(3);
    const isRecommended = eps >= 2.5 && eps <= 4.0;

    let guarantee = 'High Privacy / Moderate Utility';
    if (eps < 1.5) guarantee = 'Ultra-High Privacy (Cryptographic)';
    else if (eps >= 5.0) guarantee = 'Relaxed Privacy / Peak Utility';

    return {
      epsilon: eps,
      label: `ε = ${eps}`,
      accuracy: acc,
      auc,
      privacyGuarantee: guarantee,
      recommended: isRecommended,
    };
  });
}
