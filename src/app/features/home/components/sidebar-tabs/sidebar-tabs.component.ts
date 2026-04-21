import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, shieldOutline, menuOutline } from 'ionicons/icons';

export type SidebarTab = 'unidades' | 'geocercas' | 'menu';

@Component({
  selector: 'app-sidebar-tabs',
  templateUrl: './sidebar-tabs.component.html',
  styleUrls: ['./sidebar-tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class SidebarTabsComponent {
  activeTab = input<SidebarTab>('menu');
  tabChange = output<SidebarTab>();

  constructor() {
    addIcons({ carOutline, shieldOutline, menuOutline });
  }

  onTabClick(tab: SidebarTab): void {
    this.tabChange.emit(tab);
  }
}
