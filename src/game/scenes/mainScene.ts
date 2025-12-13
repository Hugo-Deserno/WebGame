import type { Scene } from "../../types/scene.type";
import { DynamicCache } from "../core/cache";
import type { Model } from "../../types/model.type";
import { Cube } from "../models/cube";
import * as Three from "three";
import * as Rapier from "@dimforge/rapier3d";
import { FreeCamera } from "../models/freeCamera";
import { StaticCamera } from "../models/staticCamera";
import { PointLight } from "../models/pointLight";
import { AmbientLight } from "../models/ambientLight";
import { DirectionalLight } from "../models/directionalLight";
import {
	GameConfigurations,
	type GameConfigurationsConfig,
} from "../core/configuration";
import { Player } from "../models/player";
import { Util } from "../util";

type Cameras = FreeCamera | StaticCamera | Player;

export class MainScene implements Scene {
	private readonly sceneInstance: Three.Scene;
	private readonly rapierWorld: Rapier.World;
	private readonly modelCache: DynamicCache<Model>;

	constructor() {
		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		this.sceneInstance = new Three.Scene();
		this.modelCache = new DynamicCache<Model>("modelCache");
		this.rapierWorld = new Rapier.World(
			new Rapier.Vector3(0, gameConfigurations.gravity, 0),
		);

		/**
		 * When pressing shift + F
		 * The user can switch between static cam and free camera
		 * */
		let isFreeCameraEnabled: boolean = false;
		window.addEventListener("keypress", (event: KeyboardEvent) => {
			if (event.key !== "F") return;

			if (!isFreeCameraEnabled) {
				const player: Player = this.modelCache.get<Player>("camera");

				const freeCamera: FreeCamera = new FreeCamera(
					gameConfigurations.fieldOfView,
				)
					.addPosition(player.getPosition())
					.addAxis({ yaw: 0, pitch: player.getAxis().pitch })
					.addRotation(player.getRotation())
					.end();
				this.modelCache.set("camera", freeCamera);
				player.remove(this.sceneInstance);
			} else {
				const freeCamera: FreeCamera =
					this.modelCache.get<FreeCamera>("camera");

				const playerRotation: Three.Euler = new Three.Euler(
					0,
					Util.getAxisFromQuaternion(
						new Three.Quaternion().setFromEuler(
							freeCamera.getRotation(),
						),
						"yaw",
					),
					0,
				);

				const camera: Player = new Player(
					new Three.Vector2(3, 5),
					gameConfigurations.fieldOfView,
				)
					.addPosition(freeCamera.getPosition())
					.addAxis({
						yaw: 0,
						pitch: freeCamera.getAxis().pitch,
					})
					.addCollider(this.rapierWorld)
					.addRotation(playerRotation)
					.end();
				this.modelCache.set("camera", camera);
				freeCamera.remove(this.sceneInstance);
			}
			isFreeCameraEnabled = !isFreeCameraEnabled;
		});
	}

	public loadContents(): void {
		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		const ambientLight: AmbientLight = new AmbientLight().end();
		ambientLight.add(this.sceneInstance);

		const directionalLight: DirectionalLight = new DirectionalLight(1)
			.addShadow(500, new Three.Vector2(12000, 12000))
			.addHelper(new Three.Color(0x000000))
			.addPosition(new Three.Vector3(10, 10, 10))
			.addRotation(new Three.Euler(0.1, 0.78, 0))
			.end();
		directionalLight.add(this.sceneInstance);

		const player: Player = new Player(
			new Three.Vector2(3, 5),
			gameConfigurations.fieldOfView,
		)
			.addPosition(new Three.Vector3(0, 0, 10))
			.addCollider(this.rapierWorld)
			.end();
		this.modelCache.set("camera", player);

		for (let i = 0; i < 100; i++) {
			const boxMesh: Cube = new Cube(new Three.Vector3(3, 3, 3))
				.addPhongMaterial(
					new Three.MeshPhongMaterial({ color: 0xffffff }),
				)
				.addShadow()
				.addPosition(new Three.Vector3(i / 2, i * 3, 0))
				.addCollider("active", this.rapierWorld)
				.end();
			boxMesh.add(this.sceneInstance);
			this.modelCache.set(`cube${i}`, boxMesh);
		}

		const boxMesh: Cube = new Cube(new Three.Vector3(20, 50, 3))
			.addPhongMaterial(new Three.MeshPhongMaterial({ color: 0xffffff }))
			.addShadow()
			.addPosition(new Three.Vector3(10, 5, 0))
			.addRotation(new Three.Euler(0.78, 0, 0))
			.addCollider("passive", this.rapierWorld)
			.end();
		boxMesh.add(this.sceneInstance);

		const floorMesh: Cube = new Cube(new Three.Vector3(2000, 1, 2000))
			.addPosition(new Three.Vector3(0, -5, 0))
			.addShadow()
			.addCollider("passive", this.rapierWorld)
			.addPhongMaterial(new Three.MeshPhongMaterial({ color: 0xffffff }))
			.end();
		floorMesh.add(this.sceneInstance);
		this.modelCache.set("floor", floorMesh);

		const pointLight: PointLight = new PointLight()
			.addPosition(new Three.Vector3(0, 10, 10))
			.addDistance(20)
			.addShadow()
			.addColor(new Three.Color(0xf5b727))
			.addHelper(new Three.Color(0x000000))
			.addIntensity(400)
			.end();
		pointLight.add(this.sceneInstance);

		this.sceneInstance.background = new Three.Color(0xd4f6ff);
	}

	public update(gameTime: number): void {
		this.rapierWorld.step();

		for (let i = 0; i < 100; i++) {
			this.modelCache.get<Cube>(`cube${i}`).update();
		}
		this.modelCache.get<Cube>("floor").update();

		const camera: Cameras = this.modelCache.get<Cameras>("camera");
		if (camera instanceof FreeCamera) camera.update(gameTime);
		if (camera instanceof Player) camera.update(gameTime, this.rapierWorld);
	}

	public render(renderer: Three.WebGLRenderer): void {
		const camera: Cameras = this.modelCache.get<Cameras>("camera");
		const perspectiveCamera: Three.PerspectiveCamera = camera.get();

		renderer.render(this.sceneInstance, perspectiveCamera);
	}
}
