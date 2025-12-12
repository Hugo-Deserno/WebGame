import { BaseModel } from "./baseModel";
import type { Model } from "../../types/model.type";
import Three from "../threeSingleton";

export class Cube extends BaseModel implements Model {
	private readonly boxGeom: Three.BoxGeometry;
	private readonly boxMesh: Three.Mesh;

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
		this.boxMesh.position.copy(position);
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

	public end(): Cube {
		this.constructredCheck();
		this.isConstructed = true;
		return this;
	}

	public add(scene: Three.Scene): void {
		this.notConstructedCheck();
		scene.add(this.boxMesh);
	}
}
