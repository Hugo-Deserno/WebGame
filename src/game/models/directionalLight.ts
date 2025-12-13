import type { Model } from "../../types/model.type";
import {
	GameConfigurations,
	type GameConfigurationsConfig,
} from "../core/configuration";
import Three from "../core/threeSingleton";
import { BaseModel } from "./baseModel";

export class DirectionalLight extends BaseModel implements Model {
	private readonly directionalLight: Three.DirectionalLight;
	private readonly directionalLightHelper: Three.DirectionalLightHelper;

	constructor(intensity: number) {
		super();
		if (!intensity) intensity = 1;
		this.directionalLight = new Three.DirectionalLight(0xffffff, intensity);
		this.directionalLightHelper = new Three.DirectionalLightHelper(
			this.directionalLight,
			1,
			0xffffff,
		);
		this.directionalLightHelper.update();
		this.directionalLightHelper.visible = false;
	}

	public addShadow(
		shadowRange: number,
		resolution?: Three.Vector2,
	): DirectionalLight {
		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		this.constructredCheck();
		this.directionalLight.castShadow = true;
		this.directionalLight.shadow.mapSize.copy(
			resolution ? resolution : new Three.Vector2(1024, 1024),
		);
		this.directionalLight.shadow.bias = -0.0005;
		this.directionalLight.shadow.camera.left = -shadowRange;
		this.directionalLight.shadow.camera.right = shadowRange;
		this.directionalLight.shadow.camera.top = shadowRange;
		this.directionalLight.shadow.camera.bottom = -shadowRange;
		this.directionalLight.shadow.camera.near = 0.5;
		this.directionalLight.shadow.camera.far = shadowRange;

		this.directionalLight.shadow.radius = gameConfigurations.shadowSoftness;
		GameConfigurations.observeConfiguration(
			"shadowSoftness",
			(state: number) => (this.directionalLight.shadow.radius = state),
		);
		return this;
	}

	public addIntensity(intensity: number): DirectionalLight {
		this.constructredCheck();
		this.directionalLight.intensity = intensity;
		return this;
	}

	public addPosition(position: Three.Vector3): DirectionalLight {
		this.constructredCheck();
		this.directionalLight.position.copy(position);
		this.directionalLightHelper.update();
		return this;
	}

	public addRotation(rotation: Three.Vector3): DirectionalLight {
		this.constructredCheck();

		const lightDirection: Three.Vector3 = new Three.Vector3(
			0,
			-1,
			0,
		).applyEuler(
			new Three.Euler(
				Three.MathUtils.degToRad(rotation.x),
				Three.MathUtils.degToRad(rotation.y),
				Three.MathUtils.degToRad(rotation.z),
				"YXZ",
			),
		);

		this.directionalLight.target.position.copy(
			this.directionalLight.position.clone().add(lightDirection),
		);
		this.directionalLight.target.updateMatrixWorld(true);
		this.directionalLightHelper.update();
		return this;
	}

	public addColor(color: Three.Color): DirectionalLight {
		this.constructredCheck();
		this.directionalLight.color = color;
		return this;
	}

	public addHelper(color?: Three.Color): DirectionalLight {
		this.constructredCheck();
		this.directionalLightHelper.visible = true;
		if (color) {
			this.directionalLightHelper.color = color;
			this.directionalLightHelper.update();
		}
		return this;
	}

	public end(): DirectionalLight {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public add(scene: Three.Scene): void {
		this.notConstructedCheck();
		scene.add(this.directionalLight);
		scene.add(this.directionalLightHelper);
	}

	public remove(scene?: Three.Scene): void {
		this.notConstructedCheck();
		this.isAlive = false;
		if (scene) scene.remove(this.directionalLight);
	}
}
