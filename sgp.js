// =============================
// VARIÁVEIS GLOBAIS
// =============================
let usuarioLogado = null;

// =============================
// TABS LOGIN / CADASTRO
// =============================
function toggleForm(form) {
  document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
  document.getElementById(form).classList.add('active');

  document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tabs button[onclick="toggleForm('${form}')"]`).classList.add('active');
}

// =============================
// CADASTRO DE NOVO USUÁRIO
// =============================
function cadastrar() {
  const nome = document.getElementById('cad-nome').value.trim();
  const login = document.getElementById('cad-login').value.trim();
  const senha = document.getElementById('cad-senha').value.trim();

  if (!nome || !login || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  const key = `sgp_user_${login}`;
  if (localStorage.getItem(key)) {
    alert("Este login já está em uso!");
    return;
  }

  const hoje = new Date();
  const dadosUsuario = {
    nome,
    login,
    senha,
    cadastro: hoje.toISOString(),
    estoque: [],
    vendas: [],
    configuracoes: {}
  };

  localStorage.setItem(key, JSON.stringify(dadosUsuario));
  alert("Cadastro realizado com sucesso! Agora faça o login.");
  toggleForm('login-form');
}

// =============================
// LOGIN
// =============================
function login() {
  const login = document.getElementById('login-login').value.trim();
  const senha = document.getElementById('login-senha').value.trim();

  const key = `sgp_user_${login}`;
  const dados = localStorage.getItem(key);

  if (!dados) {
    alert("Usuário não encontrado!");
    return;
  }

  const usuario = JSON.parse(dados);

  if (usuario.senha !== senha) {
    alert("Senha incorreta!");
    return;
  }

  // Verificar validade de 7 dias
  const dataCadastro = new Date(usuario.cadastro);
  const hoje = new Date();
  const diasPassados = Math.floor((hoje - dataCadastro) / (1000 * 60 * 60 * 24));

  if (diasPassados > 7) {
    alert("Seu período de teste expirou. Entre em contato com o administrador.");
    return;
  }

  usuarioLogado = usuario;
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');

  renderDashboard();
}

// =============================
// RENDERIZAR DASHBOARD
// =============================
function renderDashboard() {
  document.getElementById('user-name').textContent = usuarioLogado.nome;

  // Estoque
  const estoqueList = document.getElementById('estoque-list');
  estoqueList.innerHTML = '';
  if (usuarioLogado.estoque.length === 0) {
    estoqueList.innerHTML = "<p>Sem produtos cadastrados.</p>";
  } else {
    usuarioLogado.estoque.forEach(prod => {
      const li = document.createElement('li');
      li.textContent = `${prod.nome} — ${prod.quantidade} unidades`;
      estoqueList.appendChild(li);
    });
  }

  // Vendas
  const vendasList = document.getElementById('vendas-list');
  vendasList.innerHTML = '';
  if (usuarioLogado.vendas.length === 0) {
    vendasList.innerHTML = "<p>Nenhuma venda registrada.</p>";
  } else {
    usuarioLogado.vendas.forEach(venda => {
      const li = document.createElement('li');
      li.textContent = `${venda.data} — R$ ${venda.valor}`;
      vendasList.appendChild(li);
    });
  }

  // Relatório
  const totalVendas = usuarioLogado.vendas.reduce((s, v) => s + v.valor, 0);
  document.getElementById('relatorio-info').innerHTML = `
    <p>Total de vendas: R$ ${totalVendas.toFixed(2)}</p>
    <p>Produtos em estoque: ${usuarioLogado.estoque.length}</p>
    <p>Dias restantes do teste: ${7 - Math.floor((new Date() - new Date(usuarioLogado.cadastro)) / (1000 * 60 * 60 * 24))} dias</p>
  `;
}

// =============================
// LOGOUT
// =============================
function logout() {
  usuarioLogado = null;
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('login-container').classList.remove('hidden');

  // Limpa campos de login
  document.getElementById('login-login').value = '';
  document.getElementById('login-senha').value = '';
}

// =============================
// ⚙️ Funções extras (adicionar produto/venda etc.)
// =============================
// Você pode criar botões e inputs no dashboard e associar a funções como:
function adicionarProduto(nome, quantidade) {
  usuarioLogado.estoque.push({ nome, quantidade });
  salvarUsuario();
  renderDashboard();
}

function registrarVenda(valor) {
  usuarioLogado.vendas.push({
    valor: parseFloat(valor),
    data: new Date().toLocaleDateString()
  });
  salvarUsuario();
  renderDashboard();
}

// Salvar no localStorage
function salvarUsuario() {
  const key = `sgp_user_${usuarioLogado.login}`;
  localStorage.setItem(key, JSON.stringify(usuarioLogado));
}
