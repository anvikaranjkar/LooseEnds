(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const screen = $('#screen');
  const states = {
    off: $('#state-off'),
    bios: $('#state-bios'),
    boot: $('#state-boot'),
    desktop: $('#state-desktop'),
  };
  const powerLed = $('#powerLed');
  const biosText = $('#biosText');
  const stressFill = $('#stressFill');
  const toastStack = $('#toastStack');
  const hiddenTrigger = $('#hiddenTrigger');
  const reveal = $('#reveal');
  const restartBtn = $('#restartBtn');

  let stress = 4;
  let windowsOpened = 0;
  let revealed = false;

  powerLed.classList.add('on');
  stressFill.style.width = stress + '%';

  // ---------- tiny audio (no external files needed) ----------
  let actx;
  function beep(freq = 440, dur = 0.08, type = 'square', vol = 0.05) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g).connect(actx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.stop(actx.currentTime + dur + 0.02);
    } catch (e) { /* audio not available, silently ignore */ }
  }

  function setState(name) {
    Object.values(states).forEach(s => s.classList.remove('active'));
    states[name].classList.add('active');
  }

  function flicker() {
    screen.classList.remove('flicker');
    void screen.offsetWidth;
    screen.classList.add('flicker');
  }
  function shake() {
    screen.classList.remove('shake');
    void screen.offsetWidth;
    screen.classList.add('shake');
  }

  // ---------- BOOT SEQUENCE ----------
  const biosLines = [
    'CITIZEN-PC BIOS v4.51PG',
    'CPU: Generic x86  Speed: 1.8GHz',
    'Memory Test: 524288K OK',
    '',
    'Detecting IDE Drives...',
    '  Primary Master  : ST3160811AS',
    '  Primary Slave   : None',
    '',
    'Auto-Detecting USB Mass Storage Devices...',
    '  00 : None',
    '',
    'Loose object detected in tray. Ignoring.',
    'Press DEL to enter SETUP, ESC to skip memories',
    '',
    'Booting from Primary Master...',
  ];

  function typeBios(i) {
    if (i >= biosLines.length) {
      setTimeout(() => {
        setState('boot');
        beep(660, 0.1, 'square', 0.03);
        setTimeout(() => {
          setState('desktop');
          flicker();
          beep(880, 0.15, 'sine', 0.04);
        }, 1900);
      }, 500);
      return;
    }
    biosText.textContent += biosLines[i] + '\n';
    screen.querySelector('.state-bios').scrollTop = 9999;
    setTimeout(() => typeBios(i + 1), 90 + Math.random() * 70);
  }

  // ---------- STRESS SYSTEM ----------
  function bumpStress(amount) {
    stress = Math.min(100, stress + amount);
    stressFill.style.width = stress + '%';
    if (stress > 55) shake();
    if (stress >= 40 && hiddenTrigger.hasAttribute('hidden')) {
      hiddenTrigger.removeAttribute('hidden');
    }
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastStack.appendChild(t);
    setTimeout(() => t.remove(), 5200);
  }

  const nagMessages = [
    'Verify your identity to continue.',
    'Your session will expire in 2 minutes.',
    'Payment method declined.',
    'New email: "Re: Re: Re: Account Access"',
    'Please hold. Your call is important to us.',
    'CAPTCHA failed. Try again.',
  ];
  let nagTimer = null;
  function startNagging() {
    if (nagTimer) return;
    nagTimer = setInterval(() => {
      if (revealed) return;
      toast(nagMessages[Math.floor(Math.random() * nagMessages.length)]);
    }, 6000);
  }

  // ---------- WINDOW MANAGEMENT ----------
  function openWindow(name) {
    const win = $(`.win[data-window="${name}"]`);
    if (!win) return;
    const wasHidden = win.hasAttribute('hidden');
    win.removeAttribute('hidden');
    // slight cascade so repeated opens don't stack exactly
    const offset = (windowsOpened % 5) * 14;
    win.style.marginTop = offset + 'px';
    if (wasHidden) {
      windowsOpened++;
      bumpStress(6 + Math.random() * 5);
      beep(320, 0.05, 'square', 0.03);
      startNagging();
    }
  }
  function closeWindow(win) {
    win.setAttribute('hidden', '');
  }

  $$('.d-icon').forEach(btn => {
    btn.addEventListener('click', () => openWindow(btn.dataset.win));
  });

  document.addEventListener('click', (e) => {
    if (e.target.matches('.wclose')) {
      closeWindow(e.target.closest('.win'));
    }
  });

  // locked file jokes
  const lockedJokes = [
    'Access denied. Do you know John\u2019s mother\u2019s maiden name?',
    'This file is protected. Answer 3 security questions to continue.',
    'Password required. Hint: it is probably the dog\u2019s name. Which dog?',
    'Locked. Please provide a certified copy, in person, during business hours.',
  ];
  $$('.file-row').forEach((row, i) => {
    row.addEventListener('click', () => {
      bumpStress(8);
      toast(lockedJokes[i % lockedJokes.length]);
      shake();
    });
  });

  // netflix profile click joke
  const netflixImg = $('#netflixImg');
  if (netflixImg) {
    netflixImg.addEventListener('click', () => {
      bumpStress(7);
      toast('Payment method expired. Update billing to keep watching.');
    });
  }

  // ---------- HIDDEN REVEAL TRIGGER ----------
  hiddenTrigger.addEventListener('click', () => {
    if (revealed) return;
    revealed = true;
    if (nagTimer) clearInterval(nagTimer);
    beep(523, 0.2, 'sine', 0.05);
    setTimeout(() => beep(659, 0.2, 'sine', 0.05), 180);
    setTimeout(() => beep(784, 0.35, 'sine', 0.06), 360);

    // drain stress visually
    const drain = setInterval(() => {
      stress = Math.max(0, stress - 4);
      stressFill.style.width = stress + '%';
      if (stress <= 0) clearInterval(drain);
    }, 60);

    // close all open windows for a calm desktop moment
    $$('.win').forEach(w => w.setAttribute('hidden', ''));
    toastStack.innerHTML = '';

    setTimeout(() => {
      reveal.removeAttribute('hidden');
    }, 1400);
  });

  restartBtn.addEventListener('click', () => window.location.reload());

  // subtle idle flicker every so often for atmosphere
  setInterval(() => {
    if (states.desktop.classList.contains('active') && Math.random() < 0.15) flicker();
  }, 7000);
})();
