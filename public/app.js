const API_URL = '/api';
let token = localStorage.getItem('token');
let currentUser = null;

// --- Утилиты ---
function showMessage(text, isError = false) {
  const msg = document.getElementById('global-message');
  msg.textContent = text;
  msg.className = `message ${isError ? 'error' : 'success'}`;
  setTimeout(() => { msg.className = 'message'; }, 4000);
}

async function apiCall(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка запроса');
  return data;
}

// --- Авторизация ---
function initAuth() {
  document.getElementById('tab-login').onclick = () => switchAuthTab('login');
  document.getElementById('tab-register').onclick = () => switchAuthTab('register');

  document.getElementById('form-login').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('login-email').value,
          password: document.getElementById('login-password').value
        })
      });
      token = data.data.token;
      localStorage.setItem('token', token);
      showScreen('main');
      loadUser();
    } catch (err) { showMessage(err.message, true); }
  };

  document.getElementById('form-register').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('register-name').value,
          email: document.getElementById('register-email').value,
          password: document.getElementById('register-password').value
        })
      });
      showMessage('Регистрация успешна! Войдите.');
      switchAuthTab('login');
    } catch (err) { showMessage(err.message, true); }
  };
}

function switchAuthTab(type) {
  document.getElementById('tab-login').classList.toggle('active', type === 'login');
  document.getElementById('tab-register').classList.toggle('active', type === 'register');
  document.getElementById('form-login').classList.toggle('hidden', type !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', type !== 'register');
}

function showScreen(screen) {
  if (screen === 'auth') {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('main-screen').classList.remove('active');
  } else {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
  }
}

// --- Профиль ---
async function loadUser() {
  try {
    const data = await apiCall('/auth/me');
    currentUser = data.data.user;
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role;
    
    // Показываем форму создания хакатона только для ADMIN
    document.getElementById('hackathon-create-form').classList.toggle('hidden', currentUser.role !== 'ADMIN');
    
    loadHackathons();
  } catch (err) {
    logout();
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  showScreen('auth');
}

// --- Хакатоны ---
async function loadHackathons() {
  try {
    const data = await apiCall('/hackathons');
    const container = document.getElementById('hackathons-list');
    container.innerHTML = '';
    
    // Заполняем селект для лидерборда
    const select = document.getElementById('leaderboard-hackathon-select');
    select.innerHTML = '<option value="">-- Выберите хакатон --</option>';
    
    if (data.data.hackathons.length === 0) {
      container.innerHTML = '<p>Хакатонов пока нет.</p>';
      return;
    }

    data.data.hackathons.forEach(h => {
      // Добавляем в селект
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = h.title;
      select.appendChild(opt);

      // Карточка хакатона
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <h4>${h.title}</h4>
        <div class="meta">
          <span>Тема: ${h.theme}</span>
          <span>Статус: <b>${h.status}</b></span>
        </div>
        <div class="meta">
          <span>Начало: ${new Date(h.startDate).toLocaleDateString()}</span>
          <span>Конец: ${new Date(h.endDate).toLocaleDateString()}</span>
        </div>
        <div class="actions">
          ${currentUser.role === 'ADMIN' ? `<button class="btn btn-sm btn-primary" onclick="changeStatus('${h.id}', 'ONGOING')">Начать</button>` : ''}
          ${currentUser.role === 'ADMIN' ? `<button class="btn btn-sm btn-danger" onclick="changeStatus('${h.id}', 'FINISHED')">Завершить</button>` : ''}
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) { showMessage(err.message, true); }
}

async function changeStatus(id, status) {
  try {
    await apiCall(`/hackathons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showMessage('Статус обновлён');
    loadHackathons();
  } catch (err) { showMessage(err.message, true); }
}

// --- Инициализация формы создания хакатона ---
document.getElementById('form-create-hackathon').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await apiCall('/hackathons', {
      method: 'POST',
      body: JSON.stringify({
        title: document.getElementById('hack-title').value,
        theme: document.getElementById('hack-theme').value,
        startDate: new Date(document.getElementById('hack-start').value).toISOString(),
        endDate: new Date(document.getElementById('hack-end').value).toISOString()
      })
    });
    showMessage('Хакатон создан');
    loadHackathons();
  } catch (err) { showMessage(err.message, true); }
};

// --- Лидерборд ---
document.getElementById('btn-load-leaderboard').onclick = async () => {
  const hackathonId = document.getElementById('leaderboard-hackathon-select').value;
  if (!hackathonId) return showMessage('Выберите хакатон', true);
  
  try {
    const data = await apiCall(`/hackathons/${hackathonId}/leaderboard`);
    const container = document.getElementById('leaderboard-list');
    container.innerHTML = '';
    
    if (data.data.leaderboard.length === 0) {
      container.innerHTML = '<p>Нет данных для отображения.</p>';
      return;
    }

    data.data.leaderboard.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <h4>#${index + 1} ${item.projectTitle} (${item.teamName})</h4>
        <p><b>Итоговый балл: ${item.totalScore}</b></p>
        <div style="font-size: 0.875rem; margin-top: 0.5rem;">
          ${item.criteriaBreakdown.map(c => `
            <div style="margin-bottom: 0.25rem;">
              ${c.criterionName}: ${c.averageScore} / ${c.maxScore} (судей: ${c.judgesCount})
            </div>
          `).join('')}
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) { showMessage(err.message, true); }
};

// --- Навигация по вкладкам ---
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    
    if (btn.dataset.tab === 'leaderboard') loadHackathons(); // обновляем селект
  };
});

// --- Запуск ---
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    showScreen('main');
    loadUser();
  } else {
    showScreen('auth');
  }
  initAuth();
  document.getElementById('btn-logout').onclick = logout;
});