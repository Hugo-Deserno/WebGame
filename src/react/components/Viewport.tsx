import { useRef, type ReactNode, type RefObject, useEffect } from "react";
import { GameCore } from "../../game/main";
import "../styleSheets/viewport.css";

export default function ViewPort(): ReactNode {
	const canvasRefrence: RefObject<HTMLCanvasElement | null> =
		useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (canvasRefrence.current === null || GameCore.getRunningState())
			return;
		GameCore.run(canvasRefrence.current);
	}, [canvasRefrence]);

	return (
		<>
			<canvas ref={canvasRefrence} id="game-viewport" />
		</>
	);
}
