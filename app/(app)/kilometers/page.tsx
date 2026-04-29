'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Car, Trash2, Download, MapPin, Navigation, Square, Satellite } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatEuro, formatDatum, getTodayISO, cn } from '@/lib/utils'

interface Trip {
  id: string
  datum: string
  van: string
  naar: string
  kilometers: number
  doel: string | null
  zakelijkPct: number
  gpsTracked: boolean
  client?: { naam: string } | null
}

type GpsState = 'idle' | 'starting' | 'tracking' | 'stopped'

interface Waypoint { lat: number; lng: number; ts: number }

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function totalDistance(wps: Waypoint[]) {
  let km = 0
  for (let i = 1; i < wps.length; i++) km += haversine(wps[i - 1].lat, wps[i - 1].lng, wps[i].lat, wps[i].lng)
  return km
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: { 'Accept-Language': 'nl' },
    })
    const d = await res.json()
    return d.address?.city || d.address?.town || d.address?.village || d.address?.municipality || `${lat.toFixed(3)}, ${lng.toFixed(3)}`
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`
  }
}

const GPS_STORAGE_KEY = 'tasco_gps_trip'

export default function KilometersPage() {
  const { data: session } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    datum: getTodayISO(), van: '', naar: '', kilometers: '',
    doel: '', zakelijkPct: 100, clientId: '',
    gpsTracked: false, startLat: null as number | null, startLng: null as number | null,
    endLat: null as number | null, endLng: null as number | null,
  })
  const [clients, setClients] = useState<{ id: string; naam: string }[]>([])

  const [gpsState, setGpsState] = useState<GpsState>('idle')
  const [gpsKm, setGpsKm] = useState(0)
  const waypointsRef = useRef<Waypoint[]>([])
  const watchIdRef = useRef<number | null>(null)
  const startCoordRef = useRef<{ lat: number; lng: number } | null>(null)

  const isPremium = session?.user?.plan === 'PREMIUM'
  const isPro = session?.user?.plan === 'PRO' || isPremium

  // Restore in-progress GPS trip from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(GPS_STORAGE_KEY)
    if (stored) {
      try {
        const { waypoints } = JSON.parse(stored)
        if (waypoints?.length) {
          waypointsRef.current = waypoints
          setGpsKm(totalDistance(waypoints))
          setGpsState('tracking')
          startCoordRef.current = { lat: waypoints[0].lat, lng: waypoints[0].lng }
          resumeWatch()
        }
      } catch { localStorage.removeItem(GPS_STORAGE_KEY) }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const laadData = useCallback(async () => {
    const [t, c] = await Promise.all([
      fetch('/api/trips').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ])
    setTrips(t.trips ?? [])
    setClients(c.clients ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { laadData() }, [laadData])

  // Cleanup watcher on unmount
  useEffect(() => () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current) }, [])

  function resumeWatch() {
    if (!navigator.geolocation) return
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const wp: Waypoint = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() }
        waypointsRef.current = [...waypointsRef.current, wp]
        const km = totalDistance(waypointsRef.current)
        setGpsKm(km)
        localStorage.setItem(GPS_STORAGE_KEY, JSON.stringify({ waypoints: waypointsRef.current }))
      },
      () => toast.error('GPS locatie niet beschikbaar'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
  }

  const startGpsTrip = async () => {
    if (!navigator.geolocation) { toast.error('GPS niet beschikbaar op dit apparaat'); return }
    setGpsState('starting')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const start: Waypoint = { lat: pos.coords.latitude, lng: pos.coords.longitude, ts: Date.now() }
        waypointsRef.current = [start]
        startCoordRef.current = { lat: start.lat, lng: start.lng }
        setGpsKm(0)
        setGpsState('tracking')
        localStorage.setItem(GPS_STORAGE_KEY, JSON.stringify({ waypoints: [start] }))
        resumeWatch()
        toast.success('GPS rit gestart!')
      },
      () => { toast.error('Kan GPS locatie niet ophalen. Zorg dat locatie is ingeschakeld.'); setGpsState('idle') },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const stopGpsTrip = async () => {
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null }
    setGpsState('stopped')

    const wps = waypointsRef.current
    const km = Math.max(totalDistance(wps), 0.1)
    const start = wps[0]
    const end = wps[wps.length - 1]

    const [vanNaam, naarNaam] = await Promise.all([
      reverseGeocode(start.lat, start.lng),
      reverseGeocode(end.lat, end.lng),
    ])

    setForm(f => ({
      ...f,
      datum: getTodayISO(),
      van: vanNaam,
      naar: naarNaam,
      kilometers: km.toFixed(1),
      gpsTracked: true,
      startLat: start.lat,
      startLng: start.lng,
      endLat: end.lat,
      endLng: end.lng,
    }))
    setShowForm(true)
    localStorage.removeItem(GPS_STORAGE_KEY)
    waypointsRef.current = []
    setGpsState('idle')
    setGpsKm(0)
  }

  const cancelGpsTrip = () => {
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null }
    localStorage.removeItem(GPS_STORAGE_KEY)
    waypointsRef.current = []
    setGpsState('idle')
    setGpsKm(0)
    toast('Rit geannuleerd')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const km = parseFloat(form.kilometers)
    if (isNaN(km) || km <= 0) { toast.error('Voer geldige kilometers in'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kilometers: km }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTrips(prev => [data.trip, ...prev])
      toast.success('Rit opgeslagen!')
      setShowForm(false)
      setForm({ datum: getTodayISO(), van: '', naar: '', kilometers: '', doel: '', zakelijkPct: 100, clientId: '', gpsTracked: false, startLat: null, startLng: null, endLat: null, endLng: null })
    } catch {
      toast.error('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Rit verwijderen?')) return
    await fetch(`/api/trips?id=${id}`, { method: 'DELETE' })
    setTrips(prev => prev.filter(t => t.id !== id))
    toast.success('Verwijderd')
  }

  const jaar = new Date().getFullYear()
  const jaarTrips = trips.filter(t => new Date(t.datum).getFullYear() === jaar)
  const totaalKm = jaarTrips.reduce((s, t) => s + (t.kilometers * (t.zakelijkPct / 100)), 0)
  const kmAftrek = totaalKm * 0.23

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-[#0F0F1E]">Kilometerregistratie</h1>
          <p className="text-sm text-[#9898B0]">{jaar} · {jaarTrips.length} ritten</p>
        </div>
        <div className="flex gap-2">
          {isPro && (
            <button
              onClick={async () => {
                const res = await fetch('/api/trips/export')
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = `kilometers-${jaar}.csv`; a.click()
                toast.success('Export gedownload')
              }}
              className="btn-secondary py-2.5 px-3 text-sm flex items-center gap-1"
            >
              <Download size={15} />
            </button>
          )}
          <button onClick={() => setShowForm(true)} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-1.5">
            <Plus size={16} /> Rit
          </button>
        </div>
      </div>

      {/* Totalen */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card p-4 text-center">
          <Car size={20} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-2xl font-black text-[#0F0F1E]">{totaalKm.toFixed(0)}</p>
          <p className="text-xs text-[#9898B0]">Zakelijke km {jaar}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">{formatEuro(kmAftrek)}</p>
          <p className="text-xs text-[#9898B0]">Belastingaftrek (€ 0,23/km)</p>
        </div>
      </div>

      {/* GPS Rit tracker — PREMIUM */}
      {isPremium ? (
        <div className={cn(
          'rounded-2xl p-4 mb-4 border-2 transition-colors',
          gpsState === 'tracking' ? 'bg-emerald-50 border-emerald-300' : 'bg-[#F5F4FF] border-[#E0DFFF]'
        )}>
          {gpsState === 'idle' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Satellite size={18} className="text-[#6C63FF]" />
                <div>
                  <p className="text-sm font-semibold text-[#0F0F1E]">GPS Ritregistratie</p>
                  <p className="text-xs text-[#9898B0]">Automatisch kilometers meten via GPS</p>
                </div>
              </div>
              <button onClick={startGpsTrip} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                <Navigation size={15} /> Start rit
              </button>
            </div>
          )}

          {gpsState === 'starting' && (
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
              <p className="text-sm text-[#6B6B8A]">GPS signaal ophalen…</p>
            </div>
          )}

          {gpsState === 'tracking' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-60" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">Rit actief</p>
                  <p className="text-xl font-black text-[#0F0F1E]">{gpsKm.toFixed(2)} km</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={cancelGpsTrip} className="btn-secondary py-2 px-3 text-sm">
                  Annuleer
                </button>
                <button onClick={stopGpsTrip} className="py-2 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 transition-colors">
                  <Square size={14} fill="white" /> Stop
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl p-4 mb-4 bg-[#F5F4FF] border-2 border-dashed border-[#C8C5FF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite size={18} className="text-[#6C63FF] opacity-60" />
            <div>
              <p className="text-sm font-semibold text-[#0F0F1E]">GPS Ritregistratie</p>
              <p className="text-xs text-[#9898B0]">Automatisch kilometers meten via GPS</p>
            </div>
          </div>
          <Link href="/upgrade" className="text-xs font-bold text-[#6C63FF] bg-[#EEEEFF] px-3 py-1.5 rounded-lg hover:bg-[#E0DFFF] transition-colors">
            Premium
          </Link>
        </div>
      )}

      {/* Belastingdienst info */}
      <div className="card p-4 mb-4 bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-700 font-semibold mb-1">Belastingdienst vereisten</p>
        <p className="text-xs text-blue-600">
          Bewaar: datum, vertrekpunt, bestemming, kilometers en zakelijk doel.
          Tarief 2024: € 0,23 per zakelijke kilometer.
        </p>
      </div>

      {/* Formulier */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-5 mb-5 border-2 border-brand-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#0F0F1E]">Rit registreren</h2>
              {form.gpsTracked && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-semibold">
                  <MapPin size={11} /> GPS gemeten
                </span>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Datum</label>
                  <input type="date" value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="label">Kilometers</label>
                  <input type="number" step="0.1" min="0" value={form.kilometers} onChange={e => setForm({ ...form, kilometers: e.target.value })} className="input" placeholder="45.5" required autoFocus={!form.gpsTracked} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Van</label>
                  <input type="text" value={form.van} onChange={e => setForm({ ...form, van: e.target.value })} className="input" placeholder="Amsterdam" required />
                </div>
                <div>
                  <label className="label">Naar</label>
                  <input type="text" value={form.naar} onChange={e => setForm({ ...form, naar: e.target.value })} className="input" placeholder="Rotterdam" required />
                </div>
              </div>
              <div>
                <label className="label">Zakelijk doel</label>
                <input type="text" value={form.doel} onChange={e => setForm({ ...form, doel: e.target.value })} className="input" placeholder="Klantbezoek, vergadering, etc." />
              </div>
              <div>
                <label className="label">Zakelijk percentage</label>
                <div className="flex gap-2">
                  {[100, 75, 50].map(pct => (
                    <button key={pct} type="button" onClick={() => setForm({ ...form, zakelijkPct: pct })}
                      className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                        form.zakelijkPct === pct ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-[#E8E8F5] text-[#6B6B8A]")}>
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              {form.kilometers && !isNaN(parseFloat(form.kilometers)) && (
                <div className="p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 font-medium">
                  Belastingaftrek: {formatEuro(parseFloat(form.kilometers) * (form.zakelijkPct / 100) * 0.23)}
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowForm(false); setForm({ datum: getTodayISO(), van: '', naar: '', kilometers: '', doel: '', zakelijkPct: 100, clientId: '', gpsTracked: false, startLat: null, startLng: null, endLat: null, endLng: null }) }} className="btn-secondary flex-1">Annuleren</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Opslaan'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ritten lijst */}
      {loading ? (
        <div className="flex justify-center py-12"><span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : trips.length === 0 ? (
        <div className="card p-8 text-center">
          <Car size={40} className="mx-auto text-[#C0C0D0] mb-3" />
          <p className="font-semibold text-[#0F0F1E] mb-1">Geen ritten</p>
          <p className="text-sm text-[#9898B0]">Registreer je eerste zakelijke rit</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trips.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", trip.gpsTracked ? "bg-blue-50" : "bg-emerald-50")}>
                  {trip.gpsTracked ? <MapPin size={18} className="text-blue-600" /> : <Car size={18} className="text-emerald-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F0F1E]">{trip.van} → {trip.naar}</p>
                  <p className="text-xs text-[#9898B0]">
                    {formatDatum(trip.datum)} · {trip.kilometers} km
                    {trip.zakelijkPct < 100 && ` (${trip.zakelijkPct}% zakelijk)`}
                    {trip.gpsTracked && ' · GPS'}
                    {trip.doel && ` · ${trip.doel}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-emerald-600">
                  {formatEuro(trip.kilometers * (trip.zakelijkPct / 100) * 0.23)}
                </p>
                <button onClick={() => handleDelete(trip.id)} className="w-8 h-8 flex items-center justify-center text-[#9898B0] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
