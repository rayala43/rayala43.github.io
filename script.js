// ─── DNA Canvas Animation ───
(function() {
  const canvas = document.getElementById('dna-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], helices = [];
  const ACCENT = '#00d2a0';
  const ACCENT_DIM = 'rgba(0,210,160,0.25)';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Floating particles
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,210,160,${this.alpha})`;
      ctx.fill();
    }
  }

  // DNA Helix strands
  class DNAHelix {
    constructor(x) {
      this.x = x;
      this.speed = 0.4 + Math.random() * 0.3;
      this.offset = Math.random() * Math.PI * 2;
      this.amplitude = 30 + Math.random() * 20;
      this.spacing = 18;
      this.rungs = 22;
    }
    draw(t) {
      const totalH = this.rungs * this.spacing;
      const startY = -totalH + ((t * this.speed * 60) % (H + totalH * 2)) - totalH;

      for (let i = 0; i < this.rungs; i++) {
        const y = startY + i * this.spacing;
        if (y < -this.spacing || y > H + this.spacing) continue;
        const wave = Math.sin((i / this.rungs) * Math.PI * 4 + this.offset + t * this.speed);
        const x1 = this.x + wave * this.amplitude;
        const x2 = this.x - wave * this.amplitude;

        // Rung connecting line
        const alpha = 0.08 + 0.1 * Math.abs(wave);
        ctx.strokeStyle = `rgba(0,210,160,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Strand dots
        const dotAlpha = 0.15 + 0.25 * Math.abs(wave);
        const dotR = 2 + Math.abs(wave) * 1.5;
        ctx.beginPath();
        ctx.arc(x1, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,210,160,${dotAlpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x2, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,209,${dotAlpha * 0.7})`;
        ctx.fill();
      }

      // Strand curves
      ctx.beginPath();
      for (let i = 0; i < this.rungs; i++) {
        const y = startY + i * this.spacing;
        const wave = Math.sin((i / this.rungs) * Math.PI * 4 + this.offset + t * this.speed);
        const x = this.x + wave * this.amplitude;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(0,210,160,0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 60 }, () => new Particle());
    // Place DNA helices along right side and scattered
    helices = [
      new DNAHelix(W * 0.82),
      new DNAHelix(W * 0.92),
      new DNAHelix(W * 0.05),
    ];
  }

  let then = 0;
  function animate(now) {
    requestAnimationFrame(animate);
    const t = now * 0.001;
    ctx.clearRect(0, 0, W, H);

    // Draw particles
    particles.forEach(p => { p.update(); p.draw(); });

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,210,160,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw DNA helices
    helices.forEach(h => h.draw(t));
  }

  window.addEventListener('resize', () => {
    resize();
    helices[0].x = W * 0.82;
    helices[1].x = W * 0.92;
    helices[2].x = W * 0.05;
  });

  init();
  requestAnimationFrame(animate);
})();

// ─── Nav scroll ───
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ─── Scroll reveal ───
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, 80 * (entry.target.dataset.index || 0));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  el.dataset.index = i % 4;
  revealObserver.observe(el);
});

// ─── Mobile menu ───
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMobile() {
  mobileMenu.classList.remove('open');
}

// ─── Smooth active nav highlight ───
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));
