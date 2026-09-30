// Type definitions for FedTB-India Federated Learning Platform

export type HospitalId = 'aiims-delhi' | 'kem-mumbai' | 'gsvm-kanpur' | 'phc-barabanki' | 'rggh-chennai';

export interface HospitalClient {
  id: HospitalId;
  name: string;
  city: string;
  state: string;
  tier: 'Apex Tertiary' | 'Municipal Referral' | 'District Medical College' | 'Rural Primary Health Centre' | 'Zonal Medical College';
  datasetSize: number;
  tbPrevalence: number; // percentage (e.g. 42 = 42%)
  normalCount: number;
  tbCount: number;
  hardware: string;
  scannerModel: string;
  networkLatencyMs: number;
  nonIidSkewScore: number; // 1 to 5 (degree of non-IID class/image drift)
  localAccuracy: number;
  localLoss: number;
  lastRoundContribution: number; // weight in aggregation
  status: 'active' | 'training' | 'uploading' | 'idle';
}

export type AggregationAlgorithm = 'FedAvg' | 'FedProx';

export interface SimulationConfig {
  numClients: number; // 2 to 5
  activeClientIds: HospitalId[];
  totalRounds: number; // 5 to 30
  localEpochs: number; // 1 to 10
  learningRate: number; // 0.001 to 0.05
  algorithm: AggregationAlgorithm;
  fedProxMu: number; // proximal regularizer mu (0.001 to 0.1)
  clientParticipationFraction: number; // 0.4 to 1.0
  differentialPrivacy: boolean;
  dpNoiseMultiplier: number; // sigma (0.1 to 2.5)
  dpClippingNorm: number; // C (0.5 to 5.0)
  secureAggregation: boolean;
  networkSimulationSpeedMs: number; // playback delay per round
}

export interface RoundMetric {
  round: number;
  globalAccuracy: number; // 0 to 100
  globalLoss: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  centralizedAccuracy: number;
  localOnlyMeanAccuracy: number;
  clientAccuracies: Record<HospitalId, number>;
  clientLosses: Record<HospitalId, number>;
  activeClientCount: number;
  roundTransmissionMb: number;
  cumulativeTransmissionMb: number;
  centralizedDataTransferGb: number;
  bandwidthSavedPercent: number;
  dpEpsilonSpent: number;
  gradientDriftNorm: number;
  timestamp: string;
}

export interface ModelArchitectureComparison {
  name: string;
  backbone: string;
  parameterCountM: number;
  roundPayloadMb: number;
  federatedAccuracy: number;
  centralizedAccuracy: number;
  inferenceLatencyMs: number;
  memoryFootprintMb: number;
  recommendedUse: string;
}

export interface XRayAnalysisResult {
  prediction: string;
  tbConfidence: number; // 0 to 100
  primaryFindings: string[];
  affectedZones: string[];
  severity: 'None' | 'Mild / Early' | 'Moderate' | 'Extensive / Cavitary';
  clinicalAction: string;
  gradCamHotspots: Array<{
    x: number; // 0 to 100%
    y: number; // 0 to 100%
    radius: number; // 5 to 35%
    intensity: number; // 0 to 1
  }>;
}

export interface GlossaryItem {
  term: string;
  shortDesc: string;
  detailedExplanation: string;
  clinicalImpact: string;
}
