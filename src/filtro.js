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
        
        if (!data || !data.response || !data.response.produto) {
            mostrarListaVazia(termoBusca);
            return;
        }

        let todosOsProdutos = data.response.produto;

        if (termoBusca) {
            const termo = termoBusca.toLowerCase();
            
            todosOsProdutos = todosOsProdutos.filter(doce => {
                const matchNome = doce.nome && doce.nome.toLowerCase().includes(termo);
                
                const matchDescricao = doce.descricao && doce.descricao.toLowerCase().includes(termo);
                
                const nomeTipo = doce.tipo_produto?.tipo || doce.tipoProduto?.nome || '';
                const matchTipo = nomeTipo.toLowerCase().includes(termo);
                                const matchCategoria = doce.categorias && doce.categorias.some(cat => 
                    cat.nome.toLowerCase().includes(termo)
                );

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
        
        vitrine.innerHTML = '';
        
        todosOsProdutos.forEach(doce => {

            const tipoDoce = doce.tipo_produto?.tipo || doce.tipoProduto?.nome || doce.tipo || 'Doce Mágico';

            const nomeDoce = doce.nome || 'Doce sem Nome';
            const descricaoDoce = doce.descricao || 'Sem descrição cadastrada.';

            const card = document.createElement('div');
            card.classList.add('card-produto');
            
           
            card.innerHTML = `
                <img src="../img/placeholder.png" alt="${nomeDoce}">
                
                <h3>${nomeDoce}</h3>
                <span class="categoria" style="text-transform: capitalize;">${tipoDoce}</span>
                <p>${descricaoDoce}</p>
                <button class="btn-detalhes" onclick="verDetalhes(${doce.id || 0})">Ver detalhes</button>
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