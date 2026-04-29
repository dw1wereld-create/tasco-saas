import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden & Verwerkersovereenkomst',
  description: 'Algemene voorwaarden en verwerkersovereenkomst van Tasco voor Nederlandse zzp\'ers.',
}

const DATUM = '29 april 2026'
const BEDRIJF = 'Tasco'
const BEDRIJF_JURIDISCH = 'Tasco B.V.'
const KVK = '87693607'
const ADRES = 'Maasstraat 6, 2991AD Barendrecht'
const EMAIL = 'juridisch@tasco.nl'

export default function VoorwaardenPage() {
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
          <h1 className="text-3xl font-black text-[#0F0F1E] mb-2">Algemene Voorwaarden</h1>
          <p className="text-[#6B6B8A] text-sm">Versie 1.0 — Datum: {DATUM}</p>
          <nav className="mt-6 flex flex-wrap gap-3 text-sm">
            <a href="#voorwaarden" className="text-[#6C63FF] hover:underline">Algemene Voorwaarden</a>
            <span className="text-[#C0C0D8]">·</span>
            <a href="#verwerkers" className="text-[#6C63FF] hover:underline">Verwerkersovereenkomst</a>
            <span className="text-[#C0C0D8]">·</span>
            <Link href="/privacy" className="text-[#6C63FF] hover:underline">Privacybeleid</Link>
          </nav>
        </div>

        {/* ─── DEEL I: ALGEMENE VOORWAARDEN ─── */}
        <section id="voorwaarden" className="bg-white rounded-2xl border border-[#E8E8F5] p-8 mb-8 scroll-mt-6">
          <h2 className="text-xl font-bold text-[#0F0F1E] mb-6 pb-4 border-b border-[#E8E8F5]">
            Deel I — Algemene Voorwaarden
          </h2>

          <Article number="1" title="Definities">
            <p>In deze voorwaarden wordt verstaan onder:</p>
            <dl className="mt-3 space-y-2">
              <Def term="Tasco">{BEDRIJF_JURIDISCH}, ingeschreven in het Handelsregister van de Kamer van Koophandel onder nummer {KVK}, gevestigd te {ADRES}.</Def>
              <Def term="Gebruiker">De natuurlijke persoon of rechtspersoon die zich heeft geregistreerd voor de Dienst en een Account heeft aangemaakt.</Def>
              <Def term="Dienst">De online softwareapplicatie Tasco, inclusief alle bijbehorende functies zoals urenregistratie, facturatiebeheer, kilometeradministratie en belastinginzichten, aangeboden via tasco.nl en bijbehorende apps.</Def>
              <Def term="Account">De persoonlijke, beveiligde omgeving die de Gebruiker na registratie tot zijn beschikking heeft.</Def>
              <Def term="Abonnement">De betaalde of gratis toegang tot de Dienst onder de op het moment van afsluiting geldende tarieven.</Def>
              <Def term="Persoonsgegevens">Alle informatie over een geïdentificeerde of identificeerbare natuurlijke persoon, zoals bedoeld in de AVG.</Def>
              <Def term="AVG">Verordening (EU) 2016/679 (Algemene Verordening Gegevensbescherming).</Def>
            </dl>
          </Article>

          <Article number="2" title="Toepasselijkheid">
            <p>Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, diensten en overeenkomsten van Tasco met de Gebruiker. Afwijkingen zijn alleen geldig indien schriftelijk overeengekomen. Door een Account aan te maken of de Dienst te gebruiken, aanvaardt de Gebruiker deze voorwaarden.</p>
          </Article>

          <Article number="3" title="De Dienst">
            <p>Tasco biedt een softwareplatform aan voor Nederlandse zzp'ers en kleine ondernemers. De Dienst omvat onder meer:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#3A3A5C]">
              <li>Urenregistratie en projectbeheer</li>
              <li>Aanmaken en beheren van facturen</li>
              <li>Kilometeradministratie</li>
              <li>Bonnetjes en onkostenbeheer</li>
              <li>Belastinginzichten (btw, inkomstenbelasting)</li>
              <li>Klantenbeheer (CRM)</li>
            </ul>
            <p className="mt-3">Tasco verleent de Gebruiker een niet-exclusief, niet-overdraagbaar recht op gebruik van de Dienst voor de duur van het Abonnement, uitsluitend voor eigen zakelijke doeleinden.</p>
          </Article>

          <Article number="4" title="Account en beveiliging">
            <p>De Gebruiker is verantwoordelijk voor het vertrouwelijk houden van zijn inloggegevens en voor alle activiteiten die via zijn Account plaatsvinden. De Gebruiker stelt Tasco onverwijld in kennis van onbevoegd gebruik van zijn Account. Tasco is niet aansprakelijk voor schade als gevolg van het gebruik van inloggegevens door derden, tenzij dit is te wijten aan aantoonbaar opzet of grove nalatigheid van Tasco.</p>
          </Article>

          <Article number="5" title="Abonnementen en betaling">
            <p>5.1 De Dienst is beschikbaar in een gratis Starter-plan en betaalde abonnementen. De actuele tarieven en functies per abonnement zijn vermeld op tasco.nl/prijzen.</p>
            <p className="mt-2">5.2 Betaling geschiedt via de aangeboden betaalmethoden (creditcard, iDEAL of SEPA-incasso). Abonnementen worden maandelijks of jaarlijks automatisch verlengd tenzij de Gebruiker het abonnement vóór de verlengingsdatum opzegt.</p>
            <p className="mt-2">5.3 Bij niet-tijdige betaling is Tasco gerechtigd de toegang tot de Dienst te beperken of te beëindigen, onverminderd het recht op betaling van openstaande bedragen.</p>
            <p className="mt-2">5.4 Prijswijzigingen worden minimaal 30 dagen van tevoren aangekondigd. Indien de Gebruiker niet akkoord gaat, heeft hij het recht het abonnement te beëindigen vóór de ingangsdatum van de prijswijziging.</p>
            <p className="mt-2">5.5 Tasco hanteert een bedenktermijn van 14 dagen na eerste aankoop van een betaald abonnement (consumentenkoop). Buiten deze termijn worden geen restituties verleend voor reeds verstreken abonnementsperioden.</p>
          </Article>

          <Article number="6" title="Gebruik van de Dienst">
            <p>De Gebruiker verplicht zich de Dienst uitsluitend te gebruiken conform de wet en deze voorwaarden. Het is de Gebruiker onder meer verboden:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#3A3A5C]">
              <li>De Dienst te gebruiken voor onrechtmatige doeleinden;</li>
              <li>Virussen, malware of andere schadelijke code te uploaden;</li>
              <li>Ongeautoriseerde toegang te proberen tot systemen van Tasco of derden;</li>
              <li>De Dienst te reverse-engineeren, kopiëren of afgeleide werken te maken;</li>
              <li>Inloggegevens te delen met of over te dragen aan derden.</li>
            </ul>
          </Article>

          <Article number="7" title="Beschikbaarheid en onderhoud">
            <p>Tasco streeft naar een beschikbaarheid van de Dienst van minimaal 99,5% per kalendermaand (exclusief gepland onderhoud). Gepland onderhoud wordt waar mogelijk buiten kantooruren uitgevoerd en vooraf aangekondigd. Tasco is niet aansprakelijk voor schade als gevolg van tijdelijke onbeschikbaarheid van de Dienst.</p>
          </Article>

          <Article number="8" title="Intellectuele eigendom">
            <p>Alle intellectuele eigendomsrechten op de Dienst, de software, de gebruikersinterface en de bijbehorende documentatie berusten bij Tasco of haar licentiegevers. De Gebruiker verkrijgt uitsluitend het gebruiksrecht zoals omschreven in artikel 3. De door de Gebruiker ingevoerde gegevens blijven zijn eigendom; Tasco heeft uitsluitend een verwerkingsrecht zoals beschreven in de Verwerkersovereenkomst (Deel II).</p>
          </Article>

          <Article number="9" title="Aansprakelijkheid">
            <p>9.1 De aansprakelijkheid van Tasco is in alle gevallen beperkt tot het bedrag dat de Gebruiker in de afgelopen drie maanden aan abonnementskosten heeft betaald, met een maximum van € 500 per schadegeval.</p>
            <p className="mt-2">9.2 Tasco is nimmer aansprakelijk voor indirecte schade, gevolgschade, gederfde winst, gemiste besparingen of schade door bedrijfsstagnatie.</p>
            <p className="mt-2">9.3 De beperkingen van aansprakelijkheid gelden niet bij opzet of bewuste roekeloosheid van Tasco.</p>
            <p className="mt-2">9.4 Tasco is niet verantwoordelijk voor de juistheid of volledigheid van belastingadviezen of financiële inzichten gegenereerd door de Dienst. De Gebruiker dient voor fiscale beslissingen een gekwalificeerde boekhouder of belastingadviseur te raadplegen.</p>
          </Article>

          <Article number="10" title="Duur en beëindiging">
            <p>10.1 De overeenkomst wordt aangegaan voor onbepaalde tijd en kan door de Gebruiker op elk moment worden opgezegd via de accountinstellingen, met ingang van het einde van de lopende abonnementsperiode.</p>
            <p className="mt-2">10.2 Tasco kan de overeenkomst met onmiddellijke ingang beëindigen indien de Gebruiker in strijd handelt met deze voorwaarden, of indien de Gebruiker in staat van faillissement wordt verklaard.</p>
            <p className="mt-2">10.3 Na beëindiging kan de Gebruiker zijn gegevens exporteren gedurende 30 dagen. Daarna verwijdert Tasco alle gegevens van de Gebruiker conform het privacybeleid.</p>
          </Article>

          <Article number="11" title="Wijzigingen">
            <p>Tasco behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen worden minimaal 30 dagen voor inwerkingtreding per e-mail aangekondigd. Indien de Gebruiker niet akkoord gaat, kan hij het abonnement opzeggen vóór de ingangsdatum. Voortgezet gebruik na de ingangsdatum geldt als aanvaarding van de gewijzigde voorwaarden.</p>
          </Article>

          <Article number="12" title="Toepasselijk recht en geschillen">
            <p>Op de overeenkomst is uitsluitend Nederlands recht van toepassing. Geschillen worden bij uitsluiting voorgelegd aan de bevoegde rechter in het arrondissement Amsterdam, tenzij dwingend recht een andere rechter aanwijst.</p>
          </Article>
        </section>

        {/* ─── DEEL II: VERWERKERSOVEREENKOMST ─── */}
        <section id="verwerkers" className="bg-white rounded-2xl border border-[#E8E8F5] p-8 scroll-mt-6">
          <h2 className="text-xl font-bold text-[#0F0F1E] mb-2 pb-4 border-b border-[#E8E8F5]">
            Deel II — Verwerkersovereenkomst
          </h2>
          <p className="text-sm text-[#6B6B8A] mb-6">
            Deze verwerkersovereenkomst (VOK) maakt onlosmakelijk deel uit van de overeenkomst tussen Tasco en de Gebruiker en is opgesteld conform artikel 28 AVG.
          </p>

          <Article number="1" title="Partijen en rolverdeling">
            <p>De Gebruiker treedt op als <strong>verwerkingsverantwoordelijke</strong> in de zin van de AVG voor de persoonsgegevens van zijn klanten, opdrachtgevers en andere betrokkenen die hij in de Dienst verwerkt.</p>
            <p className="mt-2">{BEDRIJF_JURIDISCH} treedt op als <strong>verwerker</strong> en verwerkt deze persoonsgegevens uitsluitend in opdracht van en ten behoeve van de Gebruiker.</p>
          </Article>

          <Article number="2" title="Doel en aard van de verwerking">
            <p>Tasco verwerkt persoonsgegevens namens de Gebruiker met als enig doel het leveren van de in Deel I beschreven Dienst. De verwerking omvat: opslag, weergave, export, back-up en verwijdering van gegevens, uitsluitend op basis van instructies van de Gebruiker.</p>
          </Article>

          <Article number="3" title="Categorieën persoonsgegevens en betrokkenen">
            <p>De verwerking kan de volgende categorieën persoonsgegevens betreffen:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#3A3A5C]">
              <li>NAW-gegevens van klanten en opdrachtgevers (naam, adres, woonplaats)</li>
              <li>Contactgegevens (e-mailadres, telefoonnummer)</li>
              <li>Financiële gegevens (factuurbedragen, betaalstatus, IBAN)</li>
              <li>Zakelijke gegevens (KvK-nummer, btw-nummer)</li>
              <li>Urenregistraties en projectgegevens gerelateerd aan klanten</li>
            </ul>
            <p className="mt-3">Betrokkenen zijn de klanten, opdrachtgevers en zakelijke contacten van de Gebruiker. Tasco verwerkt geen bijzondere categorieën van persoonsgegevens namens de Gebruiker.</p>
          </Article>

          <Article number="4" title="Verplichtingen van Tasco als verwerker">
            <p>Tasco verplicht zich:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#3A3A5C]">
              <li>Persoonsgegevens uitsluitend te verwerken op basis van gedocumenteerde instructies van de Gebruiker;</li>
              <li>Vertrouwelijkheid te betrachten ten aanzien van de persoonsgegevens;</li>
              <li>Passende technische en organisatorische beveiligingsmaatregelen te treffen conform artikel 32 AVG (waaronder encryptie in transit en at rest, toegangscontrole en regelmatige beveiligingstests);</li>
              <li>De Gebruiker onverwijld te informeren indien een instructie naar oordeel van Tasco in strijd is met de AVG;</li>
              <li>De Gebruiker te ondersteunen bij het nakomen van verzoeken van betrokkenen (inzage, rectificatie, verwijdering, overdraagbaarheid);</li>
              <li>Na afloop van de Dienst alle persoonsgegevens te verwijderen of terug te geven, tenzij een wettelijke bewaarplicht anders vereist;</li>
              <li>Alle informatie beschikbaar te stellen die nodig is om de naleving van dit artikel aan te tonen.</li>
            </ul>
          </Article>

          <Article number="5" title="Verplichtingen van de Gebruiker als verwerkingsverantwoordelijke">
            <p>De Gebruiker verplicht zich:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#3A3A5C]">
              <li>Te zorgen dat hij een rechtsgeldige grondslag heeft voor de verwerking van persoonsgegevens in de Dienst;</li>
              <li>Betrokkenen te informeren over de verwerking conform de AVG;</li>
              <li>Tasco uitsluitend gegevens te verstrekken die strikt noodzakelijk zijn voor de Dienst;</li>
              <li>Tasco tijdig en volledig te instrueren over eventuele verzoeken van betrokkenen.</li>
            </ul>
          </Article>

          <Article number="6" title="Subverwerkers">
            <p>Tasco maakt gebruik van de volgende subverwerkers. De Gebruiker verleent bij aanvaarding van deze voorwaarden een algemene machtiging voor het inschakelen van onderstaande en vergelijkbare subverwerkers:</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F5F4FF]">
                    <th className="text-left p-3 font-semibold text-[#0F0F1E] rounded-tl-lg">Subverwerker</th>
                    <th className="text-left p-3 font-semibold text-[#0F0F1E]">Doel</th>
                    <th className="text-left p-3 font-semibold text-[#0F0F1E] rounded-tr-lg">Locatie</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#E8E8F5]">
                    <td className="p-3 text-[#3A3A5C]">Supabase Inc.</td>
                    <td className="p-3 text-[#3A3A5C]">Database en authenticatie</td>
                    <td className="p-3 text-[#3A3A5C]">EU (Frankfurt)</td>
                  </tr>
                  <tr className="border-t border-[#E8E8F5]">
                    <td className="p-3 text-[#3A3A5C]">Vercel Inc.</td>
                    <td className="p-3 text-[#3A3A5C]">Hosting en serverless compute</td>
                    <td className="p-3 text-[#3A3A5C]">VS / EU</td>
                  </tr>
                  <tr className="border-t border-[#E8E8F5]">
                    <td className="p-3 text-[#3A3A5C]">Stripe Inc.</td>
                    <td className="p-3 text-[#3A3A5C]">Betalingsverwerking</td>
                    <td className="p-3 text-[#3A3A5C]">VS / EU</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">Tasco stelt de Gebruiker minimaal 14 dagen van tevoren in kennis van wijzigingen in de lijst van subverwerkers. De Gebruiker kan bezwaar maken, waarna partijen in overleg treden. Bij onoverbrugbaar bezwaar heeft de Gebruiker het recht de overeenkomst te beëindigen.</p>
            <p className="mt-2">Met elke subverwerker sluit Tasco een verwerkersovereenkomst die ten minste de verplichtingen uit dit artikel weerspiegelt.</p>
          </Article>

          <Article number="7" title="Doorgifte buiten de EER">
            <p>Voor subverwerkers buiten de Europese Economische Ruimte (EER) zorgt Tasco voor een passend beschermingsniveau conform hoofdstuk V AVG, door gebruik te maken van door de Europese Commissie goedgekeurde standaardcontractbepalingen (SCC's) of doorgifte naar landen met een adequaatheidsbesluit.</p>
          </Article>

          <Article number="8" title="Beveiligingsmaatregelen">
            <p>Tasco treft passende technische en organisatorische maatregelen om persoonsgegevens te beschermen tegen verlies, onbevoegde toegang of onrechtmatige verwerking. Deze maatregelen omvatten ten minste:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-[#3A3A5C]">
              <li>Versleuteling van gegevens in transit (TLS 1.2+) en at rest (AES-256);</li>
              <li>Toegangscontrole op basis van het need-to-know-principe;</li>
              <li>Twee-factor-authenticatie voor interne systemen;</li>
              <li>Regelmatige beveiligingsaudits en penetratietests;</li>
              <li>Automatische back-ups met dagelijkse retention.</li>
            </ul>
          </Article>

          <Article number="9" title="Datalekken">
            <p>Bij een datalek dat de persoonsgegevens van de Gebruiker betreft, informeert Tasco de Gebruiker zonder onredelijke vertraging en in ieder geval binnen 36 uur na ontdekking. De melding bevat: de aard van het lek, de betrokken categorieën en het (geschatte) aantal betrokkenen, de vermoedelijke gevolgen en de getroffen maatregelen. De Gebruiker is als verwerkingsverantwoordelijke zelf verantwoordelijk voor het doen van een melding aan de Autoriteit Persoonsgegevens binnen 72 uur na ontdekking, indien vereist.</p>
          </Article>

          <Article number="10" title="Auditrecht">
            <p>De Gebruiker heeft het recht maximaal eenmaal per jaar een audit uit te laten voeren naar de naleving van deze verwerkersovereenkomst, na een schriftelijke kennisgeving van minimaal 30 dagen. Kosten van de audit zijn voor rekening van de Gebruiker. Tasco kan een audit vervangen door een actueel TPM-rapport of ISO 27001-certificering van een onafhankelijke derde.</p>
          </Article>

          <Article number="11" title="Duur en beëindiging">
            <p>Deze verwerkersovereenkomst is van kracht zolang Tasco persoonsgegevens verwerkt namens de Gebruiker en eindigt automatisch bij beëindiging van de overeenkomst. Na afloop verwijdert Tasco alle persoonsgegevens binnen 30 dagen, tenzij een wettelijke bewaarplicht anders vereist.</p>
          </Article>
        </section>

        <p className="text-center text-sm text-[#9898B0] mt-10">
          Vragen? Neem contact op via{' '}
          <a href={`mailto:${EMAIL}`} className="text-[#6C63FF] hover:underline">{EMAIL}</a>
          {' '}·{' '}
          <Link href="/privacy" className="text-[#6C63FF] hover:underline">Privacybeleid</Link>
        </p>
      </div>
    </div>
  )
}

function Article({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="font-semibold text-[#0F0F1E] mb-2">
        Artikel {number} — {title}
      </h3>
      <div className="text-[#3A3A5C] leading-relaxed text-sm space-y-1">{children}</div>
    </div>
  )
}

function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="font-semibold text-[#0F0F1E] min-w-36 shrink-0">{term}:</dt>
      <dd className="text-[#3A3A5C]">{children}</dd>
    </div>
  )
}
