// ============================================
// SpriteManager.js — Pixel Art Characters
// Birthday Quest RPG · Café Theme
//
// Perubahan dari versi sebelumnya:
//   - drawCat(ctx, x, y, isNearby): pixel art kucing duduk
//   - drawHamster(ctx, x, y, isNearby): pixel art hamster chubby
//   - drawAnimalNPC(ctx, x, y, type, isNearby): dispatcher
// ============================================

// ============================================
// STATE
// ============================================

let frameCounter = 0;
export let playerDirection = 'down';
export let playerMoving = false;

export function tickSprites() {
  frameCounter++;
}

export function setPlayerDirection(dir, moving) {
  playerDirection = dir;
  playerMoving = moving;
}

// ============================================
// PIXEL HELPER
// ============================================
const PX = 2;

function px(ctx, x, y, color, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * PX, h * PX);
}

// ============================================
// BARISTA PLAYER PALETTE
// ============================================
const PLAYER_C = {
  skin: '#F5C5A3',
  skinShade: '#E0A07C',
  skinDark: '#C07850',
  skinRosy: '#F0A898',
  hair: '#3D2010',
  hairHi: '#6A3820',
  hairMid: '#502A14',
  hairBun: '#3D2010',
  eye: '#1A0800',
  eyeWhite: '#FFF5EE',
  eyeShine: '#FFFFFF',
  eyeLash: '#1A0800',
  shirt: '#C0828A',
  shirtHi: '#D49AA0',
  shirtShad: '#906068',
  apron: '#F0EDE8',
  apronHi: '#FFFFFF',
  apronShad: '#D8D0C8',
  apronLine: '#C0B8B0',
  apronStr: '#B8B0A8',
  skirt: '#4A3020',
  skirtHi: '#5E3E28',
  skirtShad: '#342010',
  shoes: '#281808',
  shoesHi: '#3A2410',
  headband: '#E85870',
  shadow: 'rgba(60,30,0,0.25)',
};

// ============================================
// PLAYER DRAW FUNCTIONS (tidak berubah)
// ============================================

function drawPlayerDown(ctx, ox, oy, isMoving) {
  const C = PLAYER_C;
  const t = Math.floor(frameCounter / 8) % 2;
  const bob = isMoving ? (t === 0 ? 0 : -1) : 0;
  const py = oy + bob;

  ctx.fillStyle = C.shadow;
  ctx.fillRect(ox + 4, oy + 26, 16, 3);

  if (isMoving && t === 0) {
    px(ctx, ox + 6, py + 21, C.skirt, 2, 2);
    px(ctx, ox + 14, py + 21, C.skirt, 2, 1);
    px(ctx, ox + 5, py + 23, C.shoes, 4, 2);
    px(ctx, ox + 14, py + 22, C.shoes, 3, 2);
    px(ctx, ox + 5, py + 23, C.shoesHi, 2, 1);
  } else if (isMoving) {
    px(ctx, ox + 6, py + 21, C.skirt, 2, 1);
    px(ctx, ox + 14, py + 21, C.skirt, 2, 2);
    px(ctx, ox + 6, py + 22, C.shoes, 3, 2);
    px(ctx, ox + 14, py + 23, C.shoes, 4, 2);
    px(ctx, ox + 14, py + 23, C.shoesHi, 2, 1);
  } else {
    px(ctx, ox + 5, py + 23, C.shoes, 4, 2);
    px(ctx, ox + 13, py + 23, C.shoes, 4, 2);
    px(ctx, ox + 5, py + 23, C.shoesHi, 2, 1);
    px(ctx, ox + 13, py + 23, C.shoesHi, 2, 1);
  }

  px(ctx, ox + 5, py + 18, C.skirt, 14, 5);
  px(ctx, ox + 5, py + 18, C.skirtHi, 14, 1);
  px(ctx, ox + 5, py + 18, C.skirtHi, 1, 5);
  px(ctx, ox + 18, py + 18, C.skirtShad, 1, 5);

  px(ctx, ox + 7, py + 18, C.apron, 10, 5);
  px(ctx, ox + 7, py + 18, C.apronHi, 10, 1);
  px(ctx, ox + 7, py + 22, C.apronLine, 10, 1);
  px(ctx, ox + 7, py + 18, C.apronStr, 1, 4);
  px(ctx, ox + 16, py + 18, C.apronStr, 1, 4);

  if (isMoving && t === 0) {
    px(ctx, ox + 2, py + 13, C.shirt, 2, 5);
    px(ctx, ox + 20, py + 15, C.shirt, 2, 3);
    px(ctx, ox + 2, py + 18, C.skin, 2, 2);
    px(ctx, ox + 20, py + 18, C.skin, 2, 2);
  } else if (isMoving) {
    px(ctx, ox + 2, py + 15, C.shirt, 2, 3);
    px(ctx, ox + 20, py + 13, C.shirt, 2, 5);
    px(ctx, ox + 2, py + 18, C.skin, 2, 2);
    px(ctx, ox + 20, py + 18, C.skin, 2, 2);
  } else {
    px(ctx, ox + 2, py + 14, C.shirt, 2, 4);
    px(ctx, ox + 20, py + 14, C.shirt, 2, 4);
    px(ctx, ox + 2, py + 18, C.skin, 2, 2);
    px(ctx, ox + 20, py + 18, C.skin, 2, 2);
  }

  px(ctx, ox + 4, py + 11, C.shirtShad, 16, 1);
  px(ctx, ox + 4, py + 12, C.shirt, 16, 7);
  px(ctx, ox + 4, py + 12, C.shirtHi, 16, 2);
  px(ctx, ox + 4, py + 12, C.shirtHi, 2, 7);
  px(ctx, ox + 18, py + 12, C.shirtShad, 2, 7);
  px(ctx, ox + 7, py + 12, C.apron, 10, 6);
  px(ctx, ox + 7, py + 12, C.apronHi, 10, 1);
  px(ctx, ox + 7, py + 12, C.apronHi, 1, 6);
  px(ctx, ox + 16, py + 12, C.apronShad, 1, 6);
  px(ctx, ox + 7, py + 17, C.apronLine, 10, 1);
  px(ctx, ox + 10, py + 11, C.apronStr, 1, 2);
  px(ctx, ox + 13, py + 11, C.apronStr, 1, 2);

  px(ctx, ox + 10, py + 9, C.skin, 4, 3);
  px(ctx, ox + 10, py + 9, C.skinShade, 1, 3);

  px(ctx, ox + 6, py + 2, C.skin, 12, 7);
  px(ctx, ox + 6, py + 1, C.hair, 12, 1);
  px(ctx, ox + 5, py + 2, C.hair, 1, 7);
  px(ctx, ox + 18, py + 2, C.hair, 1, 7);
  px(ctx, ox + 6, py + 9, C.hair, 1, 1);
  px(ctx, ox + 17, py + 9, C.hair, 1, 1);
  px(ctx, ox + 6, py + 6, C.skinRosy, 2, 1);
  px(ctx, ox + 16, py + 6, C.skinRosy, 2, 1);
  px(ctx, ox + 6, py + 2, C.skinShade, 1, 7);
  px(ctx, ox + 6, py + 1, C.hair, 12, 4);
  px(ctx, ox + 6, py + 1, C.hairHi, 6, 1);
  px(ctx, ox + 5, py + 2, C.hairMid, 2, 5);
  px(ctx, ox + 17, py + 2, C.hairMid, 2, 5);
  px(ctx, ox + 7, py + 4, C.hair, 3, 2);
  px(ctx, ox + 7, py + 4, C.hairHi, 1, 1);
  px(ctx, ox + 10, py + 0, C.hairBun, 4, 2);
  px(ctx, ox + 10, py + 0, C.hairHi, 2, 1);
  px(ctx, ox + 7, py + 3, C.headband, 10, 1);
  px(ctx, ox + 7, py + 3, '#FF8090', 4, 1);

  px(ctx, ox + 8, py + 6, C.eyeWhite, 3, 2);
  px(ctx, ox + 8, py + 6, C.eye, 2, 2);
  px(ctx, ox + 9, py + 6, C.eyeShine, 1, 1);
  px(ctx, ox + 8, py + 5, C.eyeLash, 3, 1);
  px(ctx, ox + 13, py + 6, C.eyeWhite, 3, 2);
  px(ctx, ox + 14, py + 6, C.eye, 2, 2);
  px(ctx, ox + 14, py + 6, C.eyeShine, 1, 1);
  px(ctx, ox + 13, py + 5, C.eyeLash, 3, 1);
  px(ctx, ox + 11, py + 7, C.skinDark ?? C.skinShade, 2, 1);
  px(ctx, ox + 9, py + 8, C.skinShade, 1, 1);
  px(ctx, ox + 14, py + 8, C.skinShade, 1, 1);
  px(ctx, ox + 10, py + 8, '#CC8870', 4, 1);
}

function drawPlayerUp(ctx, ox, oy, isMoving) {
  const C = PLAYER_C;
  const t = Math.floor(frameCounter / 8) % 2;
  const bob = isMoving ? (t === 0 ? 0 : -1) : 0;
  const py = oy + bob;

  ctx.fillStyle = C.shadow;
  ctx.fillRect(ox + 4, oy + 26, 16, 3);

  if (isMoving && t === 0) {
    px(ctx, ox + 6, py + 21, C.skirt, 2, 2);
    px(ctx, ox + 14, py + 21, C.skirt, 2, 1);
    px(ctx, ox + 5, py + 23, C.shoes, 4, 2);
    px(ctx, ox + 13, py + 22, C.shoes, 4, 2);
  } else if (isMoving) {
    px(ctx, ox + 6, py + 21, C.skirt, 2, 1);
    px(ctx, ox + 14, py + 21, C.skirt, 2, 2);
    px(ctx, ox + 5, py + 22, C.shoes, 4, 2);
    px(ctx, ox + 13, py + 23, C.shoes, 4, 2);
  } else {
    px(ctx, ox + 5, py + 23, C.shoes, 4, 2);
    px(ctx, ox + 13, py + 23, C.shoes, 4, 2);
  }

  px(ctx, ox + 5, py + 18, C.skirt, 14, 5);
  px(ctx, ox + 5, py + 18, C.skirtHi, 14, 1);
  px(ctx, ox + 7, py + 18, C.apronStr, 2, 5);
  px(ctx, ox + 15, py + 18, C.apronStr, 2, 5);
  px(ctx, ox + 10, py + 18, C.apron, 4, 3);
  px(ctx, ox + 9, py + 18, C.apronStr, 1, 3);
  px(ctx, ox + 14, py + 18, C.apronStr, 1, 3);
  px(ctx, ox + 10, py + 19, C.apronHi, 4, 1);
  px(ctx, ox + 2, py + 14, C.shirt, 2, 5);
  px(ctx, ox + 20, py + 14, C.shirt, 2, 5);
  px(ctx, ox + 4, py + 12, C.shirt, 16, 7);
  px(ctx, ox + 4, py + 12, C.shirtHi, 2, 7);
  px(ctx, ox + 18, py + 12, C.shirtShad, 2, 7);
  px(ctx, ox + 7, py + 12, C.apronShad, 10, 6);
  px(ctx, ox + 7, py + 12, C.apron, 8, 1);
  px(ctx, ox + 10, py + 9, C.skin, 4, 3);
  px(ctx, ox + 6, py + 1, C.hair, 12, 1);
  px(ctx, ox + 5, py + 2, C.hair, 1, 7);
  px(ctx, ox + 18, py + 2, C.hair, 1, 7);
  px(ctx, ox + 6, py + 2, C.hair, 12, 8);
  px(ctx, ox + 6, py + 2, C.hairHi, 6, 1);
  px(ctx, ox + 9, py + 0, C.hairBun, 6, 3);
  px(ctx, ox + 9, py + 0, C.hairHi, 3, 1);
  px(ctx, ox + 9, py + 2, C.headband, 6, 1);
  px(ctx, ox + 8, py + 7, C.skin, 8, 2);
}

function drawPlayerSide(ctx, ox, oy, isMoving, facingRight) {
  const C = PLAYER_C;
  const t = Math.floor(frameCounter / 8) % 2;
  const bob = isMoving ? (t === 0 ? 0 : -1) : 0;
  const py = oy + bob;

  const fx = (localX) => (facingRight ? ox + localX : ox + 24 - localX - PX);

  ctx.fillStyle = C.shadow;
  ctx.fillRect(ox + 4, oy + 26, 16, 3);

  if (isMoving && t === 0) {
    ctx.fillStyle = C.skirt;
    ctx.fillRect(fx(6), py + 21, PX * 2, PX * 2);
    ctx.fillStyle = C.shoes;
    ctx.fillRect(fx(4), py + 23, PX * 5, PX * 2);
    ctx.fillRect(fx(10), py + 21, PX * 4, PX * 2);
  } else if (isMoving) {
    ctx.fillStyle = C.skirt;
    ctx.fillRect(fx(10), py + 21, PX * 2, PX * 2);
    ctx.fillStyle = C.shoes;
    ctx.fillRect(fx(4), py + 21, PX * 4, PX * 2);
    ctx.fillRect(fx(10), py + 23, PX * 5, PX * 2);
  } else {
    ctx.fillStyle = C.shoes;
    ctx.fillRect(fx(5), py + 23, PX * 4, PX * 2);
    ctx.fillRect(fx(10), py + 23, PX * 4, PX * 2);
  }

  ctx.fillStyle = C.skirt;
  ctx.fillRect(ox + 4, py + 18, PX * 10, PX * 5);
  ctx.fillStyle = C.skirtHi;
  ctx.fillRect(facingRight ? ox + 4 : ox + 14, py + 18, PX * 2, PX * 5);
  ctx.fillStyle = C.apron;
  ctx.fillRect(facingRight ? ox + 5 : ox + 13, py + 12, PX * 4, PX * 11);
  ctx.fillStyle = C.apronLine;
  ctx.fillRect(facingRight ? ox + 9 : ox + 13, py + 17, PX * 1, PX * 1);
  ctx.fillStyle = C.shirt;
  if (isMoving && t === 0) {
    ctx.fillRect(fx(3), py + 12, PX * 2, PX * 6);
    ctx.fillRect(fx(18), py + 14, PX * 2, PX * 4);
  } else if (isMoving) {
    ctx.fillRect(fx(3), py + 14, PX * 2, PX * 4);
    ctx.fillRect(fx(18), py + 12, PX * 2, PX * 6);
  } else {
    ctx.fillRect(fx(3), py + 13, PX * 2, PX * 5);
    ctx.fillRect(fx(18), py + 13, PX * 2, PX * 5);
  }
  ctx.fillStyle = C.skin;
  ctx.fillRect(fx(3), py + 18, PX * 2, PX * 2);
  ctx.fillStyle = C.shirt;
  ctx.fillRect(ox + 4, py + 12, PX * 10, PX * 7);
  ctx.fillStyle = C.shirtHi;
  ctx.fillRect(facingRight ? ox + 4 : ox + 14, py + 12, PX * 2, PX * 7);
  ctx.fillStyle = C.shirtShad;
  ctx.fillRect(facingRight ? ox + 16 : ox + 4, py + 12, PX * 2, PX * 7);
  ctx.fillStyle = C.skin;
  ctx.fillRect(facingRight ? ox + 8 : ox + 10, py + 9, PX * 4, PX * 3);

  const hxB = facingRight ? ox + 4 : ox + 2;
  ctx.fillStyle = C.hair;
  ctx.fillRect(hxB, py + 1, PX * 6, PX * 8);
  ctx.fillStyle = C.hairHi;
  ctx.fillRect(hxB, py + 1, PX * 4, PX * 1);
  ctx.fillStyle = C.skin;
  ctx.fillRect(facingRight ? ox + 8 : ox + 6, py + 2, PX * 6, PX * 7);
  ctx.fillStyle = C.skinShade;
  ctx.fillRect(facingRight ? ox + 8 : ox + 12, py + 2, PX * 1, PX * 7);
  ctx.fillStyle = C.skinRosy;
  ctx.fillRect(facingRight ? ox + 12 : ox + 6, py + 6, PX * 2, PX * 1);
  ctx.fillStyle = C.hair;
  ctx.fillRect(facingRight ? ox + 12 : ox + 4, py + 1, PX * 2, PX * 5);
  ctx.fillRect(facingRight ? ox + 12 : ox + 4, py + 1, PX * 4, PX * 2);
  ctx.fillStyle = C.headband;
  ctx.fillRect(facingRight ? ox + 6 : ox + 6, py + 3, PX * 5, PX * 1);
  ctx.fillStyle = C.hairBun;
  ctx.fillRect(facingRight ? ox + 4 : ox + 12, py + 0, PX * 3, PX * 3);
  ctx.fillStyle = C.hairHi;
  ctx.fillRect(facingRight ? ox + 4 : ox + 13, py + 0, PX * 2, PX * 1);
  ctx.fillStyle = C.eyeWhite;
  ctx.fillRect(facingRight ? ox + 12 : ox + 6, py + 5, PX * 2, PX * 2);
  ctx.fillStyle = C.eye;
  ctx.fillRect(facingRight ? ox + 13 : ox + 6, py + 5, PX * 1, PX * 2);
  ctx.fillStyle = C.eyeShine;
  ctx.fillRect(facingRight ? ox + 13 : ox + 7, py + 5, PX * 1, PX * 1);
  ctx.fillStyle = C.eyeLash;
  ctx.fillRect(facingRight ? ox + 12 : ox + 6, py + 4, PX * 2, PX * 1);
  ctx.fillStyle = C.skinShade;
  ctx.fillRect(facingRight ? ox + 15 : ox + 4, py + 7, PX * 1, PX * 1);
  ctx.fillStyle = '#CC8870';
  ctx.fillRect(facingRight ? ox + 13 : ox + 5, py + 8, PX * 2, PX * 1);
}

export function drawPlayer(ctx, x, y, direction = 'down', isMoving = false) {
  ctx.imageSmoothingEnabled = false;
  switch (direction) {
    case 'up':
      drawPlayerUp(ctx, x, y, isMoving);
      break;
    case 'left':
      drawPlayerSide(ctx, x, y, isMoving, false);
      break;
    case 'right':
      drawPlayerSide(ctx, x, y, isMoving, true);
      break;
    default:
      drawPlayerDown(ctx, x, y, isMoving);
      break;
  }
}

// ============================================
// NPC PALETTES (tidak berubah)
// ============================================

const NPC_PALETTES = {
  '#E8A838': {
    shirt: '#E8A838',
    shirtHi: '#F0BC58',
    shirtShad: '#C08020',
    pants: '#5A3A10',
    hair: '#1A0A00',
    hairHi: '#3A1A00',
    hasApron: false,
    apronColor: null,
  },
  '#38C4E8': {
    shirt: '#38C4E8',
    shirtHi: '#58D4F8',
    shirtShad: '#2094B8',
    pants: '#103A50',
    hair: '#080818',
    hairHi: '#181830',
    hasApron: true,
    apronColor: '#F0EDE8',
  },
  '#E838A0': {
    shirt: '#E838A0',
    shirtHi: '#F858B8',
    shirtShad: '#B81878',
    pants: '#50103A',
    hair: '#180818',
    hairHi: '#300830',
    hasApron: false,
    apronColor: null,
  },
  '#5B8CFF': {
    shirt: '#5B8CFF',
    shirtHi: '#7AACFF',
    shirtShad: '#3A6AE0',
    pants: '#1A2A5A',
    hair: '#100810',
    hairHi: '#201820',
    hasApron: false,
    apronColor: null,
  },
  default: {
    shirt: '#888888',
    shirtHi: '#AAAAAA',
    shirtShad: '#555555',
    pants: '#333333',
    hair: '#1A1A1A',
    hairHi: '#2A2A2A',
    hasApron: false,
    apronColor: null,
  },
};

export function drawNPC(ctx, x, y, color, isNearby, isInteracted = false) {
  ctx.imageSmoothingEnabled = false;

  const C = NPC_PALETTES[color] ?? NPC_PALETTES.default;
  const bob = Math.floor(frameCounter / 40) % 2 === 0 ? 0 : -1;
  const py = y + bob;

  if (isInteracted) {
    ctx.globalAlpha = 0.75;
  }

  ctx.fillStyle = 'rgba(60,30,0,0.22)';
  ctx.fillRect(x + 4, y + 24, 16, 3);

  px(ctx, x + 6, py + 22, '#281808', 4, 2);
  px(ctx, x + 12, py + 22, '#281808', 4, 2);
  px(ctx, x + 6, py + 22, '#3A2410', 2, 1);
  px(ctx, x + 12, py + 22, '#3A2410', 2, 1);
  px(ctx, x + 6, py + 18, C.pants, 2, 4);
  px(ctx, x + 12, py + 18, C.pants, 2, 4);
  px(ctx, x + 2, py + 12, C.shirt, 2, 5);
  px(ctx, x + 20, py + 12, C.shirt, 2, 5);
  px(ctx, x + 2, py + 17, '#D4A574', 2, 2);
  px(ctx, x + 20, py + 17, '#D4A574', 2, 2);
  px(ctx, x + 4, py + 10, C.shirt, 16, 9);
  px(ctx, x + 4, py + 10, C.shirtHi, 2, 9);
  px(ctx, x + 18, py + 10, C.shirtShad, 2, 9);
  px(ctx, x + 4, py + 10, C.shirtHi, 16, 2);

  if (C.hasApron && C.apronColor) {
    px(ctx, x + 6, py + 10, C.apronColor, 12, 9);
    px(ctx, x + 6, py + 10, '#FFFFFF', 12, 1);
    px(ctx, x + 6, py + 10, '#FFFFFF', 1, 9);
    px(ctx, x + 17, py + 10, '#C0B8B0', 1, 9);
  }

  px(ctx, x + 9, py + 10, '#D4A574', 6, 2);
  px(ctx, x + 10, py + 7, '#D4A574', 4, 3);
  px(ctx, x + 6, py + 0, C.hair, 12, 1);
  px(ctx, x + 5, py + 1, C.hair, 1, 7);
  px(ctx, x + 18, py + 1, C.hair, 1, 7);
  px(ctx, x + 6, py + 1, '#D4A574', 12, 7);
  px(ctx, x + 6, py + 1, '#C49060', 1, 7);
  px(ctx, x + 6, py + 0, C.hair, 12, 3);
  px(ctx, x + 6, py + 0, C.hairHi, 5, 1);

  if (color === '#E8A838') {
    px(ctx, x + 16, py + 3, C.hair, 2, 5);
    px(ctx, x + 15, py + 7, C.hair, 3, 2);
    px(ctx, x + 5, py + 3, C.hair, 1, 3);
  } else if (color === '#38C4E8') {
    px(ctx, x + 8, py + 0, C.hair, 2, 2);
    px(ctx, x + 12, py + 0, C.hair, 2, 2);
    px(ctx, x + 10, py + 1, C.hair, 4, 1);
    px(ctx, x + 7, py + 3, '#70C0E8', 10, 1);
  } else if (color === '#5B8CFF') {
    // Arya — rambut pendek acak-acakan anak muda
    px(ctx, x + 7, py + 0, C.hair, 2, 3);
    px(ctx, x + 15, py + 0, C.hair, 2, 3);
    px(ctx, x + 11, py + 0, C.hair, 2, 2);
    px(ctx, x + 9, py + 1, C.hairHi, 2, 1);
    px(ctx, x + 5, py + 2, C.hair, 1, 4);
    px(ctx, x + 18, py + 2, C.hair, 1, 4);
  } else {
    px(ctx, x + 6, py + 3, C.hair, 4, 3);
    px(ctx, x + 6, py + 4, C.hair, 3, 4);
    px(ctx, x + 18, py + 3, C.hair, 1, 5);
  }

  px(ctx, x + 8, py + 4, '#FFFFFF', 3, 2);
  px(ctx, x + 9, py + 4, '#1A0800', 2, 2);
  px(ctx, x + 9, py + 4, '#FFFFFF', 1, 1);
  px(ctx, x + 8, py + 3, '#1A0800', 3, 1);
  px(ctx, x + 13, py + 4, '#FFFFFF', 3, 2);
  px(ctx, x + 14, py + 4, '#1A0800', 2, 2);
  px(ctx, x + 14, py + 4, '#FFFFFF', 1, 1);
  px(ctx, x + 13, py + 3, '#1A0800', 3, 1);
  px(ctx, x + 11, py + 6, '#C49060', 2, 1);
  px(ctx, x + 9, py + 7, '#8B5E3C', 6, 1);
  px(ctx, x + 9, py + 8, '#8B5E3C', 1, 1);
  px(ctx, x + 14, py + 8, '#8B5E3C', 1, 1);

  if (isNearby) {
    ctx.strokeStyle = 'rgba(255,200,100,0.90)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y - 2, 28, 32);
  }

  ctx.globalAlpha = 1;
}

// ============================================
// 🐱 KUCING PIXEL ART                                    ← BARU
//
// Sprite kucing duduk menghadap kamera, 24×28px.
// Warna: abu-abu belang oranye (kucing calico/tabby).
// Animasi: ekor bergoyang + mata berkedip.
// ============================================

const CAT_C = {
  body: '#D4B896', // bulu krem/putih
  bodyShad: '#B89870', // bayangan bulu
  stripe: '#C07030', // belang oranye
  stripeDk: '#904C10', // belang gelap
  nose: '#E87070', // hidung pink
  mouth: '#C05050',
  eye: '#2A8040', // mata hijau
  eyePup: '#0A1A0A', // pupil
  eyeShine: '#FFFFFF',
  ear: '#D4B896', // telinga luar
  earInner: '#F0A0A0', // telinga dalam pink
  whisker: 'rgba(80,60,40,0.7)',
  tail: '#C07030',
  tailTip: '#F0D0A0',
  shadow: 'rgba(40,60,0,0.25)',
};

function drawCat(ctx, x, y, isNearby) {
  ctx.imageSmoothingEnabled = false;
  const C = CAT_C;

  // Animasi: ekor goyang dan kedipan mata
  const t = Date.now();
  const tailSway = Math.sin(t / 600) * 3; // ekor kiri-kanan
  const blinkFrame = Math.floor(t / 3000) % 10 === 0; // kedip tiap 3 detik

  // Shadow
  ctx.fillStyle = C.shadow;
  ctx.fillRect(x + 3, y + 27, 18, 3);

  // ── EKOR ── (di belakang badan, digambar dulu)
  // Ekor melengkung ke kanan, ujung ke atas
  ctx.fillStyle = C.stripe;
  ctx.fillRect(x + 18, y + 18, 4, 2); // pangkal ekor
  ctx.fillRect(x + 20 + tailSway, y + 12, 4, 8); // batang ekor
  ctx.fillRect(x + 19 + tailSway, y + 10, 4, 3); // lengkungan
  ctx.fillRect(x + 17 + tailSway, y + 8, 4, 3); // ujung atas
  ctx.fillStyle = C.tailTip;
  ctx.fillRect(x + 17 + tailSway, y + 7, 4, 2); // ujung putih
  // Shadow ekor
  ctx.fillStyle = C.stripeDk;
  ctx.fillRect(x + 22 + tailSway, y + 12, 2, 8);

  // ── BADAN ──
  ctx.fillStyle = C.body;
  ctx.fillRect(x + 4, y + 14, 16, 12); // badan utama
  // Belang oranye di badan
  ctx.fillStyle = C.stripe;
  ctx.fillRect(x + 6, y + 14, 3, 10);
  ctx.fillRect(x + 12, y + 14, 3, 10);
  // Shadow sisi kanan badan
  ctx.fillStyle = C.bodyShad;
  ctx.fillRect(x + 18, y + 14, 2, 12);
  // Perut putih
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + 8, y + 17, 8, 8);
  // Highlight perut
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(x + 9, y + 18, 4, 3);

  // ── KAKI DEPAN ──
  ctx.fillStyle = C.body;
  ctx.fillRect(x + 5, y + 22, 5, 6); // kaki kiri
  ctx.fillRect(x + 14, y + 22, 5, 6); // kaki kanan
  // Cakar
  ctx.fillStyle = '#E8D8B8';
  ctx.fillRect(x + 5, y + 26, 5, 2);
  ctx.fillRect(x + 14, y + 26, 5, 2);
  // Garis cakar
  ctx.fillStyle = C.bodyShad;
  ctx.fillRect(x + 7, y + 27, 1, 1);
  ctx.fillRect(x + 16, y + 27, 1, 1);

  // ── KEPALA ──
  ctx.fillStyle = C.body;
  ctx.fillRect(x + 4, y + 4, 16, 12); // kepala
  // Belang di dahi
  ctx.fillStyle = C.stripe;
  ctx.fillRect(x + 9, y + 4, 2, 5);
  ctx.fillRect(x + 13, y + 4, 2, 4);
  ctx.fillStyle = C.stripeDk;
  ctx.fillRect(x + 7, y + 4, 1, 4);
  ctx.fillRect(x + 16, y + 4, 1, 3);
  // Shadow kepala
  ctx.fillStyle = C.bodyShad;
  ctx.fillRect(x + 4, y + 4, 1, 12);
  ctx.fillRect(x + 19, y + 4, 1, 12);

  // ── TELINGA ──
  // Telinga kiri
  ctx.fillStyle = C.ear;
  ctx.fillRect(x + 4, y + 1, 5, 5);
  ctx.fillRect(x + 5, y + 0, 3, 2);
  ctx.fillStyle = C.earInner;
  ctx.fillRect(x + 5, y + 2, 3, 3);
  ctx.fillRect(x + 6, y + 1, 2, 2);
  // Telinga kanan
  ctx.fillStyle = C.ear;
  ctx.fillRect(x + 15, y + 1, 5, 5);
  ctx.fillRect(x + 16, y + 0, 3, 2);
  ctx.fillStyle = C.earInner;
  ctx.fillRect(x + 16, y + 2, 3, 3);
  ctx.fillRect(x + 17, y + 1, 2, 2);

  // ── MATA ──
  if (blinkFrame) {
    // Mata tertutup (kedip)
    ctx.fillStyle = C.bodyShad;
    ctx.fillRect(x + 6, y + 8, 5, 1);
    ctx.fillRect(x + 13, y + 8, 5, 1);
  } else {
    // Mata terbuka
    ctx.fillStyle = C.eye;
    ctx.fillRect(x + 6, y + 7, 5, 4);
    ctx.fillRect(x + 13, y + 7, 5, 4);
    // Pupil
    ctx.fillStyle = C.eyePup;
    ctx.fillRect(x + 8, y + 7, 2, 4);
    ctx.fillRect(x + 15, y + 7, 2, 4);
    // Shine
    ctx.fillStyle = C.eyeShine;
    ctx.fillRect(x + 8, y + 7, 1, 1);
    ctx.fillRect(x + 15, y + 7, 1, 1);
    // Bulu mata atas
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(x + 6, y + 6, 5, 1);
    ctx.fillRect(x + 13, y + 6, 5, 1);
  }

  // ── HIDUNG & MULUT ──
  ctx.fillStyle = C.nose;
  ctx.fillRect(x + 10, y + 11, 4, 2);
  ctx.fillStyle = C.mouth;
  ctx.fillRect(x + 9, y + 13, 2, 1); // kiri
  ctx.fillRect(x + 13, y + 13, 2, 1); // kanan
  ctx.fillRect(x + 11, y + 13, 2, 1); // tengah bawah

  // ── KUMIS ──
  ctx.strokeStyle = C.whisker;
  ctx.lineWidth = 0.8;
  // Kumis kiri
  ctx.beginPath();
  ctx.moveTo(x + 9, y + 11);
  ctx.lineTo(x + 1, y + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 9, y + 12);
  ctx.lineTo(x + 1, y + 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 9, y + 12);
  ctx.lineTo(x + 2, y + 15);
  ctx.stroke();
  // Kumis kanan
  ctx.beginPath();
  ctx.moveTo(x + 15, y + 11);
  ctx.lineTo(x + 23, y + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 15, y + 12);
  ctx.lineTo(x + 23, y + 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 15, y + 12);
  ctx.lineTo(x + 22, y + 15);
  ctx.stroke();

  // ── HIGHLIGHT ring saat nearby ──
  if (isNearby) {
    ctx.strokeStyle = 'rgba(255,220,80,0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 3, y - 2, 30, 32);
  }
}

// ============================================
// 🐹 HAMSTER PIXEL ART                                   ← BARU
//
// Sprite hamster chubby, 22×20px.
// Warna: krem / putih dengan pipi chubby oranye.
// Animasi: pipi mengembang (makan), kaki berlari.
// ============================================

const HAM_C = {
  body: '#E8D0A0', // bulu krem hangat
  bodyShad: '#C8A870',
  belly: '#F8F0E0', // perut putih
  cheek: '#F0A060', // pipi chubby oranye
  cheekHi: '#F8C090',
  ear: '#E89080', // telinga merah muda
  earIn: '#F0B0A0',
  eye: '#0A0A0A', // mata hitam bulat
  eyeShine: '#FFFFFF',
  nose: '#E06070',
  mouth: '#C04050',
  paw: '#E8C090',
  pawClaw: '#C09060',
  shadow: 'rgba(40,30,0,0.2)',
};

function drawHamster(ctx, x, y, isNearby) {
  ctx.imageSmoothingEnabled = false;
  const C = HAM_C;

  // Animasi: kaki berlari + pernapasan perut
  const t = Date.now();
  const runF = Math.floor(t / 200) % 2; // kaki bergantian
  const puff = Math.sin(t / 800) * 1.2; // pipi kembang-kempis

  // Shadow
  ctx.fillStyle = C.shadow;
  ctx.fillRect(x + 2, y + 19, 18, 3);

  // ── KAKI ──
  ctx.fillStyle = C.paw;
  if (runF === 0) {
    // Frame A
    ctx.fillRect(x + 4, y + 15, 5, 4); // kaki kiri bawah
    ctx.fillRect(x + 13, y + 13, 5, 4); // kaki kanan atas
  } else {
    // Frame B
    ctx.fillRect(x + 4, y + 13, 5, 4); // kaki kiri atas
    ctx.fillRect(x + 13, y + 15, 5, 4); // kaki kanan bawah
  }
  // Cakar kecil
  ctx.fillStyle = C.pawClaw;
  ctx.fillRect(x + 5, y + 18, 3, 1);
  ctx.fillRect(x + 14, y + 18, 3, 1);

  // ── BADAN BULAT ──
  ctx.fillStyle = C.body;
  ctx.fillRect(x + 2, y + 6, 18, 12); // badan utama
  ctx.fillRect(x + 4, y + 4, 14, 14); // bikin lebih bulat
  ctx.fillRect(x + 3, y + 5, 16, 14);
  // Shadow badan
  ctx.fillStyle = C.bodyShad;
  ctx.fillRect(x + 18, y + 6, 2, 12);
  ctx.fillRect(x + 2, y + 17, 18, 1);
  // Perut putih
  ctx.fillStyle = C.belly;
  ctx.fillRect(x + 7, y + 10, 8, 8);
  ctx.fillRect(x + 6, y + 12, 10, 6);

  // ── PIPI CHUBBY ── (ciri khas hamster)
  // Pipi kiri
  ctx.fillStyle = C.cheek;
  ctx.fillRect(x + 1, y + 7, 5 + puff, 6);
  ctx.fillStyle = C.cheekHi;
  ctx.fillRect(x + 2, y + 8, 3 + puff, 2);
  // Pipi kanan
  ctx.fillStyle = C.cheek;
  ctx.fillRect(x + 16 - puff, y + 7, 5 + puff, 6);
  ctx.fillStyle = C.cheekHi;
  ctx.fillRect(x + 17 - puff, y + 8, 3 + puff, 2);

  // ── KEPALA ──
  ctx.fillStyle = C.body;
  ctx.fillRect(x + 5, y + 0, 12, 8); // kepala
  ctx.fillRect(x + 4, y + 1, 14, 7);
  ctx.fillStyle = C.bodyShad;
  ctx.fillRect(x + 5, y + 0, 1, 8);
  ctx.fillRect(x + 16, y + 0, 1, 8);

  // ── TELINGA BULAT ──
  ctx.fillStyle = C.ear;
  ctx.fillRect(x + 5, y + 0, 4, 3);
  ctx.fillRect(x + 6, y + 0, 2, 4); // lebih bulat
  ctx.fillRect(x + 13, y + 0, 4, 3);
  ctx.fillRect(x + 13, y + 0, 2, 4);
  ctx.fillStyle = C.earIn;
  ctx.fillRect(x + 6, y + 1, 2, 2);
  ctx.fillRect(x + 14, y + 1, 2, 2);

  // ── MATA BULAT ──
  ctx.fillStyle = C.eye;
  ctx.fillRect(x + 6, y + 3, 4, 4); // kiri — besar & bulat
  ctx.fillRect(x + 12, y + 3, 4, 4); // kanan
  // Highlight shine
  ctx.fillStyle = C.eyeShine;
  ctx.fillRect(x + 7, y + 3, 2, 2);
  ctx.fillRect(x + 13, y + 3, 2, 2);
  // Shine kecil kedua
  ctx.fillRect(x + 9, y + 5, 1, 1);
  ctx.fillRect(x + 15, y + 5, 1, 1);

  // ── HIDUNG & MULUT ──
  ctx.fillStyle = C.nose;
  ctx.fillRect(x + 9, y + 7, 4, 2); // hidung kecil
  ctx.fillRect(x + 10, y + 6, 2, 3);
  ctx.fillStyle = C.mouth;
  ctx.fillRect(x + 8, y + 9, 2, 1); // mulut kiri
  ctx.fillRect(x + 12, y + 9, 2, 1); // mulut kanan
  ctx.fillRect(x + 10, y + 9, 2, 1); // tengah

  // ── TANGAN KECIL ── (depan, saat berdiri)
  ctx.fillStyle = C.paw;
  ctx.fillRect(x + 3, y + 9, 3, 5); // tangan kiri
  ctx.fillRect(x + 16, y + 9, 3, 5); // tangan kanan
  ctx.fillStyle = C.pawClaw;
  ctx.fillRect(x + 4, y + 13, 2, 1);
  ctx.fillRect(x + 17, y + 13, 2, 1);

  // ── HIGHLIGHT ring saat nearby ──
  if (isNearby) {
    ctx.strokeStyle = 'rgba(255,220,80,0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 3, y - 2, 28, 26);
  }
}

// ============================================
// PUBLIC: drawAnimalNPC — dispatcher          ← BARU
// Pilih sprite berdasarkan type NPC hewan
// ============================================

/**
 * drawAnimalNPC(ctx, x, y, type, isNearby)
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {'cat'|'hamster'} type
 * @param {boolean} isNearby
 */
export function drawAnimalNPC(ctx, x, y, type, isNearby) {
  ctx.imageSmoothingEnabled = false;
  switch (type) {
    case 'cat':
      drawCat(ctx, x, y, isNearby);
      break;
    case 'hamster':
      drawHamster(ctx, x, y, isNearby);
      break;
    default:
      // Fallback: kotak warna
      ctx.fillStyle = '#88AA44';
      ctx.fillRect(x, y, 24, 24);
  }
}

// ============================================
// LOAD SPRITES — no-op, pakai pixel art manual
// ============================================

export function loadSprites() {
  return Promise.resolve(false);
}
