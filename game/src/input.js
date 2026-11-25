// Dapur Kilat — input: WASD/arrows to move, Space or E to interact, mouse
// click on a nearby station also interacts. Enter starts, R restarts.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, clicked: false };
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * sx;
      this.mouse.y = (e.clientY - rect.top) * sy;
      this.mouse.clicked = true;
    });
    window.addEventListener('blur', () => this.keys.clear());
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  }

  interactHeld() {
    return this.keys.has(' ') || this.keys.has('e');
  }

  interactPressed() {
    return this.pressed.has(' ') || this.pressed.has('e');
  }

  startPressed() {
    return this.pressed.has('enter');
  }

  restartPressed() {
    return this.pressed.has('r');
  }

  consumeMouseClick() {
    const clicked = this.mouse.clicked;
    this.mouse.clicked = false;
    return clicked ? { x: this.mouse.x, y: this.mouse.y } : null;
  }

  endFrame() {
    this.pressed.clear();
  }
}
