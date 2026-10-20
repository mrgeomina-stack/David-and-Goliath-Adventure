import manifestText from "../visual-assets-v1/asset_manifest.json?raw";
import animationText from "../visual-assets-v1/animations.json?raw";
import rolesText from "../visual-assets-v1/integration/ROLE_REPLACEMENT_MAP.json?raw";
import type Phaser from "phaser";
import type { Point } from "./model";

export interface VisualAsset {
  id: string;
  path: string;
  width: number;
  height: number;
  pivot: Point;
  status: "integration_candidate" | "provisional" | "reference_only";
  anchors?: Record<string, Point>;
}
export const visualManifest = JSON.parse(manifestText) as {
  assets: VisualAsset[];
};
export const visualAnimations = JSON.parse(animationText) as Record<
  string,
  {
    frames: string[];
    status: string;
    durationsMs?: number[];
    fps?: number;
    loop: boolean;
  }
>;
export const visualRoles = JSON.parse(rolesText) as {
  levels: { level: number; background: string }[];
};

/** World coordinates stay authoritative; anchors belong to image pixels. */
export function placedAnchor(
  asset: VisualAsset,
  world: Point,
  scale: number,
  anchor: Point,
  mirrored = false,
): Point {
  return {
    x: world.x + (anchor.x - asset.pivot.x) * scale * (mirrored ? -1 : 1),
    y: world.y + (anchor.y - asset.pivot.y) * scale,
  };
}
export function rootForAnchor(
  asset: VisualAsset,
  target: Point,
  scale: number,
  anchor: Point,
  mirrored = false,
): Point {
  const offset = placedAnchor(asset, { x: 0, y: 0 }, scale, anchor, mirrored);
  return { x: target.x - offset.x, y: target.y - offset.y };
}

// Vite embeds available PNGs into the existing classic-script offline build.
// No JSON fetch, CDN, runtime module import or guessed filesystem URL is used.
const urls = import.meta.glob<string>(
  [
    "../visual-assets-v1/backgrounds/**/*.png",
    "!../visual-assets-v1/backgrounds/level01_shepherd_hills_1920x1080.png",
    "../visual-assets-v1/sprites/**/*.png",
    "../visual-assets-v1/ui/**/*.png",
    "../visual-assets-v1/effects/**/*.png",
  ],
  { eager: true, query: "?url", import: "default" },
);
class VisualLibrary {
  private images = new Map<string, HTMLImageElement>();
  readonly used = new Set<string>();
  private requested: VisualAsset[] = [];
  readonly issues: string[] = [];
  preload(loader: Phaser.Loader.LoaderPlugin) {
    this.requested = [];
    for (const asset of visualManifest.assets) {
      // Provisional/reference files cannot silently replace finished animation.
      if (asset.status !== "integration_candidate") continue;
      // Original preserved on disk; its IDAT checksum is incomplete. Keep the
      // existing meadow instead of drawing a browser's partially decoded rows.
      if (asset.id === "background_01_shepherd_hills") continue;
      const url = urls["../visual-assets-v1/" + asset.path];
      if (!url) continue;
      this.requested.push(asset);
      loader.image("visual-v1:" + asset.id, url);
    }
  }
  configure(textures: Phaser.Textures.TextureManager) {
    this.images.clear();
    this.used.clear();
    this.issues.length = 0;
    for (const asset of this.requested) {
      const key = "visual-v1:" + asset.id;
      if (!textures.exists(key)) {
        this.issues.push(asset.id + ": not loaded");
        continue;
      }
      const image = textures.get(key).getSourceImage() as HTMLImageElement;
      if (image.width !== asset.width || image.height !== asset.height) {
        this.issues.push(asset.id + ": dimensions differ from manifest");
        continue;
      }
      this.images.set(asset.id, image);
    }
  }
  image(id: string) {
    const image = this.images.get(id);
    if (image) this.used.add(id);
    return image;
  }
  asset(id: string) {
    return visualManifest.assets.find((a) => a.id === id);
  }
  animationFrame(id: string, elapsed: number) {
    const animation = visualAnimations[id];
    if (!animation || animation.status === "provisional") return null;
    if (!animation.frames.every((frame) => this.images.has(frame))) return null;
    const times =
      animation.durationsMs ||
      animation.frames.map(() => 1000 / (animation.fps || 8));
    const total = times.reduce((sum, time) => sum + time, 0);
    let time = Math.max(0, elapsed * 1000);
    time = animation.loop ? time % total : Math.min(time, total - 0.001);
    for (let i = 0; i < times.length; i++) {
      if (time < times[i]) return animation.frames[i];
      time -= times[i];
    }
    return animation.frames.at(-1)!;
  }
  drawFeet(
    c: CanvasRenderingContext2D,
    id: string,
    x: number,
    y: number,
    height: number,
    mirrored = false,
  ) {
    const asset = this.asset(id);
    if (!asset) return false;
    return this.drawAt(c, id, { x, y }, height / (asset.pivot.y - 8), mirrored);
  }
  get loadedCount() {
    return this.images.size;
  }
  drawAt(
    c: CanvasRenderingContext2D,
    id: string,
    world: Point,
    scale: number,
    mirrored = false,
  ) {
    const image = this.image(id);
    const asset = visualManifest.assets.find((a) => a.id === id);
    if (!image || !asset) return false;
    c.save();
    c.translate(world.x, world.y);
    c.scale(mirrored ? -scale : scale, scale);
    c.drawImage(
      image,
      -asset.pivot.x,
      -asset.pivot.y,
      asset.width,
      asset.height,
    );
    c.restore();
    return true;
  }
  /** Center a prop without trimming away its authored pivot or transparency. */
  drawCentered(
    c: CanvasRenderingContext2D,
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    const asset = visualManifest.assets.find((a) => a.id === id);
    if (!asset || !this.image(id)) return false;
    const scale = Math.min(width / asset.width, height / asset.height);
    const root = rootForAnchor(asset, { x, y }, scale, {
      x: asset.width / 2,
      y: asset.height / 2,
    });
    return this.drawAt(c, id, root, scale);
  }
}
export const visualLibrary = new VisualLibrary();
