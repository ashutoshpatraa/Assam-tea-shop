"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type FeaturedItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  pricePaise: number;
  dietary: string;
  imageUrl: string | null;
  optionGroupCount: number;
};
type Shop = {
  address: string;
  mapUrl: string | null;
  hours: string[];
  acceptingOrders: boolean;
};

/* ---- SVG Icons ---- */
const LeafIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M17 2C10 3 5 8 4 15c6 1 12-3 13-13Z" fill="currentColor" />
    <path d="M4.5 15.5C7 11 10 8 15 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const CupIcon = () => (
  <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
    {/* Saucer */}
    <ellipse cx="60" cy="128" rx="48" ry="8" fill="#103528" />
    {/* Cup body */}
    <path d="M22 50 Q20 100 30 115 Q60 128 90 115 Q100 100 98 50 Z" fill="#F5EBD8" stroke="#171717" strokeWidth="2.5" />
    {/* Tea inside */}
    <path d="M25 65 Q60 75 95 65 Q98 100 90 115 Q60 125 30 115 Q22 100 25 65 Z" fill="#6B3A2A" />
    {/* Steam */}
    <path d="M44 48 Q46 38 44 28" stroke="rgba(255,253,245,0.6)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M60 46 Q62 34 60 22" stroke="rgba(255,253,245,0.6)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M76 48 Q78 38 76 28" stroke="rgba(255,253,245,0.6)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Handle */}
    <path d="M98 70 Q118 70 118 85 Q118 100 98 100" stroke="#171717" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Rim highlight */}
    <ellipse cx="60" cy="52" rx="38" ry="6" fill="none" stroke="#171717" strokeWidth="2" />
    {/* Shine */}
    <path d="M32 72 Q38 68 44 72" stroke="rgba(255,253,245,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const LeafSvg = ({ rotate = 0, size = 32, color = "#174B37" }: { rotate?: number; size?: number; color?: string }) => (
  <svg viewBox="0 0 40 50" width={size} height={size} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
    <path d="M20 2 C8 8 2 22 4 40 C4 40 20 48 36 40 C38 22 32 8 20 2Z" fill={color} stroke="#171717" strokeWidth="1.5" />
    <path d="M20 5 L20 42" stroke="rgba(255,253,245,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
    <path d="M20 15 L10 25" stroke="rgba(255,253,245,0.3)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    <path d="M20 15 L30 25" stroke="rgba(255,253,245,0.3)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
  </svg>
);

/* ---- Marquee data ---- */
const MARQUEE = [
  "Straight From Assam", "Bold Brewed Daily", "No Shortcuts, Just Chai",
  "CTC Leaves, Real Flavour", "Your Perfect Break", "Authentically Assamese",
];

/* ---- Scroll reveal hook ---- */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.05, rootMargin: "60px 0px 60px 0px" }
    );

    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 60 && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        obs.observe(el);
      }
    });

    return () => obs.disconnect();
  }, []);
}

/* ---- Custom cursor ---- */
function useCursor() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    };

    let raf: number;
    const animate = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      dot.remove();
      ring.remove();
    };
  }, []);
}

/* ---- Mouse parallax for hero art ---- */
function useParallax(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      el.style.transform = `translate(${dx * 14}px, ${dy * 10}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [ref]);
}

export default function HomeStorefront({ featured, shop }: { featured: FeaturedItem[]; shop: Shop }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const heroArtRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useReveal();
  useCursor();
  useParallax(heroArtRef);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(featured.map((item) => item.category)))],
    [featured]
  );
  const items = category === "All" ? featured : featured.filter((item) => item.category === category);

  const closeMenu = () => setMenuOpen(false);

  const addToCart = (item: FeaturedItem) => {
    if (item.optionGroupCount) { router.push(`/menu/${item.slug}`); return; }
    const cart = JSON.parse(localStorage.getItem("assam-cart") ?? "[]") as Array<Record<string, unknown>>;
    cart.push({
      menuItemId: item.id, name: item.name, slug: item.slug,
      basePricePaise: item.pricePaise, priceDeltaPaise: 0,
      quantity: 1, dietary: item.dietary, customizations: {},
    });
    localStorage.setItem("assam-cart", JSON.stringify(cart));
    setCartCount((c) => c + 1);
  };

  // Load cartCount on mount — use queueMicrotask to avoid sync setState-in-effect
  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem("assam-cart");
      if (raw) {
        const parsed = JSON.parse(raw) as Array<unknown>;
        setCartCount(parsed.length);
      }
    });
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      {/* ===================== NAVBAR ===================== */}
      <header className="nb-nav">
        <div className="nb-nav-inner shell">
          <Link href="/" className="nb-brand" aria-label="Assam Tea Shop Home">
            <span className="nb-brand-leaf">
              <LeafIcon />
            </span>
            <span>ASSAM <em>TEA SHOP</em></span>
          </Link>

          <nav className="desktop-links" aria-label="Main navigation">
            <a href="#menu">Menu</a>
            <a href="#story">Our Story</a>
            <a href="#experience">The Experience</a>
            <a href="#visit">Contact</a>
          </nav>

          <div className="nav-actions">
            <Link href="/cart" className="btn btn-cart btn-sm">
              🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
            <Link href="/menu" className="btn btn-primary btn-sm">
              Order Now →
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle mobile menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <i style={menuOpen ? { transform: "rotate(45deg) translate(5px, 5px)" } : {}} />
              <i style={menuOpen ? { opacity: 0 } : {}} />
              <i style={menuOpen ? { transform: "rotate(-45deg) translate(5px, -5px)" } : {}} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
            <div className="mobile-nav-inner shell">
              <a href="#menu" onClick={closeMenu}>Menu</a>
              <a href="#story" onClick={closeMenu}>Our Story</a>
              <a href="#experience" onClick={closeMenu}>The Experience</a>
              <a href="#visit" onClick={closeMenu}>Contact</a>
              <Link href="/cart" onClick={closeMenu}>Cart {cartCount > 0 ? `(${cartCount})` : ""}</Link>
              <Link href="/menu" onClick={closeMenu} className="btn btn-primary" style={{ marginTop: "16px" }}>
                Order Now →
              </Link>
            </div>
          </nav>
        )}
      </header>

      {!shop.acceptingOrders && (
        <div role="status" className="closed-notice">
          <strong>We&apos;re not taking live orders yet.</strong>{" "}
          The shop is awaiting its final business setup. Check back soon.
        </div>
      )}

      <main id="main">

        {/* ===================== HERO ===================== */}
        <section className="hero" aria-label="Hero">
          {/* Video background */}
          <div className="hero-video-wrap" aria-hidden="true">
            <video
              ref={videoRef}
              className="hero-video"
              autoPlay
              loop
              muted
              playsInline
              poster="/images/hero-tea-garden.svg"
            >
              {/* Pexels royalty-free tea garden video */}
              <source
                src="https://videos.pexels.com/video-files/5900517/5900517-hd_1280_720_30fps.mp4"
                type="video/mp4"
              />
            </video>
            <div className="hero-video-overlay" />
            <div className="hero-gradient-bottom" />
          </div>

          {/* Geometric accent shapes */}
          <div className="hero-shape-1" aria-hidden="true" />
          <div className="hero-shape-2" aria-hidden="true" />

          <div className="hero-content">
            <div className="hero-inner shell">
              {/* Left — Copy */}
              <div>
                <p className="hero-top-label">Straight From Assam</p>
                <h1 className="hero-h1">
                  CHA IS<br />
                  NOT JUST<br />
                  <span>A DRINK.</span>
                </h1>
                <p className="hero-sub">Strong. Sweet. Unapologetically Assamese.</p>
                <div className="hero-ctas">
                  <a href="#menu" className="btn btn-yellow">
                    Explore The Menu →
                  </a>
                  <a href="#story" className="btn btn-outline" style={{ color: "var(--white)", borderColor: "rgba(255,253,245,0.5)" }}>
                    Discover Our Story ↓
                  </a>
                </div>
              </div>

              {/* Right — 3D Cup Art */}
              <div className="hero-art" ref={heroArtRef} aria-hidden="true">
                {/* Sticker tag */}
                <div className="hero-sticker">Since&nbsp;2024</div>

                {/* 3D cup container */}
                <div className="cup-3d-wrap">
                  <div className="steam-wrap">
                    <div className="steam-line" />
                    <div className="steam-line" />
                    <div className="steam-line" />
                  </div>
                  <div className="cup-svg-container">
                    <CupIcon />
                  </div>
                </div>

                {/* Floating leaves */}
                <div className="leaf-float" style={{ top: "12%", right: "-10px" }}>
                  <LeafSvg rotate={-30} size={48} color="#2D7A55" />
                </div>
                <div className="leaf-float" style={{ bottom: "18%", right: "-30px" }}>
                  <LeafSvg rotate={60} size={36} color="#174B37" />
                </div>
                <div className="leaf-float" style={{ top: "50%", left: "-20px" }}>
                  <LeafSvg rotate={-15} size={40} color="#2D7A55" />
                </div>

                {/* Rotating circular text */}
                <svg className="rotating-text" viewBox="0 0 130 130" aria-hidden="true">
                  <defs>
                    <path id="circle-text-path" d="M65,65 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
                  </defs>
                  <text>
                    <textPath href="#circle-text-path">
                      ◆ AUTHENTIC ASSAM TEA ◆ FRESHLY BREWED ◆ SINCE 2024 ◆
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== MARQUEE ===================== */}
        <div className="marquee-bar" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((txt, i) => (
              <span key={i}>{txt}</span>
            ))}
          </div>
        </div>

        {/* ===================== MENU SECTION ===================== */}
        <section id="menu" className="menu-section" aria-labelledby="menu-heading">
          <div className="shell">
            <div className="section-header">
              <div>
                <p className="eyebrow reveal">The Good Stuff</p>
                <h2 className="section-h2 reveal reveal-delay-1" id="menu-heading">
                  THE<br /><span>GOOD</span><br />STUFF.
                </h2>
              </div>
              <Link href="/menu" className="btn btn-outline reveal">
                Full Menu →
              </Link>
            </div>

            {/* Category filters */}
            <div className="category-row" aria-label="Filter by category">
              {categories.map((name) => (
                <button
                  type="button"
                  key={name}
                  className={`cat-btn ${category === name ? "is-active" : ""}`}
                  onClick={() => setCategory(name)}
                  aria-pressed={category === name}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Products */}
            {items.length === 0 ? (
              <div style={{
                padding: "60px",
                border: "2px solid var(--black)",
                background: "var(--white)",
                textAlign: "center",
                color: "var(--muted)",
              }}>
                No items in this category yet. Check the{" "}
                <Link href="/menu" style={{ color: "var(--green)", fontWeight: 700 }}>full menu</Link>.
              </div>
            ) : (
              <div className="product-grid" role="list">
                {items.map((item, i) => (
                  <article
                    key={item.id}
                    className={`product-card reveal reveal-delay-${Math.min(i % 4 + 1, 5)}`}
                    role="listitem"
                  >
                    <Link href={`/menu/${item.slug}`} className="product-img-wrap" tabIndex={-1}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={`${item.name} — image`} />
                      ) : (
                        <div className="product-img-placeholder">Photo placeholder</div>
                      )}
                      <span className="product-category-tag">{item.category}</span>
                    </Link>

                    <div className="product-body">
                      <p className="product-dietary">
                        {item.dietary === "VEG" ? "✓ Vegetarian" : "◈ Non-Vegetarian"}
                      </p>
                      <h3 className="product-name">
                        <Link href={`/menu/${item.slug}`}>{item.name}</Link>
                      </h3>
                      <p className="product-desc">{item.description}</p>
                      <div className="product-footer">
                        <strong className="product-price">₹{(item.pricePaise / 100).toFixed(0)}</strong>
                        <button
                          type="button"
                          className="add-btn"
                          onClick={() => addToCart(item)}
                          aria-label={`${item.optionGroupCount ? "Choose options for" : "Add to cart:"} ${item.name}`}
                        >
                          {item.optionGroupCount ? "Choose +" : "Add +"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div style={{ marginTop: "40px", textAlign: "center" }}>
              <Link href="/menu" className="btn btn-black">
                View Full Menu →
              </Link>
            </div>
          </div>
        </section>

        {/* ===================== ORIGINS SECTION ===================== */}
        <section id="story" className="origins-section" aria-labelledby="origins-heading">
          <div className="origins-bg-num" aria-hidden="true">ASSAM</div>
          <div className="origins-inner shell">
            <div className="origins-left">
              <p className="eyebrow reveal">Our Origins</p>
              <h2 className="origins-h2 reveal reveal-delay-1" id="origins-heading">
                ROOTED<br />IN <span>ASSAM.</span>
              </h2>
              <p className="origins-desc reveal reveal-delay-2">
                Born from the lush tea gardens of the Brahmaputra valley —
                where morning mist meets <strong>the world&apos;s boldest leaf</strong>.
                Every cup we brew honours the soil it came from.
              </p>
              <p className="origins-desc reveal reveal-delay-3" style={{ marginTop: "16px" }}>
                Assam tea is known for its deep malty body, copper-red liquor,
                and generous warmth. We honour that character with a no-rush brew:
                good leaves, a careful simmer, and familiar flavours that make a cup feel like home.
              </p>

              <div className="origins-stats reveal reveal-delay-4">
                <div className="stat-box">
                  <div className="stat-num">100%</div>
                  <div className="stat-label">Assam CTC Leaf</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">Fresh</div>
                  <div className="stat-label">Brewed Daily</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">0</div>
                  <div className="stat-label">Shortcuts Taken</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">∞</div>
                  <div className="stat-label">Cups Served With Love</div>
                </div>
              </div>
            </div>

            <div className="origins-right reveal-right">
              <div className="origins-img-wrap">
                <img
                  src="/images/hero-tea-garden.svg"
                  alt="Lush green Assam tea garden"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================== WHY SECTION ===================== */}
        <section id="about" className="why-section" aria-labelledby="why-heading">
          <div className="shell">
            <p className="eyebrow reveal">Why Our Chai?</p>
            <h2 className="why-h2 reveal reveal-delay-1" id="why-heading">
              NO SHORTCUTS.<br /><span>JUST CHAI.</span>
            </h2>
            <div className="why-cards">
              <div className="why-card reveal">
                <span className="why-card-num" aria-hidden="true">01</span>
                <div className="why-card-icon" aria-hidden="true">
                  <LeafSvg size={48} color="#F4C95D" />
                </div>
                <h3 className="why-card-title">Real Assam Tea</h3>
                <p className="why-card-desc">
                  A full-bodied foundation of proper Assam CTC leaf in every single cup.
                  No blends, no powder, no compromise.
                </p>
              </div>
              <div className="why-card reveal reveal-delay-2">
                <span className="why-card-num" aria-hidden="true">02</span>
                <div className="why-card-icon" aria-hidden="true" style={{ width: 48, height: 48 }}>
                  <svg viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="28" r="16" stroke="#171717" strokeWidth="2.5" />
                    <path d="M24 16 L24 28 L32 32" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M20 8 Q24 4 28 8" stroke="#171717" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <h3 className="why-card-title">Freshly Brewed</h3>
                <p className="why-card-desc">
                  Prepared in small batches, never held for the sake of speed.
                  Your chai is made when you order it.
                </p>
              </div>
              <div className="why-card reveal reveal-delay-3">
                <span className="why-card-num" aria-hidden="true">03</span>
                <div className="why-card-icon" aria-hidden="true" style={{ width: 48, height: 48 }}>
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M24 6 L28 18 H40 L30 26 L34 38 L24 30 L14 38 L18 26 L8 18 H20 Z" stroke="#174B37" strokeWidth="2" fill="rgba(23,75,55,0.15)" />
                  </svg>
                </div>
                <h3 className="why-card-title">Made With Love</h3>
                <p className="why-card-desc">
                  Fragrant spices, fresh milk, and uncomplicated things done well.
                  Your five quiet minutes, honoured.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== EXPERIENCE SECTION ===================== */}
        <section id="experience" className="experience-section" aria-labelledby="exp-heading">
          <div className="experience-inner shell">
            <div>
              <p className="eyebrow reveal">The Tea Experience</p>
              <h2 className="experience-h2 reveal reveal-delay-1" id="exp-heading">
                TAKE A SIP.<br />TAKE A<br />BREAK.
              </h2>
              <p className="experience-desc reveal reveal-delay-2">
                Our idea of a perfect tea break is simple: a seat, something warm in your hands,
                and a cup that tastes unmistakably like Assam.
              </p>
              <div style={{ marginTop: "36px" }} className="reveal reveal-delay-3">
                <Link href="/menu" className="btn btn-primary">
                  Find Your Cup →
                </Link>
              </div>
            </div>

            <div className="experience-gallery reveal-right">
              <div className="gallery-item">
                <img src="/images/milk-chai.svg" alt="Freshly brewed Assam milk chai" />
                <span className="gallery-item-label">Assam Milk Chai — Classic</span>
              </div>
              <div className="gallery-item">
                <img src="/images/black-tea.svg" alt="A strong cup of black Assam tea" />
                <span className="gallery-item-label">Black Assam Tea</span>
              </div>
              <div className="gallery-item">
                <img src="/images/iced-tea.svg" alt="Chilled Assam iced chai" />
                <span className="gallery-item-label">Iced Assam Chai</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== STATEMENT SECTION ===================== */}
        <section className="statement-section" aria-label="Brand statement">
          {/* Floating cup decoration */}
          <div className="statement-cup" aria-hidden="true">
            <CupIcon />
          </div>

          <div className="shell" style={{ position: "relative", zIndex: 1 }}>
            <h2 className="statement-h2 reveal">
              LESS SCROLLING.<br /><span>MORE SIPPING.</span>
            </h2>
            <p className="statement-sub reveal reveal-delay-2">
              Your next chai break starts here.
            </p>
            <div className="statement-cta reveal reveal-delay-3">
              <Link href="/menu" className="btn btn-yellow">Order Now →</Link>
              <a href="#visit" className="btn btn-outline" style={{ borderColor: "rgba(255,253,245,0.4)", color: "var(--white)" }}>
                Find Our Shop ↓
              </a>
            </div>
          </div>
        </section>

        {/* ===================== REVIEWS ===================== */}
        <section className="reviews-section" aria-labelledby="reviews-heading">
          <div className="shell">
            <div className="section-header">
              <div>
                <p className="eyebrow reveal">Tea Talk</p>
                <h2 className="section-h2 reveal reveal-delay-1" id="reviews-heading" style={{ fontSize: "clamp(44px, 5.5vw, 80px)" }}>
                  WHAT THEY SAY.
                </h2>
              </div>
              <p style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", maxWidth: "160px", textAlign: "right" }} className="reveal">
                Sample customer feedback — for layout preview only
              </p>
            </div>

            <div className="review-grid reveal">
              {[
                ["The kind of chai that makes you slow down for a minute.", "Morning regular — Sample review"],
                ["Strong, fragrant and exactly what I look for in an Assam cup.", "Local visitor — Sample review"],
                ["Crisp snacks, warm tea, no fuss. A perfect afternoon stop.", "Tea break guest — Sample review"],
              ].map(([quote, author]) => (
                <blockquote key={author} className="review-card">
                  <div className="review-quote-mark" aria-hidden="true">&ldquo;</div>
                  <p className="review-text">{quote}</p>
                  <cite className="review-cite">{author}</cite>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== VISIT SECTION ===================== */}
        <section id="visit" className="visit-section" aria-labelledby="visit-heading">
          <div className="visit-inner shell">
            <div>
              <p className="eyebrow reveal">Come By</p>
              <h2 className="visit-h2 reveal reveal-delay-1" id="visit-heading">
                THERE&apos;S ALWAYS<br />TIME FOR <span>CHAI.</span>
              </h2>
              <p className="visit-address reveal reveal-delay-2">
                {shop.address || "Location details are being finalised.\nPlease check back soon."}
              </p>
              <div style={{ marginTop: "28px" }} className="reveal reveal-delay-3">
                {shop.mapUrl ? (
                  <a href={shop.mapUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                    Open in Maps ↗
                  </a>
                ) : (
                  <span style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 700 }}>
                    Map link pending setup
                  </span>
                )}
              </div>
            </div>

            <div className="hours-box reveal-right">
              <div className="hours-box-header">Opening Hours</div>
              <div className="hours-box-body">
                {shop.hours.length ? (
                  <ul className="hours-list">
                    {shop.hours.map((h) => {
                      const [day, time] = h.split(" · ");
                      return (
                        <li key={h}>
                          <span style={{ fontWeight: 600 }}>{day}</span>
                          <span style={{ color: time === "Closed" ? "var(--red)" : "var(--muted)" }}>
                            {time}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                    Opening hours have not been configured yet.
                  </p>
                )}
                <p className="hours-note">
                  Hours are confirmed by the shop before ordering opens.
                </p>
                <div style={{ marginTop: "24px" }}>
                  <Link href="/menu" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Order From The Menu →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="site-footer">
        <div className="gamosa-trim" aria-hidden="true" />
        <div className="shell">
          <div className="footer-headline">
            <h2>
              YOUR NEXT CHAI BREAK<br /><span>STARTS HERE.</span>
            </h2>
            <div className="footer-cta-row">
              <p style={{ fontSize: "16px", color: "rgba(255,253,245,0.6)", maxWidth: "400px", lineHeight: 1.65 }}>
                A small tea stop, rooted in the character of Assam.
                Bold leaves. No shortcuts. Every cup made right.
              </p>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Link href="/menu" className="btn btn-yellow">Order Now →</Link>
                <a href="#visit" className="btn btn-outline" style={{ borderColor: "rgba(255,253,245,0.3)", color: "var(--white)" }}>
                  Find Our Shop ↓
                </a>
              </div>
            </div>
          </div>

          <div className="footer-grid">
            <div>
              <div className="footer-brand-name">ASSAM <span>TEA SHOP</span></div>
              <p className="footer-brand-desc">
                CTC chai, cold drinks, snacks, and packaged loose-leaf tea.
                From the heart of Assam to your table.
              </p>
            </div>

            <div>
              <p className="footer-col-title">Explore</p>
              <nav className="footer-links" aria-label="Explore navigation">
                <a href="#menu">Menu</a>
                <a href="#story">Our Story</a>
                <a href="#about">Why Us</a>
                <a href="#experience">The Experience</a>
                <a href="#visit">Visit Us</a>
              </nav>
            </div>

            <div>
              <p className="footer-col-title">Order</p>
              <nav className="footer-links" aria-label="Order navigation">
                <Link href="/menu">Order Now</Link>
                <Link href="/cart">Your Cart</Link>
                <Link href="/track">Track an Order</Link>
              </nav>
            </div>

            <div>
              <p className="footer-col-title">Stay in Touch</p>
              <p style={{ fontSize: "14px", color: "rgba(255,253,245,0.55)", lineHeight: 1.65 }}>
                Contact details will appear here when configured by the shop.
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Assam Tea Shop. All rights reserved.</span>
            <span style={{ letterSpacing: "0.08em" }}>MADE WITH ♥ IN ASSAM</span>
          </div>
        </div>
      </footer>
    </>
  );
}
