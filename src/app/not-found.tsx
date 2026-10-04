import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF6EE] px-4">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-amber-200/60 shadow-xl">
        <div className="text-5xl">🪔</div>
        <h2 className="text-2xl font-serif font-black text-gray-900">Page Not Found</h2>
        <p className="text-sm text-gray-600">
          The pandal page or destination you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-sindoor-600 to-marigold-500 text-white font-bold text-sm shadow-md hover:brightness-110 transition-all"
        >
          Return to Puja Home
        </Link>
      </div>
    </div>
  );
}
