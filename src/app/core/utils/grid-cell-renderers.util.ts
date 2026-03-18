/**
 * Utilidades compartidas para cellRenderers de AG Grid
 * Estandariza los estilos de las celdas en todos los grids de la aplicación
 */

/**
 * Colores estandarizados para la aplicación
 */
export const GridColors = {
  primary: '#3b82f6',
  primaryLight: '#dbeafe',
  textDark: '#1f2937',
  textMedium: '#374151',
  success: '#155724',
  successBg: '#d4edda',
  danger: '#721c24',
  dangerBg: '#f8d7da',
  warning: '#e65100',
  warningBg: '#fff3e0',
  info: '#0c5460',
  infoBg: '#d1ecf1',
  neutral: '#f3f4f6',
  border: '#e5e7eb'
} as const;

/**
 * Estilos de tipografía estandarizados
 */
export const GridTypography = {
  primary: {
    fontSize: '14px',
    fontWeight: '600',
    color: GridColors.textDark
  },
  secondary: {
    fontSize: '13px',
    fontWeight: '500',
    color: GridColors.textMedium
  },
  small: {
    fontSize: '11px',
    fontWeight: '500',
    color: GridColors.textMedium
  }
} as const;

/**
 * Renderiza una celda de texto simple con estilos estandarizados
 */
export function renderTextCell(value: any, type: 'primary' | 'secondary' | 'small' = 'secondary'): string {
  const styles = GridTypography[type];
  return `
    <div style="padding: 4px 0;">
      <span style="font-weight: ${styles.fontWeight}; font-size: ${styles.fontSize}; color: ${styles.color};">
        ${value || '-'}
      </span>
    </div>
  `;
}

/**
 * Renderiza una celda con icono y texto (para columnas principales como ID, IMEI, Placa)
 */
export function renderIconTextCell(
  value: any,
  iconName: string,
  iconColor: string = GridColors.primary,
  bgColor: string = GridColors.primaryLight
): string {
  return `
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 6px; background: ${bgColor}; flex-shrink: 0;">
        <ion-icon name="${iconName}" style="font-size: 16px; color: ${iconColor};"></ion-icon>
      </div>
      <span style="font-weight: 600; font-size: 14px; color: ${GridColors.textDark};">
        ${value || '-'}
      </span>
    </div>
  `;
}

/**
 * Renderiza un chip de estado con punto de color
 */
export function renderStatusChip(
  text: string,
  type: 'success' | 'danger' | 'warning' | 'info'
): string {
  const colorMap = {
    success: { bg: GridColors.successBg, color: GridColors.success },
    danger: { bg: GridColors.dangerBg, color: GridColors.danger },
    warning: { bg: GridColors.warningBg, color: GridColors.warning },
    info: { bg: GridColors.infoBg, color: GridColors.info }
  };

  const colors = colorMap[type];

  return `
    <div style="display: flex; align-items: center; height: 100%;">
      <span style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        background: ${colors.bg};
        color: ${colors.color};
        border-radius: 11px;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.3;
        white-space: nowrap;
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: ${colors.color};"></span>
        ${text}
      </span>
    </div>
  `;
}

/**
 * Renderiza una celda con icono SVG y texto (para estados como "Asignado", "Sin asignar")
 */
export function renderIconSvgTextCell(
  text: string,
  svgDataUrl: string,
  iconSize: number = 16
): string {
  return `
    <div style="padding: 4px 0;">
      <img src="${svgDataUrl}" style="width: ${iconSize}px; height: ${iconSize}px; vertical-align: middle; margin-right: 4px;"/>
      <span style="font-weight: 500; font-size: 13px; color: ${GridColors.textMedium};">
        ${text}
      </span>
    </div>
  `;
}

/**
 * Renderiza botones de acción (editar/eliminar)
 */
export function renderActionButtons(
  id: string,
  options: {
    showEdit?: boolean;
    showDelete?: boolean;
    showLink?: boolean;
    editDataAttr?: string;
    deleteDataAttr?: string;
    linkDataAttr?: string;
  } = {}
): string {
  const {
    showEdit = true,
    showDelete = true,
    showLink = false,
    editDataAttr = 'data-id',
    deleteDataAttr = 'data-id',
    linkDataAttr = 'data-id'
  } = options;

  const buttonStyle = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
  `;

  let buttons = '';

  if (showEdit) {
    buttons += `
      <button class="action-btn edit-btn" ${editDataAttr}="${id}" style="${buttonStyle}">
        <ion-icon name="create-outline" style="font-size: 18px; color: ${GridColors.primary};"></ion-icon>
      </button>
    `;
  }

  if (showDelete) {
    buttons += `
      <button class="action-btn delete-btn" ${deleteDataAttr}="${id}" style="${buttonStyle}">
        <ion-icon name="trash-outline" style="font-size: 18px; color: #ef4444;"></ion-icon>
      </button>
    `;
  }

  if (showLink) {
    buttons += `
      <button class="action-btn link-btn" ${linkDataAttr}="${id}" style="${buttonStyle}">
        <ion-icon name="link-outline" style="font-size: 18px; color: #10b981;"></ion-icon>
      </button>
    `;
  }

  return `
    <div style="display: flex; gap: 8px; padding: 4px 0;">
      ${buttons}
    </div>
  `;
}

/**
 * Renderiza una fecha formateada con estilos estandarizados
 */
export function renderDateCell(
  dateString: string,
  locale: string = 'es-MX',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return renderTextCell('-');

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleString(locale, defaultOptions);

  return renderTextCell(formattedDate);
}

/**
 * Renderiza un badge/chip simple sin punto
 */
export function renderBadge(
  text: string,
  bgColor: string = GridColors.neutral,
  textColor: string = GridColors.textDark
): string {
  return `
    <div style="display: flex; align-items: center; height: 100%;">
      <span style="
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        background: ${bgColor};
        color: ${textColor};
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        line-height: 1;
      ">
        ${text}
      </span>
    </div>
  `;
}
