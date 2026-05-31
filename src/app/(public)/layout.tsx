import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import BackToTop from '@/components/ui/back-to-top';
import CompareBar from '@/components/properties/compare-bar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <BackToTop />
      <CompareBar />
    </>
  );
}
