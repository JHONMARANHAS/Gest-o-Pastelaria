// clientes.js - Controle de login/cadastro dos clientes com planos
const KEY_CLIENTES = "clientes";
const KEY_PLANOS = "planos";

function getClientes(){ return JSON.parse(localStorage.getItem(KEY_CLIENTES) || "[]"); }
function setClientes(v){ localStorage.setItem(KEY_CLIENTES, JSON.stringify(v)); }
function getPlanos(){ return JSON.parse(localStorage.getItem(KEY_PLANOS) || "[]"); }
function setPlanos(v){ localStorage.setItem(KEY_PLANOS, JSON.stringify(v)); }

// Garantir plano Trial se admin ainda não criou nada
(function ensureDefaultPlans(){
  const planos = getPlanos();
  if(planos.length===0){
    setPlanos([{id:'trial7',nome:'Teste 7 dias',preco:0,meses:0,recursos:['dashboard','produtos','gestao','financeiro','precificacao','dre']}]);
  }
})();

function cadastrarCliente() {
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value;
  const email = document.getElementById("email").value.trim();

  if (!usuario || !senha) {
    alert("Preencha usuário e senha!");
    return;
  }

  let clientes = getClientes();
  if (clientes.find(c => c.usuario.toLowerCase() === usuario.toLowerCase())) {
    alert("Usuário já cadastrado!");
    return;
  }

  const hoje = new Date();
  const vencimento = new Date();
  vencimento.setDate(hoje.getDate() + 7); // Teste grátis de 7 dias

  clientes.push({
    usuario,
    senha,
    email,
    plano: "Teste 7 dias",
    planoId: "trial7",
    cadastro: hoje.toISOString(),
    vencimento: vencimento.toISOString(),
    ativo: true
  });

  setClientes(clientes);
  alert("Cadastro realizado com sucesso! Você já pode fazer login.");
  document.getElementById("formCadastro").reset();
}

function loginCliente() {
  const usuario = document.getElementById("loginUsuario").value.trim();
  const senha = document.getElementById("loginSenha").value;

  const clientes = getClientes();
  const cliente = clientes.find(c => c.usuario === usuario && c.senha === senha);

  if (!cliente) {
    alert("Usuário ou senha inválidos!");
    return;
  }

  const hoje = new Date();
  const vencimento = new Date(cliente.vencimento);

  if (hoje > vencimento || !cliente.ativo) {
    alert("Acesso bloqueado (plano vencido ou inativo). Contate o administrador.");
    return;
  }

  localStorage.setItem("clienteLogado", JSON.stringify(cliente));
  abrirPainelCliente(cliente);
}

function abrirPainelCliente(cliente) {
  document.getElementById("loginCliente").style.display = "none";
  document.getElementById("painelCliente").style.display = "block";

  document.getElementById("bemVindoCliente").innerText = `Bem-vindo, ${cliente.usuario}!`;
  document.getElementById("planoCliente").innerText = cliente.plano;
  document.getElementById("vencimentoCliente").innerText = new Date(cliente.vencimento).toLocaleDateString();

  const dias = Math.ceil((new Date(cliente.vencimento) - new Date()) / (1000 * 60 * 60 * 24));
  document.getElementById("diasRestantesCliente").innerText = (dias>=0?dias:0) + " dias";

  // Esconder abas não permitidas (conforme recursos do plano)
  const planos = getPlanos();
  const plano = planos.find(p=>p.id===cliente.planoId);
  const recursos = new Set(plano?.recursos || []);
  const abas = ['dashboard','produtos','gestao','financeiro','precificacao','dre'];
  abas.forEach(a=>{
    const tabEl = document.getElementById(a);
    const link = [...document.querySelectorAll('#menuCliente a')].find(l=> l.getAttribute('onclick')?.includes(`'${a}'`));
    const allow = recursos.has(a);
    if(tabEl) tabEl.style.display = allow ? '' : 'none';
    if(link) link.parentElement.style.display = allow ? '' : 'none';
  });
}

function logoutCliente() {
  localStorage.removeItem("clienteLogado");
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const clienteLogado = JSON.parse(localStorage.getItem("clienteLogado") || "null");
  if (clienteLogado) abrirPainelCliente(clienteLogado);
});
