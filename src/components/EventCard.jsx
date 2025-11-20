import React from 'react'

export default function EventCard({ event, onClick }) {
  const start = event?.upcoming_instances?.[0]?.start_time ? new Date(event.upcoming_instances[0].start_time) : null
  const price = event?.starting_price_cents
  return (
    <div onClick={onClick} className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
      <div className="aspect-video w-full bg-gradient-to-br from-slate-800 to-slate-900" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold truncate">{event.title}</h3>
          {price != null && <span className="text-sm text-white/70">From ${(price/100).toFixed(0)}</span>}
        </div>
        <p className="text-sm text-white/60 mt-1 truncate">{event.venue_name}</p>
        {start && <p className="text-xs text-white/50 mt-1">{start.toLocaleDateString()} • {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
      </div>
    </div>
  )
}
