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
const stickersPanel = document.getElementById('stickers-panel');
const templatesPanel = document.getElementById('templates-panel');

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

    // Dynamically get computed CSS filter from video element
    const tempDiv = document.createElement('div');
    tempDiv.className = video.className;
    document.body.appendChild(tempDiv);
    const computedStyle = getComputedStyle(tempDiv);
    ctx.filter = computedStyle.filter;
    document.body.removeChild(tempDiv);

    ctx.drawImage(video, 0, 0);
    ctx.filter = 'none'; // reset

    const dataURL = canvas.toDataURL('image/jpeg');
    photos.push(dataURL);

    shutterSound.play();
    triggerFlash();

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
// function createPhotoStrip() {
//   const width = 350;
//   const height = 750;
//   stripCanvas.width = width;
//   stripCanvas.height = height;
//   stripCanvas.style.display = 'block';

//   // Clear the canvas before drawing
//   stripCtx.clearRect(0, 0, width, height);

//   let loaded = 0;
//   photos.forEach((photo, index) => {
//     const img = new Image();
//     img.src = photo;

//     img.onload = () => {
//       stripCtx.drawImage(img, 0, index * (height / 3), width, height / 3);
//       loaded++;

//       if (loaded === photos.length) {
//         console.log("✅ All photos drawn");
//         download.style.display = 'inline-block';
//       }
//     };

//     img.onerror = () => {
//       console.error("❌ Image failed to load:", photo);
//     };
//   });

//   // Reveal sticker/template buttons only now
//   document.querySelector('[data-section="filters"]').style.display = 'none';
//   document.querySelector('[data-section="templates"]').style.display = 'inline-block';
//   document.querySelector('[data-section="stickers"]').style.display = 'inline-block';
// }

function createPhotoStrip() {
  const width = 350;
  const height = 750;
  stripCanvas.width = width;
  stripCanvas.height = height;
  stripCanvas.style.display = 'block';

  // Draw the strip
  redrawStrip();

  // Hide filter panel, show options
  document.querySelector('[data-section="filters"]').style.display = 'none';

  // Show Done / Retake buttons
  const controls = document.querySelector('.controls');
  controls.innerHTML = `
    <button id="done">✅ Done</button>
    <button id="retake">🔁 Retake</button>
  `;

  document.getElementById('done').onclick = () => {
    const photoData = stripCanvas.toDataURL('image/png');
    localStorage.setItem('stripImage', photoData);  // Save photo for next page
    window.location.href = 'decorate.html';
  };

  document.getElementById('retake').onclick = () => {
    photos = [];
    stickers = [];
    video.style.display = 'block';
    stripCanvas.style.display = 'none';
    document.querySelector('.controls').innerHTML = `<button id="snap">📸 Take Photo</button>`;
    document.getElementById('snap').addEventListener('click', () => {
      autoCaptureSequence(3);
    });
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

    // Hide all panels
    filterPanel.style.display = 'none';
    stickersPanel.style.display = 'none';
    templatesPanel.style.display = 'none';

    // Show only the selected panel
    if (section === "filters") filterPanel.style.display = 'block';
    if (section === "stickers") stickersPanel.style.display = 'block';
    if (section === "templates") templatesPanel.style.display = 'block';
  });
});


// stickers drag and drop
let stickers = [];
let draggingSticker = null;
let offsetX = 0;
let offsetY = 0;

document.querySelectorAll('.sticker-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const emoji = btn.textContent;
    const x = 100 + Math.random() * 150;
    const y = 100 + Math.random() * 500;

    stickers.push({ emoji, x, y });
    redrawStrip();
  });
});
function redrawStrip() {
  stripCtx.clearRect(0, 0, stripCanvas.width, stripCanvas.height); // Clear first

  const drawImages = photos.map((photo, index) => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = photo;
      img.onload = () => {
        stripCtx.drawImage(
          img,
          0,
          index * (stripCanvas.height / 3),
          stripCanvas.width,
          stripCanvas.height / 3
        );
        resolve();
      };
    });
  });

  // After all photos are drawn, draw stickers
  Promise.all(drawImages).then(() => {
    stickers.forEach(sticker => {
      stripCtx.font = "40px serif";
      stripCtx.fillText(sticker.emoji, sticker.x, sticker.y);
    });
  });
}

stripCanvas.addEventListener('mousedown', (e) => {
  const rect = stripCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = stickers.length - 1; i >= 0; i--) {
    const sticker = stickers[i];
    const textWidth = 40;
    const textHeight = 40;

    if (x >= sticker.x && x <= sticker.x + textWidth && y >= sticker.y - textHeight && y <= sticker.y) {
      draggingSticker = sticker;
      offsetX = x - sticker.x;
      offsetY = y - sticker.y;
      break;
    }
  }
});

stripCanvas.addEventListener('mousemove', (e) => {
  if (draggingSticker) {
    const rect = stripCanvas.getBoundingClientRect();
    draggingSticker.x = e.clientX - rect.left - offsetX;
    draggingSticker.y = e.clientY - rect.top - offsetY;
    redrawStrip();
  }
});

stripCanvas.addEventListener('mouseup', () => {
  draggingSticker = null;
});

stripCanvas.addEventListener('mouseleave', () => {
  draggingSticker = null;
});
