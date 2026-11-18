/**
 * To-Do List Life Dashboard
 * ─────────────────────────
 * MVP Features:
 *   ✅ Greeting (clock, date, auto greeting by time)
 *   ✅ Focus Timer (Pomodoro 25 min – start / stop / reset)
 *   ✅ To-Do List (add, edit, complete, delete, LocalStorage)
 *   ✅ Quick Links (add, open, delete, LocalStorage)
 *
 * Bonus Challenges (3 of 5):
 *   ✅ Light / Dark Mode
 *   ✅ Custom name in greeting
 *   ✅ Prevent duplicate tasks
 */

/* =============================================
   UTILITY
   ============================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function getLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 3000);
}

function hideError(el) {
  el.classList.add('hidden');
}

/* =============================================
   1. THEME  (Light / Dark Mode — Bonus #1)
   ============================================= */
(function initTheme() {
  const toggle = $('#themeToggle');
  const icon   = $('#themeIcon');
  const html   = document.documentElement;

  let dark = getLS('dashboard_theme', 'light') === 'dark';

  function apply() {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    icon.textContent = dark ? '☀️' : '🌙';
    toggle.title = dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap';
    setLS('dashboard_theme', dark ? 'dark' : 'light');
  }

  apply();

  toggle.addEventListener('click', () => {
    dark = !dark;
    apply();
  });
})();

/* =============================================
   2. GREETING  (MVP + Bonus #2: Custom Name)
   ============================================= */
(function initGreeting() {
  const timeEl      = $('#greetTime');
  const dateEl      = $('#greetDate');
  const msgEl       = $('#greetMsg');
  const editBtn     = $('#editNameBtn');
  const nameForm    = $('#nameForm');
  const nameInput   = $('#nameInput');
  const saveNameBtn = $('#saveNameBtn');
  const cancelNameBtn = $('#cancelNameBtn');

  const DAYS  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];

  function getGreeting(hour) {
    if (hour >= 4  && hour < 12) return { text: 'Selamat Pagi',  emoji: '🌅' };
    if (hour >= 12 && hour < 15) return { text: 'Selamat Siang', emoji: '☀️' };
    if (hour >= 15 && hour < 18) return { text: 'Selamat Sore',  emoji: '🌤' };
    return                               { text: 'Selamat Malam', emoji: '🌙' };
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const h    = now.getHours();
    const m    = now.getMinutes();
    const s    = now.getSeconds();
    const day  = DAYS[now.getDay()];
    const date = now.getDate();
    const mon  = MONTHS[now.getMonth()];
    const yr   = now.getFullYear();

    timeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    dateEl.textContent = `${day}, ${date} ${mon} ${yr}`;

    const { text, emoji } = getGreeting(h);
    const name = getLS('dashboard_name', '');
    msgEl.textContent = name
      ? `${text}, ${name}! ${emoji}`
      : `${text}! ${emoji}`;
  }

  tick();
  setInterval(tick, 1000);

  /* Toggle name form */
  editBtn.addEventListener('click', () => {
    const open = !nameForm.classList.contains('hidden');
    if (open) {
      nameForm.classList.add('hidden');
    } else {
      nameInput.value = getLS('dashboard_name', '');
      nameForm.classList.remove('hidden');
      nameInput.focus();
    }
  });

  function saveName() {
    const val = nameInput.value.trim();
    setLS('dashboard_name', val);
    nameForm.classList.add('hidden');
    tick();
  }

  saveNameBtn.addEventListener('click', saveName);
  cancelNameBtn.addEventListener('click', () => nameForm.classList.add('hidden'));
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });
})();

/* =============================================
   3. FOCUS TIMER  (MVP: Pomodoro 25 min)
   ============================================= */
(function initTimer() {
  const display  = $('#timerDisplay');
  const startBtn = $('#timerStart');
  const stopBtn  = $('#timerStop');
  const resetBtn = $('#timerReset');
  const progress = $('#timerProgress');
  const label    = $('#timerLabel');

  const TOTAL_SECONDS = 25 * 60;
  let remaining = TOTAL_SECONDS;
  let interval  = null;
  let running   = false;

  function pad(n) { return String(n).padStart(2, '0'); }

  function render() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    display.textContent = `${pad(m)}:${pad(s)}`;
    const pct = ((TOTAL_SECONDS - remaining) / TOTAL_SECONDS) * 100;
    progress.style.width = `${100 - pct}%`;
  }

  function setLabel(txt) { label.textContent = txt; }

  function start() {
    if (running) return;
    if (remaining === 0) return;
    running = true;
    startBtn.disabled = true;
    setLabel('Fokus sedang berjalan… 🧠');

    interval = setInterval(() => {
      remaining--;
      render();
      if (remaining <= 0) {
        clearInterval(interval);
        running = false;
        startBtn.disabled = false;
        setLabel('✅ Sesi selesai! Waktunya istirahat 🎉');
        display.textContent = '00:00';
        progress.style.width = '0%';
        try { new Audio('https://www.soundjay.com/buttons/sounds/button-09a.mp3').play(); } catch {}
      }
    }, 1000);
  }

  function stop() {
    clearInterval(interval);
    running = false;
    startBtn.disabled = false;
    setLabel('Timer dijeda ⏸');
  }

  function reset() {
    stop();
    remaining = TOTAL_SECONDS;
    render();
    setLabel('Siap memulai sesi fokus!');
  }

  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', stop);
  resetBtn.addEventListener('click', reset);

  render();
})();

/* =============================================
   4. TO-DO LIST  (MVP + Bonus #3: No Duplicates)
   ============================================= */
(function initTodo() {
  const input      = $('#todoInput');
  const addBtn     = $('#todoAddBtn');
  const listEl     = $('#todoList');
  const countEl    = $('#todoCount');
  const clearBtn   = $('#clearDoneBtn');
  const errorEl    = $('#todoError');
  const filterBtns = $$('.btn-filter');

  /* Edit modal */
  const modal       = $('#editModal');
  const overlay     = $('#modalOverlay');
  const editInput   = $('#editTodoInput');
  const editSave    = $('#editSaveBtn');
  const editCancel  = $('#editCancelBtn');
  const editErrorEl = $('#editError');

  const KEY = 'dashboard_todos';
  let todos  = getLS(KEY, []);
  let filter = 'all';
  let editId = null;

  /* ── helpers ── */
  function save() { setLS(KEY, todos); }

  function normalise(str) { return str.trim().toLowerCase().replace(/\s+/g, ' '); }

  function isDuplicate(text, excludeId = null) {
    const n = normalise(text);
    return todos.some(t => t.id !== excludeId && normalise(t.text) === n);
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  /* ── render ── */
  function render() {
    listEl.innerHTML = '';

    const visible = todos.filter(t => {
      if (filter === 'active') return !t.done;
      if (filter === 'done')   return  t.done;
      return true;
    });

    if (visible.length === 0) {
      const li = document.createElement('li');
      li.className = 'todo-item todo-item--empty';
      li.textContent = filter === 'done'
        ? 'Belum ada tugas selesai.'
        : filter === 'active'
          ? 'Semua tugas sudah selesai! 🎉'
          : 'Tambahkan tugas pertamamu!';
      listEl.appendChild(li);
    } else {
      visible.forEach(t => listEl.appendChild(createItem(t)));
    }

    const remaining = todos.filter(t => !t.done).length;
    countEl.textContent = `${remaining} tugas tersisa`;
  }

  function createItem(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' todo-item--done' : '');
    li.dataset.id = todo.id;

    const check = document.createElement('input');
    check.type      = 'checkbox';
    check.className = 'todo-item__check';
    check.checked   = todo.done;
    check.setAttribute('aria-label', 'Tandai selesai');
    check.addEventListener('change', () => toggleDone(todo.id));

    const text = document.createElement('span');
    text.className   = 'todo-item__text';
    text.textContent = todo.text;

    const actions = document.createElement('div');
    actions.className = 'todo-item__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'todo-item__btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit';
    editBtn.setAttribute('aria-label', 'Edit tugas');
    editBtn.addEventListener('click', () => openEdit(todo.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'todo-item__btn';
    delBtn.textContent = '🗑️';
    delBtn.title = 'Hapus';
    delBtn.setAttribute('aria-label', 'Hapus tugas');
    delBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.append(editBtn, delBtn);
    li.append(check, text, actions);
    return li;
  }

  /* ── actions ── */
  function addTodo() {
    const text = input.value.trim();
    if (!text) { showError(errorEl, 'Tugas tidak boleh kosong.'); return; }

    // Bonus #3: Prevent duplicate tasks
    if (isDuplicate(text)) {
      showError(errorEl, '⚠️ Tugas yang sama sudah ada dalam daftar!');
      input.select();
      return;
    }

    todos.unshift({ id: uid(), text, done: false });
    save();
    input.value = '';
    hideError(errorEl);
    render();
  }

  function toggleDone(id) {
    todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function clearDone() {
    todos = todos.filter(t => !t.done);
    save();
    render();
  }

  /* ── edit modal ── */
  function openEdit(id) {
    editId = id;
    const todo = todos.find(t => t.id === id);
    editInput.value = todo.text;
    hideError(editErrorEl);
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    editInput.focus();
    editInput.select();
  }

  function closeEdit() {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    editId = null;
  }

  function saveEdit() {
    const text = editInput.value.trim();
    if (!text) { showError(editErrorEl, 'Tugas tidak boleh kosong.'); return; }

    // Prevent duplicate on edit too
    if (isDuplicate(text, editId)) {
      showError(editErrorEl, '⚠️ Tugas yang sama sudah ada dalam daftar!');
      editInput.select();
      return;
    }

    todos = todos.map(t => t.id === editId ? { ...t, text } : t);
    save();
    render();
    closeEdit();
  }

  /* ── filter ── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  /* ── events ── */
  addBtn.addEventListener('click', addTodo);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });
  clearBtn.addEventListener('click', clearDone);
  editSave.addEventListener('click', saveEdit);
  editCancel.addEventListener('click', closeEdit);
  overlay.addEventListener('click', closeEdit);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') closeEdit();
  });

  render();
})();

/* =============================================
   5. QUICK LINKS  (MVP)
   ============================================= */
(function initLinks() {
  const nameInput = $('#linkName');
  const urlInput  = $('#linkUrl');
  const addBtn    = $('#linkAddBtn');
  const grid      = $('#linkGrid');
  const errorEl   = $('#linkError');

  const KEY   = 'dashboard_links';
  let links   = getLS(KEY, [
    { id: 'default-yt', name: 'YouTube',  url: 'https://youtube.com'  },
    { id: 'default-gg', name: 'Google',   url: 'https://google.com'   },
    { id: 'default-gh', name: 'GitHub',   url: 'https://github.com'   },
  ]);

  function save()  { setLS(KEY, links); }
  function uid()   { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function getFavicon(url) {
    try {
      const { hostname } = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return null;
    }
  }

  function render() {
    grid.innerHTML = '';

    if (links.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'link-empty';
      empty.textContent = 'Belum ada tautan. Tambahkan satu!';
      grid.appendChild(empty);
      return;
    }

    links.forEach(link => grid.appendChild(createItem(link)));
  }

  function createItem(link) {
    const item = document.createElement('div');
    item.className = 'link-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('title', link.url);

    const faviconSrc = getFavicon(link.url);
    const icon = document.createElement(faviconSrc ? 'img' : 'span');
    icon.className = 'link-item__icon';
    if (faviconSrc) {
      icon.src = faviconSrc;
      icon.alt = link.name;
      icon.width = 22;
      icon.height = 22;
      icon.onerror = () => { icon.src = ''; icon.textContent = '🔗'; };
    } else {
      icon.textContent = '🔗';
    }

    const label = document.createElement('span');
    label.textContent = link.name;

    const delBtn = document.createElement('button');
    delBtn.className = 'link-item__del';
    delBtn.textContent = '✕';
    delBtn.title = 'Hapus tautan';
    delBtn.setAttribute('aria-label', `Hapus ${link.name}`);
    delBtn.addEventListener('click', e => {
      e.stopPropagation();
      deleteLink(link.id);
    });

    item.append(icon, label, delBtn);

    item.addEventListener('click', () => window.open(link.url, '_blank', 'noopener'));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') window.open(link.url, '_blank', 'noopener');
    });

    return item;
  }

  function addLink() {
    const name = nameInput.value.trim();
    const url  = urlInput.value.trim();

    if (!name) { showError(errorEl, 'Nama tautan tidak boleh kosong.'); return; }
    if (!url)  { showError(errorEl, 'URL tidak boleh kosong.'); return; }

    // Basic URL validation
    try {
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      links.push({ id: uid(), name, url: parsed.href });
    } catch {
      showError(errorEl, 'URL tidak valid. Contoh: https://example.com'); return;
    }

    save();
    nameInput.value = '';
    urlInput.value  = '';
    hideError(errorEl);
    render();
  }

  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    save();
    render();
  }

  addBtn.addEventListener('click', addLink);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });
  nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') urlInput.focus(); });

  render();
})();
