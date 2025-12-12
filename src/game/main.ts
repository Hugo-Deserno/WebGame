import type { Scene } from "../types/scene.type";
import { MainScene } from "./scenes/mainScene";
import { LooseCache } from "./common/cache";
import Three from "./threeSingleton";

export function gameInit() {}

export class GameCore {
	private getRunner: () => boolean;
	private setRunner: (state: boolean) => void;
	private canvasElement: HTMLCanvasElement | null = null;

	private currentScene: Scene | null;
	private generalCache: LooseCache;

	constructor() {
		this.currentScene = null;
		this.generalCache = new LooseCache("generalCache");

		let isRunning: boolean = false;

		this.getRunner = function (): boolean {
			return isRunning;
		};

		this.setRunner = function (): void {
			if (isRunning) throw new Error(`Cannot set runner. Is already set`);
			isRunning = true;
		};

		window.addEventListener("contextmenu", (event: PointerEvent) =>
			event.preventDefault(),
		);
		window.addEventListener("mousedown", (event: MouseEvent) => {
			if (event.button !== 2 || this.canvasElement === null) return;
			this.canvasElement.requestPointerLock();
		});
	}

	/**
	 * Return the status of the game. True if it's running.
	 * False if it's not.
	 *
	 * @returns The running state of the game
	 * */
	public getRunningState(): boolean {
		return this.getRunner();
	}

	/**
	 * Runs the instance of the game
	 *
	 * @param canvasElement The element to which the game will be attached to
	 * */
	public run(canvasElement: HTMLCanvasElement): void {
		const isRunning: boolean = this.getRunner();
		if (isRunning) throw new Error(`Game Instance is already running`);

		this.canvasElement = canvasElement;
		this.setRunner(true);

		this.currentScene = new MainScene();
		this.currentScene.loadContents();

		this.generalCache.set("clock", new Three.Clock());

		const webGLRenderer: Three.WebGLRenderer = new Three.WebGLRenderer({
			canvas: canvasElement,
			antialias: true,
		});
		webGLRenderer.setPixelRatio(window.devicePixelRatio);
		webGLRenderer.setSize(window.innerWidth, window.innerHeight);
		webGLRenderer.shadowMap.enabled = true;
		window.addEventListener("resize", () => {
			webGLRenderer.setSize(window.innerWidth, window.innerHeight);
		});
		this.generalCache.set("renderer", webGLRenderer);

		this.gameProcess();
	}

	/**
	 * Preforms a update on the game and renders it
	 * */
	private gameProcess(): void {
		if (!this.currentScene) throw new Error("current scene is empty");
		requestAnimationFrame(this.gameProcess.bind(this));

		const clock: Three.Clock = this.generalCache.get<Three.Clock>("clock");
		const deltaTime: number = clock.getDelta();
		const webGLRenderer: Three.WebGLRenderer =
			this.generalCache.get<Three.WebGLRenderer>("renderer");

		this.currentScene.update(deltaTime);
		this.currentScene.render(webGLRenderer);
	}
}
