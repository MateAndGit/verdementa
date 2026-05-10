// 1. 구글 시트 CSV 주소 (게시된 주소)
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSlZzYcdQExXYfjh5A3tRt4wEeLZX3aR-JXTNg0aphibbMEN9ZdukAwbfCGzsgam0NtAnqdHrjkNzw1/pub?output=csv";

let allProducts = []; // 전체 상품 데이터를 담을 그릇
let cart = []; // 장바구니에 담긴 상품들을 담을 그릇

// 2. 초기 데이터 로드 함수
async function init() {
  try {
    const response = await fetch(SHEET_CSV_URL);
    const data = await response.text();

    // CSV 파싱 (줄바꿈으로 나누고 첫 줄 헤더 제외)
    const rows = data.split("\n").slice(1);

    allProducts = rows.map((row) => {
      // 쉼표로 열 구분 (데이터에 쉼표가 포함된 경우를 대비해 트림 처리)
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

    // 앱 시작 시 'Producto 1' (cat1) 상품들을 기본으로 렌더링
    renderProducts("cat1");
  } catch (e) {
    console.error("데이터 로드 실패:", e);
    const grid = document.getElementById("product-list");
    if (grid) grid.innerHTML = "<p>데이터를 불러오는 데 실패했습니다.</p>";
  }
}

// 3. 상품 리스트 렌더링 함수
function renderProducts(categoryName) {
  const grid = document.getElementById("product-list");
  if (!grid) return;

  grid.innerHTML = ""; // 기존 '로딩 중' 메시지나 상품 삭제

  // 선택한 카테고리와 일치하는 상품만 필터링
  const filtered = allProducts.filter((p) => p.category === categoryName);

  if (filtered.length === 0) {
    grid.innerHTML = "<p>해당 카테고리에 상품이 없습니다.</p>";
    return;
  }

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
            <p class="price">₩${Number(p.price).toLocaleString() || "0"}</p>
            <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">담기 🛒</button>
        </div>
    `;
    grid.appendChild(card);
  });
}

// 4. 장바구니 담기 함수
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);

  if (product) {
    cart.push(product);
    updateCartCount(); // 숫자 배지 업데이트
    alert(`[${product.name}] 상품이 장바구니에 담겼습니다!`);
  }
}

// 5. 우측 상단 카트 숫자 배지 업데이트
function updateCartCount() {
  // HTML에 정의된 id="cart-count" 요소를 찾아가 숫자를 바꿉니다.
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    cartCountElement.innerText = cart.length;
  }
}

// 6. 상단 메뉴 클릭 이벤트 설정
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const targetCat = e.target.getAttribute("data-category");

    // 상품 리스트 교체
    renderProducts(targetCat);
  });
});

// 시작!
init();
