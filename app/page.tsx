import {
  Header,
  Hero,
  Features,
  HowItWorks,
  Pricing,
  Testimonials,
  FAQ,
  CTA,
  Footer,
  PromoBanner,
  WhatsAppButton,
  StickyBottomCTA,
} from '@/components/landing';
import { Toaster } from 'react-hot-toast';

export const dynamic = 'force-static';

export default function LandingPage() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
      <PromoBanner />
      <Header />
      <main className="pt-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyBottomCTA />
    </>
  );
}
