import { Component, input, output, signal } from '@angular/core';
import { IonSearchbar, IonSelect, IonSelectOption, IonButton, IonIcon } from '@ionic/angular/standalone';
import { IFilterOption } from '../../models/filter-option.interface';

@Component({
  selector: 'app-data-toolbar',
  standalone: true,
  imports: [IonSearchbar, IonSelect, IonSelectOption, IonButton, IonIcon],
  templateUrl: './data-toolbar.component.html',
  styleUrls: ['./data-toolbar.component.scss']
})
export class DataToolbarComponent {
  searchPlaceholder = input<string>('Buscar...');
  filterLabel = input<string>('Filtrar');
  filterOptions = input<IFilterOption[]>([]);
  showViewToggle = input<boolean>(true);
  
  searchChange = output<string>();
  filterChange = output<string | number>();
  viewChange = output<'list' | 'grid'>();

  currentView = signal<'list' | 'grid'>('list');

  onSearchChange(event: any) {
    const value = event.target.value || '';
    this.searchChange.emit(value);
  }

  onFilterChange(event: any) {
    const value = event.detail.value;
    this.filterChange.emit(value);
  }

  toggleView(mode: 'list' | 'grid') {
    this.currentView.set(mode);
    this.viewChange.emit(mode);
  }
}
