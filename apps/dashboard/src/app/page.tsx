import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { Faq } from '@/components/landing/Faq'
import { CTA } from '@/components/landing/CTA'
import { SchemaJsonLd } from '@/components/SchemaJsonLd'
import { TopicLinks } from '@/components/landing/TopicLinks'

export default function Home() {
  return (
    <>
      <SchemaJsonLd />
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Pricing />
        <TopicLinks />
        <Faq />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
