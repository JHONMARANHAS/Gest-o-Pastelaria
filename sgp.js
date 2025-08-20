// Funções de Autenticação e Cadastro

function mostrarCadastro() {
  document.getElementById("login-box").classList.add("hidden");
  document.getElementById("register-box").classList.remove("hidden");
}

function mostrarLogin() {
  document.getElementById("register-box").classList.add("hidden");
  document.getElementById("login-box").classList.remove("hidden");
}

function cadastrar() {
  const nome = document.getElementById("reg-nome").value.trim();
  const login = document.getElementById("reg-user").value.trim();
  const senha = document.getElementById("reg-pass").value.trim();

  if (!nome || !login || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.some(u => u.login === login)) {
    alert("Usuário já existe!");
    return;
  }

  const novoUsuario = {
    nome,
    login,
    senha,
    dataCadastro: new Date().toISOString()
  };

  usuarios.push(novoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Cadastro realizado! Você tem 7 dias grátis.");
  mostrarLogin();
}

function login() {
  const login = document.getElementById("login-user").value.trim();
  const senha = document.getElementById("login-pass").value.trim();

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuario = usuarios.find(u => u.login === login && u.senha === senha);

  if (!usuario) {
    alert("Usuário ou senha incorretos!");
    return;
  }

  if (!validarAcesso(usuario)) {
    alert("Seu período de teste expirou! Contate o administrador.");
    return;
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");

  const dias = calcularDiasRestantes(usuario);
  document.getElementById("status-conta").innerText =
    `Olá, ${usuario.nome}! Seu teste expira em ${dias} dias.`;
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  document.getElementById("auth-container").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
}

// Validação de acesso
function validarAcesso(usuario) {
  const dias = calcularDiasRestantes(usuario);
  return dias > 0;
}

function calcularDiasRestantes(usuario) {
  const hoje = new Date();
  const cadastro = new Date(usuario.dataCadastro);
  const diff = Math.floor((hoje - cadastro) / (1000 * 60 * 60 * 24));
  return 7 - diff;
}

// Auto-login se já logado
window.onload = () => {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuarioLogado && validarAcesso(usuarioLogado)) {
    document.getElementById("auth-container").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");

    const dias = calcularDiasRestantes(usuarioLogado);
    document.getElementById("status-conta").innerText =
      `Olá, ${usuarioLogado.nome}! Seu teste expira em ${dias} dias.`;
  }
};
