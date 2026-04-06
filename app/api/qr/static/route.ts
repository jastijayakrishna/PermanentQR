import { NextResponse } from 'next/server';
import { generateStaticQRSvg, generateStaticQRPng } from '@/lib/qr';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, format } = body as { url: string; format?: string };

    if (!url) {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'URL must use HTTP or HTTPS.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    if (format === 'png') {
      const buffer = await generateStaticQRPng(url);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="qr-code.png"',
        },
      });
    }

    const svg = await generateStaticQRSvg(url);
    return NextResponse.json({ svg });
  } catch (err) {
    console.error('Static QR error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
