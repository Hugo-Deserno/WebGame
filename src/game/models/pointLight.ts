import type { Model } from "../../types/model.type";
import Three from "../threeSingleton";
import { BaseModel } from "./baseModel";

export class PointLight extends BaseModel implements Model {
	private readonly pointLight: Three.SpotLight;

	constructor(intensity?: number, distance?: number, decay?: number) {
		super();
		if (!intensity) intensity = 1;
		if (!distance) distance = 100;
		if (!decay) distance = 2;
		this.pointLight = new Three.SpotLight(
			0xffffff,
			intensity,
			distance,
			decay,
		);
	}

	public addShadow(resolution?: Three.Vector2): PointLight {
		this.constructredCheck();
		this.pointLight.castShadow = true;
		this.pointLight.shadow.mapSize.copy(
			resolution ? resolution : new Three.Vector2(1024, 1024),
		);
		this.pointLight.shadow.radius = 2;
		this.pointLight.shadow.bias = -0.0005;
		return this;
	}

	public addPosition(position: Three.Vector3): PointLight {
		this.constructredCheck();
		this.pointLight.position.copy(position);
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

	public end(): PointLight {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public add(scene: Three.Scene): void {
		this.notConstructedCheck();
		scene.add(this.pointLight);
	}
}
