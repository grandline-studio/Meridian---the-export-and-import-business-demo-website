// All client-specific content lives here — swap names, numbers and photos without touching components.

export const img = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`

export const brand = {
  name: 'Meridian',
  suffix: 'Exim',
  tagline: 'Export · Import · Logistics',
  email: 'trade@meridianexim.com',
  phone: '+91 98200 00000',
  address: 'Nariman Point, Mumbai 400021, India',
  originPort: 'Nhava Sheva (JNPT)',
}

export const origin = { name: 'Mumbai', lat: 18.95, lng: 72.95 }

export const destinations = [
  { name: 'Rotterdam', country: 'NL', lat: 51.92, lng: 4.48, days: 22 },
  { name: 'Hamburg', country: 'DE', lat: 53.55, lng: 9.99, days: 24 },
  { name: 'Felixstowe', country: 'UK', lat: 51.96, lng: 1.35, days: 23 },
  { name: 'New York', country: 'US', lat: 40.68, lng: -74.04, days: 31 },
  { name: 'Los Angeles', country: 'US', lat: 33.74, lng: -118.27, days: 34 },
  { name: 'Santos', country: 'BR', lat: -23.96, lng: -46.33, days: 33 },
  { name: 'Jebel Ali', country: 'AE', lat: 25.01, lng: 55.06, days: 4 },
  { name: 'Singapore', country: 'SG', lat: 1.26, lng: 103.84, days: 9 },
  { name: 'Shanghai', country: 'CN', lat: 31.23, lng: 121.47, days: 16 },
  { name: 'Tokyo', country: 'JP', lat: 35.62, lng: 139.78, days: 19 },
  { name: 'Sydney', country: 'AU', lat: -33.86, lng: 151.2, days: 21 },
  { name: 'Durban', country: 'ZA', lat: -29.87, lng: 31.03, days: 15 },
  { name: 'Mombasa', country: 'KE', lat: -4.05, lng: 39.67, days: 10 },
]

export const heroStats = [
  { value: 64, suffix: '+', label: 'Countries served' },
  { value: 2400, suffix: '+', label: 'Containers shipped' },
  { value: 98.7, suffix: '%', decimals: 1, label: 'On-time delivery' },
  { value: 18, suffix: ' yrs', label: 'In global trade' },
]

export const certifications = ['ISO 9001:2015', 'IEC Registered', 'APEDA Member', 'FIEO Member', 'AEO Certified', 'FSSAI Licensed', 'Spices Board RCMC', 'GST Compliant']

export const services = [
  {
    id: 'sea',
    title: 'Sea Freight',
    kicker: 'FCL · LCL · Reefer',
    blurb: 'Full and shared container loads from every major Indian port, with live vessel tracking.',
    detail: 'We book space directly with leading carriers, consolidate LCL cargo at our CFS partners and handle reefer cargo for perishables — with temperature logs you can download.',
    points: ['20ft / 40ft / 40HC & reefer', 'Weekly sailings to 120+ ports', 'Door-to-door or port-to-port', 'Live vessel ETA alerts'],
    span: 'md:col-span-2',
  },
  {
    id: 'air',
    title: 'Air Cargo',
    kicker: 'Express · Charter',
    blurb: 'Time-critical freight on the next flight out — samples to full charters.',
    detail: 'Priority uplift from BOM, DEL, MAA and BLR with IATA-certified handling for dangerous goods, pharma and perishables.',
    points: ['24–72h to most hubs', 'Pharma & DG handling', 'Consolidated & direct AWB', 'Airport-to-door delivery'],
    span: '',
  },
  {
    id: 'customs',
    title: 'Customs & Compliance',
    kicker: 'CHA · Docs · Duty',
    blurb: 'Licensed customs brokerage that clears your shipment in hours, not days.',
    detail: 'Shipping bills, bills of entry, HS classification, duty drawback, RoDTEP and EPCG — we file it, track it and make sure nothing sits at the port.',
    points: ['HS code classification', 'Duty drawback & RoDTEP', 'Certificates of origin', 'ICEGATE e-filing'],
    span: '',
  },
  {
    id: 'sourcing',
    title: 'Sourcing & QC',
    kicker: 'Vendors · Inspection',
    blurb: 'Verified manufacturers and third-party inspection before anything ships.',
    detail: 'A network of 300+ audited suppliers across India. Every lot is inspected against your spec with photo and lab reports shared before dispatch.',
    points: ['300+ audited suppliers', 'Pre-shipment inspection', 'Lab & phytosanitary tests', 'Private label packing'],
    span: '',
  },
  {
    id: 'warehouse',
    title: 'Warehousing',
    kicker: 'Storage · Packing',
    blurb: 'Bonded and open warehousing near JNPT with export-grade packing.',
    detail: '120,000 sq ft of storage with fumigation, palletisation, shrink-wrapping and container stuffing supervised on camera.',
    points: ['Bonded & open storage', 'Fumigation & ISPM-15', 'Palletising & lashing', 'Stuffing supervision'],
    span: '',
  },
]

export const products = [
  { name: 'Spices & Condiments', hs: 'HS 0904–0910', origin: 'Kerala · Rajasthan', moq: '1 MT', pack: '25 kg PP / jute bags', photo: 'photo-1596040033229-a9821ebd058d', tone: '#c2410c' },
  { name: 'Basmati & Grains', hs: 'HS 1006', origin: 'Punjab · Haryana', moq: '1 FCL', pack: '1–50 kg BOPP / jute', photo: 'photo-1586201375761-83865001e31c', tone: '#b08d57' },
  { name: 'Tea & Coffee', hs: 'HS 0901–0902', origin: 'Assam · Munnar · Coorg', moq: '500 kg', pack: 'Foil-lined chests & sacks', photo: 'photo-1491497895121-1334fc14d8c9', tone: '#3f7d4f' },
  { name: 'Cotton & Textiles', hs: 'HS 5205–6302', origin: 'Gujarat · Tiruppur', moq: '2,000 m', pack: 'Rolls / bales', photo: 'photo-1624516268152-1e48624026ed', tone: '#7c3aed' },
  { name: 'Engineering Goods', hs: 'HS 7318–8483', origin: 'Pune · Rajkot', moq: 'On drawing', pack: 'Crates, VCI wrapped', photo: 'photo-1524514587686-e2909d726e9b', tone: '#475569' },
  { name: 'Handicrafts & Decor', hs: 'HS 6913–9403', origin: 'Jaipur · Moradabad', moq: '200 pcs', pack: 'Honeycomb cartons', photo: 'photo-1595351298020-038700609878', tone: '#a16207' },
  { name: 'Cashew & Dry Fruits', hs: 'HS 0801–0813', origin: 'Goa · Kollam', moq: '1 MT', pack: 'Vacuum tins / pouches', photo: 'photo-1726771517475-e7acdd34cd8a', tone: '#92400e' },
  { name: 'Pharmaceuticals', hs: 'HS 3003–3004', origin: 'Hyderabad · Ahmedabad', moq: 'Per dossier', pack: 'Cold-chain cartons', photo: 'photo-1631549916768-4119b2e5f926', tone: '#0e7490' },
]

export const journey = [
  { code: '01', title: 'Enquiry & quote', text: 'Share product, volume and destination. A trade desk replies with landed cost within 24 hours.' },
  { code: '02', title: 'Sourcing & samples', text: 'We shortlist audited suppliers, ship samples and lock specs, pricing and Incoterms.' },
  { code: '03', title: 'Inspection & packing', text: 'Third-party QC, lab tests and export packing — with photos before anything is sealed.' },
  { code: '04', title: 'Customs & documentation', text: 'Shipping bill, COO, phyto and invoice filed digitally. Clearance in under 24 hours.' },
  { code: '05', title: 'Ocean / air transit', text: 'Booked on the fastest reliable carrier. Track the vessel live from your dashboard.' },
  { code: '06', title: 'Delivered & settled', text: 'Destination clearance and last-mile delivery. Documents released, payment closed.' },
]

export const testimonials = [
  { quote: 'Three years, 140 containers of spices into Rotterdam and not one rejected lot. Their QC reports arrive before we even ask.', name: 'Pieter van Dijk', role: 'Head of Procurement', company: 'Noordzee Foods BV', country: 'Netherlands' },
  { quote: 'They turned around a stuck customs file in Jebel Ali overnight. That is the difference between a partner and a forwarder.', name: 'Aisha Al Mansoori', role: 'Supply Chain Director', company: 'Gulfline Trading LLC', country: 'UAE' },
  { quote: 'We moved our entire home-textile sourcing to India through Meridian. Landed cost dropped 18% in the first season.', name: 'Rachel Moore', role: 'COO', company: 'Hearth & Loom', country: 'USA' },
  { quote: 'Pricing is transparent to the rupee and the team answers WhatsApp at 2am our time. Highly recommended.', name: 'Kenji Watanabe', role: 'Import Manager', company: 'Sakura Gourmet KK', country: 'Japan' },
]

export const clocks = [
  { city: 'Mumbai', tz: 'Asia/Kolkata' },
  { city: 'Dubai', tz: 'Asia/Dubai' },
  { city: 'Rotterdam', tz: 'Europe/Amsterdam' },
  { city: 'New York', tz: 'America/New_York' },
  { city: 'Singapore', tz: 'Asia/Singapore' },
]

export const ctaVideo = 'https://videos.pexels.com/video-files/2943126/2943126-hd_1280_720_24fps.mp4'
export const ctaPoster = img('photo-1724597500306-a4cbb7d1324e', 1600)
