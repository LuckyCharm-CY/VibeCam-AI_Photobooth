const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const stripCanvas = document.getElementById('photo-strip');
const stripCtx = stripCanvas.getContext('2d');

const snap = document.getElementById('snap');
const download = document.getElementById('download');
const countdown = document.getElementById('countdown');
const shutterSound = document.getElementById('shutter-sound');

const toggleButtons = document.querySelectorAll('.toggle-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const filterPanel = document.getElementById('filters-panel');

let photos = [];

// Start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => console.error("Camera error:", err));

// Countdown then take photo
snap.addEventListener('click', () => {
  photos = []; // reset any previous session
  autoCaptureSequence(3); // Capture 3 photos automatically
});

function autoCaptureSequence(totalPhotos) {
  let current = 0;

  function takeNext() {
    if (current >= totalPhotos) {
    createPhotoStrip();
    video.style.display = 'none'; // Hides the camera
    download.style.display = 'inline-block';
      return;
    }

    startCountdown(async () => {
      await capturePhoto();
      current++;
      setTimeout(takeNext, 1000); // short pause before next photo
    });
  }

  takeNext();
}

// Capture one photo (with Promise to wait before next)
function capturePhoto() {
  return new Promise(resolve => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL('image/jpeg');
    photos.push(dataURL);

    shutterSound.play();
    triggerFlash();

    // Wait until flash is complete (400ms) before continuing
    setTimeout(resolve, 500);
  });
}


// Countdown overlay
function startCountdown(callback) {
  let count = 3;
  countdown.innerText = count;
  countdown.style.display = 'block';

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.innerText = count;
    } else {
      clearInterval(interval);
      countdown.style.display = 'none';
      callback();
    }
  }, 1000);
}



// Flash effect
function triggerFlash() {
  const flash = document.createElement('div');
  flash.className = 'flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 400);
}

// Assemble vertical photo strip
function createPhotoStrip() {
  const width = 350;
  const height = 750;
  stripCanvas.width = width;
  stripCanvas.height = height;
  stripCanvas.style.display = 'block';

  photos.forEach((photo, index) => {
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      stripCtx.drawImage(img, 0, index * (height / 3), width, height / 3);
    };
  });

  // Download button
  download.onclick = () => {
    const link = document.createElement('a');
    link.download = 'photo_strip.jpg';
    link.href = stripCanvas.toDataURL('image/jpeg');
    link.click();
  };
}

// Filter logic
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const selected = btn.dataset.filter;
    video.className = '';
    if (selected !== 'none') {
      video.classList.add(`filter-${selected}`);
    }
  });
});

// Toggle panels (only filters panel for now)
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const section = btn.dataset.section;
    filterPanel.style.display = (section === "filters") ? "block" : "none";
    // You can add logic here to toggle frames, stickers, etc.
  });
});
