export class BaseModel {
	public isConstructed: boolean;
	public isAlive: boolean;

	/**
	 * Checks if the model is already constructed
	 * If that's the case, then it throws an errors
	 * */
	protected constructredCheck(): void {
		if (!this.isAlive) throw new SyntaxError(`Model is removed`);
		if (this.isConstructed)
			throw new SyntaxError(`Model is already constructed`);
	}

	/**
	 * Checks if the model is not constructed
	 * If that's the case, then it throws an errors
	 * */
	protected notConstructedCheck(): void {
		if (!this.isAlive) throw new SyntaxError(`Model is removed`);
		if (!this.isConstructed)
			throw new SyntaxError(
				`model is not constructed. Please call .end() to finish it`,
			);
	}

	constructor() {
		this.isConstructed = false;
		this.isAlive = true;
	}
}
