'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface QRCodeDetail {
  id: string;
  short_code: string;
  destination_url: string;
  label: string | null;
  created_at: string;
  updated_at: string;
}

export default function QRCodeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [qr, setQr] = useState<QRCodeDetail | null>(null);
  const [svgHtml, setSvgHtml] = useState('');
  const [loading, setLoading] = useState(true);

  const [destUrl, setDestUrl] = useState('');
  const [labelVal, setLabelVal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const redirectDomain = process.env.NEXT_PUBLIC_REDIRECT_DOMAIN || 'https://pqr.link';

  const fetchQR = useCallback(async () => {
    try {
      const res = await fetch(`/api/qr/${id}/download?format=svg`);
      if (res.ok) {
        const svg = await res.text();
        setSvgHtml(svg);
      }
    } catch {
      // silently fail svg fetch
    }
  }, [id]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/qr');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        const found = (data.codes || []).find((c: QRCodeDetail) => c.id === id);
        if (!found) {
          router.push('/dashboard');
          return;
        }
        setQr(found);
        setDestUrl(found.destination_url);
        setLabelVal(found.label || '');
      } catch {
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
    fetchQR();
  }, [id, router, fetchQR]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');
    setSaveMsg('');

    if (!destUrl.trim()) {
      setSaveError('Destination URL is required.');
      return;
    }

    try {
      new URL(destUrl);
    } catch {
      setSaveError('Please enter a valid URL.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/qr/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_url: destUrl, label: labelVal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.error || 'Failed to update.');
        return;
      }

      setQr(data.qr);
      setSaveMsg('Destination updated! Your QR code now points to the new URL.');
      setTimeout(() => setSaveMsg(''), 5000);
    } catch {
      setSaveError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/qr/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  }

  async function downloadSvg() {
    try {
      const res = await fetch(`/api/qr/${id}/download?format=svg`);
      if (!res.ok) return;
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${qr?.short_code || 'code'}.svg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // silently fail
    }
  }

  async function downloadPng() {
    try {
      const res = await fetch(`/api/qr/${id}/download?format=png&size=800`);
      if (!res.ok) return;
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${qr?.short_code || 'code'}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // silently fail
    }
  }

  function copyShortUrl() {
    if (!qr) return;
    navigator.clipboard.writeText(`${redirectDomain}/${qr.short_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!qr) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <a href="/" className="font-heading text-xl font-bold">PermanentQR</a>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; Back to dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-xl border border-brand-border bg-brand-card p-6">
          {/* QR Preview + Downloads */}
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3">
              {svgHtml ? (
                <div
                  className="rounded-lg bg-white p-3"
                  dangerouslySetInnerHTML={{ __html: svgHtml }}
                  style={{ width: 240, height: 240 }}
                />
              ) : (
                <div className="flex h-60 w-60 items-center justify-center rounded-lg bg-white">
                  <p className="text-gray-400">Loading...</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={downloadSvg}
                  className="rounded-lg border border-brand-border px-3 py-1.5 text-sm text-gray-300 hover:border-brand-green hover:text-white transition-colors"
                >
                  Download SVG
                </button>
                <button
                  onClick={downloadPng}
                  className="rounded-lg border border-brand-border px-3 py-1.5 text-sm text-gray-300 hover:border-brand-green hover:text-white transition-colors"
                >
                  Download PNG
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {/* Short URL */}
              <div>
                <label className="block text-sm text-gray-400">Short URL</label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded-lg border border-brand-border bg-brand-dark px-3 py-2 font-mono text-sm text-brand-green">
                    {redirectDomain}/{qr.short_code}
                  </code>
                  <button
                    onClick={copyShortUrl}
                    className="rounded-lg border border-brand-border px-3 py-2 text-sm text-gray-300 hover:border-brand-green hover:text-white transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Created date */}
              <div>
                <label className="block text-sm text-gray-400">Created</label>
                <p className="mt-1 text-sm">{new Date(qr.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave} className="mt-8 space-y-4 border-t border-brand-border pt-6">
            <div>
              <label htmlFor="dest" className="mb-1 block text-sm text-gray-400">
                Destination URL
              </label>
              <input
                id="dest"
                type="url"
                required
                value={destUrl}
                onChange={(e) => setDestUrl(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-brand-dark px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-brand-green transition-colors"
              />
            </div>
            <div>
              <label htmlFor="label" className="mb-1 block text-sm text-gray-400">
                Label
              </label>
              <input
                id="label"
                type="text"
                value={labelVal}
                onChange={(e) => setLabelVal(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-brand-dark px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-brand-green transition-colors"
                placeholder="e.g., Business card, Menu"
              />
            </div>
            {saveError && <p className="text-sm text-red-400">{saveError}</p>}
            {saveMsg && <p className="text-sm text-brand-green">{saveMsg}</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-green px-6 py-3 font-bold text-black hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>

          {/* Delete */}
          <div className="mt-8 border-t border-brand-border pt-6">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 hover:border-red-500 hover:text-red-300 transition-colors"
              >
                Delete this QR code
              </button>
            ) : (
              <div className="rounded-lg border border-red-900 bg-red-950/30 p-4">
                <p className="text-sm text-red-300">
                  Are you sure? This will permanently deactivate this QR code. Any printed materials
                  with this code will stop working.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Yes, delete it'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg border border-brand-border px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
