export type GameConfigurationsConfig = {
	fieldOfView: number;
	shadows: boolean;
	shadowSoftness: number; // range between 0 and 10
	antiAlias: boolean;
	gravity: number;
};

// Singleton Game configuration class
export class GameConfigurations {
	private static instance: GameConfigurations;
	private static configuration: GameConfigurationsConfig;
	private static configurationSignals: Map<(state: unknown) => void, string>;

	/**
	 * Checks if a configuration is in the config. If not, then it errors
	 *
	 * @param ConfigurationName The config name that should be checked
	 * */
	private static configurationEntryExists<
		T extends keyof GameConfigurationsConfig,
	>(configurationName: T): void | never {
		if (GameConfigurations.configuration[configurationName] === undefined)
			throw new RangeError(
				`${configurationName} is not a valid member of game config`,
			);
	}

	/**
	 * Creates the settings config if it isn't created yet
	 * */
	private constructor() {
		GameConfigurations.instance = this;
		GameConfigurations.configuration = {
			fieldOfView: 70,
			antiAlias: true,
			shadows: true,
			shadowSoftness: 2,
			gravity: -125,
		};
		GameConfigurations.configurationSignals = new Map<
			(State: unknown) => void,
			string
		>();
	}

	/**
	 * Gets the current game's configuration struct
	 *
	 * @returns The game's current configuration struct
	 * */
	public static getConfigurations(): GameConfigurationsConfig {
		if (!this.instance) new GameConfigurations();
		return GameConfigurations.configuration;
	}

	/**
	 * Sets a singular configuration globally (not updated via signal)
	 *
	 * @param ConfigurationName the configuration which will be overwritten
	 * @param Value The value the overwritten config entry will be
	 * */
	public static setConfiguration<T extends keyof GameConfigurationsConfig>(
		configurationName: T,
		value: GameConfigurationsConfig[T],
	): void {
		if (!this.instance) new GameConfigurations();
		this.configurationEntryExists(configurationName);

		GameConfigurations.configuration[configurationName] = value;

		// Updates all the signals that match this setting
		// Loop through them, and check if Value (the string and name of property) matches
		// than execute the signal
		GameConfigurations.configurationSignals.forEach(
			(ConfigurationNameEntry: string, Key: (State: unknown) => void) => {
				if (ConfigurationNameEntry !== configurationName) return;
				Key(value);
			},
		);
	}

	/**
	 * Fires a signal to a function when a configuration value gets updated
	 *
	 * @param ConfigurationName The name of the config Entry that will be tracked
	 * @param Callback The callback that will be fired when the setting gets updated
	 * */
	public static observeConfiguration<
		T extends keyof GameConfigurationsConfig,
	>(
		configurationName: T,
		callback: (State: GameConfigurationsConfig[T]) => void,
	) {
		if (!this.instance) new GameConfigurations();
		this.configurationEntryExists(configurationName);

		this.configurationSignals.set(
			callback as (State: unknown) => void,
			configurationName,
		);
	}
}
