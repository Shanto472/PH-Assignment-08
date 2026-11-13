import { FeaturesSection } from "@/components/home/features-section";
import { GallerySection } from "@/components/home/gallery-section";
import { HeroBanner } from "@/components/home/hero-banner";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { RecentEventsSection } from "@/components/home/recent-events-section";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <FeaturesSection />
      <RecentEventsSection />
      <GallerySection />
      <NewsletterSection />
    </>
  );
}
