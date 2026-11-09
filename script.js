// ---- Shop data (edit names and prices here) ----
const baskets = [
  { id: "wicker", name: "Wicker basket", emoji: "🧺", price: 399 },
  { id: "box", name: "Gift box", emoji: "🎁", price: 299 },
  { id: "hamper", name: "Premium hamper", emoji: "🎀", price: 599 }
];
const clothes = [
  { id: "onesie", name: "Cotton onesie", emoji: "👕", price: 249 },
  { id: "romper", name: "Romper", emoji: "👗", price: 349 },
  { id: "socks", name: "Socks, pair", emoji: "🧦", price: 99 },
  { id: "cap", name: "Soft cap", emoji: "🧢", price: 129 },
  { id: "mittens", name: "Mittens", emoji: "🧤", price: 119 },
  { id: "swaddle", name: "Swaddle blanket", emoji: "🧣", price: 399 }
];
const extras = [
  { id: "toy", name: "Plush toy", emoji: "🧸", price: 299 },
  { id: "card", name: "Handwritten card", emoji: "💌", price: 49 },
  { id: "wrap", name: "Gift wrapping", emoji: "🎁", price: 99 }
];
const themes = [
  { name: "Blush", main: "#ff9fb5", dark: "#e8708f" },
  { name: "Mint", main: "#7fcfa8", dark: "#4fae82" },
  { name: "Sky", main: "#7db8ea", dark: "#4f93d0" },
  { name: "Sunshine", main: "#ffcb4d", dark: "#e0a81f" }
];

// ---- State ----
let basket = null, theme = 0;
const qty = Object.fromEntries(clothes.map(c => [c.id, 0]));
const picked = Object.fromEntries(extras.map(e => [e.id, false]));

const $ = id => document.getElementById(id);
const rupees = n => "₹" + n;

// ---- Build the controls once ----
function buildBaskets() {
  $("baskets").innerHTML = baskets.map(b =>
    `<button class="basket-card" data-id="${b.id}" aria-pressed="false">
       <span class="e">${b.emoji}</span><strong>${b.name}</strong>${rupees(b.price)}</button>`).join("");
  $("baskets").onclick = e => {
    const card = e.target.closest(".basket-card");
    if (card) { basket = card.dataset.id; update(); }
  };
}
function buildThemes() {
  $("themes").innerHTML = themes.map((t, i) =>
    `<button class="swatch" data-i="${i}" style="background:${t.main}" aria-label="${t.name}" aria-pressed="false"></button>`).join("");
  $("themes").onclick = e => {
    const s = e.target.closest(".swatch");
    if (s) { theme = +s.dataset.i; update(); }
  };
}
function buildExtras() {
  $("extras").innerHTML = extras.map(x =>
    `<label class="extra"><input type="checkbox" data-id="${x.id}"><span>${x.emoji}</span><span>${x.name}</span><span>${rupees(x.price)}</span></label>`).join("");
  $("extras").onchange = e => { picked[e.target.dataset.id] = e.target.checked; update(); };
}
function buildClothes() {
  $("clothes").innerHTML = clothes.map(c =>
    `<div class="product" id="p-${c.id}">
       <div class="disc">${c.emoji}</div><strong>${c.name}</strong><small>${rupees(c.price)}</small><br>
       <div class="qty"><button data-id="${c.id}" data-d="-1" aria-label="Remove ${c.name}">−</button>
       <span id="q-${c.id}">0</span>
       <button data-id="${c.id}" data-d="1" aria-label="Add ${c.name}">+</button></div></div>`).join("");
  $("clothes").onclick = e => {
    const b = e.target.closest("button");
    if (!b) return;
    qty[b.dataset.id] = Math.max(0, qty[b.dataset.id] + +b.dataset.d);
    update();
  };
}

// ---- Redraw everything that depends on state ----
function update() {
  const t = themes[theme];
  document.documentElement.style.setProperty("--accent", t.main);
  document.documentElement.style.setProperty("--accent-dark", t.dark);

  document.querySelectorAll(".basket-card").forEach(c => c.setAttribute("aria-pressed", c.dataset.id === basket));
  document.querySelectorAll(".swatch").forEach(s => s.setAttribute("aria-pressed", +s.dataset.i === theme));
  clothes.forEach(c => {
    $("q-" + c.id).textContent = qty[c.id];
    $("p-" + c.id).classList.toggle("has", qty[c.id] > 0);
  });

  let total = 0, lines = [], emojis = [];
  const b = baskets.find(x => x.id === basket);
  if (b) { lines.push([b.name, b.price]); total += b.price; }
  clothes.forEach(c => {
    if (qty[c.id]) {
      lines.push([`${c.name} × ${qty[c.id]}`, c.price * qty[c.id]]);
      total += c.price * qty[c.id];
      for (let i = 0; i < qty[c.id]; i++) emojis.push(c.emoji);
    }
  });
  extras.forEach(x => {
    if (picked[x.id]) { lines.push([x.name, x.price]); total += x.price; emojis.push(x.emoji); }
  });

  $("summaryList").innerHTML = lines.length
    ? lines.map(l => `<li><span>${l[0]}</span><span>${rupees(l[1])}</span></li>`).join("")
    : `<li class="empty">Pick a basket to begin.</li>`;
  $("total").textContent = rupees(total);
  $("liveStage").dataset.basket = basket || "";
  $("liveItems").innerHTML = emojis.slice(0, 10).map(e => `<span>${e}</span>`).join("");
  $("orderMsg").textContent = "";
}

// ---- Gift tag preview ----
function updateTag() {
  $("tagName").textContent = $("babyName").value.trim() || "your little one";
  $("tagMsg").textContent = $("message").value.trim() || "Welcome to the world, little one!";
}
$("babyName").oninput = updateTag;
$("message").oninput = updateTag;

// ---- Order ----
$("orderBtn").onclick = () => {
  if (!basket) { $("orderMsg").textContent = "Choose a basket before placing your order."; return; }
  const items = Object.values(qty).reduce((a, n) => a + n, 0);
  if (!items) { $("orderMsg").textContent = "Add at least one piece of clothing."; return; }
  const name = $("babyName").value.trim();
  $("doneText").textContent = `Your hamper${name ? " for " + name : ""} is on its way to being packed. Total: ${$("total").textContent}.`;
  $("done").showModal();
};
$("closeDone").onclick = () => $("done").close();
$("resetBtn").onclick = () => location.reload();

buildBaskets(); buildClothes(); buildThemes(); buildExtras(); update(); updateTag();
