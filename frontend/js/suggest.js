document.getElementById("eventForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = {
    title: form.title.value,
    organizer: form.organizer.value,
    date: form.date.value,
    location: form.location.value,
    event_type: form.event_type.value,
    description: form.description.value,
    created_by: localStorage.getItem("user_email")
  };

  try {
    const res = await fetch("http://localhost:3000/api/events/suggest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!res.ok) throw new Error("Failed to suggest event");

    const data = await res.json();
    document.getElementById("message").textContent = "Event suggestion submitted!";
    form.reset();
  } catch (err) {
    console.error(err);
    document.getElementById("message").textContent = "Something went wrong. Try again.";
  }
});
