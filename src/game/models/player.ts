import type { Model } from "../../types/model.type";
import Rapier from "../rapierSingleton";
import Three from "../threeSingleton";
import { Util } from "../util";
import { BaseModel } from "./baseModel";

export class Player extends BaseModel implements Model {
	private readonly playerGeom: Three.CapsuleGeometry;
	private readonly playerMesh: Three.Mesh;
	private readonly playerCamera: Three.PerspectiveCamera;

	private readonly resizeWindow: () => void;

	private rigidBody?: Rapier.RigidBody;
	// private collider?: Rapier.Collider;

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

	public end(): Player {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public remove(scene?: Three.Scene): void {
		this.notConstructedCheck();
		this.isAlive = false;
		if (scene) {
			scene.remove(this.playerMesh);
			scene.remove(this.playerCamera);
		}

		window.removeEventListener("resize", this.resizeWindow);
	}
}
