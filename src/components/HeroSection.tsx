import { Leaf } from 'lucide-react'
import PageContainer from './PageContainer'

const HERO_BG =
  'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt=""
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/70 to-emerald-950/50"
          aria-hidden
        />
      </div>
      <PageContainer className="relative max-w-3xl py-16 md:py-24">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
            <Leaf className="h-4 w-4 text-accent-bright" aria-hidden />
            Farm-fresh &amp; local
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Fruit &amp; vegetables, delivered crisp.
          </h1>
          <p className="max-w-xl text-lg text-white/90">
            Shop seasonal produce with simple filters, honest pricing, and secure checkout with Razorpay. Your pantry
            starts here.
          </p>
        </div>
      </PageContainer>
    </section>
  )
}
