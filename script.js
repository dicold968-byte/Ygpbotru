// === КОНФИГУРАЦИЯ ===
const ADMIN_TOKEN = 'e-learning-su-admin-rooot';
// ⚠️ ЗАМЕНИТЕ НА СВОЙ TELEGRAM BOT TOKEN И CHAT ID
const TELEGRAM_BOT_TOKEN = '8214413367:AAFPFIvPbIDHnPi5c-9mU49zuoDkJ-ejStA';
const TELEGRAM_CHAT_ID = '7814388821';

// ⚠️ ЗАМЕНИТЕ НА ССЫЛКУ НА ВАШУ GOOGLE ТАБЛИЦУ В ФОРМАТЕ CSV
const CSV_URL = 'https://drive.google.com/uc?export=download&id=1-0V_KEsbzyLmS_OYUQX5B4gAmh8oxax3';

// === Инициализация частиц ===
particlesJS.load('particles-js', 'particlesjs-config.json');

// === Загрузка сайта ===
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
      if (localStorage.getItem('isAdmin') === 'true') {
        showAdminPanel();
      } else {
        document.getElementById('main').classList.remove('hidden');
      }
    }, 600);
  }, 1800);
});

// === Отправка заявки ===
document.getElementById('castingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    fullname: document.getElementById('fullname').value,
    age: document.getElementById('age').value,
    city_uni: document.getElementById('city_uni').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    experience: document.getElementById('experience').value || '—',
    links: document.getElementById('links').value || '—',
    motivation: document.getElementById('motivation').value,
    character: document.getElementById('character').value || '—'
  };

  const message = `
🎬 Новая заявка на кастинг в «Универ. Глазами Подростка»!

👤 ФИО: ${data.fullname}
🎂 Возраст: ${data.age}
🏙 Город/Универ: ${data.city_uni}
📱 Телефон: ${data.phone}
📧 Email: ${data.email}
🎭 Опыт: ${data.experience}
🔗 Ссылки: ${data.links}
💬 Почему? ${data.motivation}
🎭 Типаж: ${data.character}
  `.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
    });

    if (res.ok) {
      showMessage('✅ Заявка успешно отправлена! Мы свяжемся с вами.', 'success');
      document.getElementById('castingForm').reset();
    } else {
      throw new Error('Ошибка Telegram API');
    }
  } catch (err) {
    console.error(err);
    showMessage('❌ Не удалось отправить заявку. Попробуйте позже.', 'error');
  }
});

// === Админка ===
document.getElementById('goToAdmin').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('main').classList.add('hidden');
  document.getElementById('adminLogin').classList.remove('hidden');
});

document.getElementById('loginBtn').addEventListener('click', () => {
  const token = document.getElementById('adminToken').value;
  const errorEl = document.getElementById('loginError');
  if (token === ADMIN_TOKEN) {
    localStorage.setItem('isAdmin', 'true');
    showAdminPanel();
  } else {
    errorEl.textContent = 'Неверный токен!';
    errorEl.classList.remove('hidden');
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('isAdmin');
  location.reload();
});

function showAdminPanel() {
  document.getElementById('adminLogin').classList.add('hidden');
  document.getElementById('main').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  loadSubmissions();
}

async function loadSubmissions() {
  const el = document.getElementById('submissionsList');
  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL);
    const csv = await res.text();
    const lines = csv.trim().split('\n').slice(1);

    if (!lines.length || (lines.length === 1 && !lines[0].trim())) {
      el.innerHTML = '<p style="color: #ff69b4;">Нет заявок</p>';
      return;
    }

    let html = '<div style="text-align: left; max-height: 500px; overflow-y: auto; padding: 10px;">';
    lines.forEach(line => {
      const cells = line.split(',').map(cell => 
        cell.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
      );
      const [date, fullname, age, city_uni, phone, email, experience, links, motivation, character] = cells;
      html += `
        <div style="border: 1px solid #ff69b4; border-radius: 10px; padding: 15px; margin-bottom: 15px; background: rgba(20, 5, 25, 0.6);">
          <strong>📅 Дата:</strong> ${date || '—'}<br>
          <strong>👤 ФИО:</strong> ${fullname || '—'}<br>
          <strong>🎂 Возраст:</strong> ${age || '—'}<br>
          <strong>🏙 Город/Универ:</strong> ${city_uni || '—'}<br>
          <strong>📱 Телефон:</strong> ${phone || '—'}<br>
          <strong>📧 Email:</strong> ${email || '—'}<br>
          <strong>🎭 Опыт:</strong> ${experience || '—'}<br>
          <strong>🔗 Ссылки:</strong> ${links || '—'}<br>
          <strong>💬 Мотивация:</strong> ${motivation || '—'}<br>
          <strong>🎭 Типаж:</strong> ${character || '—'}
        </div>
      `;
    });
    html += '</div>';
    el.innerHTML = html;
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    el.innerHTML = '<p style="color: #ff4d94;">❌ Не удалось загрузить заявки</p>';
  }
}

function showMessage(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = type;
  el.classList.remove('hidden');
}