import type { Point } from "./model";
export function canvasPoint(
  client: Point,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
): Point {
  return {
    x: ((client.x - rect.left) * 1280) / rect.width,
    y: ((client.y - rect.top) * 720) / rect.height,
  };
}
export interface GestureHooks {
  down: (p: Point, touch: boolean) => void;
  move: (p: Point) => void;
  up: (p: Point) => void;
  cancel: () => void;
  swipe?: (p: Point) => boolean;
}
/** One captured finger owns each canvas gesture; other fingers may use the D-pad. */
export function bindCanvasGestures(
  canvas: HTMLCanvasElement,
  hooks: GestureHooks,
) {
  let owner: number | null = null,
    origin: Point | null = null,
    swiped = false;
  const point = (e: PointerEvent) =>
    canvasPoint({ x: e.clientX, y: e.clientY }, canvas.getBoundingClientRect());
  const reset = () => {
    if (owner === null) return;
    const id = owner;
    owner = null;
    origin = null;
    hooks.cancel();
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  };
  window.addEventListener("blur", reset);
  window.addEventListener("resize", reset);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) reset();
  });
  canvas.addEventListener("pointerdown", (e) => {
    if (owner !== null || e.button > 0) return;
    e.preventDefault();
    owner = e.pointerId;
    origin = point(e);
    swiped = false;
    canvas.setPointerCapture(e.pointerId);
    hooks.down(origin, e.pointerType === "touch");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerId !== owner) return;
    e.preventDefault();
    const p = point(e);
    hooks.move(p);
    if (origin && !swiped) {
      const dx = p.x - origin.x,
        dy = p.y - origin.y;
      if (
        Math.hypot(dx, dy) > 28 &&
        hooks.swipe?.(
          Math.abs(dx) > Math.abs(dy)
            ? { x: Math.sign(dx), y: 0 }
            : { x: 0, y: Math.sign(dy) },
        )
      )
        swiped = true;
    }
  });
  const end = (e: PointerEvent, cancel: boolean) => {
    if (e.pointerId !== owner) return;
    e.preventDefault();
    owner = null;
    origin = null;
    if (cancel) hooks.cancel();
    else hooks.up(point(e));
    if (canvas.hasPointerCapture(e.pointerId))
      canvas.releasePointerCapture(e.pointerId);
  };
  canvas.addEventListener("pointerup", (e) => end(e, false));
  canvas.addEventListener("pointercancel", (e) => end(e, true));
  canvas.addEventListener("lostpointercapture", (e) => {
    if (e.pointerId === owner) {
      owner = null;
      origin = null;
      hooks.cancel();
    }
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}
/** Release/cancel paths are deliberately idempotent so gestures never leave movement held. */
export function bindPress(
  button: HTMLElement,
  down: () => void,
  up: () => void,
  cancel: () => void = up,
) {
  let owner: number | null = null;
  const reset = () => {
    if (owner === null) return;
    const id = owner;
    owner = null;
    cancel();
    if (button.hasPointerCapture(id)) button.releasePointerCapture(id);
  };
  window.addEventListener("blur", reset);
  window.addEventListener("resize", reset);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) reset();
  });
  button.addEventListener("pointerdown", (e) => {
    if (owner !== null || e.button > 0) return;
    e.preventDefault();
    owner = e.pointerId;
    button.setPointerCapture(e.pointerId);
    down();
  });
  button.addEventListener("pointerup", (e) => {
    if (e.pointerId !== owner) return;
    owner = null;
    e.preventDefault();
    up();
    if (button.hasPointerCapture(e.pointerId))
      button.releasePointerCapture(e.pointerId);
  });
  button.addEventListener("pointercancel", (e) => {
    if (e.pointerId === owner) {
      owner = null;
      cancel();
    }
  });
  button.addEventListener("lostpointercapture", (e) => {
    if (e.pointerId === owner) {
      owner = null;
      cancel();
    }
  });
}
