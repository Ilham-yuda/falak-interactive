const Flashcards = {
  state: { index: 0, flipped: false },
  init() {
    const saved = Progress.flash();
    const max = Math.max(0, flashcards.length - 1);
    this.state = { index: Math.max(0, Math.min(saved.index, max)), flipped: false };
    this.render();
  },
  move(step) {
    const total = flashcards.length;
    if (!total) return;
    this.state.index = (this.state.index + step + total) % total;
    this.state.flipped = false;
    this.save();
    this.render();
  },
  shuffle() {
    if (!flashcards.length) return;
    let next = Math.floor(Math.random() * flashcards.length);
    if (flashcards.length > 1 && next === this.state.index) next = (next + 1) % flashcards.length;
    this.state.index = next;
    this.state.flipped = false;
    this.save();
    this.render();
  },
  flip() {
    this.state.flipped = !this.state.flipped;
    const saved = Progress.flash();
    const seen = new Set(saved.seen);
    if (this.state.flipped) seen.add(this.state.index);
    this.save({ index: this.state.index, seen: [...seen] });
    this.render();
  },
  save(extra = {}) {
    const saved = Progress.flash();
    Progress.saveFlash({ index: this.state.index, seen: saved.seen, ...extra });
  },
  render() {
    const root = document.querySelector('#flash-root');
    if (!root) return;
    if (!flashcards.length) {
      root.innerHTML = '<div class="card">Belum ada flashcard.</div>';
      return;
    }
    const card = flashcards[this.state.index];
    const seen = Progress.flash().seen;
    root.innerHTML = `<div class="flashcard ${this.state.flipped ? 'flipped' : ''}" tabindex="0" role="button" aria-label="Flashcard. Klik untuk membalik.">
      <div class="flash-inner">
        <div class="flash-face front"><div><span class="chip" style="background:rgba(255,255,255,.16);color:#fff">${APP.escapeHtml(card.category)}</span><h3>${APP.escapeHtml(card.front)}</h3><p style="color:#d4e0f2">Klik kartu untuk membalik</p></div></div>
        <div class="flash-face back"><div><span class="chip" style="background:rgba(255,255,255,.16);color:#fff">Jawaban</span><h3>${APP.escapeHtml(card.back)}</h3></div></div>
      </div>
    </div>
    <div class="chips" style="justify-content:center;margin-top:12px"><span class="chip">Card ${this.state.index + 1} / ${flashcards.length}</span><span class="chip">${seen.length} dipelajari</span></div>
    <div class="flash-actions"><button class="btn btn-outline" data-action="flash-prev"><i class="fa-solid fa-arrow-left"></i> Previous</button><button class="btn btn-primary" data-action="flash-flip"><i class="fa-solid fa-rotate"></i> Flip</button><button class="btn btn-outline" data-action="flash-shuffle"><i class="fa-solid fa-shuffle"></i> Shuffle</button><button class="btn btn-outline" data-action="flash-next">Next <i class="fa-solid fa-arrow-right"></i></button></div>`;
    const interactiveCard = root.querySelector('.flashcard');
    interactiveCard?.addEventListener('click', (event) => {
      if (event.target.closest('button,a')) return;
      this.flip();
    });
    interactiveCard?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.flip();
      }
    });
  }
};
