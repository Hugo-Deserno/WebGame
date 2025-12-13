/**
 * We make everything lowercase so shift + key doesn't
 * screw everything up. Nor do i need to add multiple copies of the
 * same key
 * */
export const KEY_MAP = {
	moveForward: ["w", "arrowup"],
	moveBackward: ["s", "arrowdown"],
	moveRight: ["d", "arrowright"],
	moveLeft: ["a", "arrowleft"],
	zoom: ["z"],
	sprint: ["shift"],
	jump: [" "], // spacebar
};
