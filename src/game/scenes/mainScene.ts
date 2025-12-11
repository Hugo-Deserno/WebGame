import type { Scene } from "../../types/scene.type";
import { DynamicCache } from "../common/cache";
import type { Model } from "../../types/model.type";
import { Cube } from "../models/cube";
import Three from "../threeSingleton";
import { StaticCamera } from "../models/staticCamera";

export class MainScene implements Scene {
	private readonly sceneInstance: Three.Scene;

	private readonly modelCache: DynamicCache<Model>;

	constructor() {
		this.sceneInstance = new Three.Scene();
		this.modelCache = new DynamicCache<Model>("modelCache");
	}

	public loadContents(): void {
		const boxMesh: Cube = new Cube(new Three.Vector3(1, 1, 1))
			.AddPosition(new Three.Vector3(0, 1, 1))
			.end();
		boxMesh.add(this.sceneInstance);
		this.modelCache.set("cube", boxMesh);

		const staticCamera: StaticCamera = new StaticCamera(75)
			.addPosition(new Three.Vector3(0, 0, 4))
			.end();
		this.modelCache.set("camera", staticCamera);
	}

	public update(gameTime: number): void {
		const boxMesh: Cube = this.modelCache.get<Cube>("cube");
		boxMesh.update(gameTime);
	}

	public render(renderer: Three.WebGLRenderer): void {
		const camera: StaticCamera =
			this.modelCache.get<StaticCamera>("camera");
		const perspectiveCamera: Three.PerspectiveCamera = camera.add(
			this.sceneInstance,
		);

		renderer.render(this.sceneInstance, perspectiveCamera);
	}
}
