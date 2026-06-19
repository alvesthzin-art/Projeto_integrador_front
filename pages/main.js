'use strict'


const API_BASE_URLS = {
    USER_API: 'http://localhost:8080/v1/senai/admin/produtos'
}

function extrairLista(payload) {
    if (payload?.response?.produto && Array.isArray(payload.response.produto)) {
        return payload.response.produto
    }

    if (Array.isArray(payload?.response)) {
        return payload.response
    }

    if (Array.isArray(payload)) {
        return payload
    }

    return []
}

async function buscarProdutos() {
    const token = localStorage.getItem('token')

    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['x-access-token'] = token.trim()

    try {
        const resposta = await fetch(API_BASE_URLS.USER_API, { headers })

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`)
        }

        const dados = await resposta.json()
        const lista = extrairLista(dados)

        if (lista.length > 0) return lista
        return []
    } catch (erro) {
        throw erro || new Error('Não foi possível carregar os produtos da API.')
    }
}

function criarHero() {
    const section = document.createElement('section')
    section.className = 'hero'

    const heroText = document.createElement('div')
    heroText.className = 'hero-text'

    const titulo = document.createElement('h1')
    titulo.innerHTML = 'DOCES QUE ENCANTAM,<br>FEITOS COM MEL E MAGIA.'

    const divisor = document.createElement('div')
    divisor.className = 'hero-divider'
    divisor.setAttribute('aria-hidden', 'true')
    divisor.textContent = '— ✦ —'

    const paragrafo = document.createElement('p')
    paragrafo.textContent = 'Conheça nosso catálogo de delícias.'

    heroText.append(titulo, divisor, paragrafo)

    const heroArt = document.createElement('div')
    heroArt.className = 'hero-art'

    const img = document.createElement('img')
    img.src = 'https://res.cloudinary.com/dps7dz75i/image/upload/v1781273395/ChatGPT_Image_12_de_jun._de_2026_08_35_04_cl5vwt.png'
    img.alt = 'Pote de mel com flores'
    img.loading = 'lazy'

    heroArt.appendChild(img)
    section.append(heroText, heroArt)

    return section
}

function criarTituloSecao() {
    const titulo = document.createElement('h2')
    titulo.className = 'section-title'

    const ornamentoEsquerdo = document.createElement('span')
    ornamentoEsquerdo.className = 'ornament'
    ornamentoEsquerdo.textContent = '⊶'

    const texto = document.createTextNode(' Destaques ')

    const ornamentoDireito = document.createElement('span')
    ornamentoDireito.className = 'ornament'
    ornamentoDireito.textContent = '⊷'

    titulo.append(ornamentoEsquerdo, texto, ornamentoDireito)

    return titulo
}

function criarCardDestaque(produto) {
    const card = document.createElement('a')
    card.className = 'highlight-card'
    // A tela principal está em pages/produtos/index.html
    // O produto.html também está em pages/produtos/produto.html
    card.href = `./produtos/produto.html?id=${produto.id}`
    card.setAttribute('aria-label', `Ver detalhes de ${produto.nome}`)

    const imgWrap = document.createElement('div')
    imgWrap.className = 'highlight-img'

    const img = document.createElement('img')
    img.src = produto.imagem_url || produto.imagem || 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80'
    img.alt = produto.nome
    img.loading = 'lazy'

    imgWrap.appendChild(img)

    const info = document.createElement('div')
    info.className = 'highlight-info'

    const nome = document.createElement('p')
    nome.className = 'highlight-name'
    nome.textContent = produto.nome

    const categoria = document.createElement('p')
    categoria.className = 'highlight-category'
    categoria.textContent = produto.categoria || produto.tipo_produto || 'Doce artesanal'

    info.append(nome, categoria)
    card.append(imgWrap, info)

    return card
}

function criarGridDestaques(listaDestaques) {
    const grid = document.createElement('div')
    grid.className = 'highlights-grid'

    grid.append(...listaDestaques.map(criarCardDestaque))

    return grid
}

async function iniciar() {
    const container = document.getElementById('container')
    if (!container) return

    try {
        const produtos = await buscarProdutos()
        const fragment = document.createDocumentFragment()
        fragment.append(
            criarHero(),
            criarTituloSecao(),
            criarGridDestaques(produtos)
        )
        container.replaceChildren(fragment)
    } catch (erro) {
        console.error(erro)
        container.innerHTML = '<p class="erro-produto">Não foi possível carregar os produtos no momento.</p>'
    }
}

iniciar()