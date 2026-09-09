const APP = {
  page: document.body.dataset.page || 'home',
  init() {
    Progress.applyTheme();
    this.renderShell();
    this.bind();
    this.updateThemeIcon(document.body.classList.contains('dark'));
    this.route();
  },
  base() {
    return this.page === 'home' ? '' : '../';
  },
  url(path) {
    return this.base() + path;
  },
  escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  },
  nav() {
    const b = this.base();
    return [
      { href: `${b}index.html`, label: 'Beranda', icon: 'fa-house', key: 'home' },
      { href: `${b}index.html#dashboard`, label: 'Dashboard', icon: 'fa-chart-line', key: 'dashboard' },
      { href: `${b}index.html#roadmap`, label: 'Roadmap 30 Hari', icon: 'fa-road', key: 'roadmap' },
      { href: `${b}pages/materi.html`, label: 'Materi', icon: 'fa-book-open', key: 'materi' },
      { href: `${b}pages/quiz.html`, label: 'Quiz', icon: 'fa-circle-question', key: 'quiz' },
      { href: `${b}pages/flashcard.html`, label: 'Flash Card', icon: 'fa-layer-group', key: 'flashcard' },
      { href: `${b}pages/praktik.html`, label: 'Praktik Falak', icon: 'fa-compass', key: 'praktik' },
      { href: 'https://hilal.bmkg.go.id/', label: 'BMKG Hilal', icon: 'fa-moon', key: 'external', external: true },
      { href: 'https://stellarium-web.org/', label: 'Stellarium', icon: 'fa-star', key: 'external', external: true },
      { href: `${b}index.html#video`, label: 'Video Pembelajaran', icon: 'fa-play', key: 'video' },
      { href: `${b}index.html#glosarium`, label: 'Glosarium', icon: 'fa-spell-check', key: 'glosarium' },
      { href: `${b}pages/tentang.html`, label: 'Tentang Modul', icon: 'fa-circle-info', key: 'tentang' }
    ];
  },
  renderShell() {
    const links = this.nav();
    const stats = Progress.stats();
    document.querySelector('#app').innerHTML = `
      <div class="app-shell">
        <aside class="sidebar" id="sidebar" aria-label="Navigasi utama">
          <div class="brand">
            <div class="brand-mark"><i class="fa-solid fa-moon" aria-hidden="true"></i></div>
            <div><h1>FALAK INTERACTIVE</h1><small>Modul Ajar Interaktif Ilmu Falak</small></div>
          </div>
          <div class="nav-label">Navigasi utama</div>
          <nav class="nav-list">
            ${links.map(link => `<a class="nav-link ${link.key === this.page ? 'active' : ''}" href="${link.href}" ${link.external ? 'target="_blank" rel="noopener noreferrer"' : ''}${link.key === this.page ? ' aria-current="page"' : ''}><i class="fa-solid ${link.icon}" aria-hidden="true"></i><span>${link.label}</span></a>`).join('')}
          </nav>
          <div class="sidebar-footer">Untuk mahasiswa Fakultas Syariah dan Hukum, khususnya Hukum Keluarga.</div>
        </aside>
        <main class="main">
          <header class="topbar">
            <button class="icon-btn mobile-menu" aria-label="Buka atau tutup menu" aria-controls="sidebar" data-action="menu"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
            <div class="search" style="max-width:520px;flex:1"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input id="global-search" aria-label="Cari materi" placeholder="Cari Azimuth, Hilal, Rukyat, Zuhur, Ka'bah..."></div>
            <div class="topbar-actions">
              <button class="icon-btn" aria-label="Ganti tema" data-action="theme"><i class="fa-solid fa-moon" aria-hidden="true"></i></button>
              <a class="pill-btn" href="${this.url(`pages/materi.html?day=${stats.last}`)}"><i class="fa-solid fa-play" aria-hidden="true"></i> Lanjutkan</a>
            </div>
          </header>
          <div id="view"></div>
          ${this.footer()}
        </main>
      </div>`;
    this.syncSearch();
  },
  footer() {
    const b = this.base();
    return `<footer class="footer">
      <div class="footer-grid">
        <div><h4>FALAK INTERACTIVE</h4><p style="font-size:12px;margin:0">Modul Ajar Interaktif Ilmu Falak untuk mahasiswa Fakultas Syariah dan Hukum.</p></div>
        <div><h4>Belajar</h4><a href="${b}pages/materi.html">Materi</a><a href="${b}pages/quiz.html">Quiz</a><a href="${b}pages/flashcard.html">Flash Card</a><a href="${b}pages/praktik.html">Praktik</a></div>
        <div><h4>Sumber</h4><a href="https://hilal.bmkg.go.id/" target="_blank" rel="noopener noreferrer">BMKG Hilal</a><a href="https://stellarium-web.org/" target="_blank" rel="noopener noreferrer">Stellarium Web</a><a href="https://kemenag.go.id/" target="_blank" rel="noopener noreferrer">Kementerian Agama</a><a href="https://science.nasa.gov/solar-system/moon/" target="_blank" rel="noopener noreferrer">NASA</a></div>
      </div>
      <div class="footer-note">Website ini merupakan media pembelajaran dan bukan pengganti keputusan resmi otoritas keagamaan.</div>
    </footer>`;
  },
  bind() {
    document.addEventListener('click', event => {
      const el = event.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      if (action === 'menu') {
        document.querySelector('#sidebar')?.classList.toggle('open');
      } else if (action === 'theme') {
        this.updateThemeIcon(Progress.toggleTheme());
      } else if (action === 'open-day') {
        this.openDay(Number(el.dataset.day));
      } else if (action === 'next-day') {
        this.openDay(Number(el.dataset.day) + 1);
      } else if (action === 'prev-day') {
        this.openDay(Number(el.dataset.day) - 1);
      } else if (action === 'complete-day') {
        const days = Progress.completeDay(Number(el.dataset.day));
        this.toast(`Hari ${el.dataset.day} ditandai selesai. Progress ${days.length}/30.`);
        this.route();
      } else if (action === 'daily-challenge') {
        const result = Gamification.markChallengeDone();
        this.toast(result.awarded ? `Tantangan selesai! +${result.awarded} XP.` : 'Tantangan hari ini sudah selesai.');
        this.route();
      } else if (action === 'scroll-top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'quiz-answer') {
        Quiz.answer(Number(el.dataset.index));
      } else if (action === 'quiz-next') {
        Quiz.next();
      } else if (action === 'quiz-restart') {
        Quiz.start(Quiz.state?.mode || 'daily', Quiz.state?.questions?.length || 3);
      } else if (action === 'quiz-start') {
        this.startQuiz(el.dataset.mode);
      } else if (action === 'flash-prev') {
        Flashcards.move(-1);
      } else if (action === 'flash-next') {
        Flashcards.move(1);
      } else if (action === 'flash-shuffle') {
        Flashcards.shuffle();
      } else if (action === 'flash-flip') {
        Flashcards.flip();
      } else if (action === 'mini-answer') {
        Quiz.miniAnswer(Number(el.dataset.day), Number(el.dataset.question), Number(el.dataset.index));
      }
    });
    document.addEventListener('input', event => {
      if (event.target.id === 'global-search') this.doSearch(event.target.value);
    });
  },
  startQuiz(mode) {
    const query = new URLSearchParams(location.search);
    if (mode === 'weekly') {
      const day = Number(query.get('day') || Progress.stats().last || 1);
      location.href = `${this.url('pages/quiz.html')}?mode=weekly&week=${Math.ceil(day / 7)}`;
      return;
    }
    if (mode === 'daily') {
      const day = Number(query.get('day') || Progress.stats().last || 1);
      location.href = `${this.url('pages/quiz.html')}?mode=daily&day=${day}`;
      return;
    }
    Quiz.start(mode, mode === 'final' ? 40 : 20);
  },
  updateThemeIcon(isDark) {
    const icon = document.querySelector('[data-action="theme"] i');
    if (icon) icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  },
  route() {
    if (this.page === 'home') this.home();
    else if (this.page === 'materi') this.materials();
    else if (this.page === 'quiz') this.quizPage();
    else if (this.page === 'flashcard') this.flashPage();
    else if (this.page === 'praktik') this.practicePage();
    else this.aboutPage();
  },
  home() {
    const stats = Progress.stats();
    const last = materials.find(item => item.day === stats.last) || materials[0];
    document.querySelector('#view').innerHTML = `
      <section class="hero">
        <div class="stars"></div>
        <div class="hero-content">
          <span class="eyebrow"><i class="fa-solid fa-star-and-crescent" aria-hidden="true"></i> Islamic Astronomy + Modern Education</span>
          <h2>FALAK INTERACTIVE</h2>
          <p>Belajar Ilmu Falak dengan cara yang lebih visual, praktis, dan interaktif.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="pages/materi.html?day=${stats.last}"><i class="fa-solid fa-play" aria-hidden="true"></i> Mulai Belajar</a>
            <a class="btn btn-secondary" href="#roadmap"><i class="fa-solid fa-map" aria-hidden="true"></i> Jelajahi Materi</a>
            <a class="btn btn-secondary" href="pages/quiz.html"><i class="fa-solid fa-circle-question" aria-hidden="true"></i> Mulai Quiz</a>
            <a class="btn btn-secondary" href="pages/flashcard.html"><i class="fa-solid fa-layer-group" aria-hidden="true"></i> Flash Card</a>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true"><div class="orbit o1"></div><div class="orbit o2"></div><div class="moon"></div><div class="sun-dot"></div><div class="kaaba-dot"></div></div>
      </section>
      <section class="section"><div class="grid grid-4">
        <div class="card stat-card"><div class="stat-icon"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i></div><div><div class="stat-value">30</div><div class="stat-label">Hari Pembelajaran</div></div></div>
        <div class="card stat-card"><div class="stat-icon"><i class="fa-solid fa-layer-group" aria-hidden="true"></i></div><div><div class="stat-value">4</div><div class="stat-label">Minggu Materi</div></div></div>
        <div class="card stat-card"><div class="stat-icon"><i class="fa-solid fa-circle-question" aria-hidden="true"></i></div><div><div class="stat-value">${quizBank.length}</div><div class="stat-label">Soal Interaktif</div></div></div>
        <div class="card stat-card"><div class="stat-icon"><i class="fa-solid fa-clone" aria-hidden="true"></i></div><div><div class="stat-value">${flashcards.length}</div><div class="stat-label">Flash Card</div></div></div>
      </div></section>
      <section class="section"><div class="card"><div class="section-head"><div><h3>Untuk Siapa Modul Ini?</h3><p>Dirancang dengan konteks belajar mahasiswa.</p></div></div><p>Mahasiswa Fakultas Syariah dan Hukum, khususnya mahasiswa Hukum Keluarga yang ingin memahami hubungan antara astronomi, Ilmu Falak, fikih, dan praktik penentuan waktu serta arah ibadah.</p></div></section>
      <section class="section" id="dashboard"><div class="section-head"><div><h3>Dashboard Mahasiswa</h3><p>Progress tersimpan lokal di browser tanpa akun atau database.</p></div><a class="btn btn-outline" href="pages/materi.html?day=${stats.last}">Lanjutkan Belajar</a></div>
        <div class="grid grid-3">
          <div class="card"><div class="section-head"><div><h4>Progress Belajar</h4><p>${stats.completed} dari 30 hari selesai</p></div><strong class="progress-num">${stats.pct}%</strong></div><div class="progress" aria-label="Progress belajar ${stats.pct}%"><span style="width:${stats.pct}%"></span></div></div>
          <div class="card"><h4>Hari Terakhir</h4><p>Hari ${stats.last}: ${this.escapeHtml(last.title)}</p><a class="btn btn-outline" style="margin-top:10px" href="pages/materi.html?day=${stats.last}">Buka Materi</a></div>
          <div class="card"><h4>Performa Quiz</h4><p>Best score: <strong>${stats.best}/100</strong>. ${stats.attempts} jenis quiz pernah diselesaikan.</p><a class="btn btn-outline" style="margin-top:10px" href="pages/quiz.html">Kerjakan Quiz</a></div>
        </div>
      </section>
      <section class="section"><div class="section-head"><div><h3>Level & Tantangan</h3><p>Belajar konsisten, kumpulkan XP, dan buka badge.</p></div></div>${Gamification.renderDashboardCard()}</section>
      <section class="section"><div class="section-head"><div><h3>Observatorium Interaktif</h3><p>Eksplorasi orbit, fase Bulan, horizon, azimuth, dan altitude.</p></div></div>${this.interactiveLabHtml()}</section>
      <section class="section" id="roadmap"><div class="section-head"><div><h3>Roadmap 30 Hari</h3><p>Belajar bertahap dari fondasi astronomi sampai analisis hilal.</p></div></div><div class="roadmap">${this.roadmapHtml()}</div></section>
      <section class="section" id="video"><div class="section-head"><div><h3>Video Pembelajaran</h3><p>Setiap hari memiliki sumber video atau pencarian topik YouTube yang relevan.</p></div></div><div class="grid grid-3">${videos.slice(0, 6).map(v => this.videoCard(v)).join('')}</div></section>
      <section class="section" id="glosarium"><div class="section-head"><div><h3>Glosarium</h3><p>${glossary.length} istilah inti Ilmu Falak dan Astronomi Islam.</p></div><a class="btn btn-outline" href="pages/tentang.html#glosarium">Lihat Glosarium</a></div><div class="grid grid-4">${glossary.slice(0, 8).map(g => `<div class="card"><h4>${this.escapeHtml(g.term)}</h4><p>${this.escapeHtml(g.definition)}</p></div>`).join('')}</div></section>`;
    this.bindVisualLab();
  },
  interactiveLabHtml() {
    return `<div class="interactive-lab">
      <div class="space-card card"><div class="lab-title"><span class="chip">Orbit</span><strong>Bumi × Bulan × Matahari</strong></div><div class="orbit-stage" aria-label="Animasi orbit Bumi dan Bulan"><div class="orbit-path orbit-path-a"></div><div class="orbit-path orbit-path-b"></div><div class="sun-core"></div><div class="earth-orbit"><div class="earth-core"><span class="earth-glow"></span></div><div class="moon-orbit"><div class="moon-core"></div></div></div></div></div>
      <div class="card"><div class="lab-title"><span class="chip">Fase Bulan</span><strong id="phase-label">Waxing Crescent</strong></div><div class="phase-stage"><div class="phase-moon" id="phase-moon"></div></div><input id="phase-slider" class="range" type="range" min="0" max="7" step="1" value="1" aria-label="Pilih fase Bulan"><div class="phase-scale"><span>New</span><span>Quarter</span><span>Full</span><span>Last</span></div></div>
      <div class="card"><div class="lab-title"><span class="chip">Mini Planetarium</span><strong>Sky Compass</strong></div><div class="planetarium"><div class="planet-stars"></div><div class="planet-grid"><span class="p-n">N</span><span class="p-e">E</span><span class="p-s">S</span><span class="p-w">W</span><i class="planet-dot" id="planet-dot"></i></div></div><input id="planet-az" class="range" type="range" min="0" max="359" value="45" aria-label="Azimuth mini planetarium"><div class="mini-output" id="planet-output">Azimuth 45° · Timur Laut</div></div>
      <div class="card"><div class="lab-title"><span class="chip">Horizon</span><strong>Altitude Explorer</strong></div><div class="horizon-stage"><div class="horizon-line"></div><div class="horizon-object" id="horizon-object"></div><span class="hz-label hz-zenith">Zenith 90°</span><span class="hz-label hz-horizon">Horizon 0°</span></div><input id="horizon-alt" class="range" type="range" min="-10" max="90" value="35" aria-label="Altitude explorer"><div class="mini-output" id="horizon-output">Altitude 35° · 35° di atas horizon</div></div>
      <div class="card"><div class="lab-title"><span class="chip">Interactive Compass</span><strong>Azimuth Navigator</strong></div><div class="mini-compass"><div class="mini-needle" id="mini-needle"></div><b>N</b><span>E</span><span>S</span><span>W</span></div><input id="compass-az" class="range" type="range" min="0" max="359" value="0" aria-label="Kompas azimuth"><div class="mini-output" id="compass-output">0° · Utara</div></div>
    </div>`;
  },
  roadmapHtml() {
    let day = 1;
    return roadMap.map((week, index) => `<div class="week"><div class="week-head"><div><span class="chip">MINGGU ${index + 1}</span><h4 style="margin-top:5px">${this.escapeHtml(week[0])}</h4></div><span class="chip">${week[1].length} hari</span></div><div class="day-list">${week[1].map(item => { const current = day; const done = Progress.isDayComplete(current); day += 1; return `<a class="day-item ${done ? 'completed' : ''}" href="pages/materi.html?day=${current}" aria-label="Hari ${current}: ${this.escapeHtml(item[0])}"><div class="day-num">${done ? '✓' : current}</div><div class="day-copy"><strong>${this.escapeHtml(item[0])}</strong><span>${this.escapeHtml(item[1])}</span></div></a>`; }).join('')}</div></div>`).join('');
  },
  materials() {
    const params = new URLSearchParams(location.search);
    const query = params.get('search')?.trim() || '';
    let selected = Number(params.get('day') || Progress.stats().last || 1);
    if (!Number.isInteger(selected) || selected < 1 || selected > 30) selected = 1;
    Progress.setLastDay(selected);

    if (query) {
      const needle = query.toLowerCase();
      const found = materials.filter(item => `${item.title} ${item.intro} ${item.explain.join(' ')}`.toLowerCase().includes(needle));
      document.querySelector('#view').innerHTML = `<div class="page-hero"><span class="eyebrow">Pencarian Materi</span><h2>Hasil untuk “${this.escapeHtml(query)}”</h2><p>${found.length} materi ditemukan.</p></div><div class="grid grid-3">${found.map(item => `<a class="card" href="${this.url('pages/materi.html')}?day=${item.day}"><span class="chip">Hari ${item.day}</span><h4 style="margin-top:8px">${this.escapeHtml(item.title)}</h4><p>${this.escapeHtml(item.intro)}</p></a>`).join('') || '<div class="card">Tidak ditemukan. Coba istilah lain.</div>'}</div>`;
      return;
    }

    const current = materials.find(item => item.day === selected) || materials[0];
    const mini = Quiz.miniQuestions(current.day);
    const sourceLinks = [
      ['BMKG Hilal dan Gerhana', 'https://hilal.bmkg.go.id/'],
      ['Stellarium Web', 'https://stellarium-web.org/'],
      ['Kementerian Agama RI', 'https://kemenag.go.id/'],
      ['NASA Moon', 'https://science.nasa.gov/solar-system/moon/']
    ];
    document.querySelector('#view').innerHTML = `<div class="page-hero"><span class="eyebrow">Roadmap 30 Hari</span><h2>Hari ${current.day}: ${this.escapeHtml(current.title)}</h2><p>${this.escapeHtml(current.week)}</p></div>
      <div class="material-layout">
        <aside class="card toc" aria-label="Daftar materi 30 hari"><strong style="display:block;padding:7px 10px">Daftar Hari</strong>${materials.map(item => `<button type="button" class="${item.day === current.day ? 'active' : ''}" ${item.day === current.day ? 'aria-current="true"' : ''} data-action="open-day" data-day="${item.day}">Hari ${item.day} · ${this.escapeHtml(item.title)}</button>`).join('')}</aside>
        <article class="card lesson">
          <div class="section-head"><div><div class="chips"><span class="chip">Hari ${current.day} / 30</span><span class="chip">${Progress.isDayComplete(current.day) ? 'Selesai' : 'Belum selesai'}</span></div><h3 style="margin-top:12px">${this.escapeHtml(current.title)}</h3><p>${this.escapeHtml(current.week)}</p></div></div>
          <h4>Tujuan Pembelajaran</h4><ul>${current.objective.map(x => `<li>${this.escapeHtml(x)}</li>`).join('')}</ul>
          <h4>Pengantar</h4><p>${this.escapeHtml(current.intro)}</p>
          <h4>Penjelasan Materi</h4>${current.explain.map(x => `<p>${this.escapeHtml(x)}</p>`).join('')}
          <h4>Poin Penting</h4><div class="grid grid-3">${current.points.map((x, index) => `<div class="card"><h4 style="margin-top:0">${String(index + 1).padStart(2, '0')}</h4><p>${this.escapeHtml(x)}</p></div>`).join('')}</div>
          <h4>Contoh</h4><div class="callout">${this.escapeHtml(current.example)}</div>
          ${current.formula ? `<h4>Rumus</h4><div class="formula">${this.escapeHtml(current.formula)}${current.variables ? `<small>${this.escapeHtml(current.variables)}</small>` : ''}</div>` : ''}
          ${current.calculation ? `<h4>Contoh Perhitungan</h4><div class="callout">${this.escapeHtml(current.calculation)}</div>` : ''}
          <h4>Praktik</h4><p>${this.escapeHtml(current.practice)}</p>
          <h4>Refleksi</h4><div class="callout">${this.escapeHtml(current.reflection)}</div>
          <h4>Kesimpulan</h4><p>${this.escapeHtml(current.summary)}</p>
          <h4>Video Pembelajaran</h4>${this.videoCard(current.video)}
          <h4>Sumber Bacaan</h4><div class="chips">${sourceLinks.map(([label, href]) => `<a class="chip" href="${href}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(label)}</a>`).join('')}</div>
          <section class="section"><h4>Quiz Mini Hari ${current.day}</h4><div class="grid">${mini.map((q, index) => `<div class="card mini-quiz" data-mini-root="${current.day}"><strong>${index + 1}. ${this.escapeHtml(q.q.replace(/^Hari \d+: /, ''))}</strong><div class="answers" data-mini-question="${index}" style="margin-top:10px">${q.options.map((opt, optIndex) => `<button type="button" class="answer" data-action="mini-answer" data-day="${current.day}" data-question="${index}" data-index="${optIndex}"><span class="answer-letter">${'ABCD'[optIndex]}</span><span>${this.escapeHtml(opt)}</span></button>`).join('')}</div><div data-mini-feedback="${index}" class="feedback" style="display:none"></div></div>`).join('')}</div></section>
          <div class="lesson-nav"><div>${current.day > 1 ? `<button type="button" class="btn btn-outline" data-action="prev-day" data-day="${current.day}"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Materi Sebelumnya</button>` : ''}</div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button type="button" class="btn btn-primary" data-action="complete-day" data-day="${current.day}">${Progress.isDayComplete(current.day) ? '✓ Sudah Selesai' : '✓ Tandai Selesai'}</button>${current.day < 30 ? `<button type="button" class="btn btn-outline" data-action="next-day" data-day="${current.day}">Materi Berikutnya <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>` : ''}</div></div>
        </article>
      </div>`;
  },
  videoCard(video) {
    const isSearch = video.url.includes('/results?search_query=');
    const label = isSearch ? 'Cari di YouTube' : 'Watch on YouTube';
    return `<div class="video-card"><div class="video-thumb" aria-hidden="true"><i class="fa-brands fa-youtube"></i></div><div class="video-meta"><span class="chip">Hari ${video.day}</span><strong>${this.escapeHtml(video.title)}</strong><p>${this.escapeHtml(video.channel)}</p><p>${this.escapeHtml(video.description)}</p><a class="btn btn-outline" style="margin-top:6px" target="_blank" rel="noopener noreferrer" href="${video.url}"><i class="fa-brands fa-youtube" aria-hidden="true"></i> ${label}</a></div></div>`;
  },
  openDay(day) {
    const safe = Math.max(1, Math.min(30, Number(day) || 1));
    Progress.setLastDay(safe);
    location.href = `${this.url('pages/materi.html')}?day=${safe}`;
  },
  quizPage() {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode') || 'daily';
    document.querySelector('#view').innerHTML = `<div class="page-hero"><span class="eyebrow">Evaluasi</span><h2>Quiz Ilmu Falak</h2><p>Mode harian, mingguan, acak, dan ujian akhir dengan review jawaban.</p></div>
      <div class="grid grid-4" style="margin-bottom:15px">
        <button type="button" class="card" data-action="quiz-start" data-mode="daily" style="text-align:left;border:none"><h4>Quiz Harian</h4><p>3 soal sesuai hari materi.</p></button>
        <button type="button" class="card" data-action="quiz-start" data-mode="weekly" style="text-align:left;border:none"><h4>Quiz Mingguan</h4><p>15 soal berdasarkan minggu.</p></button>
        <button type="button" class="card" data-action="quiz-start" data-mode="random" style="text-align:left;border:none"><h4>Quiz Acak</h4><p>20 soal dari seluruh bank.</p></button>
        <button type="button" class="card" data-action="quiz-start" data-mode="final" style="text-align:left;border:none"><h4>Ujian Akhir</h4><p>40 soal komprehensif.</p></button>
      </div><div class="card quiz-box" id="quiz-root"></div>`;
    document.querySelectorAll('[data-action="quiz-start"]').forEach(button => {
      button.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.startQuiz(button.dataset.mode);
        }
      });
    });
    if (mode === 'daily') {
      const day = Number(params.get('day') || Progress.stats().last || 1);
      Quiz.start('daily', day === 7 ? 10 : 3);
    }
    else if (mode === 'weekly') Quiz.start('weekly', 15);
    else if (mode === 'final') Quiz.start('final', 40);
    else if (mode === 'random') Quiz.start('random', 20);
  },
  flashPage() {
    document.querySelector('#view').innerHTML = `<div class="page-hero"><span class="eyebrow">Active Recall</span><h2>Flash Card Ilmu Falak</h2><p>Latih ingatan istilah dengan kartu interaktif. Progress tersimpan otomatis.</p></div><div id="flash-root"></div>`;
    Flashcards.init();
  },
  practicePage() {
    document.querySelector('#view').innerHTML = `<div class="page-hero"><span class="eyebrow">Laboratorium Mini</span><h2>Praktik Ilmu Falak</h2><p>Simulator sederhana untuk menghubungkan teori dengan data dan observasi.</p></div>
      <section class="section"><div class="tool-grid">
        <div class="tool-card"><h4>Azimuth</h4><p>Arah dari Utara searah jarum jam.</p><div class="field" style="margin-top:9px"><label for="az-input">Azimuth (°)</label><input id="az-input" type="number" min="0" max="360" step="0.1" value="45"></div><div id="az-result" class="result">45° = Timur Laut</div></div>
        <div class="tool-card"><h4>Altitude</h4><p>Jarak sudut dari horizon.</p><div class="field" style="margin-top:9px"><label for="alt-input">Altitude (°)</label><input id="alt-input" type="number" min="-90" max="90" step="0.1" value="30"></div><div id="alt-result" class="result">30° di atas horizon.</div></div>
        <div class="tool-card"><h4>Konversi Waktu</h4><p>UTC menuju zona waktu Indonesia.</p><div class="field" style="margin-top:9px"><label for="utc-time">UTC</label><input id="utc-time" type="time" value="12:00"></div><div id="time-result" class="result">WIB 19:00 · WITA 20:00 · WIT 21:00</div></div>
        <div class="tool-card"><h4>Lag</h4><p>Moonset setelah sunset.</p><div class="input-grid"><div class="field"><label for="sunset">Sunset</label><input id="sunset" type="time" value="18:00"></div><div class="field"><label for="moonset">Moonset</label><input id="moonset" type="time" value="18:45"></div></div><div id="lag-result" class="result">45 menit</div></div>
      </div></section>
      <section class="section"><div class="grid grid-2">
        <div class="card"><h3>Arah Kiblat</h3><p>Masukkan koordinat dalam derajat desimal.</p><div class="input-grid" style="margin-top:12px">
          <div class="field"><label for="q-lat">Lintang Lokasi</label><input id="q-lat" type="number" step="0.000001" placeholder="-6.917464"></div>
          <div class="field"><label for="q-lon">Bujur Lokasi</label><input id="q-lon" type="number" step="0.000001" placeholder="107.619123"></div>
          <div class="field"><label for="k-lat">Lintang Ka'bah</label><input id="k-lat" type="number" step="0.000001" value="21.422487"></div>
          <div class="field"><label for="k-lon">Bujur Ka'bah</label><input id="k-lon" type="number" step="0.000001" value="39.826206"></div>
        </div><button type="button" class="btn btn-primary" id="qibla-btn" style="margin-top:12px">HITUNG ARAH KIBLAT</button><div id="qibla-result" class="result" aria-live="polite">Hasil akan muncul di sini.</div></div>
        <div class="card"><h3>Kompas Azimuth</h3><div style="display:grid;place-items:center"><div class="compass" role="img" aria-label="Kompas azimuth interaktif"><span class="compass-label n">N</span><span class="compass-label e">E</span><span class="compass-label s">S</span><span class="compass-label w">W</span><div class="compass-needle" id="compass-needle"></div><div class="compass-center"></div></div></div><p style="margin-top:10px">Visualisasi kompas ini digunakan untuk memahami arah, bukan kalibrasi lapangan.</p></div>
      </div></section>
      <section class="section"><div class="card"><div class="section-head"><div><h3>Tabel Observasi</h3><p>Simpan catatan latihan di localStorage.</p></div><button type="button" class="btn btn-primary" id="obs-save">Tambah Data</button></div><div class="input-grid">
        <div class="field"><label for="obs-date">Tanggal</label><input id="obs-date" type="date"></div><div class="field"><label for="obs-time">Waktu</label><input id="obs-time" type="time"></div><div class="field"><label for="obs-object">Objek</label><input id="obs-object" placeholder="Matahari / Bulan / Bintang"></div><div class="field"><label for="obs-az">Azimuth</label><input id="obs-az" type="number" step="0.1"></div><div class="field"><label for="obs-alt">Altitude</label><input id="obs-alt" type="number" step="0.1"></div><div class="field"><label for="obs-note">Catatan</label><input id="obs-note" placeholder="Kondisi langit..."></div>
      </div><div class="table-wrap" style="margin-top:14px"><table class="table"><thead><tr><th>Tanggal</th><th>Waktu</th><th>Objek</th><th>Azimuth</th><th>Altitude</th><th>Catatan</th><th>Aksi</th></tr></thead><tbody id="obs-body"></tbody></table></div></div></section>
      <section class="section"><div class="card"><div class="section-head"><div><h3>Proyek Akhir</h3><p>Template analisis posisi hilal.</p></div><button type="button" class="btn btn-primary" id="project-save">Simpan Proyek</button></div><div class="input-grid">
        <div class="field"><label for="pr-date">Tanggal</label><input id="pr-date" type="date"></div><div class="field"><label for="pr-location">Lokasi</label><input id="pr-location" placeholder="Bandung"></div><div class="field"><label for="pr-sunset">Sunset</label><input id="pr-sunset" type="time"></div><div class="field"><label for="pr-moonset">Moonset</label><input id="pr-moonset" type="time"></div><div class="field"><label for="pr-alt">Altitude (°)</label><input id="pr-alt" type="number" step="0.01"></div><div class="field"><label for="pr-az">Azimuth (°)</label><input id="pr-az" type="number" step="0.01"></div><div class="field"><label for="pr-elong">Elongasi (°)</label><input id="pr-elong" type="number" step="0.01"></div><div class="field"><label for="pr-lag">Lag (menit)</label><input id="pr-lag" type="number" step="0.01"></div><div class="field"><label for="pr-age">Umur Bulan (jam)</label><input id="pr-age" type="number" step="0.01"></div>
      </div><div id="project-summary" class="result" aria-live="polite">Belum ada proyek yang disimpan.</div></div></section>
      <section class="section"><div class="card"><h3>Data Hilal: BMKG × Stellarium</h3><p>Masukkan pasangan nilai untuk mempelajari selisih data. Pastikan parameter, tanggal, lokasi, dan zona waktu sama.</p><div class="table-wrap" style="margin-top:10px"><table class="table" id="compare-table"><thead><tr><th>Parameter</th><th>BMKG</th><th>Stellarium</th><th>Selisih Absolut</th></tr></thead><tbody>${['sunset','moonset','sunAz','moonAz','altitude','elongation'].map((key, index) => { const labels = ['Sunset','Moonset','Azimuth Matahari','Azimuth Bulan','Altitude','Elongasi']; const isTime = index < 2; return `<tr><td>${labels[index]}</td><td><input aria-label="BMKG ${labels[index]}" class="cmp" data-kind="${isTime ? 'time' : 'number'}" data-param="bmkg-${key}" inputmode="${isTime ? 'numeric' : 'decimal'}" placeholder="${isTime ? '18:00' : '0'}"></td><td><input aria-label="Stellarium ${labels[index]}" class="cmp" data-kind="${isTime ? 'time' : 'number'}" data-param="stell-${key}" inputmode="${isTime ? 'numeric' : 'decimal'}" placeholder="${isTime ? '18:00' : '0'}"></td><td id="diff-${key}" class="diff">-</td></tr>`; }).join('')}</tbody></table></div></div></section>`;
    this.practiceBind();
  },
  practiceBind() {
    const q = id => document.getElementById(id);
    const direction = degrees => {
      const deg = ((Number(degrees) % 360) + 360) % 360;
      const directions = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
      return directions[Math.round(deg / 45) % 8];
    };
    const azimuth = () => {
      const input = q('az-input');
      const result = q('az-result');
      if (!input || !result) return;
      let value = Number(input.value);
      if (!Number.isFinite(value)) value = 0;
      value = Math.max(0, Math.min(360, value));
      result.textContent = `${value.toFixed(1)}° = ${direction(value)}`;
      const needle = q('compass-needle');
      if (needle) needle.style.transform = `rotate(${value}deg)`;
    };
    const altitude = () => {
      const input = q('alt-input');
      const result = q('alt-result');
      if (!input || !result) return;
      let value = Number(input.value);
      if (!Number.isFinite(value)) value = 0;
      value = Math.max(-90, Math.min(90, value));
      result.textContent = value < 0 ? `${value.toFixed(1)}°: secara geometris di bawah horizon.` : value === 90 ? '90°: zenith.' : `${value.toFixed(1)}° di atas horizon.`;
    };
    const convertTime = () => {
      const input = q('utc-time');
      const result = q('time-result');
      if (!input || !result || !input.value) return;
      const [hour, minute] = input.value.split(':').map(Number);
      const convert = offset => {
        const total = (hour * 60 + minute + offset * 60 + 1440) % 1440;
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      };
      result.textContent = `WIB ${convert(7)} · WITA ${convert(8)} · WIT ${convert(9)}`;
    };
    const lag = () => {
      const sunset = q('sunset')?.value;
      const moonset = q('moonset')?.value;
      const result = q('lag-result');
      if (!sunset || !moonset || !result) return;
      const toMinutes = value => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
      let difference = toMinutes(moonset) - toMinutes(sunset);
      if (difference < 0) difference += 1440;
      result.textContent = `${difference} menit`;
    };
    q('az-input')?.addEventListener('input', azimuth);
    q('alt-input')?.addEventListener('input', altitude);
    q('utc-time')?.addEventListener('input', convertTime);
    q('sunset')?.addEventListener('input', lag);
    q('moonset')?.addEventListener('input', lag);
    azimuth(); altitude(); convertTime(); lag();

    q('qibla-btn')?.addEventListener('click', () => {
      const lat = Number(q('q-lat').value), lon = Number(q('q-lon').value), kaabaLat = Number(q('k-lat').value), kaabaLon = Number(q('k-lon').value);
      const result = q('qibla-result');
      const values = [lat, lon, kaabaLat, kaabaLon];
      if (values.some(value => Number.isNaN(value))) { result.textContent = 'Tolong masukkan semua koordinat.'; return; }
      if (Math.abs(lat) > 90 || Math.abs(kaabaLat) > 90 || Math.abs(lon) > 180 || Math.abs(kaabaLon) > 180) { result.textContent = 'Format koordinat tidak valid.'; return; }
      const radians = degrees => degrees * Math.PI / 180;
      const deltaLon = radians(kaabaLon - lon);
      const bearing = Math.atan2(Math.sin(deltaLon), Math.cos(radians(lat)) * Math.tan(radians(kaabaLat)) - Math.sin(radians(lat)) * Math.cos(deltaLon)) * 180 / Math.PI;
      const az = (bearing + 360) % 360;
      result.innerHTML = `Azimuth Kiblat: <strong>${az.toFixed(2)}°</strong><br>Arah mata angin: <strong>${this.escapeHtml(direction(az))}</strong><br><small>Media pembelajaran. Verifikasi koordinat, metode, dan hasil dengan sumber atau perangkat falak tepercaya.</small>`;
      const needle = q('compass-needle');
      if (needle) needle.style.transform = `rotate(${az}deg)`;
      if (typeof Gamification !== 'undefined' && Math.abs(az) > 0) Gamification.addXP(2, 'kiblat');
    });

    const renderObservations = () => {
      const body = q('obs-body');
      if (!body) return;
      const rows = Progress.observations();
      body.innerHTML = rows.length ? rows.map((row, index) => `<tr><td>${this.escapeHtml(row.date || '-')}</td><td>${this.escapeHtml(row.time || '-')}</td><td>${this.escapeHtml(row.object || '-')}</td><td>${this.escapeHtml(row.az || '-')}</td><td>${this.escapeHtml(row.alt || '-')}</td><td>${this.escapeHtml(row.note || '-')}</td><td><button type="button" class="icon-btn" data-obs-delete="${index}" aria-label="Hapus baris observasi ${index + 1}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></td></tr>`).join('') : '<tr><td colspan="7">Belum ada data.</td></tr>';
    };
    renderObservations();
    q('obs-save')?.addEventListener('click', () => {
      const row = { date: q('obs-date').value, time: q('obs-time').value, object: q('obs-object').value.trim(), az: q('obs-az').value, alt: q('obs-alt').value, note: q('obs-note').value.trim() };
      if (!row.date || !row.time || !row.object) { this.toast('Tanggal, waktu, dan objek wajib diisi.'); return; }
      const rows = Progress.observations(); rows.push(row); Progress.saveObservations(rows);
      Gamification.addXP(10, 'praktik-observasi');
      ['obs-date','obs-time','obs-object','obs-az','obs-alt','obs-note'].forEach(id => { const input = q(id); if (input) input.value = ''; });
      renderObservations();
    });
    q('obs-body')?.addEventListener('click', event => {
      const button = event.target.closest('[data-obs-delete]');
      if (!button) return;
      const rows = Progress.observations(); rows.splice(Number(button.dataset.obsDelete), 1); Progress.saveObservations(rows); renderObservations();
    });

    const parseCompareValue = (value, kind) => {
      if (kind === 'time') {
        if (!/^\d{2}:\d{2}$/.test(value)) return NaN;
        const [h, m] = value.split(':').map(Number);
        return h >= 0 && h < 24 && m >= 0 && m < 60 ? h * 60 + m : NaN;
      }
      return Number(value);
    };
    document.querySelectorAll('.cmp').forEach(input => input.addEventListener('input', () => {
      document.querySelectorAll('.diff').forEach(cell => {
        const key = cell.id.replace('diff-', '');
        const bmkgInput = document.querySelector(`[data-param="bmkg-${key}"]`);
        const stellariumInput = document.querySelector(`[data-param="stell-${key}"]`);
        const a = parseCompareValue(bmkgInput?.value || '', bmkgInput?.dataset.kind);
        const b = parseCompareValue(stellariumInput?.value || '', stellariumInput?.dataset.kind);
        cell.textContent = Number.isFinite(a) && Number.isFinite(b) ? Math.abs(a - b).toFixed(3) + (bmkgInput?.dataset.kind === 'time' ? ' menit' : '°') : '-';
      });
    }));

    const project = Progress.project();
    const projectFields = { date: 'pr-date', location: 'pr-location', sunset: 'pr-sunset', moonset: 'pr-moonset', alt: 'pr-alt', az: 'pr-az', elong: 'pr-elong', lag: 'pr-lag', age: 'pr-age' };
    Object.entries(projectFields).forEach(([key, id]) => { if (project[key] != null && q(id)) q(id).value = project[key]; });
    const renderProject = () => {
      const summary = q('project-summary');
      if (!summary) return;
      const p = Progress.project();
      if (!p.date && !p.location) { summary.textContent = 'Belum ada proyek yang disimpan.'; return; }
      summary.innerHTML = `<strong>${this.escapeHtml(p.location || 'Lokasi belum diisi')} · ${this.escapeHtml(p.date || 'Tanggal belum diisi')}</strong><br>Sunset ${this.escapeHtml(p.sunset || '-')} · Moonset ${this.escapeHtml(p.moonset || '-')} · Lag ${this.escapeHtml(p.lag || '-')} menit<br>Altitude ${this.escapeHtml(p.alt || '-')}° · Azimuth ${this.escapeHtml(p.az || '-')}° · Elongasi ${this.escapeHtml(p.elong || '-')}° · Umur ${this.escapeHtml(p.age || '-')} jam<br><small>Ringkasan ini membantu penyusunan laporan akademik.</small>`;
    };
    renderProject();
    q('project-save')?.addEventListener('click', () => {
      const value = {}; Object.entries(projectFields).forEach(([key, id]) => { value[key] = q(id).value.trim(); }); Progress.saveProject(value); Gamification.addXP(10, 'praktik-proyek'); renderProject(); this.toast('Proyek tersimpan di perangkat ini.');
    });
    this.bindVisualLab();
  },
  bindVisualLab() {
    const dir = degrees => ['Utara','Timur Laut','Timur','Tenggara','Selatan','Barat Daya','Barat','Barat Laut'][Math.round((((Number(degrees)%360)+360)%360)/45)%8];
    const phaseNames=['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
    const phase = document.getElementById('phase-slider'); const phaseMoon=document.getElementById('phase-moon'); const phaseLabel=document.getElementById('phase-label');
    const updatePhase=()=>{if(!phase||!phaseMoon||!phaseLabel)return; const i=Number(phase.value); phaseMoon.style.setProperty('--phase',i); phaseLabel.textContent=phaseNames[i];};
    phase?.addEventListener('input',updatePhase); updatePhase();
    const planetAz=document.getElementById('planet-az'), planetDot=document.getElementById('planet-dot'), planetOut=document.getElementById('planet-output');
    const updatePlanet=()=>{if(!planetAz)return;const a=Number(planetAz.value); planetDot.style.transform=`rotate(${a}deg) translateY(-70px)`; planetOut.textContent=`Azimuth ${a}° · ${dir(a)}`;}; planetAz?.addEventListener('input',updatePlanet); updatePlanet();
    const alt=document.getElementById('horizon-alt'), obj=document.getElementById('horizon-object'), out=document.getElementById('horizon-output');
    const updateAlt=()=>{if(!alt)return;const a=Number(alt.value); const cl=Math.max(-10,Math.min(90,a)); obj.style.bottom=`${Math.max(3,(cl+10)/100*90)}%`; out.textContent=`Altitude ${a}° · ${a<0?'di bawah horizon':a===90?'zenith':'di atas horizon'}`;}; alt?.addEventListener('input',updateAlt); updateAlt();
    const ca=document.getElementById('compass-az'), needle=document.getElementById('mini-needle'), cout=document.getElementById('compass-output');
    const updateCompass=()=>{if(!ca)return; const a=Number(ca.value); needle.style.transform=`rotate(${a}deg)`; cout.textContent=`${a}° · ${dir(a)}`;}; ca?.addEventListener('input',updateCompass); updateCompass();
  },
  aboutPage() {
    document.querySelector('#view').innerHTML = `<div class="page-hero"><span class="eyebrow">Tentang Modul</span><h2>FALAK INTERACTIVE</h2><p>Mini-LMS untuk pembelajaran Ilmu Falak pada mahasiswa Fakultas Syariah dan Hukum.</p></div>
      <div class="grid grid-2"><div class="card"><h3>Tujuan</h3><p>Modul menggabungkan materi, visualisasi, simulator, quiz, flashcard, video, dan pencatatan progress agar pembelajaran mandiri lebih terstruktur.</p><h4>Prinsip Akademik</h4><p>Konsep astronomi dijelaskan terlebih dahulu. Rumus diberikan setelah konsep dipahami. Aspek astronomi dan fikih dibedakan secara eksplisit.</p></div>
      <div class="card"><h3>SUMBER BELAJAR</h3><div class="chips"><a class="chip" href="https://hilal.bmkg.go.id/" target="_blank" rel="noopener noreferrer">BMKG Hilal</a><a class="chip" href="https://stellarium-web.org/" target="_blank" rel="noopener noreferrer">Stellarium</a><a class="chip" href="https://kemenag.go.id/" target="_blank" rel="noopener noreferrer">Kementerian Agama</a><a class="chip" href="https://science.nasa.gov/solar-system/moon/" target="_blank" rel="noopener noreferrer">NASA</a></div></div></div>
      <section class="section"><div class="card"><h3>Catatan Penggunaan</h3><p>Website ini berjalan sepenuhnya di sisi klien. Progress dan data latihan tersimpan di localStorage browser. Tidak ada backend atau database. Data hilal resmi tetap harus diambil dari sumber resmi saat dibutuhkan.</p><div class="callout"><strong>Catatan:</strong> Kalkulator dan simulasi pada modul ini merupakan perangkat pembelajaran, bukan pengganti ephemeris resmi, hasil observasi lapangan, atau keputusan otoritas keagamaan.</div></div></section>
      <section class="section" id="glosarium"><div class="section-head"><div><h3>Glosarium ${glossary.length} Istilah</h3><p>Cari istilah berdasarkan kata atau definisi.</p></div></div><div class="search" style="margin-bottom:12px"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input id="gloss-search" aria-label="Cari glosarium" placeholder="Cari istilah..."></div><div id="gloss-grid" class="grid grid-4">${glossary.map(item => `<div class="card glossary-item"><h4>${this.escapeHtml(item.term)}</h4><p>${this.escapeHtml(item.definition)}</p></div>`).join('')}</div></section>`;
    document.querySelector('#gloss-search')?.addEventListener('input', event => { const term = event.target.value.toLowerCase(); document.querySelectorAll('.glossary-item').forEach(card => { card.style.display = card.textContent.toLowerCase().includes(term) ? '' : 'none'; }); });
  },
  syncSearch() {
    const input = document.querySelector('#global-search');
    if (!input) return;
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && input.value.trim()) location.href = `${this.url('pages/materi.html')}?search=${encodeURIComponent(input.value.trim())}`;
    });
  },
  doSearch(value) {
    if (this.page !== 'home') return;
    const query = value.trim();
    let box = document.querySelector('#search-results');
    if (query.length < 2) { box?.remove(); return; }
    const found = materials.filter(item => `${item.title} ${item.intro} ${item.explain.join(' ')}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
    if (!box) { box = document.createElement('section'); box.id = 'search-results'; box.className = 'section'; document.querySelector('#view').prepend(box); }
    box.innerHTML = `<div class="section-head"><div><h3>Hasil Pencarian</h3><p>${found.length} materi cocok.</p></div></div><div class="grid grid-3">${found.map(item => `<a class="card" href="pages/materi.html?day=${item.day}"><span class="chip">Hari ${item.day}</span><h4 style="margin-top:8px">${this.escapeHtml(item.title)}</h4><p>${this.escapeHtml(item.intro)}</p></a>`).join('') || '<div class="card">Tidak ditemukan.</div>'}</div>`;
  },
  toast(message) {
    let toast = document.querySelector('#toast');
    if (!toast) { toast = document.createElement('div'); toast.id = 'toast'; toast.setAttribute('role', 'status'); toast.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2000;background:#14254c;color:#fff;padding:12px 14px;border-radius:13px;box-shadow:0 10px 30px rgba(0,0,0,.2);font-size:12px;font-weight:700'; document.body.appendChild(toast); }
    toast.textContent = message;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.remove(), 2800);
  }
};

APP.init();
