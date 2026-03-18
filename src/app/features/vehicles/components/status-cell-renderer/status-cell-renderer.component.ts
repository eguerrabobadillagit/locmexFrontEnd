import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-cell-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-chip" [ngClass]="statusClass">
      {{ statusLabel }}
    </span>
  `,
  styles: [`
    .status-chip {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 11px;
      font-size: 11px;
      font-weight: 500;
      text-align: center;
      line-height: 1.3;
      white-space: nowrap;
    }

    .status-active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-route {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .status-inactive {
      background-color: #f8d7da;
      color: #721c24;
    }
  `]
})
export class StatusCellRendererComponent implements ICellRendererAngularComp {
  statusLabel = '';
  statusClass = '';

  agInit(params: ICellRendererParams): void {
    this.updateStatus(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.updateStatus(params);
    return true;
  }

  private updateStatus(params: ICellRendererParams): void {
    const statusMap: any = {
      'active': { label: 'Activo', class: 'status-active' },
      'in-route': { label: 'En Ruta', class: 'status-route' },
      'inactive': { label: 'Inactivo', class: 'status-inactive' }
    };
    const status = statusMap[params.value] || statusMap['inactive'];
    this.statusLabel = status.label;
    this.statusClass = status.class;
  }
}
