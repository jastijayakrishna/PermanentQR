import QRCode from 'qrcode';

const REDIRECT_DOMAIN = process.env.NEXT_PUBLIC_REDIRECT_DOMAIN!;

export async function generateQRSvg(shortCode: string): Promise<string> {
  const url = `${REDIRECT_DOMAIN}/${shortCode}`;
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 400,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

export async function generateQRPng(shortCode: string, size: number = 400): Promise<Buffer> {
  const url = `${REDIRECT_DOMAIN}/${shortCode}`;
  return QRCode.toBuffer(url, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 4,
    width: size,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

export async function generateStaticQRSvg(rawUrl: string): Promise<string> {
  return QRCode.toString(rawUrl, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 400,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

export async function generateStaticQRPng(rawUrl: string, size: number = 400): Promise<Buffer> {
  return QRCode.toBuffer(rawUrl, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 4,
    width: size,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}
