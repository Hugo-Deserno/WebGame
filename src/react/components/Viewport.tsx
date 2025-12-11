import { useRef, type ReactNode, type RefObject, useEffect } from "react";
import { GameCore } from "../../game/main";
import "../styleSheets/viewport.css";

export default function ViewPort(): ReactNode {
	const canvasRefrence: RefObject<HTMLCanvasElement | null> =
		useRef<HTMLCanvasElement | null>(null);
	const gameCoreRefrence: RefObject<GameCore | null> =
		useRef<GameCore | null>(null);

	useEffect(() => {
		if (gameCoreRefrence.current == null)
			gameCoreRefrence.current = new GameCore();

		if (
			canvasRefrence.current === null ||
			gameCoreRefrence.current.getRunningState()
		)
			return;
		gameCoreRefrence.current.run(canvasRefrence.current);
	}, [canvasRefrence]);

	return (
		<>
			<canvas ref={canvasRefrence} id="game-viewport" />
		</>
	);
}
