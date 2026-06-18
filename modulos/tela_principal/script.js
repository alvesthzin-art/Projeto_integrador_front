// Array contendo a lista de objetos dos produtos em destaque
const produtos = [
    {
        nome: "Fudge de Chocolate",
        categoria: "Tradicional",
        imagem: "https://res.cloudinary.com/dps7dz75i/image/upload/v1781448143/Fudge_chocolate_hqujpk.png"
    },
    {
        nome: "Toffee de Caramelo",
        categoria: "Tradicional",
        imagem: "https://res.cloudinary.com/dps7dz75i/image/upload/v1781448364/Toffee_caramelo_azt7zv.png"
    }
];

// Função responsável por construir os blocos de HTML e injetar na página
function renderProdutos() {
    // Seleciona a div que vai segurar os cards dos produtos
    const grid = document.getElementById('produtos-grid');
    
    // Mapeia o array transformando cada produto em uma estrutura HTML
    grid.innerHTML = produtos.map(p => `
        <div class="product-card">
            <div class="card-img-wrap">
                <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
            </div>
            <div class="card-info">
                <h3>${p.nome}</h3>
                <p>${p.categoria}</p>
            </div>
        </div>
    `).join(''); // Une todos os cards sem nenhuma vírgula separando eles
}
renderProdutos();