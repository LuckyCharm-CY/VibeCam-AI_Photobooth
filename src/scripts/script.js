const video = document.getElementById('video');
const snap = document.getElementById('snap');
const download = document.getElementById('download');
const canvas = document.getElementById('canvas');
const stripCanvas = document.getElementById('photo-strip');
const ctx = canvas.getContext('2d');
const stripCtx = stripCanvas.getContext('2d');
const countdown = document.getElementById('countdown');

let photos = []; // store 3 snapshots

const buttons = document.querySelectorAll('.toggle-btn');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Toggle active class
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const section = btn.dataset.section;
    console.log("Switched to section:", section);
    // TODO: show the section content (e.g., filters UI)
  });
});

const filterPanel = document.getElementById('filters-panel');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const filterButtons = document.querySelectorAll('.filter-btn');

// Show filters when Filters tab is clicked
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;

    // Show only filters-panel for now
    filterPanel.style.display = (section === "filters") ? "block" : "none";
  });
});

// Apply filter to live video
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const selected = btn.dataset.filter;
    video.className = ''; // remove any previous filter
    if (selected !== "none") {
      video.classList.add(`filter-${selected}`);
    }
  });
});

// Start video stream
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

// Utility to capture one photo
function capturePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  document.getElementById('shutter-sound').play();
    const flash = document.createElement('div');
    flash.className = 'flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

  photos.push(canvas.toDataURL('image/jpeg'));
}

// Countdown and capture 3 photos
snap.addEventListener('click', () => {
  snap.disabled = true;
  photos = []; // reset photos

  let photoIndex = 0;

  function takeNextPhoto() {
  if (photoIndex < 3) {
    let count = 3;
    countdown.innerText = count;
    countdown.style.display = 'block'; // Show countdown

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdown.innerText = count;
      } else {
        clearInterval(interval);
        countdown.innerText = '';
        countdown.style.display = 'none'; // Hide it after snap
        capturePhoto();
        photoIndex++;
        takeNextPhoto(); // continue to next photo
      }
    }, 1000);
  } else {
    createPhotoStrip();
    download.style.display = 'inline-block';
    snap.disabled = false;
  }
}


  takeNextPhoto(); // start countdown for first photo
});

// Create vertical photo strip
function createPhotoStrip() {
  const width = 300;
  const height = 700;
  stripCanvas.style.display = 'block';
  stripCanvas.width = width;
  stripCanvas.height = height;

  photos.forEach((photo, index) => {
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      stripCtx.drawImage(img, 0, index * height / 3, width, height / 3);
    };
  });

  download.onclick = () => {
    const link = document.createElement('a');
    link.download = 'photo_strip.jpg';
    link.href = stripCanvas.toDataURL('image/jpeg');
    link.click();
  };
  video.style.display = 'none';

}
