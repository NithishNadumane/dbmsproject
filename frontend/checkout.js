const backendURL = 'http://localhost:3000/api';
const checkoutList = document.getElementById('checkoutList');
const user_email = localStorage.getItem('user_email'); // ✅ Correct key

async function loadCartItems() {
  if (!user_email) {
    checkoutList.innerHTML = '<p>Please login to view your cart.</p>';
    return;
  }

  try {
    const res = await fetch(`${backendURL}/cart?user_email=${encodeURIComponent(user_email)}`);
    const cartItems = await res.json();

    if (cartItems.length === 0) {
      checkoutList.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }

    checkoutList.innerHTML = ''; // Clear previous content

    cartItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${item.image_url}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <span class="price">₹${item.price}</span>
        <p>Quantity: ${item.quantity}</p>
      `;
      checkoutList.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading cart:', err);
    checkoutList.innerHTML = `<p>Failed to load cart items.</p>`;
  }
}

loadCartItems();
