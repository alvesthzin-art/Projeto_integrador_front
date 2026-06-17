const API_BASE_URL = "http://localhost:8080/v1/senai/admin";

const ENDPOINTS = {
  categorias: `${API_BASE_URL}/categoria`,   // GET '/' do categoria.routes.js
  tamanhos: `${API_BASE_URL}/tamanho`,       // GET '/' do tamanho.routes.js
  cadastrarProduto: `${API_BASE_URL}/produtos`, // POST '/' do produto.routes.js
};

const form = document.getElementById("form-novo-produto");
const selectCategoria = document.getElementById("categoria");
const selectTamanho = document.getElementById("tamanho");

const areaUpload = document.getElementById("area-upload");
const inputImagem = document.getElementById("imagem");
const uploadConteudo = document.getElementById("upload-conteudo");
const previewImagem = document.getElementById("preview-imagem");

const botaoCancelar = document.getElementById("botao-cancelar");

document.addEventListener("DOMContentLoaded", () => {
  carregarCategorias();
  carregarTamanhos();
});

function extrairArray(resposta) {
  if (Array.isArray(resposta)) {
    return resposta;
  }

  const dados = resposta.response || resposta;

  const chavesPossiveis = ["categorias", "tamanhos", "produtos", "sabores", "data", "dados", "itens", "resultado"];

  for (const chave of chavesPossiveis) {
    if (Array.isArray(dados[chave])) {
      return dados[chave];
    }
  }

  for (const chave in dados) {
    if (Array.isArray(dados[chave])) {
      return dados[chave];
    }
  }

  console.warn("Não encontrei um array na resposta. Formato recebido:", resposta);
  return [];
}

async function carregarCategorias() {
  try {
    const resposta = await fetch(ENDPOINTS.categorias);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar as categorias.");
    }

    const categorias = await resposta.json();

    console.log("Resposta da API de categorias:", categorias);

    // Categoria usa o campo "nome" -> ex.: "chocolates"
    preencherSelect(selectCategoria, extrairArray(categorias), (item) => item.nome);
  } catch (erro) {
    console.error("Erro ao carregar categorias:", erro);
  }
}

async function carregarTamanhos() {
  try {
    const resposta = await fetch(ENDPOINTS.tamanhos);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os tamanhos.");
    }

    const tamanhos = await resposta.json();

    console.log("Resposta da API de tamanhos:", tamanhos);

    preencherSelect(selectTamanho, extrairArray(tamanhos), (item) => `${item.tamanho} - ${item.medida}`);
  } catch (erro) {
    console.error("Erro ao carregar tamanhos:", erro);
  }
}

/* =========================================================
   FUNÇÃO AUXILIAR: preencherSelect
   Recebe um <select>, a lista de itens e uma função que diz
   qual texto mostrar em cada <option> (porque cada tabela usa
   um nome de campo diferente: categoria usa "nome", tamanho
   usa "tamanho" + "medida").
========================================================= */
function preencherSelect(selectElemento, itens, obterTexto) {
  itens.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = obterTexto(item);
    selectElemento.appendChild(option);
  });
}

areaUpload.addEventListener("click", () => {
  inputImagem.click();
});

inputImagem.addEventListener("change", () => {
  const arquivo = inputImagem.files[0];
  if (arquivo) {
    mostrarPreview(arquivo);
  }
});

areaUpload.addEventListener("dragover", (evento) => {
  evento.preventDefault();
  areaUpload.style.borderColor = "#b9701f";
});

areaUpload.addEventListener("dragleave", () => {
  areaUpload.style.borderColor = "#d8cdb8";
});

areaUpload.addEventListener("drop", (evento) => {
  evento.preventDefault();
  areaUpload.style.borderColor = "#d8cdb8";

  const arquivo = evento.dataTransfer.files[0];
  if (arquivo) {
    inputImagem.files = evento.dataTransfer.files;
    mostrarPreview(arquivo);
  }
});

function mostrarPreview(arquivo) {
    const leitor = new FileReader();
    leitor.onload = (evento) => {
      previewImagem.src = evento.target.result;
      previewImagem.hidden = false;
      uploadConteudo.hidden = true;
  
      // Preenche o campo imagem_url automaticamente com o base64
      document.getElementById("imagem_url").value = evento.target.result;
    };
    leitor.readAsDataURL(arquivo);
  }

botaoCancelar.addEventListener("click", () => {
  form.reset();
  previewImagem.hidden = true;
  uploadConteudo.hidden = false;
});

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
  
    const dadosProduto = {
        nome:               document.getElementById("nome").value,
        descricao:          document.getElementById("descricao").value,
        quantidade_estoque: Number(document.getElementById("quantidade_estoque").value),
        imagem_url:         document.getElementById("imagem_url").value,
        unidade_produto:    Number(document.getElementById("unidade_produto").value),
        quantidade_sabores: Number(document.getElementById("quantidade_sabores").value),
        id_tamanho:         Number(selectTamanho.value),
        id_tipo_produto:    Number(selectCategoria.value),
      
        // Array de objetos com id de cada categoria selecionada
        categoria: Array.from(selectCategoria.selectedOptions).map(op => ({ id: Number(op.value) })),
      };
  
    console.log("Enviando para API:", JSON.stringify(dadosProduto));
    await adicionarProduto(dadosProduto);
  });

async function adicionarProduto(dadosProduto) {
  try {
    console.log("Enviando para API:", JSON.stringify(dadosProduto));

    const resposta = await fetch(ENDPOINTS.cadastrarProduto, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosProduto),
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.message || "Erro ao cadastrar o produto.");
    }

    alert("Produto adicionado com sucesso!");
    form.reset();
    previewImagem.hidden = true;
    uploadConteudo.hidden = false;
  } catch (erro) {
    console.error("Erro ao adicionar produto:", erro);
    alert("Não foi possível adicionar o produto. Tente novamente.");
  }
}