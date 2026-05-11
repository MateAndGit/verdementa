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
        category: cols[1]?.trim(),
        name: cols[2]?.trim(),
        price: cols[3]?.trim(),
        image: cols[4]?.trim(),
        desc: cols[5]?.trim(),
      };
    });

    renderProducts("cat1");
  } catch (e) {
    console.error("데이터 로드 실패:", e);
  }
}

// 상품 리스트 렌더링
function renderProducts(categoryName) {
  const grid = document.getElementById("product-list");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = allProducts.filter((p) => p.category === categoryName);

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
        <div class="product-image">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.jp/24/00796b/ffffff/300x300.png?text=VerdeMenta'">
        </div>
        <div class="product-info">
            <h3>${p.name}</h3>
            <p class="description">${p.desc || "싱그러운 민트 아이템입니다."}</p>
            <p class="price">₩${Number(p.price).toLocaleString()}</p>
            <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">담기 🛒</button>
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
  alert(`[${product.name}] 상품이 담겼습니다.`);
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
        <p>₩${Number(item.price).toLocaleString()} x ${item.quantity}</p>
      </div>
      <div class="cart-item-btns">
        <button onclick="changeQty('${item.id}', 1)">+</button>
        <button onclick="changeQty('${item.id}', -1)">-</button>
        <button class="del-btn" onclick="removeItem('${item.id}')">취소</button>
      </div>
    `;
    cartList.appendChild(div);
  });

  totalAmount.innerText = `₩${total.toLocaleString()}`;
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
  if (cartItems.length === 0) return alert("장바구니가 비어있습니다.");

  let message = "안녕하세요! Verde Menta 주문 문의드립니다.\n\n";
  let total = 0;

  cartItems.forEach((item) => {
    const subtotal = Number(item.price) * item.quantity;
    message += `- ${item.name} (${item.quantity}개): ₩${subtotal.toLocaleString()}\n`;
    total += subtotal;
  });

  message += `\n총 합계: ₩${total.toLocaleString()}\n배송 및 구매 가능 여부 확인 부탁드립니다!`;

  const whatsappUrl = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`;
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
