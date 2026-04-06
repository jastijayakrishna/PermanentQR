'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface QRCode {
  id: string;
  short_code: string;
  destination_url: string;
  label: string | null;
  created_at: string;
  updated_at: string;
}

interface UserInfo {
  codes_remaining: number;
  email: string;
  name: string | null;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [destUrl, setDestUrl] = useState('');
  const [label, setLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newQrSvg, setNewQrSvg] = useState('');
  const [newQrCode, setNewQrCode] = useState<QRCode | null>(null);

  const [paymentMsg, setPaymentMsg] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState('');

  const redirectDomain = process.env.NEXT_PUBLIC_REDIRECT_DOMAIN || 'https://pqr.link';

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/qr');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setCodes(data.codes || []);
      setUser(data.user || null);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setPaymentMsg('Payment received! Your codes are being activated...');
      let checks = 0;
      const interval = setInterval(async () => {
        checks++;
        await fetchData();
        if (checks >= 5) {
          clearInterval(interval);
          setPaymentMsg('');
        }
      }, 2000);
      return () => clearInterval(interval);
    }
    if (searchParams.get('payment') === 'cancelled') {
      setPaymentMsg('Payment was cancelled.');
      setTimeout(() => setPaymentMsg(''), 5000);
    }
  }, [searchParams, fetchData]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setNewQrSvg('');
    setNewQrCode(null);

    if (!destUrl.trim()) {
      setCreateError('Destination URL is required.');
      return;
    }

    try {
      new URL(destUrl);
    } catch {
      setCreateError('Please enter a valid URL (e.g., https://example.com).');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_url: destUrl, label: label || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Failed to create QR code.');
        return;
      }

      setNewQrSvg(data.svg);
      setNewQrCode(data.qr);
      setDestUrl('');
      setLabel('');
      await fetchData();
    } catch {
      setCreateError('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function handleCheckout(productType: string) {
    setCheckoutLoading(productType);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: productType }),
      });

      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch {
      // silently fail
    } finally {
      setCheckoutLoading('');
    }
  }

  function handleLogout() {
    document.cookie = 'pqr_token=; path=/; max-age=0';
    router.push('/');
  }

  async function downloadNewSvg() {
    if (!newQrSvg) return;
    const blob = new Blob([newQrSvg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${newQrCode?.short_code || 'code'}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadNewPng() {
    if (!newQrCode) return;
    try {
      const res = await fetch(`/api/qr/${newQrCode.id}/download?format=png`);
      if (!res.ok) return;
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${newQrCode.short_code}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-brand-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="font-heading text-xl font-bold">PermanentQR</a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-brand-border px-3 py-1.5 text-sm text-gray-400 hover:border-red-500 hover:text-red-400 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {paymentMsg && (
          <div className="mb-6 rounded-lg border border-brand-green/30 bg-brand-green/10 px-4 py-3 text-sm text-brand-green">
            {paymentMsg}
          </div>
        )}

        {/* Create Section */}
        <section className="rounded-xl border border-brand-border bg-brand-card p-6">
          <h2 className="font-heading text-xl">Create a new QR code</h2>
          {user && user.codes_remaining > 0 ? (
            <>
              <p className="mt-1 text-sm text-gray-400">
                You have {user.codes_remaining === 9999 ? 'unlimited' : user.codes_remaining} code{user.codes_remaining !== 1 ? 's' : ''} remaining.
              </p>
              <form onSubmit={handleCreate} className="mt-4 space-y-3">
                <input
                  type="url"
                  required
                  value={destUrl}
                  onChange={(e) => setDestUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-lg border border-brand-border bg-brand-dark px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-brand-green transition-colors"
                />
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Label (optional) — e.g., Business card, Menu, Flyer"
                  className="w-full rounded-lg border border-brand-border bg-brand-dark px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-brand-green transition-colors"
                />
                {createError && <p className="text-sm text-red-400">{createError}</p>}
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-brand-green px-6 py-3 font-bold text-black hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Permanent QR Code'}
                </button>
              </form>

              {newQrSvg && newQrCode && (
                <div className="mt-6 rounded-lg border border-brand-green/30 bg-brand-green/5 p-6">
                  <p className="mb-4 font-semibold text-brand-green">QR code created!</p>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div
                      className="rounded-lg bg-white p-3"
                      dangerouslySetInnerHTML={{ __html: newQrSvg }}
                      style={{ width: 180, height: 180 }}
                    />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-gray-400">
                        Short URL:{' '}
                        <span className="font-mono text-white">
                          {redirectDomain}/{newQrCode.short_code}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400">
                        Destination:{' '}
                        <span className="text-white">{newQrCode.destination_url}</span>
                      </p>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={downloadNewSvg}
                          className="rounded-lg border border-brand-border px-3 py-1.5 text-sm text-gray-300 hover:border-brand-green hover:text-white transition-colors"
                        >
                          Download SVG
                        </button>
                        <button
                          onClick={downloadNewPng}
                          className="rounded-lg border border-brand-border px-3 py-1.5 text-sm text-gray-300 hover:border-brand-green hover:text-white transition-colors"
                        >
                          Download PNG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4">
              <p className="text-gray-400">You have no codes remaining.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { type: 'single', label: 'Buy 1 — $9.99' },
                  { type: 'five_pack', label: 'Buy 5 — $29.99' },
                  { type: 'unlimited', label: 'Buy Unlimited — $99.99' },
                ].map((plan) => (
                  <button
                    key={plan.type}
                    onClick={() => handleCheckout(plan.type)}
                    disabled={checkoutLoading === plan.type}
                    className="rounded-lg bg-brand-green px-4 py-2 text-sm font-bold text-black hover:bg-green-400 transition-colors disabled:opacity-50"
                  >
                    {checkoutLoading === plan.type ? 'Redirecting...' : plan.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* QR Code List */}
        <section className="mt-8">
          <h2 className="font-heading text-xl">Your QR codes</h2>
          {codes.length === 0 ? (
            <p className="mt-4 text-gray-500">
              You haven&apos;t created any QR codes yet. Create your first one above.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className="rounded-xl border border-brand-border bg-brand-card p-4 hover:border-brand-green/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/${code.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-white">
                      <svg className="h-10 w-10 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{code.label || 'Untitled'}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-brand-green">
                        {redirectDomain}/{code.short_code}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {code.destination_url.length > 50
                          ? code.destination_url.slice(0, 50) + '...'
                          : code.destination_url}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {new Date(code.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
