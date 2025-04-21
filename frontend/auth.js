// Set your backend URL (Port 3000)
const backendURL = 'http://localhost:3000/api';

// SIGNUP FORM
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    try {
      const res = await fetch(`${backendURL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Signup successful! Redirecting to login...');
        localStorage.removeItem('user_email'); // Clean any existing email
        window.location.href = 'login.html';
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

// LOGIN FORM
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    try {
      const res = await fetch(`${backendURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Login successful!');
        localStorage.setItem('user_email', email);
        console.log('Stored email:', localStorage.getItem('user_email'));
        // Store logged-in user's email
        window.location.href = 'home.html';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}
