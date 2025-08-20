// Credenciais do administrador
const ADMIN_USER = "jhonmaranhas";
const ADMIN_PASS = "J61772165360j";

// Login do Admin
function loginAdmin() {
  const usuario = document.getElementById("admin-usuario").value;
  const senha = document.getElementById("admin-senha").value;

  if (usuario === ADMIN_USER && senha === ADMIN_PASS) {
    document.getElementById("admin-login").classList.add("hidden");
    document.getElementById("admin-dashboard").classList.remove("hidden");
    carregarUsuarios();
  } else {
    alert("Usuário ou senha do admin incorretos!");
  }
}

// Logout
function logoutAdmin() {
  document.getElementById("admin-login").classList.remove("hidden");
  document.getElementById("admin-dashboard").classList.add("hidden");
  document.getElementById("admin-usuario").value = "";
  document.getElementById("admin-senha").value = "";
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

// Renovar usuário (+7 dias a partir de hoje)
function renovarUsuario(index) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios[index].dataCadastro = new Date().toISOString();
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  carregarUsuarios();
  alert("Teste renovado por +7 dias!");
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
