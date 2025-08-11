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
  const mainDetail = document.getElementById('main-project');

  mainContainer.addEventListener('click', () => {
    // close any open other-projects
    document.querySelectorAll('.project-row.condensed').forEach(openRow => {
      openRow.classList.remove('condensed');
      document.getElementById(openRow.dataset.target).classList.remove('visible');
    });

    // toggle main project
    const isOpen = !mainDetail.classList.contains('visible');
    mainContainer.classList.toggle('condensed', isOpen);
    mainDetail.classList.toggle('visible', isOpen);
  });

  // Toggle Other Projects
  document.querySelectorAll('.project-row').forEach(row => {
    row.addEventListener('click', () => {
      // close main project if open
      mainDetail.classList.remove('visible');
      mainContainer.classList.remove('condensed');

      // close any other open projects
      document.querySelectorAll('.project-row.condensed').forEach(openRow => {
        openRow.classList.remove('condensed');
        document.getElementById(openRow.dataset.target).classList.remove('visible');
      });

      // now toggle this one
      const targetId = row.dataset.target;
      const detail = document.getElementById(targetId);
      const isOpen = !detail.classList.contains('visible');
      row.classList.toggle('condensed', isOpen);
      detail.classList.toggle('visible', isOpen);
    });
  });

  // Phone Popup Toggle 
  const phoneIcon = document.querySelector('.phone-icon');
  const phonePopup = phoneIcon.querySelector('.phone-popup');

  phoneIcon.addEventListener('click', () => {
    phonePopup.classList.toggle('visible');
  });
});
