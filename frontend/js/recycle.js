const backendURL = 'http://localhost:3000/api';
const form = document.getElementById('pickupForm');
const requestList = document.getElementById('requestList');
const user_email = localStorage.getItem('user_email');

// 📦 Submit Pickup
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const wasteCheckboxes = document.querySelectorAll('#wasteCheckboxes input[type="checkbox"]:checked');
  const selectedWaste = Array.from(wasteCheckboxes).map(cb => cb.value);

  const area = document.getElementById('area').value;

  if (selectedWaste.length === 0) {
    alert('Please select at least one waste type.');
    return;
  }

  const res = await fetch(`${backendURL}/request-pickup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email, waste_type: selectedWaste, area })
  });

  const data = await res.json();
  alert(data.message);
  form.reset();
  loadRequests();
});


// 📜 Load Pickup Requests
async function loadRequests() {
  const res = await fetch(`${backendURL}/my-requests?user_email=${user_email}`);
  const requests = await res.json();

  requestList.innerHTML = '';
  requests.forEach(req => {
    const div = document.createElement('div');
    div.className = 'request-card';
    div.innerHTML = `
      <p><strong>Waste:</strong> ${req.waste_type}</p>
      <p><strong>Area:</strong> ${req.area}</p>
      <p><strong>Status:</strong> ${req.status}</p>
      <p><small>${new Date(req.requested_at).toLocaleString()}</small></p>
    `;
    requestList.appendChild(div);
  });
}

if (user_email) loadRequests();
