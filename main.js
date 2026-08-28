const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.primary-nav');

const updateHeader = () => {
  if (!header || header.classList.contains('solid')) return;
  header.classList.toggle('scrolled', window.scrollY > 28);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (navToggle && navigation) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (!isOpen) navigation.scrollTop = 0;
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  navigation.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
    document.body.style.overflow = '';
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !navigation.classList.contains('open')) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
    document.body.style.overflow = '';
    navToggle.focus();
  });
}

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

const updates = Array.isArray(window.MCD_UPDATES)
  ? [...window.MCD_UPDATES]
      .filter((update) => update.id && update.date && update.category && update.title && update.url)
      .sort((a, b) => b.date.localeCompare(a.date))
  : [];

const getDateParts = (isoDate) => {
  const date = new Date(`${isoDate}T12:00:00`);
  return {
    day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date),
    year: String(date.getFullYear())
  };
};

const makeSafeId = (value) => value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');

const newsShowcase = document.querySelector('[data-news-showcase]');

if (newsShowcase) {
  const newsSection = newsShowcase.closest('.news-section');
  const tabList = newsSection.querySelector('[data-news-tabs]');
  const controls = newsSection.querySelector('.news-controls');
  const counter = newsSection.querySelector('[data-news-current]');
  const total = newsSection.querySelector('[data-news-total]');
  const toggle = newsSection.querySelector('[data-news-toggle]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const latestUpdates = updates.slice(0, 3);
  let currentIndex = 0;
  let timer;
  let isPaused = reduceMotion.matches;

  latestUpdates.forEach((update, index) => {
    const safeId = makeSafeId(update.id);
    const date = getDateParts(update.date);
    const panelId = `news-panel-${safeId}`;
    const tabId = `news-tab-${safeId}`;

    const panel = document.createElement('article');
    panel.className = 'news-card';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.dataset.newsPanel = '';
    panel.hidden = index !== 0;

    const time = document.createElement('time');
    time.className = 'news-date';
    time.dateTime = update.date;
    const day = document.createElement('strong');
    day.textContent = date.day;
    const month = document.createElement('span');
    month.textContent = date.month;
    const year = document.createElement('small');
    year.textContent = date.year;
    time.append(day, month, year);

    const copy = document.createElement('div');
    copy.className = 'news-card-copy';
    const category = document.createElement('p');
    category.textContent = update.category;
    const title = document.createElement('h3');
    title.textContent = update.title;
    copy.append(category, title);

    const link = document.createElement('a');
    link.className = 'news-link';
    link.href = update.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `View “${update.title}” on ${update.source || 'the source website'}`);
    const arrow = document.createElement('b');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(arrow);

    panel.append(time, copy, link);
    newsShowcase.append(panel);

    const tab = document.createElement('button');
    tab.className = `news-tab${index === 0 ? ' active' : ''}`;
    tab.type = 'button';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(index === 0));
    tab.setAttribute('aria-controls', panelId);
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.dataset.newsTab = String(index);
    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const label = document.createElement('small');
    label.textContent = update.tabLabel || update.title;
    tab.append(number, label);
    tabList.append(tab);
  });

  if (!latestUpdates.length) {
    const empty = document.createElement('p');
    empty.className = 'news-empty';
    empty.textContent = 'New lab updates will appear here.';
    newsShowcase.append(empty);
  } else {
    const tabs = [...tabList.querySelectorAll('[data-news-tab]')];
    const panels = [...newsShowcase.querySelectorAll('[data-news-panel]')];
    tabList.style.setProperty('--news-tab-count', String(tabs.length));
    controls.hidden = tabs.length < 2;
    if (total) total.textContent = String(tabs.length).padStart(2, '0');

    const showNews = (index) => {
      currentIndex = (index + panels.length) % panels.length;

      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === currentIndex;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== currentIndex;
      });

      if (counter) counter.textContent = String(currentIndex + 1).padStart(2, '0');
    };

    const stopRotation = () => window.clearInterval(timer);
    const startRotation = () => {
      stopRotation();
      if (isPaused || document.hidden || panels.length < 2) return;
      timer = window.setInterval(() => showNews(currentIndex + 1), 6500);
    };

    const updateToggle = () => {
      if (!toggle) return;
      toggle.textContent = isPaused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-label', `${isPaused ? 'Start' : 'Pause'} automatic news rotation`);
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        showNews(index);
        startRotation();
      });

      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + tabs.length) % tabs.length;
        showNews(nextIndex);
        tabs[nextIndex].focus();
        startRotation();
      });
    });

    toggle?.addEventListener('click', () => {
      isPaused = !isPaused;
      updateToggle();
      startRotation();
    });

    newsShowcase.addEventListener('mouseenter', stopRotation);
    newsShowcase.addEventListener('mouseleave', startRotation);
    newsShowcase.addEventListener('focusin', stopRotation);
    newsShowcase.addEventListener('focusout', (event) => {
      if (!newsShowcase.contains(event.relatedTarget)) startRotation();
    });
    document.addEventListener('visibilitychange', startRotation);

    reduceMotion.addEventListener('change', (event) => {
      isPaused = event.matches;
      updateToggle();
      startRotation();
    });

    updateToggle();
    showNews(0);
    startRotation();
  }
}

const updatesList = document.querySelector('[data-updates-list]');

if (updatesList) {
  const filters = document.querySelector('[data-updates-filters]');
  const count = document.querySelector('[data-updates-count]');
  const categories = ['All', ...new Set(updates.map((update) => update.category))];
  let activeCategory = 'All';

  const renderArchive = () => {
    const visibleUpdates = activeCategory === 'All'
      ? updates
      : updates.filter((update) => update.category === activeCategory);
    const years = new Map();

    visibleUpdates.forEach((update) => {
      const year = update.date.slice(0, 4);
      if (!years.has(year)) years.set(year, []);
      years.get(year).push(update);
    });

    updatesList.replaceChildren();
    const fragment = document.createDocumentFragment();

    years.forEach((yearUpdates, year) => {
      const section = document.createElement('section');
      section.className = 'updates-year';
      const heading = document.createElement('h2');
      heading.textContent = year;
      const items = document.createElement('div');
      items.className = 'updates-list';

      yearUpdates.forEach((update) => {
        const date = getDateParts(update.date);
        const article = document.createElement('article');
        article.className = 'updates-item';
        const time = document.createElement('time');
        time.dateTime = update.date;
        time.innerText = `${date.day} ${date.month}`;
        const copy = document.createElement('div');
        const meta = document.createElement('p');
        meta.textContent = `${update.category} · ${update.source || 'MCD Lab'}`;
        const title = document.createElement('h3');
        title.textContent = update.title;
        copy.append(meta, title);
        const link = document.createElement('a');
        link.href = update.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'View post ↗';
        link.setAttribute('aria-label', `View “${update.title}” on ${update.source || 'the source website'}`);
        article.append(time, copy, link);
        items.append(article);
      });

      section.append(heading, items);
      fragment.append(section);
    });

    if (!visibleUpdates.length) {
      const empty = document.createElement('p');
      empty.className = 'updates-empty';
      empty.textContent = 'No updates match this category.';
      fragment.append(empty);
    }

    updatesList.append(fragment);
    if (count) count.textContent = `${visibleUpdates.length} update${visibleUpdates.length === 1 ? '' : 's'}`;
  };

  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category;
    button.className = index === 0 ? 'active' : '';
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      activeCategory = category;
      [...filters.children].forEach((filter) => {
        const isActive = filter === button;
        filter.classList.toggle('active', isActive);
        filter.setAttribute('aria-pressed', String(isActive));
      });
      renderArchive();
    });
    filters.append(button);
  });

  renderArchive();
}
