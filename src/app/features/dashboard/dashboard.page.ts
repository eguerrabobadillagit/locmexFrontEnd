import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p>Contenido del dashboard aquí...</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 32px;
    }
    
    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 16px;
    }
  `]
})
export class DashboardPage {}
