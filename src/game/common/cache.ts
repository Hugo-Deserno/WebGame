export class Cache<T> {
	protected cacheName: string;
	protected readonly cacheMap: Map<string, T>;

	constructor(cacheName: string) {
		this.cacheMap = new Map<string, T>();
		this.cacheName = cacheName;
	}

	public get(key: string): T {
		if (!this.cacheMap.has(key))
			throw new RangeError(
				`${key} isn't a valid key inside cache ${this.cacheName}`,
			);
		return this.cacheMap.get(key) as T;
	}

	/**
	 * Inserts or updates an object with a given a key
	 *
	 * @param key the key which will be assigned to the object
	 * @param the object that will be cached
	 * */
	public set(key: string, object: T): void {
		this.cacheMap.set(key, object);
	}

	/**
	 * Removes an item from the cache
	 *
	 * @param key the key which will be removed from the cache
	 * @returns if the remove operation is succesful, it will be true. else false
	 * */
	public delete(key: string): boolean {
		return this.cacheMap.delete(key);
	}
}

/**
 * A cache that only accepts a group of types
 * Like Models or scenes
 * */
export class DynamicCache<T> extends Cache<T> {
	/**
	 * Gets a object from the cache with the type given in the generic
	 *
	 * @param key the key which will be grabbed from the cache
	 * @returns the object with the type given by the generic
	 * */
	public get<D extends T>(key: string): D {
		if (!this.cacheMap.has(key))
			throw new RangeError(
				`${key} isn't a valid key inside cache ${this.cacheName}`,
			);
		const object: T = this.cacheMap.get(key) as T;
		return object as D;
	}
}

/**
 * A cache that excepts any types as storage
 * */
export class LooseCache extends Cache<unknown> {
	/**
	 * Gets a object from the cache with the type given in the generic
	 *
	 * @param key the key which will be grabbed from the cache
	 * @returns the object with the type given by the generic
	 * */
	public get<D>(key: string): D {
		if (!this.cacheMap.has(key))
			throw new RangeError(
				`${key} isn't a valid key inside cache ${this.cacheName}`,
			);
		const object: unknown = this.cacheMap.get(key);
		return object as D;
	}
}
