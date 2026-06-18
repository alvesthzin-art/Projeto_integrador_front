// Inicializa com sua Public Key do EmailJS
emailjs.init("_xdcMcAgC0gTH12cG"); // <-- pega no painel do EmailJS

function enviarLink() {
    const emailInput = document.getElementById('email-recuperar');
    const emailValue = emailInput.value.trim();

    if (!emailValue) {
        alert('Por favor, digite o seu e-mail cadastrado antes de prosseguir.');
        return;
    }

    // Parâmetros que serão inseridos no template do EmailJS
    const templateParams = {
        to_email: emailValue,
        link_recuperacao: "https://seusite.com/nova-senha?token=GERADO_AQUI"
    };

    emailjs.send("service_4h3pc0h", "template_clw7zsv", templateParams)
        .then(() => {
            alert(`Se o e-mail "${emailValue}" estiver cadastrado, o link de recuperação foi enviado!`);
            emailInput.value = '';
        })
        .catch((erro) => {
            console.error("Erro ao enviar:", erro);
            alert("Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.");
        });
}
