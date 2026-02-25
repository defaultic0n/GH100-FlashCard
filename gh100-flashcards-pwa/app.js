/* GH-100 Flashcards PWA (offline-capable) */
const $ = (id) => document.getElementById(id);

const state = {
  all: [],          // all cards
  view: [],         // cards after filters
  idx: 0,
  flipped: false,
  onlyMissed: false,
  shuffle: false,
  search: '',
  progress: {},     // id -> {correct:int, wrong:int}
};

const STORAGE_KEY = 'gh100_flashcards_progress_v1';
const PREF_KEY = 'gh100_flashcards_prefs_v1';

function loadProgress(){
  try{ state.progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }catch{ state.progress = {}; }
}
function saveProgress(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); }

function loadPrefs(){
  try{
    const p = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    state.onlyMissed = !!p.onlyMissed;
    state.shuffle = !!p.shuffle;
  }catch{}
  $('toggleMissed').checked = state.onlyMissed;
  $('toggleShuffle').checked = state.shuffle;
}
function savePrefs(){
  localStorage.setItem(PREF_KEY, JSON.stringify({onlyMissed: state.onlyMissed, shuffle: state.shuffle}));
}

function tally(){
  let correct = 0, wrong = 0;
  for(const v of Object.values(state.progress)){
    correct += (v.correct||0);
    wrong += (v.wrong||0);
  }
  return {correct, wrong};
}

function applyFilters(){
  const q = state.search.trim().toLowerCase();
  let cards = [...state.all];

  if(state.onlyMissed){
    cards = cards.filter(c => (state.progress[c.id]?.wrong || 0) > 0);
  }
  if(q){
    cards = cards.filter(c => {
      const front = (c.question + ' ' + (c.options||[]).map(o=>o.text).join(' ')).toLowerCase();
      const back = ((c.answers||[]).join(' ') + ' ' + (c.explanation||'')).toLowerCase();
      return front.includes(q) || back.includes(q);
    });
  }
  if(state.shuffle){
    // stable shuffle based on current time seed
    for(let i=cards.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }
  state.view = cards;
  if(state.idx >= state.view.length) state.idx = 0;
  render();
}

function formatFront(card){
  const options = (card.options||[]).map(o => `<li>${escapeHtml(o.text)}</li>`).join('');
  return `
    <div class="badge">Q</div>
    <h2>${escapeHtml(card.question)}</h2>
    <ul>${options}</ul>
    <div class="muted">Tap Flip to reveal highlighted answer(s).</div>
  `;
}

function formatBack(card){
  const answers = (card.answers||[]).map(a => `<li><strong>${escapeHtml(a)}</strong></li>`).join('');
  const expl = card.explanation ? `<div class="muted">${escapeHtml(card.explanation)}</div>` : `<div class="muted">No explanation provided in source.</div>`;
  return `
    <div class="badge">A</div>
    <h2>Correct answer(s)</h2>
    <ul>${answers}</ul>
    ${expl}
  `;
}

function escapeHtml(s){
  return (s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function setFlipped(on){
  state.flipped = on;
  const el = $('card');
  if(on) el.classList.add('flipped');
  else el.classList.remove('flipped');
}

function render(){
  const total = state.view.length;
  const card = state.view[state.idx];
  $('statIndex').textContent = total ? `${state.idx+1}/${total}` : '0/0';
  const t = tally();
  $('statScore').textContent = `${t.correct} correct • ${t.wrong} missed`;

  if(!total){
    $('front').innerHTML = `<h2>No cards match your filters.</h2><div class="muted">Try turning off “Only missed” or clearing search.</div>`;
    $('back').innerHTML = `<h2>—</h2>`;
    setFlipped(false);
    return;
  }

  $('front').innerHTML = formatFront(card);
  $('back').innerHTML = formatBack(card);
  setFlipped(false);
}

function next(){
  if(state.view.length===0) return;
  state.idx = (state.idx + 1) % state.view.length;
  render();
}
function prev(){
  if(state.view.length===0) return;
  state.idx = (state.idx - 1 + state.view.length) % state.view.length;
  render();
}

function mark(kind){
  const card = state.view[state.idx];
  if(!card) return;
  state.progress[card.id] = state.progress[card.id] || {correct:0, wrong:0};
  state.progress[card.id][kind] = (state.progress[card.id][kind]||0) + 1;
  saveProgress();
  // If we're viewing only missed, keep filters accurate
  if(state.onlyMissed) applyFilters();
  else next();
}

function resetProgress(){
  localStorage.removeItem(STORAGE_KEY);
  state.progress = {};
  applyFilters();
}

async function boot(){
  loadProgress();
  loadPrefs();

  const res = await fetch('cards.json');
  const data = await res.json();
  state.all = data.cards || [];
  // ensure ids are numeric
  state.all.forEach((c,i)=>{ if(typeof c.id!=='number') c.id = i+1; });

  // UI handlers
  $('btnNext').addEventListener('click', next);
  $('btnPrev').addEventListener('click', prev);
  $('btnFlip').addEventListener('click', () => setFlipped(!state.flipped));
  $('btnCorrect').addEventListener('click', () => mark('correct'));
  $('btnWrong').addEventListener('click', () => mark('wrong'));

  $('toggleShuffle').addEventListener('change', (e)=>{ state.shuffle = e.target.checked; savePrefs(); applyFilters(); });
  $('toggleMissed').addEventListener('change', (e)=>{ state.onlyMissed = e.target.checked; savePrefs(); applyFilters(); });
  $('btnReset').addEventListener('click', resetProgress);

  $('searchBox').addEventListener('input', (e)=>{ state.search = e.target.value; applyFilters(); });
  $('btnClearSearch').addEventListener('click', ()=>{ $('searchBox').value=''; state.search=''; applyFilters(); });

  // Keyboard support
  window.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight') next();
    if(e.key==='ArrowLeft') prev();
    if(e.key===' ') { e.preventDefault(); setFlipped(!state.flipped); }
  });

  applyFilters();

  // Service worker
  if('serviceWorker' in navigator){
    try{ await navigator.serviceWorker.register('service-worker.js'); }catch(e){ /* ignore */ }
  }
}

boot();
