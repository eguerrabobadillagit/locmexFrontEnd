import {
  Component,
  input,
  output,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, arrowBackOutline, warningOutline, refreshOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-street-view',
  templateUrl: './street-view.component.html',
  styleUrls: ['./street-view.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton]
})
export class StreetViewComponent implements AfterViewInit, OnChanges {
  @ViewChild('streetViewContainer') streetViewContainer!: ElementRef<HTMLDivElement>;

  latitude = input<number | undefined>(undefined);
  longitude = input<number | undefined>(undefined);
  vehiclePlate = input<string>('');
  back = output<void>();

  noStreetView = signal<boolean>(false);

  private panorama: google.maps.StreetViewPanorama | null = null;
  private svService: google.maps.StreetViewService | null = null;
  private viewInitialized = false;

  constructor() {
    addIcons({ closeOutline, arrowBackOutline, warningOutline, refreshOutline, eyeOutline });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.initStreetView();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.viewInitialized && (changes['latitude'] || changes['longitude'])) {
      this.initStreetView();
    }
  }

  private initStreetView(): void {
    const lat = this.latitude();
    const lng = this.longitude();

    if (!lat || !lng || !this.streetViewContainer) return;

    const position = { lat, lng };
    this.noStreetView.set(false);

    if (!this.svService) {
      this.svService = new google.maps.StreetViewService();
    }

    this.svService.getPanorama({ location: position, radius: 50 }, (data, status) => {
      if (status === google.maps.StreetViewStatus.OK) {
        if (!this.panorama) {
          this.panorama = new google.maps.StreetViewPanorama(
            this.streetViewContainer.nativeElement,
            {
              position,
              pov: { heading: 165, pitch: 0 },
              zoom: 1,
              addressControl: true,
              linksControl: true,
              panControl: true,
              enableCloseButton: false,
              fullscreenControl: false
            }
          );
        } else {
          this.panorama.setPosition(position);
        }
      } else {
        this.noStreetView.set(true);
        this.panorama = null;
      }
    });
  }

  onBack(): void {
    this.back.emit();
  }
}
