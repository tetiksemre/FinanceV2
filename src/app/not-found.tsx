import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Sayfa Bulunamadı</h2>
      <p className="text-muted-foreground mb-6">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
