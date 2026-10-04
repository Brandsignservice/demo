import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Sparkles,
  Send,
  Check,
  ChevronDown,
  Menu,
  Truck,
  Heart,
  SlidersHorizontal,
  MoveRight,
  Leaf,
  RotateCcw,
} from "lucide-react";
import { products, money, shipping } from "./catalog";
import "./style.css";
const initial = {
  role: "ai",
  text: "Welcome to a more considered home. I’m Lumora, your personal shopping assistant. Tell me a little about your space, or choose a starting point below.",
};
function App() {
  const [category, setCategory] = useState("All pieces"),
    [query, setQuery] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [sort, setSort] = useState("Featured"),
    [limit, setLimit] = useState(4),
    [selected, setSelected] = useState(null),
    [selectedColor, setSelectedColor] = useState(""),
    [cart, setCart] = useState([]),
    [cartOpen, setCartOpen] = useState(false),
    [chat, setChat] = useState(false),
    [messages, setMessages] = useState([initial]),
    [input, setInput] = useState(""),
    [typing, setTyping] = useState(false),
    [saved, setSaved] = useState([]),
    [toast, setToast] = useState(""),
    [leadSent, setLeadSent] = useState(false);
  const context = useRef({ ids: [1, 6], budget: 1500, category: "Sofas" }),
    bottom = useRef(null),
    timer = useRef(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, chat]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setChat(false);
        setSelected(null);
        setCartOpen(false);
        setSearchOpen(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  function notify(text) {
    setToast(text);
    setTimeout(() => setToast(""), 3000);
  }
  function browse(cat = "All pieces") {
    setCategory(cat);
    setLimit(12);
    setMenu(false);
    document
      .querySelector("#collection")
      .scrollIntoView({ behavior: "smooth" });
  }
  function detail(p) {
    setSelected(p);
    setSelectedColor(p.colors[0]);
  }
  function add(p, color = p.colors[0]) {
    setCart((c) => {
      const exists = c.find((x) => x.id === p.id && x.color === color);
      return exists
        ? c.map((x) => (x === exists ? { ...x, qty: x.qty + 1 } : x))
        : [...c, { ...p, color, qty: 1 }];
    });
    notify(`${p.name} added to your bag`);
  }
  function respond(raw) {
    const t = raw.toLowerCase(),
      ctx = context.current;
    let result = { role: "ai" };
    const named = products.filter((p) => t.includes(p.name.toLowerCase()));
    if (named.length) ctx.ids = named.map((p) => p.id);
    if (/designer|human|person|contact|expert/.test(t))
      return {
        ...result,
        text: "Some things deserve a personal touch. Tell our design team a little about your project. This demo captures your enquiry locally — no message is sent.",
        type: "lead",
      };
    if (/shipping|delivery|return|refund|arrive/.test(t))
      return { ...result, text: shipping };
    if (/compare|difference/.test(t)) {
      if (ctx.ids.length < 2) ctx.ids = [ctx.ids[0] || 1, 6];
      return {
        ...result,
        text: "A little clarity, side by side. Compare the dimensions, materials, and price below. Leave about 30–36 inches for comfortable walkways, and check your doorway clearance before choosing.",
        type: "compare",
        ids: ctx.ids.slice(0, 3),
      };
    }
    if (/match|pair|coffee table|go with/.test(t)) {
      ctx.ids = [3, 7, 11];
      return {
        ...result,
        text: "A thoughtfully layered space starts with pieces that speak the same language. Forma’s warm oak balances soft upholstery; add Solstice for a reading corner, or Ora for a quiet finishing touch.",
        ids: ctx.ids,
      };
    }
    if (
      /material|dimension|measure|color|colour|size of|tell me about/.test(t) ||
      named.length
    ) {
      const p = products.find((p) => p.id === ctx.ids[0]) || products[0];
      return {
        ...result,
        text: `${p.name}: ${p.description}\n\nMaterials: ${p.materials}.\nDimensions: ${p.dimensions}.\nColors: ${p.colors.join(", ")}.\n\n${money(p.price)}. Would you like delivery information or a matching piece?`,
        ids: [p.id],
      };
    }
    if (/budget/.test(t) && !/[0-9]/.test(t))
      return {
        ...result,
        text: "Beautiful design, within your comfort zone. What’s your maximum budget, and which room are you furnishing?",
        options: [
          "Living room under $1,500",
          "Dining under $1,200",
          "Decor under $600",
        ],
      };
    const room = t.match(/(\d+(?:\.\d+)?)\s*(?:x|×|by)\s*(\d+(?:\.\d+)?)/);
    if (room) {
      const meters = /metre|meter|\bm\b/.test(t);
      const shortSide =
        Math.min(Number(room[1]), Number(room[2])) * (meters ? 3.28084 : 1);
      ctx.small = shortSide <= 12;
    }
    if (/small|compact/.test(t)) ctx.small = true;
    if (/spacious|large/.test(t)) ctx.small = false;
    const amount = t.match(/(?:under|below|budget|up to|max|\$)\s*\$?([\d,]+)/);
    if (amount) ctx.budget = Number(amount[1].replaceAll(",", ""));
    if (/sofa|living|loveseat/.test(t)) ctx.category = "Sofas";
    if (/dining/.test(t)) ctx.category = "Dining";
    if (/bedroom|bed/.test(t)) ctx.category = "Bedroom";
    if (/decor/.test(t)) ctx.category = "Decor";
    if (/find my sofa/.test(t))
      return {
        ...result,
        text: "Let’s find your perfect place to land. How big is your living room, and what budget feels right?",
        options: ["Small room, under $1,500", "Spacious room, under $2,000"],
      };
    if (
      /small|modern|scandi|minimal|organic|sofa|budget|under|room|\$|feet|meter|metre|\d+\s*x\s*\d+/.test(
        t,
      )
    ) {
      let list = products.filter(
        (p) => p.category === ctx.category && p.price <= ctx.budget,
      );
      if (ctx.small && ctx.category === "Sofas")
        list = list.filter((p) => p.width <= 80);
      if (/scandi/.test(t))
        list.sort(
          (a, b) =>
            Number(b.style === "Scandinavian") -
            Number(a.style === "Scandinavian"),
        );
      ctx.ids = list.slice(0, 3).map((p) => p.id);
      if (!list.length)
        return {
          ...result,
          text: `I don’t have ${ctx.category.toLowerCase()} under ${money(ctx.budget)} in this collection. Would you like to try a higher budget or explore decor?`,
          options: ["Sofas under $1,500", "Decor under $600"],
        };
      return {
        ...result,
        text: `Here are my picks for ${ctx.category.toLowerCase()} under ${money(ctx.budget)}.${ctx.small && ctx.category === "Sofas" ? " These sofas are under 80 inches wide. Allow about 30–36 inches for walkways and check door widths before choosing." : ""} ${/modern|scandi|minimal|organic/.test(t) ? "Warm textures and clean lines keep the look modern and inviting." : "Do you lean toward clean modern lines or a softer Scandinavian feel?"}`,
        ids: ctx.ids,
        options: ["Compare them", "What coffee table matches this?"],
      };
    }
    return {
      ...result,
      text: "I can help you discover our 12-piece collection, compare designs, check dimensions, or plan a room around your budget. What are you looking for?",
      options: ["Find My Sofa", "Shop by Budget", "Talk to a Designer"],
    };
  }
  function send(text) {
    if (!text.trim() || typing) return;
    setChat(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setTyping(true);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, respond(text)]);
      setTyping(false);
    }, 650);
  }
  function scenario(text) {
    setChat(true);
    send(text);
  }
  let visible = products.filter(
    (p) =>
      (category === "All pieces" || p.category === category) &&
      `${p.name} ${p.description} ${p.materials} ${p.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === "Price: low to high") visible.sort((a, b) => a.price - b.price);
  if (sort === "Price: high to low") visible.sort((a, b) => b.price - a.price);
  const icons = [
    <ShoppingBag size={20} />,
    <SlidersHorizontal size={20} />,
    <MoveRight size={20} />,
    <Sparkles size={20} />,
  ];
  return (
    <>
      <div className="announcement">
        A considered home starts with a little inspiration.{" "}
        <span>
          Meet your personal AI shopping assistant <ArrowUpRight size={12} />
        </span>
        <small>AN ARXEN AI DEMO</small>
      </div>
      <header>
        <a className="brand" href="#" aria-label="Lumora Home home">
          LUMORA<span>HOME</span>
        </a>
        <nav>
          {["Home", "Shop", "Sofas", "Dining", "Bedroom", "Decor"].map((n) => (
            <button
              key={n}
              className={n === "Home" ? "active" : ""}
              onClick={() =>
                n === "Home"
                  ? window.scrollTo({ top: 0, behavior: "smooth" })
                  : browse(n === "Shop" ? "All pieces" : n)
              }
            >
              {n}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Search products"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={20} />
          </button>
          <button
            className="icon-button bag"
            aria-label={`Shopping bag, ${cart.reduce((s, p) => s + p.qty, 0)} items`}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={20} />
            {cart.length > 0 && <b>{cart.reduce((s, p) => s + p.qty, 0)}</b>}
          </button>
          <button className="ai-nav" onClick={() => setChat(true)}>
            <Sparkles size={15} /> Ask Lumora AI
          </button>
          <button
            className="mobile-menu icon-button"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle menu"
          >
            <Menu />
          </button>
        </div>
      </header>
      {menu && (
        <div className="mobile-nav">
          {["All pieces", "Sofas", "Dining", "Bedroom", "Decor"].map((n) => (
            <button onClick={() => browse(n)} key={n}>
              {n}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      )}
      {searchOpen && (
        <div className="search-bar">
          <Search size={20} />
          <input
            autoFocus
            placeholder="Find a piece, material, or collection…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(12);
              document
                .querySelector("#collection")
                .scrollIntoView({ behavior: "smooth" });
            }}
          />
          <button
            className="icon-button"
            onClick={() => {
              setSearchOpen(false);
              setQuery("");
            }}
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>
      )}
      <main>
        <section className="hero">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=90"
            alt="Warm, sunlit living room with natural textures and thoughtfully arranged contemporary furniture"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow light">
              <span /> THOUGHTFULLY DESIGNED. INTUITIVELY DISCOVERED.
            </div>
            <h1>
              Find furniture that fits
              <br />
              your space, style,
              <br />
              and life.
            </h1>
            <p>
              Tell us what you need and our AI Shopping Assistant
              <br className="desktop" /> will help you find the right pieces.
            </p>
            <div className="hero-buttons">
              <button
                className="button cream"
                onClick={() => scenario("Find My Sofa")}
              >
                <Sparkles size={17} /> Find My Perfect Piece{" "}
                <ArrowUpRight size={17} />
              </button>
              <button className="button glass" onClick={() => browse()}>
                Shop Collection <ArrowRight size={17} />
              </button>
            </div>
            <div className="hero-note">
              <span className="tiny-star">✦</span> YOUR VISION. OUR COLLECTION.
              A LITTLE AI MAGIC.
            </div>
          </div>
          <div
            className="hero-assistant"
            onClick={() => setChat(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setChat(true);
            }}
          >
            <div className="preview-heading">
              <span className="spark-square">
                <Sparkles size={19} />
              </span>
              <div>
                <strong>A little guidance. A perfect fit.</strong>
                <small>
                  <i /> Lumora AI · Your personal shopping assistant
                </small>
              </div>
              <ArrowUpRight size={18} />
            </div>
            <div className="sample-question">
              “A modern sofa for my small living room,
              <br />
              under $1,500.”
            </div>
            <div className="sample-answer">
              <Sparkles size={16} />
              <p>
                I have just the piece in mind.
                <br />
                Meet Cloudline — made for your kind of space.
              </p>
            </div>
            <div className="preview-product">
              <img src={products[0].image} alt="Cloudline sage sofa" />
              <div>
                <strong>Cloudline Sofa</strong>
                <small>Compact comfort. Effortless style.</small>
                <b>$1,299</b>
              </div>
              <span className="circle-arrow">
                <ArrowUpRight size={18} />
              </span>
            </div>
            <div className="preview-footer">
              Less searching. More feeling at home. <span>✦</span>
            </div>
          </div>
          <div className="hero-bottom">
            THE ART OF FEELING AT HOME{" "}
            <span>
              01 <i /> 03
            </span>
          </div>
        </section>
        <div className="trust-strip">
          <span>
            <Leaf />
            Thoughtful design, lasting quality
          </span>
          <i />
          <span>
            <Truck />
            Complimentary shipping over $1,000
          </span>
          <i />
          <span>
            <RotateCcw />
            30-day considered returns
          </span>
          <i />
          <span>
            <Sparkles />
            Personal guidance, powered by AI
          </span>
        </div>
        <section className="discovery" id="assistant">
          <div className="discovery-intro">
            <div className="eyebrow">A MORE PERSONAL WAY TO SHOP</div>
            <h2>
              Your home is personal.
              <br />
              Shopping for it should be, too.
            </h2>
            <p>
              No endless scrolling. No second-guessing.
              <br />
              Just a little conversation, and pieces that feel like you.
            </p>
          </div>
          <div className="scenarios">
            {[
              {
                title: "Find My Sofa",
                text: "Your space. Your style. Your perfect seat.",
              },
              {
                title: "Shop by Budget",
                text: "Great design, in your comfort zone.",
              },
              {
                title: "Compare Products",
                text: "The details that make the difference.",
              },
              {
                title: "Talk to a Designer",
                text: "A human touch for your next chapter.",
              },
            ].map((s, i) => (
              <button
                className="scenario"
                key={s.title}
                onClick={() => scenario(s.title)}
              >
                <span className="scenario-icon">{icons[i]}</span>
                <div>
                  <strong>{s.title}</strong>
                  <small>{s.text}</small>
                </div>
                <ArrowUpRight size={19} />
              </button>
            ))}
            <div className="scenario-foot">
              <span className="live-dot" />
              Real recommendations. From our collection. In seconds.
            </div>
          </div>
        </section>
        <section className="collection" id="collection">
          <div className="collection-heading">
            <div>
              <div className="eyebrow">
                CONSIDERED PIECES. ENDLESS POSSIBILITIES.
              </div>
              <h2>Meet your next favorite.</h2>
            </div>
            <button
              className="text-link"
              onClick={() => {
                setLimit(12);
                setCategory("All pieces");
                setQuery("");
              }}
            >
              Explore the collection <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="collection-controls">
            <div className="tabs">
              {["All pieces", "Sofas", "Dining", "Bedroom", "Decor"].map(
                (c) => (
                  <button
                    key={c}
                    className={category === c ? "selected" : ""}
                    onClick={() => {
                      setCategory(c);
                      setLimit(12);
                    }}
                  >
                    {c}
                  </button>
                ),
              )}
            </div>
            <label className="sort">
              Sort by:{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Featured</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </div>
          <div className="product-grid">
            {visible.slice(0, limit).map((p) => (
              <article className="product" key={p.id}>
                <div className="product-image">
                  <button
                    className="product-photo"
                    onClick={() => detail(p)}
                    aria-label={`View ${p.name}`}
                  >
                    <img src={p.image} alt={p.name} loading="lazy" />
                  </button>
                  <span className="product-tag">{p.tag}</span>
                  <button
                    className={`favorite ${saved.includes(p.id) ? "is-saved" : ""}`}
                    aria-label={`${saved.includes(p.id) ? "Unsave" : "Save"} ${p.name}`}
                    onClick={() => {
                      setSaved((s) =>
                        s.includes(p.id)
                          ? s.filter((id) => id !== p.id)
                          : [...s, p.id],
                      );
                      notify(
                        saved.includes(p.id)
                          ? "Removed from favorites"
                          : `${p.name} saved to favorites`,
                      );
                    }}
                  >
                    <Heart
                      size={16}
                      fill={saved.includes(p.id) ? "currentColor" : "none"}
                    />
                  </button>
                  <button className="quick-add" onClick={() => add(p)}>
                    <Plus size={16} /> Add to bag
                  </button>
                </div>
                <div className="product-title">
                  <button onClick={() => detail(p)}>{p.name}</button>
                  <span>{money(p.price)}</span>
                </div>
                <div className="product-meta">
                  <span>{p.materials.split(",")[0]}</span>
                  <div className="swatches">
                    {p.colors.map((c, i) => (
                      <i
                        key={c}
                        title={c}
                        style={{
                          background:
                            c === "Sage"
                              ? "#89947c"
                              : c.includes("Walnut") || c === "Charcoal"
                                ? "#66594b"
                                : ["#d7cbb7", "#b3a58b", "#787570"][i % 3],
                        }}
                      />
                    ))}
                    <small>+{p.colors.length}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {visible.length === 0 && (
            <div className="empty">
              No pieces found. Try “sofa”, “oak”, or a different collection.
              <button
                className="button dark"
                onClick={() => {
                  setQuery("");
                  setCategory("All pieces");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
          {visible.length > limit && (
            <button className="more-button" onClick={() => setLimit(12)}>
              Discover all {products.length} pieces <ArrowRight size={16} />
            </button>
          )}
        </section>
        <section className="closing">
          <div className="closing-art">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"
              alt="Calm, modern interior in warm neutral tones"
              loading="lazy"
            />
            <span>ROOM TO BE YOU.</span>
          </div>
          <div className="closing-copy">
            <div className="eyebrow">GOOD DESIGN STARTS WITH YOU</div>
            <h2>
              A beautiful home.
              <br />A simpler way to find it.
            </h2>
            <p>
              From your first idea to the finishing touch, Lumora AI connects
              your inspiration to pieces you’ll love living with.
            </p>
            <button className="button dark" onClick={() => setChat(true)}>
              <Sparkles size={17} /> Let’s find your style{" "}
              <ArrowUpRight size={17} />
            </button>
            <small>Always here. Always helpful. Never pushy.</small>
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a className="brand" href="#">
            LUMORA<span>HOME</span>
          </a>
          <p>Considered living. Effortlessly discovered.</p>
          <button onClick={() => scenario("Talk to a Designer")}>
            Let’s make it feel like home <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LUMORA HOME</span>
          <span>
            LUMORA HOME is a fictional demonstration brand created by ARXEN AI.
          </span>
          <span>
            AI Shopping Assistant powered by <b>ARXEN AI ↗</b>
          </span>
        </div>
      </footer>
      {!chat && (
        <button className="floating-ai" onClick={() => setChat(true)}>
          <Sparkles size={20} />
          <span>
            Ask Lumora AI<small>Your home, thoughtfully matched.</small>
          </span>
          <span className="float-dot" />
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              onClick={() => setSelected(null)}
              aria-label="Close product"
            >
              <X />
            </button>
            <img
              className="modal-product-img"
              src={selected.image}
              alt={selected.name}
            />
            <div className="product-details">
              <div className="eyebrow">
                {selected.category} / {selected.style}
              </div>
              <h2>{selected.name}</h2>
              <h3>{money(selected.price)}</h3>
              <p>{selected.description}</p>
              <dl>
                <dt>Materials</dt>
                <dd>{selected.materials}</dd>
                <dt>Dimensions</dt>
                <dd>{selected.dimensions}</dd>
              </dl>
              <label>
                Color
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  {selected.colors.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <button
                className="button dark full"
                onClick={() => add(selected, selectedColor)}
              >
                Add to bag <Plus size={17} />
              </button>
              <button
                className="button outline full"
                onClick={() => {
                  setSelected(null);
                  scenario(`Tell me about ${selected.name}`);
                }}
              >
                <Sparkles size={16} /> Ask Lumora about this piece
              </button>
              <details>
                <summary>Delivery & returns</summary>
                <p>{shipping}</p>
              </details>
              <small>
                Fictional product. Imagery is illustrative. No real purchases.
              </small>
            </div>
          </section>
        </div>
      )}
      {cartOpen && (
        <div className="modal-backdrop" onClick={() => setCartOpen(false)}>
          <section
            className="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-title">
              <h2>Your considered collection</h2>
              <button
                className="icon-button"
                onClick={() => setCartOpen(false)}
                aria-label="Close bag"
              >
                <X />
              </button>
            </div>
            <p className="muted">A demo shopping bag. No payment required.</p>
            {cart.length === 0 ? (
              <div className="empty">
                <ShoppingBag size={40} />
                <h3>A little room for inspiration.</h3>
                <p>Your bag is waiting for something beautiful.</p>
                <button
                  className="button dark"
                  onClick={() => {
                    setCartOpen(false);
                    browse();
                  }}
                >
                  Explore the collection
                </button>
              </div>
            ) : (
              <>
                {cart.map((p, i) => (
                  <div className="cart-item" key={p.id + p.color}>
                    <img src={p.image} alt={p.name} />
                    <div>
                      <strong>{p.name}</strong>
                      <small>
                        {p.color} · {money(p.price)}
                      </small>
                      <div className="quantity">
                        <button
                          aria-label={`Decrease ${p.name}`}
                          onClick={() =>
                            setCart((c) =>
                              c
                                .map((x, j) =>
                                  i === j ? { ...x, qty: x.qty - 1 } : x,
                                )
                                .filter((x) => x.qty > 0),
                            )
                          }
                        >
                          <Minus size={13} />
                        </button>
                        {p.qty}
                        <button
                          aria-label={`Increase ${p.name}`}
                          onClick={() =>
                            setCart((c) =>
                              c.map((x, j) =>
                                i === j ? { ...x, qty: x.qty + 1 } : x,
                              ),
                            )
                          }
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <b>{money(p.price * p.qty)}</b>
                  </div>
                ))}
                <div className="cart-total">
                  <span>Subtotal</span>
                  <b>{money(cart.reduce((s, p) => s + p.price * p.qty, 0))}</b>
                </div>
                <p className="muted">
                  {cart.reduce((s, p) => s + p.price * p.qty, 0) >= 1000
                    ? "Complimentary demo delivery"
                    : "Demo delivery: $79"}{" "}
                  · Taxes not calculated
                </p>
                <button
                  className="button dark full"
                  onClick={() => {
                    setCartOpen(false);
                    scenario(
                      "I want to speak with a designer about my shopping bag",
                    );
                  }}
                >
                  Plan these pieces with a designer <ArrowRight size={16} />
                </button>
                <p className="muted">
                  This is a sales demonstration. Checkout is not available.
                </p>
              </>
            )}
          </section>
        </div>
      )}
      {chat && (
        <section
          className="chat-panel"
          role="dialog"
          aria-label="Lumora AI shopping assistant"
        >
          <div className="chat-header">
            <span className="spark-square">
              <Sparkles size={22} />
            </span>
            <div>
              <strong>Lumora AI</strong>
              <small>
                <i />
                Your personal shopping assistant
              </small>
            </div>
            <button
              className="icon-button"
              title="Start a new conversation"
              aria-label="Reset conversation"
              onClick={() => {
                clearTimeout(timer.current);
                setTyping(false);
                setMessages([initial]);
                setLeadSent(false);
                context.current = {
                  ids: [1, 6],
                  budget: 1500,
                  category: "Sofas",
                };
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="icon-button"
              onClick={() => setChat(false)}
              aria-label="Close assistant"
            >
              <X size={19} />
            </button>
          </div>
          <div className="chat-demo">
            <span className="live-dot" /> INTERACTIVE DEMO · NO AI API REQUIRED
          </div>
          <div className="messages" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <div className="message-text">
                  {m.role === "ai" && <span className="message-spark">✦</span>}
                  {m.text}
                </div>
                {m.ids && m.type !== "compare" && (
                  <div className="chat-products">
                    {m.ids.map((id) => {
                      const p = products.find((x) => x.id === id);
                      return (
                        <button
                          key={id}
                          className="chat-product"
                          onClick={() => detail(p)}
                        >
                          <img src={p.image} alt={p.name} />
                          <span>
                            <strong>{p.name}</strong>
                            <small>{p.dimensions}</small>
                            <b>{money(p.price)}</b>
                          </span>
                          <ArrowUpRight size={15} />
                        </button>
                      );
                    })}
                  </div>
                )}
                {m.type === "compare" && (
                  <div className="comparison">
                    <table>
                      <thead>
                        <tr>
                          <th>Detail</th>
                          {m.ids.map((id) => (
                            <th key={id}>
                              {products.find((p) => p.id === id).name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {["Price", "Dimensions", "Materials", "Style"].map(
                          (label) => (
                            <tr key={label}>
                              <td>{label}</td>
                              {m.ids.map((id) => {
                                const p = products.find((p) => p.id === id);
                                return (
                                  <td key={id}>
                                    {label === "Price"
                                      ? money(p.price)
                                      : p[label.toLowerCase()]}
                                  </td>
                                );
                              })}
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                {m.type === "lead" &&
                  (leadSent ? (
                    <div className="lead-success">
                      <Check size={20} />
                      <strong>Your demo enquiry is saved.</strong>
                      <p>
                        In a connected deployment, this would be routed to the
                        design team. No email has been sent.
                      </p>
                    </div>
                  ) : (
                    <form
                      className="lead-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = Object.fromEntries(
                          new FormData(e.currentTarget),
                        );
                        try {
                          sessionStorage.setItem(
                            "lumora-demo-enquiry",
                            JSON.stringify({
                              ...data,
                              createdAt: new Date().toISOString(),
                            }),
                          );
                          setLeadSent(true);
                        } catch {
                          notify(
                            "Storage is unavailable. Please enable session storage to save your demo enquiry.",
                          );
                        }
                      }}
                    >
                      <label>
                        Your name
                        <input
                          name="name"
                          placeholder="Alex Morgan"
                          required
                          maxLength={100}
                        />
                      </label>
                      <label>
                        Email address
                        <input
                          type="email"
                          name="email"
                          placeholder="alex@example.com"
                          required
                          maxLength={200}
                        />
                      </label>
                      <label>
                        Tell us about your space
                        <textarea
                          name="message"
                          placeholder="A new home, a fresh start, a room to rethink…"
                          required
                          maxLength={2000}
                        />
                      </label>
                      <label className="consent">
                        <input type="checkbox" required />I understand this
                        enquiry stays in this browser session and is not sent.
                      </label>
                      <button className="button dark full" type="submit">
                        Save demo enquiry <ArrowUpRight size={15} />
                      </button>
                    </form>
                  ))}
                {m.options && (
                  <div className="chat-options">
                    {m.options.map((o) => (
                      <button key={o} disabled={typing} onClick={() => send(o)}>
                        {o}
                        <ArrowUpRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
                {i === 0 && (
                  <div className="chat-options">
                    {[
                      "Find My Sofa",
                      "Shop by Budget",
                      "Compare Products",
                      "Talk to a Designer",
                    ].map((o) => (
                      <button key={o} disabled={typing} onClick={() => send(o)}>
                        {o}
                        <ArrowUpRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="typing">
                ✦ <span />
                <span />
                <span />
              </div>
            )}
            <div ref={bottom} />
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              aria-label="Your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me what feels like home…"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send message"
            >
              <ArrowUpRight size={21} />
            </button>
          </form>
          <div className="chat-powered">
            Thoughtfully powered by <b>ARXEN AI</b> · Local demo
          </div>
        </section>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
