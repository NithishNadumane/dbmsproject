document.getElementById('carbon-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const answers = {};

  for (const [key, value] of formData.entries()) {
    answers[key] = value;
  }

  // Get the user email (assume stored in localStorage after login)
  const email = localStorage.getItem('user_email');

  try {
    const res = await fetch('http://localhost:3000/api/carbon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, answers }),
    });

    const data = await res.json();

    if (data.success) {
      // Display the carbon score
      document.getElementById('score').textContent = `Your Carbon Score: ${data.score}`;

      // Display the polite message based on the score
      document.getElementById('message').textContent = data.message;

      // Show the result box
      document.getElementById('result-box').style.display = 'block';
    } else {
      alert('Submission failed. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while submitting your data.');
  }
});
