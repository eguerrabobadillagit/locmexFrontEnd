export interface WizardStep {
  id: string;
  label: string;
  icon: string;
  completed?: boolean;
  disabled?: boolean;
}

export interface WizardConfig {
  title: string;
  icon: string;
  totalSteps: number;
  closable?: boolean;
}
