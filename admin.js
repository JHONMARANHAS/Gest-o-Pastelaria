function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", function() {
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
    document.querySelector(this.getAttribute("href")).classList.add("active");
  });
});

function carregarClientes() {
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  let tabela = document.querySelector("#tabelaClientes tbody");
  tabela.innerHTML = "";

  clientes.forEach(c => {
    let diasRestantes = c.diasRestantes || 0;
    let status = diasRestantes > 0 ? "Ativo" : "Vencido";

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.username}</td>
      <td>${status}</td>
      <td>${c.plano || "-"}</td>
      <td>${diasRestantes}</td>
      <td><button onclick="renovarCliente('${c.username}')">Renovar</button></td>
    `;
    tabela.appendChild(tr);
  });

  document.getElementById("totalClientes").textContent = clientes.length;
  document.getElementById("clientesAtivos").textContent = clientes.filter(c => (c.diasRestantes || 0) > 0).length;
  document.getElementById("clientesVencidos").textContent = clientes.filter(c => (c.diasRestantes || 0) <= 0).length;
}

function renovarCliente(username) {
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  let cliente = clientes.find(c => c.username === username);
  if (cliente) {
    cliente.diasRestantes = 30;
    localStorage.setItem("clientes", JSON.stringify(clientes));
    carregarClientes();
  }
}

document.getElementById("formPlano").addEventListener("submit", function(e) {
  e.preventDefault();
  let planos = JSON.parse(localStorage.getItem("planos")) || [];

  let plano = {
    nome: document.getElementById("nomePlano").value,
    duracao: parseInt(document.getElementById("duracaoPlano").value),
    valor: parseFloat(document.getElementById("valorPlano").value),
    recursos: document.getElementById("recursosPlano").value
  };

  planos.push(plano);
  localStorage.setItem("planos", JSON.stringify(planos));
  carregarPlanos();
});

function carregarPlanos() {
  let planos = JSON.parse(localStorage.getItem("planos")) || [];
  let lista = document.getElementById("listaPlanos");
  lista.innerHTML = "";
  planos.forEach(p => {
    let div = document.createElement("div");
    div.innerHTML = `<strong>${p.nome}</strong> - ${p.duracao} meses - R$${p.valor.toFixed(2)}<br>Recursos: ${p.recursos}`;
    lista.appendChild(div);
  });
}

carregarClientes();
carregarPlanos();
