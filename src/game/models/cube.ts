import { BaseModel } from "./baseModel";
import type { Model } from "../../types/model.type";
import Three from "../core/threeSingleton";
import type { ColliderType } from "../../types/colliderType.type";
import { Util } from "../util";
import Rapier from "../core/rapierSingleton";

export class Cube extends BaseModel implements Model {
	private readonly boxGeom: Three.BoxGeometry;
	private readonly boxMesh: Three.Mesh;

	private rigidBody?: Rapier.RigidBody;
	private collider?: Rapier.Collider;

	constructor(startSize: Three.Vector3) {
		super();
		this.boxGeom = new Three.BoxGeometry(
			startSize.x,
			startSize.y,
			startSize.z,
		);
		this.boxMesh = new Three.Mesh(
			this.boxGeom,
			new Three.MeshBasicMaterial({ color: 0xffffff }),
		);
		return this;
	}

	public addShadow(): Cube {
		this.constructredCheck();
		this.boxMesh.receiveShadow = true;
		this.boxMesh.castShadow = true;
		return this;
	}

	public addPosition(position: Three.Vector3): Cube {
		this.constructredCheck();
		if (this.rigidBody) {
			this.rigidBody.setTranslation(
				Util.threeVectorToRapier(position),
				true,
			);
		} else {
			this.boxMesh.position.copy(position);
		}
		return this;
	}

	public addBasicMaterial(material: Three.MeshBasicMaterial): Cube {
		this.constructredCheck();
		this.boxMesh.material = material;
		return this;
	}

	public addPhongMaterial(material: Three.MeshPhongMaterial): Cube {
		this.constructredCheck();
		this.boxMesh.material = material;
		return this;
	}

	public addCollider(
		colliderType: ColliderType,
		rapierWorld: Rapier.World,
	): Cube {
		this.constructredCheck();

		const meshRotation: Rapier.Quaternion = new Rapier.Quaternion(
			this.boxMesh.quaternion.x,
			this.boxMesh.quaternion.y,
			this.boxMesh.quaternion.z,
			this.boxMesh.quaternion.w,
		);

		let rigidBodyDescription: Rapier.RigidBodyDesc = Rapier.RigidBodyDesc[
			Util.colliderTypeToRapierRigidBody(colliderType)
		]()
			.setTranslation(
				this.boxMesh.position.x,
				this.boxMesh.position.y,
				this.boxMesh.position.z,
			)
			.setRotation(meshRotation);

		let colliderDescription = Rapier.ColliderDesc.cuboid(
			0.5 * this.boxGeom.parameters.width,
			0.5 * this.boxGeom.parameters.height,
			0.5 * this.boxGeom.parameters.depth,
		);

		this.rigidBody = rapierWorld.createRigidBody(rigidBodyDescription);
		this.collider = rapierWorld.createCollider(
			colliderDescription,
			this.rigidBody,
		);
		return this;
	}

	public update(): void {
		if (this.rigidBody) {
			this.boxMesh.position.copy(
				Util.rapierVectorToThree(this.rigidBody.translation()),
			);
			this.boxMesh.quaternion.copy(
				Util.rapierQuaternionToThree(this.rigidBody.rotation()),
			);
		}
	}

	public end(): Cube {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public add(scene: Three.Scene): void {
		this.notConstructedCheck();
		scene.add(this.boxMesh);
	}

	public remove(scene?: Three.Scene, world?: Rapier.World): void {
		this.notConstructedCheck();
		this.isAlive = false;
		if (world) {
			if (this.collider) world.removeCollider(this.collider, true);
			if (this.rigidBody) world.removeRigidBody(this.rigidBody);
		}
		if (scene) scene.remove(this.boxMesh);
	}
}
