import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { generateQRSvg, generateQRPng } from '@/lib/qr';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: qr, error: fetchError } = await supabase
      .from('qr_codes')
      .select('id, short_code')
      .eq('id', params.id)
      .eq('user_id', auth.userId)
      .single();

    if (fetchError || !qr) {
      return NextResponse.json({ error: 'QR code not found.' }, { status: 404 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'svg';
    const sizeParam = parseInt(url.searchParams.get('size') || '400', 10);
    const size = Math.max(200, Math.min(2000, isNaN(sizeParam) ? 400 : sizeParam));

    if (format === 'png') {
      const buffer = await generateQRPng(qr.short_code, size);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="qr-${qr.short_code}.png"`,
        },
      });
    }

    const svg = await generateQRSvg(qr.short_code);
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="qr-${qr.short_code}.svg"`,
      },
    });
  } catch (err) {
    console.error('QR download error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
