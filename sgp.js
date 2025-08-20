// ===== DADOS LOCAIS =====
let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
let estoque = JSON.parse(localStorage.getItem("estoque")) || [];
let receitas = JSON.parse(localStorage.getItem("receitas")) || [];
let financas = JSON.parse(localStorage.getItem("financas")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [{usuario:"admin", senha:"123"}];

// ===== SALVAR =====
function salvar(){
  localStorage.setItem("vendas", JSON.stringify(vendas));
  localStorage.setItem("estoque", JSON.stringify(estoque));
  localStorage.setItem("receitas", JSON.stringify(receitas));
  localStorage.setItem("financas", JSON.stringify(financas));
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// ===== SEÇÕES =====
function mostrarSecao(id){
  document.querySelectorAll(".sec").forEach(sec=>sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if(id==="sec-dashboard"){ renderDashboard(); renderGraficos(); }
}

// ===== VENDAS =====
function registrarVenda(){
  let valor = Math.floor(Math.random()*50)+10;
  let venda = {valor, data: new Date().toLocaleString()};
  vendas.push(venda);
  financas.push({tipo:"entrada", valor, data: venda.data});
  salvar();
  renderVendas();
  renderDashboard();
  renderGraficos();
}
function renderVendas(){
  let ul = document.getElementById("lista-vendas");
  ul.innerHTML = "";
  vendas.forEach(v=>{
    let li = document.createElement("li");
    li.textContent = `${v.data} - R$ ${v.valor}`;
    ul.appendChild(li);
  });
}

// ===== ESTOQUE =====
function adicionarItem(){
  let nome = document.getElementById("novoItem").value;
  let qtd = parseInt(document.getElementById("qtdItem").value);
  if(!nome||!qtd) return;
  estoque.push({nome, qtd});
  salvar();
  renderEstoque();
  document.getElementById("novoItem").value="";
  document.getElementById("qtdItem").value="";
}
function renderEstoque(){
  let ul = document.getElementById("lista-estoque");
  ul.innerHTML = "";
  estoque.forEach(item=>{
    let li = document.createElement("li");
    li.textContent = `${item.nome} - ${item.qtd} un.`;
    ul.appendChild(li);
  });
}

// ===== RECEITAS =====
function adicionarReceita(){
  let nome = document.getElementById("novaReceita").value;
  if(!nome) return;
  receitas.push({nome});
  salvar();
  renderReceitas();
  document.getElementById("novaReceita").value="";
}
function renderReceitas(){
  let ul = document.getElementById("lista-receitas");
  ul.innerHTML = "";
  receitas.forEach(r=>{
    let li = document.createElement("li");
    li.textContent = r.nome;
    ul.appendChild(li);
  });
}

// ===== FINANÇAS =====
function renderFinancas(){
  let ul = document.getElementById("lista-financas");
  ul.innerHTML = "";
  financas.forEach(f=>{
    let li = document.createElement("li");
    li.textContent = `${f.data} - ${f.tipo} R$ ${f.valor}`;
    ul.appendChild(li);
  });
}

// ===== USUÁRIOS =====
function adicionarUsuario(){
  let usuario = document.getElementById("novoUsuario").value;
  let senha = document.getElementById("novaSenha").value;
  if(!usuario||!senha) return;
  usuarios.push({usuario, senha});
  salvar();
  renderUsuarios();
  document.getElementById("novoUsuario").value="";
  document.getElementById("novaSenha").value="";
}
function renderUsuarios(){
  let ul = document.getElementById("lista-usuarios");
  ul.innerHTML = "";
  usuarios.forEach(u=>{
    let li = document.createElement("li");
    li.textContent = u.usuario;
    ul.appendChild(li);
  });
}

// ===== DASHBOARD =====
function renderDashboard(){
  // vendas hoje
  let hoje = new Date().toLocaleDateString();
  let vendasHoje = vendas.filter(v=>v.data.includes(hoje));
  let totalHoje = vendasHoje.reduce((s,v)=>s+v.valor,0);
  document.getElementById("dash-vendas-hoje").textContent = `R$ ${totalHoje}`;

  // estoque baixo
  let baixo = estoque.filter(i=>i.qtd<5).length;
  document.getElementById("dash-estoque-baixo").textContent = baixo;

  // receitas
  document.getElementById("dash-receitas").textContent = receitas.length;

  // usuários
  document.getElementById("dash-usuarios").textContent = usuarios.length;

  // alertas
  let ul = document.getElementById("lista-alertas");
  ul.innerHTML="";
  estoque.filter(i=>i.qtd<5).forEach(i=>{
    let li = document.createElement("li");
    li.textContent = `⚠️ Estoque baixo: ${i.nome} (${i.qtd} un.)`;
    ul.appendChild(li);
  });
}

// ===== GRÁFICOS =====
let chartVendasSemana, chartCaixa;
function renderGraficos(){
  let dias = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  let vendasSemana = [5,8,3,7,6,10,4].map(v=>v*10); // fictício
  let caixa = [200,350,150,400,280,500,300];

  if(chartVendasSemana) chartVendasSemana.destroy();
  chartVendasSemana = new Chart(document.getElementById("chart-vendas-semana"), {
    type: "bar",
    data: { labels: dias, datasets: [{ label:"Vendas (R$)", data: vendasSemana, backgroundColor: "#4cafef" }] },
    options: { responsive: true, plugins: { legend: { display:false } } }
  });

  if(chartCaixa) chartCaixa.destroy();
  chartCaixa = new Chart(document.getElementById("chart-caixa"), {
    type: "line",
    data: { labels: dias, datasets: [{ label:"Caixa (R$)", data: caixa, borderColor:"#ffcc00", backgroundColor:"rgba(255,204,0,0.3)", fill:true, tension:0.3 }] },
    options: { responsive: true }
  });
}

// ===== INICIALIZAÇÃO =====
function init(){
  renderVendas();
  renderEstoque();
  renderReceitas();
  renderFinancas();
  renderUsuarios();
  renderDashboard();
  renderGraficos();
}
init();
