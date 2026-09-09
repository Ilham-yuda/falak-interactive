const STORAGE = {
  completed: 'falak_completedDays',
  scores: 'falak_quizScores',
  best: 'falak_bestScore',
  flash: 'falak_flashProgress',
  dark: 'falak_darkMode',
  last: 'falak_lastVisitedDay',
  obs: 'falak_observations',
  project: 'falak_finalProject'
};

const Progress = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  completed() {
    const value = this.get(STORAGE.completed, []);
    return Array.isArray(value) ? value.map(Number).filter(d => d >= 1 && d <= 30) : [];
  },
  isDayComplete(day) {
    return this.completed().includes(Number(day));
  },
  completeDay(day) {
    day = Number(day);
    if (!Number.isInteger(day) || day < 1 || day > 30) return this.completed();
    const all = this.completed();
    if (!all.includes(day)) all.push(day);
    all.sort((a, b) => a - b);
    this.set(STORAGE.completed, all);
    this.set(STORAGE.last, day);
    if (typeof Gamification !== 'undefined') Gamification.addXP(20, `materi-${day}`);
    return all;
  },
  toggleDay(day) {
    day = Number(day);
    if (!Number.isInteger(day) || day < 1 || day > 30) return this.completed();
    let all = this.completed();
    all = all.includes(day) ? all.filter(d => d !== day) : [...all, day];
    all.sort((a, b) => a - b);
    this.set(STORAGE.completed, all);
    this.set(STORAGE.last, day);
    return all;
  },
  setLastDay(day) {
    day = Math.max(1, Math.min(30, Number(day) || 1));
    this.set(STORAGE.last, day);
    return day;
  },
  scores() {
    const value = this.get(STORAGE.scores, {});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  },
  saveScore(mode, score, total) {
    const all = this.scores();
    const pct = total ? Math.round((score / total) * 100) : 0;
    const result = { score, total, pct, date: new Date().toISOString() };
    all[mode] = result;
    this.set(STORAGE.scores, all);
    const best = Number(this.get(STORAGE.best, 0)) || 0;
    if (pct > best) this.set(STORAGE.best, pct);
    if (typeof Gamification !== 'undefined') { Gamification.addXP(10, `quiz-${mode}`); if (pct >= 80) { Gamification.addXP(15, `quiz-high-${mode}`); Gamification.celebrate(pct); } }
    return result;
  },
  stats() {
    const completed = this.completed();
    const scores = this.scores();
    const attempts = Object.keys(scores).length;
    const best = Number(this.get(STORAGE.best, 0)) || 0;
    const rawLast = Number(this.get(STORAGE.last, 1)) || 1;
    const last = Math.max(1, Math.min(30, rawLast));
    return {
      completed: completed.length,
      pct: Math.round((completed.length / 30) * 100),
      last,
      best,
      attempts
    };
  },
  flash() {
    const value = this.get(STORAGE.flash, { index: 0, seen: [] });
    return {
      index: Number.isInteger(Number(value?.index)) ? Number(value.index) : 0,
      seen: Array.isArray(value?.seen) ? value.seen.map(Number).filter(Number.isInteger) : []
    };
  },
  saveFlash(value) {
    const before = this.flash(); const result = this.set(STORAGE.flash, value);
    if (result && typeof Gamification !== 'undefined' && Array.isArray(value?.seen) && value.seen.length > before.seen.length) Gamification.addXP(3, `flashcard-${value.seen.length}`);
    return result;
  },
  observations() {
    const value = this.get(STORAGE.obs, []);
    return Array.isArray(value) ? value : [];
  },
  saveObservations(value) {
    return this.set(STORAGE.obs, Array.isArray(value) ? value : []);
  },
  project() {
    const value = this.get(STORAGE.project, {});
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  },
  saveProject(value) {
    return this.set(STORAGE.project, value && typeof value === 'object' ? value : {});
  },
  applyTheme() {
    const dark = Boolean(this.get(STORAGE.dark, false));
    document.body.classList.toggle('dark', dark);
    return dark;
  },
  toggleTheme() {
    const next = !document.body.classList.contains('dark');
    document.body.classList.toggle('dark', next);
    this.set(STORAGE.dark, next);
    return next;
  }
};
