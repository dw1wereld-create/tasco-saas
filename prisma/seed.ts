import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Database seeden...')

  const hashed = await bcrypt.hash('wachtwoord123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@tasco.nl' },
    update: {},
    create: {
      email: 'demo@tasco.nl',
      name: 'Jan de Vries',
      password: hashed,
      bedrijfsnaam: 'Jan de Vries Consultancy',
      kvkNummer: '12345678',
      btwNummer: 'NL123456789B01',
      iban: 'NL91 ABNA 0417 1643 00',
      adres: 'Herengracht 182',
      postcode: '1016 BR',
      stad: 'Amsterdam',
      uurtarief: 95,
      btwTarief: 21,
      belastingPct: 30,
      plan: 'PRO',
    },
  })

  // Klanten
  const klant1 = await prisma.client.upsert({
    where: { id: 'seed-klant-1' },
    update: {},
    create: {
      id: 'seed-klant-1',
      userId: user.id,
      naam: 'Acme B.V.',
      email: 'inkoop@acme.nl',
      telefoon: '020-1234567',
      adres: 'Amstelplein 1',
      postcode: '1096 HA',
      stad: 'Amsterdam',
      kvkNummer: '87654321',
      btwNummer: 'NL987654321B01',
    },
  })

  const klant2 = await prisma.client.upsert({
    where: { id: 'seed-klant-2' },
    update: {},
    create: {
      id: 'seed-klant-2',
      userId: user.id,
      naam: 'TechStart Rotterdam',
      email: 'finance@techstart.nl',
      stad: 'Rotterdam',
    },
  })

  // Uren (laatste 3 maanden)
  const nu = new Date()
  for (let i = 0; i < 60; i++) {
    const datum = new Date(nu)
    datum.setDate(datum.getDate() - i)
    if (datum.getDay() === 0 || datum.getDay() === 6) continue

    await prisma.timeEntry.create({
      data: {
        userId: user.id,
        clientId: i % 3 === 0 ? klant2.id : klant1.id,
        datum,
        uren: 6 + Math.random() * 3,
        omschrijving: i % 2 === 0 ? 'Ontwikkeling klantportaal' : 'Consultancy & advies',
        declarabel: i % 5 !== 0,
      },
    })
  }

  // Facturen
  const factuur1 = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: klant1.id,
      factuurNummer: `F${nu.getFullYear()}-0001`,
      datum: new Date(nu.getFullYear(), nu.getMonth() - 1, 1),
      vervalDatum: new Date(nu.getFullYear(), nu.getMonth(), 1),
      status: 'PAID',
      subtotaal: 4750,
      btwBedrag: 997.50,
      totaal: 5747.50,
      btwTarief: 21,
      betaaldOp: new Date(nu.getFullYear(), nu.getMonth() - 1, 20),
      regels: {
        create: [{ omschrijving: 'Consultancy werkzaamheden (50 uur)', aantal: 50, tarief: 95, bedrag: 4750 }],
      },
    },
  })

  await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: klant2.id,
      factuurNummer: `F${nu.getFullYear()}-0002`,
      datum: new Date(nu.getFullYear(), nu.getMonth(), 1),
      vervalDatum: new Date(nu.getFullYear(), nu.getMonth() + 1, 1),
      status: 'OPEN',
      subtotaal: 2850,
      btwBedrag: 598.50,
      totaal: 3448.50,
      btwTarief: 21,
      regels: {
        create: [{ omschrijving: 'Ontwikkeling MVP (30 uur)', aantal: 30, tarief: 95, bedrag: 2850 }],
      },
    },
  })

  // Bonnen
  const bonCategorieen = ['SOFTWARE', 'KANTOOR', 'REIZEN', 'TELEFOON'] as const
  for (let i = 0; i < 12; i++) {
    const datum = new Date(nu)
    datum.setDate(datum.getDate() - i * 7)
    const bedrag = 10 + Math.random() * 200
    await prisma.expense.create({
      data: {
        userId: user.id,
        datum,
        bedrag: Math.round(bedrag * 100) / 100,
        btw: Math.round(bedrag * 0.21 * 100) / 100,
        categorie: bonCategorieen[i % bonCategorieen.length],
        omschrijving: ['Adobe CC abonnement', 'Kantoorbenodigdheden', 'Treinticket klantbezoek', 'KPN zakelijk'][i % 4],
        leverancier: ['Adobe', 'Staples', 'NS', 'KPN'][i % 4],
      },
    })
  }

  // Ritten
  for (let i = 0; i < 8; i++) {
    const datum = new Date(nu)
    datum.setDate(datum.getDate() - i * 5)
    await prisma.trip.create({
      data: {
        userId: user.id,
        clientId: klant1.id,
        datum,
        van: 'Amsterdam',
        naar: 'Utrecht',
        kilometers: 40 + Math.random() * 30,
        doel: 'Klantbezoek',
        zakelijkPct: 100,
      },
    })
  }

  console.log('✅ Demo data aangemaakt!')
  console.log('📧 Login: demo@tasco.nl')
  console.log('🔑 Wachtwoord: wachtwoord123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
