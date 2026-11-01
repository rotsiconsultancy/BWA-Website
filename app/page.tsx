import Hero from "@/components/home/Hero";
import DiscoverySection from "@/components/home/DiscoverySection";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import StorySection from "@/components/home/StorySection";
import BWADifference from "@/components/home/BWADifference";
import SocialProof from "@/components/home/SocialProof";
import FinalCTA from "@/components/home/FinalCTA";
import type { Metadata } from "next";

// Title and description come from the root layout.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero />
      <DiscoverySection />
      <FeaturedCollections />
      <StorySection />
      <BWADifference />
      <SocialProof />
      <FinalCTA />
    </>
  );
}
