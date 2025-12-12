import type { Model } from "../../types/model.type";
import { KeyManager } from "../core/keyManager";
import Three from "../threeSingleton";
import { BaseModel } from "./baseModel";
import type { CameraAxis } from "../../types/cameraAxis.type";

const FLY_SPEED_NORMAL: number = 20;
const FLY_SPEED_FAST: number = 100;

export class FreeCamera extends BaseModel implements Model {
	private readonly perspectiveCamera: Three.PerspectiveCamera;

	private isMouseDown: boolean;
	private mouseVelocity: Three.Vector2;
	private fieldOfView: number;
	private cameraGyro: CameraAxis;
	private baseQuaternion: Three.Quaternion;
	private flySpeed;

	constructor(fieldOfView: number) {
		super();
		this.perspectiveCamera = new Three.PerspectiveCamera(
			fieldOfView,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		this.cameraGyro = {
			yaw: 0,
			pitch: 0,
		};
		this.mouseVelocity = new Three.Vector2(0, 0);
		this.fieldOfView = fieldOfView;
		this.baseQuaternion = this.perspectiveCamera.quaternion.clone();
		this.isMouseDown = false;
		this.flySpeed = FLY_SPEED_NORMAL;

		window.addEventListener("mousedown", (event: MouseEvent) => {
			if (event.button !== 2) return;
			this.isMouseDown = true;
		});
		window.addEventListener("mouseup", (event: MouseEvent) => {
			if (event.button !== 2) return;
			this.isMouseDown = false;
		});
		window.addEventListener("mousemove", (event: MouseEvent) => {
			this.mouseVelocity.set(event.movementX, event.movementY);
		});
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

	/**
	 * Sets the yaw and pitch that will be converted to user input
	 * */
	public addAxis(cameraAxis: CameraAxis): FreeCamera {
		this.constructredCheck();
		this.cameraGyro = cameraAxis;
		return this;
	}

	public addRotation(rotation: Three.Vector3): FreeCamera {
		this.constructredCheck();
		this.perspectiveCamera.rotation.set(rotation.x, rotation.y, rotation.z);
		this.baseQuaternion = this.perspectiveCamera.quaternion.clone();
		return this;
	}

	public end(): FreeCamera {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public update(gameTime: number): void {
		// camera movement
		if (this.isMouseDown) {
			this.cameraGyro.yaw += this.mouseVelocity.x * 0.005 * -1;
			this.cameraGyro.pitch += this.mouseVelocity.y * 0.005 * -1;

			this.cameraGyro.pitch = Three.MathUtils.clamp(
				this.cameraGyro.pitch,
				Three.MathUtils.degToRad(-80),
				Three.MathUtils.degToRad(75),
			);
		}

		const quaternionYaw: Three.Quaternion =
			new Three.Quaternion().setFromAxisAngle(
				new Three.Vector3(0, 1, 0),
				this.cameraGyro.yaw,
			);

		const quaternionPitch: Three.Quaternion =
			new Three.Quaternion().setFromAxisAngle(
				new Three.Vector3(1, 0, 0),
				this.cameraGyro.pitch,
			);

		this.mouseVelocity = new Three.Vector2(0, 0);
		this.perspectiveCamera.quaternion
			.copy(this.baseQuaternion.clone())
			.multiply(quaternionYaw)
			.multiply(quaternionPitch);

		// Movement
		this.flySpeed = Three.MathUtils.lerp(
			this.flySpeed,
			KeyManager.isActionPressed("sprint")
				? FLY_SPEED_FAST
				: FLY_SPEED_NORMAL,
			1 - Math.exp(-10 * gameTime),
		);

		const movementVector: Three.Vector3 = new Three.Vector3(0, 0, 0);
		if (KeyManager.isActionPressed("moveForward")) {
			movementVector.add(new Three.Vector3(0, 0, -0.01));
		}
		if (KeyManager.isActionPressed("moveBackward")) {
			movementVector.add(new Three.Vector3(0, 0, 0.01));
		}
		if (KeyManager.isActionPressed("moveRight")) {
			movementVector.add(new Three.Vector3(0.01, 0, 0));
		}
		if (KeyManager.isActionPressed("moveLeft")) {
			movementVector.add(new Three.Vector3(-0.01, 0, 0));
		}
		movementVector.applyQuaternion(this.perspectiveCamera.quaternion);
		if (movementVector.length() > 0) movementVector.normalize();
		movementVector.multiply(
			new Three.Vector3(
				this.flySpeed * gameTime,
				this.flySpeed * gameTime,
				this.flySpeed * gameTime,
			),
		);
		this.perspectiveCamera.position.add(movementVector);

		// zoom in functionality
		this.perspectiveCamera.fov = Three.MathUtils.lerp(
			this.perspectiveCamera.fov,
			KeyManager.isActionPressed("zoom")
				? this.fieldOfView - 50
				: this.fieldOfView,
			1 - Math.exp(-30 * gameTime),
		);
		this.perspectiveCamera.updateProjectionMatrix();
	}

	public getPosition(): Three.Vector3 {
		this.notConstructedCheck();
		return this.perspectiveCamera.position;
	}

	/**
	 * returns the yaw and pitch from the user
	 * input
	 * */
	public getAxis(): CameraAxis {
		this.notConstructedCheck();
		return this.cameraGyro;
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
