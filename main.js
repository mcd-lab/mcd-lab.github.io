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
