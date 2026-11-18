/* HarJET site script: menu, reveal, hero road animation */
(function () {
  document.documentElement.classList.remove('no-js');
  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

  // mobile menu
  var header = document.querySelector('.site-header');
  var btn = document.querySelector('.menu-btn');
  if (btn && header) {
    btn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    header.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', function () { header.classList.remove('open'); }); });
  }

  // reveal on scroll
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) { items.forEach(function (el) { el.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  // 影片上的大播放鈕：按了才開始播（影片檔也是這時候才下載）；播放中隱藏，暫停或播完再出現
  document.querySelectorAll('.sw-video').forEach(function (box) {
    var v = box.querySelector('video'); if (!v) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sw-play'; b.setAttribute('aria-label', '播放宣傳影片');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17L20.5 12z" fill="currentColor"/></svg>';
    b.addEventListener('click', function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); });
    v.addEventListener('play', function () { box.classList.add('playing'); });
    v.addEventListener('pause', function () { box.classList.remove('playing'); });
    v.addEventListener('ended', function () { box.classList.remove('playing'); });
    box.appendChild(b);
  });

  // media slider（可滑動的圖片＋影片）
  document.querySelectorAll('[data-slider]').forEach(function (root) {
    var track = root.querySelector('.sw-track'), dots = root.querySelector('.sw-dots');
    var prev = root.querySelector('.sw-prev'), next = root.querySelector('.sw-next');
    if (!track) return;
    var slides = [].slice.call(track.children), cur = 0;
    function go(i) { i = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' }); }
    function sync() {
      var i = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
      if (i !== cur) { var v = slides[cur].querySelector('video'); if (v && !v.paused) v.pause(); cur = i; }   // 滑走就暫停影片
      if (dots) [].forEach.call(dots.children, function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
      if (prev) prev.disabled = cur === 0; if (next) next.disabled = cur === slides.length - 1;
    }
    if (dots) slides.forEach(function (s, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', '第 ' + (i + 1) + ' 張，共 ' + slides.length + ' 張');
      b.addEventListener('click', function () { go(i); }); dots.appendChild(b);
    });
    if (prev) prev.addEventListener('click', function () { go(cur - 1); });
    if (next) next.addEventListener('click', function () { go(cur + 1); });
    var raf = 0; track.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; sync(); }); });
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });
    // 滑鼠拖曳（觸控螢幕用瀏覽器原本的滑動；影片上不拖，免得搶走播放列）
    var down = null;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('video')) return; down = { x: e.clientX, left: track.scrollLeft, moved: false }; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - down.x; if (!down.moved && Math.abs(dx) < 6) return; down.moved = true; track.classList.add('dragging'); track.scrollLeft = down.left - dx; });
    window.addEventListener('pointerup', function (e) {
      if (!down) return; var d = down; down = null; if (!d.moved) return;
      var dx = e.clientX - d.x, w = track.clientWidth, base = Math.round(d.left / w);
      track.classList.remove('dragging'); go(Math.abs(dx) > w * 0.12 ? base + (dx < 0 ? 1 : -1) : base);
    });
    window.addEventListener('resize', function () { track.scrollLeft = cur * track.clientWidth; });
    // 自動輪播：data-autoplay="秒數"，時間到換下一張，最後一張之後回到第一張。
    // 不換的時候：影片播放中、滑鼠停在上面、正在拖曳、剛操作過（先停 12 秒）、這一塊不在畫面內、分頁在背景、系統設定為減少動態效果。
    var sec = parseFloat(root.getAttribute('data-autoplay')) || 0, hold = 0, hover = false, seen = true;
    function playing() { var v = slides[cur].querySelector('video'); return !!v && !v.paused && !v.ended; }
    function wait(ms) { hold = Date.now() + ms; }
    if (sec > 0 && !reduce && slides.length > 1) {
      root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
      root.addEventListener('pointerleave', function () { hover = false; wait(sec * 1000); });
      ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) { root.addEventListener(ev, function () { wait(12000); }, { passive: true }); });
      root.querySelectorAll('video').forEach(function (v) {
        v.addEventListener('ended', function () { wait(1500); });          // 影片播完，稍等一下就換下一張
        v.addEventListener('pause', function () { if (!v.ended) wait(sec * 1000); });
      });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { seen = e[0].isIntersecting; if (seen) wait(sec * 1000); }, { threshold: 0.5 }).observe(root);
      wait(sec * 1000);
      setInterval(function () {
        if (document.hidden || !seen || hover || down || playing() || Date.now() < hold) return;
        wait(sec * 1000); go((cur + 1) % slides.length);
      }, 250);
    }
    sync();
  });

  // ---- hero: AI traffic vision ----
  var cv = document.getElementById('road');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, dpr = 1, VP = { x: 0, y: 0 }, roadL = 0, roadR = 0, lanes = 4;
  var cars = [], scan = { y: 0, t: 0 }, count = 0, last = 0, running = true;
  var SIG = '#5CC8E0', SIG_A = 'rgba(92,200,224,';
  var seed = 11; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  function resize() {
    var r = cv.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(320, Math.floor(r.width)); H = Math.max(320, Math.floor(r.height));
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var mobile = W < 860;
    VP = { x: mobile ? W * 0.55 : W * 0.66, y: H * (mobile ? 0.16 : 0.2) };
    roadL = mobile ? -W * 0.15 : W * 0.28; roadR = mobile ? W * 1.15 : W * 1.06;
  }
  function laneX(i, t) { // lane center i (0..lanes-1), t 0=far 1=near
    var bl = roadL + (roadR - roadL) * ((i + 0.5) / lanes);
    return VP.x + (bl - VP.x) * t;
  }
  function yAt(t) { return VP.y + (H - VP.y) * t; }
  function mkCar(init) {
    var lane = Math.floor(rnd() * lanes);
    var type = rnd() < 0.22 ? 'TRUCK' : (rnd() < 0.12 ? 'BUS' : 'CAR');
    return { lane: lane, t: init ? rnd() : 0, v: 0.05 + rnd() * 0.06, type: type,
      speed: type === 'CAR' ? 52 + Math.floor(rnd() * 40) : 38 + Math.floor(rnd() * 22),
      detT: 0.3 + rnd() * 0.25, plate: rnd() < 0.7, id: Math.floor(1000 + rnd() * 9000) };
  }
  function init() { cars = []; for (var i = 0; i < 14; i++) cars.push(mkCar(true)); }

  function drawRoad() {
    // ground grid fading to horizon
    ctx.save();
    ctx.strokeStyle = 'rgba(168,188,201,0.08)'; ctx.lineWidth = 1;
    for (var k = 0; k <= 14; k++) { var t = Math.pow(k / 14, 2.2); var y = yAt(t); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // road edges + lane lines
    for (var i = 0; i <= lanes; i++) {
      var bl = roadL + (roadR - roadL) * (i / lanes);
      var edge = (i === 0 || i === lanes);
      ctx.strokeStyle = edge ? 'rgba(168,188,201,0.55)' : 'rgba(168,188,201,0.28)';
      ctx.lineWidth = edge ? 1.5 : 1;
      if (edge) { ctx.setLineDash([]); } else { ctx.setLineDash([14, 18]); ctx.lineDashOffset = -((performance.now() / 12) % 32); }
      ctx.beginPath(); ctx.moveTo(VP.x, VP.y); ctx.lineTo(bl, H); ctx.stroke();
    }
    ctx.setLineDash([]);
    // horizon glow
    var g = ctx.createRadialGradient(VP.x, VP.y, 0, VP.x, VP.y, W * 0.5);
    g.addColorStop(0, 'rgba(92,200,224,0.22)'); g.addColorStop(1, 'rgba(92,200,224,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  function drawCar(c) {
    var t = c.t, x = laneX(c.lane, t), y = yAt(t);
    var s = 0.08 + t * t * 1.15;
    var w = (c.type === 'CAR' ? 46 : 62) * s, h = (c.type === 'CAR' ? 26 : 34) * s;
    ctx.save();
    // trail
    var tr = ctx.createLinearGradient(x, y - h * 3, x, y);
    tr.addColorStop(0, 'rgba(255,255,255,0)'); tr.addColorStop(1, 'rgba(255,255,255,0.10)');
    ctx.fillStyle = tr; ctx.fillRect(x - w * 0.42, y - h * 3, w * 0.84, h * 3);
    // body
    ctx.fillStyle = c.type === 'CAR' ? 'rgba(216,218,214,0.92)' : 'rgba(168,188,201,0.92)';
    rr(x - w / 2, y - h / 2, w, h, 3 * s); ctx.fill();
    // lights
    ctx.fillStyle = 'rgba(255,240,200,0.95)';
    ctx.fillRect(x - w / 2 + 2 * s, y + h / 2 - 4 * s, 8 * s, 3 * s); ctx.fillRect(x + w / 2 - 10 * s, y + h / 2 - 4 * s, 8 * s, 3 * s);
    // detection
    if (t > c.detT && t < 0.92) {
      var a = Math.min(1, (t - c.detT) / 0.06);
      var pad = 8 * s + 4, bx = x - w / 2 - pad, by = y - h / 2 - pad, bw = w + pad * 2, bh = h + pad * 2, L = Math.min(14, bw * 0.28);
      ctx.strokeStyle = SIG_A + (0.9 * a) + ')'; ctx.lineWidth = 1.5;
      corner(bx, by, L, 1, 1); corner(bx + bw, by, L, -1, 1); corner(bx, by + bh, L, 1, -1); corner(bx + bw, by + bh, L, -1, -1);
      if (s > 0.28) {
        ctx.font = '500 ' + Math.round(10 + 3 * Math.min(1, s)) + 'px "IBM Plex Mono", monospace';
        ctx.textBaseline = 'bottom';
        var label = c.type + ' · ' + c.speed + ' km/h';
        var tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(15,42,60,0.85)'; ctx.fillRect(bx, by - 20, tw + 12, 18);
        ctx.fillStyle = SIG_A + a + ')'; ctx.fillText(label, bx + 6, by - 4);
        if (c.plate && s > 0.5) {
          ctx.font = '400 10px "IBM Plex Mono", monospace'; ctx.textBaseline = 'top';
          ctx.fillStyle = SIG_A + (0.8 * a) + ')'; ctx.fillText('PLATE ✓  ID ' + c.id, bx, by + bh + 5);
        }
      }
    }
    ctx.restore();
  }
  function corner(x, y, L, sx, sy) { ctx.beginPath(); ctx.moveTo(x + L * sx, y); ctx.lineTo(x, y); ctx.lineTo(x, y + L * sy); ctx.stroke(); }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawHUD(now) {
    if (W < 860) return;
    ctx.save();
    ctx.font = '400 11px "IBM Plex Mono", monospace'; ctx.textBaseline = 'top';
    var x = W - 200, y = 24;
    ctx.fillStyle = 'rgba(15,42,60,0.55)'; ctx.fillRect(x - 12, y - 10, 190, 92);
    ctx.strokeStyle = 'rgba(92,200,224,0.35)'; ctx.strokeRect(x - 12 + .5, y - 10 + .5, 190, 92);
    ctx.fillStyle = SIG; ctx.fillText('● AI VISION · LIVE', x, y);
    ctx.fillStyle = 'rgba(216,218,214,0.85)';
    ctx.fillText('FLOW    ' + String(count).padStart(5, '0') + ' veh', x, y + 22);
    ctx.fillText('LANES   ' + lanes + '  ·  4K@60fps', x, y + 40);
    ctx.fillText('EDGE    7.2 eTOPS', x, y + 58);
    ctx.restore();
  }
  function drawScan() {
    if (scan.t <= 0) return;
    var y = scan.y;
    var g = ctx.createLinearGradient(0, y - 40, 0, y);
    g.addColorStop(0, 'rgba(92,200,224,0)'); g.addColorStop(1, 'rgba(92,200,224,0.18)');
    ctx.fillStyle = g; ctx.fillRect(0, y - 40, W, 40);
    ctx.fillStyle = 'rgba(92,200,224,0.6)'; ctx.fillRect(0, y, W, 1);
  }
  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    ctx.clearRect(0, 0, W, H);
    drawRoad();
    cars.sort(function (a, b) { return a.t - b.t; });
    for (var i = 0; i < cars.length; i++) {
      var c = cars[i]; c.t += c.v * dt * (0.35 + c.t * 1.4);
      if (c.t > 1.08) { count++; cars[i] = mkCar(false); continue; }
      drawCar(c);
    }
    // scan line every ~6s
    scan.t -= dt; if (scan.t <= 0 && rnd() < dt / 6) { scan.t = 1.6; scan.y = VP.y; }
    if (scan.t > 0) { scan.y += (H - VP.y) * dt / 1.6; drawScan(); }
    drawHUD(now);
    requestAnimationFrame(frame);
  }
  function staticFrame() { ctx.clearRect(0, 0, W, H); drawRoad(); cars.sort(function (a, b) { return a.t - b.t; }); cars.forEach(drawCar); drawHUD(0); }

  resize(); init();
  if (reduce) { staticFrame(); }
  else {
    requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(frame); } });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { var vis = e[0].isIntersecting; if (vis && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } if (!vis) running = false; }).observe(cv);
    }
  }
  var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(function () { resize(); if (reduce) staticFrame(); }, 120); });
})();
