import type { CameraAxis } from "../../types/cameraAxis.type";
import type { Model } from "../../types/model.type";
import { KeyManager } from "../core/keyManager";
import Rapier from "../core/rapierSingleton";
import Three from "../core/threeSingleton";
import { Util } from "../util";
import { BaseModel } from "./baseModel";

const WALK_SPEED: number = 16;

export class Player extends BaseModel implements Model {
	private readonly playerGeom: Three.CapsuleGeometry;
	private readonly playerMesh: Three.Mesh;
	private readonly playerCamera: Three.PerspectiveCamera;

	private readonly resizeWindow: () => void;
	private readonly mouseMove: (event: MouseEvent) => void;

	private rigidBody?: Rapier.RigidBody;
	private collider?: Rapier.Collider;

	private cameraGyro: CameraAxis;
	private mouseVelocity: Three.Vector2;
	private baseQuaternion: Three.Quaternion;

	constructor(startSize: Three.Vector2, fieldOfView: number) {
		super();
		this.playerGeom = new Three.CapsuleGeometry(
			startSize.x,
			startSize.y,
			4,
			8,
			1,
		);
		this.playerMesh = new Three.Mesh(
			this.playerGeom,
			new Three.MeshBasicMaterial({ color: 0xffffff }),
		);
		this.playerCamera = new Three.PerspectiveCamera(
			fieldOfView,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		this.cameraGyro = {
			yaw: 0,
			pitch: 0,
		};
		this.baseQuaternion = this.playerCamera.quaternion.clone();
		this.mouseVelocity = new Three.Vector2(0, 0);

		this.mouseMove = (event: MouseEvent) => {
			this.mouseVelocity.set(event.movementX, event.movementY);
		};
		this.resizeWindow = () => {
			this.playerCamera.aspect = window.innerWidth / window.innerHeight;
			this.playerCamera.updateProjectionMatrix();
		};

		window.addEventListener("resize", this.resizeWindow);
		window.addEventListener("mousemove", this.mouseMove);
		return this;
	}

	/**
	 * Sets the yaw and pitch that will be converted to user input
	 * */
	public addAxis(cameraAxis: CameraAxis): Player {
		this.constructredCheck();
		this.cameraGyro = cameraAxis;
		return this;
	}

	public addCollider(rapierWorld: Rapier.World): Player {
		this.constructredCheck();

		const meshRotation: Rapier.Quaternion = new Rapier.Quaternion(
			this.playerMesh.quaternion.x,
			this.playerMesh.quaternion.y,
			this.playerMesh.quaternion.z,
			this.playerMesh.quaternion.w,
		);

		let rigidBodyDescription: Rapier.RigidBodyDesc =
			Rapier.RigidBodyDesc.dynamic()
				.setTranslation(
					this.playerMesh.position.x,
					this.playerMesh.position.y,
					this.playerMesh.position.z,
				)
				.setRotation(meshRotation)
				.setLinearDamping(0.5)
				.setAngularDamping(1.0);

		let colliderDescription = Rapier.ColliderDesc.capsule(
			0.5 * this.playerGeom.parameters.height,
			this.playerGeom.parameters.radius,
		)
			.setRestitution(0.0)
			.setFriction(0.7);

		this.rigidBody = rapierWorld.createRigidBody(rigidBodyDescription);
		this.rigidBody.setEnabledRotations(false, false, false, true);
		this.collider = rapierWorld.createCollider(
			colliderDescription,
			this.rigidBody,
		);
		return this;
	}

	public addPosition(position: Three.Vector3): Player {
		this.constructredCheck();
		if (this.rigidBody) {
			this.rigidBody.setTranslation(
				Util.threeVectorToRapier(position),
				true,
			);
		} else {
			this.playerMesh.position.copy(position);
		}
		return this;
	}

	public addRotation(rotation: Three.Euler): Player {
		this.constructredCheck();
		this.playerMesh.rotation.set(
			rotation.x,
			rotation.y,
			rotation.z,
			rotation.order,
		);
		this.baseQuaternion = this.playerMesh.quaternion.clone();
		return this;
	}

	public getPosition(): Three.Vector3 {
		this.notConstructedCheck();
		return this.playerMesh.position;
	}

	public getRotation(): Three.Euler {
		this.notConstructedCheck();
		return this.playerMesh.rotation;
	}

	/**
	 * returns the yaw and pitch from the user
	 * input
	 * */
	public getAxis(): CameraAxis {
		this.notConstructedCheck();
		return this.cameraGyro;
	}

	public end(): Player {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public update(gameTime: number): void {
		this.cameraGyro.yaw += this.mouseVelocity.x * 0.005 * -1;
		this.cameraGyro.pitch += this.mouseVelocity.y * 0.005 * -1;

		this.cameraGyro.pitch = Three.MathUtils.clamp(
			this.cameraGyro.pitch,
			Three.MathUtils.degToRad(-80),
			Three.MathUtils.degToRad(75),
		);

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
		this.playerCamera.quaternion
			.copy(this.baseQuaternion.clone())
			.multiply(quaternionYaw)
			.multiply(quaternionPitch);

		// converts the camera into the playermesh
		const playerCameraEuler: Three.Euler =
			new Three.Euler().setFromQuaternion(
				this.playerCamera.quaternion,
				"YXZ",
			);
		playerCameraEuler.x = 0;
		playerCameraEuler.z = 0;
		this.playerMesh.quaternion.setFromEuler(playerCameraEuler);

		// handles movement for the rigidbody
		if (this.rigidBody) {
			const movementQuaternion = new Three.Quaternion().setFromEuler(
				new Three.Euler(
					0,
					Util.getAxisFromQuaternion(
						this.playerMesh.quaternion,
						"yaw",
					),
					0,
					"YXZ",
				),
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
			movementVector.applyQuaternion(movementQuaternion);
			if (movementVector.length() > 0) movementVector.normalize();

			const rigidBodyVelocity: Three.Vector3 = Util.rapierVectorToThree(
				this.rigidBody.linvel(),
			);
			movementVector.multiplyScalar(WALK_SPEED * gameTime * 100);
			movementVector.add(new Three.Vector3(0, rigidBodyVelocity.y, 0));

			this.rigidBody.setLinvel(
				Util.threeVectorToRapier(movementVector),
				true,
			);
			this.playerMesh.position.copy(
				Util.rapierVectorToThree(this.rigidBody.translation()),
			);
		}
		this.playerCamera.position.copy(this.playerMesh.position.clone());
	}

	public get(): Three.PerspectiveCamera {
		this.notConstructedCheck();
		return this.playerCamera;
	}

	public remove(scene?: Three.Scene, world?: Rapier.World): void {
		this.notConstructedCheck();
		this.isAlive = false;
		if (scene) {
			scene.remove(this.playerMesh);
			scene.remove(this.playerCamera);
		}
		if (world) {
			if (this.collider) world.removeCollider(this.collider, true);
			if (this.rigidBody) world.removeRigidBody(this.rigidBody);
		}

		window.removeEventListener("mousemove", this.mouseMove);
		window.removeEventListener("resize", this.resizeWindow);
	}
}
