import type { Model } from "../../types/model.type";
import { KeyManager } from "../common/keyManager";
import Three from "../threeSingleton";
import { BaseModel } from "./baseModel";

export class FreeCamera extends BaseModel implements Model {
	private readonly perspectiveCamera: Three.PerspectiveCamera;
	private flySpeed: number = 1;

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

	public addPosition(position: Three.Vector3): FreeCamera {
		this.constructredCheck();
		this.perspectiveCamera.position.set(position.x, position.y, position.z);
		return this;
	}

	public addRotation(rotation: Three.Vector3): FreeCamera {
		this.constructredCheck();
		this.perspectiveCamera.rotation.set(rotation.x, rotation.y, rotation.z);
		return this;
	}

	public end(): FreeCamera {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public update(gameTime: number): void {
		const movementVector: Three.Vector3 = new Three.Vector3(0, 0, 0);
		if (KeyManager.isActionPressed("moveForward")) {
			movementVector.add(
				new Three.Vector3(0, 0, -0.01 * this.flySpeed * gameTime),
			);
		}
		if (KeyManager.isActionPressed("moveBackward")) {
			movementVector.add(
				new Three.Vector3(0, 0, 0.01 * this.flySpeed * gameTime),
			);
		}
		if (KeyManager.isActionPressed("moveRight")) {
			movementVector.add(
				new Three.Vector3(0.01 * this.flySpeed * gameTime, 0, 0),
			);
		}
		if (KeyManager.isActionPressed("moveLeft")) {
			movementVector.add(
				new Three.Vector3(-0.01 * this.flySpeed * gameTime, 0, 0),
			);
		}
		if (movementVector.length() > 0) movementVector.normalize();
		this.perspectiveCamera.position.add(movementVector);
	}

	public get(): Three.PerspectiveCamera {
		if (!this.isConstructed)
			throw new SyntaxError(
				`model is not constructed. Please call .end() to finish it`,
			);
		return this.perspectiveCamera;
	}
}
