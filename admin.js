// ==========================
// Dados iniciais
// ==========================
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let planos = JSON.parse(localStorage.getItem("planos")) || [];

// ==========================
// Exibir seções
// ==========================
function showAdminSection(id) {
  document.querySelectorAll(".admin-section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "dashboard-admin") carregarDashboard();
  if (id === "clientes-admin") carregarClientes();
  if (id === "planos-admin") carregarPlanos();
}

// ==========================
// Logout
// ==========================
function logoutAdmin() {
  localStorage.removeItem("adminLogado");
  window.location.href = "index.html";
}

// ==========================
// Dashboard
// ==========================
function carregarDashboard() {
  const total = clientes.length;
  const ativos = clientes.filter(c => c.status === "ativo").length;
  const vencidos = clientes.filter(c => c.status === "vencido").length;

  document.getElementById("totalClientes").innerText = total;
  document.getElementById("clientesAtivos").innerText = ativos;
  document.getElementById("clientesVencidos").innerText = vencidos;

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

// ==========================
// Clientes
// ==========================
function carregarClientes() {
  const tabela = document.getElementById("tabelaClientes");
  tabela.innerHTML = "";

  clientes.forEach((c, index) => {
    const diasRestantes = calcularDiasRestantes(c);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.usuario}</td>
      <td>${c.email || "-"}</td>
      <td>${c.status}</td>
      <td>${diasRestantes > 0 ? diasRestantes : 0}</td>
      <td>${c.plano ? c.plano.nome : "-"}</td>
      <td>
        <button onclick="renovarCliente(${index})">Renovar</button>
        <button onclick="removerCliente(${index})">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

function calcularDiasRestantes(cliente) {
  if (!cliente.dataFim) return 0;
  const hoje = new Date();
  const fim = new Date(cliente.dataFim);
  const diff = Math.ceil((fim - hoje) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function renovarCliente(index) {
  const meses = parseInt(prompt("Quantos meses deseja adicionar?"));
  if (!meses || meses <= 0) return;

  const cliente = clientes[index];
  let dataFim = cliente.dataFim ? new Date(cliente.dataFim) : new Date();
  dataFim.setMonth(dataFim.getMonth() + meses);

  cliente.dataFim = dataFim.toISOString();
  cliente.status = "ativo";

  salvarClientes();
  carregarClientes();
  carregarDashboard();
}

function removerCliente(index) {
  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    clientes.splice(index, 1);
    salvarClientes();
    carregarClientes();
    carregarDashboard();
  }
}

function salvarClientes() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

// ==========================
// Planos de Acesso
// ==========================
function criarPlano() {
  const nome = document.getElementById("nomePlano").value;
  const duracao = parseInt(document.getElementById("duracaoPlano").value);
  const valor = parseFloat(document.getElementById("valorPlano").value);

  if (!nome || !duracao || !valor) {
    alert("Preencha todos os campos!");
    return;
  }

  const permissoes = {
    dashboard: document.getElementById("permDashboard").checked,
    produtos: document.getElementById("permProdutos").checked,
    gestao: document.getElementById("permGestao").checked,
    financeiro: document.getElementById("permFinanceiro").checked,
    precificacao: document.getElementById("permPrecificacao").checked,
    dre: document.getElementById("permDre").checked
  };

  planos.push({ nome, duracao, valor, permissoes });
  salvarPlanos();
  carregarPlanos();

  document.getElementById("nomePlano").value = "";
  document.getElementById("duracaoPlano").value = "";
  document.getElementById("valorPlano").value = "";
}

function carregarPlanos() {
  const tabela = document.getElementById("tabelaPlanos");
  tabela.innerHTML = "";

  planos.forEach((p, index) => {
    const permissoes = Object.keys(p.permissoes)
      .filter(key => p.permissoes[key])
      .join(", ");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.duracao} meses</td>
      <td>R$ ${p.valor.toFixed(2)}</td>
      <td>${permissoes || "-"}</td>
      <td>
        <button onclick="atribuirPlano(${index})">Atribuir</button>
        <button onclick="removerPlano(${index})">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

function atribuirPlano(indexPlano) {
  const usuario = prompt("Digite o usuário para atribuir este plano:");
  const cliente = clientes.find(c => c.usuario === usuario);

  if (!cliente) {
    alert("Cliente não encontrado!");
    return;
  }

  const plano = planos[indexPlano];
  cliente.plano = plano;

  let dataFim = new Date();
  dataFim.setMonth(dataFim.getMonth() + plano.duracao);

  cliente.dataFim = dataFim.toISOString();
  cliente.status = "ativo";

  salvarClientes();
  carregarClientes();
  carregarDashboard();
}

function removerPlano(index) {
  if (confirm("Tem certeza que deseja excluir este plano?")) {
    planos.splice(index, 1);
    salvarPlanos();
    carregarPlanos();
  }
}

function salvarPlanos() {
  localStorage.setItem("planos", JSON.stringify(planos));
}

// ==========================
// Inicialização
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();
});
