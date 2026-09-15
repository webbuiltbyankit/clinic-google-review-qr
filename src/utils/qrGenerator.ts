import QRCode from 'qrcode';

export interface QRGeneratorOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
}

/**
 * Generate a high-resolution PNG Data URL locally in the browser
 */
export async function generateQRPng(
  url: string,
  width: number = 2048
): Promise<string> {
  if (!url || !url.trim()) {
    throw new Error('URL cannot be empty');
  }

  return QRCode.toDataURL(url.trim(), {
    errorCorrectionLevel: 'H',
    margin: 4,
    width,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

/**
 * Generate an SVG string locally in the browser
 */
export async function generateQRSvg(url: string): Promise<string> {
  if (!url || !url.trim()) {
    throw new Error('URL cannot be empty');
  }

  return QRCode.toString(url.trim(), {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
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
