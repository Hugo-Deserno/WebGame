import Rapier from "./rapierSingleton";
import Three from "./threeSingleton";

export class Util {
	/**
	 * Converts a three vector3 to a rapier vector3
	 *
	 * @param threeVector The vector3 from three
	 * @returns A vector3 from rapier
	 * */
	public static threeVectorToRapier(
		threeVector: Three.Vector3,
	): Rapier.Vector3 {
		return new Rapier.Vector3(threeVector.x, threeVector.y, threeVector.z);
	}

	/**
	 * Converts a rapier vector3 to a three vector3
	 *
	 * @param threeVector The vector3 from rapier
	 * @returns A vector3 from three
	 * */
	public static rapierVectorToThree(
		rapierVector: Rapier.Vector3,
	): Three.Vector3 {
		return new Three.Vector3(
			rapierVector.x,
			rapierVector.y,
			rapierVector.z,
		);
	}

	/**
	 * Converts a three quaternion to a rapier quaternion
	 *
	 * @param threeVector The quaternion from three
	 * @returns A quaternion from rapier
	 * */
	public static threeQuaternionToRapier(
		threeQuaternion: Three.Quaternion,
	): Rapier.Quaternion {
		return new Rapier.Quaternion(
			threeQuaternion.x,
			threeQuaternion.y,
			threeQuaternion.z,
			threeQuaternion.w,
		);
	}

	/**
	 * Converts a rapier quaternion to a three quaternion
	 *
	 * @param threeVector The quaternion from rapier
	 * @returns A quaternion from three
	 * */
	public static rapierQuaternionToThree(
		rapierQuaternion: Rapier.Quaternion,
	): Three.Quaternion {
		return new Three.Quaternion(
			rapierQuaternion.x,
			rapierQuaternion.y,
			rapierQuaternion.z,
			rapierQuaternion.w,
		);
	}
}
