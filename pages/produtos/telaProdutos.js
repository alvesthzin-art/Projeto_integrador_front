'use strict'

// ╔═══════════════════════════════════════════════════════╗
// ║ INICIALIZA O TOKEN (deve estar no início!)            ║
// ╚═══════════════════════════════════════════════════════╝
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTc4MTc5MjIzMiwiZXhwIjoxNzgxNzk1ODMyfQ.45usFXvPvytrgpu49vTGX_4ZkxFMKZYjZQceU2NFLDs')

const API_BASE_URLS = [
    'http://localhost:8080/v1/senai/admin/produtos'
]

function obterIdDaUrl() {
    const params = new URLSearchParams(window.location.search)
    return params.get('id')
}

function extrairResposta(payload) {
    if (payload?.data?.produto) return payload.data.produto
    if (payload?.response?.produto) return payload.response.produto[0]
    if (payload?.produto) return payload.produto
    if (payload?.response && typeof payload.response === 'object' && !Array.isArray(payload.response)) {
        return payload.response
    }
    if (typeof payload === 'object' && Object.keys(payload).length > 0) return payload
    return null
}

// ──────────────────────────────────────────────────────────
// Função para mostrar erros
// ──────────────────────────────────────────────────────────
function mostrarErro(mensagem) {
    const main = document.querySelector('main')
    if (!main) return
    
    main.innerHTML = ''
    const divErro = document.createElement('div')
    divErro.style.cssText = `
        padding: 24px;
        background: rgba(248, 215, 218, 0.9);
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        font-family: 'Lato', sans-serif;
        text-align: center;
        margin: auto;
        max-width: 500px;
    `
    divErro.textContent = mensagem
    main.append(divErro)
    console.error(mensagem)
}

async function buscarProduto(id) {
    if (!id) {
        throw new Error('ID do produto não fornecido na URL. Use: ?id=1')
    }

    for (const baseUrl of API_BASE_URLS) {
        try {
            const token = localStorage.getItem('token')
            console.log('Token encontrado:', !!token)
            
            if (!token) {
                throw new Error('Token JWT não encontrado. Faça login primeiro.')
            }

            const headers = {
                'Content-Type': 'application/json',
                'x-access-token': token.trim()
            }

            console.log(`Buscando produto ${id} em: ${baseUrl}/${id}`)
            
            const resposta = await fetch(`${baseUrl}/${id}`, {
                method: 'GET',
                headers: headers
            })
            
            console.log('Status da resposta:', resposta.status)
            
            if (!resposta.ok) {
                const erroData = await resposta.text()
                console.error(`Erro HTTP ${resposta.status}:`, erroData)
                throw new Error(`HTTP ${resposta.status}: ${erroData}`)
            }

            const dados = await resposta.json()
            console.log('Dados brutos da API:', dados)
            
            const produto = extrairResposta(dados)
            console.log('Produto extraído:', produto)
            
            if (produto && Object.keys(produto).length > 0) {
                return produto
            } else {
                throw new Error('Produto vazio ou inválido')
            }
        } catch (erro) {
            console.error('Erro ao buscar produto:', erro.message)
            throw erro
        }
    }
}

// ──────────────────────────────────────────────────────────
// Galeria: imagem principal + miniaturas
// ──────────────────────────────────────────────────────────
function criarGaleria(produto) {
    const section = document.createElement('section')
    section.className = 'gallery'
    section.setAttribute('aria-label', 'Galeria do produto')

    const galleryMain = document.createElement('div')
    galleryMain.className = 'gallery-main'

    const mainImage = document.createElement('img')
    mainImage.id = 'mainImage'
    mainImage.src = produto.imagem_url || produto.imagem || 'https://via.placeholder.com/500x400?text=Sem+imagem'
    mainImage.alt = `Foto de ${produto.nome}`

    galleryMain.append(mainImage)

    const galleryThumbs = document.createElement('div')
    galleryThumbs.className = 'gallery-thumbs'
    galleryThumbs.setAttribute('role', 'list')

    const thumbBtn = document.createElement('button')
    thumbBtn.type = 'button'
    thumbBtn.className = 'active'
    thumbBtn.setAttribute('aria-label', `Imagem do ${produto.nome}`)
    
    const thumbImg = document.createElement('img')
    thumbImg.src = produto.imagem_url || produto.imagem || 'https://via.placeholder.com/100'
    thumbImg.alt = produto.nome
    
    thumbBtn.append(thumbImg)
    galleryThumbs.append(thumbBtn)

    section.append(galleryMain, galleryThumbs)

    return section
}

// ──────────────────────────────────────────────────────────
// Cabeçalho do produto: título, subtítulo, divisor
// ──────────────────────────────────────────────────────────
function criarCabecalhoProduto(produto, categorias) {
    const wrapper = document.createElement('div')

    const titulo = document.createElement('h1')
    titulo.className = 'product-title'
    titulo.textContent = produto.nome || 'Produto'

    const subtitulo = document.createElement('p')
    subtitulo.className = 'product-subtitle'
    const tipoProdutoNome = (typeof produto.tipo_produto === 'object' && produto.tipo_produto !== null)
        ? (produto.tipo_produto.tipo_produto || produto.tipo_produto.nome)
        : produto.tipo_produto

    const catNome = categorias[0]?.nome || categorias[0]?.categoria || tipoProdutoNome || 'Categoria'
    subtitulo.textContent = String(catNome).toUpperCase()

    const divisor = document.createElement('div')
    divisor.className = 'divider-ornament'
    divisor.setAttribute('aria-hidden', 'true')
    divisor.textContent = '✦'

    wrapper.append(titulo, subtitulo, divisor)

    return wrapper
}

// ──────────────────────────────────────────────────────────
// Linha "Quantidade"
// ──────────────────────────────────────────────────────────
function criarLinhaQuantidade(produto) {
    const row = document.createElement('div')
    row.className = 'meta-row'

    const label = document.createElement('span')
    label.className = 'meta-label'
    label.textContent = 'Quantidade:'

    const valor = document.createElement('span')
    valor.className = 'meta-value'
    valor.id = 'quantity'
    valor.textContent = produto.quantidade_estoque ?? produto.quantidade ?? '0'

    row.append(label, valor)

    return row
}

// ──────────────────────────────────────────────────────────
// Linha "Tamanho"
// ──────────────────────────────────────────────────────────
function criarLinhaTamanho(tamanho) {
    const row = document.createElement('div')
    row.className = 'meta-row'

    const label = document.createElement('span')
    label.className = 'meta-label'
    label.textContent = 'Tamanho:'

    const sizeOptions = document.createElement('div')
    sizeOptions.className = 'size-options'
    sizeOptions.setAttribute('role', 'group')
    sizeOptions.setAttribute('aria-label', 'Tamanho')

    if (Array.isArray(tamanho) && tamanho.length > 0) {
        tamanho.forEach((tamanho, indice) => {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.className = indice === 0 ? 'size-btn active' : 'size-btn'
            btn.dataset.size = tamanho.sigla || tamanho.tamanho || 'M'
            const peso = tamanho.peso || tamanho.medida || ''
            btn.textContent = `${tamanho.sigla || tamanho.tamanho || 'M'}${peso ? ' · ' + peso : ''}`
            sizeOptions.append(btn)
        })
    } else {
        const span = document.createElement('span')
        span.className = 'meta-value'
        span.textContent = 'Não informado'
        sizeOptions.append(span)
    }

    row.append(label, sizeOptions)

    return row
}

// ──────────────────────────────────────────────────────────
// Linha "Categoria"
// ──────────────────────────────────────────────────────────
function criarLinhaCategoria(categorias) {
    const row = document.createElement('div')
    row.className = 'meta-row'

    const label = document.createElement('span')
    label.className = 'meta-label'
    label.textContent = 'Categoria:'

    const flavorTags = document.createElement('div')
    flavorTags.className = 'flavor-tags'

    if (Array.isArray(categorias) && categorias.length > 0) {
        categorias.forEach(cat => {
            const tag = document.createElement('span')
            tag.className = 'flavor-tag'
            tag.textContent = cat.nome || cat.categoria || cat
            flavorTags.append(tag)
        })
    } else {
        const span = document.createElement('span')
        span.className = 'meta-value'
        span.textContent = 'Não informado'
        flavorTags.append(span)
    }

    row.append(label, flavorTags)

    return row
}

// ──────────────────────────────────────────────────────────
// Linha "Sabores" (tags)
// ──────────────────────────────────────────────────────────
function criarLinhaSabores(sabores) {
    const row = document.createElement('div')
    row.className = 'meta-row'

    const label = document.createElement('span')
    label.className = 'meta-label'
    label.textContent = 'Sabores:'

    const flavorTags = document.createElement('div')
    flavorTags.className = 'flavor-tags'

    if (Array.isArray(sabores) && sabores.length > 0) {
        sabores.forEach(sabor => {
            const tag = document.createElement('span')
            tag.className = 'flavor-tag'
            tag.textContent = sabor.sabor || sabor.nome || sabor
            flavorTags.append(tag)
        })
    } else {
        const span = document.createElement('span')
        span.className = 'meta-value'
        span.textContent = '0 sabores disponíveis'
        flavorTags.append(span)
    }

    row.append(label, flavorTags)

    return row
}

// ──────────────────────────────────────────────────────────
// meta-grid: agrupa as linhas
// ──────────────────────────────────────────────────────────
function criarMetaGrid(produto, sabores, categorias) {
    const metaGrid = document.createElement('div')
    metaGrid.className = 'meta-grid'

    metaGrid.append(
        criarLinhaQuantidade(produto),
        criarLinhaTamanho(produto.tamanho || []),
        criarLinhaCategoria(categorias),
        criarLinhaSabores(sabores)
    )

    return metaGrid
}

// ──────────────────────────────────────────────────────────
// Seção de ingredientes
// ──────────────────────────────────────────────────────────
function criarSecaoIngredientes(produto) {
    const section = document.createElement('section')
    section.className = 'ingredients-section'

    const titulo = document.createElement('h2')
    titulo.className = 'ingredients-title'
    titulo.textContent = 'Ingredientes'

    const texto = document.createElement('p')
    texto.className = 'ingredients-text'
    
    if (Array.isArray(produto.ingredientes)) {
        texto.textContent = produto.ingredientes.join(', ')
    } else if (typeof produto.ingredientes === 'string') {
        texto.textContent = produto.ingredientes
    } else {
        texto.textContent = 'Ingredientes não informados.'
    }

    section.append(titulo, texto)

    return section
}

// ──────────────────────────────────────────────────────────
// Seção "Product Info": cabeçalho + descrição + meta-grid + ingredientes
// ──────────────────────────────────────────────────────────
function criarProductInfo(produto, sabores, categorias) {
    const section = document.createElement('section')
    section.className = 'product-info'

    const descricao = document.createElement('p')
    descricao.className = 'product-desc'
    descricao.textContent = produto.descricao || 'Descrição não disponível.'

    section.append(
        criarCabecalhoProduto(produto, categorias),
        descricao,
        criarMetaGrid(produto, sabores, categorias),
        criarSecaoIngredientes(produto)
    )

    return section
}

// ──────────────────────────────────────────────────────────
// Monta a página completa
// ──────────────────────────────────────────────────────────
function criarPaginaProduto(produto, sabores, categorias) {
    const article = document.createElement('article')
    article.className = 'product-page'

    article.append(
        criarGaleria(produto),
        criarProductInfo(produto, sabores, categorias)
    )

    return article
}

// ──────────────────────────────────────────────────────────
// Função auxiliar para buscar sabores
// ──────────────────────────────────────────────────────────
async function buscarSaboresDoProduto(produto) {
    if (Array.isArray(produto?.sabores) && produto.sabores.length > 0) {
        return produto.sabores
    }
    return []
}

// ──────────────────────────────────────────────────────────
// Função auxiliar para buscar categorias
// ──────────────────────────────────────────────────────────
async function buscarCategoriasDoProduto(produto) {
    if (Array.isArray(produto?.categorias) && produto.categorias.length > 0) {
        return produto.categorias
    }
    if (produto?.categoria) {
        return [{ nome: produto.categoria }]
    }
    return []
}

// ──────────────────────────────────────────────────────────
// Função principal
// ──────────────────────────────────────────────────────────
async function iniciar() {
    const id = obterIdDaUrl()

    if (!id) {
        mostrarErro('❌ Nenhum produto foi especificado. Use: ?id=1')
        console.warn('URL não contém parâmetro "id"')
        return
    }

    try {
        console.log('Iniciando busca do produto:', id)
        const produto = await buscarProduto(id)
        
        if (!produto || !produto.nome) {
            throw new Error('Dados do produto inválidos')
        }

        console.log('✅ Produto carregado com sucesso:', produto)
        
        const sabores = await buscarSaboresDoProduto(produto)
        const categorias = await buscarCategoriasDoProduto(produto)

        const main = document.querySelector('main')
        if (!main) {
            throw new Error('Elemento <main> não encontrado no HTML')
        }

        const paginaProduto = criarPaginaProduto(produto, sabores, categorias)
        main.innerHTML = ''
        main.append(paginaProduto)
        
        console.log('✅ Página renderizada com sucesso')
    } catch (erro) {
        console.error('❌ Erro fatal:', erro)
        mostrarErro(`❌ Erro: ${erro.message}`)
    }
}


// ──────────────────────────────────────────────────────────
// Inicia quando o DOM está pronto
// ──────────────────────────────────────────────────────────
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', iniciar)
// } else {
//     iniciar()
// }
window.addEventListener('load', iniciar)
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTc4MTc5MjIzMiwiZXhwIjoxNzgxNzk1ODMyfQ.45usFXvPvytrgpu49vTGX_4ZkxFMKZYjZQceU2NFLDs')