import type { Scene } from "../types/scene.type";
import { MainScene } from "./scenes/mainScene";
import { LooseCache } from "./core/cache";
import { Renderer } from "./common/render";
import Three from "./core/threeSingleton";

// Singleton pattern game loop
// can only be created once
export class GameCore {
	private static instance: GameCore;
	private static canvasElement: HTMLCanvasElement;

	private static currentScene: Scene | null;
	private static generalCache: LooseCache;

	private constructor(canvas: HTMLCanvasElement) {
		GameCore.instance = this;
		GameCore.canvasElement = canvas;
		GameCore.generalCache = new LooseCache("generalCache");

		window.addEventListener("contextmenu", (event: PointerEvent) =>
			event.preventDefault(),
		);
		canvas.addEventListener("click", () => {
			if (document.pointerLockElement === canvas) return;
			canvas.requestPointerLock();
		});
	}

	/**
	 * Runs the instance of the game
	 *
	 * @param canvasElement The element to which the game will be attached to
	 * */
	public static run(canvas: HTMLCanvasElement) {
		if (this.instance) throw new Error(`Game Instance is already running`);
		new GameCore(canvas);

		this.currentScene = new MainScene();
		this.currentScene.loadContents();

		this.generalCache.set("clock", new Three.Clock());

		const renderer: Renderer = new Renderer(this.canvasElement);
		this.generalCache.set("renderer", renderer);

		this.gameProcess();
	}

	/**
	 * Return the status of the game. True if it's running.
	 * False if it's not.
	 *
	 * @returns The running state of the game
	 * */
	public static getRunningState(): boolean {
		return !!this.instance;
	}

	/**
	 * Preforms a update on the game and renders it
	 * */
	private static gameProcess(): void {
		if (!this.currentScene) throw new Error("current scene is empty");
		requestAnimationFrame(this.gameProcess.bind(this));

		const clock: Three.Clock = this.generalCache.get<Three.Clock>("clock");
		const deltaTime: number = clock.getDelta();

		const renderer: Renderer = this.generalCache.get<Renderer>("renderer");
		const renderDevice: Three.WebGLRenderer = renderer.get();

		this.currentScene.update(deltaTime);
		this.currentScene.render(renderDevice);
	}
}
