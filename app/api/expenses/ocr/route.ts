import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasAccess } from '@/lib/subscription'
import { Plan } from '@prisma/client'
import { getTodayISO } from '@/lib/utils'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  if (!hasAccess(session.user.plan as Plan, 'bonnen_ocr')) {
    return NextResponse.json({ error: 'Pro feature vereist' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand ontvangen' }, { status: 400 })
    }

    // Google Vision API OCR
    const apiKey = process.env.GOOGLE_VISION_API_KEY
    if (!apiKey) {
      // Fallback: return empty result when no API key configured
      return NextResponse.json({
        result: { bedrag: null, datum: getTodayISO(), leverancier: null, categorie: 'OVERIG', btw: null, url: null },
        message: 'GOOGLE_VISION_API_KEY niet geconfigureerd — vul handmatig in',
      })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          }],
        }),
      }
    )

    const visionData = await visionRes.json()
    const tekst = visionData.responses?.[0]?.fullTextAnnotation?.text ?? ''

    // Eenvoudige extractie via regex
    const bedragMatch = tekst.match(/(?:totaal|total|€|EUR)\s*:?\s*([\d.,]+)/i)
    const bedrag = bedragMatch ? parseFloat(bedragMatch[1].replace(',', '.')) : null

    const datumMatch = tekst.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/)
    let datum = getTodayISO()
    if (datumMatch) {
      try {
        const parts = datumMatch[1].split(/[-\/]/)
        if (parts[2].length === 2) parts[2] = `20${parts[2]}`
        datum = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      } catch {}
    }

    const btwMatch = tekst.match(/(?:btw|vat|tax)\s*:?\s*([\d.,]+)/i)
    const btw = btwMatch ? parseFloat(btwMatch[1].replace(',', '.')) : null

    // Leverancier: eerste regel van de tekst
    const eersteRegel = tekst.split('\n')[0]?.trim() ?? null

    // Categorie gissen op basis van trefwoorden
    const tekstLower = tekst.toLowerCase()
    let categorie = 'OVERIG'
    if (/albert heijn|jumbo|lidl|aldi|supermarkt/.test(tekstLower)) categorie = 'ETEN_DRINKEN'
    else if (/ns|trein|taxi|uber|ov-chipkaart|brandstof|shell|bp/.test(tekstLower)) categorie = 'REIZEN'
    else if (/amazon|coolblue|mediamarkt|laptop|monitor|toetsenbord/.test(tekstLower)) categorie = 'HARDWARE'
    else if (/adobe|microsoft|github|slack|notion|saas|software/.test(tekstLower)) categorie = 'SOFTWARE'
    else if (/kpn|t-mobile|vodafone|telecom/.test(tekstLower)) categorie = 'TELEFOON'
    else if (/staples|gamma|blokker|kantoor/.test(tekstLower)) categorie = 'KANTOOR'
    else if (/facebook|google|meta|linkedin|advertentie/.test(tekstLower)) categorie = 'MARKETING'

    return NextResponse.json({
      result: { bedrag, datum, leverancier: eersteRegel, categorie, btw, url: null },
    })
  } catch (err) {
    console.error('OCR fout:', err)
    return NextResponse.json({ error: 'OCR verwerking mislukt' }, { status: 500 })
  }
}
