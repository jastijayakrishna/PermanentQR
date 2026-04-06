'use client';

import { useState } from 'react';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-border bg-brand-dark/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="font-heading text-xl font-bold text-white">
          PermanentQR
        </a>
        <div className="flex items-center gap-6">
          <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Login
          </a>
          <a
            href="/register"
            className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="dot-pattern relative pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1 className="font-heading text-5xl leading-tight md:text-7xl md:leading-tight">
          Your link. <span className="text-brand-green">Permanent.</span> Period.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 md:text-xl">
          Other QR generators hold your printed materials hostage with expiring links and surprise
          subscriptions. We don&apos;t. Pay once. Your QR code works forever. Change your destination
          URL anytime.
        </p>
        <a
          href="/register"
          className="mt-8 inline-block rounded-lg bg-brand-green px-8 py-4 text-lg font-bold text-black hover:bg-green-400 transition-colors"
        >
          Create Your Permanent QR Code &mdash; $9.99
        </a>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <span>No subscription</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>No scan limits</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>No ads</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>No expiration</span>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const cards = [
    'Printed 500 business cards. QR code stopped working. Had to pay $180/year just to reactivate it.',
    'Free QR generator worked for 2 weeks. Then they killed the link and demanded a subscription.',
    'Changed our event URL after printing invitations. Static QR code couldn\'t be updated. Reprinted everything.',
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-heading text-center text-3xl md:text-4xl">Sound familiar?</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((text, i) => (
            <div
              key={i}
              className="rounded-xl border border-brand-border bg-brand-card p-6 text-gray-400"
            >
              <p className="italic">&ldquo;{text}&rdquo;</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-gray-500">
          We built PermanentQR because this happened to us too.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Pay once',
      desc: 'Choose your plan. One-time payment. Done.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      title: 'Create your QR code',
      desc: 'Enter your destination URL. We generate a permanent QR code.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Print it anywhere',
      desc: 'Business cards, flyers, packaging, menus. It works forever.',
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: 'Change anytime',
      desc: 'Update your destination URL whenever you want. Same QR code. No reprinting.',
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-heading text-center text-3xl md:text-4xl">How it works</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-border bg-brand-card text-brand-green">
                {step.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: 'Single',
      price: '$9.99',
      badge: null,
      features: ['1 QR code', 'Unlimited scans', 'Change URL anytime', 'SVG + PNG download'],
    },
    {
      name: '5-Pack',
      price: '$29.99',
      badge: 'MOST POPULAR',
      features: ['5 QR codes', 'Everything in Single', 'Best for small businesses'],
    },
    {
      name: 'Unlimited',
      price: '$99.99',
      badge: null,
      features: ['Unlimited QR codes', 'Everything in 5-Pack', 'API access (coming soon)', 'For agencies & developers'],
    },
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-heading text-center text-3xl md:text-4xl">Simple, honest pricing</h2>
        <p className="mt-4 text-center text-gray-400">Pay once. No subscriptions. No surprises.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative rounded-xl border p-8 transition-all hover:border-brand-green/50 hover:shadow-[0_0_30px_rgba(0,200,83,0.08)] ${
                plan.badge
                  ? 'border-brand-green/30 bg-brand-card'
                  : 'border-brand-border bg-brand-card'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-green px-3 py-1 text-xs font-bold text-black">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="font-heading text-4xl">{plan.price}</span>
                <span className="ml-1 text-sm text-gray-400">one-time</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/register"
                className="mt-8 block rounded-lg bg-brand-green py-3 text-center text-sm font-bold text-black hover:bg-green-400 transition-colors"
              >
                Get {plan.name}
              </a>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          Competitors charge $180/year. We charge $9.99 once.
        </p>
      </div>
    </section>
  );
}

function FreeGenerator() {
  const [url, setUrl] = useState('');
  const [svgHtml, setSvgHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setError('');
    setSvgHtml('');

    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/qr/static', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate QR code.');
        return;
      }
      setSvgHtml(data.svg);
    } catch {
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function downloadSvg() {
    const blob = new Blob([svgHtml], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'qr-code.svg';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadPng() {
    try {
      const res = await fetch('/api/qr/static', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format: 'png' }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qr-code.png';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError('Failed to download PNG.');
    }
  }

  return (
    <section id="free-tool" className="py-20">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="font-heading text-center text-3xl md:text-4xl">
          Free Static QR Generator
        </h2>
        <p className="mt-4 text-center text-gray-400">
          Need a quick static QR code? Free. No account needed.
        </p>
        <div className="mt-8 rounded-xl border border-brand-border bg-brand-card p-6">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="flex-1 rounded-lg border border-brand-border bg-brand-dark px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-brand-green transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-lg bg-brand-green px-6 py-3 font-semibold text-black hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          {svgHtml && (
            <div className="mt-6 flex flex-col items-center">
              <div
                className="rounded-lg bg-white p-4"
                dangerouslySetInnerHTML={{ __html: svgHtml }}
                style={{ width: 200, height: 200 }}
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={downloadSvg}
                  className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-gray-300 hover:border-brand-green hover:text-white transition-colors"
                >
                  Download SVG
                </button>
                <button
                  onClick={downloadPng}
                  className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-gray-300 hover:border-brand-green hover:text-white transition-colors"
                >
                  Download PNG
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-gray-600">
          This is a static QR code &mdash; the URL is baked in and can&apos;t be changed later. For
          editable links, get a Permanent Dynamic QR code above.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: 'What does "permanent" actually mean?',
      a: 'Your QR code redirects to your URL as long as PermanentQR exists. If we ever shut down, we give 90 days notice, export all your data, and open-source the redirect code so you can self-host.',
    },
    {
      q: 'Why no subscription?',
      a: 'Because a URL redirect costs us fractions of a cent. Charging you $15/month for it would be dishonest.',
    },
    {
      q: 'Can I change my destination URL?',
      a: "Yes, unlimited times, forever. That's the whole point.",
    },
    {
      q: 'What if I need more codes later?',
      a: 'Just buy another pack. Your existing codes keep working.',
    },
    {
      q: 'Is there an API?',
      a: 'Coming soon on the Unlimited plan.',
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-heading text-center text-3xl md:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-12 space-y-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-brand-border bg-brand-card"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-medium">{item.q}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                    open === i ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm text-gray-400">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-brand-border py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-gray-500">
        <span>PermanentQR &copy; {new Date().getFullYear()}</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="mailto:hello@permanentqr.com" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <Pricing />
        <FreeGenerator />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
