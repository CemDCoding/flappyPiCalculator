import type { GameConfig, GameRenderer, GameState } from '../contracts/game';

/** Same LCD colours as src/ui/ui.css (.lcd). */
export const LCD_BACKGROUND = '#9aa88a';
export const LCD_INK = '#14170f';
const LCD_GRID = 'rgba(255, 255, 255, 0.06)';
const FONT_FAMILY = 'monospace';

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  align: CanvasTextAlign,
): void {
  ctx.font = `${size}px ${FONT_FAMILY}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(text, Math.round(x), Math.round(y));
}

/**
 * Draws the game in LCD style. Only system fonts and canvas primitives are
 * used (no external images or fonts). Exactly two fillRect calls per pipe,
 * plus one for the background.
 */
export const renderGame: GameRenderer = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  config: GameConfig,
): void => {
  const { width, height, groundHeight } = config;

  ctx.fillStyle = LCD_BACKGROUND;
  ctx.fillRect(0, 0, width, height);

  // Faint LCD raster: every 2nd row slightly lightened.
  ctx.strokeStyle = LCD_GRID;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 1; y < height; y += 2) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();

  ctx.fillStyle = LCD_INK;
  ctx.strokeStyle = LCD_INK;
  ctx.lineWidth = 1;

  const groundTop = height - groundHeight;

  for (const pipe of state.pipes) {
    const x = Math.round(pipe.x);
    const gapTop = Math.round(pipe.gapY);
    const gapBottom = Math.round(pipe.gapY + config.pipeGap);
    const w = Math.round(config.pipeWidth);
    ctx.fillRect(x, 0, w, Math.max(0, gapTop));
    ctx.fillRect(x, gapBottom, w, Math.max(0, Math.round(groundTop) - gapBottom));
  }

  // Ground line.
  ctx.beginPath();
  ctx.moveTo(0, Math.round(groundTop) + 0.5);
  ctx.lineTo(width, Math.round(groundTop) + 0.5);
  ctx.stroke();

  // Bird: pi glyph, tilted slightly by vertical speed.
  const size = Math.round(config.birdSize);
  const bx = Math.round(config.birdX);
  const by = Math.round(state.birdY);
  const tilt = Math.max(-0.4, Math.min(0.4, state.birdVy / 400));
  ctx.save();
  ctx.translate(bx + size / 2, by + size / 2);
  ctx.rotate(tilt);
  drawText(ctx, 'π', 0, -size / 2, size, 'center');
  ctx.restore();

  // Score top right.
  drawText(ctx, String(state.score), width - 2, 1, 8, 'right');

  if (state.status === 'ready') {
    drawText(ctx, '0-9 drücken', width / 2, 14, 8, 'center');
  } else if (state.status === 'over') {
    drawText(ctx, 'GAME OVER', width / 2, height / 2 - 5, 10, 'center');
  }
};
