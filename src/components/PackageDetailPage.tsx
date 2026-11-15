import { useEffect, useRef, useState } from "react";
import type { FormEvent, TouchEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight, BedDouble, CalendarDays, CarFront, Check, CheckCircle2,
  ChevronLeft, ChevronRight, Clock3, Compass, FileText, Headphones, Heart, Info,
  MapPin, MessageCircle, Phone, Plane, Share2, ShieldCheck, Sparkles, Star, X
} from "lucide-react";
import { SmartImage } from "./SmartImage";
import "./package-detail.css";

export type PackageInclude = {
  icon?: string;
  title?: string;
  description?: string;
};

export type PackageInfoSection = {
  icon?: string;
  title?: string;
  description?: string;
};

export type PackageDetailData = {
  id: number;
  name: string;
  country?: string;
  category?: string;
  price?: number;
  priceApproximate?: boolean;
  oldPrice?: number;
  originalPrice?: number;
  currency?: string;
  days?: number;
  nights?: number;
  mode?: string;
  tripType?: string;
  image: string;
  images?: string[];
  focalPoint?: { x: number; y: number };
  imagePosition?: string;
  caption?: string;
  description?: string;
  descriptionTitle?: string;
  rating?: number;
  reviews?: string;
  reviewCount?: number | string;
  departureCity?: string;
  departureDate?: string;
  returnDate?: string;
  includes?: PackageInclude[];
  infoSections?: PackageInfoSection[];
  flags?: {
    promo?: boolean;
    reservaOnline?: boolean;
    cancelacionGratuita?: boolean;
    recommended?: boolean;
  };
};

type InquiryPayload = {
  name: string;
  email: string;
  phone: string;
  travelers: number;
  requestedDate: string;
};

type Props = {
  packageData: PackageDetailData;
  reservationReference?: string;
  onViewReservation?: () => void;
  packages: PackageDetailData[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  favoriteIds: number[];
  onTogglePackageFavorite: (id: number) => void;
  onHome: () => void;
  onPackages: () => void;
  onOpenPackage: (item: PackageDetailData) => void;
  onReserve: () => void;
  onConsultAvailability: (payload: InquiryPayload) => void;
  onContact: () => void;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
};

const money = (value?: number, currency = "USD") => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  const formatted = value.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  return currency === "ARS" ? `$ ${formatted}` : `${currency} ${formatted}`;
};

const durationNights = (item: PackageDetailData) => {
  if (typeof item.nights === "number" && item.nights > 0) return item.nights;
  if (item.departureDate && item.returnDate) {
    const start = new Date(`${item.departureDate}T00:00:00`).getTime();
    const end = new Date(`${item.returnDate}T00:00:00`).getTime();
    const nights = Math.round((end - start) / 86400000);
    if (Number.isFinite(nights) && nights > 0) return nights;
  }
  return undefined;
};

const durationDays = (item: PackageDetailData) => {
  if (typeof item.days === "number" && item.days > 0) return item.days;
  const nights = durationNights(item);
  return nights ? nights + 1 : undefined;
};

const discountAmount = (item: PackageDetailData) =>
  typeof (item.originalPrice ?? item.oldPrice) === "number" && typeof item.price === "number" && (item.originalPrice ?? item.oldPrice)! > item.price
    ? (item.originalPrice ?? item.oldPrice)! - item.price
    : undefined;

const iconFor = (name?: string) => {
  switch ((name || "").toLowerCase()) {
    case "plane": return Plane;
    case "hotel":
    case "bed": return BedDouble;
    case "calendar": return CalendarDays;
    case "compass": return Compass;
    case "file": return FileText;
    case "shield": return ShieldCheck;
    case "clock": return Clock3;
    case "star": return Star;
    default: return CheckCircle2;
  }
};

const renderBoldText = (value: string) => {
  const parts = value.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, index) => index % 2 === 1 ? <strong key={index}>{part}</strong> : part);
};

export function PackageDetailPage({
  packageData,
  reservationReference,
  onViewReservation,
  packages,
  isFavorite,
  onToggleFavorite,
  favoriteIds,
  onTogglePackageFavorite,
  onHome,
  onPackages,
  onOpenPackage,
  onReserve,
  onConsultAvailability,
  onContact
}: Props) {
  const images = (packageData.images?.length ? packageData.images : [packageData.image]).filter(Boolean);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favoritePulse, setFavoritePulse] = useState(false);
  const [animatedOtherFavorite, setAnimatedOtherFavorite] = useState<number | null>(null);
  const [activeInfo, setActiveInfo] = useState<PackageInfoSection | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [travelerCount, setTravelerCount] = useState(2);
  const [installmentCount, setInstallmentCount] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [formError, setFormError] = useState("");
  const touchStartX = useRef<number | null>(null);
  const nights = durationNights(packageData);
  const days = durationDays(packageData);
  const savings = discountAmount(packageData);
  const priceLabel = money(packageData.price, packageData.currency || "USD");
  const installmentAmount = typeof packageData.price === "number" && installmentCount > 0 ? packageData.price / installmentCount : 0;
  const originalPriceLabel = money(packageData.originalPrice ?? packageData.oldPrice, packageData.currency || "USD");
  const galleryClass = images.length <= 1 ? "package-gallery package-gallery-single" : images.length === 2 ? "package-gallery package-gallery-double" : "package-gallery";
  const includes = (packageData.includes || []).filter(item => item.title || item.description);
  const infoSections = (packageData.infoSections || []).filter(item => item.title && item.description);
  const otherPackages = packages.filter(item => item.id !== packageData.id && item.image);
  const hasFlight = includes.some(item => (item.icon || "").toLowerCase() === "plane");
  const hasHotel = includes.some(item => ["hotel", "bed"].includes((item.icon || "").toLowerCase()));
  const hotelMapQuery = encodeURIComponent([packageData.hotelName, packageData.hotelLocation].filter(Boolean).join(", "));

  useEffect(() => {
    const description = packageData.description || `Conocé el paquete ${packageData.name} de MundoGlobal Travel.`;
    document.title = `${packageData.name} | Paquetes · MundoGlobal Travel`;
    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description.slice(0, 155);
    const setMeta = (property: string, content: string) => {
      let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    setMeta("og:title", `${packageData.name} | MundoGlobal Travel`);
    setMeta("og:description", description.slice(0, 155));
    setMeta("og:image", images[0] ? new URL(images[0], window.location.origin).toString() : "");
    const schema = {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: packageData.name,
      description,
      touristType: packageData.tripType || packageData.category,
      image: images.map(src => new URL(src, window.location.origin).toString()),
      ...(packageData.country ? { itinerary: { "@type": "Place", name: packageData.country } } : {}),
      ...(priceLabel ? { offers: { "@type": "Offer", price: packageData.price, priceCurrency: packageData.currency || "USD", availability: "https://schema.org/InStock" } } : {})
    };
    let script = document.getElementById("package-touristtrip-jsonld") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "package-touristtrip-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
    return () => {
      document.getElementById("package-touristtrip-jsonld")?.remove();
    };
  }, [packageData, images, priceLabel]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") setLightboxIndex(index => index === null ? null : (index + 1) % images.length);
      if (event.key === "ArrowLeft") setLightboxIndex(index => index === null ? null : (index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    document.body.classList.add("package-modal-open");
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.classList.remove("package-modal-open");
    };
  }, [lightboxIndex, images.length]);

  const nextImage = () => setLightboxIndex(index => index === null ? null : (index + 1) % images.length);
  const previousImage = () => setLightboxIndex(index => index === null ? null : (index - 1 + images.length) % images.length);
  const openLightbox = (index: number) => setLightboxIndex(index);
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(delta) > 45) delta < 0 ? nextImage() : previousImage();
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!activeInfo && !availabilityOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setActiveInfo(null); setAvailabilityOpen(false); } };
    window.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("package-modal-open");
    return () => { window.removeEventListener("keydown", closeOnEscape); document.body.classList.remove("package-modal-open"); };
  }, [activeInfo, availabilityOpen]);

  const sharePackage = async () => {
    const shareData = { title: packageData.name, text: packageData.description || `Conocé ${packageData.name} con MundoGlobal Travel`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(window.location.href);
    } catch {
      // El usuario puede cerrar el diálogo nativo sin compartir.
    }
  };

  const submitInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (contactName.trim().length < 3 || (!contactEmail.trim() && !contactPhone.trim())) {
      setFormError("Ingresá tu nombre y al menos un medio de contacto.");
      return;
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setFormError("Revisá el correo electrónico ingresado.");
      return;
    }
    onConsultAvailability({
      name: contactName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      travelers: travelerCount,
      requestedDate: requestedDate
    });
    setAvailabilityOpen(false);
    setFormError("");
  };

  const renderBookingCard = () => <aside className="package-booking-column">
    <div className="package-booking-card">
      <div className="package-booking-badges">
        {packageData.flags?.promo && <span className="package-promo-badge"><Star size={13} fill="currentColor"/> Promoción</span>}
        {packageData.flags?.reservaOnline && <span className="package-online-badge"><CheckCircle2 size={13}/> Reserva 100% ON</span>}
      </div>
      {priceLabel && <div className="package-price-block">
        <span>{packageData.priceApproximate ? "Desde aproximadamente" : "Desde"}</span>
        <strong>{priceLabel}</strong>
        <small>por persona{packageData.price ? " en base doble" : ""}</small>
        {packageData.priceApproximate && <small className="package-price-estimate-note">Valor referencial consultado el 15/11/2026. Sujeto a cambios, impuestos y disponibilidad al momento de reservar.</small>}
        {originalPriceLabel && savings && <div className="package-saving-row"><del>{originalPriceLabel}</del><span>Ahorrá {money(savings, packageData.currency || "USD")}</span></div>}
        {typeof packageData.price === "number" && packageData.price > 0 && <div className="package-installments"><label htmlFor="package-installment-count">Opciones de pago</label><select id="package-installment-count" value={installmentCount} onChange={event => setInstallmentCount(Number(event.target.value))}><option value={1}>1 pago</option><option value={3}>3 cuotas</option><option value={6}>6 cuotas</option><option value={12}>12 cuotas</option></select><div className="package-installment-result"><strong>{money(installmentAmount, packageData.currency || "USD")}</strong><span>por cuota estimada</span></div><small>Simulación informativa dividida en partes iguales. La financiación, intereses y medios habilitados deben confirmarse al reservar.</small></div>}
      </div>}
      {(nights || hasFlight || hasHotel) && <div className="package-booking-meta">
        {nights && <span><CalendarDays size={16}/>{nights} noches</span>}
        {packageData.departureDate && <span><CalendarDays size={16}/>{`Del ${formatDate(packageData.departureDate)}${packageData.returnDate ? ` al ${formatDate(packageData.returnDate)}` : ""}`}</span>}
        {(hasFlight || hasHotel) && <span>{hasFlight && <Plane size={16}/>} {hasFlight && hasHotel ? "Vuelo + Hotel" : hasFlight ? "Vuelo incluido" : "Hotel incluido"}</span>}
      </div>}
      <button type="button" className="package-consult-button" onClick={() => reservationReference ? onViewReservation?.() : packageData.flags?.reservaOnline ? onReserve() : setAvailabilityOpen(true)}>
        {reservationReference ? "Ver mi reserva" : packageData.flags?.reservaOnline ? "Reservar ahora" : "Consultar disponibilidad"} <ArrowRight size={17}/>
      </button>
      <p className="package-booking-caption">{reservationReference ? "Ya tenés una reserva activa para esta salida. Consultá su detalle." : "¡Reservá ahora y asegurá tu lugar en este destino soñado!"}</p>
      <div className="package-cancellation-note"><ShieldCheck size={17}/><span>Podés cancelar online hasta 7 días antes de la salida</span></div>
    </div>
    <div className="package-travel-peace">
      <span><ShieldCheck size={21}/></span>
      <div><b>Tu tranquilidad al viajar</b><p>Contamos con asistencia y soporte durante tu viaje.</p></div>
    </div>
  </aside>;

  return <main className="package-detail-page">
    <div className="package-detail-grid">
      <header className="package-detail-heading">
        <div className="package-breadcrumb" aria-label="Migas de pan">
          <button onClick={onHome}>Inicio</button><ChevronRight size={13}/>
          <button onClick={onPackages}>Paquetes</button><ChevronRight size={13}/>
          <strong>{packageData.name}</strong>
        </div>
        <div className="package-title-row">
          <div className="package-title-main">
            <h1>{packageData.name}</h1>
            <span className="package-destination-badge"><Star size={13} fill="currentColor"/> Destino</span>
          </div>
          <div className="package-detail-actions">
            <button type="button" onClick={sharePackage}><Share2 size={16}/> Compartir</button>
            <button type="button" className={`${isFavorite ? "is-favorite" : ""} ${favoritePulse ? "favorite-pop" : ""}`} onClick={()=>{setFavoritePulse(true);onToggleFavorite();window.setTimeout(()=>setFavoritePulse(false),520);}} aria-pressed={isFavorite}><Heart size={17} fill={isFavorite ? "currentColor" : "none"}/> Favorito</button>
          </div>
        </div>
        <div className="package-detail-subrow">
          {packageData.country && <span><MapPin size={16}/>{packageData.country}</span>}
          {(nights || days) && <span><Star size={16} fill="currentColor"/>{nights && days ? `${days} días / ${nights} noches` : nights ? `${nights} noches` : `${days} días`}</span>}
        </div>
      </header>

      <section className="package-gallery-section" aria-label={`Galería de ${packageData.name}`}>
        <div className={galleryClass}>
          {images.slice(0, 3).map((src, index) => <button
            type="button"
            key={src + index}
            className={`package-gallery-tile package-gallery-tile-${index + 1}`}
            onClick={() => openLightbox(index)}
            aria-label={`Abrir foto ${index + 1} de ${images.length} de ${packageData.name}`}
          >
            <SmartImage src={src} alt={`${packageData.name}, ${packageData.country || "destino"} · foto ${index + 1}`} ratio="auto" fit="cover" focalPoint={packageData.focalPoint} objectPosition={packageData.imagePosition} minSourceWidth={index === 0 ? 1600 : 800} priority={index === 0}/>
            {index === 0 && (nights || days) && <span className="package-gallery-night-badge"><CalendarDays size={14}/>{nights ? `${nights} noches` : `${days} días`}</span>}
            {index === 2 && images.length > 3 && <span className="package-gallery-more">+{images.length - 3} fotos</span>}
          </button>)}
        </div>
        {packageData.caption && <p className="package-gallery-caption">{packageData.caption}</p>}
      </section>

      {renderBookingCard()}

      {(() => {
        const summary: { icon: LucideIcon; label: string; value: string }[] = [];
        if (packageData.tripType) summary.push({ icon: Compass, label: "Tipo de viaje", value: packageData.tripType });
        if (packageData.mode) summary.push({ icon: BedDouble, label: "Régimen", value: packageData.mode });
        if (nights || days) summary.push({ icon: CalendarDays, label: "Duración", value: nights && days ? `${nights} noches / ${days} días` : nights ? `${nights} noches` : `${days} días` });
        return summary.length > 0 ? <section className={`package-quick-summary summary-count-${summary.length}`} aria-label="Resumen del paquete">
          {summary.map(item => {
            const Icon = item.icon;
            return <div className="package-quick-summary-item" key={item.label}><span><Icon size={19}/></span><div><small>{item.label}</small><b>{item.value}</b></div></div>;
          })}
        </section> : null;
      })()}

      {packageData.description && <section className="package-description-section">
        <span className="package-section-eyebrow">DESCUBRÍ EL DESTINO</span>
        <h2>{packageData.descriptionTitle || `Tu próxima escapada a ${packageData.country || packageData.name}`}</h2>
        <p>{renderBoldText(packageData.description)}</p>
      </section>}

      {includes.length > 0 && <section className="package-includes-section">
        <h2>¿Qué incluye tu paquete?</h2>
        <div className="package-includes-list">
          {includes.map((item, index) => {
            const Icon = iconFor(item.icon);
            return <article key={`${item.title || "include"}-${index}`}><span><Icon size={17}/></span><div>{item.title && <h3>{item.title}</h3>}{item.description && <p>{renderBoldText(item.description)}</p>}</div></article>;
          })}
        </div>
      </section>}


      {packageData.hotelName && <section className="package-hotel-section">
        <div className="package-hotel-heading"><span className="package-section-eyebrow">ALOJAMIENTO DEL VIAJE</span><h2>Conocé dónde te vas a hospedar</h2><p>Consultá imágenes y ubicación del hotel de referencia incluido en este paquete.</p></div>
        <div className="package-hotel-card">
          {packageData.hotelImage && <div className="package-hotel-photo"><img src={packageData.hotelImage} alt={`Vista del hotel ${packageData.hotelName}`} loading="lazy"/></div>}
          <div className="package-hotel-copy"><span className="package-hotel-label"><BedDouble size={15}/> HOTEL DE REFERENCIA</span><h3>{packageData.hotelName}</h3><p><MapPin size={15}/>{packageData.hotelLocation}</p><a className="package-hotel-map-link" href={`https://www.google.com/maps/search/?api=1&query=${hotelMapQuery}`} target="_blank" rel="noreferrer"><MapPin size={16}/> Ver ubicación en Google Maps <ArrowRight size={15}/></a><small>La imagen es ilustrativa. La asignación y disponibilidad del hotel deben confirmarse con la agencia.</small></div>
        </div>
        <div className="package-hotel-map"><iframe title={`Mapa de ubicación de ${packageData.hotelName}`} src={`https://www.google.com/maps?q=${hotelMapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></div>
      </section>}
\n      {infoSections.length > 0 && <section className="package-info-sections">
        <div className="package-section-heading-row"><div><h2>Antes de viajar, confirmá los detalles</h2><p>Información importante para preparar tu experiencia.</p></div><button type="button" onClick={() => setActiveInfo(infoSections[0])}>Ver más <ChevronRight size={16}/></button></div>
        <div className="package-info-card-grid">
          {infoSections.slice(0, 4).map((section, index) => {
            const Icon = iconFor(section.icon);
            return <button key={`${section.title}-${index}`} className="package-info-card" onClick={() => setActiveInfo(section)}><span><Icon size={18}/></span><b>{section.title}</b><p>{section.description}</p><small>Ver detalles <ChevronRight size={13}/></small></button>;
          })}
        </div>
      </section>}
    </div>

    {otherPackages.length > 0 && <section className="package-other-section">
      <div className="package-other-inner">
        <span className="package-section-eyebrow">TRIPLES DESTINOS</span>
        <h2>Otros paquetes disponibles</h2>
        <p>Seguí descubriendo experiencias y elegí tu próximo destino.</p>
        <div className="package-other-grid">
          {otherPackages.map(item => {
            const itemNights = durationNights(item);
            const itemDays = durationDays(item);
            const itemIncludes = item.includes || [];
            const itemHasHotel = itemIncludes.some(entry => ["hotel", "bed"].includes((entry.icon || "").toLowerCase()));
            const itemHasFlight = itemIncludes.some(entry => (entry.icon || "").toLowerCase() === "plane");
            const saved = discountAmount(item);
            return <article className="package-other-card" key={item.id}>
              <div className="package-other-image-wrap">
                <button type="button" className="package-other-image-button" onClick={() => onOpenPackage(item)} aria-label={`Ver ${item.name}`}>
                  <SmartImage src={item.image} alt={`${item.name}, ${item.country || "destino"}`} ratio="16/9" fit="cover"/>
                </button>
                {item.flags?.recommended && <span className="package-recommended-badge">Recomendado</span>}
                <button type="button" className={`package-other-favorite ${favoriteIds.includes(item.id) ? "is-favorite" : ""} ${animatedOtherFavorite === item.id ? "favorite-pop" : ""}`} onClick={()=>{setAnimatedOtherFavorite(item.id);onTogglePackageFavorite(item.id);window.setTimeout(()=>setAnimatedOtherFavorite(current=>current===item.id?null:current),480);}} aria-label={favoriteIds.includes(item.id) ? `Quitar ${item.name} de favoritos` : `Guardar ${item.name} en favoritos`} aria-pressed={favoriteIds.includes(item.id)}><Heart size={17} fill={favoriteIds.includes(item.id) ? "currentColor" : "none"}/></button>
                <span className="package-other-country">{item.country || "Destino"}</span>
              </div>
              <div className="package-other-card-body">
                <div className="package-other-card-heading"><h3>{item.name}</h3>{item.rating && item.rating > 0 && <span><Star size={13} fill="currentColor"/>{item.rating.toFixed(1)} {(item.reviewCount ?? item.reviews) && (item.reviewCount ?? item.reviews) !== "0" ? `(${item.reviewCount ?? item.reviews})` : ""}</span>}</div>
                {(itemDays || itemHasHotel || itemHasFlight || item.mode) && <p className="package-other-facts">{itemDays && <span><CalendarDays size={13}/>{itemDays} días</span>}{itemHasHotel && <span><BedDouble size={13}/>Hotel</span>}{!itemHasHotel && itemHasFlight && <span><Plane size={13}/>Vuelo</span>}{item.mode && <span><Compass size={13}/>{item.mode}</span>}</p>}
                {money(item.price, item.currency || "USD") && <div className="package-other-price"><b>Desde {money(item.price, item.currency || "USD")}</b><small>por persona</small>{saved && <span>Ahorrá {money(saved, item.currency || "USD")}</span>}</div>}
                {item.description && <p className="package-other-description">{item.description}</p>}
                <button type="button" className="package-other-open" onClick={() => onOpenPackage(item)}>Ver paquete <ArrowRight size={15}/></button>
              </div>
            </article>;
          })}
        </div>
      </div>
    </section>}

    <section className="package-help-banner">
      <span className="package-help-icon"><Headphones size={25}/></span>
      <div className="package-help-copy"><h2>¿Necesitás ayuda?</h2><p>Nuestro equipo está para acompañarte, todos los días.</p></div>
      <div className="package-help-actions"><button type="button" onClick={onContact}><MessageCircle size={16}/> Contactanos</button><a href="tel:+543534123456"><Phone size={16}/> Llamar ahora</a></div>
      <span className="package-help-decoration" aria-hidden="true"><Headphones size={120}/></span>
    </section>

    {priceLabel && <div className="package-mobile-cta"><div><small>Desde</small><b>{priceLabel}</b></div><button type="button" onClick={() => packageData.flags?.reservaOnline ? onReserve() : setAvailabilityOpen(true)}>{packageData.flags?.reservaOnline ? "Reservar ahora" : "Consultar disponibilidad"} <ArrowRight size={16}/></button></div>}

    {lightboxIndex !== null && <div className="package-lightbox" role="dialog" aria-modal="true" aria-label="Galería de imágenes" onClick={() => setLightboxIndex(null)}>
      <button className="package-lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Cerrar galería" autoFocus><X/></button>
      {images.length > 1 && <button className="package-lightbox-arrow previous" onClick={event => { event.stopPropagation(); previousImage(); }} aria-label="Foto anterior"><ChevronLeft/></button>}
      <div className="package-lightbox-content" onClick={event => event.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <SmartImage src={images[lightboxIndex]} alt={`${packageData.name} · fotografía ${lightboxIndex + 1}`} ratio="auto" fit="contain" rounded={false} priority/>
        <span>{lightboxIndex + 1}/{images.length}</span>
      </div>
      {images.length > 1 && <button className="package-lightbox-arrow next" onClick={event => { event.stopPropagation(); nextImage(); }} aria-label="Foto siguiente"><ChevronRight/></button>}
    </div>}

    {activeInfo && <div className="package-detail-modal-backdrop" role="presentation" onClick={() => setActiveInfo(null)}>
      <section className="package-detail-modal" role="dialog" aria-modal="true" aria-labelledby="package-info-modal-title" onClick={event => event.stopPropagation()}>
        <button type="button" className="package-detail-modal-close" onClick={() => setActiveInfo(null)} aria-label="Cerrar" autoFocus><X/></button>
        <span className="package-modal-icon"><Info/></span>
        <h2 id="package-info-modal-title">{activeInfo.title}</h2>
        <p>{renderBoldText(activeInfo.description || "")}</p>
        <button type="button" className="package-consult-button" onClick={() => setActiveInfo(null)}>Entendido <Check size={16}/></button>
      </section>
    </div>}

    {availabilityOpen && <div className="package-detail-modal-backdrop" role="presentation" onClick={() => setAvailabilityOpen(false)}>
      <section className="package-detail-modal package-inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="package-inquiry-title" onClick={event => event.stopPropagation()}>
        <button type="button" className="package-detail-modal-close" onClick={() => setAvailabilityOpen(false)} aria-label="Cerrar" autoFocus><X/></button>
        <span className="package-modal-icon"><CalendarDays/></span>
        <span className="package-section-eyebrow">CONSULTA DE VIAJE</span>
        <h2 id="package-inquiry-title">Consultá disponibilidad para {packageData.name}</h2>
        <div className="package-inquiry-itinerary">
          {packageData.departureCity && <span><MapPin size={15}/> Sale desde {packageData.departureCity}</span>}
          {packageData.departureDate && <span><CalendarDays size={15}/> {formatDate(packageData.departureDate)}{packageData.returnDate ? ` al ${formatDate(packageData.returnDate)}` : ""}</span>}
          {!packageData.departureDate && <label>Fecha de preferencia<input type="date" min={new Date().toISOString().slice(0,10)} value={requestedDate} onChange={event => setRequestedDate(event.target.value)}/></label>}
        </div>
        <form onSubmit={submitInquiry}>
          <label>Nombre y apellido<input value={contactName} onChange={event => setContactName(event.target.value)} required minLength={3} autoComplete="name" placeholder="Tu nombre completo"/></label>
          <label>Correo electrónico<input type="email" value={contactEmail} onChange={event => setContactEmail(event.target.value)} autoComplete="email" placeholder="tu@email.com"/></label>
          <label>Teléfono<input value={contactPhone} onChange={event => setContactPhone(event.target.value)} autoComplete="tel" placeholder="+54 9 ..."/></label>
          <label>Pasajeros<select value={travelerCount} onChange={event => setTravelerCount(Number(event.target.value))}><option value={1}>1 pasajero</option><option value={2}>2 pasajeros</option><option value={3}>3 pasajeros</option><option value={4}>4 pasajeros</option><option value={5}>5 pasajeros</option><option value={6}>6 pasajeros</option></select></label>
          {formError && <p className="package-form-error" role="alert">{formError}</p>}
          <button type="submit" className="package-consult-button">Enviar consulta <ArrowRight size={17}/></button>
        </form>
        <small className="package-inquiry-footnote">La consulta no confirma una reserva ni genera un cobro.</small>
      </section>
    </div>}
  </main>;
}
