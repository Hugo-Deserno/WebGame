import { BaseModel } from "./baseModel";
import type { Model } from "../../types/model.type";
import Three from "../core/threeSingleton";
import type { ColliderType } from "../../types/colliderType.type";
import { Util } from "../util";
import Rapier from "../core/rapierSingleton";
import testTexture from "../../assets/textures/testTexture.png";
import { TextureLoader } from "../core/textureLoader";

/**
 * Tri planer texture repeat
 * */
class TestCubeShaders {
	/**
	 * The function that should be bound to the material.onbeforecompile
	 *
	 * */
	public static onBeforeCompile(shader: any) {
		shader.uniforms.triScale = { value: 0.2 }; // tiles per unit

		shader.vertexShader = shader.vertexShader.replace(
			"#include <common>",
			`
    #include <common>
    varying vec3 vObjPos;
    varying vec3 vObjNormal;
    `,
		);

		shader.vertexShader = shader.vertexShader.replace(
			"#include <beginnormal_vertex>",
			`
    #include <beginnormal_vertex>
    vObjNormal = normalize(normal);
    `,
		);

		shader.vertexShader = shader.vertexShader.replace(
			"#include <begin_vertex>",
			`
    #include <begin_vertex>
    vObjPos = position;
    `,
		);

		shader.fragmentShader = shader.fragmentShader.replace(
			"#include <common>",
			`
    #include <common>
    uniform float triScale;
    varying vec3 vObjPos;
    varying vec3 vObjNormal;
    `,
		);

		shader.fragmentShader = shader.fragmentShader.replace(
			"#include <map_fragment>",
			`
    vec3 n = abs(normalize(vObjNormal));
    n /= (n.x + n.y + n.z);

    vec2 uvX = vObjPos.zy * triScale;
    vec2 uvY = vObjPos.xz * triScale;
    vec2 uvZ = vObjPos.xy * triScale;

    vec4 tx = texture2D(map, uvX);
    vec4 ty = texture2D(map, uvY);
    vec4 tz = texture2D(map, uvZ);

    diffuseColor *= tx * n.x + ty * n.y + tz * n.z;
    `,
		);
	}
}

export class TestCube extends BaseModel implements Model {
	private readonly boxGeom: Three.BoxGeometry;
	private readonly boxMesh: Three.Mesh;
	private readonly boxTexture: Three.Texture;

	private rigidBody?: Rapier.RigidBody;
	private collider?: Rapier.Collider;

	constructor(startSize: Three.Vector3) {
		super();
		const textureLoader: Three.TextureLoader =
			TextureLoader.getTextureLoader();
		this.boxTexture = textureLoader.load(testTexture);
		this.boxTexture.colorSpace = Three.SRGBColorSpace;
		this.boxTexture.wrapS = Three.RepeatWrapping;
		this.boxTexture.wrapT = Three.RepeatWrapping;
		this.boxTexture.repeat.set(50, 50);
		this.boxTexture.minFilter = Three.LinearMipmapLinearFilter;
		this.boxTexture.magFilter = Three.LinearFilter;
		this.boxTexture.generateMipmaps = true;

		this.boxGeom = new Three.BoxGeometry(
			startSize.x,
			startSize.y,
			startSize.z,
		);
		const meshBasicMaterial: Three.MeshBasicMaterial =
			new Three.MeshBasicMaterial({
				color: 0xffffff,
				map: this.boxTexture,
			});
		meshBasicMaterial.onBeforeCompile = TestCubeShaders.onBeforeCompile;

		this.boxMesh = new Three.Mesh(this.boxGeom, meshBasicMaterial);
		return this;
	}

	public addShadow(): TestCube {
		this.constructredCheck();
		this.boxMesh.receiveShadow = true;
		this.boxMesh.castShadow = true;
		return this;
	}

	public addRotation(rotation: Three.Euler): TestCube {
		this.constructredCheck();
		this.boxMesh.rotation.set(
			rotation.x,
			rotation.y,
			rotation.z,
			rotation.order,
		);
		return this;
	}

	public addPosition(position: Three.Vector3): TestCube {
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

	public addBasicMaterial(material: Three.MeshBasicMaterial): TestCube {
		this.constructredCheck();
		material.map = this.boxTexture;
		material.onBeforeCompile = TestCubeShaders.onBeforeCompile;
		this.boxMesh.material = material;
		return this;
	}

	public addPhongMaterial(material: Three.MeshPhongMaterial): TestCube {
		this.constructredCheck();
		material.map = this.boxTexture;
		material.onBeforeCompile = TestCubeShaders.onBeforeCompile;
		this.boxMesh.material = material;
		return this;
	}

	public addCollider(
		colliderType: ColliderType,
		rapierWorld: Rapier.World,
	): TestCube {
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

	public end(): TestCube {
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
