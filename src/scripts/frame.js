// === Setup ===
const canvas = document.getElementById('decorated-strip');
const ctx = canvas.getContext('2d');

let frameIndex = 0;
const frames = [
  'assets/frames/frame1.png',
  'assets/frames/frame2.png',
  'assets/frames/frame3.png',
];


// === Load photo strip from sessionStorage ===
let photoStrip = new Image();
const imageData = sessionStorage.getItem('photoStripData');
photoStrip.src = imageData;

// === Load frame ===
let frameImage = new Image();
frameImage.src = frames[frameIndex];

// === Draw everything ===
// function redraw() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   if (photoStrip.complete && photoStrip.naturalWidth !== 0) {
//     ctx.drawImage(photoStrip, 0, 0, canvas.width, canvas.height);
//   }

//   if (frameImage.complete && frameImage.naturalWidth !== 0) {
//     ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
//   }

//   stickers.forEach(s => {
//     ctx.font = "40px serif";
//     ctx.fillText(s.emoji, s.x, s.y);
//   });
// }
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔄 1. Draw frame background first (acts like base)
  if (frameImage.complete && frameImage.naturalWidth !== 0) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }

  // 🔄 2. Draw the user's photo strip on top
  if (photoStrip.complete && photoStrip.naturalWidth !== 0) {
    ctx.drawImage(photoStrip, 0, 0, canvas.width, canvas.height);
  }

  // 🔄 3. Draw stickers on top of everything
  stickers.forEach(s => {
    ctx.font = "40px serif";
    ctx.fillText(s.emoji, s.x, s.y);
  });
}

photoStrip.onload = redraw;
frameImage.onload = redraw;

// === Frame Navigation Buttons ===
document.getElementById('prev-frame').onclick = () => {
  frameIndex = (frameIndex - 1 + frames.length) % frames.length;
  frameImage.src = frames[frameIndex];
};

document.getElementById('next-frame').onclick = () => {
  frameIndex = (frameIndex + 1) % frames.length;
  frameImage.src = frames[frameIndex];
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

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    const size = 40;
    if (x >= s.x && x <= s.x + size && y >= s.y - size && y <= s.y) {
      draggingSticker = s;
      offsetX = x - s.x;
      offsetY = y - s.y;
      break;
    }
  }
});
canvas.addEventListener('mouseup', (e) => {
  if (draggingSticker) {
    const binRect = binArea.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // If dropped in bin
    if (
      x >= binRect.left && x <= binRect.right &&
      y >= binRect.top && y <= binRect.bottom
    ) {
      const index = stickers.indexOf(draggingSticker);
      if (index !== -1) stickers.splice(index, 1);
    }

    draggingSticker = null;
    binArea.classList.remove('bin-hover');
    redraw();
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (draggingSticker) {
    const rect = canvas.getBoundingClientRect();
    draggingSticker.x = e.clientX - rect.left - offsetX;
    draggingSticker.y = e.clientY - rect.top - offsetY;
    redraw();
  }
});
canvas.addEventListener('dblclick', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    const size = 40;

    // Check if double click is within sticker bounds
    if (x >= s.x && x <= s.x + size && y >= s.y - size && y <= s.y) {
      stickers.splice(i, 1); // remove sticker
      redraw();
      break;
    }
  }
});

canvas.addEventListener('mouseup', () => draggingSticker = null);
canvas.addEventListener('mouseleave', () => draggingSticker = null);

// == Bin

const binArea = document.querySelector('.bin-area');
canvas.addEventListener('mouseup', (e) => {
  if (draggingSticker) {
    const rect = canvas.getBoundingClientRect();
    const binRect = binArea.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // If dropped in bin
    if (
      x >= binRect.left && x <= binRect.right &&
      y >= binRect.top && y <= binRect.bottom
    ) {
      const index = stickers.indexOf(draggingSticker);
      if (index !== -1) stickers.splice(index, 1);
    }

    draggingSticker = null;
    binArea.classList.remove('bin-hover');
    redraw();
  }
});

// Download
document.getElementById('download-btn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'decorated-photo-strip.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
