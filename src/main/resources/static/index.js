/* ── Topic data ── */
const topics = [
    {
        id: 'lens',
        title: 'Построение изображений в линзе',
        description: "Created by Павлов Владислав, Хисамутдинова Алёна",
        gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
        glowColor: 'rgba(168,85,247,0.3)',
        url: '/lens',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2C7 7 7 17 12 22C17 17 17 7 12 2Z"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke-width="0.7" stroke-dasharray="4 4"/>
        </svg>`,
    },
    {
        id: 'waves',
        title: 'Сила Архимеда',
        description: 'Created by Рыжков Евгений, Клипин Константин',
        gradient: 'linear-gradient(135deg, #22c55e, #14b8a6)',
        glowColor: 'rgba(34,197,94,0.3)',
        url: '/archimed',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        </svg>`,
    },
    {
        id: 'thermodynamics',
        title: 'Изотермический процесс',
        description: 'Created by Мамуркова Ирина, Полещук Анастасия',
        gradient: 'linear-gradient(135deg, #ef4444, #f43f5e)',
        glowColor: 'rgba(239,68,68,0.3)',
        url: '/lab',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
        </svg>`,
    },
    {
        id: 'optics',
        title: 'Закон Снеллиуса',
        description: 'Created by Безверхний Данила, Токарев Максим',
        gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        glowColor: 'rgba(6,182,212,0.3)',
        url: '/snellius',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>`,
    },
];

/* ── Render cards ── */
const grid = document.getElementById('topics-grid');

topics.forEach(topic => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', topic.title);

    card.innerHTML = `
        <div class="card-glow" style="background:${topic.gradient};"></div>
        <div class="card-icon" style="background:${topic.gradient}; box-shadow: 0 8px 24px ${topic.glowColor};">
          ${topic.icon}
        </div>
        <div class="card-body">
          <div class="card-title">${topic.title}</div>
          <div class="card-desc">${topic.description}</div>
        </div>
        <div class="card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      `;

    card.addEventListener('click', () => {
        if (topic.url && topic.url !== '#') {
            window.location.href = topic.url;
        } else {
            alert('Этот проект еще в разработке!');
        }
    });
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (topic.url && topic.url !== '#') {
                window.location.href = topic.url;
            } else {
                alert('Этот проект еще в разработке!');
            }
        }
    });

    grid.appendChild(card);
});
