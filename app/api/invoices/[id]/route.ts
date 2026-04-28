import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      client: true,
      regels: true,
    },
  })

  if (!invoice) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  return NextResponse.json({ invoice })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json()
  const invoice = await prisma.invoice.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.betaaldOp && { betaaldOp: new Date(body.betaaldOp) }),
      ...(body.notities !== undefined && { notities: body.notities }),
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  await prisma.invoice.deleteMany({ where: { id: params.id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
