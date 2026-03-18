import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface ConfirmationField {
  label: string;
  value: string;
  icon?: string;
}

export interface ConfirmationSection {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
  fields: ConfirmationField[];
}

@Component({
  selector: 'app-wizard-confirmation-summary',
  templateUrl: './wizard-confirmation-summary.component.html',
  styleUrls: ['./wizard-confirmation-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class WizardConfirmationSummaryComponent {
  sections = input.required<ConfirmationSection[]>();
  successMessage = input<string>('¡Todo listo!');
  successDescription = input<string>('Revisa cuidadosamente la información antes de confirmar.');
}
