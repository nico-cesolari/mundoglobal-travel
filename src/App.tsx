import { useEffect, useMemo, useState } from "react";
import { SmartImage } from "./components/SmartImage";
import { PackageDetailPage } from "./components/PackageDetailPage";
import ImageLab from "./components/ImageLab";
import FocalPointEditor from "./components/FocalPointEditor";
import {
  ArrowRight, ArrowLeft, Plane, Globe2, Search, CalendarDays, Users, Tag, Pencil, FileText,
  Heart, Star, ShieldCheck, Headphones, CreditCard, Menu, X, UserRound,
  ChevronDown, MapPin, Clock3, Check, CheckCircle2, Hotel, BedDouble, Stethoscope,
  Luggage, CarFront, LockKeyhole, Mail, Eye, EyeOff, MessageCircle, Bell, SlidersHorizontal,
  Facebook, Instagram, Youtube, Linkedin, Ticket, LogOut, CircleHelp, Sparkles, Phone,
  DollarSign, TrendingUp, Percent, Building2, ClipboardList, Wallet, Plus
} from "lucide-react";

type Page = "home" | "results" | "detail" | "login" | "register" | "checkout" | "account" | "support" | "employee-login" | "employee";
type Package = {
  id: number; name: string; country: string; category: string; image: string;
  price?: number; oldPrice?: number; originalPrice?: number; currency?: string;
  departureCity?: string; departureDate?: string; returnDate?: string;
  days?: number; nights?: number; mode?: string; tripType?: string;
  rating?: number; reviews?: string; reviewCount?: number | string;
  images?: string[]; caption?: string; descriptionTitle?: string;
  focalPoint?: { x: number; y: number }; safeArea?: { x: number; y: number; w: number; h: number };
  imagePosition?: string;
  tag?: string; offerExpires?: string; description?: string;
  includes?: { icon?: string; title?: string; description?: string }[];
  infoSections?: { icon?: string; title?: string; description?: string }[];
  flags?: { promo?: boolean; reservaOnline?: boolean; cancelacionGratuita?: boolean; recommended?: boolean };
  servicePrices?: { flight: number; hotel: number; assistance: number };
  hotelName?: string; hotelLocation?: string; hotelImage?: string; transferIncluded?: boolean;
};
type BookingPassenger = { fullName: string; documentNumber: string; birthDate: string; nationality: string; };
type IncomeEntry = { id: number; reference: string; client: string; destination?: string; departureCity?: string; departureDate?: string; returnDate?: string; amount: number; method: string; status: "Acreditado" | "Pendiente"; date: string; travelers?: number; nights?: number; passengers?: BookingPassenger[]; };
const packages: Package[] = [
  { id: 1, name: "Cancún", country: "México", category: "Playas", tripType: "Turismo", price: 1299, oldPrice: 1799, rating: 4.8, reviews: "12.5k", days: 7, departureCity: "Buenos Aires, Argentina", departureDate: "2027-01-15", returnDate: "2027-01-21", tag: "Más elegido", image: "/images/cancun.jpg", focalPoint: {x:52,y:48}, hotelName: "Hotel Riu Cancun", hotelLocation: "Boulevard Kukulcan, Zona Hotelera, Cancún, México", hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85", transferIncluded: true, description: "Playas de arena blanca, aguas turquesas y resorts All Inclusive para desconectar de todo." },
  { id: 4, name: "Roma", country: "Italia", category: "Cultura", tripType: "Turismo", price: 1479, oldPrice: 1899, rating: 4.7, reviews: "8.2k", days: 8, departureCity: "Buenos Aires, Argentina", departureDate: "2027-04-03", returnDate: "2027-04-10", image: "/images/roma.jpg", focalPoint: {x:50,y:50}, description: "Historia, arquitectura y sabores italianos en una ciudad que nunca deja de sorprender." },
  { id: 5, name: "Nueva York", country: "Estados Unidos", category: "Ciudades", tripType: "Turismo", price: 1699, oldPrice: 1999, rating: 4.8, reviews: "11.1k", days: 6, departureCity: "Córdoba, Argentina", departureDate: "2027-05-12", returnDate: "2027-05-17", image: "/images/nueva-york.jpg", focalPoint: {x:50,y:50}, description: "Descubrí la ciudad que nunca duerme, sus barrios, espectáculos y gastronomía." },
  { id: 6, name: "Punta Cana", country: "República Dominicana", category: "Playas", tripType: "Turismo", price: 1399, oldPrice: 1799, rating: 4.7, reviews: "7.9k", days: 7, departureCity: "Buenos Aires, Argentina", departureDate: "2027-03-05", returnDate: "2027-03-11", tag: "¡Oferta!", image: "/images/punta-cana.jpg", focalPoint: {x:50,y:50}, description: "Un paraíso caribeño con resorts frente al mar y servicio All Inclusive." },
  { id: 7, name: "Camboriú", country: "Brasil", category: "Playas", tripType: "Turismo", price: 899, oldPrice: 1199, rating: 4.8, days: 8, nights: 7, departureCity: "Villa María, Córdoba, Argentina", departureDate: "2027-01-08", returnDate: "2027-01-15", image: "/images/camboriu.png", focalPoint: {x:50,y:50}, description: "Disfrutá las playas de Santa Catarina, sus paseos costeros y la energía de uno de los destinos más elegidos de Brasil." },
  { id: 8, name: "El Chaltén", country: "Argentina", category: "Aventuras", tripType: "Turismo", price: 1199, oldPrice: 1499, rating: 4.9, days: 6, departureCity: "Córdoba, Argentina", departureDate: "2027-02-20", returnDate: "2027-02-25", image: "/images/el-chalten.png", focalPoint: {x:50,y:50}, description: "Descubrí la capital nacional del trekking, con senderos de montaña, lagunas de deshielo y vistas inolvidables del Fitz Roy." },
  { id: 9, name: "Madrid", country: "España", category: "Ciudades", tripType: "Turismo", image: "/images/madrid.png", focalPoint: {x:50,y:50}, description: "Madrid, España. Consultá con nuestro equipo las próximas salidas y condiciones disponibles." }
];

const readDraft = (key: string, fallback = "") => {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};
const writeDraft = (key: string, value: string) => {
  try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key); } catch { /* El formulario sigue funcionando sin almacenamiento local. */ }
};
const money = (n?: number) => typeof n === "number" && Number.isFinite(n) && n > 0 ? `USD ${n.toLocaleString("es-AR")}` : "";
const discount = (p: Package) => { const original = p.originalPrice ?? p.oldPrice; return p.price && original && original > p.price ? Math.round((1 - p.price / original) * 100) : 0; };
const formatTravelDate = (value?: string) => { if (!value) return ""; const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", ""); };
const packageDuration = (start: string, end: string) => Math.round((new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) / 86400000) + 1;
const buildServicePrices = (price: number) => { const flight = Math.max(1, Math.round(price * 0.38)); const hotel = Math.max(1, Math.round(price * 0.54)); return { flight, hotel, assistance: Math.max(1, price - flight - hotel) }; };
const availableLocalPackageImages = new Set(["/images/cancun.jpg", "/images/roma.jpg", "/images/nueva-york.jpg", "/images/punta-cana.jpg", "/images/camboriu.png", "/images/el-chalten.png", "/images/madrid.png"]);
const packageImageOptions = [{ value: "/images/cancun.jpg", label: "Cancún" }, { value: "/images/roma.jpg", label: "Roma" }, { value: "/images/nueva-york.jpg", label: "Nueva York" }, { value: "/images/punta-cana.jpg", label: "Punta Cana" }, { value: "/images/camboriu.png", label: "Camboriú" }, { value: "/images/el-chalten.png", label: "El Chaltén" }, { value: "/images/madrid.png", label: "Madrid" }];
const packageHasPhoto = (item: Partial<Package>) => Boolean(item.image && availableLocalPackageImages.has(item.image));
const enrichPackage = (item: Package): Package => {
  const quote = item.servicePrices ?? (item.price ? buildServicePrices(item.price) : undefined);
  const datesNights = item.departureDate && item.returnDate ? Math.max(0, packageDuration(item.departureDate, item.returnDate) - 1) : undefined;
  const nights = item.nights ?? datesNights ?? (item.days && item.days > 1 ? item.days - 1 : undefined);
  const tripType = item.tripType;
  const includes = item.includes ?? (quote ? [
    { icon: "plane", title: "Pasaje aéreo de ida y vuelta", description: `Cotización estimada por persona: ${money(quote.flight)}.` },
    { icon: "hotel", title: nights ? `Hotel · ${nights} noches` : "Alojamiento", description: `Cotización estimada por persona: ${money(quote.hotel)}.` },
    { icon: "shield", title: "Asistencia al viajero", description: `Cotización estimada por persona: ${money(quote.assistance)}.` }
  ] : []);
  const infoSections = item.infoSections ?? [
    ...(item.description ? [{ icon: "info", title: "Todos los detalles", description: item.description }] : []),
    ...(item.departureCity && item.departureDate && item.returnDate ? [{ icon: "calendar", title: "Fechas y condiciones", description: `Salida desde ${item.departureCity}. Ida ${formatTravelDate(item.departureDate)} y regreso ${formatTravelDate(item.returnDate)}. El precio corresponde a esta salida publicada.` }] : [])
  ];
  return {
    ...item,
    currency: item.currency || "USD",
    oldPrice: item.oldPrice ?? item.originalPrice,
    originalPrice: item.originalPrice ?? item.oldPrice,
    reviewCount: item.reviewCount ?? item.reviews,
    images: item.images?.length ? item.images.filter(Boolean) : [item.image],
    nights,
    tripType,
    caption: item.caption || (item.country ? `Vista panorámica de ${item.name}, ${item.country}` : `Vista panorámica de ${item.name}`),
    descriptionTitle: item.descriptionTitle || (item.country ? `Tu próxima escapada a ${item.country}` : `Descubrí ${item.name}`),
    flags: {
      ...item.flags,
      promo: item.flags?.promo ?? item.tag === "¡Oferta!",
      reservaOnline: item.flags?.reservaOnline ?? Boolean(item.price && item.departureCity && item.departureDate && item.returnDate),
      recommended: item.flags?.recommended ?? Boolean(item.rating && item.rating >= 4.8)
    },
    includes,
    infoSections: infoSections.filter(section => Boolean(section.description?.trim()))
  };
};

const escapeDocumentText = (value: string) => value.replace(/[&<>"']/g, character => { switch(character) { case "&": return "&amp;"; case "<": return "&lt;"; case ">": return "&gt;"; case '"': return "&quot;"; default: return "&#39;"; } });
const travelDocumentHtml = (entry: IncomeEntry) => {
  const installments = Number(entry.method.match(/(\\d+) cuota/)?.[1] || 1);
  const amountPerInstallment = entry.amount / Math.max(1, installments);
  const rows = [
    ["Código de reserva", entry.reference], ["Pasajero principal", entry.client],
    ["Destino", entry.destination || "No indicado"], ["Origen", entry.departureCity || "No indicado"],
    ...(entry.travelers ? [["Pasajeros", String(entry.travelers)] as [string,string]] : []),
    ...(entry.nights ? [["Duración", `${entry.nights} noches`] as [string,string]] : []),
    ["Salida", formatTravelDate(entry.departureDate) || "A coordinar"], ["Regreso", formatTravelDate(entry.returnDate) || "A coordinar"],
    ["Importe total", money(entry.amount)], ["Medio / plan de pago", entry.method],
    ...(installments > 1 ? [["Cuota estimada", `${installments} cuotas de ${money(amountPerInstallment)}`] as [string,string]] : []),
    ["Estado", entry.status === "Acreditado" ? "Pago acreditado" : "Pendiente de pago"], ["Fecha de emisión", entry.date]
  ];
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Comprobante ${escapeDocumentText(entry.reference)} · MundoGlobal Travel</title><style>body{font-family:Arial,sans-serif;color:#1c2e50;margin:0;padding:38px;background:#f4f7fc}.sheet{max-width:760px;margin:auto;padding:38px;background:white;border:1px solid #e2e9f3;border-radius:16px}.brand{color:#1e4fd8;font-size:22px;font-weight:800}.eyebrow{margin:8px 0 26px;color:#71809a;font-size:11px;letter-spacing:1px}.code{padding:14px;border-radius:10px;background:#eff4ff;color:#1e4fd8;font-weight:800}.row{display:flex;justify-content:space-between;gap:18px;padding:13px 0;border-bottom:1px solid #edf1f7;font-size:13px}.row span{color:#71809a}.row b{text-align:right}.note{margin-top:24px;padding:13px;border-radius:9px;background:#fff8e7;color:#755b21;font-size:11px;line-height:1.6}.actions{display:flex;gap:10px;margin-top:24px}.actions button{padding:11px 17px;border:0;border-radius:8px;background:#1e4fd8;color:white;font-weight:700;cursor:pointer}.actions button:last-child{background:#eaf0fa;color:#29436d}@media print{body{padding:0;background:#fff}.sheet{max-width:none;border:0;border-radius:0;padding:15mm}.actions{display:none}.note{break-inside:avoid}}</style></head><body><main class="sheet"><div class="brand">MundoGlobal Travel</div><div class="eyebrow">COMPROBANTE DE RESERVA · ${escapeDocumentText(entry.reference)}</div><div class="code">Reserva ${escapeDocumentText(entry.reference)}</div>${rows.map(([label,value])=>`<div class="row"><span>${escapeDocumentText(label)}</span><b>${escapeDocumentText(value)}</b></div>`).join("")}<div class="note"><b>Documento de demostración.</b> Acredita el registro local de una reserva en MundoGlobal Travel. No es un pasaje aéreo emitido ni confirma servicios de proveedores. Los importes y cuotas son referenciales hasta la confirmación de la agencia y del medio de pago.</div><div class="actions"><button onclick="window.print()">Imprimir / Guardar como PDF</button><button onclick="window.close()">Cerrar</button></div></main></body></html>`;
};
const downloadTravelDocument = (entry: IncomeEntry) => {
  const blob = new Blob([travelDocumentHtml(entry)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `MundoGlobal-reserva-${entry.reference}.html`;
  document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1200);
};
const downloadClaimAttachment = (fileName: string, fileData: string) => { const link=document.createElement("a"); link.href=fileData; link.download=fileName || "documentacion-reclamo"; document.body.appendChild(link); link.click(); link.remove(); };
const printTravelDocument = (entry: IncomeEntry) => {
  const printWindow = window.open("", "_blank", "width=900,height=750");
  if (!printWindow) return;
  printWindow.document.open(); printWindow.document.write(travelDocumentHtml(entry)); printWindow.document.close();
  printWindow.focus(); printWindow.print();
};

const demoIncomeEntries: IncomeEntry[] = [
  { id: 1, reference: "MG-20481", client: "María González", destination: "Cancún", departureCity: "Buenos Aires, Argentina", departureDate: "2027-01-15", returnDate: "2027-01-21", amount: 2598, method: "Tarjeta de crédito", status: "Acreditado", date: "13/11/2026" },
  { id: 2, reference: "MG-20480", client: "Lucas Fernández", destination: "Roma", departureCity: "Buenos Aires, Argentina", departureDate: "2027-04-03", returnDate: "2027-04-10", amount: 1479, method: "Transferencia", status: "Pendiente", date: "12/11/2026" },
  { id: 4, reference: "MG-20478", client: "Tomás Romero", destination: "Camboriú", departureCity: "Villa María, Córdoba, Argentina", departureDate: "2027-01-08", returnDate: "2027-01-14", amount: 899, method: "Tarjeta de débito", status: "Pendiente", date: "10/11/2026" }
];
const loadSavedPackages = (): Package[] => {
  const saved = localStorage.getItem("mgt-packages");
  if (!saved) return packages.filter(packageHasPhoto).map(enrichPackage);
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return packages.filter(packageHasPhoto).map(enrichPackage);
    const savedPackages = (parsed as Package[]).filter(packageHasPhoto);
    const normalizedPackages = savedPackages.map(savedItem => {
      const defaults = packages.find(item => item.id === savedItem.id);
      return enrichPackage({ ...defaults, ...savedItem } as Package);
    });
    const missingDefaults = packages.filter(item => packageHasPhoto(item) && !savedPackages.some(savedItem => savedItem.id === item.id));
    return [...normalizedPackages, ...missingDefaults.map(enrichPackage)];
  } catch {
    return packages.filter(packageHasPhoto).map(enrichPackage);
  }
};

const slugifyPackage = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const currentPackageSlug = () => window.location.pathname.match(/^\/paquetes\/([^/]+)\/?$/)?.[1] || "";
const currentBookingSlug = () => window.location.pathname.match(/^\/reservar\/([^/]+)\/?$/)?.[1] || "";

export default function App() {
  const initialSlug = currentPackageSlug();
  const initialBookingSlug = currentBookingSlug();
  const initialPackages = loadSavedPackages();
  const initialRoutePackage = initialPackages.find(item => slugifyPackage(item.name) === (initialBookingSlug || initialSlug)) || packages.find(item => slugifyPackage(item.name) === (initialBookingSlug || initialSlug));
  const employeeSession = localStorage.getItem("mgt-employee-session") || "";
  const initialPage: Page = (initialBookingSlug || window.location.pathname === "/checkout" || window.location.pathname === "/reservar") ? "checkout" : initialSlug ? "detail" : window.location.pathname === "/paquetes" ? "results" : window.location.pathname === "/mi-cuenta" ? "account" : window.location.pathname === "/iniciar-sesion" ? "login" : window.location.pathname === "/crear-cuenta" ? "register" : window.location.pathname === "/contacto" ? "support" : window.location.pathname === "/employee-login" ? "employee-login" : window.location.pathname === "/employee" ? "employee" : "home";
  const [page, setPage] = useState<Page>(() => initialPage);
  const [routeNotFound, setRouteNotFound] = useState(Boolean((initialSlug || initialBookingSlug) && !initialRoutePackage));
  const [heroSlide, setHeroSlide] = useState(0);
  const [employeePackages, setEmployeePackages] = useState<Package[]>(initialPackages);
  const [focalEditPackageId, setFocalEditPackageId] = useState(1);
  const [employee, setEmployee] = useState(employeeSession);
  const [employeeTab, setEmployeeTab] = useState<"overview" | "packages" | "offers" | "quotes" | "income" | "messages" | "bookings">("overview");
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>(() => { const saved = readDraft("mgt-income-entries"); if (saved) { try { const parsed = JSON.parse(saved) as IncomeEntry[]; if (Array.isArray(parsed)) return parsed; } catch { /* Datos de demostración. */ } } return demoIncomeEntries; });
  const [incomeConcept, setIncomeConcept] = useState(() => readDraft("mgt-draft-income-concept"));
  const [incomeAmount, setIncomeAmount] = useState(() => readDraft("mgt-draft-income-amount"));
  const [offerPackageId, setOfferPackageId] = useState(1);
  const [offerPercent, setOfferPercent] = useState("15");
  const [offerEndDate, setOfferEndDate] = useState(() => readDraft("mgt-draft-offer-end"));
  const [employeeMessage, setEmployeeMessage] = useState(() => readDraft("mgt-draft-employee-message"));
  const [newPackageName, setNewPackageName] = useState(() => readDraft("mgt-draft-package-name"));
  const [newPackagePrice, setNewPackagePrice] = useState(() => readDraft("mgt-draft-package-price"));
  const [newPackageOldPrice, setNewPackageOldPrice] = useState(() => readDraft("mgt-draft-package-old-price"));
  const [newPackageFeatured, setNewPackageFeatured] = useState(false);
  const [newPackagePromo, setNewPackagePromo] = useState(false);
  const [newPackageCountry, setNewPackageCountry] = useState(() => readDraft("mgt-draft-package-country"));
  const [newPackageDepartureCity, setNewPackageDepartureCity] = useState(() => readDraft("mgt-draft-package-departure-city"));
  const [newPackageDepartureDate, setNewPackageDepartureDate] = useState(() => readDraft("mgt-draft-package-departure-date"));
  const [newPackageReturnDate, setNewPackageReturnDate] = useState(() => readDraft("mgt-draft-package-return-date"));
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [packageEditDraft, setPackageEditDraft] = useState({ departureCity: "", departureDate: "", returnDate: "", price: "" });
  const [newPackageCategory, setNewPackageCategory] = useState(() => readDraft("mgt-draft-package-category", "Playas"));
  const [newPackageImage, setNewPackageImage] = useState(() => readDraft("mgt-draft-package-image"));
  const [selected, setSelected] = useState<Package>(initialRoutePackage || initialPackages[0] || packages[0]);
  const [query, setQuery] = useState(() => readDraft("mgt-draft-destination"));
  const [origin, setOrigin] = useState(() => readDraft("mgt-draft-origin"));
  const [activeLocationField, setActiveLocationField] = useState<"origin" | "destination" | null>(null);
  const locationOptions = ["Buenos Aires, Argentina", "Córdoba, Argentina", "Villa María, Córdoba, Argentina", "Leones, Córdoba, Argentina", "Mendoza, Argentina", "Bariloche, Argentina", "Salta, Argentina", "Iguazú, Misiones, Argentina", "Montevideo, Uruguay", "Punta del Este, Uruguay", "Santiago, Chile", "Río de Janeiro, Brasil", "São Paulo, Brasil", "Florianópolis, Brasil", "Camboriú, Brasil", "El Chaltén, Santa Cruz, Argentina", "Cancún, México", "Ciudad de México, México", "Punta Cana, República Dominicana", "Nueva York, Estados Unidos", "Miami, Estados Unidos", "Madrid, España", "Barcelona, España", "Roma, Italia", "París, Francia", "Londres, Reino Unido"];
  const [category, setCategory] = useState("Todos");
  const [activeService, setActiveService] = useState("Paquetes");
  const [accommodation, setAccommodation] = useState(() => readDraft("mgt-draft-accommodation", "Todos"));
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const [date, setDate] = useState(() => readDraft("mgt-draft-search-date"));
  const [returnDate, setReturnDate] = useState(() => readDraft("mgt-draft-search-return-date"));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => readDraft("mgt-draft-search-date"));
  const [draftReturnDate, setDraftReturnDate] = useState(() => readDraft("mgt-draft-search-return-date"));
  const [calendarMonth, setCalendarMonth] = useState(() => { const initial = readDraft("mgt-draft-search-date"); const base = initial ? new Date(`${initial}T00:00:00`) : new Date(); return new Date(base.getFullYear(), base.getMonth(), 1); });
  const [travelers, setTravelers] = useState(() => Math.min(9, Math.max(1, Number(readDraft("mgt-draft-travelers", "2")) || 2)));
  const [childrenTravelers, setChildrenTravelers] = useState(0);
  const [infantTravelers, setInfantTravelers] = useState(0);
  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);
  const totalTravelers = travelers + childrenTravelers + infantTravelers;
  useEffect(() => { setAdditionalPassengers(current => { const target = Math.max(0, totalTravelers - 1); if (current.length === target) return current; return current.length > target ? current.slice(0, target) : [...current, ...Array.from({ length: target - current.length }, () => ({ fullName: "", documentNumber: "", birthDate: "", nationality: "Argentina" }))]; }); }, [totalTravelers]);
  const [favorites, setFavorites] = useState<number[]>(() => { try { const saved = JSON.parse(localStorage.getItem("mgt-favorites") || "[1]"); return Array.isArray(saved) ? saved.filter((id): id is number => typeof id === "number") : [1]; } catch { return [1]; } });
  const [user, setUser] = useState(localStorage.getItem("mgt-user") || "");
  const [profileEmail, setProfileEmail] = useState(() => readDraft("mgt-draft-profile-email", localStorage.getItem("mgt-email") || ""));
  const [profilePhone, setProfilePhone] = useState(() => readDraft("mgt-draft-profile-phone", localStorage.getItem("mgt-phone") || ""));
  const [accountSection, setAccountSection] = useState<"bookings" | "profile" | "favorites" | "recent" | "notifications">("bookings");
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; message: string; date: string; read: boolean; kind: "booking" | "payment" | "offer" | "system" }>>(() => { try { const saved = localStorage.getItem("mgt-notifications"); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; } } catch { /* Se muestran notificaciones de ejemplo. */ } return [
    { id: 1, title: "¡Te damos la bienvenida!", message: "Desde acá vas a recibir novedades sobre tus reservas, pagos y ofertas.", date: new Date().toISOString(), read: false, kind: "system" },
    { id: 2, title: "Ofertas para tu próximo viaje", message: "Hay nuevos destinos y promociones disponibles en nuestro catálogo.", date: new Date(Date.now() - 86400000).toISOString(), read: false, kind: "offer" },
    { id: 3, title: "Tu cuenta está lista", message: "Completá tus datos en Mi perfil para tener tu información actualizada.", date: new Date(Date.now() - 172800000).toISOString(), read: true, kind: "system" }
  ]; });
  const [recentSearches, setRecentSearches] = useState<string[]>(JSON.parse(localStorage.getItem("mgt-recent-searches") || "[]"));
  const [bookings, setBookings] = useState<string[]>(JSON.parse(localStorage.getItem("mgt-bookings") || "[]"));
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<
    { from: "assistant" | "user"; text: string }[]
  >([
    { from: "assistant", text: "¡Hola! 👋 Soy el asistente virtual de MundoGlobal Travel. ¿Necesitás ayuda para organizar tu próximo viaje?" }
  ]);
  const [showPassword, setShowPassword] = useState(false);
  const [passengerName, setPassengerName] = useState(() => readDraft("mgt-draft-passenger-name", user));
  const [passengerEmail, setPassengerEmail] = useState(() => readDraft("mgt-draft-passenger-email"));
  const [passengerPhone, setPassengerPhone] = useState(() => readDraft("mgt-draft-passenger-phone"));
  const [passengerDocument, setPassengerDocument] = useState(() => readDraft("mgt-draft-passenger-document"));
  const [passengerBirthDate, setPassengerBirthDate] = useState(() => readDraft("mgt-draft-passenger-birth"));
  const [passengerNationality, setPassengerNationality] = useState(() => readDraft("mgt-draft-passenger-nationality", "Argentina"));
  const [additionalPassengers, setAdditionalPassengers] = useState<BookingPassenger[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [activeNav, setActiveNav] = useState(initialSlug ? "Paquetes" : "Inicio");
  const [isSearching, setIsSearching] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(() => readDraft("mgt-draft-payment-method"));
  const [checkoutInstallments, setCheckoutInstallments] = useState(1);
  const [checkoutConfirmed, setCheckoutConfirmed] = useState(false);
  const [reservationReference, setReservationReference] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [authEmail, setAuthEmail] = useState(() => readDraft("mgt-draft-auth-email"));
  const [authFullName, setAuthFullName] = useState(() => readDraft("mgt-draft-auth-name"));
  const [authPassword, setAuthPassword] = useState("");
  const [employeeEmailDraft, setEmployeeEmailDraft] = useState(() => readDraft("mgt-draft-employee-email", "empleado@mundoglobal.com"));
  const [employeePasswordDraft, setEmployeePasswordDraft] = useState("");
  const [contactName, setContactName] = useState(() => readDraft("mgt-draft-contact-name"));
  const [contactEmail, setContactEmail] = useState(() => readDraft("mgt-draft-contact-email"));
  const [contactMessage, setContactMessage] = useState(() => readDraft("mgt-draft-contact-message"));
  const [claimFiles, setClaimFiles] = useState<File[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState(() => readDraft("mgt-draft-newsletter-email"));
  const [animatingFavorite, setAnimatingFavorite] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [staffMessages, setStaffMessages] = useState<Array<{ id: number; name: string; subject: string; body: string; status: string; reply?: string; attachmentName?: string; attachmentData?: string; attachmentType?: string; attachments?: Array<{ name: string; data: string; type: string }> }>>(() => { try { const saved = localStorage.getItem("mgt-staff-messages"); if (saved) return JSON.parse(saved); } catch { /* Se utilizan las conversaciones de muestra. */ } return [
    { id: 1, name: "María González", subject: "Consulta por paquete a Cancún", body: "Hola, ¿el paquete incluye equipaje para despachar?", status: "Pendiente" },
    { id: 2, name: "Lucas Fernández", subject: "Cambio de fecha", body: "Necesitaría saber si puedo modificar la fecha de salida de mi viaje.", status: "Pendiente" },
    { id: 3, name: "Sofía Martínez", subject: "Medios de pago", body: "¿Puedo abonar una parte con tarjeta y otra por transferencia?", status: "Respondido", reply: "¡Hola, Sofía! Sí, podés combinar los medios de pago. Te ayudamos a coordinarlo con un asesor." }
  ]; });
  const [activeStaffMessageId, setActiveStaffMessageId] = useState(1);

  useEffect(() => {
    writeDraft("mgt-draft-employee-message", employeeMessage);
    writeDraft("mgt-draft-package-name", newPackageName);
    writeDraft("mgt-draft-package-price", newPackagePrice);
    writeDraft("mgt-draft-package-old-price", newPackageOldPrice);
    writeDraft("mgt-draft-package-country", newPackageCountry);
    writeDraft("mgt-draft-package-departure-city", newPackageDepartureCity);
    writeDraft("mgt-draft-package-departure-date", newPackageDepartureDate);
    writeDraft("mgt-draft-package-return-date", newPackageReturnDate);
    writeDraft("mgt-draft-package-image", newPackageImage);
    writeDraft("mgt-draft-package-category", newPackageCategory);
    writeDraft("mgt-draft-destination", query);
    writeDraft("mgt-draft-origin", origin);
    writeDraft("mgt-draft-accommodation", accommodation);
    writeDraft("mgt-draft-search-date", date);
    writeDraft("mgt-draft-search-return-date", returnDate);
    writeDraft("mgt-draft-travelers", String(travelers));
    writeDraft("mgt-draft-profile-email", profileEmail);
    writeDraft("mgt-draft-profile-phone", profilePhone);
    writeDraft("mgt-draft-passenger-name", passengerName);
    writeDraft("mgt-draft-passenger-email", passengerEmail);
    writeDraft("mgt-draft-payment-method", paymentMethod);
    writeDraft("mgt-draft-auth-email", authEmail);
    writeDraft("mgt-draft-auth-name", authFullName);
    writeDraft("mgt-draft-employee-email", employeeEmailDraft);
    writeDraft("mgt-draft-contact-name", contactName);
    writeDraft("mgt-draft-contact-email", contactEmail);
    writeDraft("mgt-draft-contact-message", contactMessage);
    writeDraft("mgt-draft-newsletter-email", newsletterEmail);
    writeDraft("mgt-draft-income-concept", incomeConcept);
    writeDraft("mgt-draft-income-amount", incomeAmount);
    writeDraft("mgt-draft-offer-end", offerEndDate);
  }, [
    employeeMessage, newPackageName, newPackagePrice, newPackageOldPrice, newPackageCountry, newPackageCategory,
    newPackageDepartureCity, newPackageDepartureDate, newPackageReturnDate, newPackageImage,
    query, origin, accommodation, date, returnDate, travelers, profileEmail, profilePhone,
    passengerName, passengerEmail, paymentMethod, authEmail, authFullName,
    employeeEmailDraft, contactName, contactEmail, contactMessage, newsletterEmail,
    incomeConcept, incomeAmount, offerEndDate
  ]);

  useEffect(() => {
    localStorage.setItem("mgt-packages", JSON.stringify(employeePackages.filter(packageHasPhoto)));
  }, [employeePackages]);
  useEffect(() => { localStorage.setItem("mgt-favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("mgt-income-entries", JSON.stringify(incomeEntries)); }, [incomeEntries]);
  useEffect(() => { localStorage.setItem("mgt-staff-messages", JSON.stringify(staffMessages)); }, [staffMessages]);

  useEffect(() => {
    const handlePackageRoute = () => {
      const bookingSlug = currentBookingSlug();
      const slug = currentPackageSlug();
      if (bookingSlug || window.location.pathname === "/checkout" || window.location.pathname === "/reservar") {
        const found = employeePackages.find(item => slugifyPackage(item.name) === bookingSlug) || packages.find(item => slugifyPackage(item.name) === bookingSlug);
        setActiveNav(""); setPage("checkout"); setRouteNotFound(Boolean(bookingSlug && !found));
        if (found) setSelected(found);
      } else if (slug) {
        const found = employeePackages.find(item => slugifyPackage(item.name) === slug) || packages.find(item => slugifyPackage(item.name) === slug);
        setActiveNav("Paquetes"); setPage("detail"); setRouteNotFound(!found);
        if (found) setSelected(found);
      } else if (window.location.pathname === "/paquetes") {
        setRouteNotFound(false); setActiveNav("Paquetes"); setPage("results");
      } else if (window.location.pathname === "/mi-cuenta") {
        setRouteNotFound(false); setActiveNav(""); setPage("account");
      } else if (window.location.pathname === "/iniciar-sesion") {
        setRouteNotFound(false); setActiveNav(""); setPage("login");
      } else if (window.location.pathname === "/crear-cuenta") {
        setRouteNotFound(false); setActiveNav(""); setPage("register");
      } else if (window.location.pathname === "/contacto") {
        setRouteNotFound(false); setActiveNav("Contacto"); setPage("support");
      } else if (window.location.pathname === "/employee-login") {
        setRouteNotFound(false); setActiveNav(""); setPage("employee-login");
      } else if (window.location.pathname === "/employee") {
        setRouteNotFound(false); setActiveNav("");
        setPage("employee");
      } else {
        setRouteNotFound(false); setActiveNav("Inicio"); setPage("home");
      }
    };
    window.addEventListener("popstate", handlePackageRoute);
    return () => window.removeEventListener("popstate", handlePackageRoute);
  }, [employeePackages]);

  useEffect(() => {
    const interval = window.setInterval(() => setHeroSlide(current => (current + 1) % 4), 3000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const go = (p: Page) => {
    setPage(p); setMobileMenu(false); setRouteNotFound(false);
    if (p === "home") setActiveNav("Inicio"); else if (p === "support") setActiveNav("Contacto"); else if (p !== "results" && p !== "detail") setActiveNav("");
    const routePaths: Partial<Record<Page, string>> = { home: "/", results: "/paquetes", checkout: `/reservar/${slugifyPackage(selected.name)}`, account: "/mi-cuenta", login: "/iniciar-sesion", register: "/crear-cuenta", support: "/contacto", "employee-login": "/employee-login", employee: "/employee" };
    const nextPath = routePaths[p];
    if (nextPath && window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openPackage = (p: Package) => {
    setSelected(p); setActiveNav("Paquetes"); setRouteNotFound(false);
    window.history.pushState({}, "", `/paquetes/${slugifyPackage(p.name)}`);
    go("detail");
  };
  const toggleFavorite = (id: number) => { setAnimatingFavorite(id); window.setTimeout(() => setAnimatingFavorite(current => current === id ? null : current), 480); setFavorites(v => { const next = v.includes(id) ? v.filter(x => x !== id) : [...v, id]; setToast(next.includes(id) ? "¡Paquete guardado en tus favoritos!" : "Paquete quitado de favoritos."); return next; }); };
  const addNotification = (title: string, message: string, kind: "booking" | "payment" | "offer" | "system" = "system") => setNotifications(items => { const next = [{ id: Date.now(), title, message, date: new Date().toISOString(), read: false, kind }, ...items]; try { localStorage.setItem("mgt-notifications", JSON.stringify(next)); } catch { /* La bandeja sigue disponible durante esta sesión. */ } return next; });
  const markNotificationRead = (id: number) => setNotifications(items => { const next = items.map(item => item.id === id ? { ...item, read: true } : item); try { localStorage.setItem("mgt-notifications", JSON.stringify(next)); } catch { /* Sin almacenamiento persistente. */ } return next; });
  const unreadNotifications = notifications.filter(item => !item.read).length;
  const submitSearch = () => {
    if (isSearching) return;
    setIsSearching(true);
    const term = query.trim();
    const next = [term, ...recentSearches.filter(x => x.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(next);
    localStorage.setItem("mgt-recent-searches", JSON.stringify(next));
    setSearchSubmitted(true);
    setActiveNav("Paquetes");
    window.setTimeout(() => { setIsSearching(false); go("results"); }, 650);
  };
  const filtered = useMemo(() => employeePackages.filter(p =>
    (category === "Todos" || p.category === category) &&
    (!origin.trim() || (p.departureCity ?? "").toLowerCase().includes(origin.trim().split(",")[0].toLowerCase())) &&
    (`${p.name} ${p.country}`.toLowerCase().includes(query.trim().split(",")[0].trim().toLowerCase())) &&
    (!p.price || (p.price >= minPrice && p.price <= maxPrice)) &&
    (!onlyOffers || p.flags?.promo || p.tag === "¡Oferta!") &&
    (!topRatedOnly || (p.rating ?? 0) >= 4.8) &&
    (!date || !p.departureDate || p.departureDate >= date) && (!returnDate || !p.returnDate || p.returnDate <= returnDate)
  ), [category, query, origin, employeePackages, maxPrice, onlyOffers, topRatedOnly, date, returnDate]);
  const focalEditingPackage = employeePackages.find(p => p.id === focalEditPackageId) ?? employeePackages[0];
  const quoteForPackage = (p: Package) => p.servicePrices ?? (p.price ? buildServicePrices(p.price) : undefined);
  const collectedIncome = incomeEntries.filter(entry => entry.status === "Acreditado").reduce((total, entry) => total + entry.amount, 0);
  const pendingIncome = incomeEntries.filter(entry => entry.status === "Pendiente").reduce((total, entry) => total + entry.amount, 0);
  const sortedPackages = useMemo(() => [...filtered].sort((a, b) => {
    if (sortBy === "price") return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
    if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return Number(Boolean(b.tag)) - Number(Boolean(a.tag));
  }), [filtered, sortBy]);

  const employeeLogin = (email: string, password: string) => {
    if (email.trim().toLowerCase() !== "empleado@mundoglobal.com" || password !== "MundoGlobal2026") {
      setToast("Credenciales de demostración incorrectas.");
      return;
    }
    setEmployee("Camila Torres");
    localStorage.setItem("mgt-employee-session", "Camila Torres");
    setEmployeeTab("overview");
    setEmployeeEmailDraft("");
    setEmployeePasswordDraft("");
    writeDraft("mgt-draft-employee-email", "");
    go("employee");
    setToast("Bienvenida al panel de gestión.");
  };

  const login = (email: string, fullName = "") => {
    const generatedName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Viajero";
    const name = fullName.trim() || generatedName;
    setUser(name); localStorage.setItem("mgt-user", name); go("account"); setToast(`¡Bienvenido/a, ${name}!`);
  };
  const reserve = () => {
    // Modo demostración: registra la reserva y muestra el comprobante descargable.
    completeReservation();
    setCheckoutConfirmed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const completeReservation = () => {
    const cleanName = passengerName.trim() || "Pasajero";
    const selectedPrice = selected.price ?? 0;
    const passengers: BookingPassenger[] = [{ fullName: cleanName, documentNumber: passengerDocument.trim(), birthDate: passengerBirthDate, nationality: passengerNationality.trim() }, ...additionalPassengers.map(p => ({ ...p, fullName: p.fullName.trim(), documentNumber: p.documentNumber.trim(), nationality: p.nationality.trim() }))];
    const id = `MGT-${Math.floor(100000 + Math.random() * 900000)}`;
    setReservationReference(id);
    const next = [...bookings, `${selected.name} · ${id} · ${money(selectedPrice * totalTravelers)} · Sale desde ${selected.departureCity} · Ida ${formatTravelDate(selected.departureDate)} · Vuelta ${formatTravelDate(selected.returnDate)}`];
    setBookings(next); localStorage.setItem("mgt-bookings", JSON.stringify(next));
    setIncomeEntries(items => [{ id: Date.now(), reference: id, client: cleanName, destination: selected.name, departureCity: selected.departureCity, departureDate: selected.departureDate, returnDate: selected.returnDate, amount: selectedPrice * totalTravelers, method: paymentMethod === "Tarjeta de crédito" ? `Tarjeta de crédito · ${checkoutInstallments} cuota(s)` : (paymentMethod || "Medio de pago de demostración"), status: "Acreditado", date: todayISO, travelers: totalTravelers, nights: selected.nights ?? (selected.days ? selected.days - 1 : undefined), passengers } , ...items]);
    addNotification("Pago aprobado", `El pago de tu reserva ${id} para ${selected.name} fue aprobado (simulación).`, "payment");
    addNotification("Reserva confirmada", `Tu reserva para ${selected.name} (${id}) quedó confirmada.`, "booking");
  };

  const downloadReservation = () => {
    const total = money((selected.price ?? 0) * totalTravelers);
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => { const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }; return entities[char] || char; });
    const details = [
      ["Código de reserva", reservationReference],
      ["Destino", `${selected.name} · ${selected.country}`],
      ["Pasajeros", String(totalTravelers)],
      ["Salida desde", selected.departureCity || "A confirmar"],
      ["Fecha de ida", selected.departureDate ? formatTravelDate(selected.departureDate) : "A confirmar"],
      ["Fecha de vuelta", selected.returnDate ? formatTravelDate(selected.returnDate) : "A confirmar"],
      ["Duración", selected.nights ? `${selected.nights} noches` : selected.days ? `${selected.days} días` : "A confirmar"],
      ["Medio de pago", paymentMethod || "Demostración"],
      ["Importe total", total],
      ["Estado", "Reserva confirmada · Pago aprobado (simulación)"]
    ];
    const rows = details.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("");
    const documentHtml = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reserva ${escapeHtml(reservationReference)}</title><style>body{font-family:Arial,sans-serif;color:#172b4d;margin:48px auto;max-width:760px;padding:0 28px}header{border-bottom:3px solid #f4b400;padding-bottom:20px;margin-bottom:28px}h1{margin:0 0 8px;color:#123d70}p{color:#52647a}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{text-align:left;padding:14px;border-bottom:1px solid #e5eaf0}th{width:38%;color:#52647a}td{font-weight:600}.note{background:#fff8e5;padding:14px;border-radius:8px;font-size:13px}@media print{body{margin:20px auto}}</style></head><body><header><h1>MundoGlobal Travel</h1><p>Comprobante de reserva</p></header><h2>¡Tu viaje está confirmado!</h2><p>Guardá este comprobante como constancia de tu reserva.</p><table>${rows}</table><p class="note">Documento de demostración académica. El pago no fue procesado por una entidad financiera ni representa una operación comercial real.</p></body></html>`;
    const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reserva-${reservationReference || "mundoglobal"}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const answerAssistant = (raw: string) => {
    const question = raw.trim();
    if (!question) return;
    const normalized = question.toLowerCase();
    let answer = "¡Claro! Puedo orientarte. Por ahora puedo ayudarte con información general sobre paquetes, vuelos, hoteles, pagos y reservas. Si necesitás resolver un caso particular, puedo conectarte con nuestro equipo de atención.";
    if (/hola|buenas|buenos días|buenas tardes/.test(normalized)) {
      answer = "¡Hola! 😊 Qué bueno tenerte por acá. Contame qué estás buscando y te ayudo a encontrar la mejor opción.";
    } else if (/paquete|destino|viaje|oferta|precio|cancún|roma|brasil|punta cana/.test(normalized)) {
      answer = "¡Tenemos varias opciones! 🌎 En nuestra sección Paquetes podés explorar Cancún, Roma, Nueva York, Punta Cana, Camboriú, El Chaltén y Madrid. Cada propuesta muestra los datos que están disponibles para ese destino. ¿Querés que te muestre los paquetes?";
    } else if (/vuelo|avión|equipaje|valija/.test(normalized)) {
      answer = "✈️ Los paquetes de demostración incluyen vuelos de ida y vuelta y equipaje de mano. El equipaje para despachar puede depender de la tarifa y la aerolínea; te recomendamos confirmarlo con un asesor antes de reservar.";
    } else if (/hotel|alojamiento|all inclusive|habitación/.test(normalized)) {
      answer = "🏨 El alojamiento en hotel y la asistencia al viajero tienen un costo: cada paquete muestra sus importes dentro del precio total. Los valores son estimativos en esta demo y la tarifa definitiva se confirma con cada proveedor.";
    } else if (/pago|pagar|tarjeta|transferencia|cuota|financi/.test(normalized)) {
      answer = "💳 En esta demo se muestran medios de pago como tarjetas y transferencia. No se procesa ningún cobro real. Para consultar cuotas, promociones o condiciones específicas, puedo derivarte a un asesor.";
    } else if (/reserva|reservar|confirmar|cancelar|cambio|modificar/.test(normalized)) {
      answer = "🎫 Para iniciar una reserva, elegí un paquete, indicá la fecha y cantidad de pasajeros, y completá los datos del pasajero principal. La confirmación de este prototipo es simulada: no genera una reserva real.";
    } else if (/persona|asesor|humano|empleado|contacto|ayuda/.test(normalized)) {
      answer = "¡Por supuesto! Un asesor puede ayudarte con una consulta personalizada. Tocá el botón “Hablar con un asesor” y te llevo a nuestro espacio de contacto.";
    } else if (/gracias/.test(normalized)) {
      answer = "¡De nada! 💙 Estamos para ayudarte a que tu próximo viaje sea una gran experiencia.";
    }
    setAssistantMessages(items => [...items, { from: "user" as const, text: question }, { from: "assistant" as const, text: answer }]);
    setAssistantInput("");
  };
  const renderHeader = () => <header className={`header ${page === "detail" ? "header-package-detail" : ""}`}>
    <div className="nav-wrap">
      <button className="brand" onClick={() => go("home")} aria-label="Ir al inicio">
        <img className="brand-logo" src="/images/mundoglobal_travel.svg" alt="MundoGlobal Travel" />
      </button>
      <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
        <button className={activeNav === "Inicio" ? "active" : ""} onClick={() => { setActiveNav("Inicio"); go("home"); }}>Inicio</button>
        <button className={activeNav === "Paquetes" ? "active" : ""} onClick={() => { setActiveNav("Paquetes"); setCategory("Todos"); setOnlyOffers(false); go("results"); }}>Paquetes</button>
        <button className={activeNav === "Destinos" ? "active" : ""} onClick={() => { setActiveNav("Destinos"); setCategory("Ciudades"); setOnlyOffers(false); go("results"); }}>Destinos</button>
        <button className={activeNav === "Ofertas" ? "active" : ""} onClick={() => { setActiveNav("Ofertas"); setCategory("Todos"); setOnlyOffers(true); go("results"); }}>Ofertas</button>
        <button className={activeNav === "Contacto" ? "active" : ""} onClick={() => { setActiveNav("Contacto"); go("support"); }}>Contacto</button>
      </nav>
      <div className="nav-actions">
        {page === "employee" ? <span className="employee-role-pill"><UserRound size={16}/> Empleado <i/></span> : <button className="account-pill" onClick={() => go("account")}><UserRound size={16}/>{user || "Iniciar sesión"}{user && <ChevronDown size={14}/>}</button>}
        {page === "detail" && !routeNotFound && <button className="nav-book-now" onClick={() => document.querySelector<HTMLButtonElement>(".package-consult-button")?.click()}>Reservar ahora</button>}
        <button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button>
      </div>
    </div>
  </header>;

  const renderFooter = () => <footer className="footer">
    <div className="footer-grid">
      <div><div className="brand brand-light"><img className="brand-logo brand-logo-light" src="/images/mundoglobal_travel.svg" alt="MundoGlobal Travel" /></div><p>Tu mundo, nuestro destino.<br/>Viajá más lejos, viví más experiencias.</p><div className="socials"><Facebook/><Instagram/><Youtube/><Linkedin/></div></div>
      <div><b>Explorá</b><button onClick={() => go("results")}>Paquetes</button><button onClick={() => go("results")}>Destinos</button><button onClick={() => go("results")}>Ofertas</button></div>
      <div><b>Ayuda</b><button onClick={() => go("support")}>Preguntas frecuentes</button><button onClick={() => go("support")}>Contacto</button><button onClick={() => go("support")}>Asistencia al viajero</button></div>
      <div><b>Medios de pago</b><div className="payment-tags"><span>VISA</span><span>mastercard</span><span>Transferencia</span></div><p className="secure-note"><ShieldCheck size={16}/> Medios de pago ilustrativos</p></div>
    </div>
    <div className="footer-bottom"><span>© 2026 MundoGlobal Travel · Proyecto académico</span><span>Simulación: pagos y reservas no comerciales</span></div>
  </footer>;

  const renderPackageCard = (p: Package, featured = false) => <article key={p.id} className={`package-card ${featured ? "featured" : ""}`}>
    <div className="package-photo"><SmartImage className="package-smart-image" src={p.image} alt={p.name} preset="card-standard" ratio="4/3" fit="cover" focalPoint={p.focalPoint} safeArea={p.safeArea} priority={featured && p.id <= 4}/>
      {p.tag && <span className="offer-tag">{p.tag}</span>}
      <button type="button" className={`heart ${animatingFavorite === p.id ? "animate-heart" : ""} ${favorites.includes(p.id) ? "liked" : ""}`} onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(p.id); }} aria-label="Guardar favorito"><Heart size={18} fill={favorites.includes(p.id) ? "currentColor" : "none"}/></button>
    </div>
    <div className="package-info">
      <div className="package-heading"><div><h3>{p.name}</h3><p>{p.country} <span>·</span> {p.category}</p></div></div>
      {(p.rating || (p.reviews && p.reviews !== "0")) && <div className="offer-rating"><Star size={13} fill="currentColor"/> {p.rating ? p.rating.toFixed(1) : ""} {p.reviews && p.reviews !== "0" ? <small>({p.reviews})</small> : null}{p.tag==="¡Oferta!" && discount(p)>0 && <span className="discount">{discount(p)}% OFF</span>}</div>}
      <div className="price-line"><strong>{money(p.price)}</strong><del>{money(p.originalPrice ?? p.oldPrice)}</del></div>
      <div className="package-card-facts">{(p.nights || (p.days && p.days>1))&&<span><CalendarDays size={13}/>{p.nights ?? p.days!-1} noches</span>}{p.flags?.promo&&<span className="package-card-offer"><Tag size={12}/> En oferta</span>}{p.flags?.recommended&&<span className="package-card-featured"><Star size={12}/> Destacado</span>}</div>
      {p.departureCity && p.departureDate && <small className="package-schedule-inline">Desde {p.departureCity} · {formatTravelDate(p.departureDate)}</small>}
      <button className="outline-btn full offer-reserve" onClick={() => openPackage(p)}>Reservar <ArrowRight size={16}/></button>
    </div>
  </article>;

  const renderSearchBar = () => {
    const displayDate = (value: string) => {
      if (!value) return "Elegí fecha";
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).replace(".", "");
    };
    const matches = employeePackages.filter(packageHasPhoto).map(item => `${item.name}, ${item.country}`).filter(place => place.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 7);
    const calendarOffset = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
    const calendarDaysCount = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    const calendarCells = [...Array(calendarOffset).fill(null), ...Array.from({ length: calendarDaysCount }, (_, index) => index + 1)];
    const isoForDay = (day: number) => `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const monthLabel = calendarMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    return <div className="search-panel">
      <div className={`search-field location-field origin-search-field ${activeLocationField === "origin" ? "location-focused" : ""}`}>
        <span className="field-icon"><MapPin size={18}/></span>
        <span className="search-field-copy">
          <small>Origen</small>
          <input value={origin} onChange={e => setOrigin(e.target.value)} onFocus={() => setActiveLocationField("origin")} onBlur={() => window.setTimeout(() => setActiveLocationField(current => current === "origin" ? null : current), 140)} placeholder="¿Desde dónde salís?" aria-label="Origen" autoComplete="off" />
          {activeLocationField === "origin" && origin.trim().length > 0 && <div className="location-suggestions">
            {locationOptions.filter(place => place.toLowerCase().includes(origin.trim().toLowerCase())).slice(0,7).map(place => <button type="button" key={place} onMouseDown={e => e.preventDefault()} onClick={() => { setOrigin(place); setActiveLocationField(null); }}>{place}</button>)}
          </div>}
        </span>
      </div>
      <div className={`search-field location-field destination-search-field ${activeLocationField === "destination" ? "location-focused" : ""}`}>
        <span className="field-icon"><MapPin size={18}/></span>
        <span className="search-field-copy">
          <small>Destino</small>
          <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setActiveLocationField("destination")} onBlur={() => window.setTimeout(() => setActiveLocationField(current => current === "destination" ? null : current), 140)} placeholder="¿A dónde querés ir?" aria-label="Destino" autoComplete="off" />
          {activeLocationField === "destination" && query.trim().length > 0 && <div className="location-suggestions">
            {matches.length > 0 ? matches.map(place => <button type="button" key={place} onMouseDown={e => e.preventDefault()} onClick={() => { setQuery(place); setActiveLocationField(null); }}>{place}</button>) : <p>No encontramos coincidencias. Probá con otra ciudad o país.</p>}
          </div>}
        </span>
      </div>
      <div className="search-field date-range-field">
        <span className="field-icon"><CalendarDays size={18}/></span>
        <span className="search-field-copy">
          <small>Fechas</small>
          <button type="button" className="date-range-trigger" aria-label="Seleccionar fechas de ida y vuelta" aria-expanded={datePickerOpen} onClick={() => { setDraftDate(date); setDraftReturnDate(returnDate); setDatePickerOpen(open => !open); }}>
            {date && returnDate ? `${displayDate(date)} – ${displayDate(returnDate)}` : "Agregá fechas"}
            <ChevronDown size={13}/>
          </button>
          {datePickerOpen && <div className="search-calendar" role="dialog" aria-label="Seleccionar fechas de viaje">
            <div className="search-calendar-heading">
              <button type="button" aria-label="Mes anterior" onClick={() => setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>‹</button>
              <strong>{monthLabel}</strong>
              <button type="button" aria-label="Mes siguiente" onClick={() => setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>›</button>
            </div>
            <div className="search-calendar-grid search-calendar-weekdays">{["Lu","Ma","Mi","Ju","Vi","Sá","Do"].map(day => <span key={day}>{day}</span>)}</div>
            <div className="search-calendar-grid">{calendarCells.map((day,index) => {
              if (day === null) return <span key={`empty-${index}`}/>;
              const value = isoForDay(day);
              const selectedDay = value === draftDate || value === draftReturnDate;
              const inRange = Boolean(draftDate && draftReturnDate && value > draftDate && value < draftReturnDate);
              return <button key={value} type="button" disabled={value < todayISO} className={`search-calendar-day ${selectedDay ? "selected" : ""} ${inRange ? "in-range" : ""}`} onClick={() => {
                if (!draftDate || draftReturnDate || value < draftDate) { setDraftDate(value); setDraftReturnDate(""); }
                else setDraftReturnDate(value);
              }}>{day}</button>;
            })}</div>
            <p>{draftDate && !draftReturnDate ? "Ahora elegí la fecha de vuelta" : "Seleccioná ida y vuelta"}</p>
            <div className="search-calendar-actions">
              <button type="button" onClick={() => { setDraftDate(""); setDraftReturnDate(""); setDate(""); setReturnDate(""); setDatePickerOpen(false); }}>Limpiar</button>
              <button type="button" disabled={!draftDate || !draftReturnDate} onClick={() => { setDate(draftDate); setReturnDate(draftReturnDate); setDatePickerOpen(false); }}>Aplicar fechas</button>
            </div>
          </div>}
        </span>
      </div>
      <div className="search-field select-search-field passenger-search-field">
        <span className="field-icon"><Users size={18}/></span>
        <span className="search-field-copy"><small>Pasajeros</small>
          <button type="button" className="passenger-select-trigger" aria-expanded={passengerDropdownOpen} onClick={() => setPassengerDropdownOpen(open => !open)}>
            <span>{travelers} adultos{childrenTravelers ? ` · ${childrenTravelers} niños` : ""}{infantTravelers ? ` · ${infantTravelers} infantes` : ""}</span><ChevronDown size={14}/>
          </button>
          {passengerDropdownOpen && <div className="passenger-options">
            {([{label:"Adultos",detail:"12 años o más",value:travelers,set:setTravelers,min:1},{label:"Niños",detail:"De 2 a 11 años",value:childrenTravelers,set:setChildrenTravelers,min:0},{label:"Infantes",detail:"Menores de 2 años",value:infantTravelers,set:setInfantTravelers,min:0}] as const).map(item=><div className="passenger-counter-row" key={item.label}><span><b>{item.label}</b><small>{item.detail}</small></span><div><button type="button" aria-label={`Quitar ${item.label}`} disabled={item.value<=item.min} onClick={()=>item.set(value=>Math.max(item.min,value-1))}>−</button><strong>{item.value}</strong><button type="button" aria-label={`Agregar ${item.label}`} disabled={totalTravelers>=9} onClick={()=>item.set(value=>value+1)}>+</button></div></div>)}
            <button type="button" className="passenger-apply" onClick={()=>setPassengerDropdownOpen(false)}>Aplicar</button>
          </div>}
        </span>
      </div>
      <label className="search-field select-search-field accommodation-field">
        <span className="field-icon"><BedDouble size={18}/></span>
        <span className="search-field-copy"><small>Alojamiento</small>
          <select value={accommodation} onChange={e => setAccommodation(e.target.value)}><option>Todos</option><option>All Inclusive</option><option>Media pensión</option><option>Solo alojamiento</option></select>
        </span>
      </label>
      <button className={`primary-btn search-button ${isSearching ? "searching" : ""}`} onClick={submitSearch} disabled={isSearching}>{isSearching ? <><span className="search-spinner"/> Buscando...</> : <><Search size={17}/> Buscar</>}</button>
    </div>;
  };

  const renderHome = () => <><section className="hero-shell"><div className="hero hero-reference">
    <div className="hero-art" aria-hidden="true"><SmartImage className="hero-smart-image" src="/images/hero-mundo.svg" alt="" preset="hero" ratio="auto" focalPoint={{x:72,y:50}} fit="cover" priority/></div>
    <div className="hero-copy">
      <span className="eyebrow hero-trust-badge"><Plane size={15} fill="currentColor"/> MundoGlobal Travel · Experiencia interactiva</span>
      <h1>El mundo está<br/><span className="hero-title-line">esperando <em>por vos<svg className="hero-brush" viewBox="0 0 220 18" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12 C55 2 128 4 215 9 C158 13 65 17 3 12Z" fill="#F5B93A"/></svg></em></span></h1>
      <p>Explorá paquetes, compará sus servicios y completá una reserva en una experiencia simple e intuitiva.</p>
      <div className="hero-buttons">
        <button className="yellow-btn" onClick={() => {setOnlyOffers(false);setCategory("Todos");go("results");}}>Explorar destinos <ArrowRight size={16}/></button>
        <button className="ghost-btn" onClick={() => {setCategory("Todos");setOnlyOffers(true);go("results");}}><Tag size={16}/> Ver ofertas</button>
      </div>
      <div className="hero-service-tabs" aria-label="Exploración del sitio">
        <button className="active" type="button" onClick={() => {setOnlyOffers(false);setCategory("Todos");go("results");}}><Globe2 size={17}/> Paquetes</button>
        <button type="button" onClick={() => {setCategory("Ciudades");setOnlyOffers(false);go("results");}}><MapPin size={17}/> Destinos</button>
        <button type="button" onClick={() => {setCategory("Todos");setOnlyOffers(true);go("results");}}><Tag size={17}/> Ofertas</button>
        <button type="button" onClick={() => go("support")}><Headphones size={17}/> Ayuda</button>
      </div>
    </div>
  </div>{renderSearchBar()}</section>
  <section className="section destinations-section">
    <div className="category-row destination-filters">
      {[{name:"Todos",icon:null},{name:"Playas",icon:<Plane size={14}/>},{name:"Ciudades",icon:<Hotel size={14}/>},{name:"Aventuras",icon:<Sparkles size={14}/>},{name:"Cultura",icon:<Star size={14}/>}].map(item=><button type="button" key={item.name} className={category===item.name?"selected":""} onClick={()=>{setCategory(item.name);setOnlyOffers(false);}}>{item.icon}{item.name}</button>)}
    </div>
    <div className="destination-grid destination-reference">
      {employeePackages.filter(packageHasPhoto).map(p=><article className="destination-card" key={p.id}>
        <div className="destination-photo"><SmartImage className="destination-smart-image" src={p.image} alt={p.name} preset="card-standard" ratio="4/3" fit="cover" focalPoint={p.focalPoint} safeArea={p.safeArea}/><button type="button" className={`heart ${favorites.includes(p.id)?"liked":""}`} onClick={()=>toggleFavorite(p.id)} aria-label="Guardar favorito"><Heart size={17} fill={favorites.includes(p.id)?"currentColor":"none"}/></button><div className="destination-badges">{(p.flags?.promo || p.tag==="¡Oferta!")&&<span className="destination-badge destination-badge-offer">¡Oferta!</span>}{p.flags?.recommended&&<span className="destination-badge destination-badge-featured">★ Destacado</span>}{p.tag&&p.tag!=="¡Oferta!"&&p.tag!=="Destacado"&&<span className="destination-badge">{p.tag}</span>}</div></div>
        <div className="destination-info"><div><h3>{p.name}</h3><p>{p.country} · {p.category}</p><div className="destination-facts">{(p.nights || (p.days && p.days>1))&&<span><CalendarDays size={13}/>{p.nights ?? p.days!-1} noches</span>}{p.flags?.promo&&<span className="destination-fact-offer"><Tag size={12}/> En oferta</span>}{p.flags?.recommended&&<span className="destination-fact-featured"><Star size={12}/> Destacado</span>}</div>{p.rating && <span className="destination-rating"><Star size={14} fill="currentColor"/> {p.rating.toFixed(1)} {p.reviews && p.reviews !== "0" ? <small>({p.reviews})</small> : null}</span>}</div><button className="destination-arrow" onClick={()=>openPackage(p)} aria-label={`Ver ${p.name}`}><ArrowRight size={18}/></button></div>
      </article>)}
    </div>
  </section>
  <section className="benefit-strip"><div><span><Globe2/></span><b>Destinos variados<small>Un catálogo en un solo lugar</small></b></div><div><span><CalendarDays/></span><b>Datos del viaje<small>Fechas y noches visibles</small></b></div><div><span><Headphones/></span><b>Canal de consultas<small>Contacto con el equipo</small></b></div><div><span><CreditCard/></span><b>Opciones de pago<small>Flujo de reserva simulado</small></b></div></section>
  <section className="section offers-section">
    <div className="offer-grid offer-reference">{employeePackages.filter(p=>p.flags?.promo || p.tag === "¡Oferta!").slice(0,3).map(p=>renderPackageCard(p,true))}</div>
  </section>
  <section className="trust-section"><div className="trust-card"><div className="stars"><Globe2 size={20}/></div><h3>Catálogo centralizado</h3><p>Explorá destinos, categorías y paquetes desde una misma plataforma.</p><b>Exploración sencilla</b></div><div className="trust-card"><div className="stars"><CalendarDays size={20}/></div><h3>Información organizada</h3><p>Consultá duración, fechas, servicios incluidos y valores de referencia.</p><b>Detalles del paquete</b></div><div className="trust-card"><div className="stars"><MessageCircle size={20}/></div><h3>Acompañamiento</h3><p>Accedé al canal de consultas y al seguimiento de tus reservas de prueba.</p><b>Atención centralizada</b></div></section>
  <section className="newsletter"><div className="newsletter-icon"><Mail/></div><div><h3>¿Buscás más ayuda?</h3><p>Suscribite y recibí las mejores ofertas en tu email.</p></div><form onSubmit={e=>{e.preventDefault();if(!newsletterEmail.trim())return;setToast("¡Gracias por suscribirte!");setNewsletterEmail("");}}><input type="email" value={newsletterEmail} onChange={e=>setNewsletterEmail(e.target.value)} required placeholder="Tu email aquí..."/><button className="yellow-btn">Suscribirme <ArrowRight size={15}/></button></form></section>
  </>;

  const renderResults = () => <main className="page-container"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span> Paquetes</div><div className="page-title-row"><div><span className="kicker">ENCONTRÁ TU PRÓXIMA AVENTURA</span><h1>Paquetes de viaje</h1><p>Experiencias completas, pensadas para que solo te ocupes de disfrutar.</p></div><span className="results-count">{filtered.length} experiencias</span></div><div className="results-search">{renderSearchBar()}</div><div className="results-layout"><aside className="filters"><h3><SlidersHorizontal size={18}/> Filtrar resultados</h3><b>Tipo de viaje</b>{["Todos","Playas","Ciudades","Cultura","Aventuras"].map(c=><button key={c} className={category===c?"filter-active":""} onClick={()=>setCategory(c)}>{c}<span>{c==="Todos"?packages.length:packages.filter(p=>p.category===c).length}</span></button>)}<div className="filter-divider"/><b>Buscar destino o país</b><input className="filter-text-input" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. Cancún, Brasil, Italia..." aria-label="Buscar destino o país"/><div className="filter-divider"/><b>Rango de precio por persona</b><p className="filter-hint">Ingresá los importes en USD.</p><div className="filter-price-fields"><label>Desde<input type="number" min="0" step="50" value={minPrice} onChange={e=>setMinPrice(Math.max(0,Number(e.target.value)||0))}/></label><label>Hasta<input type="number" min={minPrice} step="50" value={maxPrice} onChange={e=>setMaxPrice(Math.max(minPrice,Number(e.target.value)||0))}/></label></div><input className="price-range" type="range" min={Math.max(0,minPrice)} max="2000" step="50" value={Math.min(maxPrice,2000)} onChange={e=>setMaxPrice(Math.max(minPrice,Number(e.target.value)))} aria-label="Precio máximo"/><div className="filter-divider"/><b>Preferencias</b><label className="check-label"><input type="checkbox" checked={onlyOffers} onChange={e=>setOnlyOffers(e.target.checked)}/> Solo ofertas</label><label className="check-label"><input type="checkbox" checked={topRatedOnly} onChange={e=>setTopRatedOnly(e.target.checked)}/> Mejor valorados (4.8+)</label><button className="filter-reset" onClick={()=>{setCategory("Todos");setQuery("");setMinPrice(0);setMaxPrice(2000);setOnlyOffers(false);setTopRatedOnly(false);setSortBy("recommended");}}>Limpiar todos los filtros</button></aside><div className="results-content"><div className="sort-row"><span>{filtered.length} paquetes encontrados</span><select aria-label="Ordenar paquetes" value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="recommended">Recomendados</option><option value="price">Menor precio</option><option value="rating">Mejor calificación</option></select></div><div className="results-grid">{sortedPackages.map(p=>renderPackageCard(p))}</div>{filtered.length===0&&<div className="empty-state"><Search size={34}/><h3>No encontramos resultados</h3><p>Probá con otro destino o categoría.</p><button className="primary-btn" onClick={()=>{setQuery("");setOrigin("");setCategory("Todos");setMinPrice(0);setMaxPrice(2000);setOnlyOffers(false);setTopRatedOnly(false);setSortBy("recommended");}}>Limpiar filtros</button></div>}</div></div></main>;

  const renderDetail = () => routeNotFound
    ? <main className="package-not-found"><span className="package-section-eyebrow">DESTINO NO DISPONIBLE</span><h1>No encontramos este paquete</h1><p>Puede que haya sido retirado del catálogo o que la dirección no sea correcta.</p><button className="primary-btn" onClick={()=>go("results")}>Ver paquetes disponibles <ArrowRight size={16}/></button></main>
    : <PackageDetailPage
        packageData={selected}
        packages={employeePackages}
        isFavorite={favorites.includes(selected.id)}
        favoriteIds={favorites}
        onToggleFavorite={()=>toggleFavorite(selected.id)}
        onTogglePackageFavorite={toggleFavorite}
        onHome={()=>go("home")}
        onPackages={()=>go("results")}
        onOpenPackage={item=>openPackage(item as Package)}
        onReserve={()=>go("checkout")}
        onConsultAvailability={payload=>{
          setStaffMessages(items=>[{id:Date.now(),name:payload.name,subject:`Disponibilidad · ${selected.name}`,body:`Correo: ${payload.email || "No indicado"} · Teléfono: ${payload.phone || "No indicado"} · Pasajeros: ${payload.travelers} · Fecha solicitada: ${payload.requestedDate || formatTravelDate(selected.departureDate) || "A coordinar"}`,status:"Pendiente"},...items]);
          setToast("Tu consulta fue enviada. El equipo de MundoGlobal Travel se comunicará con vos.");
        }}
        onContact={()=>go("support")}
      />;

  const renderAuthPage = (register = false) => <main className="auth-page">
    <div className="auth-promo"><div className="auth-promo-content">
      <span className="eyebrow"><Plane size={14}/> MundoGlobal Travel</span>
      <h1>{register ? "Tu próximo viaje empieza acá." : "Qué bueno tenerte de vuelta."}</h1>
      <p>{register ? "Creá tu cuenta para organizar tus viajes y tener tus reservas siempre a mano." : "Ingresá para consultar tus reservas y continuar organizando tu próxima aventura."}</p>
      <ul><li><Check/> Tus viajes en un solo lugar</li><li><Check/> Ofertas y destinos destacados</li><li><Check/> Atención personalizada</li></ul>
      <div className="promo-globe"><Globe2 size={220}/></div>
    </div></div>
    <div className="auth-form-side"><div className="auth-form">
      <div className="auth-avatar"><UserRound/></div>
      <span className="kicker">{register ? "CREÁ TU CUENTA" : "ACCESO A TU CUENTA"}</span>
      <h1>{register ? "Registrate" : "Iniciar sesión"}</h1>
      <p>{register ? "Completá tus datos para comenzar." : "Ingresá tus datos para continuar."}</p>
      <form onSubmit={event => {
        event.preventDefault();
        if (!authEmail.trim() || !authPassword) { setToast("Completá tu correo y contraseña."); return; }
        if (register && authFullName.trim().length < 3) { setToast("Ingresá tu nombre y apellido."); return; }
        if (!register && authEmail.trim().toLowerCase() === "empleado@mundoglobal.com") {
          employeeLogin(authEmail, authPassword);
          setAuthPassword("");
          setAuthEmail("");
          return;
        }
        login(authEmail, register ? authFullName : "");
        setAuthPassword("");
        setAuthEmail("");
        setAuthFullName("");
        writeDraft("mgt-draft-auth-email", "");
        writeDraft("mgt-draft-auth-name", "");
      }}>
        {register && <label>Nombre y apellido<input value={authFullName} onChange={event=>setAuthFullName(event.target.value)} autoComplete="name" required minLength={3} maxLength={80} placeholder="Tu nombre completo"/></label>}
        <label>Correo electrónico<div className="input-icon"><Mail/><input type="email" value={authEmail} onChange={event=>setAuthEmail(event.target.value)} autoComplete="email" required placeholder="tu@email.com"/></div></label>
        <label>Contraseña<div className="input-icon"><LockKeyhole/><input type="password" value={authPassword} onChange={event=>setAuthPassword(event.target.value)} autoComplete={register ? "new-password" : "current-password"} required placeholder="Tu contraseña"/></div></label>
        <button className="primary-btn full auth-submit" type="submit">{register ? "Crear cuenta" : "Ingresar"} <ArrowRight size={17}/></button>
      </form>
      <div className="auth-switch">{register ? <>¿Ya tenés cuenta? <button type="button" onClick={()=>go("login")}>Iniciá sesión</button></> : <>¿Todavía no tenés cuenta? <button type="button" onClick={()=>go("register")}>Crear cuenta</button></>}</div>
      <div className="auth-switch"><button type="button" onClick={()=>go("home")}>Volver al sitio</button></div>
      <div className="demo-warning"><CircleHelp/> Acceso de demostración: el registro y el inicio de sesión no validan una cuenta contra un servidor.</div>
    </div></div>
  </main>;

  const renderEmployeeLogin = () => <main className="auth-page employee-auth"><div className="auth-promo"><div className="auth-promo-content"><span className="eyebrow"><LockKeyhole size={14}/> Portal interno</span><h1>Gestioná cada viaje desde un solo lugar.</h1><p>Un espacio de trabajo para el equipo de MundoGlobal Travel: paquetes, consultas y reservas.</p><ul><li><Check/> Administración de paquetes</li><li><Check/> Atención de consultas</li><li><Check/> Seguimiento de reservas</li></ul><div className="promo-globe"><Globe2 size={220}/></div></div></div><div className="auth-form-side"><div className="auth-form"><div className="auth-avatar"><LockKeyhole/></div><span className="kicker">ACCESO DEL PERSONAL</span><h1>Portal de empleados</h1><p>Ingresá con tus credenciales internas para continuar.</p><form onSubmit={e=>{e.preventDefault();employeeLogin(employeeEmailDraft,employeePasswordDraft);}}><label>Correo corporativo<div className="input-icon"><Mail/><input name="email" type="email" value={employeeEmailDraft} onChange={e=>setEmployeeEmailDraft(e.target.value)} autoComplete="username" required placeholder="empleado@mundoglobal.com"/></div></label><label>Contraseña<div className="input-icon"><LockKeyhole/><input name="password" type="password" value={employeePasswordDraft} onChange={e=>setEmployeePasswordDraft(e.target.value)} autoComplete="current-password" required placeholder="Contraseña"/></div></label><button className="primary-btn full auth-submit">Ingresar al panel <ArrowRight size={17}/></button></form><div className="demo-warning employee-demo"><CircleHelp/> Acceso de prueba: empleado@mundoglobal.com · MundoGlobal2026</div><div className="auth-switch"><button onClick={()=>go("home")}>Volver al sitio público</button></div></div></div></main>;

  const renderEmployeePanel = () => <main className="page-container employee-page">
    <div className="employee-top"><div><span className="kicker">MUNDO GLOBAL TRAVEL · OPERACIONES</span><h1>Centro de operaciones</h1><p>Hola, {employee}. Administrá ventas, productos y atención al viajero.</p></div><button className="outline-btn" onClick={()=>{setEmployee("");localStorage.removeItem("mgt-employee-session");setEmployeePasswordDraft("");go("employee-login");}}><LogOut size={16}/> Cerrar sesión</button></div>
    <div className="employee-layout">
      <aside className="employee-sidebar">
        <b>Gestión de la agencia</b>
        <button className={employeeTab==="overview"?"current":""} onClick={()=>setEmployeeTab("overview")}><SlidersHorizontal/> Resumen</button>
        <button className={employeeTab==="packages"?"current":""} onClick={()=>setEmployeeTab("packages")}><Globe2/> Paquetes</button>
        <button className={employeeTab==="offers"?"current":""} onClick={()=>setEmployeeTab("offers")}><Percent/> Ofertas</button>
        <button className={employeeTab==="quotes"?"current":""} onClick={()=>setEmployeeTab("quotes")}><Building2/> Proveedores y cotizaciones</button>
        <button className={employeeTab==="income"?"current":""} onClick={()=>setEmployeeTab("income")}><Wallet/> Ingresos</button>
        <button className={employeeTab==="bookings"?"current":""} onClick={()=>setEmployeeTab("bookings")}><Ticket/> Reservas</button>
        <button className={employeeTab==="messages"?"current":""} onClick={()=>setEmployeeTab("messages")}><MessageCircle/> Atención al cliente <span className="nav-counter">{staffMessages.filter(m=>m.status==="Pendiente").length}</span></button>
        <div className="employee-api"><span className="api-dot"/><div><b>Integraciones</b><small>Prototipo local · proveedores y cobros no conectados</small></div></div>
      </aside>
      <section className="employee-workspace">
        {employeeTab==="overview"&&<>
          <div className="employee-section-title"><div><h2>Resumen del negocio</h2><p>Indicadores de muestra para supervisar la operación diaria.</p></div><span className="demo-label">DATOS SIMULADOS</span></div>
          <div className="employee-stats employee-stats-four">
            <article><span>Ingresos acreditados</span><b>{money(collectedIncome)}</b><small><TrendingUp/> Cobros registrados</small></article>
            <article><span>Pagos pendientes</span><b>{money(pendingIncome)}</b><small><Wallet/> Por conciliar</small></article>
            <article><span>Paquetes en catálogo</span><b>{employeePackages.length}</b><small><Globe2/> Publicados en la web</small></article>
            <article><span>Consultas por responder</span><b>{staffMessages.filter(m=>m.status==="Pendiente").length}</b><small><MessageCircle/> Atención al cliente</small></article>
          </div>
          <div className="employee-quick-actions">
            <button onClick={()=>setEmployeeTab("packages")}><span><Plus/></span><b>Publicar paquete</b><small>Crear un nuevo viaje</small></button>
            <button onClick={()=>setEmployeeTab("offers")}><span><Percent/></span><b>Crear una oferta</b><small>Aplicar una promoción</small></button>
            <button onClick={()=>setEmployeeTab("quotes")}><span><Building2/></span><b>Ver cotizaciones</b><small>Hoteles y servicios</small></button>
            <button onClick={()=>setEmployeeTab("income")}><span><DollarSign/></span><b>Gestionar ingresos</b><small>Cobros y pendientes</small></button>
          </div>
          <div className="employee-overview-grid">
            <article className="employee-overview-card">
              <div className="employee-card-heading"><div><h3>Estado de ingresos</h3><p>Importes ilustrativos en USD</p></div><button onClick={()=>setEmployeeTab("income")}>Ver detalle <ArrowRight size={14}/></button></div>
              <div className="employee-income-bar"><span style={{width:(collectedIncome+pendingIncome)>0?Math.round(collectedIncome/(collectedIncome+pendingIncome)*100)+"%":"0%"}}/></div>
              <div className="employee-income-legend"><span><i className="income-dot paid"/>Acreditado <b>{money(collectedIncome)}</b></span><span><i className="income-dot pending"/>Pendiente <b>{money(pendingIncome)}</b></span></div>
            </article>
            <article className="employee-overview-card">
              <div className="employee-card-heading"><div><h3>Actividad del equipo</h3><p>Accesos rápidos a tareas operativas</p></div></div>
              <button className="employee-activity-link" onClick={()=>setEmployeeTab("messages")}><MessageCircle/> Responder consultas pendientes <ArrowRight/></button>
              <button className="employee-activity-link" onClick={()=>setEmployeeTab("bookings")}><Ticket/> Revisar reservas <ArrowRight/></button>
              <button className="employee-activity-link" onClick={()=>setEmployeeTab("packages")}><ClipboardList/> Actualizar catálogo <ArrowRight/></button>
            </article>
          </div>
          <h3 className="employee-subtitle">Últimos movimientos</h3>
          <div className="employee-activity"><span><CheckCircle2/> {employeePackages.length} paquetes disponibles para publicar</span><small>Catálogo local</small></div>
          <div className="employee-activity"><span><Wallet/> {incomeEntries.filter(entry=>entry.status==="Pendiente").length} cobros pendientes de acreditación</span><small>Administración</small></div>
          <div className="employee-activity"><span><MessageCircle/> {staffMessages.filter(m=>m.status==="Pendiente").length} consultas necesitan respuesta</span><small>Atención</small></div>
        </>}
        {employeeTab==="packages"&&<>
          <div className="employee-section-title"><div><h2>Paquetes y productos turísticos</h2><p>Publicá salidas concretas con origen, fechas y precio por persona.</p></div><span className="demo-label">CATÁLOGO LOCAL</span></div>
          <form className="employee-add-form" onSubmit={e=>{e.preventDefault();const price=Number(newPackagePrice);const days=packageDuration(newPackageDepartureDate,newPackageReturnDate);const oldPrice=Number(newPackageOldPrice);if(newPackageName.trim().length<2||newPackageCountry.trim().length<2||newPackageDepartureCity.trim().length<2||!packageHasPhoto({image:newPackageImage})||!newPackageDepartureDate||!newPackageReturnDate||newPackageDepartureDate<todayISO||newPackageReturnDate<=newPackageDepartureDate||!Number.isFinite(price)||price<100||days<2||days>60||(newPackagePromo&&(!Number.isFinite(oldPrice)||oldPrice<=price))){setToast("Completá destino, foto, origen, fechas y precio. Si marcás oferta, el precio anterior debe superar al actual.");return;}const item:Package={id:Date.now(),name:newPackageName.trim(),country:newPackageCountry.trim(),category:newPackageCategory,tripType:"Turismo",price,oldPrice:newPackagePromo?oldPrice:undefined,days,nights:days-1,reviews:"0",reviewCount:0,tag:newPackagePromo?"¡Oferta!":newPackageFeatured?"Destacado":"Nuevo",flags:{promo:newPackagePromo,recommended:newPackageFeatured,reservaOnline:true},departureCity:newPackageDepartureCity.trim(),departureDate:newPackageDepartureDate,returnDate:newPackageReturnDate,image:newPackageImage,images:[newPackageImage],description:"Nuevo paquete cargado por el equipo de la agencia.",servicePrices:buildServicePrices(price)};setEmployeePackages(v=>[enrichPackage(item),...v]);setNewPackageName("");setNewPackageCountry("");setNewPackagePrice("");setNewPackageOldPrice("");setNewPackageFeatured(false);setNewPackagePromo(false);setNewPackageDepartureCity("");setNewPackageDepartureDate("");setNewPackageReturnDate("");setNewPackageCategory("Playas");setNewPackageImage("");setToast("Paquete publicado con imagen, origen, fechas y precio definidos.");}}>
            <input value={newPackageName} onChange={e=>setNewPackageName(e.target.value)} placeholder="Destino (ej. Bariloche)" required/><input value={newPackageCountry} onChange={e=>setNewPackageCountry(e.target.value)} placeholder="País" required/><select value={newPackageCategory} onChange={e=>setNewPackageCategory(e.target.value)}><option>Playas</option><option>Ciudades</option><option>Cultura</option><option>Aventuras</option></select><input value={newPackageDepartureCity} onChange={e=>setNewPackageDepartureCity(e.target.value)} placeholder="Ciudad de salida" list="new-package-departure-options" required/><datalist id="new-package-departure-options">{locationOptions.map(place=><option key={place} value={place}/>)}</datalist><select value={newPackageImage} onChange={e=>setNewPackageImage(e.target.value)} required aria-label="Imagen del destino"><option value="">Elegí una foto del catálogo</option>{packageImageOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select><input type="date" value={newPackageDepartureDate} min={todayISO} onChange={e=>setNewPackageDepartureDate(e.target.value)} aria-label="Fecha de salida" required/><input type="date" value={newPackageReturnDate} min={newPackageDepartureDate||todayISO} onChange={e=>setNewPackageReturnDate(e.target.value)} aria-label="Fecha de regreso" required/><input type="number" min="100" value={newPackagePrice} onChange={e=>setNewPackagePrice(e.target.value)} placeholder="Precio actual por persona USD" required/><input type="number" min="101" value={newPackageOldPrice} onChange={e=>setNewPackageOldPrice(e.target.value)} placeholder="Precio anterior (solo si hay oferta) USD"/><label className="employee-package-option"><input type="checkbox" checked={newPackagePromo} onChange={e=>setNewPackagePromo(e.target.checked)}/> Publicar como oferta</label><label className="employee-package-option"><input type="checkbox" checked={newPackageFeatured} onChange={e=>setNewPackageFeatured(e.target.checked)}/> Marcar como destacado</label><button className="primary-btn"><Plus size={15}/> Publicar paquete</button>
          </form>
          <p className="employee-form-note">Cada publicación representa una salida concreta. Definí ciudad de origen, fechas de ida y regreso y precio por persona para esa combinación. Para ofrecer otra salida al mismo destino, publicá otra opción con su propia cotización.</p>
          <div className="focal-editor-select"><label>Encuadre de imagen del paquete<select value={focalEditingPackage?.id ?? ""} onChange={e=>setFocalEditPackageId(Number(e.target.value))}>{employeePackages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
          <FocalPointEditor src={focalEditingPackage?.image ?? packages[0].image} name={focalEditingPackage?.name ?? "Cancún"} focalPoint={focalEditingPackage?.focalPoint} onChange={point=>{if(focalEditingPackage)setEmployeePackages(items=>items.map(p=>p.id===focalEditingPackage.id?{...p,focalPoint:point}:p));}}/>
          <div className="employee-package-list">{employeePackages.map(p=>{const q=quoteForPackage(p);return <article key={p.id}><SmartImage className="employee-package-smart-image" src={p.image} alt={p.name} preset="thumb" ratio="auto" fit="cover"/><div><b>{p.name}</b><small>{[p.country,p.days ? `${p.days} días` : "",p.departureCity ? `Sale desde ${p.departureCity}` : "",p.departureDate && p.returnDate ? `${formatTravelDate(p.departureDate)} al ${formatTravelDate(p.returnDate)}` : "",q ? `Vuelo ${money(q.flight)} · Hotel ${money(q.hotel)} · Asistencia ${money(q.assistance)}` : ""].filter(Boolean).join(" · ")}</small></div><strong>{money(p.price)}</strong><button className="employee-edit-schedule" onClick={()=>{setEditingPackageId(p.id);setPackageEditDraft({departureCity:p.departureCity,departureDate:p.departureDate,returnDate:p.returnDate,price:String(p.price ?? "")});}}><Pencil size={14}/> Editar</button><button className="employee-delete" onClick={()=>{setEmployeePackages(v=>v.filter(x=>x.id!==p.id));setToast("Paquete quitado del catálogo local.");}} aria-label={"Eliminar "+p.name}><X size={17}/></button>{editingPackageId===p.id&&<form className="employee-package-edit" onSubmit={e=>{e.preventDefault();const price=Number(packageEditDraft.price);const days=packageDuration(packageEditDraft.departureDate,packageEditDraft.returnDate);if(packageEditDraft.departureCity.trim().length<2||!packageEditDraft.departureDate||!packageEditDraft.returnDate||packageEditDraft.departureDate<todayISO||packageEditDraft.returnDate<=packageEditDraft.departureDate||!Number.isFinite(price)||price<100||days<2||days>60){setToast("Revisá origen, fechas y precio de la salida.");return;}const servicePrices=buildServicePrices(price);setEmployeePackages(items=>items.map(item=>item.id===p.id?enrichPackage({...item,departureCity:packageEditDraft.departureCity.trim(),departureDate:packageEditDraft.departureDate,returnDate:packageEditDraft.returnDate,days,nights:days-1,price,oldPrice:price,originalPrice:price,tag:undefined,offerExpires:undefined,servicePrices,flags:{...item.flags,promo:false,reservaOnline:true},includes:undefined,infoSections:undefined}):item));setQuoteDrafts(items=>({...items,[p.id]:{flight:String(servicePrices.flight),hotel:String(servicePrices.hotel),assistance:String(servicePrices.assistance)}}));setEditingPackageId(null);setToast("Salida y precio del paquete actualizados.");}}><label>Ciudad de salida<input value={packageEditDraft.departureCity} onChange={e=>setPackageEditDraft(value=>({...value,departureCity:e.target.value}))} list={"edit-departure-"+p.id} required/><datalist id={"edit-departure-"+p.id}>{locationOptions.map(place=><option key={place} value={place}/>)}</datalist></label><label>Salida<input type="date" min={todayISO} value={packageEditDraft.departureDate} onChange={e=>setPackageEditDraft(value=>({...value,departureDate:e.target.value}))} required/></label><label>Regreso<input type="date" min={packageEditDraft.departureDate||todayISO} value={packageEditDraft.returnDate} onChange={e=>setPackageEditDraft(value=>({...value,returnDate:e.target.value}))} required/></label><label>Precio por persona (USD)<input type="number" min="100" value={packageEditDraft.price} onChange={e=>setPackageEditDraft(value=>({...value,price:e.target.value}))} required/></label><button className="primary-btn">Guardar salida y precio</button><button type="button" className="outline-btn" onClick={()=>setEditingPackageId(null)}>Cancelar</button></form>}</article>;})}</div>
        </>}
        {employeeTab==="offers"&&<>
          <div className="employee-section-title"><div><h2>Promociones y ofertas</h2><p>Aplicá descuentos a un paquete y actualizá el precio público.</p></div><span className="demo-label">PUBLICACIÓN LOCAL</span></div>
          <form className="employee-promo-form" onSubmit={e=>{e.preventDefault();const chosen=employeePackages.find(p=>p.id===offerPackageId && p.price);const percent=Number(offerPercent);if(!chosen||!Number.isFinite(percent)||percent<1||percent>70||!offerEndDate){setToast("Elegí un paquete, un descuento entre 1% y 70% y una fecha de vigencia.");return;}const basePrice=chosen.price as number;const promoPrice=Math.max(1,Math.round(basePrice*(1-percent/100)));setEmployeePackages(items=>items.map(p=>p.id===chosen.id?enrichPackage({...p,oldPrice:basePrice,originalPrice:basePrice,price:promoPrice,tag:"¡Oferta!",offerExpires:offerEndDate,servicePrices:buildServicePrices(promoPrice),flags:{...p.flags,promo:true,reservaOnline:true},includes:undefined}):p));setToast("Oferta del "+percent+"% aplicada a "+chosen.name+".");}}>
            <label>Paquete<select value={offerPackageId} onChange={e=>setOfferPackageId(Number(e.target.value))}>{employeePackages.filter(p=>p.price).map(p=><option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}</select></label>
            <label>Descuento (%)<input type="number" min="1" max="70" value={offerPercent} onChange={e=>setOfferPercent(e.target.value)} required/></label>
            <label>Válida hasta<input type="date" value={offerEndDate} onChange={e=>setOfferEndDate(e.target.value)} required/></label>
            <button className="primary-btn"><Percent size={15}/> Aplicar oferta</button>
          </form>
          <p className="employee-form-note">La promoción modifica el precio visible del paquete. La fecha se registra como vigencia informativa; esta demo no desactiva ofertas automáticamente.</p>
          <h3 className="employee-subtitle">Paquetes con promoción</h3>
          <div className="employee-package-list">{employeePackages.filter(p=>p.tag==="¡Oferta!").map(p=><article key={p.id}><div><b>{p.name}</b><small>Precio anterior {money(p.oldPrice)} · Precio promocional {money(p.price)} · {discount(p)}% OFF · Vigente hasta {p.offerExpires||"fecha no registrada"}</small></div><strong>{money(p.price)}</strong><span className="message-done">Activa en catálogo</span></article>)}</div>
          {employeePackages.filter(p=>p.tag==="¡Oferta!").length===0&&<p className="employee-empty-note">Todavía no hay ofertas aplicadas. Creá una desde el formulario.</p>}
        </>}
        {employeeTab==="quotes"&&<>
          <div className="employee-section-title"><div><h2>Proveedores y cotizaciones</h2><p>Consulta de costos estimados por paquete y servicio.</p></div><span className="demo-label">SOLO LECTURA</span></div>
          <div className="employee-quote-warning"><Building2/><span><b>Información de cotizaciones</b><small>Esta sección es únicamente informativa. Los valores se muestran para consulta del equipo; la gestión y actualización de cotizaciones corresponde al proceso automático de integración con proveedores, no al empleado. En este prototipo las conexiones externas todavía no están activas.</small></span></div>
          <div className="employee-quote-read-list">{employeePackages.map(p=>{const quote=quoteForPackage(p);return <article key={p.id}><div className="employee-quote-read-heading"><div><b>{p.name} · {p.country}</b><small>{p.nights ?? (p.days && p.days>1?p.days-1:"")}{(p.nights ?? (p.days && p.days>1?p.days-1:null))?" noches · ":""}{p.price ? "Precio publicado "+money(p.price)+" por persona" : "Precio pendiente de definir"}</small></div><span className="employee-quote-read-status">Informativo</span></div><div className="employee-quote-read-services"><div><Plane/><span>Vuelo</span><b>{quote?.flight?money(quote.flight):"A cotizar"}</b></div><div><Hotel/><span>Hotel</span><b>{quote?.hotel?money(quote.hotel):"A cotizar"}</b></div><div><Stethoscope/><span>Asistencia</span><b>{quote?.assistance?money(quote.assistance):"A cotizar"}</b></div></div><div className="employee-quote-read-total"><span>Precio total por persona</span><b>{money(p.price)||"A cotizar"}</b></div></article>;})}</div>
          <div className="employee-quote-supplier-grid">
            <article><span><Plane/></span><b>Aerolíneas</b><small>Tarifas, equipaje, tasas y disponibilidad.</small></article>
            <article><span><Hotel/></span><b>Hoteles</b><small>Habitaciones, régimen, noches e impuestos.</small></article>
            <article><span><Stethoscope/></span><b>Asistencia al viajero</b><small>Planes, cobertura y vigencia.</small></article>
          </div>
        </>}
        {employeeTab==="income"&&<>
          <div className="employee-section-title"><div><h2>Gestión de ingresos</h2><p>Controlá cobros, pagos pendientes y movimientos registrados.</p></div><span className="demo-label">MOVIMIENTOS SIMULADOS</span></div>
          <div className="employee-stats employee-stats-two"><article><span>Total acreditado</span><b>{money(collectedIncome)}</b><small><TrendingUp/> Ingresos recibidos</small></article><article><span>Pendiente de cobro</span><b>{money(pendingIncome)}</b><small><Wallet/> Requiere seguimiento</small></article></div>
          <form className="employee-income-form" onSubmit={e=>{e.preventDefault();const amount=Number(incomeAmount);if(incomeConcept.trim().length<2||!Number.isFinite(amount)||amount<=0){setToast("Ingresá un concepto y un importe válido.");return;}setIncomeEntries(items=>[{id:Date.now(),reference:"MAN-"+Date.now().toString().slice(-6),client:incomeConcept.trim(),amount,method:"Registro manual",status:"Acreditado",date:todayISO},...items]);setIncomeConcept("");setIncomeAmount("");setToast("Ingreso registrado en la demostración.");}}>
            <input value={incomeConcept} onChange={e=>setIncomeConcept(e.target.value)} placeholder="Concepto / cliente" required/><input type="number" min="1" step="0.01" value={incomeAmount} onChange={e=>setIncomeAmount(e.target.value)} placeholder="Importe USD" required/><button className="primary-btn"><Plus size={15}/> Registrar ingreso</button>
          </form>
          <div className="employee-income-list">{incomeEntries.map(entry=><article key={entry.id}><div><b>{entry.client}</b><small>{entry.reference} · {entry.date} · {entry.method}</small></div><strong>{money(entry.amount)}</strong><span className={entry.status==="Acreditado"?"message-done":"message-pending"}>{entry.status}</span>{entry.status==="Pendiente"&&<button className="employee-mark-paid" onClick={()=>{setIncomeEntries(items=>items.map(item=>item.id===entry.id?{...item,status:"Acreditado"}:item));setToast("Movimiento marcado como acreditado en la demo.");}}>Marcar cobrado</button>}</article>)}</div>
        </>}
        {employeeTab==="messages"&&<>
          <div className="employee-section-title"><div><h2>Atención al cliente</h2><p>Respondé consultas sobre destinos, pagos, servicios y reservas.</p></div><span className="demo-label">BANDEJA LOCAL</span></div>
          <div className="employee-chat-layout"><aside className="employee-chat-inbox"><div className="employee-chat-inbox-title"><b>Conversaciones</b><span>{staffMessages.length}</span></div>{staffMessages.map(m=><button type="button" key={m.id} className={`employee-chat-contact ${activeStaffMessageId===m.id?"selected":""}`} onClick={()=>{setActiveStaffMessageId(m.id);setEmployeeMessage("");}}><span className="employee-chat-avatar">{m.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><span className="employee-chat-contact-copy"><b>{m.name}</b><small>{m.reply || m.body}</small></span><span className={`employee-chat-status ${m.status==="Pendiente"?"unread":""}`}>{m.status==="Pendiente"?"Nuevo":"✓"}</span></button>)}</aside><section className="employee-chat-window">{staffMessages.filter(m=>m.id===activeStaffMessageId).map(m=><div className="employee-chat-conversation" key={m.id}><header className="employee-chat-conversation-head"><span className="employee-chat-avatar">{m.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><b>{m.name}</b><small>{m.subject}</small></div><span className={m.status==="Pendiente"?"message-pending":"message-done"}>{m.status}</span></header><div className="employee-chat-history"><div className="employee-chat-date">Hoy</div><div className="employee-chat-bubble incoming">{m.body}{m.attachments?.length?m.attachments.map((file,index)=><button key={`${file.name}-${index}`} type="button" className="employee-claim-attachment" onClick={()=>downloadClaimAttachment(file.name,file.data)}><FileText size={14}/> Descargar adjunto · {file.name}</button>):m.attachmentData&&m.attachmentName&&<button type="button" className="employee-claim-attachment" onClick={()=>downloadClaimAttachment(m.attachmentName!,m.attachmentData!)}><FileText size={14}/> Descargar adjunto · {m.attachmentName}</button>}<small>10:32</small></div>{m.reply&&<div className="employee-chat-bubble outgoing">{m.reply}<small>10:35 · ✓✓</small></div>}</div><form className="employee-chat-compose" onSubmit={e=>{e.preventDefault();if(!employeeMessage.trim())return;setStaffMessages(v=>v.map(x=>x.id===m.id?{...x,status:"Respondido",reply:employeeMessage.trim()}:x));setEmployeeMessage("");setToast("Mensaje enviado en la simulación.");}}><textarea value={employeeMessage} onChange={e=>setEmployeeMessage(e.target.value)} placeholder="Escribí un mensaje..." rows={1}/><button type="submit" disabled={!employeeMessage.trim()} aria-label="Enviar mensaje"><ArrowRight size={18}/></button></form></div>)}</section></div>
        </>}
        {employeeTab==="bookings"&&<>
          <div className="employee-section-title"><div><h2>Reservas y pasajeros</h2><p>Revisá operaciones, importes y estado de los pagos.</p></div><span className="demo-label">RESERVAS DE PRUEBA</span></div>
          <div className="employee-booking-list">{incomeEntries.filter(entry=>entry.reference.startsWith("MG-")||entry.reference.startsWith("MGT-")).map(entry=><article key={entry.id}><span className="booking-icon"><Ticket/></span><div><b>{entry.destination||"Reserva de viaje"}</b><small>{entry.reference} · {entry.client} · Salida: {entry.departureCity || "No indicada"} · {entry.departureDate ? formatTravelDate(entry.departureDate) : "Fecha no indicada"} al {entry.returnDate ? formatTravelDate(entry.returnDate) : "Fecha no indicada"} · {entry.date} · {entry.method}</small></div><strong>{money(entry.amount)}</strong><span className={entry.status==="Acreditado"?"message-done":"message-pending"}>{entry.status==="Acreditado"?"Pago acreditado":"Pendiente de pago"}</span></article>)}</div>
        </>}
      </section>
    </div>
    <p className="employee-disclaimer"><ShieldCheck size={15}/> Prototipo académico: las operaciones se guardan localmente en este navegador. Los precios y cotizaciones son referenciales; no se conectan proveedores, bancos ni pasarelas de pago reales.</p>
  </main>;

  const checkoutQuote = quoteForPackage(selected) ?? { flight: undefined, hotel: undefined, assistance: undefined };
  const renderCheckout = () => checkoutConfirmed ? <main className="page-container narrow checkout-success-page"><div className="checkout-success-card"><div className="checkout-success-check"><Check size={48}/></div><span className="kicker">RESERVA CONFIRMADA</span><h1>¡Pago aprobado!</h1><p>El pago fue aprobado en esta simulación y tu reserva quedó confirmada. Ya podés descargar el comprobante.</p><div className="checkout-success-summary"><span>Destino</span><b>{selected.name} · {selected.country}</b><span>Pasajeros</span><b>{totalTravelers}</b><span>Medio de pago</span><b>{paymentMethod}{paymentMethod === "Tarjeta de crédito" ? " · " + checkoutInstallments + " cuota(s)" : ""}</b><span>Total</span><b>{money((selected.price ?? 0) * totalTravelers)}</b></div><div className="demo-warning"><CircleHelp/> Pago y reserva simulados: no se realizó un cobro real.</div><div className="checkout-reservation-code"><span>Código de reserva</span><b>{reservationReference}</b></div><button className="primary-btn full" onClick={downloadReservation}><FileText size={18}/> Descargar comprobante de reserva</button><button className="outline-btn checkout-back-button" onClick={()=>go("account")}>Ir a mis reservas <ArrowRight size={17}/></button></div></main> : routeNotFound ? <main className="package-not-found"><span className="package-section-eyebrow">RESERVA NO DISPONIBLE</span><h1>No encontramos este paquete</h1><p>Volvé al catálogo y elegí un paquete con salida y precio publicados para iniciar la reserva.</p><button className="primary-btn" onClick={()=>go("results")}>Ver paquetes disponibles <ArrowRight size={16}/></button></main> : <main className="page-container narrow"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span><button onClick={()=>go("detail")}>Paquete</button><span>/</span>Confirmar reserva</div><div className="checkout-title"><span className="kicker">ÚLTIMO PASO</span><h1>Confirmá tu viaje</h1><p>Revisá los detalles antes de confirmar tu reserva de prueba.</p></div><div className="checkout-payment-intro"><b>Medios de pago disponibles</b><span>Tarjetas Visa y Mastercard · Mercado Pago · Transferencia bancaria</span><small>Elegí tu opción en el paso de pago. Esta experiencia es una demostración y no procesa cobros reales.</small></div><div className="checkout-layout"><div className="checkout-box"><h2>Resumen del paquete</h2><div className="checkout-destination"><SmartImage className="checkout-smart-image" src={selected.image} alt={selected.name} preset="thumb" ratio="auto" fit="cover"/><div><b>{selected.name} · {selected.country}</b><small>{selected.days ? `${selected.days} días · ` : ""}{totalTravelers} pasajero(s)</small>{selected.departureCity && <small>Salida desde: {selected.departureCity}</small>}{selected.departureDate && <small>Ida: {formatTravelDate(selected.departureDate)}{selected.returnDate ? ` · Vuelta: ${formatTravelDate(selected.returnDate)}` : ""}</small>}</div></div>{checkoutQuote.flight && <div className="checkout-service"><Plane/> Vuelos ida y vuelta <strong>{money(checkoutQuote.flight)}</strong></div>}{checkoutQuote.hotel && <div className="checkout-service"><Hotel/> Hotel{selected.nights || (selected.days && selected.days > 1) ? ` · ${selected.nights ?? selected.days! - 1} noches` : ""} <strong>{money(checkoutQuote.hotel)}</strong></div>}{checkoutQuote.assistance && <div className="checkout-service"><Stethoscope/> Asistencia al viajero <strong>{money(checkoutQuote.assistance)}</strong></div>}<p className="form-hint">Cada servicio tiene un importe asignado. Estos valores son referenciales de la demostración y se confirman con los proveedores antes de emitir.</p><p className="form-hint">El origen y las fechas de esta salida fueron definidos por el equipo de la agencia al publicar el paquete.</p><div className="booking-divider"/><h2>Datos del pasajero principal</h2><div className="passenger-form-section"><h3>Pasajero principal</h3><div className="passenger-fields-grid"><label>Nombre y apellido<input value={passengerName} onChange={e=>setPassengerName(e.target.value)} autoComplete="name" placeholder="Como figura en el documento" maxLength={100} required/></label><label>DNI o pasaporte<input value={passengerDocument} onChange={e=>setPassengerDocument(e.target.value)} placeholder="Número de documento" maxLength={25} required/></label><label>Fecha de nacimiento<input type="date" value={passengerBirthDate} onChange={e=>setPassengerBirthDate(e.target.value)} max={todayISO} required/></label><label>Nacionalidad<input value={passengerNationality} onChange={e=>setPassengerNationality(e.target.value)} placeholder="Nacionalidad" maxLength={60} required/></label><label>Correo electrónico<input type="email" value={passengerEmail} onChange={e=>setPassengerEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" maxLength={120} required/></label><label>Teléfono de contacto<input type="tel" value={passengerPhone} onChange={e=>setPassengerPhone(e.target.value)} autoComplete="tel" placeholder="+54 9 ..." maxLength={30} required/></label></div><p className="form-hint">Completá los datos exactamente como aparecen en el DNI o pasaporte. El correo y teléfono serán los medios de contacto de la reserva.</p></div>{additionalPassengers.length>0&&<><div className="booking-divider"/><h2>Datos de los acompañantes</h2><p className="form-hint">Necesitamos los datos individuales de cada persona que viajará.</p>{additionalPassengers.map((passenger,index)=><div className="passenger-form-section companion-passenger" key={index}><h3>Acompañante {index+1}</h3><div className="passenger-fields-grid"><label>Nombre y apellido<input value={passenger.fullName} onChange={e=>setAdditionalPassengers(items=>items.map((item,i)=>i===index?{...item,fullName:e.target.value}:item))} placeholder="Como figura en el documento" maxLength={100} required/></label><label>DNI o pasaporte<input value={passenger.documentNumber} onChange={e=>setAdditionalPassengers(items=>items.map((item,i)=>i===index?{...item,documentNumber:e.target.value}:item))} placeholder="Número de documento" maxLength={25} required/></label><label>Fecha de nacimiento<input type="date" value={passenger.birthDate} max={todayISO} onChange={e=>setAdditionalPassengers(items=>items.map((item,i)=>i===index?{...item,birthDate:e.target.value}:item))} required/></label><label>Nacionalidad<input value={passenger.nationality} onChange={e=>setAdditionalPassengers(items=>items.map((item,i)=>i===index?{...item,nationality:e.target.value}:item))} placeholder="Nacionalidad" maxLength={60} required/></label></div></div>)}</>}<div className="booking-divider"/><h2>Elegí tu medio de pago</h2><p className="form-hint">Seleccioná cómo preferís abonar. En esta demo no se realizará ningún cobro.</p><div className="payment-method-grid"><button type="button" className={`payment-method ${paymentMethod === "Tarjeta de crédito" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Tarjeta de crédito")}><span className="payment-visual card-visa">VISA</span><b>Tarjeta de crédito</b><small>Crédito y cuotas</small></button><button type="button" className={`payment-method ${paymentMethod === "Tarjeta de débito" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Tarjeta de débito")}><span className="payment-visual card-master"><i></i><i></i></span><b>Tarjeta de débito</b><small>Pago con débito</small></button><button type="button" className={`payment-method ${paymentMethod === "Mercado Pago" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Mercado Pago")}><span className="payment-visual mercado-logo"> Mercado Pago </span><b>Mercado Pago</b><small>Billetera virtual</small></button><button type="button" className={`payment-method ${paymentMethod === "Transferencia bancaria" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Transferencia bancaria")}><span className="payment-visual transfer-visual"><CreditCard size={25}/></span><b>Transferencia</b><small>Desde tu banco</small></button></div>{(paymentMethod === "Tarjeta de crédito" || paymentMethod === "Tarjeta de débito") && <div className="checkout-card-panel"><h3>Datos de la tarjeta</h3><p>Ingresá datos de prueba para simular la autorización. No uses una tarjeta real.</p><div className="passenger-fields-grid"><label>Nombre del titular<input autoComplete="off" value={cardholderName} onChange={e=>setCardholderName(e.target.value)} placeholder="Como figura en la tarjeta" maxLength={80}/></label><label>Número de tarjeta<input inputMode="numeric" autoComplete="off" value={cardNumber} onChange={e=>setCardNumber(e.target.value.replace(/[^0-9 ]/g,"").slice(0,23))} placeholder="0000 0000 0000 0000" maxLength={23}/></label><label>Vencimiento (MM/AA)<input autoComplete="off" value={cardExpiry} onChange={e=>setCardExpiry(e.target.value.replace(/[^0-9/]/g,"").slice(0,5))} placeholder="MM/AA" maxLength={5}/></label><label>Código de seguridad<input inputMode="numeric" type="password" autoComplete="off" value={cardCvv} onChange={e=>setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="CVV" maxLength={4}/></label></div><small>Los datos de tarjeta se usan sólo temporalmente en esta pantalla y no se guardan ni se envían a ningún servidor.</small></div>}{paymentMethod === "Tarjeta de crédito" && <div className="checkout-installment-panel"><label htmlFor="checkout-installments">Plan de cuotas</label><select id="checkout-installments" value={checkoutInstallments} onChange={event=>setCheckoutInstallments(Number(event.target.value))}><option value={1}>1 pago</option><option value={3}>3 cuotas</option><option value={6}>6 cuotas</option><option value={12}>12 cuotas</option></select><p><strong>{money(((selected.price ?? 0) * totalTravelers) / checkoutInstallments)}</strong> por cuota estimada</p><small>La financiación final depende de las condiciones de la tarjeta y del proveedor.</small></div>}<div className="demo-warning"><CircleHelp/> Esta es una simulación académica. No se realizará ningún cobro ni reserva real.</div></div><aside className="booking-card"><h3>Detalle de precio</h3><div className="summary-row"><span>Vuelos · por persona</span><b>{money(checkoutQuote.flight)}</b></div><div className="summary-row"><span>Hotel · por persona</span><b>{money(checkoutQuote.hotel)}</b></div><div className="summary-row"><span>Asistencia · por persona</span><b>{money(checkoutQuote.assistance)}</b></div><div className="summary-row"><span>Pasajeros</span><b>× {totalTravelers}</b></div><div className="booking-divider"/><div className="booking-total"><span>Total</span><b>{money((selected.price ?? 0)*totalTravelers)}</b></div><button className="primary-btn full" onClick={reserve}>Continuar y revisar <ArrowRight size={17}/></button><p className="booking-safe"><LockKeyhole size={14}/> Proceso de demostración</p></aside></div></main>;

  const renderAccount = () => <main className="page-container"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span>Mi cuenta</div><div className="account-heading"><div className="user-avatar"><UserRound/></div><div><span className="kicker">MI ESPACIO MUNDO GLOBAL</span><h1>¡Hola, {user || "Viajero"}!</h1><p>Gestioná tus viajes y preparate para tu próxima aventura.</p></div><button className="outline-btn" onClick={()=>{setUser("");localStorage.removeItem("mgt-user");setAuthPassword("");go("login");}}> <LogOut size={16}/> Cerrar sesión</button></div><div className="account-grid"><aside className="account-menu"><button className={accountSection==="bookings"?"current":""} onClick={()=>setAccountSection("bookings")}><Ticket/> Mis reservas</button><button className={accountSection==="profile"?"current":""} onClick={()=>setAccountSection("profile")}><UserRound/> Mi perfil</button><button className={accountSection==="notifications"?"current":""} onClick={()=>setAccountSection("notifications")}><Bell/> Notificaciones{unreadNotifications>0&&<span className="account-notification-count">{unreadNotifications}</span>}</button><button className={accountSection==="favorites"?"current":""} onClick={()=>setAccountSection("favorites")}><Heart/> Mis favoritos</button><button className={accountSection==="recent"?"current":""} onClick={()=>setAccountSection("recent")}><Clock3/> Búsquedas recientes</button><button onClick={()=>go("support")}><Headphones/> Ayuda y soporte</button></aside><section className="account-content">
    {accountSection==="bookings"&&<><div className="section-heading compact"><div><h2>Mis reservas</h2><p>Consultá el estado de tus próximos viajes.</p></div><button className="primary-btn" onClick={()=>go("results")}>Buscar viajes <ArrowRight size={16}/></button></div>{bookings.length===0?<div className="empty-state"><Luggage size={42}/><h3>Todavía no tenés viajes reservados</h3><p>Tu próxima aventura está a un clic de distancia.</p><button className="primary-btn" onClick={()=>go("results")}>Explorar paquetes</button></div>:bookings.map((b,i)=>{const reference=b.split(" · ")[1];const entry=incomeEntries.find(item=>item.reference===reference);return <div className="booking-list-item" key={reference||i}><span className="booking-icon"><Plane/></span><div className="booking-list-copy"><b>{b.split(" · ")[0]}</b><small>Código: {reference} · {b.split(" · ").slice(3).join(" · ") || "Condiciones de salida no registradas"} · Reserva de demostración</small><div className="booking-document-actions">{entry&&<><button type="button" onClick={()=>downloadTravelDocument(entry)}><FileText size={14}/> Descargar comprobante</button><button type="button" onClick={()=>printTravelDocument(entry)}><Ticket size={14}/> Imprimir / Guardar PDF</button></>}</div></div><strong>{b.split(" · ")[2]}</strong><span className="status-pill"><CheckCircle2 size={13}/> Confirmada</span></div>;})}</>}
    {accountSection==="profile"&&<><div className="section-heading compact"><div><h2>Mi perfil</h2><p>Actualizá tus datos personales de contacto.</p></div></div><form className="profile-edit-form" onSubmit={e=>{e.preventDefault();const name=passengerName.trim();if(name.length<3){setToast("Ingresá tu nombre y apellido.");return;}setUser(name);localStorage.setItem("mgt-user",name);localStorage.setItem("mgt-email",profileEmail);localStorage.setItem("mgt-phone",profilePhone);setToast("¡Tu perfil fue actualizado!");}}><label>Nombre y apellido<input value={passengerName} onChange={e=>setPassengerName(e.target.value)} required minLength={3} maxLength={80}/></label><label>Correo electrónico<input type="email" value={profileEmail} onChange={e=>setProfileEmail(e.target.value)} placeholder="tu@email.com" required/></label><label>Teléfono<input value={profilePhone} onChange={e=>setProfilePhone(e.target.value)} placeholder="+54 9 353 ..." /></label><button className="primary-btn">Guardar cambios <Check size={16}/></button></form></>}
    {accountSection==="notifications"&&<><div className="section-heading compact"><div><h2>Notificaciones</h2><p>Enterate de las novedades y actualizaciones de tu cuenta.</p></div>{unreadNotifications>0&&<button type="button" className="outline-btn" onClick={()=>setNotifications(items=>{const next=items.map(item=>({...item,read:true}));try{localStorage.setItem("mgt-notifications",JSON.stringify(next));}catch{/* Sin almacenamiento persistente. */}return next;})}>Marcar todas como leídas</button>}</div>{notifications.length===0?<div className="empty-state"><Bell size={38}/><h3>No tenés notificaciones</h3><p>Cuando haya novedades sobre tus viajes, las vas a encontrar acá.</p></div>:<div className="account-notification-list">{notifications.map(item=><article key={item.id} className={`account-notification ${item.read?"read":"unread"}`}><span className={`account-notification-icon ${item.kind}`}>{item.kind==="booking"?<Ticket size={18}/>:item.kind==="payment"?<CreditCard size={18}/>:item.kind==="offer"?<Tag size={18}/>:<Bell size={18}/>}</span><div className="account-notification-copy"><b>{item.title}</b><p>{item.message}</p><small>{new Date(item.date).toLocaleString("es-AR",{dateStyle:"medium",timeStyle:"short"})}</small></div>{!item.read&&<><span className="account-notification-dot" aria-label="No leída"/><button type="button" className="account-notification-mark" onClick={()=>markNotificationRead(item.id)}>Marcar leída</button></>}</article>)}</div>}</>}
    {accountSection==="favorites"&&<><div className="section-heading compact"><div><h2>Mis favoritos</h2><p>Los destinos que guardaste para más adelante.</p></div></div><div className="account-favorites-grid">{employeePackages.filter(p=>favorites.includes(p.id)).map(p=>renderPackageCard(p))}</div>{favorites.length===0&&<div className="empty-state"><Heart size={38}/><h3>Todavía no guardaste favoritos</h3><p>Usá el corazón de cada paquete para guardarlo.</p><button className="primary-btn" onClick={()=>go("results")}>Explorar paquetes</button></div>}</>}
    {accountSection==="recent"&&<><div className="section-heading compact"><div><h2>Búsquedas recientes</h2><p>Retomá rápidamente los destinos que estuviste explorando.</p></div></div>{recentSearches.length===0?<div className="empty-state"><Search size={38}/><h3>Aún no tenés búsquedas recientes</h3><p>Cuando busques destinos, aparecerán acá.</p></div>:<div className="recent-search-list">{recentSearches.map((term,i)=><button key={i} onClick={()=>{setQuery(term==="Todos los destinos"?"":term);go("results");}}><span><Search size={16}/>{term}</span><ArrowRight size={16}/></button>)}</div>}</>}
  </section></div></main>;

  const renderSupport = () => <main className="page-container narrow"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span>Ayuda y asistencia</div><div className="support-hero"><span className="support-icon"><Headphones/></span><span className="kicker">ESTAMOS PARA ACOMPAÑARTE</span><h1>¿En qué podemos ayudarte?</h1><p>Nuestro equipo está disponible para acompañarte antes, durante y después de tu viaje.</p></div><div className="support-grid"><button onClick={()=>{setAssistantOpen(true);setToast("Podés escribirle a nuestro asistente virtual.");}}><MessageCircle/><b>Chat en vivo</b><small>Hablá con un asesor</small></button><button onClick={()=>setToast("Centro de ayuda de demostración.")}><CircleHelp/><b>Preguntas frecuentes</b><small>Encontrá respuestas rápidas</small></button><button onClick={()=>setToast("Soporte 24/7 activado en modo demostración.")}><ShieldCheck/><b>Asistencia al viajero</b><small>Estamos con vos en destino</small></button></div><div className="contact-box"><h2>Dejanos tu reclamo o consulta</h2><div className="contact-phone"><span><Phone size={17}/></span><div><b>Atención telefónica</b><a href="tel:+543534123456">+54 353 412-3456</a><small>Número de ejemplo para la demostración</small></div></div><form onSubmit={async e=>{e.preventDefault();if(contactName.trim().length<2||!contactEmail.trim()||!contactMessage.trim()){setToast("Completá todos los datos para enviar tu reclamo.");return;}if(claimFiles.some(file=>file.size>2*1024*1024)){setToast("Cada archivo no puede superar los 2 MB.");return;}try{const attachments=await Promise.all(claimFiles.map(file=>new Promise<{name:string;data:string;type:string}>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,data:typeof reader.result==="string"?reader.result:"",type:file.type});reader.onerror=()=>reject(new Error("No se pudo leer uno de los archivos adjuntos."));reader.readAsDataURL(file);})));const previous=JSON.parse(localStorage.getItem("mgt-claims")||"[]");const claimId=Date.now();previous.unshift({id:`REC-${claimId}`,name:contactName.trim(),email:contactEmail.trim(),message:contactMessage.trim(),fileNames:attachments.map(file=>file.name),createdAt:new Date().toISOString()});localStorage.setItem("mgt-claims",JSON.stringify(previous));setStaffMessages(items=>[{id:claimId,name:contactName.trim(),subject:"Reclamo de cliente",body:`${contactMessage.trim()} · Correo: ${contactEmail.trim()}`,status:"Pendiente",attachmentName:attachments[0]?.name,attachmentData:attachments[0]?.data,attachmentType:attachments[0]?.type,attachments},...items]);setActiveStaffMessageId(claimId);setToast(attachments.length? `Tu reclamo fue registrado con ${attachments.length} archivo(s) adjunto(s).`:"Tu reclamo fue registrado y enviado al equipo.");setContactName("");setContactEmail("");setContactMessage("");setClaimFiles([]);const input=document.getElementById("claim-document") as HTMLInputElement|null;if(input)input.value="";}catch{setToast("No se pudieron guardar los archivos adjuntos. Probá con documentos más livianos.");}}}><label>Tu nombre<input value={contactName} onChange={e=>setContactName(e.target.value)} required placeholder="Nombre y apellido"/></label><label>Correo electrónico<input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} required placeholder="tu@email.com"/></label><label>¿En qué podemos ayudarte?<textarea value={contactMessage} onChange={e=>setContactMessage(e.target.value)} required rows={4} placeholder="Contanos qué pasó con tu viaje o reserva..."/></label><div className="file-upload-field"><label htmlFor="claim-document">Documentación adjunta (opcional)</label><input id="claim-document" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={e=>{const selected=Array.from(e.target.files||[]);setClaimFiles(current=>[...current,...selected.filter(file=>!current.some(existing=>existing.name===file.name&&existing.size===file.size))]);e.target.value="";}}/>{claimFiles.length>0?<div className="file-upload-selected">{claimFiles.map((file,index)=><div className="file-upload-file" key={`${file.name}-${file.size}-${index}`}><span><FileText size={14}/><span><b>{file.name}</b><small>{(file.size/1024).toFixed(0)} KB · Archivo adjunto</small></span></span><button type="button" className="file-upload-remove" onClick={()=>setClaimFiles(current=>current.filter((_,fileIndex)=>fileIndex!==index))}><X size={14}/> Quitar</button></div>)}</div>:<small>PDF, imágenes o documentos · Máximo 2 MB por archivo</small>}</div><button className="primary-btn">Enviar reclamo <ArrowRight size={16}/></button></form></div></main>;

  if (import.meta.env.DEV && window.location.pathname === "/dev/image-lab") return <ImageLab/>;

  return <>{renderHeader()}{page==="home"&&renderHome()}{page==="results"&&renderResults()}{page==="detail"&&renderDetail()}{(page==="login"||page==="register")&&renderAuthPage(page==="register")}{page==="checkout"&&renderCheckout()}{page==="account"&&renderAccount()}{page==="support"&&renderSupport()}{page==="employee-login"&&renderEmployeeLogin()}{page==="employee"&&renderEmployeePanel()}{renderFooter()}<div className="assistant-widget">
    {assistantOpen&&<section className="assistant-panel" aria-label="Asistente virtual">
      <div className="assistant-header"><img className="assistant-avatar-img" src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=85" alt="Asesora virtual de MundoGlobal"/><div><b>Asistente MundoGlobal</b><small><i/> En línea · Atención virtual</small></div><button onClick={()=>setAssistantOpen(false)} aria-label="Cerrar chat"><X size={18}/></button></div>
      <div className="assistant-messages" aria-live="polite">
        {assistantMessages.map((message,index)=><div key={index} className={message.from==="user"?"assistant-message user-message":"assistant-message bot-message"}>{message.text}</div>)}
      </div>
      <div className="assistant-quick-actions"><button onClick={()=>answerAssistant("Quiero conocer los paquetes y destinos")}>Ver paquetes</button><button onClick={()=>answerAssistant("¿Qué medios de pago tienen?")}>Medios de pago</button><button onClick={()=>{setAssistantOpen(false);go("support");}}>Hablar con un asesor</button></div>
      <form className="assistant-compose" onSubmit={e=>{e.preventDefault();answerAssistant(assistantInput);}}><input value={assistantInput} onChange={e=>setAssistantInput(e.target.value)} placeholder="Escribí tu consulta..." aria-label="Escribí tu consulta"/><button type="submit" disabled={!assistantInput.trim()} aria-label="Enviar mensaje"><ArrowRight size={18}/></button></form>
      <p className="assistant-disclaimer">Asistente automático de demostración · Puede cometer errores</p>
    </section>}
    <button className="chat-float" onClick={()=>setAssistantOpen(v=>!v)} aria-label={assistantOpen?"Cerrar asistente":"Abrir asistente"}>{assistantOpen?<X/>:<MessageCircle/>}</button>
    {!assistantOpen&&<button className="assistant-invite" onClick={()=>setAssistantOpen(true)}>¿Necesitás ayuda? <span>Estamos para vos</span></button>}
  </div>{toast&&<div className="toast"><CheckCircle2 size={18}/>{toast}<button onClick={()=>setToast("")}><X size={15}/></button></div>}</>;
}
