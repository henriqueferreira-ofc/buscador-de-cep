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
}

document.getElementById("btnBuscarCep").addEventListener("click", async () => {
  const cepInput = document.getElementById("cep");
  const resultadoDiv = document.getElementById("resultadoCep");

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
    return;
  }

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
  } catch (error) {
    console.error(error);
    resultadoDiv.innerHTML = `
      <strong>Endereço</strong>
      <div class="resultado-line erro">
        Erro ao consultar o CEP. Tente novamente em instantes.
      </div>
    `;
    atualizarMapa("");
  }
});

document.getElementById("cep").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    document.getElementById("btnBuscarCep").click();
  }
});
