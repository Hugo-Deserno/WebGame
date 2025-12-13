import type {
	ColliderFuncNames,
	ColliderType,
} from "../types/colliderType.type";
import Rapier from "./core/rapierSingleton";
import Three from "./core/threeSingleton";

type Axis = "yaw" | "pitch" | "roll";

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

	/**
	 *Converts the collidertype to the function name used for rigidbodies
	 *
	 * @param colliderType The type of collider which will be converted
	 * @return The collider function name
	 * */
	public static colliderTypeToRapierRigidBody(
		colliderType: ColliderType,
	): ColliderFuncNames {
		if (colliderType === "active") return "dynamic";
		if (colliderType === "passive") return "fixed";
		if (colliderType === "kinematic") return "kinematicPositionBased";
		return "fixed";
	}

	/**
	 * Return the axis rotation from a single axis from a quaternion
	 *
	 * @param quaternion the quaternion which will be excluded
	 * @param axis the axis which will be targeted
	 * @return the picked axis number
	 * */
	public static getAxisFromQuaternion(
		quaternion: Three.Quaternion,
		axis: Axis,
	): number {
		switch (axis) {
			case "yaw": {
				const siny_cosp =
					2 *
					(quaternion.w * quaternion.y + quaternion.z * quaternion.x);
				const cosy_cosp =
					1 -
					2 *
						(quaternion.y * quaternion.y +
							quaternion.z * quaternion.z);
				return Math.atan2(siny_cosp, cosy_cosp);
			}
			case "pitch": {
				const sinp =
					2 *
					(quaternion.w * quaternion.x - quaternion.z * quaternion.y);
				return Math.abs(sinp) >= 1
					? (Math.sign(sinp) * Math.PI) / 2
					: Math.asin(sinp);
			}
			case "roll": {
				const sinr_cosp =
					2 *
					(quaternion.w * quaternion.z + quaternion.x * quaternion.y);
				const cosr_cosp =
					1 -
					2 *
						(quaternion.z * quaternion.z +
							quaternion.x * quaternion.x);
				return Math.atan2(sinr_cosp, cosr_cosp);
			}
			default:
				throw new Error(`Invalid axis: ${axis}`);
		}
	}
}
