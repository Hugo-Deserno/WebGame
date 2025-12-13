import type { Model } from "../../types/model.type";
import Three from "../core/threeSingleton";
import { BaseModel } from "./baseModel";

export class StaticCamera extends BaseModel implements Model {
	private readonly perspectiveCamera: Three.PerspectiveCamera;

	private readonly resizeWindow: () => void;

	constructor(fieldOfView: number) {
		super();
		this.perspectiveCamera = new Three.PerspectiveCamera(
			fieldOfView,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		this.resizeWindow = () => {
			this.perspectiveCamera.aspect =
				window.innerWidth / window.innerHeight;
			this.perspectiveCamera.updateProjectionMatrix();
		};

		window.addEventListener("resize", this.resizeWindow);
		return this;
	}

	public addPosition(position: Three.Vector3): StaticCamera {
		this.constructredCheck();
		this.perspectiveCamera.position.set(position.x, position.y, position.z);
		return this;
	}

	public addRotation(rotation: Three.Euler): StaticCamera {
		this.constructredCheck();
		this.perspectiveCamera.rotation.set(
			rotation.x,
			rotation.y,
			rotation.z,
			rotation.order,
		);
		return this;
	}

	public end(): StaticCamera {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public getPosition(): Three.Vector3 {
		this.notConstructedCheck();
		return this.perspectiveCamera.position;
	}

	public getRotation(): Three.Euler {
		this.notConstructedCheck();
		return this.perspectiveCamera.rotation;
	}

	public get(): Three.PerspectiveCamera {
		this.notConstructedCheck();
		return this.perspectiveCamera;
	}

	public remove(scene?: Three.Scene): void {
		this.notConstructedCheck();
		this.isAlive = false;
		window.removeEventListener("resize", this.resizeWindow);
		if (scene) scene.remove(this.perspectiveCamera);
	}
}
