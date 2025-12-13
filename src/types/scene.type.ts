import type Three from "../game/core/threeSingleton";

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
	/**
	 * Renders the scene to the canvas
	 *
	 * @param renderer The three webgl renderer instance
	 * */
	render: (renderer: Three.WebGLRenderer) => void;
};
