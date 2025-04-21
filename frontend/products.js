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
    productList.innerHTML = ''; // Clear existing products

    if (products.length === 0) {
      productList.innerHTML = '<p>No products found in this category.</p>';
      return;
    }

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="price">₹${product.price}</span>
        <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
      `;
      productList.appendChild(card);
    });

    // Attach event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const name = e.target.dataset.name;
        const price = parseFloat(e.target.dataset.price);
        addToCart(id, name, price);
      });
    });

  } catch (err) {
    console.error('Error fetching products:', err);
    productList.innerHTML = `<p>Error loading products.</p>`;
  }
}

// Add to Cart function (linked with backend)
async function addToCart(product_id, name, price) {
  const user_email = localStorage.getItem('user_email');
  if (!user_email) {
    alert('Please login to add products to your cart!');
    return;
  }

  // Save to localStorage (optional if you want UI to still show instant updates)
  const cartKey = `cart_${user_email}`;
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  const existingItem = cart.find(item => item.product_id === product_id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ product_id, name, price, quantity: 1 });
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));

  // 🔁 Sync with backend DB
  try {
    const res = await fetch(`${backendURL}/add-to-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_email,
        product_id,
        quantity: 1
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ ${name} added to your cart`);
    } else {
      console.error('Error adding to cart:', data.error);
      alert('⚠️ Failed to sync with backend.');
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('⚠️ Backend error occurred.');
  }
}


// Initial product load
loadProducts();

// Category filter event
categoryFilter.addEventListener('change', () => {
  const selectedCategory = categoryFilter.value;
  loadProducts(selectedCategory);
});
