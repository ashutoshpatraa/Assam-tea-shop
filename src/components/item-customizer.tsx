"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type Option = { id: string; name: string; priceDeltaPaise: number };
export type Group = {
  id: string;
  name: string;
  selection: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: Option[];
};
export type Item = {
  id: string;
  name: string;
  slug: string;
  category?: string;
  imageUrl?: string | null;
  pricePaise: number;
  dietary: string;
  soldOutToday: boolean;
  description: string;
  optionGroups: Group[];
};

/* ========================================================================
   BESPOKE NEO-BRUTALIST SVG ILLUSTRATIONS
   ======================================================================== */

// Realistic 3D Assam Milk Chai Cup
function RealisticChaiCup() {
  return (
    <svg viewBox="0 0 300 320" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Ceramic body gradient */}
        <linearGradient id="cupCeramic" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EDE0CC" />
          <stop offset="35%" stopColor="#FFFDF7" />
          <stop offset="70%" stopColor="#F5EBD8" />
          <stop offset="100%" stopColor="#D8C7AA" />
        </linearGradient>

        {/* Chai tea liquid gradient */}
        <radialGradient id="chaiLiquid" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B36540" />
          <stop offset="60%" stopColor="#8A4122" />
          <stop offset="90%" stopColor="#5E2713" />
          <stop offset="100%" stopColor="#43190A" />
        </radialGradient>

        {/* Milk froth swirl gradient */}
        <radialGradient id="milkSwirl" cx="42%" cy="45%" r="40%">
          <stop offset="0%" stopColor="#FFF5E4" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#E8CA9D" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#9C5230" stopOpacity="0" />
        </radialGradient>

        {/* Saucer shadow */}
        <radialGradient id="saucerShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0B231A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0B231A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Saucer shadow */}
      <ellipse cx="150" cy="292" rx="110" ry="18" fill="url(#saucerShadow)" />

      {/* Ceramic Saucer */}
      <ellipse cx="150" cy="280" rx="104" ry="16" fill="#D3C3A7" stroke="#171717" strokeWidth="3" />
      <ellipse cx="150" cy="278" rx="96" ry="12" fill="#FFFDF5" />
      <ellipse cx="150" cy="278" rx="55" ry="7" fill="#E5D6BD" stroke="#171717" strokeWidth="1.5" />

      {/* Cup Handle (behind body left/right) */}
      <path
        d="M230 145 C275 145 275 225 220 230"
        stroke="#171717"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M230 145 C272 145 272 225 220 230"
        stroke="#E8DCBE"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cup Body Base */}
      <path
        d="M86 115 L106 256 Q108 266 122 268 L178 268 Q192 266 194 256 L214 115 Z"
        fill="url(#cupCeramic)"
        stroke="#171717"
        strokeWidth="3.5"
      />

      {/* Cup ceramic glossy highlight */}
      <path
        d="M102 125 L118 250 Q122 254 130 254"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.6"
        fill="none"
      />

      {/* Cup Lip Rim Outer */}
      <ellipse cx="150" cy="115" rx="64" ry="24" fill="#D8C8AB" stroke="#171717" strokeWidth="3" />
      <ellipse cx="150" cy="114" rx="60" ry="21" fill="#FFFDF5" />

      {/* Steaming Chai Liquid Surface */}
      <ellipse cx="150" cy="116" rx="55" ry="18" fill="url(#chaiLiquid)" stroke="#171717" strokeWidth="2" />

      {/* Creamy Milk Foam Swirl */}
      <ellipse cx="144" cy="116" rx="36" ry="11" fill="url(#milkSwirl)" />

      {/* Cinnamon / Spiced dusting specks on chai */}
      <circle cx="138" cy="114" r="1.5" fill="#421808" opacity="0.8" />
      <circle cx="148" cy="117" r="1.2" fill="#421808" opacity="0.9" />
      <circle cx="156" cy="113" r="1.4" fill="#5A230D" opacity="0.85" />
      <circle cx="164" cy="118" r="1" fill="#3D1505" opacity="0.7" />
      <circle cx="130" cy="118" r="1.3" fill="#421808" opacity="0.8" />
      <circle cx="142" cy="120" r="1.1" fill="#5A230D" opacity="0.75" />

      {/* Decorative Traditional Border Band on Cup */}
      <path d="M96 175 Q150 188 204 175" stroke="#174B37" strokeWidth="6" fill="none" opacity="0.9" />
      <path d="M97 186 Q150 199 203 186" stroke="#D94B35" strokeWidth="2.5" fill="none" opacity="0.95" />
    </svg>
  );
}

// Green Cardamom Pod Illustration
function CardamomPod() {
  return (
    <svg viewBox="0 0 64 64" width="60" height="60" fill="none">
      <path
        d="M32 6 C20 18 16 34 22 48 C26 56 38 56 42 48 C48 34 44 18 32 6 Z"
        fill="#558C4A"
        stroke="#171717"
        strokeWidth="2.2"
      />
      {/* Ribs / Ridges */}
      <path d="M32 6 Q32 30 32 54" stroke="#7EBA6E" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 8 Q25 28 25 46" stroke="#417336" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M32 8 Q39 28 39 46" stroke="#87C477" strokeWidth="1.2" strokeLinecap="round" />
      {/* Stem tip */}
      <path d="M32 6 L32 2" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bottom calyx */}
      <path d="M29 52 L32 57 L35 52" stroke="#171717" strokeWidth="1.8" strokeLinejoin="round" fill="#385F2E" />
    </svg>
  );
}

// Cinnamon Bark Quill Stick Illustration
function CinnamonStick() {
  return (
    <svg viewBox="0 0 90 70" width="85" height="66" fill="none">
      {/* Main stick bark body */}
      <g transform="rotate(-24 45 35)">
        <rect x="15" y="24" width="60" height="18" rx="2" fill="#8C4927" stroke="#171717" strokeWidth="2.2" />
        {/* Longitudinal bark texture */}
        <line x1="20" y1="28" x2="68" y2="28" stroke="#AD653C" strokeWidth="1.5" />
        <line x1="24" y1="34" x2="72" y2="34" stroke="#683419" strokeWidth="1.5" />
        <line x1="18" y1="38" x2="62" y2="38" stroke="#B8734A" strokeWidth="1.2" />
        {/* End curl (quill scroll) */}
        <ellipse cx="15" cy="33" rx="4" ry="9" fill="#5A2810" stroke="#171717" strokeWidth="2" />
        <ellipse cx="15" cy="33" rx="2" ry="5.5" fill="#C9885E" />
        <ellipse cx="75" cy="33" rx="4" ry="9" fill="#6A3215" stroke="#171717" strokeWidth="2" />
      </g>
    </svg>
  );
}

// 3D Assam Tea Leaf
function TeaLeaf({ rotate = 0, size = 44, color = "#2D7A55" }: { rotate?: number; size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 40 50" width={size} height={size} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      <path d="M20 2 C8 8 2 22 4 40 C4 40 20 48 36 40 C38 22 32 8 20 2Z" fill={color} stroke="#171717" strokeWidth="2" />
      <path d="M20 5 L20 42" stroke="#75C695" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M20 15 L10 25" stroke="#75C695" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M20 22 L11 31" stroke="#75C695" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M20 15 L30 25" stroke="#75C695" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M20 22 L29 31" stroke="#75C695" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Size Scale Cup Icons (Small, Regular, Large)
function CupScaleIcon({ size = "regular" }: { size: "small" | "regular" | "large" }) {
  const h = size === "small" ? 18 : size === "regular" ? 24 : 30;
  const w = size === "small" ? 16 : size === "regular" ? 22 : 28;
  return (
    <svg width={w} height={h} viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6 L7 24 Q8 27 12 27 L16 27 Q20 27 21 24 L24 6 Z" fill="currentColor" stroke="#171717" strokeWidth="2" />
      <path d="M24 10 C27 10 27 16 23 17" stroke="#171717" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="4" y1="6" x2="24" y2="6" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ========================================================================
   MAIN COMPONENT
   ======================================================================== */
export default function ItemCustomizer({ item }: { item: Item }) {
  const router = useRouter();
  const showcaseRef = useRef<HTMLDivElement>(null);
  const cupRef = useRef<HTMLDivElement>(null);

  // Cart count for top bar
  const [cartCount, setCartCount] = useState(0);

  // Selection state with initial defaults for required single groups
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const group of item.optionGroups) {
      if (group.required && group.selection === "SINGLE" && group.options.length > 0) {
        const preferred =
          group.options.find(
            (o) =>
              o.name.toLowerCase() === "regular" ||
              o.name.toLowerCase() === "dairy" ||
              o.priceDeltaPaise === 0,
          ) ?? group.options[0];

        initial[group.id] = [preferred.id];
      }
    }
    return initial;
  });
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [addedShake, setAddedShake] = useState(false);

  // Read cart count safely on mount
  useEffect(() => {
    queueMicrotask(() => {
      const raw = localStorage.getItem("assam-cart");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as unknown[];
          setCartCount(parsed.length);
        } catch {}
      }
    });
  }, []);

  // Calculate price delta from selected options
  const priceDelta = useMemo(
    () =>
      item.optionGroups.reduce(
        (sum, group) =>
          sum +
          (selected[group.id] ?? []).reduce(
            (optionSum, optionId) =>
              optionSum + (group.options.find((o) => o.id === optionId)?.priceDeltaPaise ?? 0),
            0,
          ),
        0,
      ),
    [item.optionGroups, selected],
  );

  const unitPricePaise = item.pricePaise + priceDelta;
  const totalPricePaise = unitPricePaise * quantity;

  // Toggle selection
  function handleSelect(group: Group, optionId: string) {
    setSelected((prev) => {
      const currentIds = prev[group.id] ?? [];
      if (group.selection === "SINGLE") {
        return { ...prev, [group.id]: [optionId] };
      }
      // MULTI
      if (currentIds.includes(optionId)) {
        return { ...prev, [group.id]: currentIds.filter((id) => id !== optionId) };
      }
      if (currentIds.length >= group.maxSelect) {
        return prev;
      }
      return { ...prev, [group.id]: [...currentIds, optionId] };
    });
  }

  // Add to Cart
  function addToCart() {
    if (item.soldOutToday) return;

    // Validate required groups
    for (const group of item.optionGroups) {
      if (group.required && (selected[group.id]?.length ?? 0) < group.minSelect) {
        window.alert(`Please choose an option for ${group.name}.`);
        return;
      }
    }

    try {
      const raw = localStorage.getItem("assam-cart");
      const cart = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
      cart.push({
        menuItemId: item.id,
        name: item.name,
        slug: item.slug,
        basePricePaise: item.pricePaise,
        priceDeltaPaise: priceDelta,
        quantity,
        dietary: item.dietary,
        customizations: selected,
      });
      localStorage.setItem("assam-cart", JSON.stringify(cart));
      setCartCount(cart.length);

      // Trigger feedback animation
      setIsAdded(true);
      setAddedShake(true);
      setTimeout(() => setAddedShake(false), 600);
      setTimeout(() => {
        setIsAdded(false);
        router.push("/cart");
      }, 1100);
    } catch (e) {
      console.error("Cart save failed:", e);
    }
  }

  // Interactive 3D mouse parallax on Left Showcase
  useEffect(() => {
    const card = showcaseRef.current;
    const cup = cupRef.current;
    if (!card || !cup || window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;

      // Subtle tilt
      cup.style.transform = `perspective(800px) rotateY(${dx * 16}deg) rotateX(${-dy * 14}deg) translateY(${-Math.abs(dx * 4)}px)`;
    };

    const onMouseLeave = () => {
      cup.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)";
    };

    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);
    return () => {
      card.removeEventListener("mousemove", onMouseMove);
      card.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="pdp-page">
      <div className="pdp-container">
        {/* ===================== TOP BREADCRUMB & NAV ===================== */}
        <div className="pdp-top-nav">
          <Link href="/menu" className="pdp-back-link">
            ← Back to All Chai &amp; Snacks
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              ASSAM TEA SHOP
            </span>
            <Link href="/cart" className="btn btn-cart btn-sm">
              🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
          </div>
        </div>

        {/* ===================== MAIN 2-COLUMN GRID ===================== */}
        <div className="pdp-grid">
          {/* =========================================================
              LEFT COLUMN: CINEMATIC 3D PRODUCT SHOWCASE (~55%)
              ========================================================= */}
          <div className="pdp-showcase" ref={showcaseRef}>
            {/* Background cinematic video */}
            <video
              className="pdp-showcase-video"
              autoPlay
              loop
              muted
              playsInline
              poster="/images/hero-tea-garden.svg"
            >
              <source
                src="https://videos.pexels.com/video-files/5900517/5900517-hd_1280_720_30fps.mp4"
                type="video/mp4"
              />
            </video>
            <div className="pdp-showcase-overlay" />

            <div className="pdp-showcase-content">
              {/* Header stickers */}
              <div className="pdp-showcase-header">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span className="pdp-badge-sticker pdp-badge-yellow" style={{ transform: "rotate(-3deg)" }}>
                    100% ASSAM TEA
                  </span>
                  <span className="pdp-badge-sticker pdp-badge-red" style={{ transform: "rotate(2deg)" }}>
                    FRESHLY BREWED
                  </span>
                </div>
                <span className="pdp-badge-sticker pdp-badge-green" style={{ transform: "rotate(-2deg)" }}>
                  LOCAL FAVOURITE ★
                </span>
              </div>

              {/* 3D Stage with Chai Cup, Steam, Spices & Leaves */}
              <div className="pdp-stage-3d">
                {/* Floating Spices: Cardamom Pod */}
                <div className="pdp-spice-cardamom" title="Fresh green cardamom pod">
                  <CardamomPod />
                </div>

                {/* Floating Spices: Cinnamon Stick */}
                <div className="pdp-spice-cinnamon" title="Spicy aromatic cinnamon bark">
                  <CinnamonStick />
                </div>

                {/* Floating Tea Leaves */}
                <div className="pdp-floating-leaf-1">
                  <TeaLeaf rotate={-25} size={42} color="#174B37" />
                </div>
                <div className="pdp-floating-leaf-2">
                  <TeaLeaf rotate={38} size={48} color="#2D7A55" />
                </div>

                {/* Interactive 3D Chai Cup */}
                <div className="pdp-cup-interactive" ref={cupRef}>
                  {/* Rising steam wisps */}
                  <div className="pdp-steam-column" aria-hidden="true">
                    <div className="pdp-steam-wisp" />
                    <div className="pdp-steam-wisp" />
                    <div className="pdp-steam-wisp" />
                  </div>

                  <RealisticChaiCup />
                </div>

                {/* Circular Rotating Seal */}
                <svg className="pdp-rotating-seal" viewBox="0 0 120 120" aria-hidden="true">
                  <defs>
                    <path id="pdp-seal-path" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                  </defs>
                  <text>
                    <textPath href="#pdp-seal-path">
                      ★ BREWED WITH LOVE ★ PROPER ASSAM CHAI ★ SINCE 2024 ★
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Showcase Footer Note */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "rgba(255, 253, 245, 0.75)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  borderTop: "1px solid rgba(255, 253, 245, 0.2)",
                  paddingTop: "14px",
                }}
              >
                <span>Slow-simmered CTC leaves</span>
                <span>Rich malty body</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: PRODUCT DETAILS & CUSTOMIZER (~45%)
              ========================================================= */}
          <div className="pdp-customizer">
            {/* Header Block */}
            <div className="pdp-header-block">
              <div className="pdp-meta-row">
                <span className="pdp-category-pill">
                  01 / {item.category ? item.category.toUpperCase() : "THE CLASSICS"}
                </span>
                <span className="pdp-dietary-badge">
                  {item.dietary === "VEG" ? "✓ 100% Vegetarian" : "◈ Non-Veg"}
                </span>
                <span className="pdp-prep-badge">⏱ 4–6 MINS FRESH BREW</span>
                <span className="pdp-prep-badge" style={{ background: "#fef3c7", color: "#92400e" }}>
                  🔥 FRESH BATCH READY
                </span>
              </div>

              <h1 className="pdp-main-title">{item.name}</h1>

              <p className="pdp-description">
                {item.slug === "assam-milk-chai"
                  ? "Strong Assam tea, slow-simmered with creamy milk and a little spice. Made for your everyday chai break."
                  : item.description}
              </p>

              <div className="pdp-price-hero">
                <span className="pdp-base-price-label">Starting Price</span>
                <span className="pdp-base-price-val">₹{(item.pricePaise / 100).toFixed(0)}</span>
              </div>

              {item.soldOutToday && (
                <div
                  role="status"
                  style={{
                    marginTop: "16px",
                    padding: "12px 18px",
                    background: "var(--red)",
                    color: "var(--white)",
                    border: "2px solid var(--black)",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  ⚠ Sold Out Today — Please Check Back Tomorrow
                </div>
              )}
            </div>

            {/* Customization Option Groups */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {item.optionGroups.map((group, groupIdx) => {
                const groupNameLower = group.name.toLowerCase();
                const isSugar = groupNameLower.includes("sugar");
                const isMilk = groupNameLower.includes("milk");
                const isSize = groupNameLower.includes("size");
                const isExtra = groupNameLower.includes("extra") || groupNameLower.includes("spice");

                // Custom title mapping per design prompt
                const displayTitle = isSugar
                  ? "HOW SWEET?"
                  : isMilk
                    ? "PICK YOUR MILK"
                    : isSize
                      ? "CHOOSE YOUR SIZE"
                      : isExtra
                        ? "MAKE IT YOURS"
                        : group.name.toUpperCase();

                return (
                  <fieldset key={group.id} className="pdp-section-group" style={{ border: "none", margin: 0, padding: 0 }}>
                    <div className="pdp-section-title-wrap">
                      <legend className="pdp-section-title">
                        <span className="pdp-section-num">0{groupIdx + 1}</span>
                        {displayTitle}
                      </legend>
                      <span className="pdp-section-req">
                        {group.required ? "Required · Choose 1" : "Optional · Choose any"}
                      </span>
                    </div>

                    {/* SECTION A: SUGAR LEVEL (3 Selectable cards) */}
                    {isSugar && (
                      <div className="pdp-options-grid-3">
                        {group.options.map((option) => {
                          const isSelected = selected[group.id]?.includes(option.id) ?? false;
                          return (
                            <button
                              type="button"
                              key={option.id}
                              className={`pdp-choice-card ${isSelected ? "is-active" : ""}`}
                              onClick={() => handleSelect(group, option.id)}
                              aria-pressed={isSelected}
                            >
                              <div className="pdp-choice-card-header">
                                <div className="pdp-radio-indicator" />
                                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)" }}>
                                  {option.name.toLowerCase().includes("regular")
                                    ? "100%"
                                    : option.name.toLowerCase().includes("less")
                                      ? "50%"
                                      : "0%"}
                                </span>
                              </div>
                              <span className="pdp-choice-name">{option.name}</span>
                              <span className="pdp-choice-delta">
                                {option.priceDeltaPaise === 0 ? "Standard" : `+₹${option.priceDeltaPaise / 100}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* SECTION B: MILK TYPE (2 Selectable cards) */}
                    {isMilk && (
                      <div className="pdp-options-grid-2">
                        {group.options.map((option) => {
                          const isSelected = selected[group.id]?.includes(option.id) ?? false;
                          return (
                            <button
                              type="button"
                              key={option.id}
                              className={`pdp-choice-card ${isSelected ? "is-active" : ""}`}
                              onClick={() => handleSelect(group, option.id)}
                              aria-pressed={isSelected}
                            >
                              <div className="pdp-choice-card-header">
                                <div className="pdp-radio-indicator" />
                                <span style={{ fontSize: "16px" }}>
                                  {option.name.toLowerCase().includes("oat") ? "🌾" : "🥛"}
                                </span>
                              </div>
                              <span className="pdp-choice-name" style={{ fontSize: "15px" }}>
                                {option.name}
                              </span>
                              <span className="pdp-choice-delta">
                                {option.priceDeltaPaise === 0 ? "Included" : `+₹${option.priceDeltaPaise / 100}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* SECTION C: CUP SIZE (3 Horizontal cards with cup icons) */}
                    {isSize && (
                      <div className="pdp-options-grid-3">
                        {group.options.map((option) => {
                          const isSelected = selected[group.id]?.includes(option.id) ?? false;
                          const sizeKey = option.name.toLowerCase().includes("small")
                            ? "small"
                            : option.name.toLowerCase().includes("large")
                              ? "large"
                              : "regular";
                          return (
                            <button
                              type="button"
                              key={option.id}
                              className={`pdp-choice-card pdp-size-card ${isSelected ? "is-active" : ""}`}
                              onClick={() => handleSelect(group, option.id)}
                              aria-pressed={isSelected}
                            >
                              <div className="pdp-size-icon">
                                <CupScaleIcon size={sizeKey} />
                              </div>
                              <span className="pdp-choice-name">{option.name}</span>
                              <span className="pdp-choice-delta">
                                {option.priceDeltaPaise === 0
                                  ? "Standard"
                                  : `${option.priceDeltaPaise > 0 ? "+" : "-"}₹${Math.abs(option.priceDeltaPaise) / 100}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* SECTION D: EXTRAS (Custom Checkbox Cards) */}
                    {isExtra && (
                      <div className="pdp-options-stack">
                        {group.options.map((option) => {
                          const isSelected = selected[group.id]?.includes(option.id) ?? false;
                          return (
                            <button
                              type="button"
                              key={option.id}
                              className={`pdp-choice-card pdp-check-card ${isSelected ? "is-active" : ""}`}
                              onClick={() => handleSelect(group, option.id)}
                              aria-pressed={isSelected}
                            >
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <div className="pdp-checkbox-box">
                                  {isSelected && <span style={{ fontSize: "12px", fontWeight: 900 }}>✓</span>}
                                </div>
                                <span className="pdp-choice-name" style={{ fontSize: "14px" }}>
                                  {option.name}
                                </span>
                              </div>
                              <span className="pdp-choice-delta" style={{ fontSize: "12px" }}>
                                {option.priceDeltaPaise > 0 ? `+₹${option.priceDeltaPaise / 100}` : "Free"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Generic Fallback for Other Groups */}
                    {!isSugar && !isMilk && !isSize && !isExtra && (
                      <div className="pdp-options-stack">
                        {group.options.map((option) => {
                          const isSelected = selected[group.id]?.includes(option.id) ?? false;
                          return (
                            <button
                              type="button"
                              key={option.id}
                              className={`pdp-choice-card pdp-check-card ${isSelected ? "is-active" : ""}`}
                              onClick={() => handleSelect(group, option.id)}
                              aria-pressed={isSelected}
                            >
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <div className={group.selection === "SINGLE" ? "pdp-radio-indicator" : "pdp-checkbox-box"}>
                                  {isSelected && group.selection !== "SINGLE" && (
                                    <span style={{ fontSize: "12px", fontWeight: 900 }}>✓</span>
                                  )}
                                </div>
                                <span className="pdp-choice-name" style={{ marginLeft: "10px" }}>
                                  {option.name}
                                </span>
                              </div>
                              <span className="pdp-choice-delta">
                                {option.priceDeltaPaise === 0
                                  ? "Standard"
                                  : `${option.priceDeltaPaise > 0 ? "+" : "-"}₹${Math.abs(option.priceDeltaPaise) / 100}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </fieldset>
                );
              })}
            </div>

            {/* ===================== QUANTITY & ORDER AREA ===================== */}
            <div className="pdp-order-panel">
              <div className="pdp-order-top-row">
                {/* Stepper */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label
                    htmlFor="qty-val"
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    Quantity
                  </label>
                  <div className="pdp-stepper">
                    <button
                      type="button"
                      className="pdp-stepper-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span id="qty-val" className="pdp-stepper-val">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="pdp-stepper-btn"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Live Total Price */}
                <div className="pdp-total-price-box">
                  <div className="pdp-total-price-label">
                    Total (₹{(unitPricePaise / 100).toFixed(0)} × {quantity})
                  </div>
                  <div className="pdp-total-price-val">₹{(totalPricePaise / 100).toFixed(0)}</div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                disabled={item.soldOutToday}
                onClick={addToCart}
                className={`pdp-btn-add ${isAdded ? "is-success" : ""} ${addedShake ? "animate-bounce" : ""}`}
              >
                {item.soldOutToday ? (
                  "Sold Out Today"
                ) : isAdded ? (
                  <>Added To Cart! ✓</>
                ) : (
                  <>
                    <span>Add To Cart</span>
                    <span>•</span>
                    <span>₹{(totalPricePaise / 100).toFixed(0)}</span>
                    <span style={{ fontSize: "20px" }}>→</span>
                  </>
                )}
              </button>

              <div className="pdp-cart-links-row">
                <Link href="/cart">View Cart{cartCount > 0 ? ` (${cartCount})` : ""} →</Link>
                <span style={{ color: "var(--muted)", fontSize: "11px", letterSpacing: "0.05em" }}>
                  FRESHLY HAND-BREWED TO ORDER
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MOBILE STICKY ORDER BAR ===================== */}
      <div className="pdp-mobile-bar" aria-label="Mobile quick add bar">
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
            Total ({quantity} cup{quantity > 1 ? "s" : ""})
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--black)", lineHeight: 1 }}>
            ₹{(totalPricePaise / 100).toFixed(0)}
          </div>
        </div>
        <button
          type="button"
          disabled={item.soldOutToday}
          onClick={addToCart}
          className="btn btn-primary"
          style={{ padding: "12px 20px", fontSize: "13px" }}
        >
          {isAdded ? "Added! ✓" : "Add to Cart →"}
        </button>
      </div>
    </div>
  );
}
