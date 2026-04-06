# PermanentQR

Dynamic QR code service where links never expire. Users pay once, get a QR code, change the destination URL anytime, and the redirect works forever. No subscriptions. No scan limits.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** PostgreSQL via Supabase
- **Edge Redirects:** Cloudflare Worker + KV (sub-10ms globally)
- **Payments:** Stripe Checkout (one-time payments)
- **QR Generation:** `qrcode` npm package (SVG + PNG)
- **Auth:** JWT (`jose`) + `bcryptjs`, httpOnly cookies
- **Styling:** Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project (free tier)
- Stripe account with products configured
- Cloudflare account with Workers + KV namespace

### Setup

1. **Clone and install:**

```bash
git clone https://github.com/jastijayakrishna/PermanentQR.git
cd PermanentQR
npm install
```

2. **Configure environment:**

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local` with your Supabase, Stripe, and Cloudflare credentials.

3. **Create database tables:**

Run in your Supabase SQL editor:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  stripe_customer_id TEXT UNIQUE,
  codes_remaining INTEGER DEFAULT 0
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  short_code TEXT UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);
CREATE UNIQUE INDEX idx_qr_short ON qr_codes(short_code);
CREATE INDEX idx_qr_user ON qr_codes(user_id);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  stripe_payment_id TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('single','five_pack','unlimited')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

4. **Configure Stripe:**

Create three one-time products in Stripe Dashboard:
- Single ($9.99) / 5-Pack ($29.99) / Unlimited ($99.99)
- Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Listen for `checkout.session.completed`

5. **Run locally:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy Cloudflare Worker

```bash
cd worker
npx wrangler deploy
```

Set the Worker route on your short domain (e.g., `pqr.link/*`).

## Project Structure

```
app/
├── page.tsx                    # Landing page + free static QR generator
├── login/page.tsx              # Login
├── register/page.tsx           # Register
├── dashboard/
│   ├── page.tsx                # QR code list + create
│   └── [id]/page.tsx           # View/edit single QR code
├── not-found-code/page.tsx     # Inactive QR code page
└── api/
    ├── auth/                   # Register + login
    ├── qr/                     # CRUD + download + static generator
    ├── payments/checkout/      # Stripe checkout session
    └── webhooks/stripe/        # Stripe webhook handler
lib/
├── supabase.ts                 # Database client
├── auth.ts                     # JWT + bcrypt + cookie helpers
├── qr.ts                       # QR code SVG/PNG generation
├── shortcode.ts                # Short code generation
├── kv.ts                       # Cloudflare KV write/delete
└── stripe.ts                   # Stripe client
worker/                         # Cloudflare Worker for redirects
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/qr` | Yes | List user's QR codes |
| POST | `/api/qr` | Yes | Create QR code |
| PATCH | `/api/qr/[id]` | Yes | Update destination URL |
| DELETE | `/api/qr/[id]` | Yes | Deactivate QR code |
| GET | `/api/qr/[id]/download` | Yes | Download SVG/PNG |
| POST | `/api/qr/static` | No | Generate free static QR |
| POST | `/api/payments/checkout` | Yes | Create Stripe checkout |
| POST | `/api/webhooks/stripe` | No* | Handle payment webhook |

*Verified via Stripe webhook signature.

## License

MIT
