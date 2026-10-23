import type { Point } from "./model";

/** A small dead zone prevents thumb jitter; output never changes game speed. */
export function stickVector(dx: number, dy: number, radius: number): Point {
  const length = Math.hypot(dx, dy);
  if (radius <= 0 || length < radius * 0.18) return { x: 0, y: 0 };
  return { x: dx / length, y: dy / length };
}

export function bindJoystick(
  base: HTMLElement,
  changed: (direction: Point) => void,
  released: (cancelled: boolean) => void,
) {
  let owner: number | null = null;
  const finish = (cancelled: boolean) => {
    if (owner === null) return;
    const id = owner;
    owner = null;
    base.dataset.active = "false";
    base.style.setProperty("--stick-x", "0px");
    base.style.setProperty("--stick-y", "0px");
    changed({ x: 0, y: 0 });
    released(cancelled);
    if (base.hasPointerCapture(id)) base.releasePointerCapture(id);
  };
  const move = (e: PointerEvent) => {
    const box = base.getBoundingClientRect();
    const dx = e.clientX - box.left - box.width / 2;
    const dy = e.clientY - box.top - box.height / 2;
    const radius = box.width * 0.28;
    const length = Math.hypot(dx, dy);
    const fraction = length ? Math.min(length, radius) / length : 0;
    // CSS coordinates belong to the scaled logical stage.
    const scale = box.width / base.offsetWidth;
    base.style.setProperty("--stick-x", `${(dx * fraction) / scale}px`);
    base.style.setProperty("--stick-y", `${(dy * fraction) / scale}px`);
    changed(stickVector(dx, dy, radius));
  };
  base.addEventListener("pointerdown", (e) => {
    if (
      owner !== null ||
      e.button > 0 ||
      base.getAttribute("aria-disabled") === "true"
    )
      return;
    e.preventDefault();
    owner = e.pointerId;
    base.dataset.active = "true";
    base.setPointerCapture(owner);
    move(e);
  });
  base.addEventListener("pointermove", (e) => {
    if (owner !== e.pointerId) return;
    e.preventDefault();
    move(e);
  });
  base.addEventListener("pointerup", (e) => {
    if (owner !== e.pointerId) return;
    e.preventDefault();
    finish(false);
  });
  for (const type of ["pointercancel", "lostpointercapture"])
    base.addEventListener(type, (event) => {
      if ((event as PointerEvent).pointerId === owner) finish(true);
    });
  base.addEventListener("contextmenu", (e) => e.preventDefault());
  const reset = () => finish(true);
  window.addEventListener("resize", reset);
  window.visualViewport?.addEventListener("resize", reset);
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) reset();
  });
  return reset;
}
