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

// --- Команды ---
async function loadTeamsHackathons() {
  try {
    const data = await apiCall('/hackathons');
    const select = document.getElementById('teams-hackathon-select');
    select.innerHTML = '<option value="">-- Выберите хакатон --</option>';
    data.data.hackathons.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = h.title;
      select.appendChild(opt);
    });
  } catch (err) { showMessage(err.message, true); }
}

document.getElementById('teams-hackathon-select').onchange = () => {
  const hackathonId = document.getElementById('teams-hackathon-select').value;
  document.getElementById('team-create-form').classList.toggle('hidden', !hackathonId);
  if (hackathonId) loadTeams(hackathonId);
};

document.getElementById('btn-load-teams').onclick = () => {
  const hackathonId = document.getElementById('teams-hackathon-select').value;
  if (hackathonId) loadTeams(hackathonId);
};

async function loadTeams(hackathonId) {
  try {
    const data = await apiCall(`/hackathons/${hackathonId}/teams`);
    const container = document.getElementById('teams-list');
    container.innerHTML = '';
    if (data.data.teams.length === 0) {
      container.innerHTML = '<p>В этом хакатоне пока нет команд.</p>';
      return;
    }
    data.data.teams.forEach(t => {
      const div = document.createElement('div');
      div.className = 'item-card';
      const membersStr = t.members.map(m => `${m.user.name} (${m.status})`).join(', ');
      div.innerHTML = `
        <h4>${t.name}</h4>
        <div class="meta"><span>Участники: ${membersStr}</span></div>
        <div class="actions">
          ${currentUser.role === 'ADMIN' || t.captainId === currentUser.id ? 
            `<button class="btn btn-sm btn-primary" onclick="inviteToTeam('${t.id}')">Пригласить</button>` : ''}
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) { showMessage(err.message, true); }
}

document.getElementById('form-create-team').onsubmit = async (e) => {
  e.preventDefault();
  const hackathonId = document.getElementById('teams-hackathon-select').value;
  if (!hackathonId) return;
  try {
    await apiCall(`/hackathons/${hackathonId}/teams`, {
      method: 'POST',
      body: JSON.stringify({ name: document.getElementById('team-name').value })
    });
    showMessage('Команда создана');
    loadTeams(hackathonId);
  } catch (err) { showMessage(err.message, true); }
};

// Приглашение
async function inviteToTeam(teamId) {
  const email = prompt('Введите email участника для приглашения:');
  if (!email) return;
  try {
    await apiCall(`/teams/${teamId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    showMessage('Приглашение отправлено');
  } catch (err) { showMessage(err.message, true); }
}

// --- Проекты ---
async function loadProjectsTeams() {
  try {
    const data = await apiCall('/hackathons'); 
    if (data.data.hackathons.length === 0) return;
    const firstHackathonId = data.data.hackathons[0].id;
    
    // Выбор команды хакатона
    const teamsData = await apiCall(`/hackathons/${firstHackathonId}/teams`);
    const select = document.getElementById('projects-team-select');
    select.innerHTML = '<option value="">-- Выберите команду --</option>';
    teamsData.data.teams.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      select.appendChild(opt);
    });
  } catch (err) { /* игнорируем */ }
}

document.getElementById('projects-team-select').onchange = () => {
  const teamId = document.getElementById('projects-team-select').value;
  document.getElementById('project-create-form').classList.toggle('hidden', !teamId);
  if (teamId) loadProject(teamId);
};

document.getElementById('btn-load-projects').onclick = () => {
  const teamId = document.getElementById('projects-team-select').value;
  if (teamId) loadProject(teamId);
};

async function loadProject(teamId) {
  try {
    const data = await apiCall(`/teams/${teamId}`); 
    const container = document.getElementById('projects-list');
    container.innerHTML = '';
    if (!data.data.team.project) {
      container.innerHTML = '<p>У этой команды еще нет проекта.</p>';
      return;
    }
    const p = data.data.team.project;
    container.innerHTML = `
      <div class="item-card">
        <h4>${p.title}</h4>
        <p>${p.description}</p>
        <div class="meta"><a href="${p.repoUrl}" target="_blank">Репозиторий</a></div>
      </div>
    `;
  } catch (err) { showMessage(err.message, true); }
}

document.getElementById('form-create-project').onsubmit = async (e) => {
  e.preventDefault();
  const teamId = document.getElementById('projects-team-select').value;
  if (!teamId) return;
  try {
    await apiCall(`/teams/${teamId}/project`, {
      method: 'POST',
      body: JSON.stringify({
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        repoUrl: document.getElementById('project-repo').value
      })
    });
    showMessage('Проект отправлен');
    loadProject(teamId);
  } catch (err) { showMessage(err.message, true); }
};

// Инициализация вкладок
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'teams') loadTeamsHackathons();
    if (btn.dataset.tab === 'projects') loadProjectsTeams();
  });
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

// --- Приглашения ---
async function loadInvitations() {
  try {
    const data = await apiCall('/invitations');
    const container = document.getElementById('invitations-list');
    container.innerHTML = '';
    
    if (data.data.invitations.length === 0) {
      container.innerHTML = '<p>У вас нет входящих приглашений.</p>';
      return;
    }
    
    data.data.invitations.forEach(inv => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.innerHTML = `
        <h4>Приглашение в команду "${inv.team.name}"</h4>
        <div class="actions">
          <button class="btn btn-sm btn-success" onclick="acceptInvite('${inv.id}')">Принять</button>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) { showMessage(err.message, true); }
}

async function acceptInvite(memberId) {
  try {
    await apiCall(`/invitations/${memberId}/accept`, { method: 'POST' });
    showMessage('Приглашение принято!');
    loadInvitations();
  } catch (err) { showMessage(err.message, true); }
}

document.getElementById('btn-load-invitations').onclick = loadInvitations;

// При переключении на вкладку приглашений — загружаем их
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'invitations') loadInvitations();
  });
});