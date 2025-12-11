export class Util {
	public static toDegree(radians: number): number {
		return radians * (180 / Math.PI);
	}

	public static toRadian(degree: number): number {
		return degree * (Math.PI / 180);
	}
}
