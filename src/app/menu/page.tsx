import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const instant = false;

const categories = ["Hot Tea", "Cold Drinks", "Snacks", "Light Meals", "Packaged Tea"];

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = categories.includes(params.category ?? "") ? params.category : undefined;
  const items = await prisma.menuItem.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(params.q
        ? {
            OR: [
              { name: { contains: params.q } },
              { description: { contains: params.q } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <main style={{ minHeight: "70vh", background: "var(--cream)" }}>
      {/* Header */}
      <div style={{
        background: "var(--green)",
        borderBottom: "3px solid var(--black)",
        padding: "60px 0 48px",
      }}>
        <div className="shell">
          <p className="eyebrow" style={{ color: "var(--yellow)" }}>Assam Tea Shop</p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(56px, 8vw, 110px)",
            color: "var(--white)",
            textTransform: "uppercase",
            lineHeight: 0.9,
            marginTop: "16px",
          }}>
            THE<br /><span style={{ color: "var(--yellow)" }}>MENU.</span>
          </h1>
        </div>
      </div>

      <div className="shell" style={{ paddingBlock: "48px" }}>
        {/* Filter + search row */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "flex-end",
          justifyContent: "space-between", gap: "20px", marginBottom: "40px",
        }}>
          <nav aria-label="Menu categories" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Link
              href="/menu"
              style={{
                padding: "8px 18px",
                fontFamily: "var(--font-body)",
                fontSize: "12px", fontWeight: 800, letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "2px solid var(--black)",
                background: !category ? "var(--black)" : "transparent",
                color: !category ? "var(--yellow)" : "var(--black)",
                boxShadow: "3px 3px 0 var(--black)",
                display: "inline-block",
              }}
            >
              All
            </Link>
            {categories.map((name) => (
              <Link
                key={name}
                href={`/menu?category=${encodeURIComponent(name)}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                style={{
                  padding: "8px 18px",
                  fontFamily: "var(--font-body)",
                  fontSize: "12px", fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  border: "2px solid var(--black)",
                  background: category === name ? "var(--black)" : "transparent",
                  color: category === name ? "var(--yellow)" : "var(--black)",
                  boxShadow: "3px 3px 0 var(--black)",
                  display: "inline-block",
                }}
              >
                {name}
              </Link>
            ))}
          </nav>

          <form action="/menu" style={{ display: "flex", gap: "8px" }}>
            {category && <input type="hidden" name="category" value={category} />}
            <label htmlFor="menu-search" className="sr-only">Search menu</label>
            <input
              id="menu-search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search the menu…"
              style={{
                padding: "10px 16px",
                border: "2px solid var(--black)",
                background: "var(--white)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                minWidth: "220px",
                boxShadow: "3px 3px 0 var(--black)",
                outline: "none",
              }}
            />
            <button
              style={{
                padding: "10px 20px",
                border: "2px solid var(--black)",
                background: "var(--green)",
                color: "var(--white)",
                fontFamily: "var(--font-body)",
                fontSize: "13px", fontWeight: 800, letterSpacing: "0.08em",
                textTransform: "uppercase",
                boxShadow: "3px 3px 0 var(--black)",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div style={{
            padding: "60px",
            border: "3px solid var(--black)",
            background: "var(--white)",
            textAlign: "center",
            color: "var(--muted)",
            boxShadow: "5px 5px 0 var(--black)",
            fontWeight: 600,
          }}>
            Nothing matches that search. Try another item or category.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            border: "2px solid var(--black)",
            gap: 0,
          }}>
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/menu/${item.slug}`}
                className="menu-item-card"
                style={{
                  display: "flex", flexDirection: "column",
                  borderRight: "2px solid var(--black)",
                  borderBottom: "2px solid var(--black)",
                  background: "var(--white)",
                  textDecoration: "none",
                  color: "inherit",
                  position: "relative",
                  transition: "background 0.15s",
                }}
              >
                {item.soldOutToday && (
                  <span style={{
                    position: "absolute", top: "12px", right: "12px", zIndex: 1,
                    background: "var(--red)", color: "var(--white)",
                    fontSize: "9px", fontWeight: 800, letterSpacing: "0.12em",
                    textTransform: "uppercase", padding: "4px 8px",
                    border: "1.5px solid var(--black)", boxShadow: "2px 2px 0 var(--black)",
                  }}>
                    Sold Out Today
                  </span>
                )}
                {item.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      height: "180px", width: "100%", objectFit: "cover",
                      borderBottom: "2px solid var(--black)",
                    }}
                  />
                ) : (
                  <div style={{
                    height: "180px", width: "100%",
                    background: "#e4d5b7",
                    borderBottom: "2px solid var(--black)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "rgba(23,23,23,0.35)",
                  }}>
                    Photo Placeholder
                  </div>
                )}
                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <p style={{
                    fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: "var(--red)", marginBottom: "8px",
                  }}>
                    {item.category}
                  </p>
                  <h2 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px", color: "var(--black)", lineHeight: 1.0,
                    marginBottom: "8px",
                  }}>
                    {item.name}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.55, flex: 1 }}>
                    {item.description}
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: "16px", paddingTop: "14px", borderTop: "2px solid var(--black)",
                  }}>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "26px", color: "var(--black)" }}>
                      ₹{(item.pricePaise / 100).toFixed(0)}
                    </strong>
                    <span style={{
                      fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      border: "1.5px solid var(--black)",
                      color: item.dietary === "VEG" ? "var(--green)" : "var(--red)",
                    }}>
                      {item.dietary === "VEG" ? "Veg" : "Non-veg"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: "48px", display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/" className="btn btn-outline">← Back to Home</Link>
          <Link href="/cart" className="btn btn-primary">View Cart →</Link>
        </div>
      </div>
    </main>
  );
}
