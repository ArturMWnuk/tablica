// Keyboard focus rules of the board window: which keys belong to the focused control and which
// to the board (WEJ-04 K1).

/** Text fields keep their own keys (typing, Space, Ctrl+Z as undo of typing). */
export function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true;
  return (
    target instanceof HTMLInputElement &&
    !['range', 'checkbox', 'radio', 'button', 'color'].includes(target.type)
  );
}

/** Controls that use Space themselves (activation, toggling, opening a list). */
export function isControl(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('button, input, select, textarea, a, [contenteditable]') !== null
  );
}

/**
 * A button clicked with a mouse, pen or finger gives the focus back to the page, so that Space
 * held afterwards moves the view instead of pressing the button again (WEJ-04 K1). Chromium
 * (WebView2, Android WebView) leaves the focus on a clicked button, and a press on the board does
 * not take it away (the board prevents the default action of the press). A button activated from
 * the keyboard (click with `detail` 0) keeps the focus, so keyboard use stays unchanged.
 */
export function releasePointerFocus(event: MouseEvent): void {
  if (event.detail === 0) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest('button');
  if (button && button.ownerDocument.activeElement === button) button.blur();
}
