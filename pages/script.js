const API_BASE_URL = "http://localhost:8080/v1/senai/admin";

const ENDPOINTS = {
  categorias:       `${API_BASE_URL}/categoria`,
  tamanhos:         `${API_BASE_URL}/tamanho`,
  tiposProduto:     `${API_BASE_URL}/tipo-produto`,
  cadastrarProduto: `${API_BASE_URL}/produtos`,
};

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTc4MTc4NTgyMCwiZXhwIjoxNzgxNzg5NDIwfQ.BKrkFXcmhjRo1TKiBj5jHuziOPohC8hLQYoEyxkkXeQ";

const CLOUD_NAME    = "dlb0dkfbs";
const UPLOAD_PRESET = "honeyduke_preset";

const form              = document.getElementById("form-novo-produto");
const selectCategoria   = document.getElementById("categoria");
const selectTamanho     = document.getElementById("tamanho");
const selectTipoProduto = document.getElementById("tipo_produto");

const areaUpload     = document.getElementById("area-upload");
const inputImagem    = document.getElementById("imagem");
const uploadConteudo = document.getElementById("upload-conteudo");
const previewImagem  = document.getElementById("preview-imagem");
const botaoCancelar  = document.getElementById("botao-cancelar");

let arquivoSelecionado = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarCategorias();
  carregarTamanhos();
  carregarTiposProduto();
});

// ── Helpers ───────────────────────────────────────────────

function extrairArray(resposta) {
  if (Array.isArray(resposta)) return resposta;

  const dados = resposta.response || resposta;

  const chavesPossiveis = [
    "categorias", "tamanhos", "tipos", "tipo_produto", "tiposProduto",
    "produtos", "sabores", "data", "dados", "itens", "resultado",
  ];

  for (const chave of chavesPossiveis) {
    if (Array.isArray(dados[chave])) return dados[chave];
  }

  for (const chave in dados) {
    if (Array.isArray(dados[chave])) return dados[chave];
  }

  console.warn("Não encontrei um array na resposta. Formato recebido:", resposta);
  return [];
}

async function buscarComToken(url) {
  const resposta = await fetch(url, {
    headers: { "x-access-token": token },
  });

  if (!resposta.ok) throw new Error(`Erro ao buscar ${url}: ${resposta.status}`);

  return resposta.json();
}

function preencherSelect(selectElemento, itens, obterTexto) {
  itens.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = obterTexto(item);
    selectElemento.appendChild(option);
  });
}

// ── Carregamentos ─────────────────────────────────────────

async function carregarCategorias() {
  try {
    const categorias = await buscarComToken(ENDPOINTS.categorias);
    console.log("Categorias:", categorias);
    preencherSelect(selectCategoria, extrairArray(categorias), (item) => item.nome);
  } catch (erro) {
    console.error("Erro ao carregar categorias:", erro);
  }
}

async function carregarTamanhos() {
  try {
    const tamanhos = await buscarComToken(ENDPOINTS.tamanhos);
    console.log("Tamanhos:", tamanhos);
    preencherSelect(selectTamanho, extrairArray(tamanhos), (item) => `${item.tamanho} - ${item.medida}`);
  } catch (erro) {
    console.error("Erro ao carregar tamanhos:", erro);
  }
}

async function carregarTiposProduto() {
  try {
    const tipos = await buscarComToken(ENDPOINTS.tiposProduto);
    console.log("Tipos de produto:", tipos);
    preencherSelect(selectTipoProduto, extrairArray(tipos), (item) => item.tipo);
  } catch (erro) {
    console.error("Erro ao carregar tipos de produto:", erro);
  }
}

// ── Upload de imagem ──────────────────────────────────────

areaUpload.addEventListener("click", () => inputImagem.click());

inputImagem.addEventListener("change", () => {
  const arquivo = inputImagem.files[0];
  if (arquivo) {
    arquivoSelecionado = arquivo;
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
    arquivoSelecionado = arquivo;
    mostrarPreview(arquivo);
  }
});

function mostrarPreview(arquivo) {
  const leitor = new FileReader();
  leitor.onload = (evento) => {
    previewImagem.src = evento.target.result;
    previewImagem.hidden = false;
    uploadConteudo.hidden = true;
  };
  leitor.readAsDataURL(arquivo);
}

async function uploadImagem(arquivo) {
  const formData = new FormData();
  formData.append("file", arquivo);
  formData.append("upload_preset", UPLOAD_PRESET);

  const resposta = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!resposta.ok) {
    const erro = await resposta.json(); // 👈 ver mensagem real do Cloudinary
    console.error("Detalhes do erro Cloudinary:", erro);
    throw new Error(erro.error?.message || "Erro no upload da imagem");
  }

  const data = await resposta.json();
  return data.secure_url;
}

// ── Cancelar ──────────────────────────────────────────────

botaoCancelar.addEventListener("click", () => {
  form.reset();
  arquivoSelecionado = null;
  previewImagem.hidden = true;
  uploadConteudo.hidden = false;
});

// ── Submit ────────────────────────────────────────────────

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  let imagem_url = null;

  if (arquivoSelecionado) {
    imagem_url = await uploadImagem(arquivoSelecionado);
  }

  const dadosProduto = {
    nome:               document.getElementById("nome").value,
    descricao:          document.getElementById("descricao").value,
    quantidade_estoque: Number(document.getElementById("quantidade_estoque").value),
    imagem_url,
    unidade_produto:    Number(document.getElementById("unidade_produto").value),
    quantidade_sabores: Number(document.getElementById("quantidade_sabores").value),
    id_tamanho:         Number(selectTamanho.value),
    id_tipo_produto:    Number(selectTipoProduto.value),
    categoria:          Array.from(selectCategoria.selectedOptions).map((op) => ({ id: Number(op.value) })),
  };

  console.log("Enviando para API:", JSON.stringify(dadosProduto));
  await adicionarProduto(dadosProduto);
});

async function adicionarProduto(dadosProduto) {
  try {
    const resposta = await fetch(ENDPOINTS.cadastrarProduto, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify(dadosProduto),
    });

    const resultado = await resposta.json();

    if (!resposta.ok) throw new Error(resultado.message || "Erro ao cadastrar o produto.");

    alert("Produto adicionado com sucesso!");
    form.reset();
    arquivoSelecionado = null;
    previewImagem.hidden = true;
    uploadConteudo.hidden = false;
  } catch (erro) {
    console.error("Erro ao adicionar produto:", erro);
    alert("Não foi possível adicionar o produto. Tente novamente.");
  }
}