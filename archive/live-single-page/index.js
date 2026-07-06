document.addEventListener('DOMContentLoaded', () => {
  const switchInput = document.getElementById('mySwitch');

  // D/L Toggle Listener
  switchInput.addEventListener('click', () => {
    document.body.classList.toggle('light');
  });

  // Toggle Main Project
  const mainContainer = document.querySelector('.main-project-container');
  const mainDetail = document.getElementById('main-project');

  mainContainer.addEventListener('click', () => {
    // close other projects if any are open
    document.querySelectorAll('.project-row.condensed').forEach(openRow => {
      openRow.classList.remove('condensed');
      document.getElementById(openRow.dataset.target).classList.remove('visible');
    });

    // toggle main project
    const isOpen = mainDetail.classList.contains('visible');
    mainDetail.classList.toggle('visible', !isOpen);
    mainContainer.classList.toggle('condensed', !isOpen);
  });

  // Toggle Other Projects
  document.querySelectorAll('.project-row').forEach(row => {
    row.addEventListener('click', () => {
      const targetId = row.dataset.target;
      const detail = document.getElementById(targetId);
      const isOpen = detail.classList.contains('visible');

      // close main project if open
      mainDetail.classList.remove('visible');
      mainContainer.classList.remove('condensed');

      // close all other project rows
      document.querySelectorAll('.project-row.condensed').forEach(openRow => {
        openRow.classList.remove('condensed');
        document.getElementById(openRow.dataset.target).classList.remove('visible');
      });

      // toggle clicked row if it was closed
      if (!isOpen) {
        row.classList.add('condensed');
        detail.classList.add('visible');
      }
    });
  });

  // Phone Popup Toggle 
  const phoneIcon = document.querySelector('.phone-icon');
  const phonePopup = phoneIcon.querySelector('.phone-popup');

  phoneIcon.addEventListener('click', () => {
    phonePopup.classList.toggle('visible');
  });

  const carousels = document.querySelectorAll('.project-carousel');

  carousels.forEach((carousel) => {
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    const onPointerDown = (e) => {
      // left click / primary pointer only
      if (e.button !== undefined && e.button !== 0) return;
      isDown = true;
      carousel.classList.add('dragging');
      startX = e.clientX;
      scrollStart = carousel.scrollLeft;
      carousel.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      carousel.scrollLeft = scrollStart - dx;
      e.preventDefault();
    };

    const endDrag = (e) => {
      if (!isDown) return;
      isDown = false;
      carousel.classList.remove('dragging');
      carousel.releasePointerCapture?.(e.pointerId);
    };

    // use pointer movements for cross platform
    carousel.addEventListener('pointerdown', onPointerDown);
    carousel.addEventListener('pointermove', onPointerMove);
    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', endDrag);
    carousel.addEventListener('pointerleave', endDrag);
  });
});
