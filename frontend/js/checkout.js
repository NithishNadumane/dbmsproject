const backendURL = 'http://localhost:3000/api';
const checkoutList = document.getElementById('checkoutList');
const user_email = localStorage.getItem('user_email'); // ✅ Correct key

// Function to load cart items and display them
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
        <button class="remove-from-cart" data-id="${item.product_id}">Remove from Cart</button>
      `;
      checkoutList.appendChild(card);
    });

    // Add event listeners to "Remove from Cart" buttons
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const itemId = parseInt(e.target.dataset.id, 10); // Ensure integer
        try {
          const res = await fetch(`${backendURL}/cart/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email, item_id: itemId })
          });
          const data = await res.json();
          if (data.success) {
            loadCartItems();
            appendPlaceOrderButton();// Refresh cart
          } else {
            alert('Failed to remove item from cart: ' + data.message);
          }
        } catch (err) {
          console.error('Error removing item:', err);
          alert('Error removing item from cart.');
        }
      });
    });

  } catch (err) {
    console.error('Error loading cart:', err);
    checkoutList.innerHTML = `<p>Failed to load cart items.</p>`;
  }
}


// Function to handle placing the order
async function placeOrder() {
  if (!user_email) {
    alert('Please log in to place an order.');
    return;
  }

  try {
    const res = await fetch(`${backendURL}/cart/placeOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_email })
    });

    const data = await res.json();

    if (data.success) {
      alert('Your order has been placed successfully!');
      loadCartItems();
      // Optionally, reload the cart to reflect that the order was placed
    } else {
      alert('Failed to place the order.');
    }
  } catch (err) {
    console.error('Error placing order:', err);
    alert('Failed to place the order.');
  }
}

// Add Place Order button to the cart
const placeOrderButton = document.createElement('button');
placeOrderButton.className = 'place-order';
placeOrderButton.innerText = 'Place Order';
placeOrderButton.addEventListener('click', placeOrder);

// Append the "Place Order" button if cart items exist
async function appendPlaceOrderButton() {
  const res = await fetch(`${backendURL}/cart?user_email=${encodeURIComponent(user_email)}`);
  const cartItems = await res.json();

  if (cartItems.length > 0 && !document.querySelector('.place-order')) {
    checkoutList.appendChild(placeOrderButton);
  }
}

// Load cart items and append the Place Order button
loadCartItems();
appendPlaceOrderButton();
