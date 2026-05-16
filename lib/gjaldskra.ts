// ─── Gjaldskrá data ───────────────────────────────────────────────────────────
// Edit prices, names, and descriptions here. The modal reads from these arrays.

export type Package = {
  name: string;
  setup: string;
  note?: string;
  includes: string;
  price: string;
  badge?: string;
};

export type LineItem = {
  name: string;
  price: string;
};

export const DAGSPAKKAR: Package[] = [
  {
    name: "Morgunfundur",
    setup: "2 klst · allt að 80 gestir",
    note: "þri–fös, 08:00–12:00",
    includes: "Skjár, hljóðkerfi, WiFi",
    price: "95.000 kr",
  },
  {
    name: "Hálfdags ráðstefna",
    setup: "4 klst · allt að 120 gestir",
    includes: "A/V búnaður, hljóðkerfi, leiðsögn",
    price: "150.000 kr",
  },
  {
    name: "Heildags ráðstefna",
    setup: "8 klst · allt að 150 gestir",
    note: "þri–fös; veitingar fáanlegar",
    includes: "Fullur A/V búnaður, hljóðkerfi",
    price: "220.000 kr",
  },
  {
    name: "Skóla- og hópshálfdagur",
    setup: "3 klst · allt að 80 gestir",
    note: "utan háannatíma",
    includes: "Grunnbúnaður",
    price: "80.000 kr",
  },
];

export const KVOLDPAKKAR: Package[] = [
  {
    name: "Kvöldmóttaka",
    setup: "allt að 4 klst · 150 gestir",
    includes: "Veitingar, bar, A/V",
    price: "200.000 kr",
  },
  {
    name: "Heilt kvöld — Úrval",
    setup: "4–7 klst · 200 gestir",
    note: "brúðkaup, hátíðahöld, árshátíðir",
    includes: "Veitingar, bar, A/V, leiðsögn",
    price: "320.000 kr",
    badge: "Vinsælast",
  },
  {
    name: "Hlýlegt kvöld",
    setup: "allt að 4 klst · 60 gestir",
    includes: "Kvöldmatur, bar, A/V",
    price: "150.000 kr",
  },
];

export const SERPAKKAR: Package[] = [
  {
    name: "Víkingabanketapakki",
    setup: "4 klst · 120 gestir",
    includes: "Þemart kvöldmatur, skemmtun, söguleg leiðsögn",
    price: "280.000 kr",
    badge: "Einstakt",
  },
  {
    name: "Kvikmynda- og ljósmyndataka",
    setup: "4 klst · virka daga",
    includes: "Aðgangur að Íslendingur og söfnum",
    price: "120.000 kr",
  },
  {
    name: "Einkasafnauppbót",
    setup: "Viðbót við hvaðan pakka",
    includes: "Leiðsögn um safn og skip",
    price: "+ 40.000 kr",
  },
];

export const CATERING: LineItem[] = [
  { name: "Kaffi & kaffiteiti við komu", price: "1.500 kr" },
  { name: "Hádegisverður — buffet",      price: "4.500 kr" },
  { name: "2 rétta kvöldmatur",          price: "8.500 kr" },
  { name: "Víkingabanket (þemart)",      price: "12.000 kr" },
  { name: "Drykkirpakki — 3 klst",       price: "6.000 kr" },
];

export const FEES: LineItem[] = [
  { name: "Þrifagjald",                  price: "25.000 kr" },
  { name: "Öryggisgæsla (>100 gestir)",  price: "35.000 kr" },
  { name: "Afbókun < 30 dögum",          price: "50% af leiguverði" },
  { name: "Afbókun < 7 dögum",           price: "100% af leiguverði" },
];
