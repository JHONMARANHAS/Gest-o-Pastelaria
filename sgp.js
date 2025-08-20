// --- LOGIN ---
const adminUser = "jhonmaranhas";
const adminPass = "J61772165360j";

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === adminUser && password === adminPass) {
    loginScreen.style.display = "none";
    adminPanel.style.display = "block";
    carregarDashboard();
    renderClientes();
    renderPlanos();
  } else {
    loginError.style.display = "block";
  }
});

function logout() {
  adminPanel.style.display = "none";
  loginScreen.style.display = "block";
}

// --- NAVEGAÇÃO ---
function showSection(id) {
  document.querySelectorAll(".content section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// --- CLIENTES ---
let clientes = JSON.parse(localStorage.getItem("clientes")) || [
  { nome: "Carlos Silva", email: "carlos@email.com", status: "Ativo", dias: 15 },
  { nome: "Maria Souza", email: "maria@email.com", status: "Vencido", dias: 0 }
];

function salvarClientes() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
  carregarDashboard();
  renderClientes();
}

// Renderizar tabela de clientes
function renderClientes() {
  const tbody = document.querySelector("#clientesTable tbody");
  tbody.innerHTML = "";
  clientes.forEach((c, i) => {
    let row = `<tr>
      <td>${c.nome}</td>
      <td>${c.email}</td>
      <td>${c.status}</td>
      <td>${c.dias}</td>
      <td>
        <button onclick="renovarCliente(${i})">Renovar</button>
        <button onclick="excluirCliente(${i})">Excluir</button>
      </td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function renovarCliente(i) {
  let meses = prompt("Quantos meses deseja renovar?");
  if (meses && !isNaN(meses)) {
    clientes[i].status = "Ativo";
    clientes[i].dias = parseInt(meses) * 30;
    salvarClientes();
  }
}

function excluirCliente(i) {
  if (confirm("Deseja realmente excluir este cliente?")) {
    clientes.splice(i, 1);
    salvarClientes();
  }
}

// --- PLANOS ---
let planos = JSON.parse(localStorage.getItem("planos")) || [];

function salvarPlanos() {
  localStorage.setItem("planos", JSON.stringify(planos));
  renderPlanos();
}

document.getElementById("planoForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let nome = document.getElementById("planoNome").value;
  let meses = document.getElementById("planoMeses").value;
  let valor = document.getElementById("planoValor").value;

  let acessos = [];
  if (document.getElementById("acessoDashboard").checked) acessos.push("Dashboard");
  if (document.getElementById("acessoProdutos").checked) acessos.push("Produtos");
  if (document.getElementById("acessoFinanceiro").checked) acessos.push("Financeiro");
  if (document.getElementById("acessoDRE").checked) acessos.push("DRE");

  planos.push({ nome, meses, valor, acessos });
  salvarPlanos();
  this.reset();
});

function renderPlanos() {
  const tbody = document.querySelector("#planosTable tbody");
  tbody.innerHTML = "";
  planos.forEach((p, i) => {
    let row = `<tr>
      <td>${p.nome}</td>
      <td>${p.meses}</td>
      <td>R$ ${p.valor}</td>
      <td>${p.acessos.join(", ")}</td>
      <td><button onclick="excluirPlano(${i})">Excluir</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function excluirPlano(i) {
  if (confirm("Deseja excluir este plano?")) {
    planos.splice(i, 1);
    salvarPlanos();
  }
}

// --- DASHBOARD ---
function carregarDashboard() {
  document.getElementById("totalClientes").innerText = clientes.length;
  document.getElementById("ativosClientes").innerText = clientes.filter(c => c.status === "Ativo").length;
  document.getElementById("vencidosClientes").innerText = clientes.filter(c => c.status === "Vencido").length;

  const ctx = document.getElementById("graficoClientes").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Ativos", "Vencidos"],
      datasets: [{
        data: [
          clientes.filter(c => c.status === "Ativo").length,
          clientes.filter(c => c.status === "Vencido").length
        ]
      }]
    }
  });
}
