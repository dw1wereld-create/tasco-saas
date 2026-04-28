import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, telefoon: true,
      bedrijfsnaam: true, kvkNummer: true, btwNummer: true,
      iban: true, adres: true, postcode: true, stad: true,
      uurtarief: true, btwTarief: true, belastingPct: true,
      plan: true,
    },
  })

  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json()

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: body.name || undefined,
      telefoon: body.telefoon || undefined,
      bedrijfsnaam: body.bedrijfsnaam || undefined,
      kvkNummer: body.kvkNummer || undefined,
      btwNummer: body.btwNummer || undefined,
      iban: body.iban || undefined,
      adres: body.adres || undefined,
      postcode: body.postcode || undefined,
      stad: body.stad || undefined,
      uurtarief: body.uurtarief ? parseFloat(body.uurtarief) : undefined,
      btwTarief: body.btwTarief ? parseFloat(body.btwTarief) : undefined,
      belastingPct: body.belastingPct ? parseFloat(body.belastingPct) : undefined,
    },
    select: { id: true, name: true, email: true, plan: true },
  })

  return NextResponse.json({ user })
}
