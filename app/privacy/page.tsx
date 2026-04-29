import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Privacybeleid van Tasco — hoe wij omgaan met jouw persoonsgegevens conform de AVG.',
}

const DATUM = '29 april 2026'
const BEDRIJF_JURIDISCH = 'Tasco B.V.'
const KVK = '87693607'
const ADRES = 'Maasstraat 6, 2991AD Barendrecht'
const EMAIL_PRIVACY = 'privacy@tasco.nl'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <div className="border-b border-[#E8E8F5] bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-[#6C63FF] rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-xl font-black text-[#0F0F1E]">Tasco</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#0F0F1E] mb-2">Privacybeleid</h1>
          <p className="text-[#6B6B8A] text-sm">Versie 1.0 — Datum: {DATUM}</p>
          <nav className="mt-6 flex flex-wrap gap-3 text-sm">
            <a href="#wie-zijn-wij" className="text-[#6C63FF] hover:underline">Wie zijn wij</a>
            <span className="text-[#C0C0D8]">·</span>
            <a href="#welke-gegevens" className="text-[#6C63FF] hover:underline">Welke gegevens</a>
            <span className="text-[#C0C0D8]">·</span>
            <a href="#grondslagen" className="text-[#6C63FF] hover:underline">Grondslagen</a>
            <span className="text-[#C0C0D8]">·</span>
            <a href="#derden" className="text-[#6C63FF] hover:underline">Derden</a>
            <span className="text-[#C0C0D8]">·</span>
            <a href="#bewaartermijnen" className="text-[#6C63FF] hover:underline">Bewaartermijnen</a>
            <span className="text-[#C0C0D8]">·</span>
            <a href="#rechten" className="text-[#6C63FF] hover:underline">Jouw rechten</a>
            <span className="text-[#C0C0D8]">·</span>
            <Link href="/voorwaarden" className="text-[#6C63FF] hover:underline">Voorwaarden & VOK</Link>
          </nav>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8F5] p-8 space-y-8">

          {/* Inleiding */}
          <div>
            <p className="text-[#3A3A5C] text-sm leading-relaxed">
              {BEDRIJF_JURIDISCH} ("<strong>Tasco</strong>", "wij", "ons") hecht grote waarde aan de bescherming van jouw persoonsgegevens.
              In dit privacybeleid leggen wij uit welke persoonsgegevens wij verwerken, voor welk doel, op welke grondslag, hoe lang wij ze bewaren en welke rechten jij als betrokkene hebt.
              Dit beleid is van toepassing op alle verwerkingen door Tasco in het kader van de Dienst en de website tasco.nl.
            </p>
          </div>

          <hr className="border-[#E8E8F5]" />

          {/* 1 */}
          <Section id="wie-zijn-wij" title="1. Wie zijn wij?">
            <p>Tasco is de verwerkingsverantwoordelijke voor de verwerking van jouw eigen persoonsgegevens (jouw accountgegevens, abonnementsgegevens, e.d.). Voor de persoonsgegevens van jouw klanten en contacten die jij in Tasco invoert, ben jíj de verwerkingsverantwoordelijke; Tasco treedt daarvoor op als verwerker. Zie onze <Link href="/voorwaarden#verwerkers" className="text-[#6C63FF] hover:underline">Verwerkersovereenkomst</Link> voor meer details.</p>
            <InfoBox>
              <p><strong>{BEDRIJF_JURIDISCH}</strong></p>
              <p>{ADRES}</p>
              <p>KvK-nummer: {KVK}</p>
              <p>E-mail: <a href={`mailto:${EMAIL_PRIVACY}`} className="text-[#6C63FF] hover:underline">{EMAIL_PRIVACY}</a></p>
            </InfoBox>
          </Section>

          {/* 2 */}
          <Section id="welke-gegevens" title="2. Welke persoonsgegevens verwerken wij?">
            <p>Wij verwerken de volgende categorieën persoonsgegevens van jou als Gebruiker:</p>

            <SubSection title="2.1 Accountgegevens">
              <ul className="list-disc list-inside space-y-1">
                <li>Naam en e-mailadres</li>
                <li>Wachtwoord (versleuteld opgeslagen)</li>
                <li>Bedrijfsnaam, KvK-nummer, btw-nummer</li>
                <li>Zakelijk adres</li>
                <li>IBAN (voor je eigen facturatie-instellingen)</li>
              </ul>
            </SubSection>

            <SubSection title="2.2 Gebruiks- en technische gegevens">
              <ul className="list-disc list-inside space-y-1">
                <li>IP-adres en apparaatinformatie</li>
                <li>Browsertype en besturingssysteem</li>
                <li>Inlogmomenten en sessieduur</li>
                <li>Functionaliteiten die je gebruikt (geanonimiseerde productanalytics)</li>
              </ul>
            </SubSection>

            <SubSection title="2.3 Betalingsgegevens">
              <ul className="list-disc list-inside space-y-1">
                <li>Abonnementstype en facturatiestatus</li>
                <li>Betalingshistorie</li>
                <li>Betaalgegevens worden verwerkt door Stripe; wij slaan geen volledige kaartgegevens op.</li>
              </ul>
            </SubSection>

            <SubSection title="2.4 Communicatiegegevens">
              <ul className="list-disc list-inside space-y-1">
                <li>E-mails die je naar ons stuurt</li>
                <li>Supportverzoeken</li>
              </ul>
            </SubSection>

            <SubSection title="2.5 Gegevens van jouw klanten (als verwerker)">
              <p>Naam, adres, e-mailadres, IBAN en andere gegevens die jij over jouw klanten invoert. Zie de Verwerkersovereenkomst. Wij verwerken deze gegevens uitsluitend in jouw opdracht.</p>
            </SubSection>
          </Section>

          {/* 3 */}
          <Section id="grondslagen" title="3. Doeleinden en grondslagen">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F5F4FF]">
                    <th className="text-left p-3 font-semibold text-[#0F0F1E] rounded-tl-lg">Doel</th>
                    <th className="text-left p-3 font-semibold text-[#0F0F1E] rounded-tr-lg">Grondslag (AVG art. 6)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Uitvoering van de overeenkomst (leveren van de Dienst)', 'Art. 6 lid 1 sub b — uitvoering overeenkomst'],
                    ['Authenticatie en accountbeveiliging', 'Art. 6 lid 1 sub b — uitvoering overeenkomst'],
                    ['Betalingsverwerking en facturatie', 'Art. 6 lid 1 sub b — uitvoering overeenkomst'],
                    ['Klantenservice en ondersteuning', 'Art. 6 lid 1 sub b — uitvoering overeenkomst'],
                    ['Nakoming fiscale en boekhoudkundige bewaarplichten', 'Art. 6 lid 1 sub c — wettelijke verplichting'],
                    ['Fraudepreventie en beveiliging', 'Art. 6 lid 1 sub f — gerechtvaardigd belang'],
                    ['Verbetering van de Dienst (geanonimiseerde analyses)', 'Art. 6 lid 1 sub f — gerechtvaardigd belang'],
                    ['Versturen van productnieuws en tips (opt-in)', 'Art. 6 lid 1 sub a — toestemming'],
                  ].map(([doel, grondslag], i) => (
                    <tr key={i} className="border-t border-[#E8E8F5]">
                      <td className="p-3 text-[#3A3A5C]">{doel}</td>
                      <td className="p-3 text-[#3A3A5C]">{grondslag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-[#6B6B8A]">Waar wij ons beroepen op een gerechtvaardigd belang, hebben wij een afweging gemaakt die op verzoek beschikbaar is.</p>
          </Section>

          {/* 4 */}
          <Section id="derden" title="4. Derden en doorgifte">
            <p>Wij delen jouw persoonsgegevens alleen met derden voor zover noodzakelijk voor de levering van de Dienst of wettelijk verplicht. Wij verkopen jouw gegevens nooit aan derden.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F5F4FF]">
                    <th className="text-left p-3 font-semibold text-[#0F0F1E] rounded-tl-lg">Partij</th>
                    <th className="text-left p-3 font-semibold text-[#0F0F1E]">Rol</th>
                    <th className="text-left p-3 font-semibold text-[#0F0F1E]">Doel</th>
                    <th className="text-left p-3 font-semibold text-[#0F0F1E] rounded-tr-lg">Locatie</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Supabase Inc.', 'Verwerker', 'Database en authenticatie', 'EU (Frankfurt)'],
                    ['Vercel Inc.', 'Verwerker', 'Hosting en serverinfrastructuur', 'VS / EU'],
                    ['Stripe Inc.', 'Verwerker', 'Betalingsverwerking', 'VS / EU'],
                    ['Belastingdienst / autoriteiten', 'Zelfstandig verantwoordelijke', 'Wettelijke verplichting', 'Nederland / EU'],
                  ].map(([partij, rol, doel, locatie], i) => (
                    <tr key={i} className="border-t border-[#E8E8F5]">
                      <td className="p-3 text-[#3A3A5C]">{partij}</td>
                      <td className="p-3 text-[#3A3A5C]">{rol}</td>
                      <td className="p-3 text-[#3A3A5C]">{doel}</td>
                      <td className="p-3 text-[#3A3A5C]">{locatie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4">Voor doorgifte buiten de EER (Vercel, Stripe) maken wij gebruik van door de Europese Commissie goedgekeurde standaardcontractbepalingen (SCC's). De verwerking door Supabase vindt uitsluitend plaats binnen de EU (regio eu-west-1, Frankfurt).</p>
          </Section>

          {/* 5 */}
          <Section id="bewaartermijnen" title="5. Bewaartermijnen">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F5F4FF]">
                    <th className="text-left p-3 font-semibold text-[#0F0F1E] rounded-tl-lg">Categorie</th>
                    <th className="text-left p-3 font-semibold text-[#0F0F1E] rounded-tr-lg">Bewaartermijn</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Accountgegevens', 'Duur van de overeenkomst + 30 dagen na opzegging'],
                    ['Facturen en financiële administratie', '7 jaar (fiscale bewaarplicht, art. 52 AWR)'],
                    ['Betalingsgegevens (via Stripe)', 'Conform Stripe-beleid (7 jaar)'],
                    ['Technische loggegevens', 'Maximaal 90 dagen'],
                    ['Communicatie (e-mail/support)', '2 jaar na afsluiting van het verzoek'],
                    ['Geanonimiseerde analysedata', 'Onbepaalde tijd (niet-identificeerbaar)'],
                  ].map(([cat, term], i) => (
                    <tr key={i} className="border-t border-[#E8E8F5]">
                      <td className="p-3 text-[#3A3A5C]">{cat}</td>
                      <td className="p-3 text-[#3A3A5C]">{term}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 6 */}
          <Section id="beveiliging" title="6. Beveiliging">
            <p>Wij beschermen jouw gegevens met passende technische en organisatorische maatregelen, waaronder:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Versleuteling van alle dataverkeer via TLS 1.2+</li>
              <li>Versleuteling van gegevens in rust (AES-256)</li>
              <li>Toegangscontrole op basis van minimale rechten (least privilege)</li>
              <li>Twee-factor-authenticatie voor interne systemen</li>
              <li>Regelmatige beveiligingsaudits</li>
              <li>Dagelijkse back-ups met versleutelde opslag</li>
            </ul>
            <p className="mt-3">Bij een datalek dat jou raakt, informeren wij jou binnen 36 uur en ondersteunen wij je bij de verplichte melding aan de Autoriteit Persoonsgegevens.</p>
          </Section>

          {/* 7 */}
          <Section id="cookies" title="7. Cookies en tracking">
            <p>Tasco gebruikt minimale cookies die strikt noodzakelijk zijn voor de werking van de Dienst:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Sessiecookies:</strong> voor authenticatie en het bijhouden van je inlogsessie (JWT). Geen toestemming vereist.</li>
              <li><strong>Voorkeurscookies:</strong> voor het onthouden van jouw instellingen (bijv. taalvoorkeur).</li>
            </ul>
            <p className="mt-3">Wij plaatsen geen tracking- of advertentiecookies van derden. Wij gebruiken geen Google Analytics of vergelijkbare diensten die persoonsgegevens doorgeven aan derden voor reclamedoeleinden.</p>
          </Section>

          {/* 8 */}
          <Section id="rechten" title="8. Jouw rechten als betrokkene">
            <p>Op basis van de AVG heb jij de volgende rechten ten aanzien van jouw persoonsgegevens:</p>
            <div className="mt-3 space-y-3">
              {[
                ['Recht op inzage (art. 15 AVG)', 'Je kunt opvragen welke persoonsgegevens wij van jou verwerken.'],
                ['Recht op rectificatie (art. 16 AVG)', 'Je kunt onjuiste of onvolledige gegevens laten corrigeren.'],
                ['Recht op verwijdering (art. 17 AVG)', 'Je kunt verzoeken jouw gegevens te verwijderen ("recht om vergeten te worden"), tenzij wettelijke bewaarplichten van toepassing zijn.'],
                ['Recht op beperking van verwerking (art. 18 AVG)', 'In bepaalde gevallen kun je vragen de verwerking tijdelijk te beperken.'],
                ['Recht op gegevensoverdraagbaarheid (art. 20 AVG)', 'Je kunt jouw gegevens opvragen in een machineleesbaar formaat (JSON/CSV) voor overdracht aan een andere aanbieder.'],
                ['Recht van bezwaar (art. 21 AVG)', 'Je kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang, waaronder direct marketing.'],
                ['Recht op intrekking van toestemming', 'Indien verwerking is gebaseerd op toestemming, kun je deze te allen tijde intrekken zonder dat dit afbreuk doet aan de rechtmatigheid van verwerking vóór de intrekking.'],
              ].map(([recht, uitleg]) => (
                <div key={recht} className="flex gap-3">
                  <div className="w-1 shrink-0 bg-[#6C63FF] rounded-full" />
                  <div>
                    <p className="font-semibold text-[#0F0F1E] text-sm">{recht}</p>
                    <p className="text-[#3A3A5C] text-sm mt-0.5">{uitleg}</p>
                  </div>
                </div>
              ))}
            </div>
            <InfoBox className="mt-4">
              <p>Dien een verzoek in via <a href={`mailto:${EMAIL_PRIVACY}`} className="text-[#6C63FF] hover:underline">{EMAIL_PRIVACY}</a>. Wij reageren binnen <strong>4 weken</strong>. Je kunt je identiteit worden gevraagd te verifiëren. De eerste twee verzoeken per jaar zijn kosteloos.</p>
            </InfoBox>
          </Section>

          {/* 9 */}
          <Section id="ap" title="9. Klacht indienen bij de toezichthouder">
            <p>Indien je van mening bent dat wij jouw persoonsgegevens niet conform de AVG verwerken, heb je het recht een klacht in te dienen bij de <strong>Autoriteit Persoonsgegevens</strong>:</p>
            <InfoBox>
              <p>Autoriteit Persoonsgegevens</p>
              <p>Postbus 93374, 2509 AJ Den Haag</p>
              <p>Telefoon: 088 - 1805 250</p>
              <p>Website: <span className="text-[#6C63FF]">autoriteitpersoonsgegevens.nl</span></p>
            </InfoBox>
            <p className="mt-3">Wij stellen het op prijs als je een eventuele klacht eerst bij ons neerlegt, zodat wij samen naar een oplossing kunnen zoeken.</p>
          </Section>

          {/* 10 */}
          <Section id="wijzigingen" title="10. Wijzigingen in dit privacybeleid">
            <p>Wij kunnen dit privacybeleid aanpassen. Bij wezenlijke wijzigingen informeren wij jou per e-mail en/of via een melding in de app, minimaal 30 dagen voor inwerkingtreding. De meest actuele versie is altijd beschikbaar op tasco.nl/privacy. De datum bovenaan dit document geeft de laatste herzieningsdatum aan.</p>
          </Section>

          {/* 11 */}
          <Section id="contact" title="11. Contact">
            <p>Voor vragen over dit privacybeleid of de verwerking van jouw persoonsgegevens kun je contact opnemen via:</p>
            <InfoBox>
              <p><strong>{BEDRIJF_JURIDISCH}</strong></p>
              <p>{ADRES}</p>
              <p>E-mail: <a href={`mailto:${EMAIL_PRIVACY}`} className="text-[#6C63FF] hover:underline">{EMAIL_PRIVACY}</a></p>
            </InfoBox>
          </Section>

        </div>

        <p className="text-center text-sm text-[#9898B0] mt-10">
          <Link href="/voorwaarden" className="text-[#6C63FF] hover:underline">Algemene Voorwaarden & Verwerkersovereenkomst</Link>
          {' '}·{' '}
          <a href={`mailto:${EMAIL_PRIVACY}`} className="text-[#6C63FF] hover:underline">{EMAIL_PRIVACY}</a>
        </p>
      </div>
    </div>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-base font-bold text-[#0F0F1E] mb-3">{title}</h2>
      <div className="text-[#3A3A5C] text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="font-semibold text-[#0F0F1E] mb-1">{title}</p>
      <div className="text-[#3A3A5C] text-sm">{children}</div>
    </div>
  )
}

function InfoBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#F5F4FF] border border-[#E8E8F5] rounded-xl p-4 text-sm text-[#3A3A5C] space-y-0.5 ${className}`}>
      {children}
    </div>
  )
}
