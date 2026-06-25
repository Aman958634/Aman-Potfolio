import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const animateHeroSection = (heroRef) => {
  if (!heroRef) return;

  const introItems = heroRef.querySelectorAll('.hero-content > *');
  if (introItems?.length) {
    gsap.from(introItems, {
      duration: 0.8,
      opacity: 0,
      y: 30,
      stagger: 0.2,
      ease: 'back.out',
    });
  }

  const heroImage = heroRef.querySelector('.hero-image');
  if (heroImage) {
    gsap.from(heroImage, {
      duration: 1,
      opacity: 0,
      scale: 0.8,
      ease: 'back.out',
    });
  }
};

export const animateScrollTrigger = (element, options = {}) => {
  if (!element) return;

  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      end: 'top 20%',
      toggleActions: 'play none none reverse',
      ...options.scrollTrigger,
    },
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
    ...options,
  });
};

export const animateProgressBar = (element, percentage) => {
  if (!element) return;

  gsap.to(element, {
    width: `${percentage}%`,
    duration: 1.5,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: element.parentElement,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });
};

export const animateCard = (card) => {
  if (!card) return;

  gsap.from(card, {
    opacity: 0,
    y: 30,
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
    duration: 0.6,
  });

  // Hover animation
  card.addEventListener('mouseenter', () => {
    gsap.to(card, {
      y: -10,
      boxShadow: '0 20px 40px rgba(0, 240, 255, 0.3)',
      duration: 0.3,
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      y: 0,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
      duration: 0.3,
    });
  });
};

export const magneticButton = (button) => {
  if (!button) return;

  button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.3,
    });
  });

  button.addEventListener('mouseleave', () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.3,
    });
  });
};

export const parallaxEffect = (element, speed = 1) => {
  if (!element) return;

  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      onUpdate: (self) => {
        gsap.set(element, {
          y: self.getVelocity() * speed * 0.1,
        });
      },
    },
  });
};

export const textReveal = (element) => {
  if (!element) return;

  gsap.from(element, {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.05,
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });
};

export const customCursor = () => {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid #00f0ff;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    display: none;
  `;
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX - 10,
      y: e.clientY - 10,
      duration: 0.1,
    });
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.display = 'block';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
  });

  // Change cursor on hover
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .interactive')) {
      gsap.to(cursor, { scale: 1.5, duration: 0.2 });
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .interactive')) {
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    }
  });
};
