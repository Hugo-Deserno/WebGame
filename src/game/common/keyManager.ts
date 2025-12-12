import { KEY_MAP } from "../keyMap";

type Actions = keyof typeof KEY_MAP;
type ObserverPair = [Actions, () => void];

export class KeyManager {
	private static readonly observers: Set<ObserverPair> =
		new Set<ObserverPair>();
	private static readonly currentPressedKey: Set<Actions> =
		new Set<Actions>();
	private static isRunning: boolean = false;

	/**
	 * Does varying misc stuff. Initializes the class and checks for types
	 *
	 * @param action The action which should be checked by the error checker inside the roamer
	 * */
	private static keyRoamer(action: Actions): void {
		if (!this.isRunning) this.init();
		if (!KEY_MAP[action])
			throw new RangeError(`${action} is not a valid key action`);
	}

	private static init(): void {
		this.isRunning = true;
		window.addEventListener("keypress", (event: KeyboardEvent) => {
			this.observers.forEach((observerPair: ObserverPair) => {
				if (!KEY_MAP[observerPair[0]].includes(event.key.toLowerCase()))
					return;
				observerPair[1]();
			});
		});
		window.addEventListener("keydown", (event: KeyboardEvent) => {
			Object.entries(KEY_MAP).forEach(
				(keyMapEntry: [string, Array<string>]) => {
					const action = keyMapEntry[0] as Actions;
					if (
						!keyMapEntry[1].includes(event.key.toLowerCase()) ||
						this.currentPressedKey.has(action)
					)
						return;
					this.currentPressedKey.add(action);
				},
			);
		});
		window.addEventListener("keyup", (event: KeyboardEvent) => {
			Object.entries(KEY_MAP).forEach(
				(keyMapEntry: [string, Array<string>]) => {
					const action = keyMapEntry[0] as Actions;
					if (
						!keyMapEntry[1].includes(event.key.toLowerCase()) ||
						!this.currentPressedKey.has(action)
					)
						return;
					this.currentPressedKey.delete(action);
				},
			);
		});
	}

	/**
	 * Check if a key is currently being pressed
	 *
	 * @param action the action which should be checked
	 * @returns if the action is pressed, then it'll be true. Otherwise false
	 * */
	public static isActionPressed(action: Actions): boolean {
		this.keyRoamer(action);
		return this.currentPressedKey.has(action);
	}

	/**
	 * Fires function when a action is pressed
	 *
	 * @param action the action which will fire the function
	 * @param fn the function that will be fired when the action triggers
	 * */
	public static onPressKey(action: Actions, fn: () => void): void {
		this.keyRoamer(action);
		this.observers.add([action, fn]);
	}

	// Might be a good idea to later on make a set / remove function for this
	// will prob do when custom keybinds get added. It isn't much needed right now

	/**
	 * Sets a action to a new set of keybinds
	 *
	 * @param action the action which will get a new set of keybinds
	 * @param key the array of keys that will take it's place
	 * */
	public static setAction(action: Actions, key: Array<string>): void {
		this.keyRoamer(action);
		KEY_MAP[action] = key;
	}

	/**
	 * Returns the keys bounds to an action
	 *
	 * @param action the action which's keys will be fetched
	 * @returns the array of keys connected to that action
	 * */
	public static getKeysFromAction(action: Actions): Array<string> {
		this.keyRoamer(action);
		return KEY_MAP[action];
	}
}
