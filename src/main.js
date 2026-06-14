'use strict'

import { listaProdutos } from "./produto.js"
 

function criarCard(produto) {
    const card = document.createElement('div')
    card.className = 'card'
 
    const foto = document.createElement('img')
    foto.src = `./img/${produto.imagem}`
    foto.alt = `Foto de ${produto.nome}`
 
    const nome = document.createElement('h3')
    nome.textContent = produto.nome
 
    const preco = document.createElement('h2')
    preco.textContent = `R$ ${produto.preco.toFixed(2)}`
 
    const estrelas = criarEstrelas(produto.classificacao)
 
    const categoria = document.createElement('span')
    categoria.textContent = produto.categoria
 
    card.append(categoria, foto, nome, estrelas, preco)
 
    return card
}
 
const cards = listaProdutos.map(criarCard)
 
document.getElementById('container').replaceChildren(...cards)
 