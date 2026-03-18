import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface TelemetryField {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  selected?: boolean;
}

@Component({
  selector: 'app-telemetry-fields-selector',
  templateUrl: './telemetry-fields-selector.component.html',
  styleUrls: ['./telemetry-fields-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TelemetryFieldsSelectorComponent {
  fields = input.required<TelemetryField[]>();
  selectedFields = output<TelemetryField[]>();
  
  viewMode = signal<'grid' | 'list'>('grid');
  internalFields = signal<TelemetryField[]>([]);

  constructor() {
    effect(() => {
      this.internalFields.set(this.fields());
    });
  }

  toggleField(field: TelemetryField): void {
    const updatedFields = this.internalFields().map(f => 
      f.id === field.id ? { ...f, selected: !f.selected } : f
    );
    this.internalFields.set(updatedFields);
    
    const selected = updatedFields.filter(f => f.selected);
    this.selectedFields.emit(selected);
  }

  toggleViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  get selectedCount(): number {
    return this.internalFields().filter(f => f.selected).length;
  }
}
