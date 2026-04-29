import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  naam: z.string().min(2, 'Naam is te kort'),
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(8, 'Wachtwoord is te kort (min. 8 tekens)'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { naam, email, password } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Dit e-mailadres is al in gebruik' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name: naam, email, password: hashed },
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[register] error:', err)
    return NextResponse.json({ error: 'Er is iets mis gegaan' }, { status: 500 })
  }
}
