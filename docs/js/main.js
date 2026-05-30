// Service Worker Registration para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/buscador-de-cep/sw.js").catch(() => {
      // Service Worker registration failed, app will still work offline gracefully
    });
  });
}

// Previne comportamento padrão de pull-to-refresh
document.body.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false },
);

function apenasNumeros(str) {
  return str.replace(/\D/g, "");
}

function atualizarMapa(endereco) {
  const mapaIframe = document.getElementById("mapa");
  const textoMapa = document.getElementById("textoMapa");
  const placeholder = document.getElementById("mapPlaceholder");
  const pillStatus = document.getElementById("pillStatus");
  const pillText = document.getElementById("pillText");

  if (!endereco) {
    textoMapa.textContent = "Não foi possível montar o endereço para o mapa.";
    mapaIframe.src = "";
    mapaIframe.style.display = "none";
    placeholder.style.display = "flex";
    pillStatus.style.display = "none";
    return;
  }

  const enderecoEncode = encodeURIComponent(endereco);
  const url = `https://www.google.com/maps?q=${enderecoEncode}&output=embed`;

  mapaIframe.src = url;
  mapaIframe.style.display = "block";
  placeholder.style.display = "none";

  textoMapa.textContent = `Localização aproximada para: ${endereco}`;
  pillText.textContent = "Endereço localizado no mapa.";
  pillStatus.style.display = "inline-flex";

  // Scroll smooth para o mapa em mobile
  if (window.innerWidth < 920) {
    setTimeout(() => {
      const mapContainer = document.querySelector(".map-container");
      if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 300);
  }
}

// Busca CEP
document.getElementById("btnBuscarCep").addEventListener("click", async () => {
  const cepInput = document.getElementById("cep");
  const resultadoDiv = document.getElementById("resultadoCep");
  const btnBuscar = document.getElementById("btnBuscarCep");

  const raw = cepInput.value.trim();
  const cep = apenasNumeros(raw);

  if (cep.length !== 8) {
    resultadoDiv.innerHTML = `
      <strong>Endereço</strong>
      <div class="resultado-line erro">
        CEP inválido. Informe exatamente 8 dígitos.
      </div>
    `;
    atualizarMapa("");
    cepInput.setAttribute("aria-invalid", "true");
    return;
  }

  cepInput.setAttribute("aria-invalid", "false");
  btnBuscar.disabled = true;
  resultadoDiv.innerHTML = `
    <strong>Endereço</strong>
    <div class="resultado-line">Buscando informações...</div>
  `;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) {
      throw new Error("Erro na consulta do CEP.");
    }

    const data = await response.json();

    if (data.erro) {
      resultadoDiv.innerHTML = `
        <strong>Endereço</strong>
        <div class="resultado-line erro">
          CEP não encontrado. Verifique e tente novamente.
        </div>
      `;
      atualizarMapa("");
      btnBuscar.disabled = false;
      return;
    }

    resultadoDiv.innerHTML = `
      <strong>Endereço</strong>
      <div class="resultado-line">CEP: ${data.cep}</div>
      <div class="resultado-line">Logradouro: ${data.logradouro || "N/A"}</div>
      <div class="resultado-line">Bairro: ${data.bairro || "N/A"}</div>
      <div class="resultado-line">Cidade: ${data.localidade || "N/A"}</div>
      <div class="resultado-line">UF: ${data.uf || "N/A"}</div>
      <div class="resultado-line">Complemento: ${data.complemento || "N/A"}</div>
    `;

    const partes = [];
    if (data.logradouro) partes.push(data.logradouro);
    if (data.bairro) partes.push(data.bairro);
    if (data.localidade && data.uf) {
      partes.push(`${data.localidade} - ${data.uf}`);
    } else if (data.localidade) {
      partes.push(data.localidade);
    }

    const enderecoMapa = partes.join(", ");
    atualizarMapa(enderecoMapa);

    // Armazenar no localStorage para offline support
    if ("localStorage" in window) {
      const historico = JSON.parse(localStorage.getItem("cepistorico") || "[]");
      historico.unshift({
        cep: data.cep,
        endereco: enderecoMapa,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(
        "cepistorico",
        JSON.stringify(historico.slice(0, 10)),
      ); // Últimas 10 buscas
    }
  } catch (error) {
    console.error(error);
    resultadoDiv.innerHTML = `
      <strong>Endereço</strong>
      <div class="resultado-line erro">
        Erro ao consultar o CEP. Tente novamente em instantes.
      </div>
    `;
    atualizarMapa("");
  } finally {
    btnBuscar.disabled = false;
  }
});

// Enter para buscar
document.getElementById("cep").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    document.getElementById("btnBuscarCep").click();
  }
  // Clear error state on typing
  if (e.target.hasAttribute("aria-invalid")) {
    e.target.setAttribute("aria-invalid", "false");
  }
});

// Auto-format CEP com formatação visual
document.getElementById("cep").addEventListener("input", (e) => {
  let value = apenasNumeros(e.target.value);
  if (value.length > 5) {
    value = value.substring(0, 5) + "-" + value.substring(5, 8);
  }
  e.target.value = value;
});
