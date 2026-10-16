# Meridian Exim — export/import landing page (demo)

Vite + React 19, Three.js via React Three Fiber, GSAP ScrollTrigger, Lenis smooth scroll, Motion, Tailwind v4.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ — deploy to Vercel / Netlify / any static host
```

## Rebranding for the client

Nearly everything client-specific is in `src/config.js`: company name, contact details, origin port, destination ports (these drive the globe arcs, labels, marquee and quote form), stats, services, products (Unsplash photo IDs), process steps, testimonials, footer clocks and the CTA video.

Placeholder content to replace before going live: company name and logo, phone/email/address, certifications, IEC/GSTIN in `Footer.jsx`, testimonials, and every number and stat.

## Sections

1. **Preloader**: a container-code counter, then a shutter wipe
2. **Hero**: scroll-driven 3D globe made of land dots, with India highlighted, animated trade lanes, ships moving along the routes, port labels and stat cards (`Globe.jsx`, `Hero.jsx`)
3. **Marquee**: certifications and ports
4. **Services bento**: each card runs a live animation (ship and ETA, flight path, customs stamp, QC scanner, isometric pallets), tilts toward the cursor with a spotlight, and opens into a full dialog on click
5. **Container 3D**: a procedurally modelled 40ft container. On scroll it turns, the doors open and the cargo slides out, while a live telemetry panel fills in (`Container3D.jsx`)
6. **Products**: a pinned horizontal gallery with photo parallax and skew based on scroll speed. Each card flips over to show a spec sheet
7. **Journey**: the sea route draws itself on scroll, with a ship following the path
8. **Track**: a demo shipment tracker with an animated timeline
9. **Testimonials**: a swipeable card deck (drag, or let it autoplay)
10. **Quote**: a 3-step quote form with a live shipment summary and a video background. It has no backend yet; connect it to Formspree, Web3Forms or an API
11. **Footer**: live clocks for each port desk and a large wordmark reveal

To regenerate the globe's land dots (for example, at a different density), run `npm run gen:land`.

## Credits

Photos from Unsplash and the CTA video from Pexels. Both are free to use under their licenses and are hotlinked. Land data is Natural Earth, via `world-atlas`.
