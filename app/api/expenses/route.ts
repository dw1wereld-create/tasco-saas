import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ExpenseCategory } from '@prisma/client'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    include: { client: { select: { naam: true } } },
    orderBy: { datum: 'desc' },
  })

  return NextResponse.json({ expenses })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json()

  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      datum: new Date(body.datum),
      bedrag: body.bedrag,
      btw: body.btw ?? 0,
      categorie: (body.categorie as ExpenseCategory) ?? 'OVERIG',
      omschrijving: body.omschrijving || null,
      leverancier: body.leverancier || null,
      bonUrl: body.bonUrl || null,
      clientId: body.clientId || null,
      projectId: body.projectId || null,
    },
    include: { client: { select: { naam: true } } },
  })

  return NextResponse.json({ expense })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  await prisma.expense.deleteMany({ where: { id: id!, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
