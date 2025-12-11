import type Three from "../game/threeSingleton";

export type Scene = {
	/**
	 * creates the scene and applies the models
	 * */
	loadContents: () => void;
	/**
	 * Updates and renders a scene.
	 *
	 * @param gameTime the deltatime that happened betweent he last frame
	 * */
	update: (gameTime: number) => void;

	render: (renderer: Three.WebGLRenderer) => void;
};
