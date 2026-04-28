import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  datum: z.string(),
  uren: z.number().positive().max(24),
  omschrijving: z.string().optional(),
  declarabel: z.boolean().default(true),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const declarabelOnly = searchParams.get('declarabel') === '1'

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: session.user.id,
      ...(declarabelOnly && { declarabel: true, gefactureerd: false }),
    },
    include: { client: { select: { naam: true } }, project: { select: { naam: true } } },
    orderBy: { datum: 'desc' },
  })

  return NextResponse.json({ entries })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const entry = await prisma.timeEntry.create({
      data: {
        userId: session.user.id,
        datum: new Date(data.datum),
        uren: data.uren,
        omschrijving: data.omschrijving,
        declarabel: data.declarabel,
        clientId: data.clientId || null,
        projectId: data.projectId || null,
      },
      include: { client: { select: { naam: true } }, project: { select: { naam: true } } },
    })

    return NextResponse.json({ entry })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID vereist' }, { status: 400 })

  await prisma.timeEntry.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
