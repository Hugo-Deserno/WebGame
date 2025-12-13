import type { Model } from "../../types/model.type";
import {
	GameConfigurations,
	type GameConfigurationsConfig,
} from "../core/configuration";
import { KeyManager } from "../core/keyManager";
import Rapier from "../core/rapierSingleton";
import Three from "../core/threeSingleton";
import { Util } from "../util";
import { BaseModel } from "./baseModel";

const WALK_SPEED: number = 1.6;

export class Player extends BaseModel implements Model {
	private readonly playerGeom: Three.CapsuleGeometry;
	private readonly playerMesh: Three.Mesh;
	private readonly playerCamera: Three.PerspectiveCamera;

	private readonly resizeWindow: () => void;

	private rigidBody?: Rapier.RigidBody;
	private collider?: Rapier.Collider;

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

		this.resizeWindow = () => {
			this.playerCamera.aspect = window.innerWidth / window.innerHeight;
			this.playerCamera.updateProjectionMatrix();
		};

		window.addEventListener("resize", this.resizeWindow);
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
		this.rigidBody.setEnabledRotations(false, true, false, true);
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

	public addRotation(rotation: Three.Vector3): Player {
		this.constructredCheck();
		this.playerMesh.rotation.set(rotation.x, rotation.y, rotation.z);
		return this;
	}

	public getPosition(): Three.Vector3 {
		this.notConstructedCheck();
		return this.playerMesh.position;
	}

	public update(gameTime: number): void {
		const gameConfigurations: GameConfigurationsConfig =
			GameConfigurations.getConfigurations();

		if (this.rigidBody) {
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
			movementVector.applyQuaternion(this.playerMesh.quaternion);
			if (movementVector.length() > 0) movementVector.normalize();
			movementVector.multiply(
				new Three.Vector3(
					WALK_SPEED * gameTime * 1000,
					gameConfigurations.gravity * 1000,
					WALK_SPEED * gameTime * 1000,
				),
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
	}

	public end(): Player {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
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
		window.removeEventListener("resize", this.resizeWindow);
	}
}
