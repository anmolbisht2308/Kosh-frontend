import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False on the server and while hydrating, true afterwards. Keeps first client render identical to the server HTML. */
export const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
