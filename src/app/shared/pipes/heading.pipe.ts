import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'heading',
  standalone: true
})
export class HeadingPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }

    // Asegurar que el valor esté entre 0 y 360
    const normalizedValue = ((value % 360) + 360) % 360;
    
    // Redondear a entero
    const degrees = Math.round(normalizedValue);
    
    // Determinar la dirección cardinal
    const direction = this.getCardinalDirection(degrees);
    
    return `${degrees}° ${direction}`;
  }

  private getCardinalDirection(degrees: number): string {
    const directions = [
      { min: 0, max: 22.5, label: 'N' },
      { min: 22.5, max: 67.5, label: 'NE' },
      { min: 67.5, max: 112.5, label: 'E' },
      { min: 112.5, max: 157.5, label: 'SE' },
      { min: 157.5, max: 202.5, label: 'S' },
      { min: 202.5, max: 247.5, label: 'SO' },
      { min: 247.5, max: 292.5, label: 'O' },
      { min: 292.5, max: 337.5, label: 'NO' },
      { min: 337.5, max: 360, label: 'N' }
    ];

    const direction = directions.find(d => degrees >= d.min && degrees < d.max);
    return direction?.label || 'N';
  }
}
