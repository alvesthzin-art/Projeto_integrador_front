const API_URL = 'http://localhost:8080/v1/senai/produtos'; 

const formPesquisa = document.querySelector('.barraPesquisa');
const inputPesquisa = document.querySelector('.barraPesquisa input');
const btnLimpar = document.querySelector('.barraPesquisa button[type="button"]');
const vitrine = document.querySelector('.vitrine');
const txtTitulo = document.querySelector('.tituloGrande h1');
const txtContador = document.querySelector('.tituloPequeno h5');

async function carregarDoces(termoBusca = '') {
    try {
        vitrine.innerHTML = '<p style="grid-column: span 6; text-align: center; color: #5c4a37; font-style: italic;">Buscando doces no estoque mágico...</p>';

        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verifica se a estrutura de resposta existe
        if (!data || !data.response || !data.response.produto) {
            mostrarListaVazia(termoBusca);
            return;
        }

        let todosOsProdutos = data.response.produto;

        // --- O SUPER FILTRO ---
        if (termoBusca) {
            const termo = termoBusca.toLowerCase();
            
            todosOsProdutos = todosOsProdutos.filter(doce => {
                // 1. Procura no Nome
                const matchNome = doce.nome && doce.nome.toLowerCase().includes(termo);
                
                // 2. Procura na Descrição
                const matchDescricao = doce.descricao && doce.descricao.toLowerCase().includes(termo);
                
                // 3. Procura no Tipo do Produto (aceita tanto snake_case quanto camelCase do Back)
                const nomeTipo = doce.tipo_produto?.tipo || doce.tipoProduto?.nome || '';
                const matchTipo = nomeTipo.toLowerCase().includes(termo);
                
                // 4. Procura nas Categorias (se for um array de categorias)
                const matchCategoria = doce.categorias && doce.categorias.some(cat => 
                    cat.nome.toLowerCase().includes(termo)
                );

                // Se a palavra pesquisada bater com QUALQUER uma das opções acima, o doce aparece!
                return matchNome || matchDescricao || matchTipo || matchCategoria;
            });
        }

        if (todosOsProdutos.length === 0) {
            mostrarListaVazia(termoBusca);
            return;
        }

        txtTitulo.innerHTML = termoBusca ? `Resultados para “${termoBusca}”` : 'Catálogo Completo';
        txtContador.innerText = `${todosOsProdutos.length} ${todosOsProdutos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;

        vitrine.innerHTML = '';
        
        todosOsProdutos.forEach(doce => {
            // Garante que vai pegar a URL da imagem, independente de como o Back-end envia (imagem_url ou imagemUrl)
            const urlImagemOriginal = doce.imagem_url || doce.imagemUrl;
            
            // Pega o nome do Tipo do Produto (ex: 'chocolate', 'bebida', 'doce')
            const tipoDoce = doce.tipo_produto?.tipo || doce.tipoProduto?.nome || 'Doce Mágico';

            const card = document.createElement('div');
            card.classList.add('card-produto');
            
            card.innerHTML = `
                <img src="${urlImagemOriginal}" alt="${doce.nome}" onerror="this.src='./img/placeholder.png'">
                
                <h3>${doce.nome}</h3>
                <span class="categoria" style="text-transform: capitalize;">${tipoDoce}</span>
                <p>${doce.descricao}</p>
                <button class="btn-detalhes" onclick="verDetalhes(${doce.id})">Ver detalhes</button>
            `;
            
            vitrine.appendChild(card);
        });

    } catch (error) {
        console.error("Erro na comunicação Front/Back:", error);
        vitrine.innerHTML = '<p style="grid-column: span 6; text-align: center; color: #d32f2f; font-weight: bold;">Erro de conexão com a API.</p>';
    }
}

function mostrarListaVazia(termo) {
    txtTitulo.innerHTML = `Resultados para “${termo}”`;
    txtContador.innerText = '0 produtos encontrados';
    vitrine.innerHTML = '<p style="grid-column: span 6; text-align: center; color: #7a6652; font-size: 16px; margin-top: 20px;">Nenhum doce mágico encontrado com esse nome ou categoria. 🍬</p>';
}

function verDetalhes(id) {
    alert(`Detalhes do produto ID: ${id}`);
}

// Eventos
formPesquisa.addEventListener('submit', (e) => {
    e.preventDefault(); 
    carregarDoces(inputPesquisa.value.trim());
});

btnLimpar.addEventListener('click', () => {
    inputPesquisa.value = '';
    carregarDoces('');
});

document.addEventListener('DOMContentLoaded', () => {
    carregarDoces(inputPesquisa.value.trim());
});