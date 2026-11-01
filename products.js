/* Lista de respaldo: se usa solo si no se puede leer el panel de Nancy. */
window.FDP_FALLBACK = [
  {
    id: "remera-encaje",
    name: "Remera de Encaje",
    price: 19999,
    category: "Remeras",
    sizes: ["Único"],
    description: "Remera manga larga de encaje texturado, entallada y suave. Ideal para usar sola o en capas.",
    images: ["img/remera-encaje-marron.webp"],
    colors: [
      { name: "Marrón", hex: "#8a4a38", images: ["img/remera-encaje-marron.webp"] },
      { name: "Negro", hex: "#111111", images: ["img/remera-encaje-negro.webp"] },
      { name: "Beige", hex: "#e0a890", images: ["img/remera-encaje-beige.webp"] },
      { name: "Blanco", hex: "#f2eee6", images: ["img/remera-encaje-blanco.webp"] }
    ]
  },
  {
    id: "remera-boxing",
    name: "Remera Boxing de Algodón",
    price: 17999,
    category: "Remeras",
    sizes: ["Único"],
    description: "Remera oversized de algodón, corte boxy con hombros caídos. Cómoda, versátil y con caída relajada.",
    images: ["img/remera-boxing-marron-front.webp"],
    colors: [
      { name: "Marrón", hex: "#6b3f2e", images: ["img/remera-boxing-marron-front.webp", "img/remera-boxing-marron-back.webp"] },
      { name: "Blanco", hex: "#f4f1ea", images: ["img/remera-boxing-blanco-front.webp", "img/remera-boxing-blanco-back.webp"] },
      { name: "Negro", hex: "#111111", images: ["img/remera-boxing-negro-front.webp", "img/remera-boxing-negro-tq.webp"] }
    ]
  },
  {
    id: "remera-boxing-lunares",
    name: "Remera Boxing con Lunares",
    price: 17999,
    category: "Remeras",
    sizes: ["Único"],
    description: "Remera oversized de algodón con lunares, corte boxy. Divertida, cómoda y con caída relajada.",
    images: ["img/remera-boxing-lunares-blanca-front.webp"],
    colors: [
      { name: "Blanca", hex: "#f5f2ec", images: ["img/remera-boxing-lunares-blanca-front.webp", "img/remera-boxing-lunares-blanca-back.webp"] },
      { name: "Negra", hex: "#111111", images: ["img/remera-boxing-lunares-negra-front.webp", "img/remera-boxing-lunares-negra-back.webp"] },
      { name: "Marrón", hex: "#5c3a2a", images: ["img/remera-boxing-lunares-marron-front.webp"] },
      { name: "Beige", hex: "#e8d5b5", images: ["img/remera-boxing-lunares-beige-front.webp"] }
    ]
  },
  {
    id: "vestido-india-largo",
    name: "Vestido de la India Largo",
    price: 45000,
    category: "Vestidos",
    sizes: ["L/XL"],
    description: "Vestido largo de la India con estampa ikat, mangas con volado y falda amplia en capas. Fresco y con mucha caída.",
    images: ["img/vestido-india-largo.webp"]
  },
  {
    id: "vestido-india-corto",
    name: "Vestido de la India Corto",
    price: 40000,
    category: "Vestidos",
    sizes: ["L/XL"],
    description: "Vestido corto de la India con estampa de hojas en negro y crudo, borlas en el escote y volado en el ruedo.",
    images: ["img/vestido-india-corto.webp"]
  }
];
