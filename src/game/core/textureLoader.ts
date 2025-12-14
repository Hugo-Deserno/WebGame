import Three from "./threeSingleton";

export class TextureLoader {
	private static textureLoader: Three.TextureLoader;
	private static instance: TextureLoader;

	private constructor() {
		TextureLoader.textureLoader = new Three.TextureLoader();
		TextureLoader.instance = this;
	}

	public static getTextureLoader(): Three.TextureLoader {
		if (!this.instance) new TextureLoader();
		return this.textureLoader;
	}
}
