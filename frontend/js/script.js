function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("active");
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// Updated Feature Cards with page links
const features = [
  {
    title: "♻️ Recycle Tracker",
    desc: "Submit items for recycling and track the status.",
    link: "recycle.html"
  },
  {
    title: "🛍️ Eco Products",
    desc: "Buy sustainable and environment-friendly items.",
    link: "products.html"
  },
  {
    title: "🌱 Green Events",
    desc: "Join clean-up drives, plantation events, and more.",
    link: "events.html"
  },
  {
    title: "📊 View Carbon Score",
    desc: "Track and reduce your environmental impact.",
    link: "carbon.html"
  }
];

const featuresSection = document.querySelector('.features');

features.forEach(feature => {
  const div = document.createElement('div');
  div.className = 'feature';
  div.innerHTML = `
    <a href="${feature.link}" class="feature-card">
      <h2>${feature.title}</h2>
      <p>${feature.desc}</p>
    </a>
  `;
  featuresSection.appendChild(div);
});
