import { KeyboardEvent, RefObject, useCallback, useRef } from "react";

export type UseAutoJumpOptions = {
  effect?: (value: string, el: HTMLInputElement) => void;
  dependencies?: unknown[];
  next?: RefObject<HTMLElement>;
  prev?: RefObject<HTMLElement>;
};

export function useAutoJump({
  dependencies = [],
  effect,
  next,
  prev
}: UseAutoJumpOptions) {
  const onUpdate = useCallback(
    (value: string, ref: HTMLInputElement) => {
      setTimeout(() => {
        const result = effect?.(value, ref) ?? true;
        const validity = ref.checkValidity();

        if (result && validity && next?.current) {
          console.log("Should jump to next", next.current);

          next.current.focus();
        }
      });
    },
    [next?.current, ...dependencies]
  );

  const position = useRef(0);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.currentTarget as HTMLInputElement;

      setTimeout(() => {
        const noSelection = target.selectionStart === target.selectionEnd;
        const currentPosition = target.selectionStart;

        const cursorOnEnd =
          noSelection &&
          currentPosition === target.value.length &&
          currentPosition === position.current;

        const cursorOnStart =
          noSelection &&
          currentPosition === 0 &&
          currentPosition === position.current;

        if (
          prev?.current &&
          cursorOnStart &&
          ["ArrowLeft", "Backspace"].includes(event.key)
        ) {
          prev.current.focus();
          return;
        }

        if (next?.current && cursorOnEnd && event.key === "ArrowRight") {
          next.current.focus();
          return;
        }

        position.current = currentPosition ?? 0;
      });
    },
    [prev?.current, next?.current]
  );

  console.log({ next: next?.current, prev: prev?.current });

  return { onUpdate, onKeyDown };
}
