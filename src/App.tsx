import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowLeft, Plane, Globe2, Search, CalendarDays, Users, Tag,
  Heart, Star, ShieldCheck, Headphones, CreditCard, Menu, X, UserRound,
  ChevronDown, MapPin, Clock3, Check, CheckCircle2, Hotel, Stethoscope,
  Luggage, LockKeyhole, Mail, Eye, EyeOff, MessageCircle, Bell, SlidersHorizontal,
  Facebook, Instagram, Youtube, Linkedin, Ticket, LogOut, CircleHelp, Sparkles
} from "lucide-react";

type Page = "home" | "results" | "detail" | "login" | "register" | "checkout" | "account" | "support";
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
  const [selected, setSelected] = useState<Package>(packages[0]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const [date, setDate] = useState(todayISO);
  const [travelers, setTravelers] = useState(2);
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [user, setUser] = useState(localStorage.getItem("mgt-user") || "");
  const [bookings, setBookings] = useState<string[]>(JSON.parse(localStorage.getItem("mgt-bookings") || "[]"));
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passengerName, setPassengerName] = useState(user);
  const [passengerEmail, setPassengerEmail] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const go = (p: Page) => { setPage(p); setMobileMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openPackage = (p: Package) => { setSelected(p); go("detail"); };
  const toggleFavorite = (id: number) => setFavorites(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  const filtered = useMemo(() => packages.filter(p =>
    (category === "Todos" || p.category === category) &&
    (`${p.name} ${p.country}`.toLowerCase().includes(query.toLowerCase()))
  ), [category, query]);
  const sortedPackages = useMemo(() => [...filtered].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return Number(Boolean(b.tag)) - Number(Boolean(a.tag));
  }), [filtered, sortBy]);

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
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(cleanEmail)) {
      setToast("Ingresá un correo electrónico válido para continuar.");
      return;
    }
    const id = `MGT-${Math.floor(100000 + Math.random() * 900000)}`;
    const next = [...bookings, `${selected.name} · ${id} · ${money(selected.price * travelers)}`];
    setBookings(next); localStorage.setItem("mgt-bookings", JSON.stringify(next));
    go("account"); setToast("¡Reserva de prueba confirmada!");
  };

  const Header = () => <header className="header">
    <div className="nav-wrap">
      <button className="brand" onClick={() => go("home")} aria-label="Ir al inicio">
        <img className="brand-logo" src="/images/mundoglobal_travel.svg" alt="MundoGlobal Travel" />
      </button>
      <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
        <button className={page === "home" ? "active" : ""} onClick={() => go("home")}>Inicio</button>
        <button onClick={() => { setCategory("Todos"); go("results"); }}>Paquetes</button>
        <button onClick={() => { setCategory("Ciudades"); go("results"); }}>Destinos</button>
        <button onClick={() => { setCategory("Todos"); go("results"); }}>Ofertas</button>
        <button onClick={() => go("support")}>Contacto</button>
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
      <div><b>Medios de pago</b><div className="payment-tags"><span>VISA</span><span>mastercard</span><span>Transferencia</span></div><p className="secure-note"><ShieldCheck size={16}/> Compra segura y protegida</p></div>
    </div>
    <div className="footer-bottom"><span>© 2026 MundoGlobal Travel. Todos los derechos reservados.</span><span>Turismo · Privacidad · Cookies</span></div>
  </footer>;

  const PackageCard = ({ p, featured = false }: {p: Package; featured?: boolean}) => <article className={`package-card ${featured ? "featured" : ""}`}>
    <div className="package-photo" style={{backgroundImage:`url(${p.image})`}}>
      {p.tag && <span className="offer-tag">{p.tag}</span>}
      <button className={`heart ${favorites.includes(p.id) ? "liked" : ""}`} onClick={() => toggleFavorite(p.id)} aria-label="Guardar favorito"><Heart size={18} fill={favorites.includes(p.id) ? "currentColor" : "none"}/></button>
    </div>
    <div className="package-info">
      <div className="package-heading"><div><h3>{p.name}</h3><p>{p.country} <span>·</span> {p.category}</p></div><span className="rating"><Star size={14} fill="currentColor"/> {p.rating}</span></div>
      <div className="package-meta"><span><Clock3 size={13}/> {p.days} días</span><span className="discount">Hasta {discount(p)}% OFF</span></div>
      <div className="price-line"><strong>{money(p.price)}</strong><del>{money(p.oldPrice)}</del></div>
      <button className="outline-btn full" onClick={() => openPackage(p)}>Ver paquete <ArrowRight size={16}/></button>
    </div>
  </article>;

  const SearchBar = () => <div className="search-panel">
    <label className="search-field"><Search/><span><small>Destino</small><input value={query} onChange={e => setQuery(e.target.value)} placeholder="¿A dónde querés ir?"/></span></label>
    <label className="search-field"><CalendarDays/><span><small>Fecha de salida</small><input type="date" value={date} min={todayISO} onChange={e => setDate(e.target.value)} aria-label="Fecha de salida"/></span></label>
    <label className="search-field"><Users/><span><small>Pasajeros</small><select value={travelers} onChange={e => setTravelers(Number(e.target.value))}><option value={1}>1 adulto</option><option value={2}>2 adultos</option><option value={3}>3 adultos</option><option value={4}>4 adultos</option></select></span></label>
    <button className="primary-btn search-button" onClick={() => {setSearchSubmitted(true); go("results");}}><Search size={17}/> Buscar</button>
  </div>;

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

  const Checkout = () => <main className="page-container narrow"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span><button onClick={()=>go("detail")}>Paquete</button><span>/</span>Confirmar reserva</div><div className="checkout-title"><span className="kicker">ÚLTIMO PASO</span><h1>Confirmá tu viaje</h1><p>Revisá los detalles antes de confirmar tu reserva de prueba.</p></div><div className="checkout-layout"><div className="checkout-box"><h2>Resumen del paquete</h2><div className="checkout-destination"><img src={selected.image}/><div><b>{selected.name} · {selected.country}</b><small>{selected.days} días · {travelers} pasajero(s)</small><small>Salida estimada: {date}</small></div></div><div className="checkout-service"><Plane/> Vuelos ida y vuelta <span>Incluido</span></div><div className="checkout-service"><Hotel/> Hotel All Inclusive <span>Incluido</span></div><div className="checkout-service"><Stethoscope/> Asistencia al viajero <span>Incluido</span></div><div className="booking-divider"/><h2>Datos del pasajero principal</h2><label>Nombre y apellido<input value={passengerName} onChange={e=>setPassengerName(e.target.value)} autoComplete="name" placeholder="Nombre completo" maxLength={80}/></label><label>Correo electrónico<input type="email" value={passengerEmail} onChange={e=>setPassengerEmail(e.target.value)} autoComplete="email" placeholder="tu@email.com" maxLength={120}/></label><p className="form-hint">Usaremos estos datos para identificar la reserva y enviar la confirmación.</p><div className="demo-warning"><CircleHelp/> Esta es una simulación académica. No se realizará ningún cobro ni reserva real.</div></div><aside className="booking-card"><h3>Detalle de precio</h3><div className="summary-row"><span>Paquete por persona</span><b>{money(selected.price)}</b></div><div className="summary-row"><span>Pasajeros</span><b>× {travelers}</b></div><div className="summary-row"><span>Impuestos</span><b>Incluidos</b></div><div className="booking-divider"/><div className="booking-total"><span>Total</span><b>{money(selected.price*travelers)}</b></div><button className="primary-btn full" onClick={reserve}>Confirmar reserva <Check size={17}/></button><p className="booking-safe"><LockKeyhole size={14}/> Proceso de demostración</p></aside></div></main>;

  const Account = () => <main className="page-container"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span>Mi cuenta</div><div className="account-heading"><div className="user-avatar"><UserRound/></div><div><span className="kicker">MI ESPACIO MUNDO GLOBAL</span><h1>¡Hola, {user || "Viajero"}!</h1><p>Gestioná tus viajes y preparate para tu próxima aventura.</p></div><button className="outline-btn" onClick={()=>{setUser("");localStorage.removeItem("mgt-user");go("home");}}> <LogOut size={16}/> Cerrar sesión</button></div><div className="account-grid"><aside className="account-menu"><button className="current"><Ticket/> Mis reservas</button><button onClick={()=>setToast("Tu perfil está actualizado.")}><UserRound/> Mi perfil</button><button onClick={()=>{go("results");setQuery("");}}><Heart/> Mis favoritos</button><button onClick={()=>go("support")}><Headphones/> Ayuda y soporte</button></aside><section className="account-content"><div className="section-heading compact"><div><h2>Mis reservas</h2><p>Consultá el estado de tus próximos viajes.</p></div><button className="primary-btn" onClick={()=>go("results")}>Buscar viajes <ArrowRight size={16}/></button></div>{bookings.length===0?<div className="empty-state"><Luggage size={42}/><h3>Todavía no tenés viajes reservados</h3><p>Tu próxima aventura está a un clic de distancia.</p><button className="primary-btn" onClick={()=>go("results")}>Explorar paquetes</button></div>:bookings.map((b,i)=><div className="booking-list-item" key={i}><span className="booking-icon"><Plane/></span><div><b>{b.split(" · ")[0]}</b><small>Código: {b.split(" · ")[1]} · Reserva de demostración</small></div><strong>{b.split(" · ")[2]}</strong><span className="status-pill"><CheckCircle2 size={13}/> Confirmada</span></div>)}</section></div></main>;

  const Support = () => <main className="page-container narrow"><div className="breadcrumb"><button onClick={()=>go("home")}>Inicio</button><span>/</span>Ayuda y asistencia</div><div className="support-hero"><span className="support-icon"><Headphones/></span><span className="kicker">ESTAMOS PARA ACOMPAÑARTE</span><h1>¿En qué podemos ayudarte?</h1><p>Nuestro equipo está disponible para acompañarte antes, durante y después de tu viaje.</p></div><div className="support-grid"><button onClick={()=>setToast("Chat de demostración: un asesor se pondrá en contacto.")}><MessageCircle/><b>Chat en vivo</b><small>Hablá con un asesor</small></button><button onClick={()=>setToast("Centro de ayuda de demostración.")}><CircleHelp/><b>Preguntas frecuentes</b><small>Encontrá respuestas rápidas</small></button><button onClick={()=>setToast("Soporte 24/7 activado en modo demostración.")}><ShieldCheck/><b>Asistencia al viajero</b><small>Estamos con vos en destino</small></button></div><div className="contact-box"><h2>Dejanos tu consulta</h2><form onSubmit={e=>{e.preventDefault();setToast("¡Tu consulta fue registrada correctamente!");(e.currentTarget as HTMLFormElement).reset();}}><label>Tu nombre<input required placeholder="Nombre y apellido"/></label><label>Correo electrónico<input type="email" required placeholder="tu@email.com"/></label><label>¿En qué podemos ayudarte?<textarea required rows={4} placeholder="Escribí tu consulta..."/></label><button className="primary-btn">Enviar consulta <ArrowRight size={16}/></button></form></div></main>;

  return <><Header/>{page==="home"&&<Home/>}{page==="results"&&<Results/>}{page==="detail"&&<Detail/>}{page==="login"&&<Login/>}{page==="register"&&<Login register/>}{page==="checkout"&&<Checkout/>}{page==="account"&&<Account/>}{page==="support"&&<Support/>}<Footer/><button className="chat-float" onClick={()=>go("support")} aria-label="Abrir ayuda"><MessageCircle/></button>{toast&&<div className="toast"><CheckCircle2 size={18}/>{toast}<button onClick={()=>setToast("")}><X size={15}/></button></div>}</>;
}
