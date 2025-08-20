// ----------------------
// Controle de abas Login/Cadastro
// ----------------------
function showTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

  document.querySelector(`.tab-button[onclick="showTab('${tab}')"]`).classList.add('active');
  document.getElementById(tab).classList.add('active');
}

// ----------------------
// Cadastro de usuários
// ----------------------
function cadastrar() {
  const usuario = document.getElementById("cadastroUsuario").value;
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;

  if (!usuario || !email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.find(u => u.usuario === usuario)) {
    alert("Usuário já existe!");
    return;
  }

  const dataCadastro = new Date().getTime();

  usuarios.push({
    usuario,
    email,
    senha,
    dataCadastro,
    ativo: true,
    plano: "Teste 7 dias"
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Cadastro realizado com sucesso! Faça login.");
  showTab('login');
}

// ----------------------
// Login de usuários
// ----------------------
function login() {
  const usuario = document.getElementById("loginUsuario").value;
  const senha = document.getElementById("loginSenha").value;

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if (!user) {
    alert("Usuário ou senha incorretos!");
    return;
  }

  // Verificação do teste grátis de 7 dias
  const agora = new Date().getTime();
  const diferenca = Math.floor((agora - user.dataCadastro) / (1000 * 60 * 60 * 24));

  if (diferenca > 7 && user.plano === "Teste 7 dias") {
    alert("Seu período de teste expirou! Entre em contato com o administrador.");
    user.ativo = false;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    return;
  }

  if (!user.ativo) {
    alert("Usuário inativo. Contate o administrador.");
    return;
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(user));
  window.location.href = "painel_cliente.html"; // Painel do cliente
}

// ----------------------
// Logout
// ----------------------
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}
