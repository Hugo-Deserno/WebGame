import {
	GameConfigurations,
	type GameConfigurationsConfig,
} from "./common/configuration";
import Three from "./threeSingleton";

export class renderer {
	private webGLRenderer: Three.WebGLRenderer;
	private readonly canvasElement: HTMLCanvasElement;

	constructor(canvasElement: HTMLCanvasElement) {
		this.canvasElement = canvasElement;
		this.loadRenderer();
	}

	private reloadRenderer() {
		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		this.webGLRenderer = new Three.WebGLRenderer({
			canvas: this.canvasElement,
			antialias: gameConfigurations.antiAlias,
		});
	}
	private loadRenderer = this.reloadRenderer;

	public get(): Three.WebGLRenderer {
		if (!this.webGLRenderer) throw new Error("WebGL render doesn't exist");
		return this.webGLRenderer;
	}
}
