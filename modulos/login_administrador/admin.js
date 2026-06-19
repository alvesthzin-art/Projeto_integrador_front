const USUARIO_TESTE = {
    email: "honetDukes@gmail.com",
    senha: "honeyDukes123",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTc4MTg2NzQ1NiwiZXhwIjoxNzgxOTUzODU2fQ.placeholder"
};

function toggleSenha() {
    const input = document.getElementById('senha');
    const icone = document.getElementById('icone-olho');
    if (input.type === 'password') {
        input.type = 'text';
        icone.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icone.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Função auxiliar para salvar o token junto com o horário atual
function salvarSessao(token) {
    const horaAtual = new Date().getTime(); // Tempo atual em milissegundos
    localStorage.setItem('token_honeydukes', token);
    localStorage.setItem('login_time_honeydukes', horaAtual);
}

async function fazerLogin() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        alert('Por favor, preencha e-mail e senha.');
        return;
    }

    try {
        // --- INTEGRAÇÃO COM O BACKEND ---
        const response = await fetch('http://localhost:8080/v1/senai/admin/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            throw new Error('E-mail ou senha incorretos.');
        }

        const data = await response.json();

        // Ajuste conforme o formato real de resposta da sua API
        const tokenRecebido = data.token || data.response?.token || data.response;

        // Salva o token real vindo do back-end e registra o horário inicial
        salvarSessao(tokenRecebido);

        console.log('Login via API efetuado com sucesso!');
        window.location.href = '../cadastrarProduto/index.html';

    } catch (error) {
        console.error('Erro na autenticação:', error);
        alert(error.message);
    }
}