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

// Precificação
document.getElementById("formPrecificacao").addEventListener("submit", function(e) {
  e.preventDefault();
  let nome = document.getElementById("produtoNome").value;
  let custo = parseFloat(document.getElementById("custo").value);
  let margem = parseFloat(document.getElementById("margem").value);

  let preco = custo + (custo * (margem / 100));
  document.getElementById("resultadoPrecificacao").textContent = `Preço sugerido para ${nome}: R$ ${preco.toFixed(2)}`;
});

// Compras
document.getElementById("formCompra").addEventListener("submit", function(e) {
  e.preventDefault();
  let fornecedor = document.getElementById("fornecedor").value;
  let valor = parseFloat(document.getElementById("valorCompra").value);
  let data = document.getElementById("dataCompra").value;

  let compras = JSON.parse(localStorage.getItem("compras")) || [];
  compras.push({ fornecedor, valor, data });
  localStorage.setItem("compras", JSON.stringify(compras));

  carregarCompras();
});

document.getElementById("formNotaFiscal").addEventListener("submit", function(e) {
  e.preventDefault();
  let codigo = document.getElementById("codigoNota").value;
  alert("Itens da nota " + codigo + " carregados (exemplo).");
});

function carregarCompras() {
  let compras = JSON.parse(localStorage.getItem("compras")) || [];
  let tabela = document.querySelector("#tabelaCompras tbody");
  tabela.innerHTML = "";

  compras.forEach(c => {
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${c.fornecedor}</td><td>R$${c.valor.toFixed(2)}</td><td>${c.data}</td>`;
    tabela.appendChild(tr);
  });
}

carregarCompras();

// Gráficos
const ctx = document.getElementById("graficoVendas");
new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Jan", "Fev", "Mar"],
    datasets: [{ label: "Vendas", data: [1000, 1500, 1200] }]
  }
});

const ctx2 = document.getElementById("graficoFinanceiro");
new Chart(ctx2, {
  type: "bar",
  data: {
    labels: ["Receita", "Despesas"],
    datasets: [{ label: "R$", data: [5000, 3200] }]
  }
});

const ctx3 = document.getElementById("graficoFluxoCaixa");
new Chart(ctx3, {
  type: "pie",
  data: {
    labels: ["Entrada", "Saída"],
    datasets: [{ data: [4000, 2000] }]
  }
});

const ctx4 = document.getElementById("graficoCompras");
new Chart(ctx4, {
  type: "bar",
  data: {
    labels: ["Semana 1", "Semana 2", "Semana 3"],
    datasets: [{ label: "Compras (R$)", data: [800, 1200, 600] }]
  }
});
