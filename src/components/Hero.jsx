import React from 'react'
import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative min-h-[60vh] w-full overflow-hidden rounded-2xl border border-white/5 bg-black/60">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/zks9uYILDPSX-UX6/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 pointer-events-none flex h-full w-full flex-col items-center justify-center text-center p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow">Buzz</h1>
        <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl">Find something great to do this weekend in Austin. Concerts, comedy, nightlife, workshops and more.</p>
      </div>
    </section>
  )
}
