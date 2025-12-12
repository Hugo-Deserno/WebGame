import type Three from "../game/threeSingleton";

export type Model = {
	/**
	 * Determins if the model is constructed
	 * */
	isConstructed: boolean;
	/**
	 * Updates the model and preforms changes
	 * @see works after building
	 * */
	update?: (gameTime: number) => void;
	/**
	 * ends the builder and signals it's ready for production
	 * */
	end: () => unknown;
	/**
	 * Adds the model to the scene;
	 *
	 * @param scene The scene which the model will be added to;
	 * @see works after building
	 * */
	add?: (scene: Three.Scene) => void;
	/**
	 * Returns resources from the model
	 *
	 * @returns certain resources from the model
	 * @see works after building
	 * */
	get?: () => unknown;
};
