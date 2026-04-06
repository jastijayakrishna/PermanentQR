import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { kvPut, kvDelete } from '@/lib/kv';

export async function PATCH(
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
      .select('*')
      .eq('id', params.id)
      .eq('user_id', auth.userId)
      .eq('is_active', true)
      .single();

    if (fetchError || !qr) {
      return NextResponse.json({ error: 'QR code not found.' }, { status: 404 });
    }

    const body = await request.json();
    const { destination_url, label } = body as { destination_url?: string; label?: string };

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (destination_url !== undefined) {
      if (!destination_url) {
        return NextResponse.json({ error: 'Destination URL cannot be empty.' }, { status: 400 });
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
      updates.destination_url = destination_url;
    }

    if (label !== undefined) {
      updates.label = label.trim() || null;
    }

    const { data: updated, error: updateError } = await supabase
      .from('qr_codes')
      .update(updates)
      .eq('id', params.id)
      .select('id, short_code, destination_url, label, created_at, updated_at')
      .single();

    if (updateError || !updated) {
      console.error('QR update error:', updateError);
      return NextResponse.json({ error: 'Failed to update QR code.' }, { status: 500 });
    }

    if (destination_url) {
      const kvResult = await kvPut(updated.short_code, destination_url);
      if (!kvResult) {
        console.error('KV update failed for short_code:', updated.short_code);
      }
    }

    return NextResponse.json({ qr: updated });
  } catch (err) {
    console.error('QR patch error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
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
      .eq('is_active', true)
      .single();

    if (fetchError || !qr) {
      return NextResponse.json({ error: 'QR code not found.' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (updateError) {
      console.error('QR deactivate error:', updateError);
      return NextResponse.json({ error: 'Failed to deactivate QR code.' }, { status: 500 });
    }

    const kvResult = await kvDelete(qr.short_code);
    if (!kvResult) {
      console.error('KV delete failed for short_code:', qr.short_code);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('QR delete error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
