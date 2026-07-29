/* ============================================================
   ONKAR PORTFOLIO — Interactions (Clean, no gimmicks)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Navbar scroll --- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Mobile menu --- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }

  /* --- Smooth scrolling --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* --- Active nav link on scroll --- */
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav-link');

  const highlightNav = () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* --- Scroll reveal --- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const parent = entry.target.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll('.reveal')) : [];
        const index = siblings.indexOf(entry.target);
        const delay = index >= 0 ? index * 80 : 0;

        setTimeout(() => {
          entry.target.classList.add('active');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* --- Stat counter animation --- */
  let statsAnimated = false;
  const statNums = document.querySelectorAll('.stat-num[data-target]');

  const animateCounters = () => {
    if (statsAnimated || statNums.length === 0) return;
    statsAnimated = true;

    statNums.forEach(num => {
      const target = parseInt(num.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const eased = 1 - Math.pow(1 - progress, 4);
        num.textContent = Math.round(target * eased);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          num.textContent = target;
        }
      };
      requestAnimationFrame(tick);
    });
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const aboutSection = document.getElementById('about');
  if (aboutSection) statsObserver.observe(aboutSection);

  /* --- Contact form validation --- */
  const form = document.getElementById('contactForm');
  if (form) {
    const fields = {
      name:    { el: document.getElementById('name'),    err: document.getElementById('nameError'),    min: 2,  msg: 'Please enter your name.' },
      email:   { el: document.getElementById('email'),   err: document.getElementById('emailError'),   min: 0,  msg: 'Please enter a valid email.' },
      subject: { el: document.getElementById('subject'), err: document.getElementById('subjectError'), min: 2,  msg: 'Please enter a subject.' },
      message: { el: document.getElementById('message'), err: document.getElementById('messageError'), min: 10, msg: 'Message must be at least 10 characters.' },
    };

    // Clear errors on focus
    Object.values(fields).forEach(f => {
      if (f.el) {
        f.el.addEventListener('focus', () => {
          f.el.classList.remove('error');
          if (f.err) f.err.textContent = '';
        });
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      // Validate each field
      Object.entries(fields).forEach(([key, f]) => {
        if (!f.el) return;
        const val = f.el.value.trim();
        let isValid = true;

        if (key === 'email') {
          isValid = emailRegex.test(val);
        } else {
          isValid = val.length >= f.min;
        }

        if (!isValid) {
          valid = false;
          f.el.classList.add('error');
          if (f.err) f.err.textContent = f.msg;
        }
      });

      if (!valid) return;

      // Actually send via FormSubmit.co
      const btnText = document.querySelector('.btn-text');
      const btnLoading = document.querySelector('.btn-loading');
      const formSuccess = document.getElementById('formSuccess');

      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'inline-flex';

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: fields.name.el.value.trim(),
          email: fields.email.el.value.trim(),
          subject: fields.subject.el.value.trim(),
          message: fields.message.el.value.trim(),
          _subject: 'New message from your portfolio!'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (btnLoading) btnLoading.style.display = 'none';
        if (btnText) btnText.style.display = 'inline-flex';

        if (data.success) {
          if (formSuccess) formSuccess.style.display = 'block';
          form.reset();
          setTimeout(() => { if (formSuccess) formSuccess.style.display = 'none'; }, 5000);
        } else {
          alert('Something went wrong. Please email me directly at upareonkar30@gmail.com');
        }
      })
      .catch(() => {
        if (btnLoading) btnLoading.style.display = 'none';
        if (btnText) btnText.style.display = 'inline-flex';
        alert('Could not send message. Please email me directly at upareonkar30@gmail.com');
      });
    });
  }

  /* --- Visitor Counter --- */
  const visitCountEls = document.querySelectorAll('.visitCount, #visitCount');
  if (visitCountEls.length > 0) {
    const hasVisited = sessionStorage.getItem('visited_upareonkar');
    const apiEndpoint = hasVisited 
      ? 'https://api.counterapi.dev/v1/upareonkar-portfolio/visits' 
      : 'https://api.counterapi.dev/v1/upareonkar-portfolio/visits/up';

    fetch(apiEndpoint)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.count === 'number') {
          const countFormatted = data.count.toLocaleString();
          visitCountEls.forEach(el => el.textContent = countFormatted);
          sessionStorage.setItem('visited_upareonkar', 'true');
        } else {
          visitCountEls.forEach(el => el.textContent = '100+');
        }
      })
      .catch(() => {
        visitCountEls.forEach(el => el.textContent = '100+');
      });
  }

});
