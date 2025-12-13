import type { Model } from "../../types/model.type";
import Three from "../threeSingleton";
import { BaseModel } from "./baseModel";

export class AmbientLight extends BaseModel implements Model {
	private readonly ambientLight: Three.AmbientLight;

	constructor(intensity?: number) {
		super();
		if (!intensity) intensity = 1;
		this.ambientLight = new Three.AmbientLight(0xffffff, intensity);
	}

	public addIntensity(intensity: number): AmbientLight {
		this.constructredCheck();
		this.ambientLight.intensity = intensity;
		return this;
	}

	public addColor(color: Three.Color): AmbientLight {
		this.constructredCheck();
		this.ambientLight.color = color;
		return this;
	}

	public end(): AmbientLight {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public add(scene: Three.Scene): void {
		this.notConstructedCheck();
		scene.add(this.ambientLight);
	}

	public remove(scene?: Three.Scene): void {
		this.notConstructedCheck();
		this.isAlive = false;
		if (scene) scene.remove(this.ambientLight);
	}
}
