document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('modeToggle');

  // Init Dark/Light Toggle 
  toggleButton.textContent = '🌙';

  // D/L Toggle Listener
  toggleButton.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    toggleButton.textContent = isLight ? '☀️' : '🌙';
  });

  // Toggle Main Project
  const mainContainer = document.querySelector('.main-project-container');
  const mainDetail    = document.getElementById('main-project');
  mainContainer.addEventListener('click', () => {
    mainDetail.classList.toggle('visible');
  });

  // Toggle Other Projects
  document.querySelectorAll('.project-row').forEach(row => {
    row.addEventListener('click', () => {
      const detail = document.getElementById(row.dataset.target);
      detail.classList.toggle('visible');
    });
  });

  // Phone Popup Toggle 
    const phoneIcon = document.querySelector('.phone-icon');
    const phonePopup = phoneIcon.querySelector('.phone-popup');

    phoneIcon.addEventListener('click', () => {
    phonePopup.classList.toggle('visible');
    });

});



