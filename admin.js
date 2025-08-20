// ======================= LOGIN ADMIN =======================
function loginAdmin() {
  const usuario = document.getElementById("adminUsuario").value;
  const senha = document.getElementById("adminSenha").value;

  if (usuario === "jhonmaranhas" && senha === "J61772165360j") {
    localStorage.setItem("adminLogado", "true");
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "flex";
    carregarDashboard();
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

function logoutAdmin() {
  localStorage.removeItem("adminLogado");
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminLogin").style.display = "flex";
}

// Verifica sessão
window.onload = () => {
  if (localStorage.getItem("adminLogado") === "true") {
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "flex";
    carregarDashboard();
  }
};

// ======================= TROCA DE SEÇÕES =======================
function showAdminSection(section) {
  document.querySelectorAll(".admin-section").forEach(sec => {
    sec.style.display = "none";
  });
  document.getElementById(section).style.display = "block";
  if (section === "dashboard") carregarDashboard();
  if (section === "clientes") carregarClientes();
  if (section === "planos") carregarPlanos();
}

// ======================= CLIENTES =======================
function carregarClientes() {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const tabela = document.getElementById("tabelaClientes");
  tabela.innerHTML = "";

  clientes.forEach((c, index) => {
    const hoje = new Date();
    const vencimento = new Date(c.vencimento);
    const diasRestantes = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    const status = diasRestantes > 0 ? "Ativo" : "Vencido";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.usuario}</td>
      <td>${c.email || "-"}</td>
      <td>${status}</td>
      <td>${diasRestantes > 0 ? diasRestantes : 0}</td>
      <td>
        <button onclick="renovarCliente(${index})">Renovar</button>
        <button onclick="removerCliente(${index})">Remover</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

function removerCliente(index) {
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes.splice(index, 1);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  carregarClientes();
}

// Renovar cliente escolhendo plano
function renovarCliente(index) {
  const planos = JSON.parse(localStorage.getItem("planos")) || [];
  if (planos.length === 0) {
    alert("Nenhum plano cadastrado!");
    return;
  }

  let escolha = prompt(
    "Digite o número do plano para renovar:\n" +
    planos.map((p, i) => `${i+1} - ${p.nome} (${p.duracao} dias) R$${p.valor}`).join("\n")
  );

  escolha = parseInt(escolha);
  if (!escolha || escolha < 1 || escolha > planos.length) return;

  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  let cliente = clientes[index];

  const plano = planos[escolha - 1];
  const hoje = new Date();
  let novaData = new Date();
  novaData.setDate(hoje.getDate() + parseInt(plano.duracao));

  cliente.vencimento = novaData.toISOString().split("T")[0];
  cliente.plano = plano.nome;

  clientes[index] = cliente;
  localStorage.setItem("clientes", JSON.stringify(clientes));
  carregarClientes();
  carregarDashboard();
}

// ======================= PLANOS =======================
function criarPlano() {
  const nome = document.getElementById("nomePlano").value;
  const duracao = document.getElementById("duracaoPlano").value;
  const valor = document.getElementById("valorPlano").value;
  const acessos = document.getElementById("acessosPlano").value;

  if (!nome || !duracao || !valor || !acessos) {
    alert("Preencha todos os campos!");
    return;
  }

  let planos = JSON.parse(localStorage.getItem("planos")) || [];
  planos.push({ nome, duracao, valor, acessos });
  localStorage.setItem("planos", JSON.stringify(planos));

  document.getElementById("formPlano").reset();
  carregarPlanos();
}

function carregarPlanos() {
  const planos = JSON.parse(localStorage.getItem("planos")) || [];
  const tabela = document.getElementById("tabelaPlanos");
  tabela.innerHTML = "";

  planos.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.duracao} dias</td>
      <td>R$ ${p.valor}</td>
      <td>${p.acessos}</td>
    `;
    tabela.appendChild(tr);
  });
}

// ======================= DASHBOARD =======================
function carregarDashboard() {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  let ativos = 0, vencidos = 0;

  clientes.forEach(c => {
    const hoje = new Date();
    const vencimento = new Date(c.vencimento);
    const diasRestantes = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    if (diasRestantes > 0) {
      ativos++;
    } else {
      vencidos++;
    }
  });

  document.getElementById("totalClientes").innerText = clientes.length;
  document.getElementById("clientesAtivos").innerText = ativos;
  document.getElementById("clientesVencidos").innerText = vencidos;

  // Atualizar gráfico
  const ctx = document.getElementById("graficoClientes").getContext("2d");
  if (window.graficoClientes) window.graficoClientes.destroy();

  window.graficoClientes = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Ativos", "Vencidos"],
      datasets: [{
        data: [ativos, vencidos],
        backgroundColor: ["#28a745", "#dc3545"]
      }]
    },
    options: { responsive: true }
  });
}
