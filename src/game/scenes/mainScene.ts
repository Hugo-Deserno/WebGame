import type { Scene } from "../../types/scene.type";
import { DynamicCache } from "../common/cache";
import type { Model } from "../../types/model.type";
import { Cube } from "../models/cube";
import Three from "../threeSingleton";
import { FreeCamera } from "../models/freeCamera";
import { StaticCamera } from "../models/staticCamera";
import type { CameraAxis } from "../../types/cameraAxis.type";
import { PointLight } from "../models/pointLight";

type Cameras = FreeCamera | StaticCamera;

export class MainScene implements Scene {
	private readonly sceneInstance: Three.Scene;

	private readonly modelCache: DynamicCache<Model>;
	private cameraAxis: CameraAxis = {
		yaw: 0,
		pitch: 0,
	};

	constructor() {
		this.sceneInstance = new Three.Scene();
		this.modelCache = new DynamicCache<Model>("modelCache");

		/**
		 * When pressing shift + F
		 * The user can switch between static cam and free cameraw
		 * */
		let isFreeCameraEnabled: boolean = false;
		window.addEventListener("keypress", (event: KeyboardEvent) => {
			if (event.key !== "F") return;

			if (!isFreeCameraEnabled) {
				const staticCamera: StaticCamera =
					this.modelCache.get<StaticCamera>("camera");

				const freeCamera: FreeCamera = new FreeCamera(75)
					.addPosition(staticCamera.getPosition())
					.addAxis(this.cameraAxis)
					.end();
				this.modelCache.set("camera", freeCamera);
			} else {
				const freeCamera: FreeCamera =
					this.modelCache.get<FreeCamera>("camera");
				this.cameraAxis = freeCamera.getAxis();

				const camera: StaticCamera = new StaticCamera(75)
					.addPosition(freeCamera.getPosition())
					.addRotation(freeCamera.getRotation())
					.end();
				this.modelCache.set("camera", camera);
			}
			isFreeCameraEnabled = !isFreeCameraEnabled;
		});
	}

	public loadContents(): void {
		const boxMesh: Cube = new Cube(new Three.Vector3(3, 3, 3))
			.addPhongMaterial(new Three.MeshPhongMaterial({ color: 0xffffff }))
			.addShadow()
			.end();
		boxMesh.add(this.sceneInstance);
		this.modelCache.set("cube", boxMesh);

		const pointLight: PointLight = new PointLight()
			.addPosition(new Three.Vector3(0, 10, 10))
			.addDistance(22)
			.addShadow(new Three.Vector2(2000, 2000))
			.addIntensity(50)
			.end();
		pointLight.add(this.sceneInstance);

		const floorMesh: Cube = new Cube(new Three.Vector3(10, 1, 10))
			.addPosition(new Three.Vector3(0, -5, 0))
			.addShadow()
			.addPhongMaterial(new Three.MeshPhongMaterial({ color: 0xffffff }))
			.end();
		floorMesh.add(this.sceneInstance);

		const camera: StaticCamera = new StaticCamera(75)
			.addPosition(new Three.Vector3(0, 0, 10))
			.end();
		this.modelCache.set("camera", camera);
	}

	public update(gameTime: number): void {
		const boxMesh: Cube = this.modelCache.get<Cube>("cube");
		boxMesh.update(gameTime);

		const camera: Cameras = this.modelCache.get<Cameras>("camera");
		if (camera instanceof FreeCamera) camera.update(gameTime);
	}

	public render(renderer: Three.WebGLRenderer): void {
		const camera: Cameras = this.modelCache.get<Cameras>("camera");
		const perspectiveCamera: Three.PerspectiveCamera = camera.get();

		renderer.render(this.sceneInstance, perspectiveCamera);
	}
}
