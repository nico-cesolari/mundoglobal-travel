import { useEffect, useMemo, useState } from "react";
import { SmartImage } from "./components/SmartImage";
import ImageLab from "./components/ImageLab";
import FocalPointEditor from "./components/FocalPointEditor";
import {
  ArrowRight, ArrowLeft, Plane, Globe2, Search, CalendarDays, Users, Tag,
  Heart, Star, ShieldCheck, Headphones, CreditCard, Menu, X, UserRound,
  ChevronDown, MapPin, Clock3, Check, CheckCircle2, Hotel, BedDouble, Stethoscope,
  Luggage, CarFront, LockKeyhole, Mail, Eye, EyeOff, MessageCircle, Bell, SlidersHorizontal,
  Facebook, Instagram, Youtube, Linkedin, Ticket, LogOut, CircleHelp, Sparkles, Phone,
  DollarSign, TrendingUp, Percent, Building2, ClipboardList, Wallet, Plus
} from "lucide-react";

type Page = "home" | "results" | "detail" | "login" | "register" | "checkout" | "account" | "support" | "employee-login" | "employee";
type Package = {
  id: number; name: string; country: string; category: string; price: number;
  oldPrice: number; rating: number; reviews: string; days: number; image: string;
  focalPoint?: { x: number; y: number }; safeArea?: { x: number; y: number; w: number; h: number };
  imagePosition?: string;
  tag?: string; offerExpires?: string; description: string;
  servicePrices?: { flight: number; hotel: number; assistance: number };
};
type IncomeEntry = { id: number; reference: string; client: string; destination?: string; amount: number; method: string; status: "Acreditado" | "Pendiente"; date: string; };
const packages: Package[] = [
  { id: 1, name: "Cancún", country: "México", category: "Playas", price: 1299, oldPrice: 1799, rating: 4.8, reviews: "12.5k", days: 7, tag: "Más elegido", image: "/images/cancun.jpg", focalPoint: {x:52,y:48}, description: "Playas de arena blanca, aguas turquesas y resorts All Inclusive para desconectar de todo." },
  { id: 2, name: "Salvador de Bahía", country: "Brasil", category: "Playas", price: 1099, oldPrice: 1599, rating: 4.7, reviews: "7.3k", days: 6, tag: "¡Oferta!", image: "/images/salvador.jpg", focalPoint: {x:50,y:50}, description: "Viví la energía de Brasil entre playas increíbles, gastronomía y cultura local." },
  { id: 3, name: "Copacabana", country: "Brasil", category: "Ciudades", price: 999, oldPrice: 1499, rating: 4.8, reviews: "6.1k", days: 5, tag: "¡Oferta!", image: "/images/copacabana.jpg", focalPoint: {x:50,y:50}, description: "Una escapada urbana con vistas inolvidables, playas icónicas y experiencias únicas." },
  { id: 4, name: "Roma", country: "Italia", category: "Cultura", price: 1479, oldPrice: 1899, rating: 4.7, reviews: "8.2k", days: 8, image: "/images/roma.jpg", focalPoint: {x:50,y:50}, description: "Historia, arquitectura y sabores italianos en una ciudad que nunca deja de sorprender." },
  { id: 5, name: "Nueva York", country: "Estados Unidos", category: "Ciudades", price: 1699, oldPrice: 1999, rating: 4.8, reviews: "11.1k", days: 6, image: "/images/nueva-york.jpg", focalPoint: {x:50,y:50}, description: "Descubrí la ciudad que nunca duerme, sus barrios, espectáculos y gastronomía." },
  { id: 6, name: "Punta Cana", country: "Rep. Dominicana", category: "Playas", price: 1399, oldPrice: 1799, rating: 4.7, reviews: "7.9k", days: 7, tag: "¡Oferta!", image: "/images/punta-cana.jpg", focalPoint: {x:50,y:50}, description: "Un paraíso caribeño con resorts frente al mar y servicio All Inclusive." },
  { id: 7, name: "Camboriú", country: "Brasil", category: "Playas", price: 899, oldPrice: 1199, rating: 4.8, reviews: "0", days: 7, image: "/images/camboriu.png", focalPoint: {x:50,y:50}, description: "Disfrutá las playas de Santa Catarina, sus paseos costeros y la energía de uno de los destinos más elegidos de Brasil." },
  { id: 8, name: "El Chaltén", country: "Argentina", category: "Aventuras", price: 1199, oldPrice: 1499, rating: 4.9, reviews: "0", days: 6, image: "/images/el-chalten.png", focalPoint: {x:50,y:50}, description: "Descubrí la capital nacional del trekking, con senderos de montaña, lagunas de deshielo y vistas inolvidables del Fitz Roy." }
];

const readDraft = (key: string, fallback = "") => {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};
const writeDraft = (key: string, value: string) => {
  try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key); } catch { /* El formulario sigue funcionando sin almacenamiento local. */ }
};
const money = (n: number) => `USD ${n.toLocaleString("es-AR")}`;
const discount = (p: Package) => Math.round((1 - p.price / p.oldPrice) * 100);
const buildServicePrices = (price: number) => { const flight = Math.max(1, Math.round(price * 0.38)); const hotel = Math.max(1, Math.round(price * 0.54)); return { flight, hotel, assistance: Math.max(1, price - flight - hotel) }; };
const demoIncomeEntries: IncomeEntry[] = [
  { id: 1, reference: "MG-20481", client: "María González", destination: "Cancún", amount: 2598, method: "Tarjeta de crédito", status: "Acreditado", date: "13/11/2026" },
  { id: 2, reference: "MG-20480", client: "Lucas Fernández", destination: "Roma", amount: 1479, method: "Transferencia", status: "Pendiente", date: "12/11/2026" },
  { id: 3, reference: "MG-20479", client: "Sofía Martínez", destination: "Salvador de Bahía", amount: 2198, method: "Mercado Pago", status: "Acreditado", date: "11/11/2026" },
  { id: 4, reference: "MG-20478", client: "Tomás Romero", destination: "Camboriú", amount: 899, method: "Tarjeta de débito", status: "Pendiente", date: "10/11/2026" }
];
const loadSavedPackages = (): Package[] => {
  const saved = localStorage.getItem("mgt-packages");
  if (!saved) return packages;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return packages;
    const savedPackages = parsed as Package[];
    const missingDefaults = packages.filter(item => !savedPackages.some(savedItem => savedItem.id === item.id));
    return [...savedPackages, ...missingDefaults];
  } catch {
    return packages;
  }
};

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [heroSlide, setHeroSlide] = useState(0);
  const [employeePackages, setEmployeePackages] = useState<Package[]>(loadSavedPackages);
  const [focalEditPackageId, setFocalEditPackageId] = useState(1);
  const [employee, setEmployee] = useState("");
  const [employeeTab, setEmployeeTab] = useState<"overview" | "packages" | "offers" | "quotes" | "income" | "messages" | "bookings">("overview");
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>(() => { const saved = readDraft("mgt-income-entries"); if (saved) { try { const parsed = JSON.parse(saved) as IncomeEntry[]; if (Array.isArray(parsed)) return parsed; } catch { /* Datos de demostración. */ } } return demoIncomeEntries; });
  const [incomeConcept, setIncomeConcept] = useState(() => readDraft("mgt-draft-income-concept"));
  const [incomeAmount, setIncomeAmount] = useState(() => readDraft("mgt-draft-income-amount"));
  const [offerPackageId, setOfferPackageId] = useState(2);
  const [offerPercent, setOfferPercent] = useState("15");
  const [offerEndDate, setOfferEndDate] = useState(() => readDraft("mgt-draft-offer-end"));
  const [quoteDrafts, setQuoteDrafts] = useState<Record<number, { flight: string; hotel: string; assistance: string }>>(() => { const saved = readDraft("mgt-draft-quote-values"); if (saved) { try { return JSON.parse(saved) as Record<number, { flight: string; hotel: string; assistance: string }>; } catch { /* Cotizaciones calculadas desde el precio del paquete. */ } } return {}; });
  const [employeeMessage, setEmployeeMessage] = useState(() => readDraft("mgt-draft-employee-message"));
  const [newPackageName, setNewPackageName] = useState(() => readDraft("mgt-draft-package-name"));
  const [newPackagePrice, setNewPackagePrice] = useState(() => readDraft("mgt-draft-package-price"));
  const [newPackageCountry, setNewPackageCountry] = useState(() => readDraft("mgt-draft-package-country"));
  const [newPackageDays, setNewPackageDays] = useState(() => readDraft("mgt-draft-package-days", "7"));
  const [newPackageCategory, setNewPackageCategory] = useState(() => readDraft("mgt-draft-package-category", "Playas"));
  const [selected, setSelected] = useState<Package>(packages[0]);
  const [query, setQuery] = useState(() => readDraft("mgt-draft-destination"));
  const [origin, setOrigin] = useState(() => readDraft("mgt-draft-origin"));
  const [activeLocationField, setActiveLocationField] = useState<"origin" | "destination" | null>(null);
  const locationOptions = ["Buenos Aires, Argentina", "Córdoba, Argentina", "Villa María, Córdoba, Argentina", "Leones, Córdoba, Argentina", "Mendoza, Argentina", "Bariloche, Argentina", "Salta, Argentina", "Iguazú, Misiones, Argentina", "Montevideo, Uruguay", "Punta del Este, Uruguay", "Santiago, Chile", "Río de Janeiro, Brasil", "São Paulo, Brasil", "Salvador de Bahía, Brasil", "Florianópolis, Brasil", "Camboriú, Brasil", "El Chaltén, Santa Cruz, Argentina", "Cancún, México", "Ciudad de México, México", "Punta Cana, República Dominicana", "Nueva York, Estados Unidos", "Miami, Estados Unidos", "Madrid, España", "Barcelona, España", "Roma, Italia", "París, Francia", "Londres, Reino Unido"];
  const [category, setCategory] = useState("Todos");
  const [activeService, setActiveService] = useState("Paquetes");
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const [date, setDate] = useState(() => readDraft("mgt-draft-date", todayISO));
  const defaultReturn = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  const defaultReturnISO = `${defaultReturn.getFullYear()}-${String(defaultReturn.getMonth()+1).padStart(2,"0")}-${String(defaultReturn.getDate()).padStart(2,"0")}`;
  const [returnDate, setReturnDate] = useState(() => readDraft("mgt-draft-return-date", defaultReturnISO));
  const [travelers, setTravelers] = useState(() => Math.min(9, Math.max(1, Number(readDraft("mgt-draft-travelers", "2")) || 2)));
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [user, setUser] = useState(localStorage.getItem("mgt-user") || "");
  const [profileEmail, setProfileEmail] = useState(() => readDraft("mgt-draft-profile-email", localStorage.getItem("mgt-email") || ""));
  const [profilePhone, setProfilePhone] = useState(() => readDraft("mgt-draft-profile-phone", localStorage.getItem("mgt-phone") || ""));
  const [accountSection, setAccountSection] = useState<"bookings" | "profile" | "favorites" | "recent">("bookings");
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
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [activeNav, setActiveNav] = useState("Inicio");
  const [isSearching, setIsSearching] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(() => readDraft("mgt-draft-payment-method"));
  const [authEmail, setAuthEmail] = useState(() => readDraft("mgt-draft-auth-email"));
  const [authFullName, setAuthFullName] = useState(() => readDraft("mgt-draft-auth-name"));
  const [authPassword, setAuthPassword] = useState("");
  const [employeeEmailDraft, setEmployeeEmailDraft] = useState(() => readDraft("mgt-draft-employee-email", "empleado@mundoglobal.com"));
  const [employeePasswordDraft, setEmployeePasswordDraft] = useState("");
  const [contactName, setContactName] = useState(() => readDraft("mgt-draft-contact-name"));
  const [contactEmail, setContactEmail] = useState(() => readDraft("mgt-draft-contact-email"));
  const [contactMessage, setContactMessage] = useState(() => readDraft("mgt-draft-contact-message"));
  const [newsletterEmail, setNewsletterEmail] = useState(() => readDraft("mgt-draft-newsletter-email"));
  const [animatingFavorite, setAnimatingFavorite] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [staffMessages, setStaffMessages] = useState([
    { id: 1, name: "María González", subject: "Consulta por paquete a Cancún", body: "Hola, ¿el paquete incluye equipaje para despachar?", status: "Pendiente" },
    { id: 2, name: "Lucas Fernández", subject: "Cambio de fecha", body: "Necesitaría saber si puedo modificar la fecha de salida de mi viaje.", status: "Pendiente" },
    { id: 3, name: "Sofía Martínez", subject: "Medios de pago", body: "¿Puedo abonar una parte con tarjeta y otra por transferencia?", status: "Respondido" }
  ]);

  useEffect(() => {
    writeDraft("mgt-draft-employee-message", employeeMessage);
    writeDraft("mgt-draft-package-name", newPackageName);
    writeDraft("mgt-draft-package-price", newPackagePrice);
    writeDraft("mgt-draft-package-country", newPackageCountry);
    writeDraft("mgt-draft-package-days", newPackageDays);
    writeDraft("mgt-draft-package-category", newPackageCategory);
    writeDraft("mgt-draft-destination", query);
    writeDraft("mgt-draft-origin", origin);
    writeDraft("mgt-draft-date", date);
    writeDraft("mgt-draft-return-date", returnDate);
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
    writeDraft("mgt-draft-quote-values", JSON.stringify(quoteDrafts));
  }, [
    employeeMessage, newPackageName, newPackagePrice, newPackageCountry, newPackageDays, newPackageCategory,
    query, origin, date, returnDate, travelers, profileEmail, profilePhone,
    passengerName, passengerEmail, paymentMethod, authEmail, authFullName,
    employeeEmailDraft, contactName, contactEmail, contactMessage, newsletterEmail,
    incomeConcept, incomeAmount, offerEndDate, quoteDrafts
  ]);

  useEffect(() => {
    localStorage.setItem("mgt-packages", JSON.stringify(employeePackages));
  }, [employeePackages]);
  useEffect(() => { localStorage.setItem("mgt-income-entries", JSON.stringify(incomeEntries)); }, [incomeEntries]);

  useEffect(() => {
    const interval = window.setInterval(() => setHeroSlide(current => (current + 1) % 4), 3000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const go = (p: Page) => { setPage(p); setMobileMenu(false); if (p !== "results") setActiveNav(p === "home" ? "Inicio" : p === "support" ? "Contacto" : ""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openPackage = (p: Package) => { setSelected(p); go("detail"); };
  const toggleFavorite = (id: number) => { setAnimatingFavorite(id); window.setTimeout(() => setAnimatingFavorite(current => current === id ? null : current), 480); setFavorites(v => { const next = v.includes(id) ? v.filter(x => x !== id) : [...v, id]; setToast(next.includes(id) ? "¡Paquete guardado en tus favoritos!" : "Paquete quitado de favoritos."); return next; }); };
  const submitSearch = () => {
    if (isSearching) return;
    if (!origin.trim()) { setToast("Elegí una ciudad de origen para continuar."); return; }
    if (!query.trim()) { setToast("Elegí un destino para continuar."); return; }
    if (origin.trim().toLowerCase() === query.trim().toLowerCase()) { setToast("El origen y el destino deben ser diferentes."); return; }
    if (!date || !returnDate || returnDate < date) { setToast("Revisá las fechas de ida y vuelta."); return; }
    setIsSearching(true);
    const term = [origin.trim(), query.trim()].join(" → ");
    const next = [term, ...recentSearches.filter(x => x.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(next);
    localStorage.setItem("mgt-recent-searches", JSON.stringify(next));
    setSearchSubmitted(true);
    setActiveNav("Paquetes");
    window.setTimeout(() => { setIsSearching(false); go("results"); }, 650);
  };
  const filtered = useMemo(() => employeePackages.filter(p =>
    (category === "Todos" || p.category === category) &&
    (`${p.name} ${p.country}`.toLowerCase().includes(query.trim().split(",")[0].trim().toLowerCase())) &&
    p.price >= minPrice &&
    p.price <= maxPrice &&
    (!onlyOffers || p.tag === "¡Oferta!") &&
    (!topRatedOnly || p.rating >= 4.8)
  ), [category, query, employeePackages, maxPrice, onlyOffers, topRatedOnly]);
  const focalEditingPackage = employeePackages.find(p => p.id === focalEditPackageId) ?? employeePackages[0];
  const quoteForPackage = (p: Package) => p.servicePrices ?? buildServicePrices(p.price);
  const quoteDraftFor = (p: Package) => { const current = quoteForPackage(p); return quoteDrafts[p.id] ?? { flight: String(current.flight), hotel: String(current.hotel), assistance: String(current.assistance) }; };
  const savePackageQuote = (p: Package) => { const draft = quoteDraftFor(p); const flight = Number(draft.flight); const hotel = Number(draft.hotel); const assistance = Number(draft.assistance); if (![flight, hotel, assistance].every(value => Number.isFinite(value) && value > 0)) { setToast("Ingresá importes válidos para vuelo, hotel y asistencia."); return; } const total = flight + hotel + assistance; setEmployeePackages(items => items.map(item => { if (item.id !== p.id) return item; const keepOffer = item.tag === "¡Oferta!" && total < item.oldPrice; return { ...item, price: total, oldPrice: keepOffer ? item.oldPrice : total, tag: item.tag === "¡Oferta!" && !keepOffer ? undefined : item.tag, offerExpires: keepOffer ? item.offerExpires : undefined, servicePrices: { flight, hotel, assistance } }; })); setQuoteDrafts(items => ({ ...items, [p.id]: { flight: String(flight), hotel: String(hotel), assistance: String(assistance) } })); setToast("Cotización guardada y precio del paquete actualizado."); };
  const collectedIncome = incomeEntries.filter(entry => entry.status === "Acreditado").reduce((total, entry) => total + entry.amount, 0);
  const pendingIncome = incomeEntries.filter(entry => entry.status === "Pendiente").reduce((total, entry) => total + entry.amount, 0);
  const sortedPackages = useMemo(() => [...filtered].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return Number(Boolean(b.tag)) - Number(Boolean(a.tag));
  }), [filtered, sortBy]);

  const employeeLogin = (email: string, password: string) => {
    if (email.trim().toLowerCase() !== "empleado@mundoglobal.com" || password !== "MundoGlobal2026") {
      setToast("Credenciales de demostración incorrectas.");
      return;
    }
    setEmployee("Camila Torres");
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
    const cleanName = passengerName.trim();
    const cleanEmail = passengerEmail.trim();
    if (cleanName.length < 3) {
      setToast("Ingresá el nombre y apellido del pasajero principal.");
      return;
    }
    if (!paymentMethod) { setToast("Seleccioná un medio de pago para continuar."); return; }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(cleanEmail)) {
      setToast("Ingresá un correo electrónico válido para continuar.");
      return;
    }
    const id = `MGT-${Math.floor(100000 + Math.random() * 900000)}`;
    const next = [...bookings, `${selected.name} · ${id} · ${money(selected.price * travelers)}`];
    setBookings(next); localStorage.setItem("mgt-bookings", JSON.stringify(next));
    setIncomeEntries(items => [{ id: Date.now(), reference: id, client: cleanName, destination: selected.name, amount: selected.price * travelers, method: paymentMethod, status: "Pendiente", date: todayISO }, ...items]);
    setPassengerEmail("");
    setPaymentMethod("");
    writeDraft("mgt-draft-passenger-email", "");
    writeDraft("mgt-draft-payment-method", "");
    go("account"); setToast("Reserva de demostración registrada. El pago figura pendiente de acreditación.");
  };

  const answerAssistant = (raw: string) => {
    const question = raw.trim();
    if (!question) return;
    const normalized = question.toLowerCase();
    let answer = "¡Claro! Puedo orientarte. Por ahora puedo ayudarte con información general sobre paquetes, vuelos, hoteles, pagos y reservas. Si necesitás resolver un caso particular, puedo conectarte con nuestro equipo de atención.";
    if (/hola|buenas|buenos días|buenas tardes/.test(normalized)) {
      answer = "¡Hola! 😊 Qué bueno tenerte por acá. Contame qué estás buscando y te ayudo a encontrar la mejor opción.";
    } else if (/paquete|destino|viaje|oferta|precio|cancún|roma|brasil|punta cana/.test(normalized)) {
      answer = "¡Tenemos varias opciones! 🌎 En nuestra sección Paquetes podés explorar destinos como Cancún, Salvador de Bahía, Copacabana, Roma, Nueva York, Punta Cana, Camboriú y El Chaltén. Cada propuesta muestra la duración, el precio por persona y el desglose estimado de vuelos, hotel y asistencia al viajero. ¿Querés que te muestre los paquetes disponibles?";
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
  const renderHeader = () => <header className="header">
    <div className="nav-wrap">
      <button className="brand" onClick={() => go("home")} aria-label="Ir al inicio">
        <img className="brand-logo" src="/images/mundoglobal_travel.svg" alt="MundoGlobal Travel" />
      </button>
      <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
        <button className={activeNav === "Inicio" ? "active" : ""} onClick={() => { setActiveNav("Inicio"); go("home"); }}>Inicio</button>
        <button className={activeNav === "Paquetes" ? "active" : ""} onClick={() => { setActiveNav("Paquetes"); setCategory("Todos"); go("results"); }}>Paquetes</button>
        <button className={activeNav === "Destinos" ? "active" : ""} onClick={() => { setActiveNav("Destinos"); setCategory("Ciudades"); go("results"); }}>Destinos</button>
        <button className={activeNav === "Ofertas" ? "active" : ""} onClick={() => { setActiveNav("Ofertas"); setCategory("Todos"); go("results"); }}>Ofertas</button>
        <button className={activeNav === "Contacto" ? "active" : ""} onClick={() => { setActiveNav("Contacto"); go("support"); }}>Contacto</button>
      </nav>
      <div className="nav-actions">
        <button className="account-pill" onClick={() => go(user ? "account" : "login")}><UserRound size={16}/>{user || "Iniciar sesión"}{user && <ChevronDown size={14}/>}</button>
        <button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button>
      </div>
    </div>
  </header>;

  const renderFooter = () => <footer className="footer">
    <div className="footer-grid">
      <div><div className="brand brand-light"><img className="brand-logo brand-logo-light" src="/images/mundoglobal_travel.svg" alt="MundoGlobal Travel" /></div><p>Tu mundo, nuestro destino.<br/>Viajá más lejos, viví más experiencias.</p><div className="socials"><Facebook/><Instagram/><Youtube/><Linkedin/></div></div>
      <div><b>Explorá</b><button onClick={() => go("results")}>Paquetes</button><button onClick={() => go("results")}>Destinos</button><button onClick={() => go("results")}>Ofertas</button></div>
      <div><b>Ayuda</b><button onClick={() => go("support")}>Preguntas frecuentes</button><button onClick={() => go("support")}>Contacto</button><button onClick={() => go("support")}>Asistencia al viajero</button></div>
      <div><b>Medios de pago</b><div className="payment-tags"><span>VISA</span><span>mastercard</span><span>Transferencia</span></div><p className="secure-note"><ShieldCheck size={16}/> Compra segura y protegida</p><button className="footer-employee-link" onClick={() => go("employee-login")}>Acceso para empleados <ArrowRight size={13}/></button></div>
    </div>
    <div className="footer-bottom"><span>© 2026 MundoGlobal Travel. Todos los derechos reservados.</span><span>Turismo · Privacidad · Cookies</span></div>
  </footer>;

  const renderPackageCard = (p: Package, featured = false) => <article key={p.id} className={`package-card ${featured ? "featured" : ""}`}>
    <div className="package-photo"><SmartImage className="package-smart-image" src={p.image} alt={p.name} preset="card-standard" ratio="auto" focalPoint={p.focalPoint} safeArea={p.safeArea} priority={featured && p.id <= 4}/>
      {p.tag && <span className="offer-tag">{p.tag}</span>}
      <button type="button" className={`heart ${animatingFavorite === p.id ? "animate-heart" : ""} ${favorites.includes(p.id) ? "liked" : ""}`} onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(p.id); }} aria-label="Guardar favorito"><Heart size={18} fill={favorites.includes(p.id) ? "currentColor" : "none"}/></button>
    </div>
    <div className="package-info">
      <div className="package-heading"><div><h3>{p.id===2?"Salvador":p.name}</h3><p>{p.country} <span>·</span> Playas</p></div></div>
      <div className="offer-rating"><Star size={13} fill="currentColor"/> {p.rating.toFixed(1)} <small>({p.reviews})</small>{p.tag==="¡Oferta!" && <span className="discount">{discount(p)}% OFF</span>}</div>
      <div className="price-line"><strong>{money(p.price)}</strong><del>{money(p.oldPrice)}</del></div>
      <button className="outline-btn full offer-reserve" onClick={() => openPackage(p)}>Reservar <ArrowRight size={16}/></button>
    </div>
  </article>;

  const renderSearchBar = () => {
    const matches = locationOptions.filter(place => place.toLowerCase().includes((activeLocationField === "origin" ? origin : query).trim().toLowerCase())).slice(0, 7);
    return <div className="search-panel">
      <div className={`search-field location-field origin-search-field ${activeLocationField === "origin" ? "location-focused" : ""}`}>
        <span className="field-icon"><MapPin size={18}/></span>
        <span className="search-field-copy">
          <small>Origen</small>
          <input value={origin} onChange={e => setOrigin(e.target.value)} onFocus={() => setActiveLocationField("origin")} onBlur={() => window.setTimeout(() => setActiveLocationField(current => current === "origin" ? null : current), 140)} placeholder="¿Desde dónde salís?" autoComplete="off" aria-label="Ciudad de origen"/>
          {activeLocationField === "origin" && origin.trim().length > 0 && <div className="location-suggestions">
            {matches.length > 0 ? matches.map(place => <button type="button" key={place} onMouseDown={e => e.preventDefault()} onClick={() => { setOrigin(place); setActiveLocationField(null); }}>{place}</button>) : <p>No encontramos coincidencias. Probá con otra ciudad o país.</p>}
          </div>}
        </span>
      </div>
      <div className={`search-field location-field destination-search-field ${activeLocationField === "destination" ? "location-focused" : ""}`}>
        <span className="field-icon"><MapPin size={18}/></span>
        <span className="search-field-copy">
          <small>Destino</small>
          <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setActiveLocationField("destination")} onBlur={() => window.setTimeout(() => setActiveLocationField(current => current === "destination" ? null : current), 140)} placeholder="¿A dónde querés ir?" autoComplete="off" aria-label="Ciudad de destino"/>
          {activeLocationField === "destination" && query.trim().length > 0 && <div className="location-suggestions">
            {matches.length > 0 ? matches.map(place => <button type="button" key={place} onMouseDown={e => e.preventDefault()} onClick={() => { setQuery(place); setActiveLocationField(null); }}>{place}</button>) : <p>No encontramos coincidencias. Probá con otra ciudad o país.</p>}
          </div>}
        </span>
      </div>
      <label className="search-field date-search-field">
        <span className="field-icon"><CalendarDays size={18}/></span>
        <span className="search-field-copy">
          <small>Fecha de ida</small>
          <input type="date" value={date} min={todayISO} onChange={e => { const nextDate=e.target.value; setDate(nextDate); if(returnDate < nextDate) setReturnDate(nextDate); }} aria-label="Fecha de ida"/>
        </span>
      </label>
      <label className="search-field date-search-field">
        <span className="field-icon"><CalendarDays size={18}/></span>
        <span className="search-field-copy">
          <small>Fecha de vuelta</small>
          <input type="date" value={returnDate} min={date} onChange={e => setReturnDate(e.target.value)} aria-label="Fecha de vuelta"/>
        </span>
      </label>
      <label className="search-field select-search-field passengers-search-field">
        <span className="field-icon"><Users size={18}/></span>
        <span className="search-field-copy"><small>Pasajeros</small>
          <select value={travelers} onChange={e => setTravelers(Number(e.target.value))} aria-label="Cantidad de pasajeros">
            {Array.from({length: 9}, (_, index) => index + 1).map(count => <option key={count} value={count}>{count} {count === 1 ? "pasajero" : "pasajeros"}</option>)}
          </select>
        </span>
      </label>
      <button className={`primary-btn search-button ${isSearching ? "searching" : ""}`} onClick={submitSearch} disabled={isSearching}>{isSearching ? <><span className="search-spinner"/> Buscando...</> : <><Search size={17}/> Buscar</>}</button>
    </div>;
  };

  const renderHome = () => <><section className="hero-shell"><div className="hero hero-reference">
    <div className="hero-art" aria-hidden="true"><SmartImage className="hero-smart-image" src="/images/hero-mundo.svg" alt="" preset="hero" ratio="auto" focalPoint={{x:72,y:50}} fit="cover" priority/></div>
    <div className="hero-copy">
      <span className="eyebrow hero-trust-badge"><Plane size={15} fill="currentColor"/> Más de 2 millones de viajeros felices</span>
      <h1>El mundo está<br/><span className="hero-title-line">esperando <em>por vos<svg className="hero-brush" viewBox="0 0 220 18" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12 C55 2 128 4 215 9 C158 13 65 17 3 12Z" fill="#F5B93A"/></svg></em></span></h1>
      <p>Encontrá tu próximo viaje en un solo lugar: vuelos, hoteles y paquetes con atención personalizada.</p>
      <div className="hero-buttons">
        <button className="yellow-btn" onClick={() => go("results")}>Explorar destinos <ArrowRight size={16}/></button>
        <button className="ghost-btn" onClick={() => go("results")}><Tag size={16}/> Ver oferta</button>
      </div>
      <div className="hero-service-tabs" aria-label="Servicios de viaje">
        <button className="active" type="button" onClick={() => go("results")}><Globe2 size={17}/> Paquetes</button>
        <button type="button" onClick={() => go("results")}><Plane size={17}/> Vuelos</button>
        <button type="button" onClick={() => go("results")}><Hotel size={17}/> Hoteles</button>
        <button type="button" onClick={() => go("results")}><CarFront size={17}/> Autos</button>
      </div>
    </div>
  </div>{renderSearchBar()}</section>
  <section className="section destinations-section">
    <div className="category-row destination-filters">
      {[{name:"Todos",icon:null},{name:"Playas",icon:<Plane size={14}/>},{name:"Ciudades",icon:<Hotel size={14}/>},{name:"Aventuras",icon:<Sparkles size={14}/>},{name:"Cultura",icon:<Star size={14}/>}].map(item=><button type="button" key={item.name} className={category===item.name?"selected":""} onClick={()=>setCategory(item.name)}>{item.icon}{item.name}</button>)}
    </div>
    <div className="destination-grid destination-reference">
      {[packages[0],packages[3],packages[4],packages[5],packages[6],packages[7]].map(p=><article className="destination-card" key={p.id}>
        <div className="destination-photo"><SmartImage className="destination-smart-image" src={p.image} alt={p.name} preset="card-standard" ratio="auto" focalPoint={p.focalPoint} safeArea={p.safeArea}/><button type="button" className={`heart ${favorites.includes(p.id)?"liked":""}`} onClick={()=>toggleFavorite(p.id)} aria-label="Guardar favorito"><Heart size={17} fill={favorites.includes(p.id)?"currentColor":"none"}/></button>{p.id===1&&<span className="destination-badge">★ Más elegido</span>}</div>
        <div className="destination-info"><div><h3>{p.name}</h3><p>{p.id===5?"EE.UU.":p.country} · {p.category}</p><span className="destination-rating"><Star size={14} fill="currentColor"/> {p.rating.toFixed(1)} <small>({p.reviews})</small></span></div><button className="destination-arrow" onClick={()=>openPackage(p)} aria-label={`Ver ${p.name}`}><ArrowRight size={18}/></button></div>
      </article>)}
    </div>
  </section>
  <section className="benefit-strip"><div><span><Plane/></span><b>Turnos y pagos<small>100% online</small></b></div><div><span><ShieldCheck/></span><b>Compra segura<small>Tus datos protegidos</small></b></div><div><span><Headphones/></span><b>Atención al cliente<small>Soporte 24/7</small></b></div><div><span><CreditCard/></span><b>Múltiples medios<small>de pago</small></b></div></section>
  <section className="section offers-section">
    <div className="offer-grid offer-reference">{[packages[0],packages[1],packages[2]].map(p=>renderPackageCard(p,true))}</div>
  </section>
  <section className="trust-section"><div className="trust-card"><div className="stars">★★★★★</div><h3>Miles de viajeros ya confían en nosotros</h3><p>Calidad y experiencias únicas en todo el mundo.</p><b>+50.000 viajeros</b></div><div className="trust-card"><div className="stars">★★★★★</div><h3>Los mejores precios del mercado</h3><p>Encontrá las mejores ofertas y ahorrá más.</p><b><ShieldCheck size={17}/> Compra segura</b></div><div className="trust-card"><div className="stars">★★★★★</div><h3>Atención personalizada</h3><p>Estamos para ayudarte en todo momento.</p><b><MessageCircle size={17}/> Chat 24/7</b></div></section>
  <section className="newsletter"><div className="newsletter-icon"><Mail/></div><div><h3>¿Buscás más ayuda?</h3><p>Suscribite y recibí las mejores ofertas en tu email.</p></div><form onSubmit={e=>{e.preventDefault();if(!newsletterEmail.trim())return;setToast("¡Gracias por suscribirte!");setNewsletterEmail("");}}><input type="email" value={newsletterEmail} onChange={e=>setNewsletterEmail(e.target.value)} required placeholder="Tu email aquí..."/><button className="yellow-btn">Suscribirme <ArrowRight size={15}/></button></form></section>
  </>;

  const renderResults = () => <main className="page-container"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span> Paquetes</div><div className="page-title-row"><div><span className="kicker">ENCONTRÁ TU PRÓXIMA AVENTURA</span><h1>Paquetes de viaje</h1><p>Experiencias completas, pensadas para que solo te ocupes de disfrutar.</p></div><span className="results-count">{filtered.length} experiencias</span></div><div className="results-search">{renderSearchBar()}</div><div className="results-layout"><aside className="filters"><h3><SlidersHorizontal size={18}/> Filtrar resultados</h3><b>Tipo de viaje</b>{["Todos","Playas","Ciudades","Cultura","Aventuras"].map(c=><button key={c} className={category===c?"filter-active":""} onClick={()=>setCategory(c)}>{c}<span>{c==="Todos"?packages.length:packages.filter(p=>p.category===c).length}</span></button>)}<div className="filter-divider"/><b>Buscar destino o país</b><input className="filter-text-input" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. Cancún, Brasil, Italia..." aria-label="Buscar destino o país"/><div className="filter-divider"/><b>Rango de precio por persona</b><p className="filter-hint">Ingresá los importes en USD.</p><div className="filter-price-fields"><label>Desde<input type="number" min="0" step="50" value={minPrice} onChange={e=>setMinPrice(Math.max(0,Number(e.target.value)||0))}/></label><label>Hasta<input type="number" min={minPrice} step="50" value={maxPrice} onChange={e=>setMaxPrice(Math.max(minPrice,Number(e.target.value)||0))}/></label></div><input className="price-range" type="range" min={Math.max(0,minPrice)} max="2000" step="50" value={Math.min(maxPrice,2000)} onChange={e=>setMaxPrice(Math.max(minPrice,Number(e.target.value)))} aria-label="Precio máximo"/><div className="filter-divider"/><b>Preferencias</b><label className="check-label"><input type="checkbox" checked={onlyOffers} onChange={e=>setOnlyOffers(e.target.checked)}/> Solo ofertas</label><label className="check-label"><input type="checkbox" checked={topRatedOnly} onChange={e=>setTopRatedOnly(e.target.checked)}/> Mejor valorados (4.8+)</label><button className="filter-reset" onClick={()=>{setCategory("Todos");setQuery("");setMinPrice(0);setMaxPrice(2000);setOnlyOffers(false);setTopRatedOnly(false);setSortBy("recommended");}}>Limpiar todos los filtros</button></aside><div className="results-content"><div className="sort-row"><span>{filtered.length} paquetes encontrados</span><select aria-label="Ordenar paquetes" value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="recommended">Recomendados</option><option value="price">Menor precio</option><option value="rating">Mejor calificación</option></select></div><div className="results-grid">{sortedPackages.map(p=>renderPackageCard(p))}</div>{filtered.length===0&&<div className="empty-state"><Search size={34}/><h3>No encontramos resultados</h3><p>Probá con otro destino o categoría.</p><button className="primary-btn" onClick={()=>{setQuery("");setOrigin("");setCategory("Todos");setMinPrice(0);setMaxPrice(2000);setOnlyOffers(false);setTopRatedOnly(false);setSortBy("recommended");}}>Limpiar filtros</button></div>}</div></div></main>;

  const selectedQuote = quoteForPackage(selected);
  const renderDetail = () => <main className="page-container detail-page">
    <div className="breadcrumb"><button onClick={() => go("home")}>Inicio</button><span>/</span><button onClick={() => go("results")}>Paquetes</button><span>/</span>{selected.name}</div>
    <div className="detail-hero">
      <SmartImage
        className="detail-smart-image"
        src={selected.image}
        alt={selected.name}
        preset="card-wide"
        ratio="auto"
        fit="smart"
        focalPoint={selected.focalPoint ?? {x:50,y:60}}
        objectPosition={selected.imagePosition ?? "center 60%"}
        sizes="100vw"
        minSourceWidth={1200}
        priority
      />
      <div className="detail-hero-copy">
        <span className="eyebrow"><MapPin size={14}/> {selected.country} · {selected.category}</span>
        <h1>{selected.name}</h1>
        <p>{selected.description}</p>
        <span className="detail-rating">
          <Star size={16} fill="currentColor"/>
          <strong>{selected.rating.toFixed(1)}</strong>
          <span>{selected.reviews === "0" ? "Nuevo" : `(${selected.reviews} opiniones)`}</span>
        </span>
      </div>
    </div>
    <div className="detail-layout">
      <div className="detail-main">
        <h2>Tu viaje, todo resuelto</h2>
        <p className="muted">Un paquete integral con los servicios esenciales para viajar tranquilo.</p>
        <div className="included-grid">
          <div><span><Plane/></span><b>Vuelos ida y vuelta</b><p>{money(selectedQuote.flight)} por pasajero · cotización estimada.</p></div>
          <div><span><Hotel/></span><b>Hotel · {selected.days - 1} noches</b><p>{money(selectedQuote.hotel)} por pasajero · alojamiento seleccionado.</p></div>
          <div><span><Stethoscope/></span><b>Asistencia al viajero</b><p>{money(selectedQuote.assistance)} por pasajero · cobertura durante la estadía.</p></div>
        </div>
        <h2>Detalle de servicios y precios</h2>
        <ul className="included-list">
          <li><CheckCircle2/> Vuelos de ida y vuelta · {money(selectedQuote.flight)}</li>
          <li><CheckCircle2/> Alojamiento · {money(selectedQuote.hotel)}</li>
          <li><CheckCircle2/> Asistencia al viajero · {money(selectedQuote.assistance)}</li>
          <li><CheckCircle2/> Traslados aeropuerto – hotel – aeropuerto · sujeto a cotización</li>
          <li><CheckCircle2/> Soporte digital 24/7</li>
        </ul>
        <div className="notice"><ShieldCheck/><span><b>Servicios con precio transparente</b><small>La asistencia al viajero tiene un costo y está discriminada en el total. Los importes son orientativos de esta demostración y deben confirmarse con cada proveedor.</small></span></div>
      </div>
      <aside className="booking-card">
        {selected.tag==="¡Oferta!" && discount(selected)>0 && <span className="discount">{discount(selected)}% OFF</span>}
        <div className="price-line"><strong>{money(selected.price)}</strong><del>{money(selected.oldPrice)}</del></div>
        <small>por persona · incluye los servicios cotizados abajo</small>
        <div className="employee-quote-breakdown"><div><span>Vuelos</span><b>{money(selectedQuote.flight)}</b></div><div><span>Hotel</span><b>{money(selectedQuote.hotel)}</b></div><div><span>Asistencia al viajero</span><b>{money(selectedQuote.assistance)}</b></div></div>
        <div className="booking-divider"/>
        <label>Fecha de salida<input type="date" value={date} min={todayISO} onChange={e=>setDate(e.target.value)}/></label>
        <label>Pasajeros<select value={travelers} onChange={e=>setTravelers(Number(e.target.value))}><option value={1}>1 adulto</option><option value={2}>2 adultos</option><option value={3}>3 adultos</option><option value={4}>4 adultos</option></select></label>
        <div className="booking-total"><span>Total estimado</span><b>{money(selected.price*travelers)}</b></div>
        <button className="primary-btn full" onClick={()=>go(user?"checkout":"login")}>Reservar paquete <ArrowRight size={17}/></button>
        <p className="booking-safe"><LockKeyhole size={14}/> Reserva segura · Sin cargos ocultos</p>
      </aside>
    </div>
  </main>;

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
    <div className="employee-top"><div><span className="kicker">MUNDO GLOBAL TRAVEL · OPERACIONES</span><h1>Centro de operaciones</h1><p>Hola, {employee}. Administrá ventas, productos, proveedores y atención al viajero.</p></div><button className="outline-btn" onClick={()=>{setEmployee("");go("home");}}><LogOut size={16}/> Cerrar sesión</button></div>
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
          <div className="employee-section-title"><div><h2>Paquetes y productos turísticos</h2><p>Publicá viajes con precio final, duración y servicios cotizados.</p></div><span className="demo-label">CATÁLOGO LOCAL</span></div>
          <form className="employee-add-form" onSubmit={e=>{e.preventDefault();const price=Number(newPackagePrice);const days=Number(newPackageDays);if(newPackageName.trim().length<2||newPackageCountry.trim().length<2||!Number.isFinite(price)||price<100||!Number.isInteger(days)||days<1||days>60){setToast("Completá destino, país, duración y un precio final válido.");return;}const item:Package={id:Date.now(),name:newPackageName.trim(),country:newPackageCountry.trim(),category:newPackageCategory,price,oldPrice:price,rating:4.7,reviews:"0",days,image:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=85",description:"Nuevo paquete cargado por el equipo de la agencia.",servicePrices:buildServicePrices(price)};setEmployeePackages(v=>[item,...v]);setNewPackageName("");setNewPackageCountry("");setNewPackagePrice("");setNewPackageDays("7");setNewPackageCategory("Playas");setToast("Paquete publicado en el catálogo de demostración.");}}>
            <input value={newPackageName} onChange={e=>setNewPackageName(e.target.value)} placeholder="Destino (ej. Bariloche)" required/><input value={newPackageCountry} onChange={e=>setNewPackageCountry(e.target.value)} placeholder="País" required/><select value={newPackageCategory} onChange={e=>setNewPackageCategory(e.target.value)}><option>Playas</option><option>Ciudades</option><option>Cultura</option><option>Aventuras</option></select><input type="number" min="1" max="60" value={newPackageDays} onChange={e=>setNewPackageDays(e.target.value)} placeholder="Días" required/><input type="number" min="100" value={newPackagePrice} onChange={e=>setNewPackagePrice(e.target.value)} placeholder="Precio final USD" required/><button className="primary-btn"><Plus size={15}/> Publicar paquete</button>
          </form>
          <p className="employee-form-note">Al publicar, el precio final se desglosa en vuelo, hotel y asistencia al viajero. Los importes son orientativos hasta confirmar las tarifas con los proveedores.</p>
          <div className="focal-editor-select"><label>Encuadre de imagen del paquete<select value={focalEditingPackage?.id ?? ""} onChange={e=>setFocalEditPackageId(Number(e.target.value))}>{employeePackages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div>
          <FocalPointEditor src={focalEditingPackage?.image ?? packages[0].image} name={focalEditingPackage?.name ?? "Cancún"} focalPoint={focalEditingPackage?.focalPoint} onChange={point=>{if(focalEditingPackage)setEmployeePackages(items=>items.map(p=>p.id===focalEditingPackage.id?{...p,focalPoint:point}:p));}}/>
          <div className="employee-package-list">{employeePackages.map(p=>{const q=quoteForPackage(p);return <article key={p.id}><SmartImage className="employee-package-smart-image" src={p.image} alt={p.name} preset="thumb" ratio="auto"/><div><b>{p.name}</b><small>{p.country} · {p.days} días · Vuelo {money(q.flight)} · Hotel {money(q.hotel)} · Asistencia {money(q.assistance)}</small></div><strong>{money(p.price)}</strong><button className="employee-delete" onClick={()=>{setEmployeePackages(v=>v.filter(x=>x.id!==p.id));setToast("Paquete quitado del catálogo local.");}} aria-label={"Eliminar "+p.name}><X size={17}/></button></article>;})}</div>
        </>}
        {employeeTab==="offers"&&<>
          <div className="employee-section-title"><div><h2>Promociones y ofertas</h2><p>Aplicá descuentos a un paquete y actualizá el precio público.</p></div><span className="demo-label">PUBLICACIÓN LOCAL</span></div>
          <form className="employee-promo-form" onSubmit={e=>{e.preventDefault();const chosen=employeePackages.find(p=>p.id===offerPackageId);const percent=Number(offerPercent);if(!chosen||!Number.isFinite(percent)||percent<1||percent>70||!offerEndDate){setToast("Elegí un paquete, un descuento entre 1% y 70% y una fecha de vigencia.");return;}const basePrice=chosen.price;const promoPrice=Math.max(1,Math.round(basePrice*(1-percent/100)));setEmployeePackages(items=>items.map(p=>p.id===chosen.id?{...p,oldPrice:basePrice,price:promoPrice,tag:"¡Oferta!",offerExpires:offerEndDate,servicePrices:buildServicePrices(promoPrice)}:p));setToast("Oferta del "+percent+"% aplicada a "+chosen.name+".");}}>
            <label>Paquete<select value={offerPackageId} onChange={e=>setOfferPackageId(Number(e.target.value))}>{employeePackages.map(p=><option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}</select></label>
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
          <div className="employee-section-title"><div><h2>Proveedores y cotizaciones</h2><p>Desglose de costos estimados de los servicios por pasajero.</p></div><span className="demo-label">COTIZACIÓN REFERENCIAL</span></div>
          <div className="employee-quote-warning"><Building2/><span><b>Importes de ejemplo, no cotizaciones confirmadas</b><small>La integración con hoteles, aerolíneas y compañías de asistencia todavía no está conectada. Antes de vender, el empleado debe solicitar y validar disponibilidad, moneda, impuestos y vigencia con cada proveedor.</small></span></div>
          <div className="employee-quote-edit-list">{employeePackages.map(p=>{const draft=quoteDraftFor(p);return <article key={p.id}><div className="employee-quote-edit-heading"><div><b>{p.name} · {p.country}</b><small>{p.days-1} noches · Precio actual {money(p.price)} por persona</small></div><span className="demo-label">EDITABLE</span></div><div className="employee-quote-edit-inputs"><label>Vuelo · USD<input type="number" min="1" step="0.01" value={draft.flight} onChange={e=>setQuoteDrafts(items=>({...items,[p.id]:{...draft,flight:e.target.value}}))}/></label><label>Hotel · USD<input type="number" min="1" step="0.01" value={draft.hotel} onChange={e=>setQuoteDrafts(items=>({...items,[p.id]:{...draft,hotel:e.target.value}}))}/></label><label>Asistencia · USD<input type="number" min="1" step="0.01" value={draft.assistance} onChange={e=>setQuoteDrafts(items=>({...items,[p.id]:{...draft,assistance:e.target.value}}))}/></label></div><div className="employee-quote-edit-footer"><small>Total nuevo al guardar: {money((Number(draft.flight)||0)+(Number(draft.hotel)||0)+(Number(draft.assistance)||0))}</small><button type="button" className="primary-btn" onClick={()=>savePackageQuote(p)}>Guardar cotización <Check size={14}/></button></div></article>;})}</div>
          <div className="employee-quote-supplier-grid">
            <article><span><Plane/></span><b>Aerolíneas</b><small>Tarifa aérea, equipaje, tasas y disponibilidad por fecha.</small></article>
            <article><span><Hotel/></span><b>Hoteles</b><small>Habitación, régimen, noches, impuestos y políticas de cancelación.</small></article>
            <article><span><Stethoscope/></span><b>Asistencia al viajero</b><small>Plan, cobertura, edad del pasajero y días de vigencia.</small></article>
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
          <div className="employee-message-list">{staffMessages.map(m=><article key={m.id}><div className="employee-message-head"><div><b>{m.name}</b><small>{m.subject}</small></div><span className={m.status==="Pendiente"?"message-pending":"message-done"}>{m.status}</span></div><p>{m.body}</p><textarea value={employeeMessage} onChange={e=>setEmployeeMessage(e.target.value)} placeholder="Escribí una respuesta para el cliente..." rows={2}/><button className="primary-btn" disabled={!employeeMessage.trim()} onClick={()=>{setStaffMessages(v=>v.map(x=>x.id===m.id?{...x,status:"Respondido"}:x));setEmployeeMessage("");setToast("Respuesta registrada en la simulación.");}}>Registrar respuesta <ArrowRight size={14}/></button></article>)}</div>
        </>}
        {employeeTab==="bookings"&&<>
          <div className="employee-section-title"><div><h2>Reservas y pasajeros</h2><p>Revisá operaciones, importes y estado de los pagos.</p></div><span className="demo-label">RESERVAS DE PRUEBA</span></div>
          <div className="employee-booking-list">{incomeEntries.filter(entry=>entry.reference.startsWith("MG-")||entry.reference.startsWith("MGT-")).map(entry=><article key={entry.id}><span className="booking-icon"><Ticket/></span><div><b>{entry.destination||"Reserva de viaje"}</b><small>{entry.reference} · {entry.client} · {entry.date} · {entry.method}</small></div><strong>{money(entry.amount)}</strong><span className={entry.status==="Acreditado"?"message-done":"message-pending"}>{entry.status==="Acreditado"?"Pago acreditado":"Pendiente de pago"}</span></article>)}</div>
        </>}
      </section>
    </div>
    <p className="employee-disclaimer"><ShieldCheck size={15}/> Prototipo académico: las operaciones se guardan localmente en este navegador. Los precios y cotizaciones son referenciales; no se conectan proveedores, bancos ni pasarelas de pago reales.</p>
  </main>;

  const checkoutQuote = quoteForPackage(selected);
  const renderCheckout = () => <main className="page-container narrow"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span><button onClick={()=>go("detail")}>Paquete</button><span>/</span>Confirmar reserva</div><div className="checkout-title"><span className="kicker">ÚLTIMO PASO</span><h1>Confirmá tu viaje</h1><p>Revisá los detalles antes de confirmar tu reserva de prueba.</p></div><div className="checkout-layout"><div className="checkout-box"><h2>Resumen del paquete</h2><div className="checkout-destination"><SmartImage className="checkout-smart-image" src={selected.image} alt={selected.name} preset="thumb" ratio="auto"/><div><b>{selected.name} · {selected.country}</b><small>{selected.days} días · {travelers} pasajero(s)</small><small>Ida: {date} · Vuelta: {returnDate}</small></div></div><div className="checkout-service"><Plane/> Vuelos ida y vuelta <strong>{money(checkoutQuote.flight)}</strong></div><div className="checkout-service"><Hotel/> Hotel · {selected.days - 1} noches <strong>{money(checkoutQuote.hotel)}</strong></div><div className="checkout-service"><Stethoscope/> Asistencia al viajero <strong>{money(checkoutQuote.assistance)}</strong></div><p className="form-hint">Cada servicio tiene un importe asignado. Estos valores son referenciales de la demostración y se confirman con los proveedores antes de emitir.</p><div className="booking-divider"/><h2>Datos del pasajero principal</h2><label>Nombre y apellido<input value={passengerName} onChange={e=>setPassengerName(e.target.value)} autoComplete="name" placeholder="Nombre completo" maxLength={80}/></label><label>Correo electrónico<input type="email" value={passengerEmail} onChange={e=>setPassengerEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" maxLength={120}/></label><p className="form-hint">Usaremos estos datos para identificar la reserva y enviar la confirmación.</p><div className="booking-divider"/><h2>Elegí tu medio de pago</h2><p className="form-hint">Seleccioná cómo preferís abonar. En esta demo no se realizará ningún cobro.</p><div className="payment-method-grid"><button type="button" className={`payment-method ${paymentMethod === "Tarjeta de crédito" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Tarjeta de crédito")}><span className="payment-visual card-visa">VISA</span><b>Tarjeta de crédito</b><small>Crédito y cuotas</small></button><button type="button" className={`payment-method ${paymentMethod === "Tarjeta de débito" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Tarjeta de débito")}><span className="payment-visual card-master"><i></i><i></i></span><b>Tarjeta de débito</b><small>Pago con débito</small></button><button type="button" className={`payment-method ${paymentMethod === "Mercado Pago" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Mercado Pago")}><span className="payment-visual mercado-logo"> Mercado Pago </span><b>Mercado Pago</b><small>Billetera virtual</small></button><button type="button" className={`payment-method ${paymentMethod === "Transferencia bancaria" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Transferencia bancaria")}><span className="payment-visual transfer-visual"><CreditCard size={25}/></span><b>Transferencia</b><small>Desde tu banco</small></button></div><div className="demo-warning"><CircleHelp/> Esta es una simulación académica. No se realizará ningún cobro ni reserva real.</div></div><aside className="booking-card"><h3>Detalle de precio</h3><div className="summary-row"><span>Vuelos · por persona</span><b>{money(checkoutQuote.flight)}</b></div><div className="summary-row"><span>Hotel · por persona</span><b>{money(checkoutQuote.hotel)}</b></div><div className="summary-row"><span>Asistencia · por persona</span><b>{money(checkoutQuote.assistance)}</b></div><div className="summary-row"><span>Pasajeros</span><b>× {travelers}</b></div><div className="booking-divider"/><div className="booking-total"><span>Total</span><b>{money(selected.price*travelers)}</b></div><button className="primary-btn full" onClick={reserve}>Confirmar reserva <Check size={17}/></button><p className="booking-safe"><LockKeyhole size={14}/> Proceso de demostración</p></aside></div></main>;

  const renderAccount = () => <main className="page-container"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span>Mi cuenta</div><div className="account-heading"><div className="user-avatar"><UserRound/></div><div><span className="kicker">MI ESPACIO MUNDO GLOBAL</span><h1>¡Hola, {user || "Viajero"}!</h1><p>Gestioná tus viajes y preparate para tu próxima aventura.</p></div><button className="outline-btn" onClick={()=>{setUser("");localStorage.removeItem("mgt-user");go("home");}}> <LogOut size={16}/> Cerrar sesión</button></div><div className="account-grid"><aside className="account-menu"><button className={accountSection==="bookings"?"current":""} onClick={()=>setAccountSection("bookings")}><Ticket/> Mis reservas</button><button className={accountSection==="profile"?"current":""} onClick={()=>setAccountSection("profile")}><UserRound/> Mi perfil</button><button className={accountSection==="favorites"?"current":""} onClick={()=>setAccountSection("favorites")}><Heart/> Mis favoritos</button><button className={accountSection==="recent"?"current":""} onClick={()=>setAccountSection("recent")}><Clock3/> Búsquedas recientes</button><button onClick={()=>go("support")}><Headphones/> Ayuda y soporte</button></aside><section className="account-content">
    {accountSection==="bookings"&&<><div className="section-heading compact"><div><h2>Mis reservas</h2><p>Consultá el estado de tus próximos viajes.</p></div><button className="primary-btn" onClick={()=>go("results")}>Buscar viajes <ArrowRight size={16}/></button></div>{bookings.length===0?<div className="empty-state"><Luggage size={42}/><h3>Todavía no tenés viajes reservados</h3><p>Tu próxima aventura está a un clic de distancia.</p><button className="primary-btn" onClick={()=>go("results")}>Explorar paquetes</button></div>:bookings.map((b,i)=><div className="booking-list-item" key={i}><span className="booking-icon"><Plane/></span><div><b>{b.split(" · ")[0]}</b><small>Código: {b.split(" · ")[1]} · Reserva de demostración</small></div><strong>{b.split(" · ")[2]}</strong><span className="status-pill"><CheckCircle2 size={13}/> Confirmada</span></div>)}</>}
    {accountSection==="profile"&&<><div className="section-heading compact"><div><h2>Mi perfil</h2><p>Actualizá tus datos personales de contacto.</p></div></div><form className="profile-edit-form" onSubmit={e=>{e.preventDefault();const name=passengerName.trim();if(name.length<3){setToast("Ingresá tu nombre y apellido.");return;}setUser(name);localStorage.setItem("mgt-user",name);localStorage.setItem("mgt-email",profileEmail);localStorage.setItem("mgt-phone",profilePhone);setToast("¡Tu perfil fue actualizado!");}}><label>Nombre y apellido<input value={passengerName} onChange={e=>setPassengerName(e.target.value)} required minLength={3} maxLength={80}/></label><label>Correo electrónico<input type="email" value={profileEmail} onChange={e=>setProfileEmail(e.target.value)} placeholder="tu@email.com" required/></label><label>Teléfono<input value={profilePhone} onChange={e=>setProfilePhone(e.target.value)} placeholder="+54 9 353 ..." /></label><button className="primary-btn">Guardar cambios <Check size={16}/></button></form></>}
    {accountSection==="favorites"&&<><div className="section-heading compact"><div><h2>Mis favoritos</h2><p>Los destinos que guardaste para más adelante.</p></div></div><div className="account-favorites-grid">{employeePackages.filter(p=>favorites.includes(p.id)).map(p=>renderPackageCard(p))}</div>{favorites.length===0&&<div className="empty-state"><Heart size={38}/><h3>Todavía no guardaste favoritos</h3><p>Usá el corazón de cada paquete para guardarlo.</p><button className="primary-btn" onClick={()=>go("results")}>Explorar paquetes</button></div>}</>}
    {accountSection==="recent"&&<><div className="section-heading compact"><div><h2>Búsquedas recientes</h2><p>Retomá rápidamente los destinos que estuviste explorando.</p></div></div>{recentSearches.length===0?<div className="empty-state"><Search size={38}/><h3>Aún no tenés búsquedas recientes</h3><p>Cuando busques destinos, aparecerán acá.</p></div>:<div className="recent-search-list">{recentSearches.map((term,i)=><button key={i} onClick={()=>{setQuery(term==="Todos los destinos"?"":term);go("results");}}><span><Search size={16}/>{term}</span><ArrowRight size={16}/></button>)}</div>}</>}
  </section></div></main>;

  const renderSupport = () => <main className="page-container narrow"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span>Ayuda y asistencia</div><div className="support-hero"><span className="support-icon"><Headphones/></span><span className="kicker">ESTAMOS PARA ACOMPAÑARTE</span><h1>¿En qué podemos ayudarte?</h1><p>Nuestro equipo está disponible para acompañarte antes, durante y después de tu viaje.</p></div><div className="support-grid"><button onClick={()=>{setAssistantOpen(true);setToast("Podés escribirle a nuestro asistente virtual.");}}><MessageCircle/><b>Chat en vivo</b><small>Hablá con un asesor</small></button><button onClick={()=>setToast("Centro de ayuda de demostración.")}><CircleHelp/><b>Preguntas frecuentes</b><small>Encontrá respuestas rápidas</small></button><button onClick={()=>setToast("Soporte 24/7 activado en modo demostración.")}><ShieldCheck/><b>Asistencia al viajero</b><small>Estamos con vos en destino</small></button></div><div className="contact-box"><h2>Dejanos tu consulta</h2><div className="contact-phone"><span><Phone size={17}/></span><div><b>Atención telefónica</b><a href="tel:+543534123456">+54 353 412-3456</a><small>Número de ejemplo para la demostración</small></div></div><form onSubmit={e=>{e.preventDefault();if(contactName.trim().length<2||!contactEmail.trim()||!contactMessage.trim()){setToast("Completá todos los datos para enviar tu consulta.");return;}setToast("¡Tu consulta fue registrada correctamente!");setContactName("");setContactEmail("");setContactMessage("");}}><label>Tu nombre<input value={contactName} onChange={e=>setContactName(e.target.value)} required placeholder="Nombre y apellido"/></label><label>Correo electrónico<input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} required placeholder="tu@email.com"/></label><label>¿En qué podemos ayudarte?<textarea value={contactMessage} onChange={e=>setContactMessage(e.target.value)} required rows={4} placeholder="Escribí tu consulta..."/></label><button className="primary-btn">Enviar consulta <ArrowRight size={16}/></button></form></div></main>;

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
