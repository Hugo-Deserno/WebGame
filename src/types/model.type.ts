import type Rapier from "../game/rapierSingleton";
import type Three from "../game/threeSingleton";

export type Model = {
	/**
	 * Determins if the model is constructed
	 * */
	isConstructed: boolean;
	/**
	 * Determins if the model still exists
	 * */
	isAlive: boolean;
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
	/**
	 * Removes a model from the scene and unbinds internals
	 *
	 * @param scene if users has bound it to a scene
	 * */
	remove: (scene?: Three.Scene, world?: Rapier.World) => void;
};
