import { VEHICLE_STATUS_COLORS, MarkerColors } from '../config/marker-styles.config';
import { getSpeedColor, getSpeedHexColor } from '../../vehicles/utils/vehicle-history.utils';

// Cache para la imagen del carro
let carImageCache: HTMLImageElement | null = null;
let carImageLoaded = false;

/**
 * Precarga la imagen del carro
 */
function preloadCarImage(): Promise<HTMLImageElement> {
  if (carImageCache && carImageLoaded) {
    return Promise.resolve(carImageCache);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      carImageCache = img;
      carImageLoaded = true;
      resolve(img);
    };
    img.onerror = (error) => {
      console.error('Error cargando imagen del carro:', error);
      reject(error);
    };
    img.src = 'assets/carro.png';
  });
}

// Precargar la imagen inmediatamente al cargar el módulo
preloadCarImage().catch(console.error);

/**
 * Obtiene los colores correspondientes al estado de un vehículo
 * @param status Estado del vehículo (In_route, stopped, offline, etc.)
 * @returns Objeto con los colores stroke, fill y filterId
 */
export function getColorByVehicleStatus(status: string): MarkerColors {
  const normalizedStatus = status.toUpperCase().replace('-', '_');
  return VEHICLE_STATUS_COLORS[normalizedStatus] || VEHICLE_STATUS_COLORS['DEFAULT'];
}

/**
 * Crea un icono de imagen rotado para un marcador de vehículo en Google Maps
 * @param heading Dirección del vehículo en grados (0-360)
 * @param status Estado del vehículo
 * @param label Etiqueta con el nombre/placa del vehículo (opcional)
 * @returns Objeto google.maps.Icon con la imagen del marcador
 */
export function createVehicleMarkerIcon(heading: number, status: string, label?: string): google.maps.Icon {
  const colors = getColorByVehicleStatus(status);
  const labelHeight = label ? 32 : 0; // Altura de la etiqueta (aumentada)
  const carIconSize = 100; // Tamaño del canvas para el icono del carro
  const canvasSize = carIconSize + labelHeight; // Canvas total incluyendo etiqueta
  const displaySize = 60; // Tamaño que se verá en el mapa
  const carCenter = labelHeight + (carIconSize / 2); // Centro del carro (después de la etiqueta)
  
  // Si la imagen no está cargada, usar un icono temporal
  if (!carImageLoaded || !carImageCache) {
    // Precargar la imagen para la próxima vez
    preloadCarImage().catch(console.error);
    
    // Retornar icono SVG temporal mientras carga
    const tempSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${displaySize}" height="${displaySize}" viewBox="0 0 ${displaySize} ${displaySize}">
        <g transform="rotate(${heading} ${displaySize/2} ${displaySize/2})">
          <circle cx="${displaySize/2}" cy="${displaySize/2}" r="20" fill="white" stroke="${colors.stroke}" stroke-width="2.5"/>
          <path d="M${displaySize/2-8},${displaySize/2-12} L${displaySize/2+8},${displaySize/2-12} L${displaySize/2+10},${displaySize/2-8} L${displaySize/2+10},${displaySize/2+8} L${displaySize/2+8},${displaySize/2+10} L${displaySize/2-8},${displaySize/2+10} L${displaySize/2-10},${displaySize/2+8} L${displaySize/2-10},${displaySize/2-8} Z" fill="${colors.fill}"/>
        </g>
      </svg>
    `;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(tempSvg),
      scaledSize: new google.maps.Size(displaySize, displaySize),
      anchor: new google.maps.Point(displaySize/2, displaySize/2)
    };
  }

  // Crear canvas para renderizar la imagen rotada (más grande para la sombra)
  const canvas = document.createElement('canvas');
  canvas.width = carIconSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d')!;

  // Limpiar canvas (fondo transparente)
  ctx.clearRect(0, 0, carIconSize, canvasSize);

  // Dibujar etiqueta si existe
  if (label) {
    ctx.save();
    // Fondo oscuro de la etiqueta
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = 'bold 15px Arial, sans-serif';
    const textMetrics = ctx.measureText(label);
    const labelWidth = textMetrics.width + 18;
    const labelX = (carIconSize - labelWidth) / 2;
    const labelY = 2;
    
    // Rectángulo con bordes redondeados
    const radius = 3;
    ctx.beginPath();
    ctx.moveTo(labelX + radius, labelY);
    ctx.lineTo(labelX + labelWidth - radius, labelY);
    ctx.quadraticCurveTo(labelX + labelWidth, labelY, labelX + labelWidth, labelY + radius);
    ctx.lineTo(labelX + labelWidth, labelY + labelHeight - radius);
    ctx.quadraticCurveTo(labelX + labelWidth, labelY + labelHeight, labelX + labelWidth - radius, labelY + labelHeight);
    ctx.lineTo(labelX + radius, labelY + labelHeight);
    ctx.quadraticCurveTo(labelX, labelY + labelHeight, labelX, labelY + labelHeight - radius);
    ctx.lineTo(labelX, labelY + radius);
    ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY);
    ctx.closePath();
    ctx.fill();
    
    // Texto blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, carIconSize / 2, labelY + labelHeight / 2);
    ctx.restore();
  }

  // Guardar estado y mover al centro del carro
  ctx.save();
  ctx.translate(carIconSize / 2, carCenter);
  ctx.rotate((heading * Math.PI) / 180);

  // Agregar sombra exagerada para mejor visibilidad
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6;

  // Dibujar la imagen del carro centrada (más grande para compensar el escalado)
  const imgSize = 90;
  ctx.drawImage(carImageCache, -imgSize/2, -imgSize/2, imgSize, imgSize);

  ctx.restore();

  // Convertir canvas a data URL con transparencia
  const dataUrl = canvas.toDataURL('image/png');

  const finalDisplaySize = label ? displaySize + 20 : displaySize;
  const anchorY = label ? (finalDisplaySize / 2) + 10 : displaySize / 2;

  return {
    url: dataUrl,
    scaledSize: new google.maps.Size(displaySize, finalDisplaySize),
    anchor: new google.maps.Point(displaySize/2, anchorY)
  };
}

export function createSpeedBadgeIcon(speedKph: number, overrideColor?: string): google.maps.Icon {
  const color = overrideColor ?? getSpeedHexColor(getSpeedColor(speedKph));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="white" stroke="${color}" stroke-width="2"/><text x="12" y="15" text-anchor="middle" font-size="9" font-family="Arial, sans-serif" font-weight="bold" fill="#333">${Math.round(speedKph)}</text></svg>`;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(24, 24),
    anchor: new google.maps.Point(12, 12),
  };
}
