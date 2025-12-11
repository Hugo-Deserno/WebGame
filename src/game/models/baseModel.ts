export class BaseModel {
	public isConstructed: boolean;

	protected constructredCheck(): void {
		if (this.isConstructed)
			throw new SyntaxError(`Model is already constructed`);
	}

	constructor() {
		this.isConstructed = false;
	}
}
