export default function NotFoundCodePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-brand-border bg-brand-card">
          <svg className="h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="font-heading text-3xl">This QR code is not active</h1>
        <p className="mt-4 text-gray-400">
          It may have been deleted by its owner, or it may not exist.
        </p>
        <p className="mt-2 text-gray-500">
          If you think this is an error, contact the person who shared this code.
        </p>
        <a
          href="/"
          className="mt-8 inline-block rounded-lg bg-brand-green px-6 py-3 font-bold text-black hover:bg-green-400 transition-colors"
        >
          Need a permanent QR code? Visit PermanentQR
        </a>
      </div>
    </div>
  );
}
