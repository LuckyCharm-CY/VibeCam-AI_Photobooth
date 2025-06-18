// === Setup ===
const canvas = document.getElementById('decorated-strip');
const ctx = canvas.getContext('2d');

let frameIndex = 0;
const frames = [
  'assets/frames/frame1.png',
  'assets/frames/frame2.png',
  'assets/frames/frame3.png',
'assets/frames/frame4.png',
'assets/frames/frame5.png'


];

// === Load photo strip from sessionStorage ===
let photoStrip = new Image();

const imageData = sessionStorage.getItem('photoStripData');

if (imageData) {
  photoStrip.src = imageData;
  photoStrip.onload = redraw;
} else {
  console.warn('No photoStripData found in sessionStorage!');
}

photoStrip.src = imageData;
photoStrip.onload = redraw;

// === Load frame ===
let frameImage = new Image();
frameImage.src = frames[frameIndex];
frameImage.onload = redraw;

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1️⃣ Draw the PHOTO STRIP as the background
  if (photoStrip.complete && photoStrip.naturalWidth !== 0) {
    ctx.drawImage(photoStrip, 0, 0, canvas.width, canvas.height);
  }

  // 2️⃣ Draw the FRAME on top (must have transparency!)
  if (frameImage.complete && frameImage.naturalWidth !== 0) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }

  // 3️⃣ Draw STICKERS on top
  stickers.forEach(s => {
    ctx.font = "40px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.emoji, s.x, s.y);
  });
}

// === Update Frame Helper ===
function updateFrame(index) {
  frameImage.onload = redraw;
  frameImage.src = frames[index];
}

// === Frame Navigation Buttons ===
document.getElementById('prev-frame').onclick = () => {
  frameIndex = (frameIndex - 1 + frames.length) % frames.length;
  updateFrame(frameIndex);
};

document.getElementById('next-frame').onclick = () => {
  frameIndex = (frameIndex + 1) % frames.length;
  updateFrame(frameIndex);
};

// === Stickers Logic ===
const stickers = [];
let draggingSticker = null;
let offsetX = 0;
let offsetY = 0;

document.querySelectorAll('.sticker-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const emoji = btn.textContent;
    const x = 100 + Math.random() * 100;
    const y = 100 + Math.random() * 500;
    stickers.push({ emoji, x, y });
    redraw();
  });
});



canvas.addEventListener('mousemove', (e) => {
  if (draggingSticker) {
    const rect = canvas.getBoundingClientRect();
    draggingSticker.x = e.clientX - rect.left - offsetX;
    draggingSticker.y = e.clientY - rect.top - offsetY;
    redraw();
  }
});

document.addEventListener('mouseup', (e) => {
  if (draggingSticker) {
    const binRect = binArea.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x >= binRect.left && x <= binRect.right &&
      y >= binRect.top && y <= binRect.bottom
    ) {
      const index = stickers.indexOf(draggingSticker);
      if (index !== -1) stickers.splice(index, 1);
    }

    draggingSticker = null;
    canvas.style.cursor = 'default';
    binArea.classList.remove('bin-hover');
    redraw();
  }
});
// DRAGGING
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    const size = 40;

    // Centered hitbox
    if (
      x >= s.x - size / 2 && x <= s.x + size / 2 &&
      y >= s.y - size / 2 && y <= s.y + size / 2
    ) {
      draggingSticker = s;
      offsetX = x - s.x;
      offsetY = y - s.y;
      canvas.style.cursor = 'grabbing';
      break;
    }
  }
});

// DOUBLE-CLICK DELETE
canvas.addEventListener('dblclick', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    const size = 40;

    if (
      x >= s.x - size / 2 && x <= s.x + size / 2 &&
      y >= s.y - size / 2 && y <= s.y + size / 2
    ) {
      stickers.splice(i, 1);
      redraw();
      break;
    }
  }
});
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (!draggingSticker) {
    // Try to pick up a sticker
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      const size = 40;
      if (
        x >= s.x - size / 2 && x <= s.x + size / 2 &&
        y >= s.y - size / 2 && y <= s.y + size / 2
      ) {
        draggingSticker = s;
        offsetX = x - s.x;
        offsetY = y - s.y;
        canvas.style.cursor = 'grabbing';
        return;
      }
    }
  } else {
    // Drop the sticker where clicked
    draggingSticker.x = x - offsetX;
    draggingSticker.y = y - offsetY;
    draggingSticker = null;
    canvas.style.cursor = 'default';
    redraw();
  }
});


canvas.addEventListener('mouseleave', () => {
  if (draggingSticker) {
    draggingSticker = null;
    canvas.style.cursor = 'default';
    redraw();
  }
});

// === Download Logic ===
document.getElementById('download-btn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'decorated-photo-strip.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
