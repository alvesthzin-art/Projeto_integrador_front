async function carregarProdutosDestaque() {
    const gridProdutos = document.getElementById('produtos-grid');
    
    const usandoLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const URL_API = usandoLocal 
        ? 'http://localhost:8080/v1/senai/admin/produtos' 
        : 'https://SUA-API-DO-DEPLOY.onrender.com/v1/senai/admin/produtos'; // <-- Quando fizer o deploy do back-end, mude apenas esse link!

    try {
        const response = await fetch(URL_API, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.status}`);
        }

        const dados = await response.json();
        console.log("Dados recebidos da API com sucesso:", dados);

        // Acessa o array correto de produtos de forma segura
        const listaDeProdutos = dados.response && dados.response.produto ? dados.response.produto : [];

        gridProdutos.innerHTML = '';

        if (listaDeProdutos.length === 0) {
            gridProdutos.innerHTML = '<p class="aviso-erro">Nenhum doce mágico encontrado no estoque.</p>';
            return;
        }

        // Pega as primeiras 8 delícias para exibir em destaque no painel
        const produtosExibidos = listaDeProdutos.slice(0, 8);

        produtosExibidos.forEach(produto => {
            const imagem = produto.imagem || produto.imagem_url || produto.foto || 'https://via.placeholder.com/150';
            
            // Agora puxando o preco dinâmico que arrumamos no back-end!
            const preco = produto.preco || produto.valor || 0;

            const cardHTML = `
                <div class="produto-card">
                    <div class="produto-imagem-box">    
                        <img src="${imagem}" alt="${produto.nome}" class="produto-img">
                    </div>
                    <div class="produto-info">
                        <h3>${produto.nome || 'Doce Misterioso'}</h3>
                        <p class="produto-descricao">${produto.descricao || 'Uma delícia direto de Hogsmeade.'}</p>
                        <span class="produto-preco">R$ ${parseFloat(preco).toFixed(2)}</span>
                    </div>
                </div>
            `;
            gridProdutos.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Erro ao carregar os produtos:", error);
        gridProdutos.innerHTML = '<p class="aviso-erro" style="color: red; text-align: center; font-weight: bold;">Erro ao carregar os doces mágicos. Verifique o console do desenvolvedor (F12).</p>';
    }
}

document.addEventListener('DOMContentLoaded', carregarProdutosDestaque);