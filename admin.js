// ===== Admin credenciais fixas (solicitadas) =====
const ADMIN_USER = "jhonmaranhas";
const ADMIN_PASS = "J61772165360j";

// ===== Chaves de armazenamento =====
const KEY_CLIENTES = "clientes";
const KEY_PLANOS   = "planos";

function getClientes(){ return JSON.parse(localStorage.getItem(KEY_CLIENTES) || "[]"); }
function setClientes(v){ localStorage.setItem(KEY_CLIENTES, JSON.stringify(v)); }
function getPlanos(){ return JSON.parse(localStorage.getItem(KEY_PLANOS) || "[]"); }
function setPlanos(v){ localStorage.setItem(KEY_PLANOS, JSON.stringify(v)); }

// ===== Login / Logout =====
function adminLogin(){
  const u = document.getElementById("admUser").value.trim();
  const p = document.getElementById("admPass").value;
  if(u===ADMIN_USER && p===ADMIN_PASS){
    document.getElementById("adminLogin").style.display="none";
    document.getElementById("adminPainel").style.display="";
    document.getElementById("adminUser").textContent = `${ADMIN_USER} (admin)`;
    renderTudo();
  }else{
    alert("Usuário ou senha incorretos.");
  }
}
function adminLogout(){
  document.getElementById("adminPainel").style.display="none";
  document.getElementById("adminLogin").style.display="";
  document.getElementById("adminUser").textContent="—";
}

// ===== Util =====
const BRL = v => (v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

function diasRestantes(iso){
  const hoje = new Date();
  const venc = new Date(iso);
  return Math.ceil((venc - hoje)/(1000*60*60*24));
}
function addMeses(date, meses){
  const d = new Date(date);
  d.setMonth(d.getMonth()+meses);
  return d;
}

// ===== Clientes =====
function salvarCliente(){
  const usuario = document.getElementById("cliUser").value.trim();
  const senha   = document.getElementById("cliPass").value;
  const planoId = document.getElementById("cliPlano").value;
  const meses   = parseInt(document.getElementById("cliMeses").value||"0",10);
  const ativo   = document.getElementById("cliAtivo").value==="true";
  const email   = document.getElementById("cliEmail").value.trim();

  if(!usuario) return alert("Informe o usuário.");
  if(!planoId) return alert("Selecione um plano.");
  if(meses<=0) return alert("Meses inválidos.");

  const planos = getPlanos();
  const plano  = planos.find(p=>p.id===planoId);
  if(!plano) return alert("Plano inválido.");

  let clientes = getClientes();
  let cli = clientes.find(c=>c.usuario===usuario);

  const hoje = new Date();
  let vencimentoCalc = addMeses(hoje, meses);

  if(cli){
    // Atualiza
    cli.senha = senha || cli.senha;
    cli.plano = plano.nome;
    cli.planoId = plano.id;
    cli.email = email || cli.email;
    // renova a partir de hoje
    cli.vencimento = vencimentoCalc.toISOString();
    cli.ativo = ativo;
  }else{
    clientes.push({
      usuario, senha: senha||"123",
      email,
      plano: plano.nome,
      planoId: plano.id,
      cadastro: hoje.toISOString(),
      vencimento: vencimentoCalc.toISOString(),
      ativo: ativo
    });
  }
  setClientes(clientes);
  alert("Cliente salvo com sucesso!");
  renderClientes();
  renderKpisEGraficos();
  renderProximos();
}

function renderClientes(){
  const tbl = document.getElementById("tblClientes");
  const clientes = getClientes();
  tbl.innerHTML = `<tr><th>Usuário</th><th>E-mail</th><th>Plano</th><th>Vencimento</th><th>Dias</th><th>Status</th><th>Ações</th></tr>`+
    clientes.map(c=>{
      const dias = diasRestantes(c.vencimento);
      const status = (new Date() <= new Date(c.vencimento) && c.ativo) ? 'Ativo' : 'Vencido';
      return `<tr>
        <td>${c.usuario}</td>
        <td>${c.email||''}</td>
        <td>${c.plano}</td>
        <td>${new Date(c.vencimento).toLocaleDateString()}</td>
        <td>${dias}</td>
        <td>${status}</td>
        <td>
          <button class="btn inline" onclick="renovarCliente('${c.usuario}',1)">+1 mês</button>
          <button class="btn inline" onclick="renovarCliente('${c.usuario}',3)">+3 meses</button>
          <button class="btn inline" onclick="toggleCliente('${c.usuario}')">${c.ativo?'Inativar':'Ativar'}</button>
        </td>
      </tr>`;
    }).join('');
}

function renovarCliente(usuario, meses){
  let clientes = getClientes();
  const idx = clientes.findIndex(c=>c.usuario===usuario);
  if(idx<0) return;
  const base = new Date() > new Date(clientes[idx].vencimento) ? new Date() : new Date(clientes[idx].vencimento);
  const novoVenc = addMeses(base, meses);
  clientes[idx].vencimento = novoVenc.toISOString();
  clientes[idx].ativo = true;
  setClientes(clientes);
  renderClientes(); renderKpisEGraficos(); renderProximos();
}

function toggleCliente(usuario){
  let clientes = getClientes();
  const cli = clientes.find(c=>c.usuario===usuario);
  if(!cli) return;
  cli.ativo = !cli.ativo;
  setClientes(clientes);
  renderClientes();
  renderKpisEGraficos();
  renderProximos();
}

// ===== Planos =====
function salvarPlano(){
  const nome  = document.getElementById("plNome").value.trim();
  const preco = parseFloat(document.getElementById("plPreco").value||"0");
  const meses = parseInt(document.getElementById("plMeses").value||"0",10);
  const recursosSel = [...document.getElementById("plRecursos").selectedOptions].map(o=>o.value);

  if(!nome) return alert("Nome do plano obrigatório.");
  if(meses<=0) return alert("Meses inválidos.");

  let planos = getPlanos();
  let p = planos.find(x=>x.nome.toLowerCase()===nome.toLowerCase());
  const id = p?.id || Math.random().toString(36).slice(2,9);
  const plano = {id, nome, preco, meses, recursos: recursosSel};

  if(p){
    const i = planos.findIndex(x=>x.id===p.id);
    planos[i] = plano;
  }else{
    planos.push(plano);
  }
  setPlanos(planos);
  alert("Plano salvo!");
  renderPlanos();
  fillPlanosSelect();
}

function renderPlanos(){
  const tbl = document.getElementById("tblPlanos");
  const planos = getPlanos();
  tbl.innerHTML = `<tr><th>Plano</th><th>Meses</th><th>Preço</th><th>Recursos</th></tr>`+
    planos.map(p=>`<tr><td>${p.nome}</td><td>${p.meses}</td><td>${BRL(p.preco)}</td><td>${(p.recursos||[]).join(', ')}</td></tr>`).join('');
}

function fillPlanosSelect(){
  const s = document.getElementById("cliPlano");
  if(!s) return;
  s.innerHTML = "";
  getPlanos().forEach(p=>{
    const o = document.createElement("option");
    o.value = p.id; o.textContent = p.nome;
    s.appendChild(o);
  });
}

// ===== KPIs / Gráficos =====
let ch1,ch2;
function renderKpisEGraficos(){
  const clientes = getClientes();
  const totais = clientes.length;
  const ativos = clientes.filter(c=> new Date() <= new Date(c.vencimento) && c.ativo).length;
  const vencidos = totais - ativos;

  document.getElementById("kpiTotais").textContent = totais;
  document.getElementById("kpiAtivos").textContent = ativos;
  document.getElementById("kpiVencidos").textContent = vencidos;

  const ctx1 = document.getElementById("chClientes");
  if(ch1) ch1.destroy();
  ch1 = new Chart(ctx1,{type:'doughnut',data:{labels:['Ativos','Vencidos'],datasets:[{data:[ativos,vencidos]}]}});

  const porPlano = {};
  clientes.forEach(c=>{ porPlano[c.plano]=(porPlano[c.plano]||0)+1; });
  const ctx2 = document.getElementById("chPlanos");
  if(ch2) ch2.destroy();
  ch2 = new Chart(ctx2,{type:'bar',data:{labels:Object.keys(porPlano),datasets:[{label:'Clientes',data:Object.values(porPlano)}]}});
}

function renderProximos(){
  const tbl = document.getElementById("tblProximos");
  const clientes = getClientes().slice().sort((a,b)=> new Date(a.vencimento)-new Date(b.vencimento)).slice(0,10);
  tbl.innerHTML = `<tr><th>Usuário</th><th>Plano</th><th>Vencimento</th><th>Dias</th></tr>`+
    clientes.map(c=>`<tr><td>${c.usuario}</td><td>${c.plano}</td><td>${new Date(c.vencimento).toLocaleDateString()}</td><td>${diasRestantes(c.vencimento)}</td></tr>`).join('');
}

// ===== Inicialização =====
function renderTudo(){
  // cria alguns planos base se não houver
  if(getPlanos().length===0){
    setPlanos([
      {id:'trial7',nome:'Teste 7 dias',preco:0,meses:0,recursos:['dashboard','produtos','gestao','financeiro','precificacao','dre']},
      {id:'mensal',nome:'Mensal',preco:49.9,meses:1,recursos:['dashboard','produtos','gestao','financeiro','precificacao','dre']},
      {id:'anual',nome:'Anual',preco:499,meses:12,recursos:['dashboard','produtos','gestao','financeiro','precificacao','dre']}
    ]);
  }
  fillPlanosSelect();
  renderPlanos();
  renderClientes();
  renderKpisEGraficos();
  renderProximos();
}

document.addEventListener("DOMContentLoaded", ()=>{
  // auto
});
