import { Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [IonButton, IonIcon],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  actionLabel = input<string>('');
  actionIcon = input<string>('add-outline');
  showAction = input<boolean>(true);
  
  actionClick = output<void>();

  onActionClick() {
    this.actionClick.emit();
  }
}
