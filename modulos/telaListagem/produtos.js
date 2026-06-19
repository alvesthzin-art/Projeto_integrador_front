// =========================================================
// PRODUTOS.JS
// Lista os produtos cadastrados, permite editar (modal na
// própria tela, com PUT na API) e apagar (com confirmação +
// DELETE na API).
// =========================================================

const API_BASE_URL = "http://localhost:8080/v1/senai/admin";

const ENDPOINTS = {
  produtos:     `${API_BASE_URL}/produtos`,
  categorias:   `${API_BASE_URL}/categoria`,
  tamanhos:     `${API_BASE_URL}/tamanho`,
  tiposProduto: `${API_BASE_URL}/tipo-produto`,
};

const token = localStorage.getItem("token_honeydukes");

if (!token) {
  alert("Sessão expirada ou não autenticado. Faça login novamente.");
  window.location.href = "../login_administrador/admin.html";
}

const tabelaCorpo = document.getElementById("tabela-produtos-corpo");

const modalConfirmar      = document.getElementById("modal-confirmar");
const modalTexto          = document.getElementById("modal-texto");
const botaoModalCancelar  = document.getElementById("modal-cancelar");
const botaoModalApagar    = document.getElementById("modal-confirmar-apagar");

const modalEditar           = document.getElementById("modal-editar");
const formEditar             = document.getElementById("form-editar-produto");
const botaoModalEditarCancelar = document.getElementById("modal-editar-cancelar");
const botaoModalEditarSalvar   = document.getElementById("modal-editar-salvar");

const editarId                 = document.getElementById("editar-id");
const editarNome                = document.getElementById("editar-nome");
const editarDescricao           = document.getElementById("editar-descricao");
const editarTipoProduto         = document.getElementById("editar-tipo_produto");
const editarCategoria           = document.getElementById("editar-categoria");
const editarTamanho              = document.getElementById("editar-tamanho");
const editarQuantidadeSabores   = document.getElementById("editar-quantidade_sabores");
const editarQuantidadeEstoque   = document.getElementById("editar-quantidade_estoque");
const editarUnidadeProduto      = document.getElementById("editar-unidade_produto");
const editarImagemUrl           = document.getElementById("editar-imagem_url");

let idProdutoParaApagar = null;
let produtosCache = [];      // guarda a última lista carregada, usada pra preencher o modal de edição
let selectsEditarCarregados = false;

document.addEventListener("DOMContentLoaded", carregarProdutos);

// ── Helpers ───────────────────────────────────────────────

function extrairArray(resposta) {
  if (Array.isArray(resposta)) return resposta;

  const dados = resposta.response || resposta;

  const chavesPossiveis = [
    "produto", "produtos", "data", "dados", "itens", "resultado",
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

function formatarCategorias(produto) {
  // A API retorna "categoria" como array de objetos {id, nome, descricao}
  const categorias = produto.categoria ?? produto.categorias ?? [];

  if (!Array.isArray(categorias) || categorias.length === 0) return "—";

  return categorias
    .map((cat) => {
      if (typeof cat === "object" && cat !== null) return cat.nome || cat.descricao || "?";
      return String(cat);
    })
    .join(", ");
}

function formatarTamanho(produto) {
  const tamanho = produto.tamanho || produto.id_tamanho_info;
  if (tamanho && typeof tamanho === "object") {
    return `${tamanho.tamanho || ""} - ${tamanho.medida || ""}`.trim();
  }
  return produto.tamanho_label || "—";
}

function formatarSabores(produto) {
  const sabores = produto.sabores || produto.lista_sabores;
  const quantidade = produto.quantidade_sabores || (Array.isArray(sabores) ? sabores.length : 0);

  if (Array.isArray(sabores) && sabores.length > 0) {
    const nomes = sabores.map((s) => `<span>${s.nome || s}</span>`).join("");
    return `<div class="lista-sabores"><span class="contagem-sabores">${quantidade} - </span>${nomes}</div>`;
  }

  return `<span class="contagem-sabores">${quantidade}</span>`;
}

function badgeEstoque(quantidade) {
  const qtd = Number(quantidade) || 0;
  let classe = "badge-estoque--ok";

  if (qtd === 0) classe = "badge-estoque--zero";
  else if (qtd <= 10) classe = "badge-estoque--baixo";

  return `<span class="badge-estoque ${classe}">${qtd}</span>`;
}

async function buscarComToken(url) {
  const resposta = await fetch(url, {
    headers: { "x-access-token": token },
  });

  if (!resposta.ok) throw new Error(`Erro ao buscar ${url}: ${resposta.status}`);

  return resposta.json();
}

function preencherSelect(selectElemento, itens, obterTexto) {
  selectElemento.innerHTML = selectElemento.querySelector('option[value=""]')
    ? selectElemento.querySelector('option[value=""]').outerHTML
    : "";

  itens.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = obterTexto(item);
    selectElemento.appendChild(option);
  });
}

// ── Carregar produtos ─────────────────────────────────────

async function carregarProdutos() {
  tabelaCorpo.innerHTML = `
    <tr><td colspan="7" class="tabela-status">Carregando produtos...</td></tr>
  `;

  try {
    const resposta = await fetch(ENDPOINTS.produtos, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao buscar produtos: ${resposta.status}`);
    }

    const dados = await resposta.json();
    console.log("Produtos recebidos:", dados);
    console.log("Primeiro produto:", JSON.stringify(dados?.response?.produto?.[0] ?? dados?.[0], null, 2));

    const produtos = extrairArray(dados);
    produtosCache = produtos;

    if (produtos.length === 0) {
      tabelaCorpo.innerHTML = `
        <tr><td colspan="7" class="tabela-status">Nenhum produto cadastrado ainda.</td></tr>
      `;
      return;
    }

    renderizarTabela(produtos);
  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    tabelaCorpo.innerHTML = `
      <tr><td colspan="7" class="tabela-status erro">Erro ao carregar os produtos. Verifique o console (F12).</td></tr>
    `;
  }
}

function renderizarTabela(produtos) {
  tabelaCorpo.innerHTML = "";

  produtos.forEach((produto) => {
    const id     = produto.id ?? produto.id_produto;
    const nome   = produto.nome || "—";
    const imagem = produto.imagem_url || produto.imagem || produto.foto || "https://via.placeholder.com/56";

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td><img src="${imagem}" alt="${nome}" class="produto-thumb"></td>
      <td>${nome}</td>
      <td>${formatarCategorias(produto)}</td>
      <td>${formatarTamanho(produto)}</td>
      <td>${formatarSabores(produto)}</td>
      <td>${badgeEstoque(produto.quantidade_estoque)}</td>
      <td>
        <div class="acoes-produto">
          <button type="button" class="botao-acao botao-editar" data-id="${id}">✏️ Editar</button>
          <button type="button" class="botao-acao botao-apagar" data-id="${id}" data-nome="${nome}">❌ Apagar</button>
        </div>
      </td>
    `;
    tabelaCorpo.appendChild(linha);
  });

  // Liga os eventos dos botões recém-criados
  document.querySelectorAll(".botao-editar").forEach((botao) => {
    botao.addEventListener("click", () => abrirModalEditar(botao.dataset.id));
  });

  document.querySelectorAll(".botao-apagar").forEach((botao) => {
    botao.addEventListener("click", () => abrirModalApagar(botao.dataset.id, botao.dataset.nome));
  });
}

// ── Editar ────────────────────────────────────────────────

async function carregarSelectsEditar() {
  if (selectsEditarCarregados) return;

  try {
    const [categorias, tamanhos, tipos] = await Promise.all([
      buscarComToken(ENDPOINTS.categorias),
      buscarComToken(ENDPOINTS.tamanhos),
      buscarComToken(ENDPOINTS.tiposProduto),
    ]);

    preencherSelect(editarCategoria, extrairArray(categorias), (item) => item.nome);
    preencherSelect(editarTamanho, extrairArray(tamanhos), (item) => `${item.tamanho} - ${item.medida}`);
    preencherSelect(editarTipoProduto, extrairArray(tipos), (item) => item.tipo);

    selectsEditarCarregados = true;
  } catch (erro) {
    console.error("Erro ao carregar opções do formulário de edição:", erro);
    alert("Não foi possível carregar categorias/tamanhos/tipos. Tente novamente.");
  }
}

function selecionarOpcoes(selectElemento, idsSelecionados) {
  const idsTexto = idsSelecionados.map((id) => String(id));
  Array.from(selectElemento.options).forEach((option) => {
    option.selected = idsTexto.includes(option.value);
  });
}

async function abrirModalEditar(id) {
  const produto = produtosCache.find((p) => String(p.id ?? p.id_produto) === String(id));

  if (!produto) {
    alert("Não foi possível encontrar os dados deste produto. Recarregue a página e tente novamente.");
    return;
  }

  await carregarSelectsEditar();

  editarId.value          = produto.id ?? produto.id_produto;
  editarNome.value        = produto.nome || "";
  editarDescricao.value   = produto.descricao || "";
  editarQuantidadeSabores.value = produto.quantidade_sabores || "";
  editarQuantidadeEstoque.value = produto.quantidade_estoque ?? "";
  editarUnidadeProduto.value    = produto.unidade_produto || "";
  editarImagemUrl.value         = produto.imagem_url || produto.imagem || produto.foto || "";

  const idTamanho = produto.id_tamanho ?? produto.tamanho?.id ?? produto.id_tamanho_info?.id;
  editarTamanho.value = idTamanho != null ? String(idTamanho) : "";

  const idTipoProduto = produto.id_tipo_produto ?? produto.tipo_produto?.id;
  editarTipoProduto.value = idTipoProduto != null ? String(idTipoProduto) : "";

  const categorias = produto.categoria || produto.categorias || [];
  const idsCategorias = (Array.isArray(categorias) ? categorias : [])
    .map((cat) => (typeof cat === "object" ? cat.id : cat));
  selecionarOpcoes(editarCategoria, idsCategorias);

  modalEditar.hidden = false;
}

function fecharModalEditar() {
  formEditar.reset();
  modalEditar.hidden = true;
}

botaoModalEditarCancelar.addEventListener("click", fecharModalEditar);

modalEditar.addEventListener("click", (evento) => {
  if (evento.target === modalEditar) fecharModalEditar();
});

formEditar.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = editarId.value;
  if (!id) return;

  const dadosProduto = {
    nome:               editarNome.value,
    descricao:          editarDescricao.value,
    quantidade_estoque: Number(editarQuantidadeEstoque.value),
    imagem_url:         editarImagemUrl.value || null,
    unidade_produto:    Number(editarUnidadeProduto.value),
    quantidade_sabores: Number(editarQuantidadeSabores.value),
    id_tamanho:         Number(editarTamanho.value),
    id_tipo_produto:    Number(editarTipoProduto.value),
    categoria:          Array.from(editarCategoria.selectedOptions).map((op) => ({ id: Number(op.value) })),
  };

  botaoModalEditarSalvar.disabled = true;
  botaoModalEditarSalvar.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${ENDPOINTS.produtos}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify(dadosProduto),
    });

    if (!resposta.ok) {
      const resultado = await resposta.json().catch(() => ({}));
      throw new Error(resultado.message || `Erro ao salvar produto (status ${resposta.status})`);
    }

    fecharModalEditar();
    await carregarProdutos();
  } catch (erro) {
    console.error("Erro ao editar produto:", erro);
    alert("Não foi possível salvar as alterações. Tente novamente.");
  } finally {
    botaoModalEditarSalvar.disabled = false;
    botaoModalEditarSalvar.textContent = "Salvar alterações";
  }
});

// ── Apagar ────────────────────────────────────────────────

function abrirModalApagar(id, nome) {
  idProdutoParaApagar = id;
  modalTexto.textContent = `Tem certeza que deseja apagar "${nome}"? Essa ação não pode ser desfeita.`;
  modalConfirmar.hidden = false;
}

function fecharModalApagar() {
  idProdutoParaApagar = null;
  modalConfirmar.hidden = true;
}

botaoModalCancelar.addEventListener("click", fecharModalApagar);

modalConfirmar.addEventListener("click", (evento) => {
  if (evento.target === modalConfirmar) fecharModalApagar();
});

botaoModalApagar.addEventListener("click", async () => {
  if (!idProdutoParaApagar) return;

  const idParaApagar = idProdutoParaApagar;
  botaoModalApagar.disabled = true;
  botaoModalApagar.textContent = "Apagando...";

  try {
    const resposta = await fetch(`${ENDPOINTS.produtos}/${idParaApagar}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    });

    if (!resposta.ok) {
      const resultado = await resposta.json().catch(() => ({}));
      throw new Error(resultado.message || `Erro ao apagar produto (status ${resposta.status})`);
    }

    fecharModalApagar();
    await carregarProdutos();
  } catch (erro) {
    console.error("Erro ao apagar produto:", erro);
    alert("Não foi possível apagar o produto. Tente novamente.");
  } finally {
    botaoModalApagar.disabled = false;
    botaoModalApagar.textContent = "Apagar";
  }
});