// ============================================
// TextRenderer.js — Teks Canvas yang Tajam & Kontras
// Birthday Quest RPG
//
// Semua teks di canvas dirender lewat sini.
// Standar: shadow hitam tebal + warna cerah + ukuran lebih besar.
// ============================================

/**
 * drawLabel(ctx, text, x, y, options)
 * Teks dengan outline hitam tebal agar terbaca di atas tile apapun.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {object} options
 *   color       : warna teks (default '#FFFFFF')
 *   font        : ukuran + font (default '9px monospace')
 *   align       : textAlign (default 'left')
 *   outlineWidth: ketebalan outline hitam (default 3)
 *   alpha       : opacity 0-1 (default 1)
 */
export function drawLabel(
  ctx,
  text,
  x,
  y,
  {
    color = '#FFFFFF',
    font = '9px monospace',
    align = 'left',
    outlineWidth = 3,
    alpha = 1,
  } = {}
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.lineJoin = 'round';

  // Outline hitam tebal
  ctx.lineWidth = outlineWidth * 2;
  ctx.strokeStyle = 'rgba(0,0,0,0.95)';
  ctx.strokeText(text, x, y);

  // Teks utama
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  ctx.restore();
}

/**
 * drawBadge(ctx, text, cx, cy, options)
 * Kotak pill dengan teks — untuk prompt interaksi dan label NPC.
 *
 * @param {CanvasRenderingContext2D} cx - center x
 * @param {CanvasRenderingContext2D} cy - center y
 */
export function drawBadge(
  ctx,
  text,
  cx,
  cy,
  {
    bgColor = 'rgba(0,0,0,0.82)',
    textColor = '#FFFFFF',
    borderColor = null,
    font = '8px monospace',
    paddingX = 7,
    paddingY = 5,
    radius = 4,
  } = {}
) {
  ctx.save();
  ctx.font = font;

  const tw = ctx.measureText(text).width;
  const bw = tw + paddingX * 2;
  const bh = 14 + paddingY;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;

  // Background pill
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, radius);
  ctx.fill();

  // Border opsional
  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Teks dengan outline kecil
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.9)';
  ctx.textAlign = 'center';
  ctx.strokeText(text, cx, cy + 5);

  ctx.fillStyle = textColor;
  ctx.fillText(text, cx, cy + 5);

  ctx.restore();
}

/**
 * drawRoomLabel(ctx, text, x, y)
 * Label nama ruangan — semi transparan, outline hitam.
 */
export function drawRoomLabel(ctx, text, x, y) {
  drawLabel(ctx, text, x, y, {
    color: '#E8F4E8',
    font: '8px monospace',
    align: 'left',
    outlineWidth: 3,
    alpha: 0.9,
  });
}

/**
 * drawNPCName(ctx, text, cx, y, isInteracted)
 * Nama NPC di bawah sprite.
 */
export function drawNPCName(ctx, text, cx, y, isInteracted = false) {
  drawLabel(ctx, text, cx, y, {
    color: isInteracted ? '#88EE88' : '#F0F0C0',
    font: '8px monospace',
    align: 'center',
    outlineWidth: 3,
  });
}

/**
 * drawInteractPrompt(ctx, text, cx, cy)
 * Prompt "[E] Ngobrol" di atas NPC.
 */
export function drawInteractPrompt(ctx, text, cx, cy) {
  drawBadge(ctx, text, cx, cy, {
    bgColor: 'rgba(10,10,30,0.88)',
    textColor: '#FFFFFF',
    borderColor: 'rgba(120,120,255,0.6)',
    font: '8px monospace',
    paddingX: 8,
    paddingY: 4,
    radius: 4,
  });
}

/**
 * drawDoorPrompt(ctx, text, cx, cy)
 * Prompt pintu — warna sedikit berbeda dari NPC.
 */
export function drawDoorPrompt(ctx, text, cx, cy) {
  drawBadge(ctx, text, cx, cy, {
    bgColor: 'rgba(10,25,10,0.88)',
    textColor: '#CCFFCC',
    borderColor: 'rgba(80,200,80,0.6)',
    font: '8px monospace',
    paddingX: 8,
    paddingY: 4,
    radius: 4,
  });
}
