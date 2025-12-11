import type { Model } from "../../types/model.type";
import Three from "../threeSingleton";
import { BaseModel } from "./baseModel";

export class StaticCamera extends BaseModel implements Model {
	private readonly perspectiveCamera: Three.PerspectiveCamera;

	constructor(fieldOfView: number) {
		super();
		this.perspectiveCamera = new Three.PerspectiveCamera(
			fieldOfView,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		return this;
	}

	public addPosition(position: Three.Vector3): StaticCamera {
		this.constructredCheck();
		this.perspectiveCamera.position.set(position.x, position.y, position.z);
		return this;
	}

	public addRotation(rotation: Three.Vector3): StaticCamera {
		this.constructredCheck();
		this.perspectiveCamera.rotation.set(rotation.x, rotation.y, rotation.z);
		return this;
	}

	public end(): StaticCamera {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public get(): Three.PerspectiveCamera {
		if (!this.isConstructed)
			throw new SyntaxError(
				`model is not constructed. Please call .end() to finish it`,
			);
		return this.perspectiveCamera;
	}
}
