(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Split headings into words for the mask reveal ---------- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(/\s+/).forEach((word, i) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.className = 'w__i';
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      outer.append(inner);
      el.append(outer, ' ');
    });
  });

  /* ---------- Split hero name into letters ---------- */
  const nameEl = $('#heroName');
  const nameText = nameEl.textContent.trim();
  nameEl.setAttribute('aria-label', nameText);
  nameEl.textContent = '';
  [...nameText].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch === ' ' ? '\u00A0' : ch;
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i);
    nameEl.append(s);
  });

  /* ---------- Reveal the hero ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));

  /* ---------- Hero spotlight follows the pointer ---------- */
  const hero = $('#hero');
  let spotFrame = 0;
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || spotFrame) return;
    const cx = e.clientX, cy = e.clientY;
    spotFrame = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${cx - r.left}px`);
      hero.style.setProperty('--my', `${cy - r.top}px`);
      spotFrame = 0;
    });
  });

  /* ---------- Typing line ---------- */
  const typedEl = $('#typed');
  const phrases = [
    'mobile apps with Flutter',
    'embedded systems in C',
    'full-stack web apps',
    'projects in Python',
  ];
  if (!reduce) {
    let pi = 0, ci = phrases[0].length, deleting = true;
    const type = () => {
      const phrase = phrases[pi];
      if (deleting) {
        ci--;
        if (ci <= 0) { deleting = false; pi = (pi + 1) % phrases.length; }
      } else {
        ci++;
        if (ci >= phrases[pi].length) { deleting = true; typedEl.textContent = phrases[pi]; return setTimeout(type, 1800); }
      }
      typedEl.textContent = (deleting ? phrase : phrases[pi]).slice(0, ci);
      setTimeout(type, deleting ? 28 : 55);
    };
    setTimeout(type, 2800);
  }

  /* ---------- Marquee: duplicate items for a seamless loop ---------- */
  $$('.marquee__track').forEach((track) => {
    [...track.children].forEach((item) => {
      const copy = item.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.append(copy);
    });
  });

  /* ---------- Pause marquees while off screen (saves battery, avoids lag) ---------- */
  const marqueeWatch = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      $('.marquee__track', e.target).style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
    });
  });
  $$('.marquee').forEach((m) => marqueeWatch.observe(m));

  /* ---------- Scroll reveals ---------- */
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        reveal.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  $$('[data-split], [data-reveal], .timeline li').forEach((el) => reveal.observe(el));

  /* ---------- Number counters ---------- */
  const counters = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      counters.unobserve(e.target);
      const el = e.target;
      const end = Number(el.dataset.count);
      if (reduce) { el.textContent = end; return; }
      const t0 = performance.now();
      const run = (now) => {
        const p = Math.min(1, (now - t0) / 1400);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => counters.observe(el));

  /* ---------- Scroll progress, nav state, timeline line ---------- */
  const progress = $('#progress');
  const nav = $('#nav');
  const timeline = $('.timeline');
  let ticking = false;
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav.classList.toggle('is-scrolled', scrollY > 40);
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
      timeline.style.setProperty('--p', p.toFixed(3));
    }
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Highlight the current section in the nav ---------- */
  const links = $$('.nav__menu a');
  const sections = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => sections.observe(s));

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle');
  const menu = $('#menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  links.forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Contact form (Formspree) ---------- */
  const form = $('#form');
  const status = $('#status');
  const send = $('#send');
  const label = $('.btn__label', send);
  const say = (msg, type) => {
    status.textContent = msg;
    status.className = `form__status is-${type}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (!name || !email || !message) return say('Fill in your name, email and message.', 'error');
    if (!/^\S+@\S+\.\S+$/.test(email)) return say('Enter a valid email address, like name@example.com.', 'error');
    if (form.action.includes('YOUR_FORM_ID')) {
      return say('Sending is not set up yet. Add your Formspree form ID to the form in index.html.', 'error');
    }

    send.disabled = true;
    label.textContent = 'Sending...';
    say('', 'ok');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      say('Message sent. I will reply to your email soon.', 'ok');
      label.textContent = 'Sent';
      setTimeout(() => { label.textContent = 'Send message'; }, 3000);
    } catch (err) {
      say('The message did not send. Check your connection and try again, or email me directly.', 'error');
      label.textContent = 'Send message';
    } finally {
      send.disabled = false;
    }
  });
})();
