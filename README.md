# 🍬 Honeydukes 

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JAVASCRIPT-ES6+-yellow?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/STATUS-OPERACIONAL-blue?style=for-the-badge&logo=serverfault" />
</p>

---

## 🚀 Sobre o Front-end

Esta é a interface de gerenciamento da famosa doceria **Honeydukes**. Ela foi projetada para oferecer uma experiência visual mágica e imersiva para os administradores da loja, permitindo o controle de acesso seguro e o cadastro ágil de novas guloseimas no catálogo. ⚡

O projeto foi construído utilizando **Vanilla JavaScript** (JS Puro) estruturado de forma assíncrona para se comunicar com uma API REST externa, além de integrar componentes dinâmicos de interface.

### 📂 Estrutura de Arquivos da Interface

* **`/modulos`**: Estrutura das telas e fluxos visuais do app.
  * `/login_administrador/admin.html`: Tela de login temática com validação de campos.
  * `/cadastrarProduto/index.html`: Painel com formulários dinâmicos para novos produtos.
  * `/js/admin.js`: O motor do front-end! Controla eventos do DOM, validações de sessão, upload de imagens e requisições HTTP.

---

## 🛠️ Funcionalidades Interativas

Aqui estão as engrenagens visuais e de lógica que rodam no navegador do usuário:

| Componente / Função | O que ele faz na tela? | 🎁 |
| :--- | :--- | :---: |
| `fazerLogin` | Captura o e-mail/senha, faz a ponte com a API e armazena o token no `localStorage`. | 🔑 |
| `verificarAutenticacao` | Protege as páginas! Impede que usuários sem token acessem o painel de produtos. | 🔒 |
| `carregarCampos` | Preenche automaticamente as opções de *Categoria*, *Tamanho* e *Tipo de Produto* consumindo dados em tempo real da API. | 🏷️ |
| **Drag and Drop Image** | Permite arrastar uma imagem para a área de upload ou clicar para selecionar, gerando um preview instantâneo. | 🖼️ |
| `uploadImagem` | Envia o arquivo de imagem diretamente para o serviço de nuvem do **Cloudinary** e recupera a URL segura. | ☁️ |

---

---

## 🔒 Comunicação com o Back-end (Exemplo Prático)

Quando o administrador envia o formulário de um novo doce, o JavaScript intercepta o evento e dispara uma requisição estruturada contendo o token de segurança no cabeçalho `x-access-token`. ✨

### 🌈 Formato da Carga (JSON)

```json
{
  "nome": "Fizzing Whizzbees",
  "descricao": "Chocolate ao leite com recheio estalante que faz o bruxo levitar!",
  "quantidade_estoque": 150,
  "imagem_url": "[https://res.cloudinary.com/dlb0dkfbs/image/upload/v1/honeydukes/fizzing.png](https://res.cloudinary.com/dlb0dkfbs/image/upload/v1/honeydukes/fizzing.png)",
  "unidade_produto": 1,
  "quantidade_sabores": 1,
  "id_tamanho": 2,
  "id_tipo_produto": 1,
  "categoria": [
    { "id": 3 }
  ]
}

```

## 👨‍💻 Desenvolvedores

<table style="border: none;">
  <tr>
    <td align="center">
      <a href="https://github.com/alvesthzin-art">
        <img src="https://github.com/alvesthzin-art.png" width="100px;" alt="Avatar"/><br />
        <sub><b>@alvesthzin-art</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/maxsz06">
        <img src="https://github.com/maxsz06.png" width="100px;" alt="Avatar"/><br />
        <sub><b>@maxsz06</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Dilansty">
        <img src="https://github.com/Dilansty.png" width="100px;" alt="Avatar"/><br />
        <sub><b>@Dilansty</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Bryalvz">
        <img src="https://images.weserv.nl/?url=github.com/Bryalvz.png" width="100px;" alt="Avatar"/><br />
        <sub><b>@Bryalvz</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/pedroday813-create">
        <img src="https://github.com/pedroday813-create.png" width="100px;" alt="Avatar"/><br />
        <sub><b>@pedroday813-create</b></sub>
      </a>
    </td>
  </tr>
</table>
