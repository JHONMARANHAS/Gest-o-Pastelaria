/**************************
 * FoodManager — Admin JS *
 **************************/

/* Credenciais do administrador */
const ADMIN_LOGIN = "jhonmaranhas";
const ADMIN_SENHA  = "J61772165360j";

/* Estado */
let usuarios = [];
let editIndex = null;
let chStatus = null;
let chCadastros = null;

/* ===== Util ===== */
const LS_KEY = "usuarios";
const load = () => JSON.parse(localStorage.getItem(LS_KEY) || "[]");
const save = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

function diasRestantes(u) {
  const hoje = new Date();
  const cad = new Date(u.dataCadastro);
  const diff = Math.floor((hoje - cad) / (1000*60*60*24));
  return 7 - diff;
}
function isAtivo(u){ return diasRestantes(u) > 0; }

/* ===== Login Admin ===== */
function loginAdmin() {
  const user = document.getElementById("admin-login-user").value.trim();
  const pass = document.getElementById("admin-login-pass").value.trim();
  if (user === ADMIN_LOGIN && pass === ADMIN_SENHA) {
    document.getElementById("admin-login").classList.add("hidden");
    document.getElementById("admin-dashboard").classList.remove("hidden");
    initAdmin();
  } else {
    alert("Usuário ou senha incorretos!");
  }
}
function logoutAdmin() {
  document.getElementById("admin-login").classList.remove("hidden");
  document.getElementById("admin-dashboard").classList.add("hidden");
  limparCamposLogin();
}
function limparCamposLogin(){
  document.getElementById("admin-login-user").value = "";
  document.getElementById("admin-login-pass").value = "";
}

/* ===== Inicialização ===== */
function initAdmin(){
  usuarios = load();
  renderKPIs();
  renderCharts();
  renderTabela();
}

/* ===== KPIs ===== */
function renderKPIs(){
  const total = usuarios.length;
  const ativos = usuarios.filter(isAtivo).length;
  const vencidos = total - ativos;

  // média de dias restantes (somente quem está ativo; se não houver, 0)
  const ativosArr = usuarios.filter(isAtivo);
  const media = ativosArr.length
    ? Math.round(ativosArr.reduce((s,u)=>s + diasRestantes(u),0) / ativosArr.length)
    : 0;

  // novos últimos 7 dias
  const hoje = new Date();
  const novos7 = usuarios.filter(u => {
    const d = new Date(u.dataCadastro);
    const diff = Math.floor((hoje - d)/(1000*60*60*24));
    return diff <= 7 && diff >= 0;
  }).length;

  document.getElementById("kpi-total").textContent = total;
  document.getElementById("kpi-ativos").textContent = ativos;
  document.getElementById("kpi-vencidos").textContent = vencidos;
  document.getElementById("kpi-media").textContent = media;
  document.getElementById("kpi-novos7").textContent = `${novos7} novos/7d`;

  const pctA = total ? Math.round(ativos/total*100) : 0;
  const pctV = total ? Math.round(vencidos/total*100) : 0;
  document.getElementById("kpi-ativos-pct").textContent = pctA + "%";
  document.getElementById("kpi-vencidos-pct").textContent = pctV + "%";
}

/* ===== Gráficos ===== */
function lastNDates(n){
  const a=[]; for(let i=n-1;i>=0;i--){const d=new Date(); d.setDate(d.getDate()-i); a.push(d.toISOString().slice(0,10));}
  return a;
}
function renderCharts(){
  // Status (pizza/doughnut)
  const ativos = usuarios.filter(isAtivo).length;
  const vencidos = usuarios.length - ativos;

  const ctx1 = document.getElementById("chStatus");
  if(chStatus) chStatus.destroy();
  chStatus = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Ativos', 'Vencidos'],
      datasets: [{
        data: [ativos, vencidos],
        borderWidth: 0
      }]
    },
    options: {
      plugins:{ legend:{ position:'bottom', labels:{ color:'#e5e7eb' } } }
    }
  });

  // Cadastros últimos 30 dias (linha)
  const dias = lastNDates(30);
  const serie = dias.map(d => usuarios.filter(u => (u.dataCadastro || '').slice(0,10) === d).length);

  const ctx2 = document.getElementById("chCadastros");
  if(chCadastros) chCadastros.destroy();
  chCadastros = new Chart(ctx2, {
    type: 'line',
    data: { labels: dias, datasets: [{ label:'Cadastros', data: serie, tension:.3 }] },
    options:{ plugins:{ legend:{ labels:{ color:'#e5e7eb' } } }, scales:{ x:{ ticks:{ color:'#9ca3af'}}, y:{ ticks:{ color:'#9ca3af'}} } }
  });
}

/* ===== Tabela, Filtros e Ordenação ===== */
function renderTabela(){
  const busca = (document.getElementById("flt-busca")?.value || "").toLowerCase();
  const status = document.getElementById("flt-status")?.value || "todos";
  const ord = document.getElementById("flt-ord")?.value || "nome";
  const dir = document.getElementById("flt-dir")?.value || "asc";

  let data = [...usuarios];

  // filtro busca
  if(busca){
    data = data.filter(u => (u.nome||"").toLowerCase().includes(busca) || (u.login||"").toLowerCase().includes(busca));
  }
  // filtro status
  if(status === "ativos") data = data.filter(isAtivo);
  if(status === "vencidos") data = data.filter(u => !isAtivo(u));

  // ordenação
  data.sort((a,b)=>{
    let va, vb;
    switch(ord){
      case "usuario": va=a.login||""; vb=b.login||""; break;
      case "dias": va=diasRestantes(a); vb=diasRestantes(b); break;
      case "data": va=new Date(a.dataCadastro); vb=new Date(b.dataCadastro); break;
      default: va=a.nome||""; vb=b.nome||"";
    }
    if(va<vb) return dir==="asc"? -1: 1;
    if(va>vb) return dir==="asc"? 1: -1;
    return 0;
  });

  const tb = document.getElementById("tb-usuarios");
  tb.innerHTML = "";

  data.forEach((u, idx)=>{
    const dr = diasRestantes(u);
    const statusTxt = dr>0 ? "Ativo" : "Vencido";
    const chipCls = dr>0 ? "ok" : "err";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.nome || "-"}</td>
      <td>${u.login || "-"}</td>
      <td>${(u.dataCadastro || "").slice(0,10)}</td>
      <td>${dr}</td>
      <td><span class="adm-chip ${chipCls}">${statusTxt}</span></td>
      <td>
        <div class="adm-actions">
          <button class="adm-btn" onclick="abrirEditar('${u.login}')">Editar</button>
          <button class="adm-btn" onclick="renovarUsuarioPorLogin('${u.login}', 7)">+7 dias</button>
          <button class="adm-btn warn" onclick="bloquearUsuarioPorLogin('${u.login}')">Bloquear</button>
          <button class="adm-btn err" onclick="excluirUsuarioPorLogin('${u.login}')">Excluir</button>
        </div>
      </td>
    `;
    tb.appendChild(tr);
  });

  // Atualiza KPIs/gráficos após qualquer filtro (mantém números globais)
  renderKPIs();
  renderCharts();
}

/* ===== CRUD Clientes ===== */
function abrirNovoCliente(){
  editIndex = null;
  document.getElementById("edit-title").textContent = "Novo cliente";
  document.getElementById("ed-nome").value = "";
  document.getElementById("ed-login").value = "";
  document.getElementById("ed-senha").value = "";
  document.getElementById("ed-data").value = (new Date()).toISOString().slice(0,10);
  document.getElementById("ed-excluir").classList.add("hidden");
  document.getElementById("modal-edit").style.display = "grid";
}
function abrirEditar(login){
  usuarios = load();
  editIndex = usuarios.findIndex(u => u.login === login);
  if(editIndex < 0){ alert("Cliente não encontrado."); return; }
  const u = usuarios[editIndex];
  document.getElementById("edit-title").textContent = "Editar cliente";
  document.getElementById("ed-nome").value = u.nome || "";
  document.getElementById("ed-login").value = u.login || "";
  document.getElementById("ed-senha").value = u.senha || "";
  document.getElementById("ed-data").value = (u.dataCadastro || new Date().toISOString()).slice(0,10);
  document.getElementById("ed-excluir").classList.remove("hidden");
  document.getElementById("modal-edit").style.display = "grid";
}
function fecharModal(){ document.getElementById("modal-edit").style.display = "none"; }

function salvarAtual(){
  const nome = document.getElementById("ed-nome").value.trim();
  const login = document.getElementById("ed-login").value.trim();
  const senha = document.getElementById("ed-senha").value.trim();
  const data  = document.getElementById("ed-data").value;

  if(!nome || !login || !senha || !data){
    alert("Preencha todos os campos.");
    return;
  }

  usuarios = load();

  if(editIndex === null){
    // novo
    if(usuarios.some(u => u.login === login)){
      alert("Já existe um cliente com esse usuário.");
      return;
    }
    usuarios.push({ nome, login, senha, dataCadastro: new Date(data).toISOString() });
  }else{
    // edição
    const antigo = usuarios[editIndex];
    // se trocar login, verificar duplicidade
    if(login !== antigo.login && usuarios.some(u => u.login === login)){
      alert("Já existe um cliente com esse usuário.");
      return;
    }
    usuarios[editIndex] = { nome, login, senha, dataCadastro: new Date(data).toISOString() };
  }

  save(usuarios);
  fecharModal();
  renderTabela();
  alert("Cliente salvo!");
}
function excluirAtual(){
  if(editIndex === null) return;
  if(!confirm("Excluir este cliente?")) return;
  usuarios = load();
  usuarios.splice(editIndex,1);
  save(usuarios);
  fecharModal();
  renderTabela();
  alert("Cliente excluído!");
}

/* Ações rápidas por login */
function renovarUsuarioPorLogin(login, dias=7){
  usuarios = load();
  const i = usuarios.findIndex(u=>u.login===login);
  if(i<0) return;
  usuarios[i].dataCadastro = new Date().toISOString(); // reinicia contagem
  save(usuarios);
  renderTabela();
  alert(`Renovado por +${dias} dias.`);
}
function bloquearUsuarioPorLogin(login){
  usuarios = load();
  const i = usuarios.findIndex(u=>u.login===login);
  if(i<0) return;
  usuarios[i].dataCadastro = new Date("2000-01-01").toISOString(); // bloqueado
  save(usuarios);
  renderTabela();
  alert("Cliente bloqueado.");
}
function excluirUsuarioPorLogin(login){
  if(!confirm("Tem certeza que deseja excluir este cliente?")) return;
  usuarios = load();
  const i = usuarios.findIndex(u=>u.login===login);
  if(i<0) return;
  usuarios.splice(i,1);
  save(usuarios);
  renderTabela();
  alert("Cliente excluído.");
}

/* ===== Backup / Importação ===== */
function exportarUsuarios(){
  const data = JSON.stringify(load(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `backup_usuarios_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function importarUsuarios(ev){
  const file = ev.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const arr = JSON.parse(reader.result);
      if(!Array.isArray(arr)) throw new Error("Formato inválido");
      // validação mínima
      arr.forEach(o=>{
        if(typeof o.login !== "string") throw new Error("Objeto de usuário inválido");
        o.nome = o.nome || "";
        o.senha = o.senha || "";
        o.dataCadastro = o.dataCadastro ? new Date(o.dataCadastro).toISOString() : new Date().toISOString();
      });
      save(arr);
      usuarios = arr;
      initAdmin();
      alert("Importado com sucesso!");
    }catch(e){
      alert("Falha ao importar: " + e.message);
    }
  };
  reader.readAsText(file);
}

/* ===== Exposição global de funções usadas no HTML ===== */
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.limparCamposLogin = limparCamposLogin;
window.abrirNovoCliente = abrirNovoCliente;
window.abrirEditar = abrirEditar;
window.fecharModal = fecharModal;
window.salvarAtual = salvarAtual;
window.excluirAtual = excluirAtual;
window.renovarUsuarioPorLogin = renovarUsuarioPorLogin;
window.bloquearUsuarioPorLogin = bloquearUsuarioPorLogin;
window.excluirUsuarioPorLogin = excluirUsuarioPorLogin;
window.exportarUsuarios = exportarUsuarios;
window.importarUsuarios = importarUsuarios;
