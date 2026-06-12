'use strict'


const products = [
    {
      id: "fudge-chocolate",
      name: "Fudge de Chocolate",
      subtitle: "Tradicional",
      description: "Fudge cremoso de chocolate com nozes caramelizadas, derretendo na boca.",
      category: "Tradicional",
      flavors: ["Chocolate", "Morango", "Avelã"],
      sizes: [
        { key: "P", label: "P · 30g", stock: 13 },
        { key: "M", label: "M · 50g", stock: 9  },
        { key: "G", label: "G · 75g", stock: 5  },
      ],
      ingredients: "Leite condensado, açúcar, chocolate meio amargo, manteiga, nozes caramelizadas e essência de baunilha.",
      images: [
        "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
        "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80",
        "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80",
        "https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=800&q=80",
        "https://images.unsplash.com/photo-1559054663-e8d23213f55c?w=800&q=80",
      ],
    },
    {
      id: "brigadeiro-gourmet",
      name: "Brigadeiro Gourmet",
      subtitle: "Especial",
      description: "Brigadeiro artesanal com cobertura de granulado belga e recheio cremoso.",
      category: "Especial",
      flavors: ["Chocolate Belga", "Pistache", "Maracujá"],
      sizes: [
        { key: "P", label: "P · 20g", stock: 20 },
        { key: "M", label: "M · 40g", stock: 12 },
        { key: "G", label: "G · 60g", stock: 6  },
      ],
      ingredients: "Leite condensado, chocolate belga 70%, creme de leite, manteiga sem sal e granulado belga.",
      images: [
        "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80",
        "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80",
        "https://images.unsplash.com/photo-1559054663-e8d23213f55c?w=800&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      ],
    },
  ];
   
   
  // ──────────────────────────────────────────────────────────
  // 2. ESTADO DA APLICAÇÃO
  // ──────────────────────────────────────────────────────────
   
  const state = {
    // página de produto: qual tamanho está selecionado e qual imagem
    selectedSize: null,   // key do tamanho ativo
    activeImage: 0,       // índice da imagem principal
  };
   
  function resetProductState() {
    state.selectedSize = null;
    state.activeImage  = 0;
  }
   
   
  // ──────────────────────────────────────────────────────────
  // 3. ROTEADOR  (hash-based: #/catalogo | #/produto/fudge-chocolate)
  // ──────────────────────────────────────────────────────────
   
  const routes = {
    "/catalogo":  renderCatalog,
    "/produto/:id": renderProduct,
  };
   
  function navigate(path) {
    window.location.hash = path;
  }
   
  function router() {
    const hash   = window.location.hash.replace("#", "") || "/catalogo";
    const app    = document.getElementById("app");
   
    // tenta casar com rotas com parâmetro
    for (const [pattern, handler] of Object.entries(routes)) {
      const regex  = new RegExp("^" + pattern.replace(/:([^/]+)/g, "([^/]+)") + "$");
      const match  = hash.match(regex);
      if (match) {
        const paramNames = [...pattern.matchAll(/:([^/]+)/g)].map(m => m[1]);
        const params     = Object.fromEntries(paramNames.map((k, i) => [k, match[i + 1]]));
        handler(app, params);
        return;
      }
    }
   
    // fallback
    renderCatalog(app, {});
  }
   
  window.addEventListener("hashchange", router);
  window.addEventListener("DOMContentLoaded", () => {
    buildFixedShell();
    router();
  });
   
   
  // ──────────────────────────────────────────────────────────
  // 4. SHELL FIXO (header + footer — montado uma vez)
  // ──────────────────────────────────────────────────────────
   
  function buildFixedShell() {
    // Header
    const header = document.querySelector("header");
    if (header) {
      header.querySelector(".header-left").addEventListener("click", e => {
        e.preventDefault();
        navigate("/catalogo");
      });
      header.querySelector(".logo").addEventListener("click", e => {
        e.preventDefault();
        navigate("/catalogo");
      });
    }
  }
   
   
  // ──────────────────────────────────────────────────────────
  // 5. PÁGINA: CATÁLOGO
  // ──────────────────────────────────────────────────────────
   
  function renderCatalog(container) {
    document.title = "HoneyDukes – Catálogo";
   
    // Atualiza breadcrumb
    updateBreadcrumb([
      { label: "Catálogo", href: null },
    ]);
   
    container.innerHTML = `
      <div class="catalog-grid">
        ${products.map(p => `
          <article class="product-card" data-id="${p.id}">
            <div class="card-img-wrap">
              <img src="${p.images[0]}" alt="${p.name}" loading="lazy" />
            </div>
            <div class="card-body">
              <span class="card-category">${p.category}</span>
              <h2 class="card-name">${p.name}</h2>
              <p class="card-desc">${p.description}</p>
              <div class="card-flavors">
                ${p.flavors.map(f => `<span class="flavor-tag">${f}</span>`).join("")}
              </div>
              <button class="card-btn" data-id="${p.id}">Ver produto</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
   
    // eventos dos cards
    container.querySelectorAll("[data-id]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        resetProductState();
        navigate(`/produto/${id}`);
      });
    });
  }
   
   
  // ──────────────────────────────────────────────────────────
  // 6. PÁGINA: PRODUTO
  // ──────────────────────────────────────────────────────────
   
  function renderProduct(container, { id }) {
    const product = products.find(p => p.id === id);
    if (!product) { navigate("/catalogo"); return; }
   
    document.title = `HoneyDukes – ${product.name}`;
   
    // Tamanho inicial
    if (!state.selectedSize) state.selectedSize = product.sizes[0].key;
    const currentSize = product.sizes.find(s => s.key === state.selectedSize);
   
    updateBreadcrumb([
      { label: "Catálogo",    href: "#/catalogo" },
      { label: product.name,  href: null },
    ]);
   
    container.innerHTML = `
      <section class="gallery" aria-label="Galeria do produto">
        <div class="gallery-main">
          <img
            id="mainImage"
            src="${product.images[state.activeImage]}"
            alt="${product.name}"
          />
        </div>
        <div class="gallery-thumbs" role="list">
          ${product.images.map((url, i) => `
            <button
              role="listitem"
              aria-label="Ver imagem ${i + 1}"
              class="thumb-btn ${i === state.activeImage ? "active" : ""}"
              data-index="${i}"
            >
              <img src="${url.replace("w=800", "w=200")}" alt="Miniatura ${i + 1}" loading="lazy" />
            </button>
          `).join("")}
        </div>
      </section>
   
      <section class="product-info">
        <div>
          <h1 class="product-title">${product.name}</h1>
          <p class="product-subtitle">${product.subtitle}</p>
          <div class="divider-ornament" aria-hidden="true">— ✦ —</div>
        </div>
   
        <p class="product-desc">${product.description}</p>
   
        <div class="meta-grid">
          <div class="meta-row">
            <span class="meta-label">Quantidade:</span>
            <span class="meta-value" id="quantity">${currentSize.stock}</span>
          </div>
   
          <div class="meta-row">
            <span class="meta-label">Tamanho:</span>
            <div class="size-options" role="group" aria-label="Tamanho">
              ${product.sizes.map(s => `
                <button
                  class="size-btn ${s.key === state.selectedSize ? "active" : ""}"
                  data-size="${s.key}"
                >${s.label}</button>
              `).join("")}
            </div>
          </div>
   
          <div class="meta-row">
            <span class="meta-label">Categoria:</span>
            <span class="meta-value">${product.category}</span>
          </div>
   
          <div class="meta-row">
            <span class="meta-label">Sabores:</span>
            <div class="flavor-tags">
              ${product.flavors.map(f => `<span class="flavor-tag">${f}</span>`).join("")}
            </div>
          </div>
        </div>
   
        <div class="ingredients-section">
          <h2 class="ingredients-title">Ingredientes</h2>
          <p class="ingredients-text">${product.ingredients}</p>
        </div>
      </section>
    `;
   
    // ── Thumbnails ──
    container.querySelectorAll(".thumb-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index);
        state.activeImage = idx;
        document.getElementById("mainImage").src = product.images[idx];
        container.querySelectorAll(".thumb-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
   
    // ── Tamanhos ──
    container.querySelectorAll(".size-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.selectedSize = btn.dataset.size;
        const size = product.sizes.find(s => s.key === state.selectedSize);
        document.getElementById("quantity").textContent = size.stock;
        container.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });
  }
   
   
  // ──────────────────────────────────────────────────────────
  // 7. UTILITÁRIO: BREADCRUMB DINÂMICO
  // ──────────────────────────────────────────────────────────
   
  function updateBreadcrumb(items) {
    const nav = document.querySelector(".breadcrumb");
    if (!nav) return;
   
    if (items.length === 1 && !items[0].href) {
      // Estamos no catálogo: esconde o breadcrumb
      nav.style.visibility = "hidden";
      return;
    }
   
    nav.style.visibility = "visible";
    nav.innerHTML = items.map((item, i) => {
      if (item.href) {
        return `<a href="${item.href}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          ${item.label}
        </a>`;
      }
      return `<span class="breadcrumb-current">${item.label}</span>`;
    }).join(`<span class="breadcrumb-sep">/</span>`);
  }
   