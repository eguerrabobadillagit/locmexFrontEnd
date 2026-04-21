import { Component, Input, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonSpinner,
  IonDatetime,
  IonPopover,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  arrowBackOutline,
  calendarOutline,
  timeOutline,
  playOutline,
  alertCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  chevronDownOutline,
  analyticsOutline
} from 'ionicons/icons';
import { VehicleHistoryService } from '../../services/vehicle-history.service';
import { VehicleHistoryRequest } from '../../interfaces/vehicle-history.interface';

@Component({
  selector: 'app-vehicle-history-form',
  templateUrl: './vehicle-history-form.component.html',
  styleUrls: ['./vehicle-history-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonSpinner,
    IonDatetime,
    IonPopover,
    IonSelect,
    IonSelectOption
  ]
})
export class VehicleHistoryFormComponent implements OnInit {
  @Input() vehicleId!: string;
  @Input() vehiclePlate!: string;
  @Output() closeForm = new EventEmitter<void>();
  @Output() searchHistory = new EventEmitter<VehicleHistoryRequest>();

  private readonly historyService = inject(VehicleHistoryService);

  // Form data
  fromDate = signal<string>('');
  fromHour = signal<string>('00');
  fromMinute = signal<string>('00');
  toDate = signal<string>('');
  toHour = signal<string>('');
  toMinute = signal<string>('');

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  fromDatetime = signal<string>('');
  toDatetime = signal<string>('');

  readonly allHours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  readonly allMinutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  readonly todayStr: string = (() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = (t.getMonth() + 1).toString().padStart(2, '0');
    const d = t.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  })();

  constructor() {
    addIcons({chevronBackOutline, chevronForwardOutline, chevronDownOutline, analyticsOutline, closeOutline, calendarOutline, timeOutline, alertCircleOutline, playOutline, arrowBackOutline});
  }

  ngOnInit() {
    this.initializeDates();
  }

  private initializeDates() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const currentHour = today.getHours().toString().padStart(2, '0');
    const currentMinute = today.getMinutes().toString().padStart(2, '0');
    this.fromDate.set(dateStr);
    this.toDate.set(dateStr);
    this.toHour.set(currentHour);
    this.toMinute.set(currentMinute);
    this.fromDatetime.set(`${dateStr}T00:00:00`);
    this.toDatetime.set(`${dateStr}T${currentHour}:${currentMinute}:00`);
  }

  private isToday(dateStr: string): boolean {
    return dateStr === this.todayStr;
  }

  get fromAvailableHours(): string[] {
    if (!this.isToday(this.fromDate())) return this.allHours;
    const now = new Date();
    const maxH = now.getHours();
    return this.allHours.filter(h => parseInt(h) <= maxH);
  }

  get fromAvailableMinutes(): string[] {
    if (!this.isToday(this.fromDate())) return this.allMinutes;
    const now = new Date();
    const maxH = now.getHours();
    if (parseInt(this.fromHour()) < maxH) return this.allMinutes;
    return this.allMinutes.filter(m => parseInt(m) <= now.getMinutes());
  }

  get toAvailableHours(): string[] {
    if (!this.isToday(this.toDate())) return this.allHours;
    const now = new Date();
    const maxH = now.getHours();
    return this.allHours.filter(h => parseInt(h) <= maxH);
  }

  get toAvailableMinutes(): string[] {
    if (!this.isToday(this.toDate())) return this.allMinutes;
    const now = new Date();
    const maxH = now.getHours();
    if (parseInt(this.toHour()) < maxH) return this.allMinutes;
    return this.allMinutes.filter(m => parseInt(m) <= now.getMinutes());
  }

  onFromHourChange(hour: string) {
    const available = this.fromAvailableMinutes;
    if (!available.includes(this.fromMinute())) {
      this.fromMinute.set(available[available.length - 1]);
    }
  }

  onToHourChange(hour: string) {
    const available = this.toAvailableMinutes;
    if (!available.includes(this.toMinute())) {
      this.toMinute.set(available[available.length - 1]);
    }
  }

  onFromDatetimeChange(value: string | string[] | null | undefined) {
    if (!value || typeof value !== 'string') return;
    const datePart = value.split('T')[0];
    this.fromDate.set(datePart);
    this.fromDatetime.set(value);
    const availHours = this.fromAvailableHours;
    if (!availHours.includes(this.fromHour())) {
      const newHour = availHours[availHours.length - 1];
      this.fromHour.set(newHour);
    }
    const availMins = this.fromAvailableMinutes;
    if (!availMins.includes(this.fromMinute())) {
      this.fromMinute.set(availMins[availMins.length - 1]);
    }
  }

  onToDatetimeChange(value: string | string[] | null | undefined) {
    if (!value || typeof value !== 'string') return;
    const datePart = value.split('T')[0];
    this.toDate.set(datePart);
    this.toDatetime.set(value);
    const availHours = this.toAvailableHours;
    if (!availHours.includes(this.toHour())) {
      const newHour = availHours[availHours.length - 1];
      this.toHour.set(newHour);
    }
    const availMins = this.toAvailableMinutes;
    if (!availMins.includes(this.toMinute())) {
      this.toMinute.set(availMins[availMins.length - 1]);
    }
  }

  onClose() {
    this.closeForm.emit();
  }

  goBack() {
    this.closeForm.emit();
  }

  private validateDateRange(): string | null {
    const fromDateTime = new Date(`${this.fromDate()}T${this.fromHour()}:${this.fromMinute()}:00`);
    const toDateTime = new Date(`${this.toDate()}T${this.toHour()}:${this.toMinute()}:59`);

    const diffMs = toDateTime.getTime() - fromDateTime.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 31) {
      return 'El rango máximo permitido es de 31 días.';
    }

    if (diffMs < 0) {
      return 'La fecha final debe ser posterior a la fecha inicial.';
    }

    return null;
  }

  onSearch() {
    if (!this.vehicleId) {
      this.error.set('No se ha seleccionado un vehículo');
      return;
    }

    const validationError = this.validateDateRange();
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    const fromDateTime = `${this.fromDate()}T${this.fromHour()}:${this.fromMinute()}:00`;
    const toDateTime = `${this.toDate()}T${this.toHour()}:${this.toMinute()}:59`;

    const fromUtc = new Date(fromDateTime).toISOString();
    const toUtc = new Date(toDateTime).toISOString();

    this.isLoading.set(true);
    this.error.set(null);

    const request: VehicleHistoryRequest = {
      vehicleId: this.vehicleId,
      fromUtc,
      toUtc,
      fromDate: this.fromDate(),
      fromHour: this.fromHour(),
      fromMinute: this.fromMinute(),
      toDate: this.toDate(),
      toHour: this.toHour(),
      toMinute: this.toMinute()
    };

    this.searchHistory.emit(request);
    this.isLoading.set(false);
  }

  get isFormValid(): boolean {
    return !!this.fromDate() && !!this.toDate();
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

}
