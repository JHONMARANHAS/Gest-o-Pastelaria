// Credenciais fixas do administrador
const ADMIN_LOGIN = "jhonmaranhas";
const ADMIN_SENHA = "J61772165360j";

// Login Admin
function loginAdmin() {
  const login = document.getElementById("admin-login-user").value.trim();
  const senha = document.getElementById("admin-login-pass").value.trim();

  if (login === ADMIN_LOGIN && senha === ADMIN_SENHA) {
    document.getElementById("admin-login").classList.add("hidden");
    document.getElementById("admin-dashboard").classList.remove("hidden");
    carregarUsuarios();
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// Logout Admin
function logoutAdmin() {
  document.getElementById("admin-login").classList.remove("hidden");
  document.getElementById("admin-dashboard").classList.add("hidden");
  document.getElementById("admin-login-user").value = "";
  document.getElementById("admin-login-pass").value = "";
}

// Carregar usuários
function carregarUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const tabela = document.getElementById("usuarios-tabela");
  tabela.innerHTML = "";

  usuarios.forEach((u, index) => {
    const diasRestantes = calcularDiasRestantes(u);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.login}</td>
      <td>${diasRestantes > 0 ? diasRestantes + " dias" : "Expirado"}</td>
      <td>
        <button onclick="renovarUsuario(${index})">🔄 Renovar</button>
        <button onclick="bloquearUsuario(${index})">🚫 Bloquear</button>
        <button onclick="excluirUsuario(${index})">❌ Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

// Calcular dias restantes
function calcularDiasRestantes(usuario) {
  const hoje = new Date();
  const cadastro = new Date(usuario.dataCadastro);
  const diff = Math.floor((hoje - cadastro) / (1000 * 60 * 60 * 24));
  return 7 - diff;
}

// Renovar usuário (7 dias a partir de hoje)
function renovarUsuario(index) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios[index].dataCadastro = new Date().toISOString();
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  carregarUsuarios();
  alert("Usuário renovado por +7 dias!");
}

// Bloquear usuário
function bloquearUsuario(index) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios[index].dataCadastro = new Date("2000-01-01").toISOString();
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  carregarUsuarios();
  alert("Usuário bloqueado!");
}

// Excluir usuário
function excluirUsuario(index) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios.splice(index, 1);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  carregarUsuarios();
  alert("Usuário excluído!");
}
