import { scroll } from "quasar";
const { getScrollTarget, setVerticalScrollPosition } = scroll;

/**
 * Get the scrollable parent of any html element.
 *
 * @param element html element whose scrollable parent should be retrieved.
 * @returns scrollable parent.
 */
function getScrollParent(element: HTMLElement | ParentNode | null): any {
  // Check scrollability
  const overflowY =
    element instanceof HTMLElement &&
    window.getComputedStyle(element).overflowY;
  const isScrollable =
    overflowY && overflowY !== "visible" && overflowY !== "hidden";

  // Return proper scrollable parent
  if (!element) {
    return null;
  } else if (isScrollable && element.scrollHeight >= element.clientHeight) {
    return element;
  }
  return (
    getScrollParent(element.parentNode) ||
    document.scrollingElement ||
    document.body
  );
}

/**
 * Vertical scroll to an element.
 *
 * @param element html element to scroll to.
 * @param durationMs scroll duration in ms.
 */
export function scrollToElement(
  element: HTMLElement | null,
  durationMs: number = 500,
) {
  if (!(element && element.offsetTop)) return;
  const target = getScrollTarget(element);
  const offset = element.offsetTop;
  const duration = durationMs;
  setVerticalScrollPosition(target, offset, duration);
}

/**
 * Vertical scroll to an element inside any scrollable parent.
 *
 * @param element html element to scroll to.
 * @param offset optional offset to set from parent top.
 * @param durationMs scroll duration in ms.
 */
export function scrollToElementInParent(
  element: HTMLElement | null,
  offset: number = 0,
  durationMs: number = 500,
) {
  if (!(element && element.offsetTop)) return;
  const target = getScrollParent(element);
  const elementOffset = element.offsetTop;
  const duration = durationMs;
  setVerticalScrollPosition(target, elementOffset - offset, duration);
}
