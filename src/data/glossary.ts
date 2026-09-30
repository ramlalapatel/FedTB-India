import { GlossaryItem } from '../types/federated';

export const GLOSSARY_TERMS: Record<string, GlossaryItem> = {
  fedavg: {
    term: 'FedAvg (Federated Averaging)',
    shortDesc: 'The canonical federated optimization algorithm proposed by McMahan et al. (2017).',
    detailedExplanation:
      'In each communication round, the central server selects a fraction of hospital clients, transmits current model weights, and each hospital trains locally on its private chest radiographs using SGD. The central server computes a weighted average of the returned local model updates proportional to each hospital’s dataset size: w_{t+1} = sum (n_k / n) * w_k.',
    clinicalImpact:
      'Hospitals keep all patient DICOM X-rays behind institutional firewalls while collaborating to produce a high-accuracy diagnostic model.',
  },
  fedprox: {
    term: 'FedProx (Proximal Federated Optimization)',
    shortDesc: 'Generalization of FedAvg designed by Li et al. (2020) to handle statistical and system heterogeneity.',
    detailedExplanation:
      'Adds a proximal regularization term (mu / 2) * ||w - w_t||^2 directly into each hospital’s local objective function. This bounds the deviation of local updates from the global model, preventing local models from drifting excessively when client datasets have severe class or demographic imbalance.',
    clinicalImpact:
      'Crucial in India where a rural PHC has very different disease stages, equipment resolutions, and TB prevalence compared to a central apex hospital like AIIMS.',
  },
  non_iid: {
    term: 'Non-IID (Non-Independent & Identically Distributed Data)',
    shortDesc: 'When data distributions differ systematically across participating hospital nodes.',
    detailedExplanation:
      'In traditional ML, samples are assumed to be drawn independently from the same underlying distribution. In medical federated learning, each hospital has different patient demographics (pediatric vs adult), disease severities (early outpatient vs cavitary ICU), scanner hardware, and class ratios (e.g. 24% TB in rural PHCs vs 54% in Kanpur district wards).',
    clinicalImpact:
      'Naïve training leads to client weight drift and catastrophic forgetting. FedProx and momentum aggregation help mitigate non-IID degradation.',
  },
  dp_sgd: {
    term: 'Differential Privacy (DP-SGD)',
    shortDesc: 'Mathematical privacy framework (Abadi et al., 2016) guaranteeing that individual patient records cannot be inferred.',
    detailedExplanation:
      'During local backpropagation, per-sample gradients are clipped to an L2 norm threshold C, bounding any single patient’s influence on the model update. Calibrated Gaussian noise proportional to sigma * C is then injected before weights leave the hospital enclave.',
    clinicalImpact:
      'Provides provable privacy bounds (epsilon, delta) protecting against membership inference attacks and gradient reconstruction attacks.',
  },
  epsilon: {
    term: 'Privacy Budget (Epsilon, ε)',
    shortDesc: 'Formal measure of worst-case privacy leakage in Differential Privacy.',
    detailedExplanation:
      'A smaller epsilon (e.g. ε < 2.0) represents an extremely strong privacy guarantee with tight bounds, but adds more noise which slightly degrades model accuracy. A higher epsilon (ε > 8.0) yields near-zero accuracy penalty but weaker mathematical privacy bounds. FedTB-India achieves a balanced clinical sweet-spot around ε = 2.8 - 3.4.',
    clinicalImpact:
      'Allows institutional review boards (IRBs) and hospital data protection officers to audit privacy mathematically rather than relying on legal assurances.',
  },
  clipping_norm: {
    term: 'L2 Gradient Clipping Norm (C)',
    shortDesc: 'Maximum Euclidean length permitted for any single patient’s gradient update.',
    detailedExplanation:
      'For each sample i, if ||g_i||_2 > C, the gradient is scaled down: g_i <- g_i * (C / ||g_i||_2). This prevents rare or outlier X-ray cases (e.g., extreme cavitary necrosis) from dominating the model update and leaking identifiable features.',
    clinicalImpact:
      'Ensures no single patient radiograph has disproportionate influence on the resulting shared model parameters.',
  },
  secagg: {
    term: 'Secure Aggregation (SecAgg)',
    shortDesc: 'Cryptographic protocol allowing the server to compute the sum of weights without inspecting individual hospital updates.',
    detailedExplanation:
      'Participating hospitals agree on pairwise random masks using Diffie-Hellman key exchange. Hospital A adds mask s_AB to its weights, while Hospital B subtracts s_AB. When the central coordinator sums all received vectors, all pairwise masks mathematically cancel out to zero, leaving only the exact sum.',
    clinicalImpact:
      'Even a compromised central server or curious cloud administrator cannot observe individual hospital weight updates or reverse-engineer hospital-specific pathology.',
  },
  grad_cam: {
    term: 'Grad-CAM (Gradient-Weighted Class Activation Mapping)',
    shortDesc: 'Visual explainability method highlighting the anatomical regions that drove the model’s prediction.',
    detailedExplanation:
      'Computes the gradients of the TB classification score with respect to the feature activation maps of the final convolutional layer. A weighted combination and ReLU activation yields a spatial heatmap revealing where the deep CNN "looked" on the chest radiograph.',
    clinicalImpact:
      'Essential for clinical trust. Radiologists can immediately verify whether the AI focused on genuine apical cavitary opacities rather than spurious image artifacts (e.g., hospital labels or pacemakers).',
  },
  auc_roc: {
    term: 'AUC-ROC (Area Under the Receiver Operating Characteristic)',
    shortDesc: 'Aggregate metric measuring classification performance across all possible diagnostic thresholds.',
    detailedExplanation:
      'Plots True Positive Rate (Sensitivity) versus False Positive Rate (1 - Specificity) across operating points from 0.0 to 1.0. An AUC of 1.0 indicates perfect discrimination, while 0.5 denotes random chance. Clinical screening tools generally require AUC > 0.92.',
    clinicalImpact:
      'Enables clinicians to calibrate the decision threshold depending on whether the primary goal is high-sensitivity mass screening (avoiding missed TB cases) or high-specificity confirmatory diagnosis.',
  },
  dpdp_act: {
    term: 'DPDP Act 2023 (Digital Personal Data Protection Act)',
    shortDesc: 'India’s landmark comprehensive privacy legislation enacted by Parliament in August 2023.',
    detailedExplanation:
      'Classifies health and medical diagnostic records as sensitive personal data. Imposes strict fiduciary duties on healthcare institutions (Data Fiduciaries), requires explicit consent, and penalizes cross-border or unauthorized data transfers with penalties up to ₹250 crore ($30M USD).',
    clinicalImpact:
      'Makes legacy centralized medical AI training legally hazardous. Federated learning is the primary compliant pathway for multi-state AI health initiatives in India.',
  },
  chexnet: {
    term: 'DenseNet-121 (CheXNet Architecture)',
    shortDesc: 'Gold-standard deep neural network backbone for frontal chest radiograph interpretation.',
    detailedExplanation:
      'Connects every layer to every subsequent layer in a feed-forward fashion, ensuring maximum feature reuse, mitigating vanishing gradients, and maintaining high parameter efficiency (only 7M parameters compared to 60M in older architectures).',
    clinicalImpact:
      'High diagnostic accuracy for pulmonary consolidation, pleural effusion, and cavitary tuberculosis with compact weight tensors ideal for bandwidth-constrained federated transmission.',
  },
  model_poisoning: {
    term: 'Model Poisoning & Byzantine Faults',
    shortDesc: 'Adversarial attack where malicious or faulty clients attempt to corrupt the shared global model.',
    detailedExplanation:
      'A compromised client could send deliberately corrupted or inverted gradients to degrade accuracy or insert backdoor triggers. Federated defenses include Byzantine-robust aggregation algorithms like Krum, Coordinate-wise Median, and Trimmed Mean.',
    clinicalImpact:
      'Guarantees system resilience even if a remote clinic workstation is infected with malware or experiences severe calibration hardware failures.',
  },
  shenzhen_montgomery: {
    term: 'Shenzhen & Montgomery TB Datasets',
    shortDesc: 'The two foundational open-access clinical benchmark datasets for chest radiograph tuberculosis research.',
    detailedExplanation:
      'The Shenzhen dataset (Shenzhen No. 3 People’s Hospital, China) contains 662 frontal chest radiographs (336 TB, 326 normal). The Montgomery County dataset (Dept of Health and Human Services, Maryland, USA) contains 138 radiographs with verified clinical and microbiological follow-up.',
    clinicalImpact:
      'Serves as the global clinical ground-truth benchmark for evaluating transfer learning, baseline sensitivities, and federated convergence.',
  },
};
