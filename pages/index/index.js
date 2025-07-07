document.addEventListener('DOMContentLoaded', () => {
  const switchInput = document.getElementById('mySwitch');

  // Init Dark/Light Toggle 
  //toggleButton.textContent = '🌙';

  // D/L Toggle Listener
  switchInput.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    //toggleButton.textContent = isLight ? '☀️' : '🌙';
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
      const targetId = row.dataset.target;
      const detail    = document.getElementById(targetId);
      const isOpen    = !detail.classList.contains('visible');

      // Close all open rows/details
      document.querySelectorAll('.project-row.condensed').forEach(openRow => {
        openRow.classList.remove('condensed');
        document
          .getElementById(openRow.dataset.target)
          .classList.remove('visible');
      });

      // If the clicked one was closed, open it
      if (isOpen) {
        detail.classList.add('visible');
        row.classList.add('condensed');
      }
    });
  });
  
  // Phone Popup Toggle 
    const phoneIcon = document.querySelector('.phone-icon');
    const phonePopup = phoneIcon.querySelector('.phone-popup');

    phoneIcon.addEventListener('click', () => {
    phonePopup.classList.toggle('visible');
    });

});



