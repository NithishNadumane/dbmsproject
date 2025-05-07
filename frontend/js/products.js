const backendURL = 'http://localhost:3000/api';
const productList = document.getElementById('productList');
const categoryFilter = document.getElementById('categoryFilter');

// Load products from the backend
async function loadProducts(category = 'All') {
  try {
    let url = `${backendURL}/products`;
    if (category !== 'All') {
      url += `?category=${encodeURIComponent(category)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');

    const products = await res.json();
    productList.innerHTML = '';

    if (products.length === 0) {
      productList.innerHTML = '<p>No products found in this category.</p>';
      return;
    }

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const stockInfo = product.stock > 0
        ? `<button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${product.stock}">Add to Cart</button>`
        : `<span class="out-of-stock">Out of Stock</span>`;

      card.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="price">₹${product.price}</span>
        ${stockInfo}
      `;
      productList.appendChild(card);
    });

    // Attach event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const name = e.target.dataset.name;
        const price = parseFloat(e.target.dataset.price);
        const stock = parseInt(e.target.dataset.stock);

        const quantity = parseInt(prompt(`Enter quantity to add (max ${stock}):`, '1'));
        if (!quantity || quantity < 1 || quantity > stock) {
          alert('Invalid quantity or exceeds stock.');
          return;
        }

        await addToCart(id, name, price, quantity);
      });
    });

  } catch (err) {
    console.error('Error fetching products:', err);
    productList.innerHTML = `<p>Error loading products.</p>`;
  }
}

async function addToCart(product_id, name, price, quantity) {
  const user_email = localStorage.getItem('user_email');
  if (!user_email) {
    alert('Please login to add products to your cart!');
    return;
  }

  const cartKey = `cart_${user_email}`;
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  const existingItem = cart.find(item => item.product_id === product_id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product_id, name, price, quantity });
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));

  try {
    const res = await fetch(`${backendURL}/add-to-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email, product_id, product_name: name, quantity })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ ${name} (x${quantity}) added to your cart`);
    } else {
      console.error('Error adding to cart:', data.error);
      alert('⚠️ Failed to sync with backend.');
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('⚠️ Backend error occurred.');
  }
}

// Initial load
loadProducts();
categoryFilter.addEventListener('change', () => {
  loadProducts(categoryFilter.value);
});
// Reload products when returning from another page (like checkout)
// Force a true reload when returning to this page from back/forward navigation
window.addEventListener('pageshow', (event) => {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    window.location.reload(); // Force hard reload to fetch fresh data
  }
});

