export type OfflineState =
  | "unsupported"
  | "available"
  | "saving"
  | "ready"
  | "failed";
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export class AdventurePwa {
  state: OfflineState = this.supported ? "available" : "unsupported";
  updateAvailable = false;
  registration: ServiceWorkerRegistration | null = null;
  private prompt: InstallPrompt | null = null;
  private updating = false;
  constructor(private changed: () => void) {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      this.prompt = event as InstallPrompt;
      changed();
    });
    window.addEventListener("appinstalled", () => {
      this.prompt = null;
      changed();
    });
  }
  get supported() {
    return (
      window.isSecureContext &&
      "serviceWorker" in navigator &&
      /^https?:$/.test(location.protocol)
    );
  }
  get installed() {
    return (
      matchMedia("(display-mode: standalone)").matches ||
      !!(navigator as Navigator & { standalone?: boolean }).standalone
    );
  }
  private get preferenceKey() {
    return "adventure-offline:" + new URL("./", location.href).pathname;
  }
  /** Hosted play downloads no offline copy until a parent explicitly saves it. */
  async restore() {
    try {
      if (localStorage.getItem(this.preferenceKey) === "yes") {
        await this.start();
        return;
      }
    } catch {
      /* Private browsing may disallow preference storage. */
    }
    this.changed();
  }
  async start() {
    if (!this.supported) {
      this.state = "unsupported";
      this.changed();
      return;
    }
    this.state = "saving";
    this.changed();
    try {
      localStorage.setItem(this.preferenceKey, "yes");
    } catch {
      /* Optional. */
    }
    try {
      this.registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "./",
        updateViaCache: "none",
      });
      const watch = () => {
        const worker = this.registration?.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "redundant" && !this.registration?.active) {
            this.state = "failed";
            this.changed();
          }
          if (worker.state === "installed" && this.registration?.waiting) {
            this.updateAvailable = true;
            this.changed();
          }
          if (worker.state === "activated") void this.verify();
        });
      };
      watch();
      this.registration.addEventListener("updatefound", watch);
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (this.updating) location.reload();
        else void this.verify();
      });
      if (this.registration.waiting) this.updateAvailable = true;
      if (this.registration.active) await this.verify();
      void navigator.serviceWorker.ready.then((reg) => {
        this.registration = reg;
        this.updateAvailable = !!reg.waiting;
        void this.verify();
      });
    } catch {
      this.state = "failed";
      this.changed();
    }
  }
  private async verify() {
    const worker = this.registration?.active;
    if (!worker) return;
    const channel = new MessageChannel();
    const ready = await new Promise<boolean>((resolve) => {
      const timer = window.setTimeout(() => {
        channel.port1.close();
        resolve(false);
      }, 5000);
      channel.port1.onmessage = (event) => {
        clearTimeout(timer);
        channel.port1.close();
        resolve(event.data?.ready === true);
      };
      try {
        worker.postMessage({ type: "CACHE_STATUS" }, [channel.port2]);
      } catch {
        clearTimeout(timer);
        channel.port1.close();
        resolve(false);
      }
    });
    this.state = ready ? "ready" : "failed";
    this.changed();
  }
  async install() {
    if (!this.prompt) return false;
    const prompt = this.prompt;
    this.prompt = null;
    try {
      await prompt.prompt();
      await prompt.userChoice;
      this.changed();
      return true;
    } catch {
      this.changed();
      return false;
    }
  }
  applyUpdate() {
    const worker = this.registration?.waiting;
    if (!worker) return;
    this.updating = true;
    worker.postMessage({ type: "SKIP_WAITING" });
  }
}
