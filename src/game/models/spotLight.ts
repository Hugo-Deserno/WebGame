import type { Model } from "../../types/model.type";
import Three from "../threeSingleton";
import { BaseModel } from "./baseModel";

export class SpotLight extends BaseModel implements Model {
	private readonly spotLight: Three.SpotLight;

	constructor(
		intensity?: number,
		distance?: number,
		angle?: number,
		decay?: number,
	) {
		super();
		if (!intensity) intensity = 1;
		if (!distance) distance = 100;
		if (!decay) decay = 2;
		if (!angle) angle = 45;
		this.spotLight = new Three.SpotLight(
			0xffffff,
			intensity,
			distance,
			angle * (Math.PI / 180), // assuming angle provided in degrees
			0.4, // <-- more reasonable penumbra
			decay,
		);
	}

	public addShadow(resolution?: Three.Vector2): SpotLight {
		this.constructredCheck();
		this.spotLight.castShadow = true;
		this.spotLight.shadow.mapSize.copy(
			resolution ? resolution : new Three.Vector2(1024, 1024),
		);
		this.spotLight.shadow.radius = 8;
		this.spotLight.shadow.bias = -0.0005;
		return this;
	}

	public addPosition(position: Three.Vector3): SpotLight {
		this.constructredCheck();
		this.spotLight.position.copy(position);
		return this;
	}

	public addRotation(rotation: Three.Vector3): SpotLight {
		this.constructredCheck();
		this.spotLight.rotation.setFromVector3(rotation, "XYZ");
		return this;
	}

	public addIntensity(intensity: number): SpotLight {
		this.constructredCheck();
		this.spotLight.intensity = intensity;
		return this;
	}

	public addDistance(distance: number): SpotLight {
		this.constructredCheck();
		this.spotLight.distance = distance;
		return this;
	}

	public addDecay(decay: number): SpotLight {
		this.constructredCheck();
		this.spotLight.decay = decay;
		return this;
	}

	public addColor(color: Three.Color): SpotLight {
		this.constructredCheck();
		this.spotLight.color = color;
		return this;
	}

	public end(): SpotLight {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public add(scene: Three.Scene): void {
		this.notConstructedCheck();
		scene.add(this.spotLight);
	}
}
