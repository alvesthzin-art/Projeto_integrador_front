const USUARIO_TESTE = {
    email: "admin@honeydukes.com",
    senha: "123456",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsImlhdCI6MTc4MTc4NTQ4NCwiZXhwIjoxNzgxNzg1NTQ0fQ.oxMwyCP3gLRe6qOwhrBGMRei1kCeG8geVaojuyG7Wxc"
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
        if (email === USUARIO_TESTE.email && senha === USUARIO_TESTE.senha) {
            // Salva o token de teste e registra o horário inicial
            salvarSessao(USUARIO_TESTE.token);
            console.log('Login de teste efetuado com sucesso!');
            
            // 🛠️ CORRIGIDO: Mudado de principal.html para index.html
            window.location.href = '../tela_principal/index.html';
            return;
        }

        // --- INTEGRAÇÃO COM O BACKEND ---
        const response = await fetch('/v1/senai/admin/login', {
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
        
        // Salva o token real vindo do back-end e registra o horário inicial
        salvarSessao(data.token);
        
        console.log('Login via API efetuado com sucesso!');
        window.location.href = '../tela_principal/index.html';

    } catch (error) {
        console.error('Erro na autenticação:', error);
        alert(error.message);
    }
} 

async function buscarDados() {
    const token = localStorage.getItem('token_honeydukes');
    const loginTime = localStorage.getItem('login_time_honeydukes');
    const horaAtual = new Date().getTime();
    
    // Configuração do tempo de expiração no front: 60 minutos em milissegundos
    const TEMPO_EXPIRACAO = 60 * 60 * 1000; 

    // Verificação de tempo no Front-End: Se passou de 60 minutos desde o login
    if (loginTime && (horaAtual - loginTime > TEMPO_EXPIRACAO)) {
        console.warn('Sessão expirada pelo limite de 60 minutos no front-end.');
        localStorage.removeItem('token_honeydukes');
        localStorage.removeItem('login_time_honeydukes');
        alert('Sua sessão expirou (60 minutos). Por favor, faça login novamente.');
        window.location.href = '../login_administrador/admin.html';
        return;
    }

    // Se o token não existir, redireciona para o login
    if (!token) {
        console.warn('Nenhum token encontrado. Redirecionando para o login...');
        window.location.href = '../login_administrador/admin.html'; 
        return;
    }

    try {
        const response = await fetch('/v1/senai/admin/admin', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Verificação de segurança caso o Back-End invalide o token antes do Front
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token_honeydukes');
            localStorage.removeItem('login_time_honeydukes');
            alert('Acesso negado ou sessão expirada no servidor. Faça login novamente.');
            window.location.href = '../login_administrador/admin.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dados do administrador carregados:', data);
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
}