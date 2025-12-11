export class BaseModel {
	public isConstructed: boolean;

	/**
	 * Checks if the model is already constructed
	 * If that's the case, then it throws an errors
	 * */
	protected constructredCheck(): void {
		if (this.isConstructed)
			throw new SyntaxError(`Model is already constructed`);
	}

	constructor() {
		this.isConstructed = false;
	}
}
