import type { Scene } from "../../types/scene.type";
import { DynamicCache } from "../common/cache";
import type { Model } from "../../types/model.type";
import { Cube } from "../models/cube";
import Three from "../threeSingleton";
import { FreeCamera } from "../models/freeCamera";

export class MainScene implements Scene {
	private readonly sceneInstance: Three.Scene;

	private readonly modelCache: DynamicCache<Model>;

	constructor() {
		this.sceneInstance = new Three.Scene();
		this.modelCache = new DynamicCache<Model>("modelCache");
	}

	public loadContents(): void {
		const boxMesh: Cube = new Cube(new Three.Vector3(3, 3, 3)).end();
		boxMesh.add(this.sceneInstance);
		this.modelCache.set("cube", boxMesh);

		const floorMesh: Cube = new Cube(new Three.Vector3(10, 1, 10))
			.AddPosition(new Three.Vector3(0, -5, 0))
			.end();
		floorMesh.add(this.sceneInstance);

		const freeCamera: FreeCamera = new FreeCamera(75)
			.addPosition(new Three.Vector3(0, 0, 4))
			.end();
		this.modelCache.set("camera", freeCamera);
	}

	public update(gameTime: number): void {
		const boxMesh: Cube = this.modelCache.get<Cube>("cube");
		boxMesh.update(gameTime);
		const camera: FreeCamera = this.modelCache.get<FreeCamera>("camera");
		camera.update(gameTime);
	}

	public render(renderer: Three.WebGLRenderer): void {
		const camera: FreeCamera = this.modelCache.get<FreeCamera>("camera");
		const perspectiveCamera: Three.PerspectiveCamera = camera.get();

		renderer.render(this.sceneInstance, perspectiveCamera);
	}
}
