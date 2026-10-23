/** Delegation also covers dynamically created popup and teacher buttons. */
export function bindButtonSounds(
  root: Document,
  sound: { unlock: () => void; pop: () => void },
) {
  root.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      // First gesture anywhere enables the landing-page music on Safari/Chrome.
      sound.unlock();
      const button =
        event.target instanceof Element ? event.target.closest("button") : null;
      if (
        button &&
        !button.disabled &&
        button.getAttribute("aria-disabled") !== "true"
      )
        sound.pop();
    },
    true,
  );
  root.addEventListener(
    "click",
    (event) => {
      // Pointer presses already popped, including held touch controls. Keyboard and
      // assistive activation synthesize detail=0 clicks and need their own feedback.
      if (event.detail !== 0) return;
      const button =
        event.target instanceof Element ? event.target.closest("button") : null;
      if (
        !button ||
        button.disabled ||
        button.getAttribute("aria-disabled") === "true"
      )
        return;
      sound.unlock();
      sound.pop();
    },
    true,
  );
  root.addEventListener(
    "keydown",
    (event) => {
      if (!event.repeat) sound.unlock();
    },
    true,
  );
}
