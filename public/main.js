window.addEventListener("load", () => {
  setTimeout(() => {
    const loading = document.getElementById("loading");

    if (loading) {
      loading.classList.add("hide");
    }
  }, 4000);
});

const cursorDot = document.querySelector(".cursor-dot");
const cursorGlow = document.querySelector(".cursor-glow");

let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (cursorDot) {
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  }
});

function animateCursor() {
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;

  if (cursorGlow) {
    cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
  }

  requestAnimationFrame(animateCursor);
}

animateCursor();

const filterButtons = document.querySelectorAll(".filter-button");
const workCards = document.querySelectorAll(".work-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    workCards.forEach((card) => {
      const category = card.dataset.category;

      if (filter === "All" || category === filter) {
        card.classList.remove("hide");
      } else {
        card.classList.add("hide");
      }
    });
  });
});

const menuButton = document.querySelector(".menu-button");
const menuClose = document.querySelector(".menu-close");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuButton && menuClose && mobileMenu) {
  menuButton.addEventListener("click", () => {
    mobileMenu.classList.add("is-open");
  });

  menuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
  });
}

const revealItems = document.querySelectorAll(
  ".work-card, .field-grid article, .lab-card, .case-section"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.15
  }
);

revealItems.forEach((item) => observer.observe(item));


/* =========================
   Loading
========================= */

window.addEventListener("load", () => {
  setTimeout(() => {
    const loading = document.getElementById("loading");
    if (loading) {
      loading.classList.add("hide");
    }
  }, 4000);
});


/* =========================
   Stamp Click Effect
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const stampArea = document.getElementById("stamp-area");
  const stampCanvas = document.getElementById("stamp-canvas");
  const stampCursor = document.getElementById("stamp-cursor");
  const stampCursorImg = document.getElementById("stamp-cursor-img");
  const stampGuide = document.getElementById("stamp-guide");

  if (!stampArea || !stampCanvas) {
    return;
  }

  const stampImages = [
    "/images/stamp_3.webp",
    "/images/stamp_4.webp",
    "/images/stamp_5.webp"
  ];

  const stampNormalImage = "/images/stamp_nomal.webp";
  const stampPushImage = "/images/stamp_push.webp";
  const maxStamps = 12;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let hasStamped = false;

  stampArea.addEventListener("mouseenter", () => {
    if (stampCursor) {
      stampCursor.style.display = "block";
    }

    if (stampGuide && !hasStamped) {
      stampGuide.style.display = "block";
    }
  });

  stampArea.addEventListener("mouseleave", () => {
    if (stampCursor) {
      stampCursor.style.display = "none";
    }

    if (stampGuide) {
      stampGuide.style.display = "none";
    }
  });

  stampArea.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  function followStampCursor() {
    currentX += (mouseX - currentX) * 0.18;
    currentY += (mouseY - currentY) * 0.18;

    if (stampCursor) {
      stampCursor.style.left = `${currentX}px`;
      stampCursor.style.top = `${currentY}px`;
    }

    if (stampGuide && !hasStamped) {
      stampGuide.style.left = `${currentX}px`;
      stampGuide.style.top = `${currentY}px`;
    }

    requestAnimationFrame(followStampCursor);
  }

  followStampCursor();

  stampArea.addEventListener("mousedown", () => {
    if (stampCursorImg) {
      stampCursorImg.src = stampPushImage;
    }

    if (stampCursor) {
      stampCursor.style.transform =
        "translate(-35%, -20%) rotate(-14deg) scale(0.92)";
    }
  });

  stampArea.addEventListener("mouseup", () => {
    if (stampCursorImg) {
      stampCursorImg.src = stampNormalImage;
    }

    if (stampCursor) {
      stampCursor.style.transform =
        "translate(-35%, -20%) rotate(0deg) scale(1)";
    }
  });

  stampArea.addEventListener("click", (event) => {
    hasStamped = true;

    if (stampGuide) {
      stampGuide.classList.add("is-hidden");
      stampGuide.style.display = "none";
    }

    const rect = stampArea.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const randomImage =
      stampImages[Math.floor(Math.random() * stampImages.length)];

    const randomRotate = Math.floor(Math.random() * 40 - 20);

    const stamp = document.createElement("div");
    stamp.className = "stamp-item";
    stamp.style.left = `${x}px`;
    stamp.style.top = `${y}px`;
    stamp.style.backgroundImage = `url(${randomImage})`;
    stamp.style.setProperty("--rotate", `${randomRotate}deg`);

    stampCanvas.appendChild(stamp);

    setTimeout(() => {
    stamp.classList.add("is-fading");
    }, 1800);

    setTimeout(() => {
    stamp.remove();
    }, 2500);

    const stamps = stampCanvas.querySelectorAll(".stamp-item");

    if (stamps.length > maxStamps) {
      stamps[0].remove();
    }
  });
});