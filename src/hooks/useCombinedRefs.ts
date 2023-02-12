import { ForwardedRef, useEffect, useRef } from "react";

export function useCombinedRefs<T>(...refs: ForwardedRef<T>[]) {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}
