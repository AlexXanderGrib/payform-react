/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { type RefObject, useCallback, useEffect, useState } from "react";

export function useFocus(ref: RefObject<Element>): boolean {
  const [focused, setFocused] = useState(false);

  const onFocus = useCallback(() => setFocused(true), [setFocused]);
  const onBlur = useCallback(() => setFocused(false), [setFocused]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const element = ref.current;

    element.addEventListener("focus", onFocus);
    element.addEventListener("blur", onBlur);

    if (document.activeElement === element) {
      onFocus();
    }

    return () => {
      element.removeEventListener("focus", onFocus);
      element.removeEventListener("blue", onBlur);
    };
  }, [ref.current, onFocus, onBlur]);

  return focused;
}
