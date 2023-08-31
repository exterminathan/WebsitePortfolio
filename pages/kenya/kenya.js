let modal = document.getElementById("modal");
let modalImg = document.getElementById("modal-image");
let slideIndex;

function openModal(imgElement) {
  modal.style.display = "block";
  modalImg.src = imgElement.src;
  slideIndex = Array.from(imgElement.parentNode.children).indexOf(imgElement);

  document.body.classList.add('modal-open');
  modal.style.display = 'block';
}

function closeModal() {
  document.body.classList.remove('modal-open');
  modal.style.display = "none";

}

function changeSlide(direction) {
  let images = Array.from(document.getElementsByClassName("grid-container")[0].children);
  slideIndex += direction;

  if (slideIndex >= images.length) {
    slideIndex = 0;
  } else if (slideIndex < 0) {
    slideIndex = images.length - 1;
  }

  let imgElement = images[slideIndex];
  modalImg.src = imgElement.src;
}

function createImageElement(src, alt) {
  let img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.onclick = () => openModal(img);
  return img;
}

function loadImages() {
  fetch("photos/kenya/kenya.json")
    .then((response) => response.json())
    .then((data) => {
      let imageGrid = document.getElementById("image-grid");

      data.images.forEach((imagePath) => {
        let imageElement = createImageElement(imagePath, imagePath);
        imageGrid.appendChild(imageElement);
      });
    })
    .catch((error) => console.error("Error fetching images:", error));
}

loadImages(); // Call the loadImages function to fetch and display images


document.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const scrollPosition = window.scrollY;

    if (scrollPosition > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

