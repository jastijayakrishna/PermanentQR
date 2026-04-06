import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { generateShortCode, RESERVED_CODES } from '@/lib/shortcode';
import { generateQRSvg } from '@/lib/qr';
import { kvPut } from '@/lib/kv';

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { destination_url, label } = body as { destination_url: string; label?: string };

    if (!destination_url) {
      return NextResponse.json({ error: 'Destination URL is required.' }, { status: 400 });
    }

    try {
      const parsed = new URL(destination_url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'URL must use HTTP or HTTPS.' }, { status: 400 });
      }
      const redirectDomain = process.env.NEXT_PUBLIC_REDIRECT_DOMAIN || '';
      if (destination_url.startsWith(redirectDomain)) {
        return NextResponse.json({ error: 'Cannot redirect to our own domain.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('codes_remaining')
      .eq('id', auth.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.codes_remaining <= 0) {
      return NextResponse.json({ error: 'No codes remaining. Purchase a plan.' }, { status: 402 });
    }

    let shortCode = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateShortCode();
      if (RESERVED_CODES.has(candidate)) continue;

      const { data: existing } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('short_code', candidate)
        .single();

      if (!existing) {
        shortCode = candidate;
        break;
      }
    }

    if (!shortCode) {
      return NextResponse.json({ error: 'Failed to generate unique code. Try again.' }, { status: 500 });
    }

    const svg = await generateQRSvg(shortCode);

    const { data: qr, error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        user_id: auth.userId,
        short_code: shortCode,
        destination_url: destination_url,
        label: label?.trim() || null,
      })
      .select('id, short_code, destination_url, label, created_at')
      .single();

    if (insertError || !qr) {
      console.error('QR insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create QR code.' }, { status: 500 });
    }

    const { error: decrementError } = await supabase
      .from('users')
      .update({ codes_remaining: user.codes_remaining - 1 })
      .eq('id', auth.userId);

    if (decrementError) {
      console.error('Decrement error:', decrementError);
    }

    const kvResult = await kvPut(shortCode, destination_url);
    if (!kvResult) {
      console.error('KV write failed for short_code:', shortCode);
    }

    return NextResponse.json({ qr, svg }, { status: 201 });
  } catch (err) {
    console.error('QR create error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: codes, error: codesError } = await supabase
      .from('qr_codes')
      .select('id, short_code, destination_url, label, created_at, updated_at')
      .eq('user_id', auth.userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (codesError) {
      console.error('QR list error:', codesError);
      return NextResponse.json({ error: 'Failed to fetch QR codes.' }, { status: 500 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('codes_remaining, email, name')
      .eq('id', auth.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      codes: codes || [],
      user: {
        codes_remaining: user.codes_remaining,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('QR list error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
