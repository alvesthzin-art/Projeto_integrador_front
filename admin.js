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

function fazerLogin() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    
    if (!email || !senha) {
        alert('Por favor, preencha e-mail e senha.');
        return;
    }
    
    // integração com backend/autenticação /DEPOIS DE TERMINAR O BACK/
    console.log('Login:', email);

} 

// Agora a função buscarDados fica livre do lado de fora:
async function buscarDados() {
    try {
        const response = await fetch('/v1/senai/admin/admin');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
} 

buscarDados(); 