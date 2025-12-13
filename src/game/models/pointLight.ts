import type { Model } from "../../types/model.type";
import {
	GameConfigurations,
	type GameConfigurationsConfig,
} from "../core/configuration";
import Three from "../threeSingleton";
import { BaseModel } from "./baseModel";

export class PointLight extends BaseModel implements Model {
	private readonly pointLight: Three.PointLight;
	private readonly pointLightHelper: Three.PointLightHelper;

	constructor(intensity?: number, distance?: number, decay?: number) {
		super();
		if (!intensity) intensity = 1;
		if (!distance) distance = 100;
		if (!decay) distance = 2;
		this.pointLight = new Three.PointLight(
			0xffffff,
			intensity,
			distance,
			decay,
		);
		this.pointLightHelper = new Three.PointLightHelper(
			this.pointLight,
			1,
			0xffffff,
		);
		this.pointLightHelper.update();
		this.pointLightHelper.visible = false;
	}

	public addShadow(resolution?: Three.Vector2): PointLight {
		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		this.constructredCheck();
		this.pointLight.castShadow = true;
		this.pointLight.shadow.mapSize.copy(
			resolution ? resolution : new Three.Vector2(1024, 1024),
		);
		this.pointLight.shadow.bias = -0.0005;
		this.pointLight.shadow.camera.near = 0.5;
		this.pointLight.shadow.camera.far = this.pointLight.distance;

		this.pointLight.shadow.radius = gameConfigurations.shadowSoftness;
		GameConfigurations.observeConfiguration(
			"shadowSoftness",
			(state: number) => (this.pointLight.shadow.radius = state),
		);
		return this;
	}

	public addPosition(position: Three.Vector3): PointLight {
		this.constructredCheck();
		this.pointLight.position.copy(position);
		this.pointLightHelper.update();
		return this;
	}

	public addIntensity(intensity: number): PointLight {
		this.constructredCheck();
		this.pointLight.intensity = intensity;
		return this;
	}

	public addDistance(distance: number): PointLight {
		this.constructredCheck();
		this.pointLight.distance = distance;
		this.pointLight.shadow.camera.far = this.pointLight.distance;
		return this;
	}

	public addDecay(decay: number): PointLight {
		this.constructredCheck();
		this.pointLight.decay = decay;
		return this;
	}

	public addColor(color: Three.Color): PointLight {
		this.constructredCheck();
		this.pointLight.color = color;
		return this;
	}

	public addHelper(color?: Three.Color): PointLight {
		this.constructredCheck();
		this.pointLightHelper.visible = true;
		if (color) {
			this.pointLightHelper.color = color;
			this.pointLightHelper.update();
		}
		return this;
	}

	public end(): PointLight {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public add(scene: Three.Scene): void {
		this.notConstructedCheck();
		scene.add(this.pointLight);
		scene.add(this.pointLightHelper);
	}

	public remove(scene?: Three.Scene): void {
		this.notConstructedCheck();
		this.isAlive = false;
		if (scene) scene.remove(this.ambientLight);
	}
}
