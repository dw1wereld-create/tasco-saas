'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, CheckCircle2, Clock, XCircle, Printer, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatEuro, formatDatum, formatDatumKort, cn } from '@/lib/utils'

interface Invoice {
  id: string
  factuurNummer: string
  datum: string
  vervalDatum: string
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  subtotaal: number
  btwBedrag: number
  totaal: number
  btwTarief: number
  notities: string | null
  betaaldOp: string | null
  client: {
    naam: string
    email: string | null
    adres: string | null
    postcode: string | null
    stad: string | null
    kvkNummer: string | null
    btwNummer: string | null
  }
  regels: { id: string; omschrijving: string; aantal: number; tarief: number; bedrag: number }[]
}

interface UserInfo {
  name: string
  bedrijfsnaam: string | null
  kvkNummer: string | null
  btwNummer: string | null
  iban: string | null
  adres: string | null
  postcode: string | null
  stad: string | null
  email: string
  telefoon: string | null
}

export default function FactuurDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingPaid, setMarkingPaid] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/invoices/${id}`).then(r => r.json()),
      fetch('/api/user/settings').then(r => r.json()),
    ]).then(([invData, userData]) => {
      setInvoice(invData.invoice)
      setUserInfo(userData)
      setLoading(false)
    })
  }, [id])

  const handleMarkPaid = async () => {
    setMarkingPaid(true)
    await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID', betaaldOp: new Date().toISOString() }),
    })
    setInvoice(prev => prev ? { ...prev, status: 'PAID', betaaldOp: new Date().toISOString() } : null)
    toast.success('Factuur als betaald gemarkeerd')
    setMarkingPaid(false)
  }

  const handleDownloadPDF = async () => {
    if (!invoice || !userInfo) return

    // Dynamic import to avoid SSR issues
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ format: 'a4', unit: 'mm' })
    const blauw = [108, 99, 255] as [number, number, number]
    const donker = [15, 15, 30] as [number, number, number]
    const grijs = [107, 107, 138] as [number, number, number]

    // Header
    doc.setFillColor(...blauw)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTUUR', 15, 20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(invoice.factuurNummer, 15, 30)
    doc.setFontSize(10)
    doc.text(formatDatumKort(invoice.datum), 150, 20)
    doc.text(`Vervaldatum: ${formatDatumKort(invoice.vervalDatum)}`, 150, 28)

    // Afzender
    doc.setTextColor(...donker)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(userInfo.bedrijfsnaam ?? userInfo.name, 15, 55)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...grijs)
    const afzenderRegels = [
      userInfo.adres ?? '',
      [userInfo.postcode, userInfo.stad].filter(Boolean).join(' '),
      userInfo.email,
      userInfo.kvkNummer ? `KvK: ${userInfo.kvkNummer}` : '',
      userInfo.btwNummer ? `BTW: ${userInfo.btwNummer}` : '',
      userInfo.iban ? `IBAN: ${userInfo.iban}` : '',
    ].filter(Boolean)
    afzenderRegels.forEach((r, i) => doc.text(r, 15, 62 + i * 5))

    // Ontvanger
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...donker)
    doc.text('Factuur aan', 120, 55)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...grijs)
    const ontvangerRegels = [
      invoice.client.naam,
      invoice.client.adres ?? '',
      [invoice.client.postcode, invoice.client.stad].filter(Boolean).join(' '),
      invoice.client.kvkNummer ? `KvK: ${invoice.client.kvkNummer}` : '',
      invoice.client.btwNummer ? `BTW: ${invoice.client.btwNummer}` : '',
    ].filter(Boolean)
    ontvangerRegels.forEach((r, i) => doc.text(r, 120, 62 + i * 5))

    // Horizontale lijn
    const yNaHeader = 55 + Math.max(afzenderRegels.length, ontvangerRegels.length) * 5 + 8
    doc.setDrawColor(232, 232, 245)
    doc.line(15, yNaHeader, 195, yNaHeader)

    // Regelstabel
    autoTable(doc, {
      startY: yNaHeader + 5,
      head: [['Omschrijving', 'Aantal', 'Tarief', 'Bedrag']],
      body: invoice.regels.map(r => [
        r.omschrijving,
        r.aantal.toString(),
        formatEuro(r.tarief),
        formatEuro(r.bedrag),
      ]),
      foot: [
        ['', '', 'Subtotaal', formatEuro(invoice.subtotaal)],
        ['', '', `BTW ${invoice.btwTarief}%`, formatEuro(invoice.btwBedrag)],
        ['', '', 'Totaal', formatEuro(invoice.totaal)],
      ],
      headStyles: { fillColor: blauw, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: donker },
      footStyles: { fontStyle: 'bold', fillColor: [240, 240, 255], textColor: donker, fontSize: 9 },
      columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    })

    const finalY = (doc as any).lastAutoTable.finalY + 10

    // Totaal box
    doc.setFillColor(...blauw)
    doc.roundedRect(130, finalY, 65, 18, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Totaal te betalen', 135, finalY + 7)
    doc.setFontSize(13)
    doc.text(formatEuro(invoice.totaal), 135, finalY + 14)

    // Betalingsinstructies
    if (userInfo.iban) {
      doc.setTextColor(...grijs)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Graag betalen voor ${formatDatumKort(invoice.vervalDatum)} op IBAN ${userInfo.iban}`, 15, finalY + 10)
      doc.text(`Onder vermelding van factuurnummer ${invoice.factuurNummer}`, 15, finalY + 16)
    }

    if (invoice.notities) {
      doc.setFontSize(8)
      doc.setTextColor(...grijs)
      doc.text(`Notities: ${invoice.notities}`, 15, finalY + 25)
    }

    // Footer
    doc.setFillColor(245, 244, 255)
    doc.rect(0, 280, 210, 17, 'F')
    doc.setTextColor(...grijs)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Gegenereerd door Tasco · ${formatDatumKort(new Date().toISOString())}`, 105, 290, { align: 'center' })

    doc.save(`${invoice.factuurNummer}.pdf`)
    toast.success('PDF gedownload')
  }

  const statusConfig = {
    PAID: { label: 'Betaald', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    OPEN: { label: 'Openstaand', cls: 'bg-blue-100 text-blue-700', icon: Clock },
    OVERDUE: { label: 'Te laat', cls: 'bg-red-100 text-red-700', icon: XCircle },
    DRAFT: { label: 'Concept', cls: 'bg-gray-100 text-gray-600', icon: Clock },
    CANCELLED: { label: 'Geannuleerd', cls: 'bg-gray-100 text-gray-500', icon: XCircle },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center">
        <p className="text-[#6B6B8A]">Factuur niet gevonden</p>
        <Link href="/facturen" className="text-brand-500 font-semibold mt-2 inline-block">← Terug</Link>
      </div>
    )
  }

  const status = statusConfig[invoice.status]
  const StatusIcon = status.icon

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/facturen" className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-[#E8E8F5] text-[#6B6B8A] hover:text-brand-500 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-[#0F0F1E]">{invoice.factuurNummer}</h1>
          <p className="text-sm text-[#9898B0]">{invoice.client.naam}</p>
        </div>
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold', status.cls)}>
          <StatusIcon size={13} /> {status.label}
        </span>
      </div>

      {/* Acties */}
      <div className="flex gap-2 mb-5">
        <button onClick={handleDownloadPDF} className="flex-1 flex items-center justify-center gap-2 btn-secondary text-sm py-3">
          <Download size={16} /> PDF downloaden
        </button>
        {(invoice.status === 'OPEN' || invoice.status === 'OVERDUE') && (
          <button onClick={handleMarkPaid} disabled={markingPaid} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors">
            {markingPaid
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><CheckCircle2 size={16} /> Als betaald markeren</>}
          </button>
        )}
      </div>

      {/* Factuur preview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        {/* Factuur header */}
        <div className="bg-gradient-to-r from-brand-500 to-blue-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">FACTUUR</p>
              <p className="text-2xl font-black mt-1">{invoice.factuurNummer}</p>
            </div>
            <div className="text-right text-sm text-white/80">
              <p>Datum: {formatDatum(invoice.datum)}</p>
              <p>Vervalt: {formatDatum(invoice.vervalDatum)}</p>
              {invoice.betaaldOp && <p className="text-emerald-300 font-semibold">Betaald: {formatDatum(invoice.betaaldOp)}</p>}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Partijen */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs text-[#9898B0] font-semibold uppercase tracking-wide mb-2">Van</p>
              <p className="font-bold text-[#0F0F1E]">{userInfo?.bedrijfsnaam ?? userInfo?.name}</p>
              {userInfo?.adres && <p className="text-sm text-[#6B6B8A]">{userInfo.adres}</p>}
              {userInfo?.stad && <p className="text-sm text-[#6B6B8A]">{[userInfo.postcode, userInfo.stad].filter(Boolean).join(' ')}</p>}
              {userInfo?.kvkNummer && <p className="text-xs text-[#9898B0] mt-1">KvK: {userInfo.kvkNummer}</p>}
              {userInfo?.btwNummer && <p className="text-xs text-[#9898B0]">BTW: {userInfo.btwNummer}</p>}
            </div>
            <div>
              <p className="text-xs text-[#9898B0] font-semibold uppercase tracking-wide mb-2">Aan</p>
              <p className="font-bold text-[#0F0F1E]">{invoice.client.naam}</p>
              {invoice.client.adres && <p className="text-sm text-[#6B6B8A]">{invoice.client.adres}</p>}
              {invoice.client.stad && <p className="text-sm text-[#6B6B8A]">{[invoice.client.postcode, invoice.client.stad].filter(Boolean).join(' ')}</p>}
              {invoice.client.btwNummer && <p className="text-xs text-[#9898B0] mt-1">BTW: {invoice.client.btwNummer}</p>}
            </div>
          </div>

          {/* Regelstabel */}
          <div className="mb-6">
            <div className="grid grid-cols-12 gap-2 text-xs text-[#9898B0] font-semibold uppercase tracking-wide px-3 py-2 bg-[#F5F4FF] rounded-xl mb-2">
              <div className="col-span-6">Omschrijving</div>
              <div className="col-span-2 text-center">Aantal</div>
              <div className="col-span-2 text-right">Tarief</div>
              <div className="col-span-2 text-right">Bedrag</div>
            </div>
            {invoice.regels.map(regel => (
              <div key={regel.id} className="grid grid-cols-12 gap-2 px-3 py-3 border-b border-[#F0F0FF] last:border-0">
                <div className="col-span-6 text-sm text-[#0F0F1E]">{regel.omschrijving}</div>
                <div className="col-span-2 text-center text-sm text-[#6B6B8A]">{regel.aantal}</div>
                <div className="col-span-2 text-right text-sm text-[#6B6B8A]">{formatEuro(regel.tarief)}</div>
                <div className="col-span-2 text-right text-sm font-semibold text-[#0F0F1E]">{formatEuro(regel.bedrag)}</div>
              </div>
            ))}
          </div>

          {/* Totalen */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B8A]">Subtotaal</span>
              <span className="text-[#0F0F1E] font-semibold">{formatEuro(invoice.subtotaal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B8A]">BTW {invoice.btwTarief}%</span>
              <span className="text-[#0F0F1E] font-semibold">{formatEuro(invoice.btwBedrag)}</span>
            </div>
            <div className="flex justify-between text-base font-black pt-3 border-t-2 border-brand-200">
              <span className="text-[#0F0F1E]">Totaal</span>
              <span className="text-brand-500 text-xl">{formatEuro(invoice.totaal)}</span>
            </div>
          </div>

          {/* Betaalinstructie */}
          {userInfo?.iban && invoice.status !== 'PAID' && (
            <div className="p-3 bg-[#F5F4FF] rounded-xl text-sm text-[#6B6B8A]">
              <p className="font-semibold text-[#0F0F1E] mb-1">Betaalinstructie</p>
              <p>Betaal voor {formatDatum(invoice.vervalDatum)} op</p>
              <p className="font-mono font-semibold text-[#0F0F1E]">{userInfo.iban}</p>
              <p>o.v.v. {invoice.factuurNummer}</p>
            </div>
          )}

          {invoice.notities && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-800">
              <p className="font-semibold mb-1">Notities</p>
              <p>{invoice.notities}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
