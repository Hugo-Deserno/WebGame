import type { CameraAxis } from "../../types/cameraAxis.type";
import type { Model } from "../../types/model.type";
import { KeyManager } from "../core/keyManager";
import Rapier from "../core/rapierSingleton";
import Three from "../core/threeSingleton";
import { Util } from "../util";
import { BaseModel } from "./baseModel";

const WALK_SPEED: number = 16;
const MAX_SPEED: number = 200;
const ACCELERATION: number = 0.18;

export class Player extends BaseModel implements Model {
	private readonly playerGeom: Three.CapsuleGeometry;
	private readonly playerMesh: Three.Mesh;
	private readonly playerCamera: Three.PerspectiveCamera;
	private readonly playerModel: Three.Object3D;

	private readonly resizeWindow: () => void;
	private readonly mouseMove: (event: MouseEvent) => void;
	private readonly onJump: () => void;

	private rigidBody?: Rapier.RigidBody;
	private collider?: Rapier.Collider;

	private cameraGyro: CameraAxis;
	private playerSpeed: number;
	private mouseVelocity: Three.Vector2;
	private baseQuaternion: Three.Quaternion;

	private isTouchingGround: boolean;
	private isUserJump: boolean;
	private isMoving: boolean;

	constructor(startSize: Three.Vector2, fieldOfView: number) {
		super();
		this.playerModel = new Three.Object3D();
		this.playerGeom = new Three.CapsuleGeometry(
			startSize.x,
			startSize.y,
			4,
			20,
			1,
		);
		this.playerMesh = new Three.Mesh(
			this.playerGeom,
			new Three.MeshBasicMaterial({ color: 0xffffff }),
		);
		this.playerModel.add(this.playerMesh);
		this.playerCamera = new Three.PerspectiveCamera(
			fieldOfView,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		this.playerModel.add(this.playerCamera);
		this.cameraGyro = {
			yaw: 0,
			pitch: 0,
		};
		this.baseQuaternion = this.playerCamera.quaternion.clone();
		this.mouseVelocity = new Three.Vector2(0, 0);
		this.playerSpeed = WALK_SPEED;

		this.isTouchingGround = false;
		this.isUserJump = false;
		this.isMoving = false;

		this.mouseMove = (event: MouseEvent) => {
			this.mouseVelocity.set(event.movementX, event.movementY);
		};
		this.resizeWindow = () => {
			this.playerCamera.aspect = window.innerWidth / window.innerHeight;
			this.playerCamera.updateProjectionMatrix();
		};
		this.onJump = () => {
			if (!this.rigidBody || !this.isTouchingGround) return;
			this.isUserJump = true;
			this.rigidBody.applyImpulse(
				new Rapier.Vector3(
					0,
					10000 *
						Util.MapRange(
							WALK_SPEED,
							MAX_SPEED,
							0.5,
							1,
							this.playerSpeed,
						),
					0,
				),
				true,
			);
		};

		KeyManager.observeKey("jump", this.onJump);
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

	public addShadow(): Player {
		this.constructredCheck();
		this.playerMesh.receiveShadow = true;
		this.playerMesh.castShadow = true;
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

	public end(): Player {
		this.constructredCheck();
		this.isConstructed = true;
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

	public update(gameTime: number, world: Rapier.World): void {
		let bunnyHop: Function = () => {
			if (!this.collider || !this.rigidBody) return;

			const rayOrigin: Rapier.Vector3 = this.rigidBody.translation();
			rayOrigin.y -=
				this.playerGeom.parameters.height * 0.5 +
				this.playerGeom.parameters.radius -
				0.02;

			const groundCheckRay: Rapier.Ray = new Rapier.Ray(
				rayOrigin,
				new Rapier.Vector3(0, -1, 0),
			);

			const hitCheck: Rapier.RayColliderHit | null = world.castRay(
				groundCheckRay,
				0.15,
				true,
				undefined,
				undefined,
				this.collider,
			);
			if (hitCheck || !this.isUserJump || !this.isMoving) {
				this.playerSpeed = Three.MathUtils.clamp(
					this.playerSpeed / (1.01 + gameTime / 2),
					WALK_SPEED,
					MAX_SPEED,
				);
				this.isTouchingGround = true;
				this.isUserJump = false;
				return;
			}
			this.playerSpeed = Three.MathUtils.clamp(
				this.playerSpeed + ACCELERATION + gameTime,
				WALK_SPEED,
				MAX_SPEED,
			);
			this.isTouchingGround = false;
		};

		let updateCamera: Function = () => {
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
		};

		let updateColliders: Function = () => {
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

				const movementVector: Three.Vector3 = new Three.Vector3(
					0,
					0,
					0,
				);
				this.isMoving = false;
				if (KeyManager.isActionPressed("moveForward")) {
					movementVector.add(new Three.Vector3(0, 0, -0.01));
					this.isMoving = true;
				}
				if (KeyManager.isActionPressed("moveRight")) {
					movementVector.add(new Three.Vector3(0.01, 0, 0));
					this.isMoving = true;
				}
				if (KeyManager.isActionPressed("moveLeft")) {
					movementVector.add(new Three.Vector3(-0.01, 0, 0));
					this.isMoving = true;
				}
				if (KeyManager.isActionPressed("moveBackward")) {
					movementVector.add(new Three.Vector3(0, 0, 0.01));
					this.isMoving = false; // disable backwards b-hopping
				}

				movementVector.applyQuaternion(movementQuaternion);
				if (movementVector.length() > 0) movementVector.normalize();

				const rigidBodyVelocity: Three.Vector3 =
					Util.rapierVectorToThree(this.rigidBody.linvel());
				movementVector.multiplyScalar(
					this.playerSpeed * gameTime * 100,
				);
				movementVector.add(
					new Three.Vector3(0, rigidBodyVelocity.y, 0),
				);
				this.rigidBody.setLinvel(
					Util.threeVectorToRapier(movementVector),
					true,
				);

				this.playerMesh.position.copy(
					Util.rapierVectorToThree(this.rigidBody.translation()),
				);
			}
			this.playerCamera.position.copy(this.playerMesh.position.clone());
		};

		bunnyHop = bunnyHop.bind(this);
		updateCamera = updateCamera.bind(this);
		updateColliders = updateColliders.bind(this);
		bunnyHop();
		updateCamera();
		updateColliders();
	}

	public get(): Three.PerspectiveCamera {
		this.notConstructedCheck();
		return this.playerCamera;
	}

	public add(scene: Three.Scene): void {
		scene.add(this.playerModel);
	}

	public remove(scene?: Three.Scene, world?: Rapier.World): void {
		this.notConstructedCheck();
		this.isAlive = false;
		if (scene) {
			scene.remove(this.playerModel);
		}
		if (world) {
			if (this.collider) world.removeCollider(this.collider, true);
			if (this.rigidBody) world.removeRigidBody(this.rigidBody);
		}

		KeyManager.removeObserver("jump", this.onJump);
		window.removeEventListener("mousemove", this.mouseMove);
		window.removeEventListener("resize", this.resizeWindow);
	}
}
