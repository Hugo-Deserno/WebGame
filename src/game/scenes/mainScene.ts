import type { Scene } from "../../types/scene.type";
import { DynamicCache } from "../core/cache";
import type { Model } from "../../types/model.type";
import { Cube } from "../models/cube";
import Three from "../threeSingleton";
import { FreeCamera } from "../models/freeCamera";
import { StaticCamera } from "../models/staticCamera";
import type { CameraAxis } from "../../types/cameraAxis.type";
import { PointLight } from "../models/pointLight";
import { AmbientLight } from "../models/ambientLight";
import { DirectionalLight } from "../models/directionalLight";

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
		 * The user can switch between static cam and free camera
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
		const ambientLight: AmbientLight = new AmbientLight(1).end();
		ambientLight.add(this.sceneInstance);

		const directionalLight: DirectionalLight = new DirectionalLight(4)
			.addShadow(50)
			.addHelper(new Three.Color(0x000000))
			.addPosition(new Three.Vector3(10, 10, 10))
			.addRotation(new Three.Vector3(10, 45, 0))
			.end();
		directionalLight.add(this.sceneInstance);

		const camera: StaticCamera = new StaticCamera(75)
			.addPosition(new Three.Vector3(0, 0, 10))
			.end();
		this.modelCache.set("camera", camera);

		const boxMesh: Cube = new Cube(new Three.Vector3(3, 3, 3))
			.addPhongMaterial(new Three.MeshPhongMaterial({ color: 0xffffff }))
			.addShadow()
			.end();
		boxMesh.add(this.sceneInstance);
		const boxMesh2: Cube = new Cube(new Three.Vector3(3, 3, 3))
			.addPhongMaterial(new Three.MeshPhongMaterial({ color: 0xffffff }))
			.addShadow()
			.addPosition(new Three.Vector3(5, 2, 5))
			.end();
		boxMesh2.add(this.sceneInstance);

		const pointLight: PointLight = new PointLight()
			.addPosition(new Three.Vector3(0, 10, 10))
			.addDistance(20)
			.addShadow()
			.addColor(new Three.Color(0xf5b727))
			.addHelper(new Three.Color(0x000000))
			.addIntensity(400)
			.end();
		pointLight.add(this.sceneInstance);

		const floorMesh: Cube = new Cube(new Three.Vector3(30, 1, 30))
			.addPosition(new Three.Vector3(0, -5, 0))
			.addShadow()
			.addPhongMaterial(new Three.MeshPhongMaterial({ color: 0xffffff }))
			.end();
		floorMesh.add(this.sceneInstance);

		this.sceneInstance.background = new Three.Color(0xd4f6ff);
	}

	public update(gameTime: number): void {
		const camera: Cameras = this.modelCache.get<Cameras>("camera");
		if (camera instanceof FreeCamera) camera.update(gameTime);
	}

	public render(renderer: Three.WebGLRenderer): void {
		const camera: Cameras = this.modelCache.get<Cameras>("camera");
		const perspectiveCamera: Three.PerspectiveCamera = camera.get();

		renderer.render(this.sceneInstance, perspectiveCamera);
	}
}
