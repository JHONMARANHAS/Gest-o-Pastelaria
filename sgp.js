// ===== Persistência =====
const LS={ing:'sgp_ing',rec:'sgp_rec',cmp:'sgp_cmp',ven:'sgp_ven',aj:'sgp_aj',cfg:'sgp_cfg',usr:'sgp_usr',cat:'sgp_cat',desp:'sgp_desp',col:'sgp_col'};
const S={
  ing:load(LS.ing,[]),
  rec:load(LS.rec,[]),
  cmp:load(LS.cmp,[]),
  ven:load(LS.ven,[]),
  aj: load(LS.aj,[]),
  cfg:load(LS.cfg,{nome:'Restaurante',whats:'',metaDia:0,metaMes:0,split:{pro:20,cx:40,rs:40}}),
  usr:load(LS.usr,[{id:uid(),nome:'Administrador',user:'admin',hash:hash('admin'),role:'admin',ativo:true}]),
  cat:load(LS.cat,['Energia','Água','Embalagens','Marketing','Aluguel','Folha']),
  desp:load(LS.desp,[]),
  col: load(LS.col,[])
};
let CURRENT=null;

function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function load(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}}
const BRL=v=> (v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const today=()=> new Date().toISOString().slice(0,10);
const uid=()=> Math.random().toString(36).slice(2,9);
function hash(t){ // hash simples (não use em produção)
  let h=0; for(let i=0;i<t.length;i++){h=((h<<5)-h)+t.charCodeAt(i);h|=0} return h.toString(16)
}

// ===== Autenticação & Permissões =====
const ROLES={admin:['*'],financeiro:['dashboard','compras','despesas','caixa','relatorios','backup'],operacional:['dashboard','vendas','estoque','produtos','ingredientes']};
function can(role,tab){return ROLES[role]?.includes('*') || ROLES[role]?.includes(tab)}
function validarLogin(){ const u=document.getElementById('login-user').value.trim(); const p=document.getElementById('login-pass').value; const found=S.usr.find(x=>x.user===u && x.hash===hash(p) && x.ativo!==false); if(!found) return alert('Usuário/senha inválidos'); CURRENT=found; document.getElementById('modal-login').style.display='none'; document.getElementById('current-user').textContent=`${CURRENT.nome} (${CURRENT.role})`; applyPermissions(); render('dashboard'); fillVendedores(); }
function logout(){ CURRENT=null; document.getElementById('modal-login').style.display='grid'; document.getElementById('current-user').textContent='—'; }
function fecharLogin(force){ if(force){window.close?.()} else { document.getElementById('modal-login').style.display='none'; } }
function applyPermissions(){ document.querySelectorAll('.nav button').forEach(b=>{ const tab=b.dataset.tab; b.style.display= can(CURRENT.role,tab)?'':'none'; }); document.querySelector('.nav button[data-tab="dashboard"]').style.display=''; document.querySelector('.nav button[data-tab="backup"]').style.display= can(CURRENT.role,'backup')?'':'none'; document.querySelector('.nav button[data-tab="usuarios"]').style.display= CURRENT.role==='admin'?'':'none'; }

// ===== Navegação =====
document.querySelectorAll('.nav button').forEach(b=>{
  b.onclick=()=>{ if(!can(CURRENT?.role,b.dataset.tab)&&b.dataset.tab!=='dashboard') return alert('Sem permissão'); document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    const t=b.dataset.tab;document.querySelectorAll('main>section').forEach(s=>s.style.display='none');
    document.getElementById('tab-'+t).style.display='';
    render(t);
  }
});

function render(tab){
  if(tab==='dashboard') renderDashboard();
  if(tab==='ingredientes') renderIngredientes();
  if(tab==='produtos') renderProdutos();
  if(tab==='compras') renderCompras();
  if(tab==='despesas') renderDespesas();
  if(tab==='estoque') renderEstoque();
  if(tab==='vendas') renderVendas();
  if(tab==='caixa') renderCaixa();
  if(tab==='comissoes') renderComissoes();
  if(tab==='relatorios') renderRelatorios();
  if(tab==='usuarios') renderUsuarios();
  if(tab==='config') renderConfig();
}

// ====== Ingredientes ======
function addIngrediente(){
  const nome=document.getElementById('ing-nome').value.trim();
  const uni=document.getElementById('ing-uni').value.trim()||'un';
  const custo=parseFloat(document.getElementById('ing-custo').value)||0;
  const min=parseFloat(document.getElementById('ing-min').value)||0;
  if(!nome) return alert('Informe o nome');
  S.ing.push({id:uid(),nome,uni,custo,min,estoque:0}); save(LS.ing,S.ing);
  document.getElementById('ing-nome').value='';document.getElementById('ing-uni').value='un';document.getElementById('ing-custo').value='';document.getElementById('ing-min').value='0';
  renderIngredientes();
}
function delIng(id){ if(!confirm('Excluir ingrediente?'))return; S.ing=S.ing.filter(i=>i.id!==id); save(LS.ing,S.ing); renderIngredientes(); }
function renderIngredientes(){
  const t=document.getElementById('tbl-ingredientes');
  t.innerHTML=`<tr><th>Ingrediente</th><th>Un</th><th>Custo</th><th>Estoque</th><th>Mín.</th><th></th></tr>`+
    S.ing.map(i=>`<tr><td>${i.nome}</td><td>${i.uni}</td><td>${BRL(i.custo)}</td><td>${i.estoque} ${i.uni}</td><td>${i.min}</td><td><button class='btn inline danger' onclick="delIng('${i.id}')">Excluir</button></td></tr>`).join('');
  fillIngredienteSelects();
}
function fillIngredienteSelects(){
  const comp=document.getElementById('comp-ing'); const aj=document.getElementById('aj-ing');
  [comp,aj].forEach(sel=>{ if(!sel) return; sel.innerHTML=''; S.ing.forEach(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=i.nome;sel.appendChild(o);}) })
}

// ====== Produtos/Receitas ======
function addLinhaReceita(){
  const w=document.getElementById('rec-itens');
  const line=document.createElement('div'); line.className='row';
  line.innerHTML=`<div><label>Ingrediente</label><select class='rec-ing'></select></div><div><label>Qtd por unidade</label><input class='rec-qtd' type='number' step='0.01'/></div>`;
  w.appendChild(line);
  const sel=line.querySelector('.rec-ing'); S.ing.forEach(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=`${i.nome} (${i.uni})`; sel.appendChild(o)});
}
function salvarReceita(){
  const nome=document.getElementById('rec-nome').value.trim();
  const margem=parseFloat(document.getElementById('rec-margem').value)||0;
  const itens=[...document.querySelectorAll('#rec-itens .row')].map(r=>({ing:r.querySelector('.rec-ing').value,qtd:parseFloat(r.querySelector('.rec-qtd').value)||0})).filter(x=>x.ing && x.qtd>0);
  if(!nome) return alert('Informe o nome do produto');
  if(!itens.length) return alert('Adicione ingredientes');
  S.rec.push({id:uid(),nome,margem,itens}); save(LS.rec,S.rec);
  document.getElementById('rec-nome').value=''; document.getElementById('rec-itens').innerHTML='';
  renderProdutos(); fillProdutosSelect();
}
function delRec(id){ if(!confirm('Excluir produto?'))return; S.rec=S.rec.filter(r=>r.id!==id); save(LS.rec,S.rec); renderProdutos(); fillProdutosSelect(); }
function custoReceita(r){ let c=0; r.itens.forEach(it=>{const i=S.ing.find(x=>x.id===it.ing); if(i) c+= (i.custo||0)*(it.qtd||0)}); return c }
function renderProdutos(){
  const t=document.getElementById('tbl-receitas');
  t.innerHTML=`<tr><th>Produto</th><th>Custo</th><th>Preço sugerido</th><th>Margem</th><th></th></tr>`+
    S.rec.map(r=>{const c=custoReceita(r);const p=c*(1+(r.margem||0)/100);return `<tr><td>${r.nome}</td><td>${BRL(c)}</td><td>${BRL(p)}</td><td>${r.margem}%</td><td><button class='btn inline danger' onclick="delRec('${r.id}')">Excluir</button></td></tr>`}).join('');
  fillProdutosSelect();
}
function fillProdutosSelect(){
  const sel=document.getElementById('ven-prod'); if(!sel) return; sel.innerHTML='';
  S.rec.forEach(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=r.nome;sel.appendChild(o)});
  const r0=S.rec[0]; const input=document.getElementById('ven-preco'); if(r0&&input){ input.value=(custoReceita(r0)*(1+(r0.margem||0)/100)).toFixed(2); }
}

// ====== Compras ======
function registrarCompra(){
  const ing=document.getElementById('comp-ing').value;
  const qtd=parseFloat(document.getElementById('comp-qtd').value)||0;
  const custo=parseFloat(document.getElementById('comp-custo').value)||0;
  const forn=document.getElementById('forn').value.trim()||'Fornecedor';
  const data=document.getElementById('comp-data').value||today();
  const pag=document.getElementById('comp-pag').value;
  if(!ing||qtd<=0) return alert('Preencha ingrediente e quantidade');
  S.cmp.push({id:uid(),ing,qtd,custo,forn,data,pag}); save(LS.cmp,S.cmp);
  const I=S.ing.find(i=>i.id===ing); if(I){I.estoque=(I.estoque||0)+qtd; if(custo>0) I.custo=custo; save(LS.ing,S.ing)}
  renderCompras(); renderEstoque();
}
function renderCompras(){
  const t=document.getElementById('tbl-compras');
  t.innerHTML=`<tr><th>Data</th><th>Ingrediente</th><th>Qtd</th><th>Unit.</th><th>Total</th><th>Pag.</th><th>Fornecedor</th></tr>`+
    S.cmp.slice().reverse().map(c=>{const i=S.ing.find(x=>x.id===c.ing);return `<tr><td>${c.data}</td><td>${i?i.nome:'?'}</td><td>${c.qtd}</td><td>${BRL(c.custo)}</td><td>${BRL(c.qtd*c.custo)}</td><td>${c.pag}</td><td>${c.forn}</td></tr>`}).join('');
  fillIngredienteSelects();
}

// ====== Despesas ======
function addCategoria(){ const n=document.getElementById('cat-nome').value.trim(); if(!n) return; S.cat.push(n); save(LS.cat,S.cat); document.getElementById('cat-nome').value=''; renderConfig(); }
function registrarDespesa(){ const cat=document.getElementById('desp-cat').value; const desc=document.getElementById('desp-desc').value.trim(); const val=parseFloat(document.getElementById('desp-valor').value)||0; const data=document.getElementById('desp-data').value||today(); if(!cat||val<=0) return alert('Informe categoria e valor'); S.desp.push({id:uid(),cat,desc,val,data}); save(LS.desp,S.desp); renderDespesas(); }
function renderDespesas(){ const s=document.getElementById('desp-cat'); if(s){ s.innerHTML=''; S.cat.forEach(c=>{const o=document.createElement('option'); o.value=c; o.textContent=c; s.appendChild(o)}); }
  const t=document.getElementById('tbl-despesas'); const agrup={}; S.desp.forEach(d=>{agrup[d.cat]=(agrup[d.cat]||0)+d.val}); t.innerHTML='<tr><th>Categoria</th><th>Total</th></tr>'+Object.entries(agrup).map(([c,v])=>`<tr><td>${c}</td><td>${BRL(v)}</td></tr>`).join(''); }

// ====== Estoque ======
function renderEstoque(){
  const t=document.getElementById('tbl-estoque');
  t.innerHTML=`<tr><th>Ingrediente</th><th>Estoque</th><th>Mínimo</th><th>Status</th></tr>`+
    S.ing.map(i=>{let cls='ok',txt='OK'; if(i.estoque<=i.min){cls='err';txt='Baixo'} else if(i.estoque<=i.min*1.5){cls='warn';txt='Atenção'}
      return `<tr><td>${i.nome}</td><td>${i.estoque} ${i.uni}</td><td>${i.min}</td><td><span class='chip ${cls}'>${txt}</span></td></tr>`}).join('');
  const sel=document.getElementById('aj-ing'); if(sel){ sel.innerHTML=''; S.ing.forEach(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=i.nome; sel.appendChild(o)}) }
}
function ajustarEstoque(){
  const id=document.getElementById('aj-ing').value; const qtd=parseFloat(document.getElementById('aj-qtd').value)||0; if(!id||qtd===0) return alert('Informe ingrediente e quantidade');
  const I=S.ing.find(i=>i.id===id); if(!I) return; I.estoque=(I.estoque||0)+qtd; save(LS.ing,S.ing); S.aj.push({id:uid(),ing:id,qtd,data:today()}); save(LS.aj,S.aj); renderEstoque();
}

// ====== Vendas ======
function fillVendedores(){ const s=document.getElementById('ven-user'); if(!s) return; s.innerHTML=''; S.col.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.nome; s.appendChild(o)}); if(CURRENT) {const o=document.createElement('option');o.value='user:'+CURRENT.id; o.textContent=CURRENT.nome+' (usuário)'; s.appendChild(o)} }
function registrarVenda(){
  const rid=document.getElementById('ven-prod').value; const qtd=parseFloat(document.getElementById('ven-qtd').value)||1; const preco=parseFloat(document.getElementById('ven-preco').value)||0; const pag=document.getElementById('ven-pag').value; const vendedor=document.getElementById('ven-user').value||''; const cliente=(document.getElementById('ven-cliente').value||'').trim(); const r=S.rec.find(x=>x.id===rid); if(!r) return alert('Escolha um produto');
  for(const it of r.itens){ const I=S.ing.find(x=>x.id===it.ing); if(I) I.estoque=(I.estoque||0)-(it.qtd*qtd); }
  save(LS.ing,S.ing);
  const total=preco*qtd; S.ven.push({id:uid(),rid,qtd,preco,total,pag,data:today(),vendedor,cliente}); save(LS.ven,S.ven);
  renderVendas(); renderEstoque(); renderDashboard();
}
function renderVendas(){
  const t=document.getElementById('tbl-vendas');
  t.innerHTML=`<tr><th>Data</th><th>Produto</th><th>Qtd</th><th>Unit.</th><th>Total</th><th>Pag.</th><th>Vendedor</th><th>Cliente</th></tr>`+
    S.ven.slice().reverse().map(v=>{const r=S.rec.find(x=>x.id===v.rid); const vend=nomeVendedor(v.vendedor); return `<tr><td>${v.data}</td><td>${r?r.nome:'?'}</td><td>${v.qtd}</td><td>${BRL(v.preco)}</td><td>${BRL(v.total)}</td><td>${v.pag}</td><td>${vend}</td><td>${v.cliente||''}</td></tr>`}).join('');
  const sel=document.getElementById('ven-prod'); if(sel){ sel.onchange=()=>{ const r=S.rec.find(x=>x.id===sel.value); const input=document.getElementById('ven-preco'); if(r&&input){ input.value=(custoReceita(r)*(1+(r.margem||0)/100)).toFixed(2) } } }
}
function nomeVendedor(id){ if(!id) return ''; if(id.startsWith('user:')){ const uid=id.split(':')[1]; const u=S.usr.find(x=>x.id===uid); return u?u.nome:'' } const c=S.col.find(x=>x.id===id); return c?c.nome:'' }
function imprimirCupom(){ const rid=document.getElementById('ven-prod').value; const qtd=parseFloat(document.getElementById('ven-qtd').value)||1; const preco=parseFloat(document.getElementById('ven-preco').value)||0; const cliente=(document.getElementById('ven-cliente').value||'').trim(); const prod=(S.rec.find(r=>r.id===rid)||{}).nome||'-'; const total=BRL(qtd*preco); const win=window.open('','_blank'); win.document.write(`<pre style="font-family:monospace">${S.cfg.nome}\n-----------------------------\nCliente: ${cliente||'-'}\nItem: ${prod} x${qtd}\nUnit.: ${BRL(preco)}\nTotal: ${total}\n\nObrigado!</pre>`); win.document.close(); win.print(); }
function enviarWhats(){ const rid=document.getElementById('ven-prod').value; const qtd=parseFloat(document.getElementById('ven-qtd').value)||1; const preco=parseFloat(document.getElementById('ven-preco').value)||0; const cliente=(document.getElementById('ven-cliente').value||'Cliente'); const prod=(S.rec.find(r=>r.id===rid)||{}).nome||'-'; const msg=encodeURIComponent(`*${S.cfg.nome}*\nPedido de ${cliente}\n${prod} x${qtd} — Unit. ${BRL(preco)}\n*Total:* ${BRL(qtd*preco)}`); const num=(S.cfg.whats||''); window.open(`https://wa.me/${num}?text=${msg}`,'_blank'); }

// ====== Caixa & Lucro ======
function periodo(d1,d2,arr){ const a=d1?new Date(d1):new Date('1970-01-01'); const b=d2?new Date(d2):new Date('2999-12-31'); return arr.filter(x=>{ const d=new Date(x.data); return d>=a&&d<=b }) }
function renderCaixa(){ document.getElementById('cx-de').value=document.getElementById('cx-de').value||today(); document.getElementById('cx-ate').value=document.getElementById('cx-ate').value||today(); atualizarResumoCaixa(); }
function atualizarResumoCaixa(){ const de=document.getElementById('cx-de').value; const ate=document.getElementById('cx-ate').value; const V=periodo(de,ate,S.ven); const C=periodo(de,ate,S.cmp); const D=periodo(de,ate,S.desp); const receita=V.reduce((s,x)=>s+x.total,0); const custos=C.reduce((s,x)=>s+x.qtd*x.custo,0)+D.reduce((s,x)=>s+x.val,0); const lucro=receita-custos; document.getElementById('cx-receita').textContent=BRL(receita); document.getElementById('cx-custos').textContent=BRL(custos); document.getElementById('cx-lucro').textContent=BRL(lucro); const margem=receita? (lucro/receita*100):0; document.getElementById('cx-margem').textContent=margem.toFixed(1)+'%'; const t=document.getElementById('tbl-caixa'); t.innerHTML=`<tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Valor</th></tr>`+[...V.map(v=>({data:v.data,tipo:'Entrada',desc:`Venda ${v.qtd}x ${(S.rec.find(r=>r.id===v.rid)||{}).nome||''}`,val:v.total})),...C.map(c=>({data:c.data,tipo:'Saída',desc:`Compra ${(S.ing.find(i=>i.id===c.ing)||{}).nome||''}`,val:-c.qtd*c.custo})),...D.map(d=>({data:d.data,tipo:'Saída',desc:`${d.cat} - ${d.desc||''}`,val:-d.val}))].sort((a,b)=>a.data<b.data?-1:1).map(l=>`<tr><td>${l.data}</td><td>${l.tipo}</td><td>${l.desc}</td><td class='${l.val<0?"muted":""}'>${BRL(l.val)}</td></tr>`).join('') }
document.getElementById('cx-de').addEventListener('change',atualizarResumoCaixa); document.getElementById('cx-ate').addEventListener('change',atualizarResumoCaixa);
function calcularDistribuicao(){ const de=document.getElementById('cx-de').value; const ate=document.getElementById('cx-ate').value; const V=periodo(de,ate,S.ven); const C=periodo(de,ate,S.cmp); const D=periodo(de,ate,S.desp); const lucro=Math.max(0, V.reduce((s,x)=>s+x.total,0) - C.reduce((s,x)=>s+x.qtd*x.custo,0) - D.reduce((s,x)=>s+x.val,0)); const p=parseFloat(document.getElementById('cx-prolabore').value)||0; const c=parseFloat(document.getElementById('cx-caixa').value)||0; const r=parseFloat(document.getElementById('cx-reserva').value)||0; if(p+c+r!==100) return alert('A soma dos percentuais deve ser 100%'); const tbl=document.getElementById('tbl-distrib'); tbl.innerHTML=`<tr><th>Destino</th><th>%</th><th>Valor</th></tr>`+[{k:'Pró-labore',pc:p,val:lucro*p/100},{k:'Caixa',pc:c,val:lucro*c/100},{k:'Reserva',pc:r,val:lucro*r/100}].map(x=>`<tr><td>${x.k}</td><td>${x.pc}%</td><td>${BRL(x.val)}</td></tr>`).join(''); }

// ====== Equipe & Comissões ======
function addColab(){ const nome=document.getElementById('colab-nome').value.trim(); const perc=parseFloat(document.getElementById('colab-perc').value)||0; if(!nome) return; S.col.push({id:uid(),nome,perc}); save(LS.col,S.col); document.getElementById('colab-nome').value=''; renderComissoes(); fillVendedores(); }
function renderComissoes(){ document.getElementById('com-de').value=document.getElementById('com-de').value||today(); document.getElementById('com-ate').value=document.getElementById('com-ate').value||today(); const de=document.getElementById('com-de').value; const ate=document.getElementById('com-ate').value; const V=periodo(de,ate,S.ven); const map={}; V.forEach(v=>{ const perc=getPercComissao(v.vendedor); if(!perc) return; map[v.vendedor]=(map[v.vendedor]||0)+ v.total*perc/100 }); const t=document.getElementById('tbl-colab'); t.innerHTML='<tr><th>Colaborador</th><th>Comissão</th></tr>'+Object.entries(map).map(([id,v])=>`<tr><td>${nomeVendedor(id)}</td><td>${BRL(v)}</td></tr>`).join(''); }
function getPercComissao(id){ if(!id) return 0; if(id.startsWith('user:')) return 0; const c=S.col.find(x=>x.id===id); return c?c.perc:0 }

// ====== Usuários ======
function addUsuario(){ const nome=document.getElementById('usr-nome').value.trim(); const user=document.getElementById('usr-user').value.trim(); const senha=document.getElementById('usr-senha').value; const role=document.getElementById('usr-role').value; if(!nome||!user||!senha) return alert('Preencha todos os campos'); if(S.usr.some(u=>u.user===user)) return alert('Usuário já existe'); const u={id:uid(),nome,user,hash:hash(senha),role,ativo:true}; S.usr.push(u); save(LS.usr,S.usr); renderUsuarios(); }
function toggleUser(id){ const u=S.usr.find(x=>x.id===id); if(!u) return; u.ativo=!u.ativo; save(LS.usr,S.usr); renderUsuarios(); }
function renderUsuarios(){ const t=document.getElementById('tbl-usuarios'); t.innerHTML='<tr><th>Nome</th><th>Login</th><th>Perfil</th><th>Status</th><th></th></tr>'+ S.usr.map(u=>`<tr><td>${u.nome}</td><td>${u.user}</td><td>${u.role}</td><td>${u.ativo?'Ativo':'Inativo'}</td><td><button class="btn inline" onclick="toggleUser('${u.id}')">${u.ativo?'Inativar':'Ativar'}</button></td></tr>`).join(''); }

// ====== Dashboard & Relatórios ======
let ch1,chFat,chLuc,chMes; // charts
function lastNDays(n){ const a=[]; for(let i=n-1;i>=0;i--){const d=new Date(); d.setDate(d.getDate()-i); a.push(d.toISOString().slice(0,10));} return a }
function lastNMonths(n){ const a=[]; const d=new Date(); for(let i=n-1;i>=0;i--){ const dt=new Date(d.getFullYear(), d.getMonth()-i, 1); a.push(dt.toISOString().slice(0,7)); } return a }
function renderDashboard(){
  // KPIs
  const days=lastNDays(30); const vendasDia=days.map(d=> S.ven.filter(v=>v.data===d).reduce((s,x)=>s+x.total,0));
  const comprasDia=days.map(d=> S.cmp.filter(c=>c.data===d).reduce((s,x)=>s+x.qtd*x.custo,0));
  const despesasDia=days.map(d=> S.desp.filter(c=>c.data===d).reduce((s,x)=>s+x.val,0));
  const fat=vendasDia.reduce((a,b)=>a+b,0); const cus=comprasDia.reduce((a,b)=>a+b,0)+despesasDia.reduce((a,b)=>a+b,0); const luc=fat-cus; const prev= fat*0.9; // estimativa simples
  document.getElementById('kpi-fat').textContent=BRL(fat);
  document.getElementById('kpi-lucro').textContent=BRL(luc);
  document.getElementById('kpi-margem').textContent= (fat? (luc/fat*100):0).toFixed(1)+'% margem';
  const low=S.ing.filter(i=>i.estoque<=i.min).length; document.getElementById('avisos').textContent= low? `${low} item(ns) com estoque abaixo do mínimo.` : 'Sem avisos.';
  document.getElementById('kpi-fat-var').textContent=(fat-prev>=0?'+':'')+((fat/Math.max(1,prev)-1)*100).toFixed(1)+'%';
  // Meta do mês
  const mes=new Date().toISOString().slice(0,7); const fatMes=S.ven.filter(v=>v.data.slice(0,7)===mes).reduce((s,x)=>s+x.total,0); const meta=S.cfg.metaMes||0; const prog=meta?Math.min(100,(fatMes/meta*100)):0; document.getElementById('kpi-meta').textContent=prog.toFixed(0)+'%'; document.getElementById('kpi-meta-valor').textContent=`${BRL(fatMes)} / ${BRL(meta)}`;
  // Top produtos
  const map={}; S.ven.forEach(v=>{ map[v.rid]=(map[v.rid]||0)+v.qtd });
  const top=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);
  document.getElementById('tb-top').innerHTML='<tr><th>Produto</th><th>Qtd</th></tr>'+ top.map(([rid,q])=>`<tr><td>${(S.rec.find(r=>r.id===rid)||{}).nome||'-'}</td><td>${q}</td></tr>`).join('');
  // Chart vendas
  const ctx=document.getElementById('ch-vendas'); if(ch1) ch1.destroy(); ch1=new Chart(ctx,{type:'line',data:{labels:days,datasets:[{label:'Vendas',data:vendasDia},{label:'Compras',data:comprasDia},{label:'Despesas',data:despesasDia}]},options:{responsive:true,plugins:{legend:{display:true}}}});
}
function renderRelatorios(){
  const days=lastNDays(30); const vendasDia=days.map(d=> S.ven.filter(v=>v.data===d).reduce((s,x)=>s+x.total,0)); const comprasDia=days.map(d=> S.cmp.filter(c=>c.data===d).reduce((s,x)=>s+x.qtd*x.custo,0)); const despesasDia=days.map(d=> S.desp.filter(c=>c.data===d).reduce((s,x)=>s+x.val,0)); const lucroDia=vendasDia.map((v,i)=> v - comprasDia[i] - despesasDia[i]);
  const c1=document.getElementById('rl-fat'); if(chFat) chFat.destroy(); chFat=new Chart(c1,{type:'bar',data:{labels:days,datasets:[{label:'Faturamento',data:vendasDia}]}});
  const c2=document.getElementById('rl-luc'); if(chLuc) chLuc.destroy(); chLuc=new Chart(c2,{type:'bar',data:{labels:days,datasets:[{label:'Lucro',data:lucroDia}]}});
  const meses=lastNMonths(12); const fatMes=meses.map(m=> S.ven.filter(v=>v.data.slice(0,7)===m).reduce((s,x)=>s+x.total,0)); const c3=document.getElementById('rl-mes'); if(chMes) chMes.destroy(); chMes=new Chart(c3,{type:'line',data:{labels:meses,datasets:[{label:'Faturamento mensal',data:fatMes}]}});
}

// ====== Config / Backup ======
function renderConfig(){ document.getElementById('cfg-nome').value=S.cfg.nome||''; document.getElementById('cfg-whats').value=S.cfg.whats||''; document.getElementById('cfg-meta-dia').value=S.cfg.metaDia||0; document.getElementById('cfg-meta-mes').value=S.cfg.metaMes||0; const t=document.getElementById('tbl-categorias'); t.innerHTML='<tr><th>Categoria</th></tr>'+S.cat.map(c=>`<tr><td>${c}</td></tr>`).join(''); const s=document.getElementById('desp-cat'); if(s){ s.innerHTML=''; S.cat.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;s.appendChild(o)}) } }
function salvarConfig(){ S.cfg.nome=document.getElementById('cfg-nome').value; S.cfg.whats=document.getElementById('cfg-whats').value; S.cfg.metaDia=parseFloat(document.getElementById('cfg-meta-dia').value)||0; S.cfg.metaMes=parseFloat(document.getElementById('cfg-meta-mes').value)||0; save(LS.cfg,S.cfg); alert('Configurações salvas!'); renderDashboard(); }
function exportarJSON(){ const blob=new Blob([JSON.stringify(S)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='backup_restaurante_manager.json'; a.click(); }
function importarJSON(){ const f=document.getElementById('bk-file').files[0]; if(!f) return alert('Selecione um arquivo'); const r=new FileReader(); r.onload=()=>{ try{ const J=JSON.parse(r.result); for(const k of Object.keys(LS)){ if(J[k]){ S[k]=J[k]; save(LS[k],S[k]); } } alert('Importado!'); init(true); }catch(e){alert('Arquivo inválido')}}; r.readAsText(f); }
function limparTudo(){ if(!confirm('Apagar todos os dados?')) return; for(const k of Object.values(LS)) localStorage.removeItem(k); location.reload(); }
function seedDemo(){ if(!confirm('Carregar dados de demonstração? Isso substituirá alguns dados.')) return; S.ing=[{id:uid(),nome:'Massa',uni:'un',custo:2,min:50,estoque:300},{id:uid(),nome:'Carne',uni:'kg',custo:30,min:5,estoque:12},{id:uid(),nome:'Queijo',uni:'kg',custo:28,min:3,estoque:6},{id:uid(),nome:'Óleo',uni:'L',custo:9,min:4,estoque:10}]; save(LS.ing,S.ing); S.rec=[{id:uid(),nome:'Pastel de Carne',margem:40,itens:[{ing:S.ing[0].id,qtd:1},{ing:S.ing[1].id,qtd:0.1},{ing:S.ing[3].id,qtd:0.02}]},{id:uid(),nome:'Pastel de Queijo',margem:40,itens:[{ing:S.ing[0].id,qtd:1},{ing:S.ing[2].id,qtd:0.12},{ing:S.ing[3].id,qtd:0.02}]}]; save(LS.rec,S.rec); S.cmp=[{id:uid(),ing:S.ing[0].id,qtd:200,custo:2,forn:'Atacado',data:today(),pag:'Pix'}]; save(LS.cmp,S.cmp); S.ven=[{id:uid(),rid:S.rec[0].id,qtd:20,preco:10,total:200,pag:'Pix',data:today(),vendedor:'',cliente:'DEMO'}]; save(LS.ven,S.ven); S.desp=[{id:uid(),cat:'Energia',desc:'Conta',val:350,data:today()}]; save(LS.desp,S.desp); alert('DEMO carregada!'); init(true); }

// ===== Inicialização =====
function init(skipLogin){ render('dashboard'); fillIngredienteSelects(); fillProdutosSelect(); renderDashboard(); renderConfig(); if(!skipLogin){ document.getElementById('modal-login').style.display='grid'; } applyPermissions(); document.getElementById('current-user').textContent= CURRENT? `${CURRENT.nome} (${CURRENT.role})`:'—'; }
init();
