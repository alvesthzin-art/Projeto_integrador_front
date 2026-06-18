function enviarLink() {
    const emailInput = document.getElementById('email-recuperar');
    const emailValue = emailInput.value.trim();

    if (!emailValue) {
        alert('Por favor, digite o seu e-mail cadastrado antes de prosseguir.');
        return;
    }

    // Exibe confirmação de sucesso para o usuário
    alert(`Se o e-mail "${emailValue}" estiver cadastrado no sistema HoneyDukes, um link de recuperação será enviado em breve!`);
    
    // Limpa o campo após o envio
    emailInput.value = '';
}

