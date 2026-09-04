// Global Trustfunds - cohesive app behaviours
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    // ---------- Splashscreen hide ----------
    function hideSplash() {
      var s = document.getElementById('splash');
      if (s && !s.classList.contains('hide')) s.classList.add('hide');
    }
    window.addEventListener('load', hideSplash);
    setTimeout(hideSplash, 3500); // fallback so the splash never blocks

    // ---------- Sticky nav ----------
    var nav = document.getElementById('nav');
    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll);
    onScroll();

    // ---------- Mobile nav ----------
    var navToggle = document.getElementById('navToggle');
    if (navToggle) {
      navToggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.querySelectorAll('.nav__links a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // ---------- Auth state / nav ----------
    var sessionUser = null;
    try { sessionUser = JSON.parse(localStorage.getItem('gt_session') || 'null'); } catch (e) {}
    if (sessionUser && sessionUser.email) {
      document.body.classList.add('logged-in');
      var loginBtn = document.getElementById('navLogin');
      if (loginBtn) {
        var email = document.createElement('span');
        email.className = 'user-email';
        email.textContent = sessionUser.email;
        loginBtn.appendChild(email);
        loginBtn.href = 'dashboard.html';
      }
      var signupBtn = document.getElementById('navSignup');
      if (signupBtn) { signupBtn.textContent = 'Dashboard'; signupBtn.href = 'dashboard.html'; }
    }

    // ---------- Animated counters ----------
    var counters = document.querySelectorAll('.stat__num');
    if (counters.length) {
      function animateCounter(el) {
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var duration = 1800;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = prefix + target.toLocaleString() + suffix;
        }
        requestAnimationFrame(step);
      }
      var done = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !done) { done = true; counters.forEach(animateCounter); io.disconnect(); }
        });
      }, { threshold: 0.4 });
      io.observe(counters[0]);
    }

    // ---------- Reveal on scroll ----------
    var revealEls = document.querySelectorAll('.feature, .prop, .tcard, .how__step, .about__content, .about__media, .stat, .section__head, .form, .contact__item, .calc__card, .team__card');
    if (revealEls.length && 'IntersectionObserver' in window) {
      revealEls.forEach(function (el) { el.classList.add('reveal'); });
      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); revealIO.unobserve(entry.target); }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { revealIO.observe(el); });
    }

    // ---------- FAQ accordion ----------
    var faqItems = document.querySelectorAll('.faq__item');
    faqItems.forEach(function (item) {
      var q = item.querySelector('.faq__q');
      var a = item.querySelector('.faq__a');
      if (!q) return;
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        faqItems.forEach(function (other) {
          other.classList.remove('open');
          other.querySelector('.faq__a').style.maxHeight = null;
          other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
          q.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // ---------- Property catalog rendering ----------
    function renderProperties(containerId, list) {
      if (!window.PROPERTIES || !window.propertyCard) return;
      var el = document.getElementById(containerId);
      if (!el) return;
      var props = list || window.PROPERTIES;
      el.innerHTML = props.map(window.propertyCard).join('');
    }
    renderProperties('homeProperties', window.PROPERTIES ? window.PROPERTIES.slice(0, 3) : null);
    renderProperties('allProperties');

    // ---------- Properties page filters ----------
    var filterInputs = document.querySelectorAll('[data-filter]');
    var allPropsEl = document.getElementById('allProperties');
    var emptyState = document.getElementById('emptyState');
    if (filterInputs.length && allPropsEl && window.PROPERTIES) {
      function applyFilter() {
        var type = (document.getElementById('filterType') || {}).value || 'all';
        var maxTerm = parseInt((document.getElementById('filterTerm') || {}).value || '60', 10);
        var list = window.PROPERTIES.filter(function (p) {
          var termNum = parseInt(p.term, 10);
          return (type === 'all' || p.type === type) && termNum <= maxTerm;
        });
        if (allPropsEl) allPropsEl.innerHTML = list.map(window.propertyCard).join('');
        if (emptyState) emptyState.style.display = list.length ? 'none' : 'block';
        var count = document.getElementById('filterCount');
        if (count) count.textContent = list.length;
      }
      filterInputs.forEach(function (el) { el.addEventListener('change', applyFilter); });
    }

    // ---------- Returns calculator ----------
    var amountEl = document.getElementById('calcAmount');
    var yearsEl = document.getElementById('calcYears');
    var apyEl = document.getElementById('calcApy');
    if (amountEl && yearsEl && apyEl) {
      function fmt(n) {
        return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      }
      function compute() {
        var p = Math.max(parseFloat(amountEl.value) || 100, 0);
        var years = parseInt(yearsEl.value, 10);
        var r = parseFloat(apyEl.value) / 100;
        var future = p * Math.pow(1 + r, years);
        var gain = future - p;
        document.getElementById('calcResult').textContent = fmt(future);
        document.getElementById('calcReturn').textContent = fmt(gain);
        var pct = r > 0 ? Math.round((gain / p) * 100) : 0;
        var sub = document.querySelector('#calcReturn');
        if (sub) sub.textContent = fmt(gain) + ' (' + pct + '%)';
        var yearsLabel = document.getElementById('calcYearsLabel');
        if (yearsLabel) yearsLabel.textContent = years + (years > 1 ? ' years' : ' year');
      }
      amountEl.addEventListener('input', compute);
      yearsEl.addEventListener('input', compute);
      apyEl.addEventListener('change', compute);
      compute();
    }

    // ---------- Newsletter ----------
    var newsletter = document.getElementById('newsletterForm');
    if (newsletter) {
      var msg = document.getElementById('newsletterMsg');
      newsletter.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = newsletter.querySelector('input[type=email]').value.trim();
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          msg.textContent = 'Please enter a valid email address.';
          msg.className = 'form-msg error';
          return;
        }
        var subs = JSON.parse(localStorage.getItem('gt_newsletter') || '[]');
        if (subs.indexOf(email) < 0) { subs.push(email); localStorage.setItem('gt_newsletter', JSON.stringify(subs)); }
        newsletter.querySelector('input[type=email]').value = '';
        msg.textContent = '✓ Subscribed! You will hear from us soon.';
        msg.className = 'form-msg success';
      });
    }

    // ---------- Contact form ----------
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
      var cMsg = document.getElementById('contactMsg');
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = contactForm.qs ? '' : (contactForm.querySelector('[name=name]') || {}).value || '';
        var email = (contactForm.querySelector('[name=email]') || {}).value || '';
        var subject = (contactForm.querySelector('[name=subject]') || {}).value || '';
        var message = (contactForm.querySelector('[name=message]') || {}).value || '';
        if (!name || !email || !message) {
          cMsg.textContent = 'Please fill in the required fields.';
          cMsg.className = 'form-msg error';
          return;
        }
        var items = JSON.parse(localStorage.getItem('gt_messages') || '[]');
        items.push({ name: name, email: email, subject: subject, message: message, date: new Date().toISOString() });
        localStorage.setItem('gt_messages', JSON.stringify(items));
        contactForm.reset();
        cMsg.textContent = '✓ Thank you, ' + name + '. Your message has been received. We will reply within 24 hours.';
        cMsg.className = 'form-msg success';
      });
    }

    // ---------- Signup form ----------
    var signupForm = document.getElementById('signupForm');
    if (signupForm) {
      // investment pre-selection notice
      var params = new URLSearchParams(window.location.search);
      var investId = params.get('invest');
      if (investId && window.PROPERTIES) {
        var selProp = window.PROPERTIES.filter(function (p) { return p.id === investId; })[0];
        var notice = document.getElementById('investNotice');
        if (notice && selProp) {
          notice.style.display = 'block';
          notice.textContent = 'You are starting an application to invest in ' + selProp.name + '.';
        }
      }
      var sMsg = document.getElementById('signupMsg');
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = (signupForm.querySelector('[name=name]') || {}).value || '';
        var email = (signupForm.querySelector('[name=email]') || {}).value || '';
        var pass = (signupForm.querySelector('[name=password]') || {}).value || '';
        if (!name || !email || pass.length < 6) {
          sMsg.textContent = 'Complete all fields. Password must be at least 6 characters.';
          sMsg.className = 'form-msg error';
          return;
        }
        var users = JSON.parse(localStorage.getItem('gt_users') || '[]');
        if (users.some(function (u) { return u.email === email; })) {
          sMsg.textContent = 'An account with this email already exists. Please log in.';
          sMsg.className = 'form-msg error';
          return;
        }
        users.push({ name: name, email: email, pass: pass, created: new Date().toISOString() });
        localStorage.setItem('gt_users', JSON.stringify(users));
        localStorage.setItem('gt_session', JSON.stringify({ name: name, email: email }));
        window.location.href = 'dashboard.html';
      });
    }

    // ---------- Login form ----------
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      var lMsg = document.getElementById('loginMsg');
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = (loginForm.querySelector('[name=email]') || {}).value || '';
        var pass = (loginForm.querySelector('[name=password]') || {}).value || '';
        var users = JSON.parse(localStorage.getItem('gt_users') || '[]');
        var user = users.filter(function (u) { return u.email === email; })[0];
        if (user && user.pass === pass) {
          localStorage.setItem('gt_session', JSON.stringify({ name: user.name, email: user.email }));
          window.location.href = 'dashboard.html';
        } else {
          lMsg.textContent = 'Invalid email or password. Please try again.';
          lMsg.className = 'form-msg error';
        }
      });
    }

    // ---------- Logout ----------
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('gt_session');
        window.location.href = 'index.html';
      });
    }

    // ---------- Dashboard chart ----------
    var dashChart = document.getElementById('dashboardChart');
    if (dashChart) {
      var dd = [18, 22, 21, 27, 26, 33, 37, 42, 48, 55, 63, 72, 80, 90];
      function buildChart(el, series, id) {
        var w = 800, h = 240, pad = 14;
        var min = Math.min.apply(null, series), max = Math.max.apply(null, series);
        var stepX = (w - pad * 2) / (series.length - 1);
        function yy(v) { return h - pad - ((v - min) / (max - min)) * (h - pad * 2); }
        var pts = series.map(function (v, i) { return (pad + i * stepX) + ',' + yy(v); }).join(' ');
        var area = pad + ',' + (h - pad) + ' ' + pts + ' ' + (w - pad) + ',' + (h - pad);
        var NS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Portfolio growth over time');
        svg.style.width = '100%'; svg.style.height = '100%'; svg.style.display = 'block';
        var grad = document.createElementNS(NS, 'linearGradient'); grad.setAttribute('id', id);
        grad.setAttribute('x1','0'); grad.setAttribute('y1','0'); grad.setAttribute('x2','0'); grad.setAttribute('y2','1');
        var s1 = document.createElementNS(NS,'stop'); s1.setAttribute('offset','0'); s1.setAttribute('stop-color','#c9a24b'); s1.setAttribute('stop-opacity','.4');
        var s2 = document.createElementNS(NS,'stop'); s2.setAttribute('offset','1'); s2.setAttribute('stop-color','#c9a24b'); s2.setAttribute('stop-opacity','0');
        grad.appendChild(s1); grad.appendChild(s2); svg.appendChild(grad);
        var g = document.createElementNS(NS,'g');
        var aEl = document.createElementNS(NS,'polygon'); aEl.setAttribute('points', area); aEl.setAttribute('fill','url(#'+id+')'); g.appendChild(aEl);
        // grid lines
        for (var i = 1; i < 5; i++) {
          var gy = (h / 5) * i;
          var gl = document.createElementNS(NS,'line');
          gl.setAttribute('x1', pad); gl.setAttribute('y1', gy); gl.setAttribute('x2', w - pad); gl.setAttribute('y2', gy);
          gl.setAttribute('stroke', 'rgba(0,0,0,.06)'); gl.setAttribute('stroke-width','1');
          g.appendChild(gl);
        }
        var line = document.createElementNS(NS,'polyline');
        line.setAttribute('points', pts); line.setAttribute('fill','none'); line.setAttribute('stroke','#c9a24b'); line.setAttribute('stroke-width','2.5');
        line.setAttribute('stroke-linejoin','round'); line.setAttribute('stroke-linecap','round');
        g.appendChild(line);
        svg.appendChild(g); el.appendChild(svg);
      }
      buildChart(dashChart, dd, 'dashGrad');
    }

    // ---------- Dashboard population ----------
    var dashName = document.getElementById('dashName');
    if (dashName) {
      var s = null;
      try { s = JSON.parse(localStorage.getItem('gt_session') || 'null'); } catch (e) {}
      if (!s) { window.location.href = 'login.html'; return; }
      dashName.textContent = (s.name || 'Investor').split(' ')[0];
      var dashEmail = document.getElementById('dashEmail');
      if (dashEmail) dashEmail.textContent = s.email;
      var dashAvatar = document.getElementById('dashAvatar');
      if (dashAvatar) dashAvatar.textContent = (s.name || 'I').charAt(0).toUpperCase();
    }

  });
})();
