import { LooseCache } from "../core/cache";
import {
	GameConfigurations,
	type GameConfigurationsConfig,
} from "../core/configuration";
import Three from "../threeSingleton";

export class Renderer {
	private webGLRenderer: Three.WebGLRenderer | null;
	private cache: LooseCache;

	constructor(canvasElement: HTMLCanvasElement) {
		this.cache = new LooseCache("renderCache");
		this.cache.set("canvas", canvasElement);
		this.webGLRenderer = null;

		GameConfigurations.observeConfiguration(
			"shadows",
			this.lazyReloadRenderer,
		);
		GameConfigurations.observeConfiguration(
			"antiAlias",
			this.reloadRenderer,
		);

		this.loadRenderer();
	}

	private lazyReloadRenderer(): void {
		if (!this.webGLRenderer) return;

		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		this.webGLRenderer.shadowMap.enabled = gameConfigurations.shadows;
		this.webGLRenderer.setPixelRatio(window.devicePixelRatio);
	}

	private resizeWindow(): void {
		if (!this.webGLRenderer) return;
		this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	}
	private reloadRenderer(): void {
		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		if (this.webGLRenderer) {
			window.removeEventListener("resize", this.resizeWindow);
		}

		this.webGLRenderer = new Three.WebGLRenderer({
			canvas: this.cache.get<HTMLCanvasElement>("canvas"),
			antialias: gameConfigurations.antiAlias,
		});
		this.resizeWindow();
		window.addEventListener("resize", this.resizeWindow);
		this.lazyReloadRenderer();
	}
	private loadRenderer: () => void = this.reloadRenderer;

	public get(): Three.WebGLRenderer {
		if (!this.webGLRenderer) throw new Error("WebGL render doesn't exist");
		return this.webGLRenderer;
	}
}
