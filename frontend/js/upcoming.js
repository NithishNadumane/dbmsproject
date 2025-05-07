document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("user_email");

  fetch("http://localhost:3000/api/events/upcoming")
    .then(res => res.json())
    .then(events => {
      const list = document.getElementById("events-list");
      events.forEach(event => {
        const div = document.createElement("div");
        div.className = "event";
        div.innerHTML = `
          <h3>${event.title}</h3>
          <p><strong>Organizer:</strong> ${event.organizer}</p>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Type:</strong> ${event.event_type}</p>
          <p>${event.description}</p>
          <button class="join-btn" data-id="${event.id}">Join</button>
        `;
        list.appendChild(div);
      });

      document.querySelectorAll(".join-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const eventId = btn.getAttribute("data-id");
          fetch("http://localhost:3000/api/events/join", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ eventId, email: userEmail })
          }).then(() => {
            alert("Joined successfully!");
          });
        });
      });
    });

  fetch(`http://localhost:3000/api/events/history?email=${userEmail}`)
    .then(res => res.json())
    .then(history => {
      const list = document.getElementById("history-list");
      if (history.length === 0) {
        list.innerHTML = "<p>No participation history found.</p>";
      } else {
        history.forEach(h => {
          const div = document.createElement("div");
          div.className = "history";
          div.innerHTML = `
            <h3>${h.title}</h3>
            <p><strong>Date:</strong> ${h.date}</p>
            <p><strong>Joined At:</strong> ${h.joined_at}</p>
          `;
          list.appendChild(div);
        });
      }
    });
});
