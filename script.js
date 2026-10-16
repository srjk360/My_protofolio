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
  const send = $('#send');
  const status = $('#status');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const wait = (ms) => (reduce ? Promise.resolve() : sleep(ms));
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const say = (msg, type) => {
    status.textContent = msg;
    status.className = type ? `form__status is-${type}` : 'form__status';
  };

  /* Button state layers: sending, done, error (your own button content is left alone) */
  const layer = (name, html) => {
    const el = document.createElement('span');
    el.className = `btn__state btn__state--${name}`;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = html;
    send.append(el);
  };
  layer('sending', '<i class="spin"></i><span>Sending</span>');
  layer('done', '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path class="tick" d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>Sent</span>');
  layer('error', '<span>Try again</span>');
  const setState = (s) => { if (s) send.dataset.state = s; else delete send.dataset.state; };

  /* Field errors */
  const fields = $$('.field', form);
  const controlOf = (f) => f.querySelector('input, textarea');
  const clearInvalid = (f) => { f.classList.remove('is-invalid'); controlOf(f).removeAttribute('aria-invalid'); };
  fields.forEach((f) => {
    const control = controlOf(f);
    const msg = document.createElement('p');
    msg.className = 'field__error';
    msg.id = `${control.id}-error`;
    f.append(msg);
    control.setAttribute('aria-describedby', msg.id);
    control.addEventListener('input', () => clearInvalid(f));
  });
  const fieldOf = (n) => form.elements[n].closest('.field');
  const setInvalid = (n, text) => {
    const f = fieldOf(n);
    $('.field__error', f).textContent = text;
    f.classList.add('is-invalid');
    controlOf(f).setAttribute('aria-invalid', 'true');
    if (!reduce) {
      f.animate(
        [0, -8, 7, -5, 3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
        { duration: 420, easing: 'cubic-bezier(.36,.07,.19,.97)' }
      );
    }
  };
  const val = (n) => String(form.elements[n].value || '').trim();
  const check = () => {
    const out = [];
    if (!val('name')) out.push(['name', 'Enter your name.']);
    if (!val('email')) out.push(['email', 'Enter your email.']);
    else if (!/^\S+@\S+\.\S+$/.test(val('email'))) out.push(['email', 'Enter a valid email, like name@example.com.']);
    if (!val('message')) out.push(['message', 'Write a message.']);
    return out;
  };

  /* Thank-you card (lives inside the form, hidden until the message is sent) */
  const thanks = document.createElement('div');
  thanks.className = 'thanks';
  thanks.tabIndex = -1;
  thanks.innerHTML =
    '<svg class="thanks__mark" viewBox="0 0 52 52" aria-hidden="true"><circle class="thanks__ring" cx="26" cy="26" r="23"/><path class="thanks__tick" d="M15 27l8 8 14-16"/></svg>' +
    '<h3 class="thanks__title"></h3><p class="thanks__text"></p>' +
    '<button class="btn btn--ghost" type="button">Send another message</button>';
  form.append(thanks);

  const showThanks = async (name, email) => {
    $('.thanks__title', thanks).textContent = `Thanks, ${name.split(/\s+/)[0]}!`;
    const text = $('.thanks__text', thanks);
    const who = document.createElement('strong');
    who.textContent = email;
    text.textContent = "Message sent. I'll reply to ";
    text.append(who, ' soon.');
    form.classList.add('is-leaving');
    await wait(380);
    form.classList.add('is-done');
    form.classList.remove('is-leaving');
    await frame();
    thanks.classList.add('is-in');
    thanks.focus({ preventScroll: true });
  };

  $('button', thanks).addEventListener('click', async () => {
    thanks.classList.remove('is-in');
    await wait(300);
    form.classList.add('is-entering');
    form.classList.remove('is-done');
    form.reset();
    fields.forEach(clearInvalid);
    setState('');
    say('', '');
    await frame();
    form.classList.remove('is-entering');
    form.elements['name'].focus({ preventScroll: true });
  });

  let busy = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    fields.forEach(clearInvalid);
    const problems = check();
    if (problems.length) {
      problems.forEach(([n, t]) => setInvalid(n, t));
      form.elements[problems[0][0]].focus();
      return;
    }

    busy = true;
    const name = val('name');
    const email = val('email');
    form.style.minHeight = `${form.offsetHeight}px`;
    form.classList.add('is-sending');
    send.setAttribute('aria-busy', 'true');
    say('', '');
    setState('sending');

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const [res] = await Promise.all([
        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: ctrl.signal,
        }).finally(() => clearTimeout(timer)),
        wait(700),
      ]);
      if (!res.ok) throw new Error('Request failed');
      setState('done');
      await wait(800);
      await showThanks(name, email);
    } catch (err) {
      setState('error');
      say("It didn't send. Check your connection and try again.", 'error');
      await wait(2600);
      setState('');
    } finally {
      busy = false;
      send.removeAttribute('aria-busy');
      form.classList.remove('is-sending');
    }
  });
})();
