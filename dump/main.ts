private static getRunner: () => boolean;
	private static setRunner: (state: boolean) => void;
	private static canvasElement: HTMLCanvasElement | null = null;



	private constructor() {
		GameCore.instance = this;

		GameCore.currentScene = null;
		GameCore.generalCache = new LooseCache("generalCache");

		let isRunning: boolean = false;

		GameCore.getRunner = function (): boolean {
			return isRunning;
		};

		GameCore.setRunner = function (): void {
			if (isRunning) throw new Error(`Cannot set runner. Is already set`);
			isRunning = true;
		};

		window.addEventListener("contextmenu", (event: PointerEvent) =>
			event.preventDefault(),
		);
		window.addEventListener("mousedown", (event: MouseEvent) => {
			if (event.button !== 2 || GameCore.canvasElement === null) return;
			GameCore.canvasElement.requestPointerLock();
		});



	public getRunningState(): boolean {
		return this.getRunner();
	}

		public run(canvasElement: HTMLCanvasElement): void {
		const isRunning: boolean = this.getRunner();
		if (isRunning) throw new Error(`Game Instance is already running`);

		this.canvasElement = canvasElement;
		this.setRunner(true);

		this.currentScene = new MainScene();
		this.currentScene.loadContents();

		this.generalCache.set("clock", new Three.Clock());

		const renderer: Renderer = new Renderer(canvasElement);
		this.generalCache.set("renderer", renderer);

		this.gameProcess();
	}