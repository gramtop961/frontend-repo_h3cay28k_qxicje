import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Hero from './components/Hero'
import EventCard from './components/EventCard'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function useAuth() {
  const [me, setMe] = useState(null)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(setMe).catch(()=>{})
  }, [])
  return { me }
}

function Header() {
  const { me } = useAuth()
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-white text-xl">Buzz</Link>
        <nav className="flex items-center gap-4 text-sm text-white/80">
          <Link to="/events" className="hover:text-white">Browse</Link>
          {me ? (
            <>
              <Link to="/me/tickets" className="hover:text-white">My Tickets</Link>
              <span className="text-white/60">Hi {me.name?.split(' ')[0]}</span>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-lg bg-white text-black font-medium">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

function HomePage() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    fetch(`${API_BASE}/api/events?city=Austin`).then(r=>r.json()).then(setEvents)
  }, [])
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <Hero />
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Trending in Austin</h2>
            <Link to="/events" className="text-sm text-white/60 hover:text-white">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {events.slice(0,6).map(ev => (
              <EventCard key={ev.id} event={ev} onClick={() => navigate(`/events/${ev.id}`)} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function EventsPage() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('city','Austin')
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    fetch(`${API_BASE}/api/events?`+params.toString()).then(r=>r.json()).then(setEvents)
  }, [search, category])
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search events" className="px-3 py-2 rounded-lg bg-white/10 border border-white/10" />
          <select value={category} onChange={e=>setCategory(e.target.value)} className="px-3 py-2 rounded-lg bg-white/10 border border-white/10">
            <option value="">All categories</option>
            {['music','comedy','nightlife','theatre','workshop'].map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {events.map(ev => (
            <EventCard key={ev.id} event={ev} onClick={() => navigate(`/events/${ev.id}`)} />
          ))}
        </div>
      </main>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('jane@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }) })
    if (!res.ok) { setError('Invalid credentials'); return }
    const data = await res.json()
    localStorage.setItem('token', data.access_token)
    navigate('/')
  }
  return (
    <div className="min-h-screen bg-neutral-950 text-white grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white/5 border border-white/10 p-6 space-y-3">
        <h1 className="text-xl font-semibold">Log in</h1>
        <input className="w-full px-3 py-2 rounded bg-white/10" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full px-3 py-2 rounded bg-white/10" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full py-2 rounded bg-white text-black font-medium">Sign in</button>
      </form>
    </div>
  )
}

function EventDetailsPage({ id }) {
  const [evt, setEvt] = useState(null)
  const [instanceId, setInstanceId] = useState('')
  const [ticketTypeId, setTicketTypeId] = useState('')
  const [qty, setQty] = useState(1)
  const navigate = useNavigate()
  useEffect(() => {
    fetch(`${API_BASE}/api/events/${id}`).then(r=>r.json()).then(d=>{
      setEvt(d)
      const firstInst = d.instances?.[0]
      setInstanceId(firstInst?.id || '')
      setTicketTypeId(firstInst?.ticket_types?.[0]?.id || '')
    })
  }, [id])
  if (!evt) return <div className="min-h-screen bg-neutral-950 text-white"><Header /><div className="p-8">Loading...</div></div>
  const inst = evt.instances?.find(i=>i.id===instanceId)
  const ttype = inst?.ticket_types?.find(t=>t.id===ticketTypeId)
  const addToCheckout = () => {
    const cart = [{ ticket_type_id: ticketTypeId, quantity: qty }]
    localStorage.setItem('cart', JSON.stringify(cart))
    navigate('/checkout')
  }
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="aspect-video rounded-xl bg-white/5 border border-white/10" />
          <h1 className="text-3xl font-bold">{evt.title}</h1>
          <p className="text-white/70">{evt.description}</p>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Upcoming dates</h3>
            <div className="space-y-2">
              {evt.instances?.map(i => (
                <button key={i.id} onClick={()=>setInstanceId(i.id)} className={`w-full text-left px-3 py-2 rounded border ${instanceId===i.id?'border-white/50 bg-white/10':'border-white/10'}`}>
                  {new Date(i.start_time).toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <aside className="md:col-span-1 space-y-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
            <h3 className="font-semibold">Select tickets</h3>
            <select value={ticketTypeId} onChange={e=>setTicketTypeId(e.target.value)} className="w-full px-3 py-2 rounded bg-white/10">
              {inst?.ticket_types?.map(t => (
                <option key={t.id} value={t.id}>{t.name} — ${(t.price_cents/100).toFixed(2)} • {t.remaining_capacity} left</option>
              ))}
            </select>
            <input type="number" min={1} max={10} value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-full px-3 py-2 rounded bg-white/10" />
            <button onClick={addToCheckout} className="w-full py-2 rounded bg-white text-black font-medium">Add to checkout</button>
          </div>
          {ttype && <p className="text-sm text-white/70">You selected {qty} × {ttype.name}.</p>}
        </aside>
      </main>
    </div>
  )
}

function CheckoutPage() {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const [pricing, setPricing] = useState(null)
  const [loading, setLoading] = useState(false)
  const items = JSON.parse(localStorage.getItem('cart')||'[]')
  useEffect(() => {
    if (items.length===0) return
    fetch(`${API_BASE}/api/cart/price-check`, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ items }) })
      .then(r=>r.json()).then(setPricing)
  }, [])
  const pay = async () => {
    if (!token) { navigate('/login'); return }
    setLoading(true)
    const orderRes = await fetch(`${API_BASE}/api/orders`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ items, payment_provider: 'test' }) })
    if (!orderRes.ok) { setLoading(false); return }
    const order = await orderRes.json()
    await fetch(`${API_BASE}/api/orders/${order.id}/confirm`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({}) })
    localStorage.removeItem('cart')
    navigate('/me/tickets')
  }
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        {pricing ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p>Subtotal: ${(pricing.subtotal_cents/100).toFixed(2)}</p>
            <p>Service fee: ${(pricing.service_fee_cents/100).toFixed(2)}</p>
            <p className="font-semibold">Total: ${(pricing.total_cents/100).toFixed(2)}</p>
          </div>
        ) : <p>Loading...</p>}
        <button onClick={pay} disabled={loading} className="px-4 py-2 rounded bg-white text-black font-medium">Pay (test)</button>
      </main>
    </div>
  )
}

function TicketsPage() {
  const token = localStorage.getItem('token')
  const [tickets, setTickets] = useState([])
  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE}/api/tickets/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json()).then(setTickets)
  }, [])
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">My Tickets</h1>
        <div className="grid md:grid-cols-2 gap-4">
          {tickets.map(t => (
            <div key={t.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <h3 className="font-semibold">{t.event?.title}</h3>
              <p className="text-sm text-white/70">{t.venue?.name}</p>
              <p className="text-sm text-white/60">{t.ticket_type_name}</p>
              <p className="text-xs text-white/50">{t.instance?.start_time && new Date(t.instance.start_time).toLocaleString()}</p>
              <div className="mt-3 p-3 rounded bg-white text-black text-xs break-all">QR: {t.qr_code_data}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// Router wrapper so we can use hooks inside pages
function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailsWrapper />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/me/tickets" element={<TicketsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

function EventDetailsWrapper() {
  const id = window.location.pathname.split('/').pop()
  return <EventDetailsPage id={id} />
}

export default RouterApp
