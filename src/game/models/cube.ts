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

	public AddPosition(position: Three.Vector3): Cube {
		this.constructredCheck();
		this.boxMesh.position.set(position.x, position.y, position.z);
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

	public update(gameTime: number): void {
		if (!this.isConstructed)
			throw new SyntaxError(
				`model is not constructed. Please call .end() to finish it`,
			);
	}

	public add(scene: Three.Scene): void {
		if (!this.isConstructed)
			throw new SyntaxError(
				`model is not constructed. Please call .end() to finish it`,
			);
		scene.add(this.boxMesh);
	}
}
