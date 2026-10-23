export async function touchStick(page) {
  const cdp = await page.context().newCDPSession(page);
  let active = false,
    origin,
    current;
  const dispatch = (type, points) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((p) => ({
        ...p,
        id: p.id ?? 0,
        radiusX: 8,
        radiusY: 8,
        force: 1,
      })),
    });
  return {
    async start(dir = { x: 0, y: 0 }) {
      const b = await page.locator("#joystick").boundingBox();
      origin = {
        x: b.x + b.width / 2,
        y: b.y + b.height / 2,
        r: b.width * 0.34,
      };
      current = { x: origin.x, y: origin.y };
      active = true;
      await dispatch("touchStart", [current]);
      await this.move(dir);
    },
    async move(dir) {
      current = {
        x: origin.x + dir.x * origin.r,
        y: origin.y + dir.y * origin.r,
      };
      await dispatch("touchMove", [current]);
    },
    async end(cancel = false) {
      if (active) await dispatch(cancel ? "touchCancel" : "touchEnd", []);
      active = false;
    },
    async steer(dir, ms = 70) {
      await this.start(dir);
      await page.waitForTimeout(ms);
      await this.end();
    },
    async tapWhileHeld(p) {
      await dispatch("touchStart", [current, { ...p, id: 1 }]);
      await dispatch("touchEnd", [current]);
    },
  };
}
