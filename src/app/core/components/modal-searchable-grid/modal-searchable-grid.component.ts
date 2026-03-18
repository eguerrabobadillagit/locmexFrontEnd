import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-modal-searchable-grid',
  templateUrl: './modal-searchable-grid.component.html',
  styleUrls: ['./modal-searchable-grid.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AgGridAngular]
})
export class ModalSearchableGridComponent {
  title = input.required<string>();
  itemCount = input<number>(0);
  searchPlaceholder = input<string>('Buscar...');
  columnDefs = input.required<ColDef[]>();
  rowData = input.required<any[]>();
  
  rowSelected = output<any>();
  
  searchText = signal('');
  filteredData = signal<any[]>([]);

  gridOptions: GridOptions = {
    domLayout: 'autoHeight',
    rowSelection: 'single',
    suppressCellFocus: true,
    onRowClicked: (event) => {
      this.rowSelected.emit(event.data);
    }
  };

  constructor() {
    effect(() => {
      this.filteredData.set(this.rowData());
    });
  }

  onSearchChange(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.searchText.set(searchValue);
    
    if (!searchValue) {
      this.filteredData.set(this.rowData());
      return;
    }

    const filtered = this.rowData().filter((item: any) => {
      return Object.values(item).some((value: any) => 
        value?.toString().toLowerCase().includes(searchValue)
      );
    });
    
    this.filteredData.set(filtered);
  }
}
