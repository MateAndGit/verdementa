const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSlZzYcdQExXYfjh5A3tRt4wEeLZX3aR-JXTNg0aphibbMEN9ZdukAwbfCGzsgam0NtAnqdHrjkNzw1/pub?output=csv";

let allProducts = [];
let cart = {}; // 수량 관리를 위해 객체 형태로 변경

async function init() {
  try {
    const response = await fetch(SHEET_CSV_URL);
    const data = await response.text();
    const rows = data.split("\n").slice(1);

    allProducts = rows.map((row) => {
      const cols = row.split(",");
      return {
        id: cols[0]?.trim(),
        category: cols[1]?.trim(), // categoria
        name: cols[2]?.trim(), // nombre
        price: cols[3]?.trim(), // precio
        image: cols[4]?.trim(), // imagen
        desc: cols[5]?.trim(), // descripcion
      };
    });

    renderProducts("cat1");
  } catch (e) {
    console.error("데이터 로드 실패:", e);
  }
}

// 상품 리스트 렌더링 (인스타그램 주소 대응 버전)
function renderProducts(categoryName) {
  const grid = document.getElementById("product-list");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = allProducts.filter((p) => p.category === categoryName);

  filtered.forEach((p) => {
    let mediaHTML = "";
    const rawImage = p.image || "";

    // 💡 인스타그램 일반 게시물 또는 릴스 주소인지 확인
    if (
      rawImage.includes("instagram.com/p/") ||
      rawImage.includes("instagram.com/reels/") ||
      rawImage.includes("instagram.com/reel/")
    ) {
      // 1. 쿼리스트링(?...) 제거
      let cleanUrl = rawImage.split("?")[0];
      // 2. 끝에 붙은 슬래시(/) 제거
      if (cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);
      // 3. 이미 /embed가 붙어있는 경우 중복 방지 처리 후 최종 URL 생성
      const embedUrl = cleanUrl.endsWith("/embed") ? cleanUrl : `${cleanUrl}/embed`;

      mediaHTML = `
        <div class="media-container" style="position: relative; width: 100%; height: 100%;">
          <img 
            src="https://placehold.jp/24/064e3b/ffffff/300x300.png?text=VerdeMenta" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;"
          >
          <iframe 
            src="${embedUrl}" 
            class="product-insta-embed" 
            style="position: absolute; z-index: 2;"
            frameborder="0" 
            scrolling="no" 
            allowtransparency="true">
          </iframe>
        </div>`;
    } else if (
      rawImage.toLowerCase().endsWith(".mp4") ||
      rawImage.toLowerCase().endsWith(".webm") ||
      rawImage.toLowerCase().endsWith(".mov")
    ) {
      // 🎥 직접 비디오 파일 주소인 경우
      mediaHTML = `
        <video class="product-video" autoplay loop muted playsinline>
          <source src="${rawImage}" type="video/mp4">
        </video>`;
    } else {
      // 일반 이미지 주소 처리
      mediaHTML = `<img src="${rawImage}" alt="${p.name}" onerror="this.src='https://placehold.jp/24/00796b/ffffff/300x300.png?text=VerdeMenta'">`;
    }

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <div class="product-image">
            ${mediaHTML}
        </div>
        <div class="product-info">
            <h3>${p.name}</h3>
            <p class="description">${p.desc || "Un producto fresco de Verde Menta."}</p>
            <p class="price">$${Number(p.price).toLocaleString("es-AR")}</p>
            <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">Agregar 🛒</button>
        </div>
    `;
    grid.appendChild(card);
  });
}

// 1. 장바구니 담기 (수량 합치기 로직)
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  if (cart[productId]) {
    cart[productId].quantity += 1;
  } else {
    cart[productId] = { ...product, quantity: 1 };
  }

  updateCartCount();
  renderCart(); // 장바구니 내부 그리기
}

// 2. 장바구니 배지 숫자 업데이트
function updateCartCount() {
  const countBadge = document.getElementById("cart-count");
  // 모든 상품의 수량을 더함
  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  if (countBadge) countBadge.innerText = totalItems;
}

// 3. 장바구니 모달 내부 리스트 렌더링 (x2 및 가격 합계)
function renderCart() {
  const cartList = document.getElementById("cart-items-list");
  const totalAmount = document.getElementById("cart-total-amount");
  if (!cartList) return;

  cartList.innerHTML = "";
  let total = 0;

  Object.values(cart).forEach((item) => {
    const itemTotal = Number(item.price) * item.quantity;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>$${Number(item.price).toLocaleString("es-AR")} x ${item.quantity}</p>
      </div>
      <div class="cart-item-btns">
        <button onclick="changeQty('${item.id}', 1)">+</button>
        <button onclick="changeQty('${item.id}', -1)">-</button>
        <button class="del-btn" onclick="removeItem('${item.id}')">Eliminar</button>
      </div>
    `;
    cartList.appendChild(div);
  });

  totalAmount.innerText = `$${total.toLocaleString("es-AR")}`;
}

// 수량 조절 (+ / -)
window.changeQty = function (id, delta) {
  if (cart[id]) {
    cart[id].quantity += delta;
    if (cart[id].quantity <= 0) delete cart[id];
    updateCartCount();
    renderCart();
  }
};

// 개별 삭제
window.removeItem = function (id) {
  delete cart[id];
  updateCartCount();
  renderCart();
};

// 4. 모달 열기/닫기 이벤트
document.getElementById("cart-btn").addEventListener("click", () => {
  document.getElementById("cart-modal").classList.add("active");
});

document.getElementById("close-cart").addEventListener("click", () => {
  document.getElementById("cart-modal").classList.remove("active");
});

// 5. WhatsApp 주문하기 버튼
document.getElementById("checkout-btn").addEventListener("click", () => {
  const cartItems = Object.values(cart);
  if (cartItems.length === 0) return alert("El carrito está vacío.");

  let total = 0;
  cartItems.forEach((item) => {
    total += Number(item.price) * item.quantity;
  });

  const message = `Hola Verde Menta! Quisiera consultar por un pedido de $${total.toLocaleString("es-AR")}. ¿Tienen disponibilidad y cuanto cuesta el envio?`;

  const whatsappUrl = `https://wa.me/5493436210934?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
});

// 카테고리 클릭 이벤트
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    renderProducts(e.target.getAttribute("data-category"));
  });
});

init();
