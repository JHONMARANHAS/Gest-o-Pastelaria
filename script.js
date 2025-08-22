document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Admin
  if (username === "jhonmaranhas" && password === "J61772165360j") {
    localStorage.setItem("usuarioLogado", "admin");
    window.location.href = "admin.html";
    return;
  }

  // Cliente
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const cliente = clientes.find(c => c.username === username && c.password === password);

  if (cliente) {
    localStorage.setItem("usuarioLogado", "cliente");
    window.location.href = "cliente.html";
  } else {
    document.getElementById("errorMessage").textContent = "Usuário ou senha incorretos!";
  }
});
