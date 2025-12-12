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
		window.addEventListener("resize", () => {
			this.perspectiveCamera.aspect =
				window.innerWidth / window.innerHeight;
			this.perspectiveCamera.updateProjectionMatrix();
		});
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

	public getPosition(): Three.Vector3 {
		this.notConstructedCheck();
		return this.perspectiveCamera.position;
	}

	public getRotation(): Three.Vector3 {
		this.notConstructedCheck();
		return new Three.Vector3(
			this.perspectiveCamera.rotation.x,
			this.perspectiveCamera.rotation.y,
			this.perspectiveCamera.rotation.z,
		);
	}

	public get(): Three.PerspectiveCamera {
		this.notConstructedCheck();
		return this.perspectiveCamera;
	}
}
