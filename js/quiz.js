const Quiz = {
  state: null,
  shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  },
  poolForMode(mode) {
    if (mode === 'daily') {
      const rawDay = Number(new URLSearchParams(location.search).get('day') || Progress.stats().last || 1);
      const day = Math.max(1, Math.min(30, Number.isInteger(rawDay) ? rawDay : 1));
      return quizBank.filter(q => q.day === day);
    }
    if (mode === 'weekly') {
      const week = Number(new URLSearchParams(location.search).get('week') || 1);
      return quizBank.filter(q => q.week === week);
    }
    return quizBank;
  },
  start(mode = 'daily', limit = 10) {
    const available = this.poolForMode(mode);
    const pool = this.shuffle(available).slice(0, Math.min(limit, available.length));
    this.state = {
      mode,
      questions: pool,
      index: 0,
      answers: [],
      score: 0,
      locked: false,
      finished: false,
      saved: null
    };
    this.render();
  },
  answer(index) {
    if (!this.state || this.state.finished || this.state.locked) return;
    const question = this.state.questions[this.state.index];
    if (!question) return;
    this.state.locked = true;
    this.state.answers[this.state.index] = index;
    if (index === question.answer) this.state.score += 1;
    this.render();
  },
  next() {
    if (!this.state || !this.state.locked) return;
    if (this.state.index >= this.state.questions.length - 1) {
      this.finish();
      return;
    }
    this.state.index += 1;
    this.state.locked = false;
    this.render();
  },
  finish() {
    if (!this.state || this.state.finished) return;
    const s = this.state;
    const saved = Progress.saveScore(s.mode, s.score, s.questions.length);
    this.state = { ...s, finished: true, saved };
    this.render();
  },
  miniQuestions(day) {
    return quizBank.filter(q => q.day === Number(day)).slice(0, 3);
  },
  miniAnswer(day, questionIndex, answerIndex) {
    const questions = this.miniQuestions(day);
    const question = questions[questionIndex];
    const root = document.querySelector(`[data-mini-root="${day}"]`);
    if (!question || !root) return;
    const buttons = root.querySelectorAll(`[data-mini-question="${questionIndex}"] [data-mini-answer]`);
    buttons.forEach(button => {
      button.disabled = true;
      const index = Number(button.dataset.miniAnswer);
      if (index === question.answer) button.classList.add('correct');
      if (index === answerIndex && index !== question.answer) button.classList.add('wrong');
    });
    const feedback = root.querySelector(`[data-mini-feedback="${questionIndex}"]`);
    if (feedback) {
      feedback.innerHTML = answerIndex === question.answer
        ? `<strong>Benar!</strong> ${question.explanation}`
        : `<strong>Belum tepat.</strong> ${question.explanation}`;
      feedback.className = `feedback ${answerIndex === question.answer ? 'success' : 'error'}`;
    }
  },
  render() {
    const root = document.querySelector('#quiz-root');
    if (!root || !this.state) return;
    const s = this.state;
    if (!s.questions.length) {
      root.innerHTML = '<div class="card">Soal belum tersedia untuk mode ini.</div>';
      return;
    }
    if (s.finished) {
      const pct = Math.round((s.score / s.questions.length) * 100);
      const status = pct >= 90 ? 'Luar biasa' : pct >= 80 ? 'Sangat Baik' : pct >= 70 ? 'Baik' : 'Perlu Penguatan';
      root.innerHTML = `<div class="result-card">
        <div class="eyebrow"><i class="fa-solid fa-award"></i> Hasil Quiz</div>
        <div class="score-big">${s.score}/${s.questions.length}</div>
        <h3>${status}</h3>
        <p>Nilai ${pct}/100. Hasil terbaik tersimpan otomatis di perangkat ini.</p>
        <div class="hero-actions" style="justify-content:center;margin-top:14px">
          <button class="btn btn-primary" data-action="quiz-restart"><i class="fa-solid fa-rotate-right"></i> Ulangi</button>
          <a class="btn btn-outline" href="${APP.url('pages/materi.html')}?day=${s.questions[0]?.day || 1}"><i class="fa-solid fa-book-open"></i> Kembali ke Materi</a>
        </div>
      </div>${s.questions.map((q, index) => {
        const selected = s.answers[index];
        return `<div class="card" style="margin-top:11px">
          <strong>${index + 1}. ${APP.escapeHtml(q.q)}</strong>
          <p style="margin-top:6px">Jawaban Anda: ${selected === undefined ? '-' : APP.escapeHtml(q.options[selected])}<br><b>Jawaban benar:</b> ${APP.escapeHtml(q.options[q.answer])}</p>
          <div class="callout">${APP.escapeHtml(q.explanation)}</div>
        </div>`;
      }).join('')}`;
      return;
    }
    const q = s.questions[s.index];
    const pct = Math.round((s.index / s.questions.length) * 100);
    const answeredPct = s.index === 0 ? 0 : Math.round((s.score / s.index) * 100);
    root.innerHTML = `<div class="quiz-progress"><span>Soal ${s.index + 1} / ${s.questions.length}</span><span>${answeredPct}% benar sementara</span></div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="quiz-question">${APP.escapeHtml(q.q)}</div>
      <div class="answers">${q.options.map((option, index) => `<button class="answer ${s.locked ? (index === q.answer ? 'correct' : index === s.answers[s.index] ? 'wrong' : '') : ''}" ${s.locked ? 'disabled' : ''} data-action="quiz-answer" data-index="${index}"><span class="answer-letter">${'ABCD'[index]}</span><span>${APP.escapeHtml(option)}</span></button>`).join('')}</div>
      ${s.locked ? `<div class="feedback ${s.answers[s.index] === q.answer ? 'success' : 'error'}"><strong>${s.answers[s.index] === q.answer ? 'Benar!' : 'Belum tepat.'}</strong> ${APP.escapeHtml(q.explanation)}</div>
      <div style="margin-top:14px;text-align:right"><button class="btn btn-primary" data-action="quiz-next">${s.index === s.questions.length - 1 ? 'Lihat Hasil' : 'Soal Berikutnya'} <i class="fa-solid fa-arrow-right"></i></button></div>` : ''}`;
  }
};
