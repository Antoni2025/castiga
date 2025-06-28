document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("castigForm");
  const tipus = document.getElementById("tipus");
  const altreCastig = document.getElementById("altreCastigContainer");
  const llista = document.getElementById("castigsActius");

  // Mostrar camp de text si es selecciona "Altres"
  tipus.addEventListener("change", () => {
    altreCastig.style.display = tipus.value === "Altres" ? "block" : "none";
  });

  // Convertir durada a mil·lisegons
  function duradaEnMilisegons(durada) {
    const map = {
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
    return map[durada] || 0;
  }

  // Carregar càstigs des de localStorage
  function carregarCastigs() {
    const castigs = JSON.parse(localStorage.getItem("castigs")) || [];
    llista.innerHTML = "";
    const ara = Date.now();

    castigs.forEach((c, i) => {
      const resta = c.fi - ara;
      if (resta > 0) {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${c.nen}</strong><br>
          <img src="img/${c.nen.toLowerCase()}.jpg" alt="${c.nen}" width="60"><br>
          <em>${c.tipus}</em><br>
          Temps restant: <span id="compte${i}"></span><br>
          <button onclick="eliminaCastig(${i})">Eliminar càstig</button>
        `;
        llista.appendChild(li);
        compteEnrere(`compte${i}`, c.fi);
      }
    });
  }

  // Afegir càstig nou
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const castig = {
      nen: document.getElementById("nen").value,
      tipus: tipus.value === "Altres" ? document.getElementById("altres").value : tipus.value,
      inici: Date.now(),
      fi: Date.now() + duradaEnMilisegons(document.getElementById("durada").value)
    };

    const castigs = JSON.parse(localStorage.getItem("castigs")) || [];
    castigs.push(castig);
    localStorage.setItem("castigs", JSON.stringify(castigs));

    form.reset();
    altreCastig.style.display = "none";
    carregarCastigs();
  });

  // Compte enrere
  function compteEnrere(elementId, fi) {
    function actualitza() {
      const ara = Date.now();
      const resta = fi - ara;
      const h = Math.floor(resta / 3600000);
      const m = Math.floor((resta % 3600000) / 60000);
      const s = Math.floor((resta % 60000) / 1000);
      document.getElementById(elementId).textContent =
        `${h}h ${m}m ${s}s`;
      if (resta > 0) setTimeout(actualitza, 1000);
      else carregarCastigs(); // actualitzar quan s'esgoti
    }
    actualitza();
  }

  // Eliminar càstig
  window.eliminaCastig = function(index) {
    const castigs = JSON.parse(localStorage.getItem("castigs")) || [];
    castigs.splice(index, 1);
    localStorage.setItem("castigs", JSON.stringify(castigs));
    carregarCastigs();
  };

  carregarCastigs();
});
