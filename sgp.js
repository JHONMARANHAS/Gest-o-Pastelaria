// Mostrar cadastro
function mostrarCadastro() {
  document.getElementById("login-box").classList.add("hidden");
  document.getElementById("cadastro-box").classList.remove("hidden");
}

// Mostrar login
function mostrarLogin() {
  document.getElementById("cadastro-box").classList.add("hidden");
  document.getElementById("login-box").classList.remove("hidden");
}

// Cadastrar usuário
function cadastrarUsuario() {
  const nome = document.getElementById("cadastro-nome").value;
  const usuario = document.getElementById("cadastro-usuario").value;
  const senha = document.getElementById("cadastro-senha").value;

  if (!nome || !usuario || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.find(u => u.login === usuario)) {
    alert("Usuário já existe!");
    return;
  }

  usuarios.push({
    nome: nome,
    login: usuario,
    senha: senha,
    dataCadastro: new Date().toISOString()
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Cadastro realizado com sucesso!");
  mostrarLogin();
}

// Login usuário
function loginUsuario() {
  const usuario = document.getElementById("login-usuario").value;
  const senha = document.getElementById("login-senha").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const user = usuarios.find(u => u.login === usuario && u.senha === senha);

  if (!user) {
    alert("Usuário ou senha incorretos!");
    return;
  }

  if (!verificarAtivo(user)) {
    alert("Seu período de teste expirou. Contate o administrador.");
    return;
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(user));
  abrirDashboard(user);
}

// Verifica se usuário ainda está no prazo de teste
function verificarAtivo(user) {
  const hoje = new Date();
  const cadastro = new Date(user.dataCadastro);
  const diff = Math.floor((hoje - cadastro) / (1000 * 60 * 60 * 24));
  return diff < 7; // 7 dias de teste
}

// Abre o painel do usuário
function abrirDashboard(user) {
  document.getElementById("login-box").classList.add("hidden");
  document.getElementById("cadastro-box").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");

  document.getElementById("usuario-nome").textContent = user.nome;

  const hoje = new Date();
  const cadastro = new Date(user.dataCadastro);
  const diff = Math.floor((hoje - cadastro) / (1000 * 60 * 60 * 24));
  const diasRestantes = 7 - diff;

  document.getElementById("dias-restantes").textContent =
    diasRestantes > 0
      ? `⏳ Seu teste expira em ${diasRestantes} dias`
      : "🚫 Seu teste expirou";
}

// Logout usuário
function logoutUsuario() {
  localStorage.removeItem("usuarioLogado");
  document.getElementById("dashboard").classList.add("hidden");
  mostrarLogin();
}

// Autologin se já logado
window.onload = function() {
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (user && verificarAtivo(user)) {
    abrirDashboard(user);
  }
};
