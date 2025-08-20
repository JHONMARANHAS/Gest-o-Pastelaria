// ==== LOGIN ADMIN ====
const ADMIN_USER = "jhonmaranhas";
const ADMIN_PASS = "J61772165360j";

// Recupera do localStorage
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let planos = JSON.parse(localStorage.getItem("planos")) || [];

// LOGIN
function loginAdmin() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    atualizarDashboard();
    carregarUsuarios();
    carregarPlanos();
  } else {
    document.getElementById("loginError").innerText = "Usuário ou senha incorretos!";
  }
}

function logout() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("loginContainer").style.display = "block";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

// ==== TROCAR DE ABA ====
function showSection(section) {
  document.querySelectorAll("main section").forEach(s => s.classList.add("hidden"));
  if (section === "dashboard") document.getElementById("dashboardSection").classList.remove("hidden");
  if (section === "usuarios") document.getElementById("usuariosSection").classList.remove("hidden");
  if (section === "planos") document.getElementById("planosSection").classList.remove("hidden");
  if (section === "relatorios") document.getElementById("relatoriosSection").classList.remove("hidden");
  if (section === "config") document.getElementById("configSection").classList.remove("hidden");
}

// ==== DASHBOARD ====
function atualizarDashboard() {
  const hoje = new Date();
  let ativos = 0, vencidos = 0;

  usuarios.forEach(u => {
    const diasRestantes = Math.ceil((new Date(u.expira) - hoje) / (1000 * 60 * 60 * 24));
    if (diasRestantes > 0) ativos++; else vencidos++;
  });

  document.getElementById("totalClientes").innerText = usuarios.length;
  document.getElementById("clientesAtivos").innerText = ativos;
  document.getElementById("clientesVencidos").innerText = vencidos;

  // Gráfico
  const ctx = document.getElementById("graficoClientes").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Ativos", "Vencidos"],
      datasets: [{
        data: [ativos, vencidos],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    }
  });
}

// ==== USUÁRIOS ====
function carregarUsuarios() {
  const tabela = document.getElementById("tabelaUsuarios");
  tabela.innerHTML = "";

  const hoje = new Date();

  usuarios.forEach((u, index) => {
    const diasRestantes = Math.ceil((new Date(u.expira) - hoje) / (1000 * 60 * 60 * 24));
    const status = diasRestantes > 0 ? "Ativo" : "Vencido";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.username}</td>
      <td>${status}</td>
      <td>${diasRestantes > 0 ? diasRestantes + " dias" : "Expirado"}</td>
      <td>
        <button onclick="renovarUsuario(${index})">Renovar</button>
        <button onclick="removerUsuario(${index})">Remover</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

function renovarUsuario(index) {
  const meses = prompt("Quantos meses deseja adicionar?");
  if (meses && !isNaN(meses)) {
    let novaData = new Date();
    novaData.setMonth(novaData.getMonth() + parseInt(meses));
    usuarios[index].expira = novaData.toISOString().split("T")[0];
    salvarUsuarios();
    carregarUsuarios();
    atualizarDashboard();
  }
}

function removerUsuario(index) {
  if (confirm("Deseja remover este usuário?")) {
    usuarios.splice(index, 1);
    salvarUsuarios();
    carregarUsuarios();
    atualizarDashboard();
  }
}

function salvarUsuarios() {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// ==== PLANOS ====
function criarPlano(event) {
  event.preventDefault();

  const nome = document.getElementById("planoNome").value;
  const meses = document.getElementById("planoMeses").value;
  const valor = document.getElementById("planoValor").value;
  
  const acessos = [];
  document.querySelectorAll("#formPlano input[type=checkbox]:checked").forEach(c => acessos.push(c.value));

  planos.push({ nome, meses, valor, acessos });
  salvarPlanos();
  carregarPlanos();

  document.getElementById("formPlano").reset();
}

function carregarPlanos() {
  const tabela = document.getElementById("tabelaPlanos");
  tabela.innerHTML = "";

  planos.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.meses}</td>
      <td>R$ ${p.valor}</td>
      <td>${p.acessos.join(", ")}</td>
      <td><button onclick="removerPlano(${index})">Remover</button></td>
    `;
    tabela.appendChild(tr);
  });
}

function removerPlano(index) {
  if (confirm("Deseja remover este plano?")) {
    planos.splice(index, 1);
    salvarPlanos();
    carregarPlanos();
  }
}

function salvarPlanos() {
  localStorage.setItem("planos", JSON.stringify(planos));
}
