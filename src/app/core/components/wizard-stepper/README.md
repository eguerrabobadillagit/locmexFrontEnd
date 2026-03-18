# Wizard Stepper Component

Componente reutilizable para crear wizards/steppers multi-paso con navegación y validación.

## Características

- ✅ Standalone component (Angular moderno)
- ✅ Signals para inputs/outputs
- ✅ Navegación entre pasos
- ✅ Validación de pasos
- ✅ Proyección de contenido con `ng-content`
- ✅ Diseño responsive
- ✅ Totalmente personalizable

## Uso Básico

```typescript
import { Component, signal } from '@angular/core';
import { WizardStepperComponent } from '@core/components/wizard-stepper/wizard-stepper.component';
import { WizardStep, WizardConfig } from '@core/interfaces/wizard.interface';

@Component({
  selector: 'app-my-wizard',
  standalone: true,
  imports: [WizardStepperComponent],
  template: `
    <app-wizard-stepper
      [config]="wizardConfig()"
      [steps]="steps()"
      [currentStep]="currentStep()"
      (close)="onClose()"
      (next)="onNext()"
      (previous)="onPrevious()"
      (stepChange)="onStepChange($event)">
      
      <!-- Tu contenido aquí -->
      <div *ngIf="currentStep() === 0">
        Contenido del paso 1
      </div>
      
      <div *ngIf="currentStep() === 1">
        Contenido del paso 2
      </div>
      
    </app-wizard-stepper>
  `
})
export class MyWizardComponent {
  currentStep = signal(0);

  wizardConfig = signal<WizardConfig>({
    title: 'Mi Wizard',
    icon: 'rocket',
    totalSteps: 3,
    closable: true
  });

  steps = signal<WizardStep[]>([
    { id: 'step1', label: 'Paso 1', icon: 'person', completed: false },
    { id: 'step2', label: 'Paso 2', icon: 'settings', completed: false },
    { id: 'step3', label: 'Paso 3', icon: 'checkmark', completed: false }
  ]);

  onClose(): void {
    // Manejar cierre
  }

  onNext(): void {
    // Validar y avanzar
    if (this.currentStep() < this.steps().length - 1) {
      this.currentStep.update(v => v + 1);
    }
  }

  onPrevious(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(v => v - 1);
    }
  }

  onStepChange(stepIndex: number): void {
    this.currentStep.set(stepIndex);
  }
}
```

## Inputs

| Input | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `config` | `WizardConfig` | ✅ | Configuración del wizard (título, icono, etc.) |
| `steps` | `WizardStep[]` | ✅ | Array de pasos del wizard |
| `currentStep` | `number` | ✅ | Índice del paso actual (0-based) |

## Outputs

| Output | Tipo | Descripción |
|--------|------|-------------|
| `close` | `void` | Se emite cuando se cierra el wizard |
| `next` | `void` | Se emite cuando se presiona "Siguiente" |
| `previous` | `void` | Se emite cuando se presiona "Anterior" |
| `stepChange` | `number` | Se emite cuando se hace clic en un paso del stepper |

## Interfaces

### WizardConfig

```typescript
interface WizardConfig {
  title: string;        // Título del wizard
  icon: string;         // Nombre del icono de Ionic
  totalSteps: number;   // Número total de pasos
  closable?: boolean;   // Mostrar botón de cerrar (default: true)
}
```

### WizardStep

```typescript
interface WizardStep {
  id: string;           // Identificador único del paso
  label: string;        // Etiqueta visible del paso
  icon: string;         // Nombre del icono de Ionic
  completed?: boolean;  // Si el paso está completado
  disabled?: boolean;   // Si el paso está deshabilitado
}
```

## Ejemplo Completo

Ver `@features/vehicles/components/add-vehicle-wizard` para un ejemplo completo de implementación.
