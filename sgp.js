// ===== Dados iniciais =====
let S = JSON.parse(localStorage.getItem('SGP')) || {
  ing: [
    {nome:'Carne', estoque:10, min:5, uni:'kg'},
    {nome:'Queijo', estoque:3, min:5, uni:'kg'}
  ],
  rec: [{nome:'Pastel Carne', itens:[{ing:'Carne', qtd:0.2}], preco:8}],
  com: [],
  ven: [],
  caixa: {saldo:1000},
  usu: [{user:'admin', pass:'123'}]
};

let usuarioLogado = localStorage.getItem('usuarioLogado') || null;

// ===== Persistência =====
function save(){ localStorage.setItem('SGP', JSON.stringify(S)); }

// ===== Login =====
function login(){
  const u=document.getElementById('login-usuario').value;
  const p=document.getElementById('login-senha').value;
  if(S.usu.find(x=>x.user===u && x.pass===p)){
    usuarioLogado = u;
    localStorage.setItem('usuarioLogado', u);
    document.getElementById('login').style.display='none';
    document.getElementById('app').style.display='block';
    renderAll();
  } else {
    alert('Usuário ou senha incorretos');
  }
}

function logout(){
  usuarioLogado = null;
  localStorage.removeItem('usuarioLogado');
  document.getElementById('app').style.display='none';
  document.getElementById('login').style.display='flex';
}

// ===== Navegação =====
function show(sec){
  document.querySelectorAll('.sec').forEach(s=>s.style.display='none');
  document.getElementById('sec-'+sec).style.display='block';
  if(sec==='estoque') renderEstoque();
  if(sec==='caixa') renderCaixa();
  if(sec==='dashboard') renderDashboard();
}

// ===== Renderizações =====
function renderDashboard(){
  let baixo = S.ing.filter(i=>i.estoque<=i.min).map(i=>i.nome);
  let html = `<p>Saldo em caixa: R$ ${S.caixa.saldo.toFixed(2)}</p>`;
  if(baixo.length){
    html += `<p class="err">⚠ Ingredientes em falta: ${baixo.join(', ')}</p>`;
  } else {
    html += `<p class="ok">✅ Estoque estável</p>`;
  }
  document.getElementById('res-dashboard').innerHTML = html;
}

function renderEstoque(){
  const t=document.getElementById('tbl-estoque');
  t.innerHTML=`<tr><th>Ingrediente</th><th>Estoque</th><th>Mínimo</th><th>Status</th></tr>`+
    S.ing.map(i=>{
      let cls='ok', txt='OK';
      if(i.estoque <= i.min){ cls='err'; txt='Baixo'; }
      else if(i.estoque <= i.min*1.5){ cls='warn'; txt='Atenção'; }
      return `<tr>
        <td>${i.nome}</td>
        <td>${i.estoque} ${i.uni}</td>
        <td>${i.min} ${i.uni}</td>
        <td><span class="chip ${cls}">${txt}</span></td>
      </tr>`;
    }).join('');
}

function renderCaixa(){
  document.getElementById('res-caixa').innerHTML =
    `<p>Saldo atual: R$ ${S.caixa.saldo.toFixed(2)}</p>`;
}

function renderAll(){
  renderDashboard();
  renderEstoque();
  renderCaixa();
}

// ===== Inicialização =====
window.onload=()=>{
  if(usuarioLogado){
    document.getElementById('login').style.display='none';
    document.getElementById('app').style.display='block';
    renderAll();
  }
};
