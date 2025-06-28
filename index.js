document.addEventListener("DOMContentLoaded", () => {
  const llistat = document.getElementById("llistatCastigs");
  const loginForm = document.getElementById("loginForm");
  const zonaPrivada = document.getElementById("zonaPrivada");
  const loginSection = document.getElementById("loginSection");
  const loginError = document.getElementById("loginError");

  const form = document.getElementById("castigForm");
  const tipus = document.getElementById("tipus");
  const altresContainer = document.getElementById("altresContainer");
  const logoutBtn = document.getElementById("logoutBtn");

  // Inicialitzar usuari admin si no existeix
  if (!localStorage.getItem("usuaris")) {
    localStorage.setItem("usuaris", JSON.stringify({ admin: "admin" }));
  }

  tipus.addEventListener("change", () => {
    altresContainer.style.display = tipus.value === "Altres" ? "block" : "none";
  });

  function duradaEnMs(text) {
    const t = {
      "1 hora": 3600000,
      "2 hores": 7200000,
      "3 hores": 10800000,
      "5 hores": 18000000,
      "10 hores": 36000000,
      "1 dia": 86400000,
      "2 dies": 172800000,
      "3 dies": 259200000,
      "7 dies": 604800000,
      "1 mes": 2592000000
    };
    return t[text] || 0;
  }

  function mostrarCastigs() {
    llistat.innerHTML = "";
    const castigs = JSON.parse(localStorage.getItem("castigs")) || [];
    const ara = Date.now();

    castigs.forEach((c, i) => {
      if (c.fi > ara) {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${c.nen}</strong><br>
          <img src="img/${c.nen.toLowerCase()}.png" alt="${c.nen}" width="60" onerror="this.src='img/default.png'"><br>
          <em>${c.tipus}</em><br>
          Temps restant: <span id="compte${i}"></span><br>
        `;
        if (sessionStorage.getItem("usuariActiu")) {
          const btn = document.createElement("button");
          btn.textContent = "Eliminar càstig";
          btn.onclick = () => eliminarCastig(i);
          li.appendChild(btn);
        }
        llistat.appendChild(li);
        actualitzaCompte(`compte${i}`, c.fi);
      }
    });
  }

  function actualitzaCompte(id, fi) {
    const span = document.getElementById(id);
    function tick() {
      const r = fi - Date.now();
      if (r <= 0) {
        mostrarCastigs();
        return;
      }
      const h = Math.floor(r / 3600000);
      const m = Math.floor((r % 3600000) / 60000);
      const s = Math.floor((r % 60000) / 1000);
      span.textContent = `${h}h ${m}m ${s}s`;
      setTimeout(tick, 1000);
    }
    tick();
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("loginUser").value;
    const p = document.getElementById("loginPass").value;
    const usuaris = JSON.parse(localStorage.getItem("usuaris")) || {};
    if (usuaris[u] === p) {
      sessionStorage.setItem("usuariActiu", u);
      loginSection.style.display = "none";
      zonaPrivada.style.display = "block";
      mostrarCastigs();
    } else {
      loginError.textContent = "Usuari o contrasenya incorrectes.";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nen = document.getElementById("nen").value;
    const duradaText = document.getElementById("durada").value;
    const tipusFinal = tipus.value === "Altres" ? document.getElementById("altres").value : tipus.value;

    if (tipus.value === "Altres" && !tipusFinal.trim()) {
      alert("Especifica el càstig.");
      return;
    }

    const castig = {
      nen,
      tipus: tipusFinal,
      inici: Date.now(),
      fi: Date.now() + duradaEnMs(duradaText)
    };

    const castigs = JSON.parse(localStorage.getItem("castigs")) || [];
    castigs.push(castig);
    localStorage.setItem("castigs", JSON.stringify(castigs));
    form.reset();
    altresContainer.style.display = "none";
    mostrarCastigs();
  });

  function eliminarCastig(index) {
    const castigs = JSON.parse(localStorage.getItem("castigs")) || [];
    castigs.splice(index, 1);
    localStorage.setItem("castigs", JSON.stringify(castigs));
    mostrarCastigs();
  }

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("usuariActiu");
    location.reload();
  });

  // Si ja hi ha sessió iniciada
  if (sessionStorage.getItem("usuariActiu")) {
    loginSection.style.display = "none";
    zonaPrivada.style.display = "block";
  }

  mostrarCastigs();
});
