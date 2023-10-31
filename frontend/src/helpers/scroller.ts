import { scroll } from "quasar";
const { getScrollTarget, setVerticalScrollPosition } = scroll;

/**
 * Vertical scroll to an element.
 *
 * @param element html element to scroll to.
 * @param durationMs scroll duration in ms.
 */
export function scrollToElement(
  element: HTMLElement,
  durationMs: number = 500,
) {
  if (!(element && element.offsetTop)) return;
  const target = getScrollTarget(element);
  const offset = element.offsetTop;
  const duration = durationMs;
  setVerticalScrollPosition(target, offset, duration);
}
