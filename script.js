/* ===== DADOS DA EMPRESA — preencha aqui quando forem confirmados =====
   Deixe vazio ("") o que ainda não foi informado. */
const CONFIG = {
  whatsapp: "+55 (12) 98894-0104",
  telefone: "(12) 3652-4873",
  endereco: "Rua Comendador João Lopes, 103, Centro, Caçapava – SP",
  horario: "Segunda a sexta, 8h30 às 18h. Sábado, 8h às 13h.",
  instagram: "",  // Link completo do perfil
  facebook:  ""   // Link completo da página
};

const NOME = "Bicicletaria do Japonês";
document.documentElement.classList.add("js");

/* Oculta o cursor em texto estático após clique e o restaura ao usar o teclado. */
document.addEventListener("pointerdown", function () {
  document.documentElement.classList.add("ocultar-cursor-texto");
});

document.addEventListener("keydown", function () {
  document.documentElement.classList.remove("ocultar-cursor-texto");
});


/* Monta o link do WhatsApp com a mensagem pronta.
   Sem número configurado, o WhatsApp abre para o visitante escolher o contato. */
function linkWhatsApp(mensagem) {
  const numero = CONFIG.whatsapp.replace(/\D/g, "");
  return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem);
}

/* A mensagem usa o nome e o preço exibidos no cartão. */
function mensagemWhatsApp(link) {
  if (link.hasAttribute("data-wa-produto")) {
    const produto = link.closest(".produto");
    const nome = produto.querySelector("h3").textContent.trim();
    const valor = produto.querySelector(".produto-preco").textContent.trim();

    return [
      "Olá! Quero comprar este produto na " + NOME + ".",
      "",
      "*" + nome + "*",
      "Preço do produto *" + valor + "*",
      "",
      "Vocês podem confirmar a disponibilidade?"
    ].join("\n");
  }

  const categoria = link.dataset.wa;
  return categoria
    ? "Olá! Gostaria de consultar produtos da categoria \"" + categoria + "\" na " + NOME + "."
    : "Olá! Vim pelo site da " + NOME + " e gostaria de mais informações.";
}

document.querySelectorAll("[data-wa], [data-wa-produto]").forEach(function (link) {
  link.href = linkWhatsApp(mensagemWhatsApp(link));
  link.target = "_blank";
  link.rel = "noopener";
});

/* Campos de contato: troca o texto padrão pelo dado informado */
document.querySelectorAll("[data-info]").forEach(function (el) {
  const valor = CONFIG[el.dataset.info];
  if (valor) el.textContent = valor;
});

/* Redes sociais: só aparecem se houver link */
document.querySelectorAll("[data-social]").forEach(function (a) {
  const url = CONFIG[a.dataset.social];
  if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; }
});

document.getElementById("ano").textContent = new Date().getFullYear();

/* Busca e filtros do catálogo */
const controles = document.querySelector(".catalogo-controles");
const busca = document.getElementById("buscar-produto");
const botoesFiltro = [...controles.querySelectorAll("[data-filtro]")];
const resultado = controles.querySelector(".catalogo-resultado");
const estadoVazio = document.querySelector(".catalogo-vazio");

function normalizarBusca(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const produtos = [...document.querySelectorAll(".catalogo-lista .produto")].map(function (cartao) {
  const texto = [...cartao.querySelectorAll("h3, .produto-tipo, .produto-descricao")]
    .map(function (campo) { return campo.textContent; })
    .join(" ");
  return { cartao, texto: normalizarBusca(texto) };
});

let categoriaAtiva = "todos";

function atualizarCatalogo() {
  const termos = normalizarBusca(busca.value.trim()).split(/\s+/);
  let total = 0;

  for (const { cartao, texto } of produtos) {
    const naCategoria = categoriaAtiva === "todos" || cartao.dataset.categoria === categoriaAtiva;
    const corresponde = naCategoria && termos.every(function (termo) { return texto.includes(termo); });
    cartao.hidden = !corresponde;
    if (corresponde) total++;
  }

  resultado.textContent = total + (total === 1 ? " produto" : " produtos");
  estadoVazio.hidden = total > 0;
}

function selecionarCategoria(categoria) {
  categoriaAtiva = categoria;
  for (const botao of botoesFiltro) {
    botao.setAttribute("aria-pressed", botao.dataset.filtro === categoria);
  }
  atualizarCatalogo();
}

for (const botao of botoesFiltro) {
  botao.addEventListener("click", function () { selecionarCategoria(botao.dataset.filtro); });
}

busca.addEventListener("input", atualizarCatalogo);
document.getElementById("limpar-filtros").addEventListener("click", function () {
  busca.value = "";
  selecionarCategoria("todos");
  busca.focus();
});

controles.hidden = false;
atualizarCatalogo();

/* Menu responsivo */
const botao = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");
function alternarMenu(abrir) {
  menu.classList.toggle("aberto", abrir);
  botao.setAttribute("aria-expanded", abrir);
  botao.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
}
botao.addEventListener("click", function () { alternarMenu(!menu.classList.contains("aberto")); });
menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { alternarMenu(false); }); });

/* Aparição suave das seções ao rolar */
const itens = document.querySelectorAll(".rv");
if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("on"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  itens.forEach(function (el) { obs.observe(el); });
} else {
  itens.forEach(function (el) { el.classList.add("on"); });
}
