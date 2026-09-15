import QRCode from 'qrcode';

export interface QRGeneratorOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
  logoUrl?: string;
  logoRatio?: number; // default 0.2 (20% of QR size)
}

// Preset logos (encoded as SVG Data URLs)
export const PRESET_LOGOS = {
  none: '',
  google: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%234285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="%2334A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="%23FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="%23EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>',
  medical: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230284c7"><path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/></svg>',
  star: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23eab308"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
};

/**
 * Generate a high-resolution PNG Data URL with an optional centered logo
 */
export async function generateQRPng(
  url: string,
  width: number = 2048,
  logoUrl?: string,
  logoRatio: number = 0.22
): Promise<string> {
  if (!url || !url.trim()) {
    throw new Error('URL cannot be empty');
  }

  // Create canvas in browser memory
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = width;

  await QRCode.toCanvas(canvas, url.trim(), {
    errorCorrectionLevel: 'H', // Level H allows up to 30% area overlay
    margin: 4,
    width,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // If logo is provided, draw logo overlay on center of canvas
  if (logoUrl && logoUrl.trim()) {
    await drawLogoOnCanvas(canvas, logoUrl, logoRatio);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Helper to draw centered logo onto canvas with a clean white badge background
 */
function drawLogoOnCanvas(
  canvas: HTMLCanvasElement,
  logoUrl: string,
  logoRatio: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve();
        return;
      }

      const canvasWidth = canvas.width;
      const logoSize = canvasWidth * logoRatio;
      const badgeSize = logoSize * 1.25; // White background badge size
      const center = canvasWidth / 2;
      const badgeX = center - badgeSize / 2;
      const badgeY = center - badgeSize / 2;
      const logoX = center - logoSize / 2;
      const logoY = center - logoSize / 2;
      const borderRadius = badgeSize * 0.2;

      // Draw white rounded background badge
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(badgeX + borderRadius, badgeY);
      ctx.arcTo(badgeX + badgeSize, badgeY, badgeX + badgeSize, badgeY + badgeSize, borderRadius);
      ctx.arcTo(badgeX + badgeSize, badgeY + badgeSize, badgeX, badgeY + badgeSize, borderRadius);
      ctx.arcTo(badgeX, badgeY + badgeSize, badgeX, badgeY, borderRadius);
      ctx.arcTo(badgeX, badgeY, badgeX + badgeSize, badgeY, borderRadius);
      ctx.closePath();

      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = Math.max(2, canvasWidth * 0.005);
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      // Draw logo image
      ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
      ctx.restore();
      resolve();
    };

    img.onerror = () => {
      console.warn('Failed to load logo image, rendering QR without logo.');
      resolve();
    };

    img.src = logoUrl;
  });
}

/**
 * Generate an SVG string with optional centered logo
 */
export async function generateQRSvg(
  url: string,
  logoUrl?: string,
  logoRatio: number = 0.22
): Promise<string> {
  if (!url || !url.trim()) {
    throw new Error('URL cannot be empty');
  }

  let svgString = await QRCode.toString(url.trim(), {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  if (logoUrl && logoUrl.trim()) {
    // Inject centered logo into SVG string before closing </svg>
    svgString = injectLogoIntoSvg(svgString, logoUrl, logoRatio);
  }

  return svgString;
}

/**
 * Inject centered logo and white badge rect into raw SVG string
 */
function injectLogoIntoSvg(svg: string, logoUrl: string, logoRatio: number): string {
  const viewBoxMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const size = viewBoxMatch ? parseInt(viewBoxMatch[1], 10) : 100;

  const logoSize = size * logoRatio;
  const badgeSize = logoSize * 1.25;
  const center = size / 2;
  const badgeX = center - badgeSize / 2;
  const badgeY = center - badgeSize / 2;
  const logoX = center - logoSize / 2;
  const logoY = center - logoSize / 2;
  const rx = badgeSize * 0.2;

  const logoSvgGroup = `
  <g id="center-logo">
    <rect x="${badgeX}" y="${badgeY}" width="${badgeSize}" height="${badgeSize}" rx="${rx}" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="0.5"/>
    <image x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" href="${logoUrl}" />
  </g>
</svg>`;

  return svg.replace('</svg>', logoSvgGroup);
}

/**
 * Trigger file download in browser
 */
export function triggerDownload(data: string, filename: string, isSvg: boolean = false) {
  const link = document.createElement('a');

  if (isSvg) {
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } else {
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
