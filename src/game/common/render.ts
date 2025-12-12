import { LooseCache } from "../core/cache";
import {
	GameConfigurations,
	type GameConfigurationsConfig,
} from "../core/configuration";
import Three from "../threeSingleton";

export class Renderer {
	private webGLRenderer: Three.WebGLRenderer | null;
	private readonly cache: LooseCache;

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
		window.addEventListener("resize", () => {
			if (!this.webGLRenderer) return;
			this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
		});
	}

	/**
	 * Reloads the fields of the renderer that don't require a
	 * new webGLrenderer to be created
	 * */
	private lazyReloadRenderer(): void {
		if (!this.webGLRenderer) return;

		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		this.webGLRenderer.shadowMap.enabled = gameConfigurations.shadows;
		this.webGLRenderer.setPixelRatio(window.devicePixelRatio);
	}

	/**
	 * Hard reloads the renderer and creates a new renderer instance
	 * */
	private reloadRenderer(): void {
		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		this.webGLRenderer = new Three.WebGLRenderer({
			canvas: this.cache.get<HTMLCanvasElement>("canvas"),
			antialias: gameConfigurations.antiAlias,
		});
		this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
		this.lazyReloadRenderer();
	}
	private loadRenderer: () => void = this.reloadRenderer;

	/**
	 * Return the current WebGL renderer
	 *
	 * @return the current webGL renderer
	 * */
	public get(): Three.WebGLRenderer {
		if (!this.webGLRenderer) throw new Error("WebGL render doesn't exist");
		return this.webGLRenderer;
	}
}
