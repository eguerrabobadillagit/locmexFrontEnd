import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WizardStep, WizardConfig } from '../../interfaces/wizard.interface';

@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './wizard-stepper.component.html',
  styleUrls: ['./wizard-stepper.component.scss']
})
export class WizardStepperComponent {
  config = input.required<WizardConfig>();
  steps = input.required<WizardStep[]>();
  currentStep = input.required<number>();
  
  close = output<void>();
  next = output<void>();
  previous = output<void>();
  stepChange = output<number>();

  onStepClick(index: number): void {
    const step = this.steps()[index];
    if (!step.disabled) {
      this.stepChange.emit(index);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onPrevious(): void {
    this.previous.emit();
  }

  onNext(): void {
    this.next.emit();
  }

  isFirstStep(): boolean {
    return this.currentStep() === 0;
  }

  isLastStep(): boolean {
    return this.currentStep() === this.steps().length - 1;
  }
}
