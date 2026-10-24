import { clamp, lerp } from "./model";

export const ACTIVITY_SECONDS = 30;
export const SHEEP_SECONDS = 36;
export class ActivityTimer {
  elapsed = 0;
  constructor(public limit: number | null = ACTIVITY_SECONDS) {}
  get remaining() {
    return this.limit === null ? null : Math.max(0, this.limit - this.elapsed);
  }
  tick(dt: number, running = true) {
    if (running && this.limit !== null)
      this.elapsed = Math.min(this.limit, this.elapsed + Math.max(0, dt));
  }
}
/** Green → orange at 20 → red at 10; continuous throughout, not abrupt class swaps. */
export function countdownHue(remaining: number, limit = ACTIVITY_SECONDS) {
  const seconds = clamp(
    (remaining / limit) * ACTIVITY_SECONDS,
    0,
    ACTIVITY_SECONDS,
  );
  return seconds >= 20
    ? lerp(32, 140, (seconds - 20) / 10)
    : lerp(0, 32, (seconds - 10) / 10);
}
