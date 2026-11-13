import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowLeft, Plane, Globe2, Search, CalendarDays, Users, Tag,
  Heart, Star, ShieldCheck, Headphones, CreditCard, Menu, X, UserRound,
  ChevronDown, MapPin, Clock3, Check, CheckCircle2, Hotel, Stethoscope,
  Luggage, LockKeyhole, Mail, Eye, EyeOff, MessageCircle, Bell, SlidersHorizontal,
  Facebook, Instagram, Youtube, Linkedin, Ticket, LogOut, CircleHelp, Sparkles, Phone
} from "lucide-react";

type Page = "home" | "results" | "detail" | "login" | "register" | "checkout" | "account" | "support" | "employee-login" | "employee";
type Package = {
  id: number; name: string; country: string; category: string; price: number;
  oldPrice: number; rating: number; reviews: string; days: number; image: string;
  tag?: string; description: string;
};
const packages: Package[] = [
  { id: 1, name: "Cancún", country: "México", category: "Playas", price: 1299, oldPrice: 1799, rating: 4.8, reviews: "12.5k", days: 7, tag: "Más elegido", image: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=1000&q=85", description: "Playas de arena blanca, aguas turquesas y resorts All Inclusive para desconectar de todo." },
  { id: 2, name: "Salvador de Bahía", country: "Brasil", category: "Playas", price: 1099, oldPrice: 1599, rating: 4.7, reviews: "7.3k", days: 6, tag: "¡Oferta!", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=85", description: "Viví la energía de Brasil entre playas increíbles, gastronomía y cultura local." },
  { id: 3, name: "Copacabana", country: "Brasil", category: "Ciudades", price: 999, oldPrice: 1499, rating: 4.8, reviews: "6.8k", days: 5, tag: "¡Oferta!", image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1000&q=85", description: "Una escapada urbana con vistas inolvidables, playas icónicas y experiencias únicas." },
  { id: 4, name: "Roma", country: "Italia", category: "Cultura", price: 1479, oldPrice: 1899, rating: 4.9, reviews: "8.2k", days: 8, image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=85", description: "Historia, arquitectura y sabores italianos en una ciudad que nunca deja de sorprender." },
  { id: 5, name: "Nueva York", country: "Estados Unidos", category: "Ciudades", price: 1699, oldPrice: 1999, rating: 4.8, reviews: "11.1k", days: 6, image: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?auto=format&fit=crop&w=1000&q=85", description: "Descubrí la ciudad que nunca duerme, sus barrios, espectáculos y gastronomía." },
  { id: 6, name: "Punta Cana", country: "Rep. Dominicana", category: "Playas", price: 1399, oldPrice: 1799, rating: 4.7, reviews: "9.4k", days: 7, tag: "¡Oferta!", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=85", description: "Un paraíso caribeño con resorts frente al mar y servicio All Inclusive." }
];

const money = (n: number) => `USD ${n.toLocaleString("es-AR")}`;
const discount = (p: Package) => Math.round((1 - p.price / p.oldPrice) * 100);

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [employeePackages, setEmployeePackages] = useState<Package[]>(packages);
  const [employee, setEmployee] = useState("");
  const [employeeTab, setEmployeeTab] = useState<"overview" | "packages" | "messages" | "bookings">("overview");
  const [employeeMessage, setEmployeeMessage] = useState("");
  const [newPackageName, setNewPackageName] = useState("");
  const [newPackagePrice, setNewPackagePrice] = useState("");
  const [newPackageCountry, setNewPackageCountry] = useState("");
  const [selected, setSelected] = useState<Package>(packages[0]);
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");
  const [activeLocationField, setActiveLocationField] = useState<"origin" | "destination" | null>(null);
  const locationOptions = ["Buenos Aires, Argentina", "Córdoba, Argentina", "Villa María, Córdoba, Argentina", "Leones, Córdoba, Argentina", "Mendoza, Argentina", "Bariloche, Argentina", "Salta, Argentina", "Iguazú, Misiones, Argentina", "Montevideo, Uruguay", "Punta del Este, Uruguay", "Santiago, Chile", "Río de Janeiro, Brasil", "São Paulo, Brasil", "Salvador de Bahía, Brasil", "Florianópolis, Brasil", "Cancún, México", "Ciudad de México, México", "Punta Cana, República Dominicana", "Nueva York, Estados Unidos", "Miami, Estados Unidos", "Madrid, España", "Barcelona, España", "Roma, Italia", "París, Francia", "Londres, Reino Unido"];
  const [category, setCategory] = useState("Todos");
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const [date, setDate] = useState(todayISO);
  const [travelers, setTravelers] = useState(2);
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [user, setUser] = useState(localStorage.getItem("mgt-user") || "");
  const [profileEmail, setProfileEmail] = useState(localStorage.getItem("mgt-email") || "");
  const [profilePhone, setProfilePhone] = useState(localStorage.getItem("mgt-phone") || "");
  const [accountSection, setAccountSection] = useState<"bookings" | "profile" | "favorites" | "recent">("bookings");
  const [recentSearches, setRecentSearches] = useState<string[]>(JSON.parse(localStorage.getItem("mgt-recent-searches") || "[]"));
  const [bookings, setBookings] = useState<string[]>(JSON.parse(localStorage.getItem("mgt-bookings") || "[]"));
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    { from: "assistant" as const, text: "¡Hola! 👋 Soy el asistente virtual de MundoGlobal Travel. ¿Necesitás ayuda para organizar tu próximo viaje?" }
  ]);
  const [showPassword, setShowPassword] = useState(false);
  const [passengerName, setPassengerName] = useState(user);
  const [passengerEmail, setPassengerEmail] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [activeNav, setActiveNav] = useState("Inicio");
  const [isSearching, setIsSearching] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [animatingFavorite, setAnimatingFavorite] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [staffMessages, setStaffMessages] = useState([
    { id: 1, name: "María González", subject: "Consulta por paquete a Cancún", body: "Hola, ¿el paquete incluye equipaje para despachar?", status: "Pendiente" },
    { id: 2, name: "Lucas Fernández", subject: "Cambio de fecha", body: "Necesitaría saber si puedo modificar la fecha de salida de mi viaje.", status: "Pendiente" },
    { id: 3, name: "Sofía Martínez", subject: "Medios de pago", body: "¿Puedo abonar una parte con tarjeta y otra por transferencia?", status: "Respondido" }
  ]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const go = (p: Page) => { setPage(p); setMobileMenu(false); if (p !== "results") setActiveNav(p === "home" ? "Inicio" : p === "support" ? "Contacto" : ""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openPackage = (p: Package) => { setSelected(p); go("detail"); };
  const toggleFavorite = (id: number) => { setAnimatingFavorite(id); window.setTimeout(() => setAnimatingFavorite(current => current === id ? null : current), 480); setFavorites(v => { const next = v.includes(id) ? v.filter(x => x !== id) : [...v, id]; setToast(next.includes(id) ? "¡Paquete guardado en tus favoritos!" : "Paquete quitado de favoritos."); return next; }); };
  const submitSearch = () => { if (isSearching) return; setIsSearching(true); const term = [origin.trim(), query.trim()].filter(Boolean).join(" → ") || "Todos los destinos"; const next = [term, ...recentSearches.filter(x => x.toLowerCase() !== term.toLowerCase())].slice(0, 6); setRecentSearches(next); localStorage.setItem("mgt-recent-searches", JSON.stringify(next)); setSearchSubmitted(true); setActiveNav("Paquetes"); window.setTimeout(() => { setIsSearching(false); go("results"); }, 650); };
  const filtered = useMemo(() => employeePackages.filter(p =>
    (category === "Todos" || p.category === category) &&
    (`${p.name} ${p.country}`.toLowerCase().includes(query.toLowerCase()))
  ), [category, query, employeePackages]);
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
    go("account"); setToast("¡Reserva de prueba confirmada!");
  };

  const answerAssistant = (raw: string) => {
    const question = raw.trim();
    if (!question) return;
    const normalized = question.toLowerCase();
    let answer = "¡Claro! Puedo orientarte. Por ahora puedo ayudarte con información general sobre paquetes, vuelos, hoteles, pagos y reservas. Si necesitás resolver un caso particular, puedo conectarte con nuestro equipo de atención.";
    if (/hola|buenas|buenos días|buenas tardes/.test(normalized)) {
      answer = "¡Hola! 😊 Qué bueno tenerte por acá. Contame qué estás buscando y te ayudo a encontrar la mejor opción.";
    } else if (/paquete|destino|viaje|oferta|precio|cancún|roma|brasil|punta cana/.test(normalized)) {
      answer = "¡Tenemos varias opciones! 🌎 En nuestra sección Paquetes podés explorar destinos como Cancún, Salvador de Bahía, Copacabana, Roma, Nueva York y Punta Cana. Cada propuesta muestra duración, precio estimado y servicios incluidos. ¿Querés que te muestre los paquetes disponibles?";
    } else if (/vuelo|avión|equipaje|valija/.test(normalized)) {
      answer = "✈️ Los paquetes de demostración incluyen vuelos de ida y vuelta y equipaje de mano. El equipaje para despachar puede depender de la tarifa y la aerolínea; te recomendamos confirmarlo con un asesor antes de reservar.";
    } else if (/hotel|alojamiento|all inclusive|habitación/.test(normalized)) {
      answer = "🏨 Los paquetes publicados contemplan alojamiento en hoteles o resorts. Las propuestas All Inclusive incluyen comidas y bebidas según las condiciones del establecimiento. Podés abrir cada paquete para revisar sus detalles.";
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
  const Header = () => <header className="header">
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

  const Footer = () => <footer className="footer">
    <div className="footer-grid">
      <div><div className="brand brand-light"><img className="brand-logo brand-logo-light" src="/images/mundoglobal_travel.svg" alt="MundoGlobal Travel" /></div><p>Tu mundo, nuestro destino.<br/>Viajá más lejos, viví más experiencias.</p><div className="socials"><Facebook/><Instagram/><Youtube/><Linkedin/></div></div>
      <div><b>Explorá</b><button onClick={() => go("results")}>Paquetes</button><button onClick={() => go("results")}>Destinos</button><button onClick={() => go("results")}>Ofertas</button></div>
      <div><b>Ayuda</b><button onClick={() => go("support")}>Preguntas frecuentes</button><button onClick={() => go("support")}>Contacto</button><button onClick={() => go("support")}>Asistencia al viajero</button></div>
      <div><b>Medios de pago</b><div className="payment-tags"><span>VISA</span><span>mastercard</span><span>Transferencia</span></div><p className="secure-note"><ShieldCheck size={16}/> Compra segura y protegida</p><button className="footer-employee-link" onClick={() => go("employee-login")}>Acceso para empleados <ArrowRight size={13}/></button></div>
    </div>
    <div className="footer-bottom"><span>© 2026 MundoGlobal Travel. Todos los derechos reservados.</span><span>Turismo · Privacidad · Cookies</span></div>
  </footer>;

  const PackageCard = ({ p, featured = false }: {p: Package; featured?: boolean}) => <article className={`package-card ${featured ? "featured" : ""}`}>
    <div className="package-photo" style={{backgroundImage:`url(${p.image})`}}>
      {p.tag && <span className="offer-tag">{p.tag}</span>}
      <button type="button" className={`heart ${animatingFavorite === p.id ? "animate-heart" : ""} ${favorites.includes(p.id) ? "liked" : ""}`} onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(p.id); }} aria-label="Guardar favorito"><Heart size={18} fill={favorites.includes(p.id) ? "currentColor" : "none"}/></button>
    </div>
    <div className="package-info">
      <div className="package-heading"><div><h3>{p.name}</h3><p>{p.country} <span>·</span> {p.category}</p></div><span className="rating"><Star size={14} fill="currentColor"/> {p.rating}</span></div>
      <div className="package-meta"><span><Clock3 size={13}/> {p.days} días</span><span className="discount">Hasta {discount(p)}% OFF</span></div>
      <div className="price-line"><strong>{money(p.price)}</strong><del>{money(p.oldPrice)}</del></div>
      <button className="outline-btn full" onClick={() => openPackage(p)}>Ver paquete <ArrowRight size={16}/></button>
    </div>
  </article>;

  const SearchBar = () => {
    const renderLocationField = (field: "origin" | "destination") => {
      const value = field === "origin" ? origin : query;
      const setValue = field === "origin" ? setOrigin : setQuery;
      const matches = locationOptions.filter(place => place.toLowerCase().includes(value.trim().toLowerCase())).slice(0, 7);
      return <div className={`search-field location-field ${activeLocationField === field ? "location-focused" : ""}`}>
        <MapPin size={19}/>
        <span>
          <small>{field === "origin" ? "Origen" : "Destino"}</small>
          <input value={value} onChange={e => setValue(e.target.value)} onFocus={() => setActiveLocationField(field)} onBlur={() => window.setTimeout(() => setActiveLocationField(current => current === field ? null : current), 140)} placeholder={field === "origin" ? "¿Desde dónde salís?" : "¿A dónde querés ir?"} autoComplete="off" />
          {activeLocationField === field && value.trim().length > 0 && <div className="location-suggestions">
            {matches.length > 0 ? matches.map(place => <button type="button" key={place} onMouseDown={e => e.preventDefault()} onClick={() => { setValue(place); setActiveLocationField(null); }}>{place}</button>) : <p>No encontramos coincidencias. Probá con otra ciudad o país.</p>}
          </div>}
        </span>
      </div>;
    };
    return <div className="search-panel">
      {renderLocationField("origin")}
      {renderLocationField("destination")}
      <label className="search-field"><CalendarDays/><span><small>Fecha de salida</small><input type="date" value={date} min={todayISO} onChange={e => setDate(e.target.value)} aria-label="Fecha de salida"/></span></label>
      <label className="search-field"><Users/><span><small>Pasajeros</small><select value={travelers} onChange={e => setTravelers(Number(e.target.value))}><option value={1}>1 adulto</option><option value={2}>2 adultos</option><option value={3}>3 adultos</option><option value={4}>4 adultos</option></select></span></label>
      <button className={`primary-btn search-button ${isSearching ? "searching" : ""}`} onClick={submitSearch} disabled={isSearching}>{isSearching ? <><span className="search-spinner"/> Buscando...</> : <><Search size={17}/> Buscar</>}</button>
    </div>;
  };

  const Home = () => <><section className="hero-shell"><div className="hero">
    <div className="hero-copy"><span className="eyebrow"><Plane size={14}/> Tu próxima aventura, más cerca</span><h1>El mundo está<br/>esperando <em>por vos</em></h1><p>Descubrí, viajá y viví experiencias únicas en<br className="desktop-only"/> los destinos más increíbles del planeta.</p><div className="hero-buttons"><button className="yellow-btn" onClick={() => go("results")}>Explorar destinos <ArrowRight size={16}/></button><button className="ghost-btn" onClick={() => go("results")}>Ver ofertas</button></div></div>
    <div className="hero-plane"><Plane size={92}/></div>
    <div className="hero-caption"><Sparkles size={16}/> Experiencias que quedan para siempre</div>
  </div><SearchBar/></section>
  <section className="section destinations-section"><div className="section-heading"><div><span className="kicker">INSPIRATE PARA TU PRÓXIMO VIAJE</span><h2>Destinos que te van a enamorar</h2><p>Elegí tu próxima aventura entre los favoritos de nuestros viajeros.</p></div><button className="text-link" onClick={() => go("results")}>Ver todos los destinos <ArrowRight size={16}/></button></div>
    <div className="category-row">{["Todos","Playas","Ciudades","Aventuras","Cultura"].map(c=><button key={c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    <div className="destination-grid">{packages.slice(0,4).map(p=><button className="destination-card" key={p.id} onClick={()=>openPackage(p)}><img src={p.image}/><span className="destination-overlay"/><span className="destination-title">{p.name}<small>{p.country} · {p.category}</small></span><span className="destination-arrow"><ArrowRight size={18}/></span></button>)}</div>
  </section>
  <section className="benefit-strip"><div><span><Plane/></span><b>Turnos y pagos<small>100% online</small></b></div><div><span><ShieldCheck/></span><b>Compra segura<small>Tus datos protegidos</small></b></div><div><span><Headphones/></span><b>Atención al cliente<small>Soporte 24/7</small></b></div><div><span><CreditCard/></span><b>Múltiples medios<small>de pago</small></b></div></section>
  <section className="section offers-section"><div className="section-heading"><div><span className="kicker">OPORTUNIDADES PARA VIAJAR</span><h2>Ofertas que no te podés perder</h2><p>Paquetes integrales para disfrutar sin preocupaciones.</p></div><button className="text-link" onClick={()=>go("results")}>Ver todas las ofertas <ArrowRight size={16}/></button></div><div className="offer-grid">{packages.filter(p=>p.tag==="¡Oferta!").map(p=><PackageCard p={p} featured key={p.id}/>)}</div></section>
  <section className="trust-section"><div className="trust-card"><div className="stars">★★★★★</div><h3>Miles de viajeros ya confían en nosotros</h3><p>Calidad y experiencias únicas en todo el mundo.</p><b>+50.000 viajeros</b></div><div className="trust-card"><div className="stars">★★★★★</div><h3>Los mejores precios del mercado</h3><p>Encontrá las mejores ofertas y ahorrá más.</p><b><ShieldCheck size={17}/> Compra segura</b></div><div className="trust-card"><div className="stars">★★★★★</div><h3>Atención personalizada</h3><p>Estamos para ayudarte en todo momento.</p><b><MessageCircle size={17}/> Chat 24/7</b></div></section>
  <section className="newsletter"><div className="newsletter-icon"><Mail/></div><div><h3>¿Buscás más ayuda?</h3><p>Suscribite y recibí las mejores ofertas en tu email.</p></div><form onSubmit={e=>{e.preventDefault();setToast("¡Gracias por suscribirte!");}}><input type="email" required placeholder="Tu email aquí..."/><button className="yellow-btn">Suscribirme <ArrowRight size={15}/></button></form></section>
  </>;

  const Results = () => <main className="page-container"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span> Paquetes</div><div className="page-title-row"><div><span className="kicker">ENCONTRÁ TU PRÓXIMA AVENTURA</span><h1>Paquetes de viaje</h1><p>Experiencias completas, pensadas para que solo te ocupes de disfrutar.</p></div><span className="results-count">{filtered.length} experiencias</span></div><div className="results-search"><SearchBar/></div><div className="results-layout"><aside className="filters"><h3><SlidersHorizontal size={18}/> Filtrar resultados</h3><b>Tipo de viaje</b>{["Todos","Playas","Ciudades","Cultura","Aventuras"].map(c=><button key={c} className={category===c?"filter-active":""} onClick={()=>setCategory(c)}>{c}<span>{c==="Todos"?packages.length:packages.filter(p=>p.category===c).length}</span></button>)}<div className="filter-divider"/><b>Precio por persona</b><p className="filter-hint">Los precios se muestran en USD.</p><div className="filter-price">USD 999 — USD 1.699</div><div className="filter-divider"/><b>Incluye</b><label className="check-label"><input type="checkbox" defaultChecked/> Vuelo</label><label className="check-label"><input type="checkbox" defaultChecked/> Hotel All Inclusive</label><label className="check-label"><input type="checkbox" defaultChecked/> Asistencia al viajero</label></aside><div className="results-content"><div className="sort-row"><span>{filtered.length} paquetes encontrados</span><select aria-label="Ordenar paquetes" value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="recommended">Recomendados</option><option value="price">Menor precio</option><option value="rating">Mejor calificación</option></select></div><div className="results-grid">{sortedPackages.map(p=><PackageCard p={p} key={p.id}/>)}</div>{filtered.length===0&&<div className="empty-state"><Search size={34}/><h3>No encontramos resultados</h3><p>Probá con otro destino o categoría.</p><button className="primary-btn" onClick={()=>{setQuery("");setCategory("Todos");}}>Limpiar filtros</button></div>}</div></div></main>;

  const Detail = () => <main className="page-container"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span><button onClick={()=>go("results")}>Paquetes</button><span>/</span>{selected.name}</div><div className="detail-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(3,24,67,.82),rgba(3,24,67,.08)),url(${selected.image})`}}><div><span className="eyebrow"><MapPin size={14}/> {selected.country} · {selected.category}</span><h1>{selected.name}</h1><p>{selected.description}</p><span className="detail-rating"><Star size={16} fill="currentColor"/> {selected.rating} ({selected.reviews} opiniones)</span></div></div><div className="detail-layout"><div className="detail-main"><h2>Tu viaje, todo resuelto</h2><p className="muted">Un paquete integral con los servicios esenciales para viajar tranquilo.</p><div className="included-grid"><div><span><Plane/></span><b>Vuelos incluidos</b><p>Ida y vuelta en aerolínea comercial. Equipaje de mano incluido.</p></div><div><span><Hotel/></span><b>Hotel All Inclusive</b><p>{selected.days - 1} noches de alojamiento con comidas y bebidas incluidas.</p></div><div><span><Stethoscope/></span><b>Asistencia al viajero</b><p>Cobertura médica, traslados y asistencia ante contingencias.</p></div></div><h2>Tu experiencia incluye</h2><ul className="included-list"><li><CheckCircle2/> Vuelos de ida y vuelta</li><li><CheckCircle2/> Traslados aeropuerto – hotel – aeropuerto</li><li><CheckCircle2/> Alojamiento en resort seleccionado</li><li><CheckCircle2/> Asistencia al viajero durante toda la estadía</li><li><CheckCircle2/> Soporte digital 24/7</li></ul><div className="notice"><ShieldCheck/><span><b>Viajá con tranquilidad</b><small>Todos nuestros paquetes cuentan con asistencia y soporte durante el viaje.</small></span></div></div><aside className="booking-card"><span className="discount">Hasta {discount(selected)}% OFF</span><div className="price-line"><strong>{money(selected.price)}</strong><del>{money(selected.oldPrice)}</del></div><small>por persona · impuestos incluidos</small><div className="booking-divider"/><label>Fecha de salida<input type="date" value={date} min={todayISO} onChange={e=>setDate(e.target.value)}/></label><label>Pasajeros<select value={travelers} onChange={e=>setTravelers(Number(e.target.value))}><option value={1}>1 adulto</option><option value={2}>2 adultos</option><option value={3}>3 adultos</option><option value={4}>4 adultos</option></select></label><div className="booking-total"><span>Total estimado</span><b>{money(selected.price*travelers)}</b></div><button className="primary-btn full" onClick={()=>go(user?"checkout":"login")}>Reservar paquete <ArrowRight size={17}/></button><p className="booking-safe"><LockKeyhole size={14}/> Reserva segura · Sin cargos ocultos</p></aside></div></main>;

  const Login = ({register=false}:{register?:boolean}) => <main className="auth-page"><div className="auth-promo"><div className="auth-promo-content"><span className="eyebrow"><Plane size={14}/> MundoGlobal Travel</span><h1>{register?"Tu próxima aventura empieza acá":"Tu próxima aventura empieza acá"}</h1><p>Entrá a tu cuenta para ver tus reservas, guardar favoritos y acceder a ofertas exclusivas.</p><ul><li><Check/> Reservá en hasta 12 cuotas sin interés</li><li><Check/> Ofertas exclusivas para socios</li><li><Check/> Soporte 24/7 en tu idioma</li></ul><div className="promo-globe"><Globe2 size={220}/></div></div></div><div className="auth-form-side"><div className="auth-form"><div className="auth-avatar"><UserRound/></div><h1>{register?"Crear cuenta":"Iniciá sesión"}</h1><p>{register?"Registrate y empezá a planificar tu próximo viaje.":"Bienvenido de nuevo. Ingresá tus datos para continuar."}</p><form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);login(String(fd.get("email")),String(fd.get("name") || ""));}}>{register&&<><label>Nombre completo<input name="name" required placeholder="Tu nombre"/></label></>}<label>Correo electrónico<div className="input-icon"><Mail/><input name="email" type="email" required placeholder="tu@email.com"/></div></label><label>Contraseña<div className="input-icon"><LockKeyhole/><input name="password" type={showPassword?"text":"password"} required minLength={4} placeholder="Ingresá tu contraseña"/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff/>:<Eye/>}</button></div></label>{!register&&<div className="auth-options"><label className="remember"><input type="checkbox" defaultChecked/> Recordarme</label><button type="button" className="text-link" onClick={()=>setToast("Función de recuperación simulada para la demostración.")}>¿Olvidaste tu contraseña?</button></div>}<button className="primary-btn full auth-submit">{register?"Crear mi cuenta":"Iniciar sesión"} <ArrowRight size={17}/></button></form><div className="auth-switch">{register?"¿Ya tenés cuenta?":"¿No tenés cuenta?"} <button onClick={()=>go(register?"login":"register")}>{register?"Iniciá sesión":"Registrate"}</button></div><div className="secure-box"><ShieldCheck/><span><b>Conexión segura</b><small>Tus datos de demostración se guardan localmente.</small></span></div></div></div></main>;

  const EmployeeLogin = () => <main className="auth-page employee-auth"><div className="auth-promo"><div className="auth-promo-content"><span className="eyebrow"><LockKeyhole size={14}/> Portal interno</span><h1>Gestioná cada viaje desde un solo lugar.</h1><p>Un espacio de trabajo para el equipo de MundoGlobal Travel: paquetes, consultas y reservas.</p><ul><li><Check/> Administración de paquetes</li><li><Check/> Atención de consultas</li><li><Check/> Seguimiento de reservas</li></ul><div className="promo-globe"><Globe2 size={220}/></div></div></div><div className="auth-form-side"><div className="auth-form"><div className="auth-avatar"><LockKeyhole/></div><span className="kicker">ACCESO DEL PERSONAL</span><h1>Portal de empleados</h1><p>Ingresá con tus credenciales internas para continuar.</p><form onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);employeeLogin(String(fd.get("email")),String(fd.get("password")));}}><label>Correo corporativo<div className="input-icon"><Mail/><input name="email" type="email" required placeholder="empleado@mundoglobal.com"/></div></label><label>Contraseña<div className="input-icon"><LockKeyhole/><input name="password" type="password" required placeholder="Contraseña"/></div></label><button className="primary-btn full auth-submit">Ingresar al panel <ArrowRight size={17}/></button></form><div className="demo-warning employee-demo"><CircleHelp/> Acceso de prueba: empleado@mundoglobal.com · MundoGlobal2026</div><div className="auth-switch"><button onClick={()=>go("home")}>Volver al sitio público</button></div></div></div></main>;

  const EmployeePanel = () => <main className="page-container employee-page"><div className="employee-top"><div><span className="kicker">MUNDO GLOBAL TRAVEL · OPERACIONES</span><h1>Panel de gestión</h1><p>Hola, {employee}. Este es el resumen de actividad de la agencia.</p></div><button className="outline-btn" onClick={()=>{setEmployee("");go("home");}}><LogOut size={16}/> Cerrar sesión</button></div><div className="employee-layout"><aside className="employee-sidebar"><b>Espacio de trabajo</b><button className={employeeTab==="overview"?"current":""} onClick={()=>setEmployeeTab("overview")}><SlidersHorizontal/> Resumen</button><button className={employeeTab==="packages"?"current":""} onClick={()=>setEmployeeTab("packages")}><Globe2/> Paquetes</button><button className={employeeTab==="messages"?"current":""} onClick={()=>setEmployeeTab("messages")}><MessageCircle/> Mensajes <span className="nav-counter">{staffMessages.filter(m=>m.status==="Pendiente").length}</span></button><button className={employeeTab==="bookings"?"current":""} onClick={()=>setEmployeeTab("bookings")}><Ticket/> Reservas</button><div className="employee-api"><span className="api-dot"/><div><b>Servicios externos</b><small>Modo simulación · APIs no conectadas</small></div></div></aside><section className="employee-workspace">{employeeTab==="overview"&&<><div className="employee-section-title"><div><h2>Resumen general</h2><p>Indicadores de ejemplo para la operación diaria.</p></div><span className="demo-label">DATOS DE DEMOSTRACIÓN</span></div><div className="employee-stats"><article><span>Paquetes publicados</span><b>{employeePackages.length}</b><small><Globe2/> Catálogo disponible</small></article><article><span>Consultas pendientes</span><b>{staffMessages.filter(m=>m.status==="Pendiente").length}</b><small><MessageCircle/> Atención al cliente</small></article><article><span>Reservas de prueba</span><b>{bookings.length+18}</b><small><Ticket/> Operaciones registradas</small></article></div><div className="employee-task-card"><div><span className="kicker">TAREAS DEL EQUIPO</span><h3>Tu operación, organizada</h3><p>Actualizá el catálogo, respondé consultas y revisá el estado de las reservas desde los módulos del panel.</p></div><button className="primary-btn" onClick={()=>setEmployeeTab("messages")}>Ver consultas pendientes <ArrowRight size={15}/></button></div><h3 className="employee-subtitle">Actividad reciente</h3><div className="employee-activity"><span><CheckCircle2/> Catálogo sincronizado en modo local</span><small>Hoy · 09:30</small></div><div className="employee-activity"><span><MessageCircle/> Nueva consulta sobre equipaje</span><small>Hoy · 10:15</small></div><div className="employee-activity"><span><Ticket/> Reserva de demostración recibida</span><small>Ayer · 16:40</small></div></>}{employeeTab==="packages"&&<><div className="employee-section-title"><div><h2>Gestión de paquetes</h2><p>Administrá los productos turísticos que se muestran en el sitio.</p></div><span className="demo-label">CAMBIOS LOCALES</span></div><form className="employee-add-form" onSubmit={e=>{e.preventDefault();const price=Number(newPackagePrice);if(newPackageName.trim().length<2||newPackageCountry.trim().length<2||!Number.isFinite(price)||price<=0){setToast("Completá destino, país y un precio válido.");return;}const item:Package={id:Date.now(),name:newPackageName.trim(),country:newPackageCountry.trim(),category:"Ciudades",price,oldPrice:Math.round(price*1.2),rating:4.7,reviews:"0",days:7,image:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=85",description:"Nuevo paquete cargado por el equipo de la agencia."};setEmployeePackages(v=>[item,...v]);setNewPackageName("");setNewPackageCountry("");setNewPackagePrice("");setToast("Paquete agregado al catálogo de demostración.");}}><input value={newPackageName} onChange={e=>setNewPackageName(e.target.value)} placeholder="Nombre del destino" required/><input value={newPackageCountry} onChange={e=>setNewPackageCountry(e.target.value)} placeholder="País" required/><input type="number" min="1" value={newPackagePrice} onChange={e=>setNewPackagePrice(e.target.value)} placeholder="Precio USD" required/><button className="primary-btn">Agregar paquete <ArrowRight size={15}/></button></form><div className="employee-package-list">{employeePackages.map(p=><article key={p.id}><img src={p.image} alt=""/><div><b>{p.name}</b><small>{p.country} · {p.days} días</small></div><strong>{money(p.price)}</strong><button className="employee-delete" onClick={()=>{setEmployeePackages(v=>v.filter(x=>x.id!==p.id));setToast("Paquete quitado del catálogo local.");}} aria-label={"Eliminar "+p.name}><X size={17}/></button></article>)}</div></>}{employeeTab==="messages"&&<><div className="employee-section-title"><div><h2>Bandeja de consultas</h2><p>Atendé las consultas que llegan desde los canales digitales.</p></div><span className="demo-label">3 CONVERSACIONES</span></div><div className="employee-message-list">{staffMessages.map(m=><article key={m.id}><div className="employee-message-head"><div><b>{m.name}</b><small>{m.subject}</small></div><span className={m.status==="Pendiente"?"message-pending":"message-done"}>{m.status}</span></div><p>{m.body}</p><textarea value={employeeMessage} onChange={e=>setEmployeeMessage(e.target.value)} placeholder="Escribí una respuesta para el cliente..." rows={2}/><button className="primary-btn" disabled={!employeeMessage.trim()} onClick={()=>{setStaffMessages(v=>v.map(x=>x.id===m.id?{...x,status:"Respondido"}:x));setEmployeeMessage("");setToast("Respuesta registrada en la simulación.");}}>Registrar respuesta <ArrowRight size={14}/></button></article>)}</div></>}{employeeTab==="bookings"&&<><div className="employee-section-title"><div><h2>Gestión de reservas</h2><p>Consultá operaciones y su estado para coordinar la atención.</p></div><span className="demo-label">DATOS DE PRUEBA</span></div><div className="employee-booking-list">{["MG-20481 · Cancún · Confirmada","MG-20480 · Roma · Pendiente de pago","MG-20479 · Punta Cana · En preparación",...bookings.map(x=>"MG-DEMO · "+x)].map((b,i)=><article key={i}><span className="booking-icon"><Ticket/></span><div><b>{b.split(" · ")[1]}</b><small>{b.split(" · ")[0]} · Operación de demostración</small></div><span className="status-pill">{b.split(" · ")[2]||"Registrada"}</span></article>)}</div></>}</section></div><p className="employee-disclaimer"><ShieldCheck size={15}/> Prototipo académico: las altas, respuestas y operaciones se almacenan localmente. En producción se integrarían APIs de proveedores, CRM, reservas y mensajería.</p></main>;

  const Checkout = () => <main className="page-container narrow"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span><button onClick={()=>go("detail")}>Paquete</button><span>/</span>Confirmar reserva</div><div className="checkout-title"><span className="kicker">ÚLTIMO PASO</span><h1>Confirmá tu viaje</h1><p>Revisá los detalles antes de confirmar tu reserva de prueba.</p></div><div className="checkout-layout"><div className="checkout-box"><h2>Resumen del paquete</h2><div className="checkout-destination"><img src={selected.image}/><div><b>{selected.name} · {selected.country}</b><small>{selected.days} días · {travelers} pasajero(s)</small><small>Salida estimada: {date}</small></div></div><div className="checkout-service"><Plane/> Vuelos ida y vuelta <span>Incluido</span></div><div className="checkout-service"><Hotel/> Hotel All Inclusive <span>Incluido</span></div><div className="checkout-service"><Stethoscope/> Asistencia al viajero <span>Incluido</span></div><div className="booking-divider"/><h2>Datos del pasajero principal</h2><label>Nombre y apellido<input value={passengerName} onChange={e=>setPassengerName(e.target.value)} autoComplete="name" placeholder="Nombre completo" maxLength={80}/></label><label>Correo electrónico<input type="email" value={passengerEmail} onChange={e=>setPassengerEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" maxLength={120}/></label><p className="form-hint">Usaremos estos datos para identificar la reserva y enviar la confirmación.</p><div className="booking-divider"/><h2>Elegí tu medio de pago</h2><p className="form-hint">Seleccioná cómo preferís abonar. En esta demo no se realizará ningún cobro.</p><div className="payment-method-grid"><button type="button" className={`payment-method ${paymentMethod === "Tarjeta de crédito" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Tarjeta de crédito")}><span className="payment-visual card-visa">VISA</span><b>Tarjeta de crédito</b><small>Crédito y cuotas</small></button><button type="button" className={`payment-method ${paymentMethod === "Tarjeta de débito" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Tarjeta de débito")}><span className="payment-visual card-master"><i></i><i></i></span><b>Tarjeta de débito</b><small>Pago con débito</small></button><button type="button" className={`payment-method ${paymentMethod === "Mercado Pago" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Mercado Pago")}><span className="payment-visual mercado-logo"> Mercado Pago </span><b>Mercado Pago</b><small>Billetera virtual</small></button><button type="button" className={`payment-method ${paymentMethod === "Transferencia bancaria" ? "chosen" : ""}`} onClick={() => setPaymentMethod("Transferencia bancaria")}><span className="payment-visual transfer-visual"><CreditCard size={25}/></span><b>Transferencia</b><small>Desde tu banco</small></button></div><div className="demo-warning"><CircleHelp/> Esta es una simulación académica. No se realizará ningún cobro ni reserva real.</div></div><aside className="booking-card"><h3>Detalle de precio</h3><div className="summary-row"><span>Paquete por persona</span><b>{money(selected.price)}</b></div><div className="summary-row"><span>Pasajeros</span><b>× {travelers}</b></div><div className="summary-row"><span>Impuestos</span><b>Incluidos</b></div><div className="booking-divider"/><div className="booking-total"><span>Total</span><b>{money(selected.price*travelers)}</b></div><button className="primary-btn full" onClick={reserve}>Confirmar reserva <Check size={17}/></button><p className="booking-safe"><LockKeyhole size={14}/> Proceso de demostración</p></aside></div></main>;

  const Account = () => <main className="page-container"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span>Mi cuenta</div><div className="account-heading"><div className="user-avatar"><UserRound/></div><div><span className="kicker">MI ESPACIO MUNDO GLOBAL</span><h1>¡Hola, {user || "Viajero"}!</h1><p>Gestioná tus viajes y preparate para tu próxima aventura.</p></div><button className="outline-btn" onClick={()=>{setUser("");localStorage.removeItem("mgt-user");go("home");}}> <LogOut size={16}/> Cerrar sesión</button></div><div className="account-grid"><aside className="account-menu"><button className={accountSection==="bookings"?"current":""} onClick={()=>setAccountSection("bookings")}><Ticket/> Mis reservas</button><button className={accountSection==="profile"?"current":""} onClick={()=>setAccountSection("profile")}><UserRound/> Mi perfil</button><button className={accountSection==="favorites"?"current":""} onClick={()=>setAccountSection("favorites")}><Heart/> Mis favoritos</button><button className={accountSection==="recent"?"current":""} onClick={()=>setAccountSection("recent")}><Clock3/> Búsquedas recientes</button><button onClick={()=>go("support")}><Headphones/> Ayuda y soporte</button></aside><section className="account-content">
    {accountSection==="bookings"&&<><div className="section-heading compact"><div><h2>Mis reservas</h2><p>Consultá el estado de tus próximos viajes.</p></div><button className="primary-btn" onClick={()=>go("results")}>Buscar viajes <ArrowRight size={16}/></button></div>{bookings.length===0?<div className="empty-state"><Luggage size={42}/><h3>Todavía no tenés viajes reservados</h3><p>Tu próxima aventura está a un clic de distancia.</p><button className="primary-btn" onClick={()=>go("results")}>Explorar paquetes</button></div>:bookings.map((b,i)=><div className="booking-list-item" key={i}><span className="booking-icon"><Plane/></span><div><b>{b.split(" · ")[0]}</b><small>Código: {b.split(" · ")[1]} · Reserva de demostración</small></div><strong>{b.split(" · ")[2]}</strong><span className="status-pill"><CheckCircle2 size={13}/> Confirmada</span></div>)}</>}
    {accountSection==="profile"&&<><div className="section-heading compact"><div><h2>Mi perfil</h2><p>Actualizá tus datos personales de contacto.</p></div></div><form className="profile-edit-form" onSubmit={e=>{e.preventDefault();const name=passengerName.trim();if(name.length<3){setToast("Ingresá tu nombre y apellido.");return;}setUser(name);localStorage.setItem("mgt-user",name);localStorage.setItem("mgt-email",profileEmail);localStorage.setItem("mgt-phone",profilePhone);setToast("¡Tu perfil fue actualizado!");}}><label>Nombre y apellido<input value={passengerName} onChange={e=>setPassengerName(e.target.value)} required minLength={3} maxLength={80}/></label><label>Correo electrónico<input type="email" value={profileEmail} onChange={e=>setProfileEmail(e.target.value)} placeholder="tu@email.com" required/></label><label>Teléfono<input value={profilePhone} onChange={e=>setProfilePhone(e.target.value)} placeholder="+54 9 353 ..." /></label><button className="primary-btn">Guardar cambios <Check size={16}/></button></form></>}
    {accountSection==="favorites"&&<><div className="section-heading compact"><div><h2>Mis favoritos</h2><p>Los destinos que guardaste para más adelante.</p></div></div><div className="account-favorites-grid">{employeePackages.filter(p=>favorites.includes(p.id)).map(p=><PackageCard key={p.id} p={p}/>)}</div>{favorites.length===0&&<div className="empty-state"><Heart size={38}/><h3>Todavía no guardaste favoritos</h3><p>Usá el corazón de cada paquete para guardarlo.</p><button className="primary-btn" onClick={()=>go("results")}>Explorar paquetes</button></div>}</>}
    {accountSection==="recent"&&<><div className="section-heading compact"><div><h2>Búsquedas recientes</h2><p>Retomá rápidamente los destinos que estuviste explorando.</p></div></div>{recentSearches.length===0?<div className="empty-state"><Search size={38}/><h3>Aún no tenés búsquedas recientes</h3><p>Cuando busques destinos, aparecerán acá.</p></div>:<div className="recent-search-list">{recentSearches.map((term,i)=><button key={i} onClick={()=>{setQuery(term==="Todos los destinos"?"":term);go("results");}}><span><Search size={16}/>{term}</span><ArrowRight size={16}/></button>)}</div>}</>}
  </section></div></main>;

  const Support = () => <main className="page-container narrow"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span>Ayuda y asistencia</div><div className="support-hero"><span className="support-icon"><Headphones/></span><span className="kicker">ESTAMOS PARA ACOMPAÑARTE</span><h1>¿En qué podemos ayudarte?</h1><p>Nuestro equipo está disponible para acompañarte antes, durante y después de tu viaje.</p></div><div className="support-grid"><button onClick={()=>{setAssistantOpen(true);setToast("Podés escribirle a nuestro asistente virtual.");}}><MessageCircle/><b>Chat en vivo</b><small>Hablá con un asesor</small></button><button onClick={()=>setToast("Centro de ayuda de demostración.")}><CircleHelp/><b>Preguntas frecuentes</b><small>Encontrá respuestas rápidas</small></button><button onClick={()=>setToast("Soporte 24/7 activado en modo demostración.")}><ShieldCheck/><b>Asistencia al viajero</b><small>Estamos con vos en destino</small></button></div><div className="contact-box"><h2>Dejanos tu consulta</h2><div className="contact-phone"><span><Phone size={17}/></span><div><b>Atención telefónica</b><a href="tel:+543534123456">+54 353 412-3456</a><small>Número de ejemplo para la demostración</small></div></div><form onSubmit={e=>{e.preventDefault();setToast("¡Tu consulta fue registrada correctamente!");(e.currentTarget as HTMLFormElement).reset();}}><label>Tu nombre<input required placeholder="Nombre y apellido"/></label><label>Correo electrónico<input type="email" required placeholder="tu@email.com"/></label><label>¿En qué podemos ayudarte?<textarea required rows={4} placeholder="Escribí tu consulta..."/></label><button className="primary-btn">Enviar consulta <ArrowRight size={16}/></button></form></div></main>;

  return <><Header/>{page==="home"&&<Home/>}{page==="results"&&<Results/>}{page==="detail"&&<Detail/>}{page==="login"&&<Login/>}{page==="register"&&<Login register/>}{page==="checkout"&&<Checkout/>}{page==="account"&&<Account/>}{page==="support"&&<Support/>}{page==="employee-login"&&<EmployeeLogin/>}{page==="employee"&&<EmployeePanel/>}<Footer/><div className="assistant-widget">
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
