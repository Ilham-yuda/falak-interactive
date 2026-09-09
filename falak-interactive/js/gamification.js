const Gamification = {
  KEY: 'falak_gamification',
  defaults: { xp: 0, streak: { current: 0, longest: 0, lastDate: null }, badges: [], challengeDate: null, challengeDone: false, actions: {} },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return { ...this.defaults, ...(parsed || {}), streak: { ...this.defaults.streak, ...(parsed?.streak || {}) }, actions: parsed?.actions || {} };
    } catch { return structuredClone ? structuredClone(this.defaults) : JSON.parse(JSON.stringify(this.defaults)); }
  },
  save(state) { try { localStorage.setItem(this.KEY, JSON.stringify(state)); return true; } catch { return false; } },
  todayKey() { return new Date().toISOString().slice(0, 10); },
  yesterdayKey() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); },
  syncStreak(state) {
    const today = this.todayKey();
    if (state.streak.lastDate === today) return state;
    state.streak.current = state.streak.lastDate === this.yesterdayKey() ? Math.max(1, state.streak.current) : 0;
    state.challengeDate = today;
    state.challengeDone = false;
    return state;
  },
  state() { const s = this.syncStreak(this.load()); this.save(s); return s; },
  levelForXP(xp) {
    const levels = [
      [0, 'Falak Pemula'], [100, 'Pengamat Langit'], [250, 'Navigator Kiblat'], [450, 'Ahli Hilal'], [700, 'Falak Explorer']
    ];
    let current = levels[0];
    for (const level of levels) if (xp >= level[0]) current = level; else break;
    const index = levels.findIndex(item => item === current);
    const next = levels[index + 1];
    return { name: current[1], min: current[0], nextXP: next ? next[0] : current[0] + 250, nextName: next?.[1] || 'Level Maksimal', index: index + 1 };
  },
  addXP(amount, reason = 'Aktivitas') {
    const s = this.state();
    const key = `${this.todayKey()}:${reason}`;
    if (s.actions[key]) return { awarded: 0, ...this.describe(s) };
    s.actions[key] = true;
    s.xp = Math.max(0, Number(s.xp) || 0) + amount;
    this.touchStreak(s);
    const before = this.levelForXP(s.xp - amount).name;
    const after = this.levelForXP(s.xp).name;
    const changed = before !== after;
    this.updateBadges(s);
    this.save(s);
    return { awarded: amount, leveledUp: changed, level: after, ...this.describe(s) };
  },
  touchStreak(s) {
    const today = this.todayKey();
    if (s.streak.lastDate === today) return;
    s.streak.current = s.streak.lastDate === this.yesterdayKey() ? Math.max(1, s.streak.current + 1) : 1;
    s.streak.longest = Math.max(s.streak.longest || 0, s.streak.current);
    s.streak.lastDate = today;
    s.challengeDate = today;
    s.challengeDone = false;
  },
  markChallengeDone() {
    const s = this.state();
    this.touchStreak(s);
    if (s.challengeDone) return { awarded: 0, ...this.describe(s) };
    s.challengeDone = true;
    s.xp += 25;
    this.updateBadges(s);
    this.save(s);
    return { awarded: 25, ...this.describe(s) };
  },
  updateBadges(s) {
    const add = badge => { if (!s.badges.includes(badge)) s.badges.push(badge); };
    if (s.xp >= 50 || Progress.completed().length >= 1) add('Falak Pemula');
    if (Progress.completed().length >= 7 || (s.actions && Object.keys(s.actions).filter(k => k.includes('flashcard')).length >= 7)) add('Pengamat Langit');
    if (s.actions && Object.keys(s.actions).some(k => k.includes('kiblat'))) add('Navigator Kiblat');
    if (s.actions && Object.keys(s.actions).some(k => k.includes('quiz-high'))) add('Ahli Hilal');
    if (Progress.completed().length >= 30 || s.xp >= 700) add('Falak Explorer');
  },
  describe(s = this.state()) {
    const level = this.levelForXP(s.xp);
    const progressToNext = level.nextXP > level.min ? Math.min(100, Math.round(((s.xp - level.min) / (level.nextXP - level.min)) * 100)) : 100;
    return { xp: s.xp, streak: s.streak.current, longestStreak: s.streak.longest, badges: [...s.badges], level: level.name, levelIndex: level.index, nextXP: level.nextXP, nextName: level.nextName, levelProgress: progressToNext, challengeDone: s.challengeDone };
  },
  ensureChallenge() { this.state(); return { title: 'Tantangan Hari Ini', text: 'Selesaikan satu aktivitas belajar hari ini untuk mendapatkan bonus 25 XP.', done: this.state().challengeDone }; },
  renderDashboardCard() {
    const d = this.describe();
    const deg = Math.round((d.xp % 100) * 3.6);
    return `<div class="gamify-grid">
      <div class="card gamify-level"><div class="level-ring" style="--ring:${deg}deg"><div><strong>${d.levelIndex}</strong><small>LEVEL</small></div></div><div><span class="chip">${d.level}</span><h4 style="margin:8px 0 4px">${d.xp} XP</h4><p>${Math.max(0,d.nextXP-d.xp)} XP menuju ${d.nextName}.</p><div class="progress"><span style="width:${d.levelProgress}%"></span></div></div></div>
      <div class="card"><div class="gamify-stat"><span class="gamify-icon">🔥</span><div><strong>${d.streak}</strong><small>hari streak</small></div></div><p>Terpanjang: ${d.longestStreak} hari.</p></div>
      <div class="card"><div class="gamify-stat"><span class="gamify-icon">🏆</span><div><strong>${d.badges.length}</strong><small>badge diperoleh</small></div></div><div class="badge-row">${d.badges.map(b => `<span class="badge-pill">${b}</span>`).join('') || '<span class="muted">Belum ada badge</span>'}</div></div>
      <div class="card challenge-card"><span class="chip">+25 XP</span><h4>${this.ensureChallenge().title}</h4><p>${this.ensureChallenge().text}</p><button type="button" class="btn btn-primary" data-action="daily-challenge" ${d.challengeDone ? 'disabled' : ''}>${d.challengeDone ? '✓ Selesai Hari Ini' : 'Ambil Tantangan'}</button></div>
    </div>`;
  },
  celebrate(pct) {
    if (pct < 80) return;
    const wrap = document.createElement('div'); wrap.className = 'confetti-layer'; wrap.setAttribute('aria-hidden','true');
    for (let i = 0; i < 70; i++) {
      const piece = document.createElement('span'); piece.className = 'confetti-piece'; piece.style.left = `${Math.random()*100}%`; piece.style.animationDelay = `${Math.random()*0.5}s`; piece.style.transform = `rotate(${Math.random()*360}deg)`; wrap.appendChild(piece);
    }
    document.body.appendChild(wrap); setTimeout(() => wrap.remove(), 2600);
  }
};
