import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Je bent Tasco Assistent — een vriendelijke, behulpzame AI-assistent ingebouwd in de Tasco app voor Nederlandse ZZP'ers en freelancers.

Tasco is een SaaS-platform dat helpt met:
- **Urenregistratie**: uren bijhouden per klant/project, inclusief uurtarief en omschrijving
- **Facturatie**: professionele PDF-facturen aanmaken en versturen, BTW-berekening, factuurstatus bijhouden (concept/openstaand/betaald/verlopen)
- **Bonnen & Uitgaven**: bonnen inscannen met AI-OCR, uitgaven categoriseren, BTW terugvordering bijhouden
- **Kilometerregistratie**: zakelijke ritten bijhouden, GPS-tracking, exporteren naar Excel/PDF, fiscale aftrek berekenen (€0,23/km)
- **Belasting**: BTW-kwartaaloverzicht, winst- en verliesrekening, inkomstenbelasting inzicht
- **Klanten & Projecten**: klantenbeheer, projecten koppelen aan klanten
- **Teamleden**: teamleden uitnodigen met eigen werkruimte (Premium)
- **Accountant-portaal**: accountant read-only toegang geven via beveiligde link (Premium)

Plannen:
- **Gratis**: urenregistratie, basis dashboard, max 3 klanten, max 2 projecten
- **Pro (€9,99/mnd jaarlijks)**: facturatie, OCR bonnen scannen, belastinginzicht, kilometerregistratie, PDF/Excel export, onbeperkte klanten en projecten, BTW-overzicht, cashflow grafieken
- **Premium (€19,99/mnd jaarlijks)**: alles van Pro + GPS ritregistratie, geavanceerde rapporten, teamleden beheer, accountant-portaal, prioriteit support, API-toegang

Richtlijnen:
- Antwoord altijd in het **Nederlands**
- Wees vriendelijk, behulpzaam en beknopt
- Geef concrete stappen bij how-to vragen
- Als je iets niet zeker weet, zeg dat eerlijk
- Verwijs naar de relevante paginanaam in Tasco (bijv. "Ga naar Facturatie in het menu")
- Voor Stripe/betalingsvragen: verwijs naar instellingen > abonnement`

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const plan = session.user.plan ?? 'FREE'
  if (plan !== 'PREMIUM') {
    return NextResponse.json({ error: 'Premium vereist' }, { status: 403 })
  }

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Geen berichten' }, { status: 400 })
  }

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
