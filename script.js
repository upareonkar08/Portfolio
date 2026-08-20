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
    // 1. Instantly display cached count or baseline count
    const cachedCount = localStorage.getItem('upareonkar_visit_count') || '128';
    visitCountEls.forEach(el => el.textContent = parseInt(cachedCount, 10).toLocaleString());

    // 2. Fetch fresh count from CounterAPI
    const hasVisitedSession = sessionStorage.getItem('visited_upareonkar');
    const apiEndpoint = hasVisitedSession 
      ? 'https://api.counterapi.dev/v1/upareonkar-portfolio/visits' 
      : 'https://api.counterapi.dev/v1/upareonkar-portfolio/visits/up';

    fetch(apiEndpoint)
      .then(res => {
        if (!res.ok) throw new Error('Network response error');
        return res.json();
      })
      .then(data => {
        if (data && typeof data.count === 'number' && data.count > 0) {
          const finalCount = data.count;
          visitCountEls.forEach(el => el.textContent = finalCount.toLocaleString());
          localStorage.setItem('upareonkar_visit_count', finalCount.toString());
          sessionStorage.setItem('visited_upareonkar', 'true');
        }
      })
      .catch(err => {
        // Silently preserve cached numeric count without showing 100+
        console.warn('Visitor counter using cached count:', err);
      });
  }

  /* --- GitHub Profile README Modal & Copy (Optional) --- */
  const readmeModal = document.getElementById('readmeModal');
  const openBtn = document.getElementById('openReadmeModalBtn');
  const closeBtn = document.getElementById('closeReadmeModalBtn');
  const copyBtn = document.getElementById('copyReadmeBtn');
  const readmeTextarea = document.getElementById('readmeTextarea');

  if (readmeModal && openBtn) {
    openBtn.addEventListener('click', () => {
      readmeModal.classList.add('active');
      readmeModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (readmeTextarea && !readmeTextarea.value) {
        fetch('README.md')
          .then(res => res.text())
          .then(text => { readmeTextarea.value = text; })
          .catch(() => { readmeTextarea.value = 'Failed to load README.md.'; });
      }
    });

    const closeModal = () => {
      readmeModal.classList.remove('active');
      readmeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    readmeModal.addEventListener('click', (e) => {
      if (e.target === readmeModal) closeModal();
    });

    if (copyBtn && readmeTextarea) {
      copyBtn.addEventListener('click', () => {
        readmeTextarea.select();
        navigator.clipboard.writeText(readmeTextarea.value)
          .then(() => {
            const orig = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { copyBtn.innerHTML = orig; }, 2500);
          })
          .catch(err => { console.error('Copy failed:', err); });
      });
    }
  }

  /* --- Floating Ask Me Chatbot Widget --- */
  const chatWidget = document.getElementById('chatWidget');
  const chatLauncher = document.getElementById('chatLauncher');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const chatSuggestions = document.getElementById('chatSuggestions');

  if (chatLauncher && chatWidget) {
    const toggleChat = () => {
      chatWidget.classList.toggle('active');
      if (chatWidget.classList.contains('active')) {
        chatInput?.focus();
      }
    };

    chatLauncher.addEventListener('click', toggleChat);
    chatCloseBtn?.addEventListener('click', toggleChat);

    const appendMessage = (text, sender = 'bot') => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg chat-msg--${sender}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      msgDiv.innerHTML = `<p>${text}</p><span class="chat-time">${timeStr}</span>`;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const botKnowledge = {
      'projects': "I've built 3 major full-stack AI platforms: 📈 <strong>StockSense</strong> (Portfolio Analytics), 🤖 <strong>AutoResearch Agent</strong> (Multi-Agent RAG), and 🎼 <strong>Orchestra AI</strong> (Multi-Agent Flow System)!",
      'education': "I'm pursuing my <strong>B.Tech in AI & ML</strong> at SRM Institute of Science & Technology, Trichy (2024–2028) with an <strong>8.63 CGPA</strong> & Merit Scholarship!",
      'certifications': "I hold 8 professional certifications including the <strong>Google Cloud Generative AI Leader</strong>, <strong>Google AI Essentials</strong>, AWS Cloud, IBM AI, and Duke University Java!",
      'internships': "Yes! 💼 I am actively seeking <strong>AI/ML & Full-Stack Software Engineering internships</strong>. Feel free to send me a message here or email me at <code>upareonkar30@gmail.com</code>!"
    };

    const handleQuickPrompt = (qText) => {
      appendMessage(qText, 'user');
      const qLower = qText.toLowerCase();

      setTimeout(() => {
        if (qLower.includes('project')) {
          appendMessage(botKnowledge.projects, 'bot');
        } else if (qLower.includes('education') || qLower.includes('cgpa')) {
          appendMessage(botKnowledge.education, 'bot');
        } else if (qLower.includes('certif')) {
          appendMessage(botKnowledge.certifications, 'bot');
        } else if (qLower.includes('intern') || qLower.includes('open')) {
          appendMessage(botKnowledge.internships, 'bot');
        } else {
          appendMessage("Thanks for asking! I've logged your question. Feel free to drop a note directly at <code>upareonkar30@gmail.com</code>!", 'bot');
        }
      }, 400);
    };

    // Quick suggestion chip clicks
    chatSuggestions?.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const qText = chip.getAttribute('data-question');
        if (qText) handleQuickPrompt(qText);
      });
    });

    let lastQuestion = '';

    // Custom user question submission
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const userQ = chatInput.value.trim();
      if (!userQ) return;

      appendMessage(userQ, 'user');
      chatInput.value = '';

      // Check if user entered an email address to get a reply
      if (userQ.includes('@') && userQ.includes('.')) {
        fetch('https://formsubmit.co/ajax/upareonkar30@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: 'Portfolio Visitor Reply Email',
            email: userQ,
            subject: `Reply Email for Question: ${lastQuestion ? lastQuestion.substring(0, 40) : 'Portfolio Inquiry'}`,
            message: `Visitor Email: ${userQ}\nOriginal Question: ${lastQuestion || 'N/A'}`
          })
        }).catch(err => console.warn(err));

        setTimeout(() => {
          appendMessage(`✅ <strong>Saved!</strong> Onkar will reply to <code>${userQ}</code> as soon as he's online!`, 'bot');
        }, 400);
        return;
      }

      lastQuestion = userQ;

      // Check if quick match
      const qLower = userQ.toLowerCase();
      let matchedAns = null;
      if (qLower.includes('project')) matchedAns = botKnowledge.projects;
      else if (qLower.includes('education') || qLower.includes('cgpa') || qLower.includes('srm')) matchedAns = botKnowledge.education;
      else if (qLower.includes('certif') || qLower.includes('google') || qLower.includes('aws')) matchedAns = botKnowledge.certifications;
      else if (qLower.includes('intern') || qLower.includes('hire') || qLower.includes('job')) matchedAns = botKnowledge.internships;

      // Dispatch to FormSubmit API in background so Onkar gets question in inbox
      fetch('https://formsubmit.co/ajax/upareonkar30@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: 'Portfolio Visitor (Ask Me Chatbot)',
          email: 'visitor@portfolio.chat',
          subject: 'New Question from Portfolio Chatbot Widget',
          message: userQ
        })
      }).catch(err => console.warn('Chatbot email dispatch error:', err));

      setTimeout(() => {
        if (matchedAns) {
          appendMessage(matchedAns, 'bot');
        }
        appendMessage("📩 <strong>Question delivered to Onkar!</strong> To get a reply directly to your inbox, type your email address below:", 'bot');
      }, 500);
    });
  }

});

