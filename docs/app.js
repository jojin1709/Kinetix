// Background Star & Particle Canvas
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 65;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.8 + 0.4;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.15;
    this.color = Math.random() > 0.4 ? '#ff7a00' : '#ffffff';
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Interactive Tour Tabs
const tabButtons = document.querySelectorAll('.tour-tab-btn');
const tabPanes = document.querySelectorAll('.tour-pane');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');

    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const activePane = document.getElementById(targetTab);
    if (activePane) {
      activePane.classList.add('active');
    }
  });
});

// Copy Prompt & Code Snippet Buttons
document.querySelectorAll('.btn-copy-prompt').forEach(btn => {
  btn.addEventListener('click', () => {
    const promptText = btn.getAttribute('data-prompt');
    if (!promptText) return;

    navigator.clipboard.writeText(promptText).then(() => {
      const origText = btn.innerHTML;
      btn.innerHTML = `<span>✓ Copied!</span>`;
      btn.style.background = '#27c93f';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.innerHTML = origText;
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    });
  });
});

document.querySelectorAll('.btn-code-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const code = btn.getAttribute('data-code');
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      const origHtml = btn.innerHTML;
      btn.innerHTML = `✓`;
      btn.style.color = '#38ef7d';
      setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.style.color = '';
      }, 1800);
    });
  });
});

// Interactive Lightbox (optional click to zoom)
document.querySelectorAll('.tour-image, .showcase-img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0, 0, 0, 0.9)';
    modal.style.backdropFilter = 'blur(12px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.cursor = 'zoom-out';
    modal.style.padding = '2rem';

    const fullImg = document.createElement('img');
    fullImg.src = img.src;
    fullImg.style.maxWidth = '92%';
    fullImg.style.maxHeight = '92%';
    fullImg.style.borderRadius = '12px';
    fullImg.style.boxShadow = '0 0 50px rgba(255, 106, 0, 0.3)';

    modal.appendChild(fullImg);
    document.body.appendChild(modal);

    modal.addEventListener('click', () => {
      modal.remove();
    });
  });
});

// Category Filtering for Video Showcase
const filterButtons = document.querySelectorAll('.filter-btn');
const showcaseCards = document.querySelectorAll('.showcase-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    showcaseCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      if (filter === 'all' || category.includes(filter)) {
        card.style.display = 'flex';
        card.style.animation = 'fadeIn 0.35s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Ensure all HTML5 videos play reliably
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('video').forEach(vid => {
    vid.muted = true;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        // Autoplay policy prevented playback, keep poster / gif visible
        console.warn('Autoplay prevented on video:', vid, err);
      });
    }
  });
});
