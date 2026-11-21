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
 * A control clicked with a mouse, pen or finger gives the focus back to the page, so that Space
 * held afterwards moves the view instead of pressing that control again (WEJ-04 K1). Chromium
 * (WebView2, Android WebView) leaves the focus on a clicked control, and a press on the board does
 * not take it away (the board prevents the default action of the press). This covers buttons and
 * the controls that do not type text (slider, checkbox, radio, colour picker): their Space would
 * press or toggle them instead of moving the view. Text fields keep the focus, because Space,
 * Ctrl+Z and the arrows belong to typing; lists (`select`) keep it too, because Space opens them.
 * A control activated from the keyboard (click with `detail` 0) keeps the focus, so keyboard use
 * stays unchanged.
 */
export function releasePointerFocus(event: MouseEvent): void {
  if (event.detail === 0) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  // The focused element, not the clicked one: a click on the label of a checkbox focuses the
  // checkbox itself, and a press on the board leaves the focus where it was.
  const focused = target.ownerDocument.activeElement;
  if (!(focused instanceof HTMLButtonElement || focused instanceof HTMLInputElement)) return;
  if (isTextField(focused)) return;
  focused.blur();
}
