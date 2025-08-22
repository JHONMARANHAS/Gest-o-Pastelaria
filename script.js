// Alternar login/cadastro
document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btnLogin");
  const btnCadastro = document.getElementById("btnCadastro");
  const loginForm = document.getElementById("loginForm");
  const cadastroForm = document.getElementById("cadastroForm");
  const msg = document.getElementById("mensagem");

  if (btnLogin && btnCadastro) {
    btnLogin.addEventListener("click", () => {
      btnLogin.classList.add("active");
      btnCadastro.classList.remove("active");
      loginForm.classList.add("active");
      cadastroForm.classList.remove("active");
    });

    btnCadastro.addEventListener("click", () => {
      btnCadastro.classList.add("active");
      btnLogin.classList.remove("active");
      cadastroForm.classList.add("active");
      loginForm.classList.remove("active");
    });
  }

  // Cadastro
  if (cadastroForm) {
    cadastroForm.addEventListener("submit", e => {
      e.preventDefault();
      let users = JSON.parse(localStorage.getItem("users")) || [];
      const user = document.getElementById("cadUser").value;
      const pass = document.getElementById("cadPass").value;
      const expira = new Date();
      expira.setDate(expira.getDate() + 7);

      users.push({ user, pass, expira: expira.toISOString(), plano: null });
      localStorage.setItem("users", JSON.stringify(users));
      msg.textContent = "Cadastro realizado com sucesso!";
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const user = document.getElementById("loginUser").value;
      const pass = document.getElementById("loginPass").value;

      if (user === "jhonmaranhas" && pass === "J61772165360j") {
        window.location.href = "admin.html";
        return;
      }

      let users = JSON.parse(localStorage.getItem("users")) || [];
      const cliente = users.find(u => u.user === user && u.pass === pass);

      if (!cliente) {
        msg.textContent = "Usuário ou senha inválidos.";
        return;
      }

      const hoje = new Date();
      if (new Date(cliente.expira) < hoje) {
        msg.textContent = "Plano expirado. Entre em contato com o administrador.";
        return;
      }

      localStorage.setItem("logado", user);
      window.location.href = "cliente.html";
    });
  }
});
