<script lang="ts">
  import { FILE_KEYS } from '../lib/core/board';
  import { matchesKeys } from '../lib/core/registries';
  import { fileName } from '../lib/files/platform';
  import type { LessonSession } from '../lib/files/session';
  import { t } from '../lib/i18n/i18n.svelte';

  interface Props {
    session: LessonSession;
  }

  const { session }: Props = $props();
  /** ARIA token (not shown to the user). */
  const POPUP = 'menu';
  let open = $state(false);
  let title = $state('');
  let dirty = $state(false);
  let recent: readonly string[] = $state([]);
  let root: HTMLElement | undefined = $state();

  $effect(() => {
    const update = () => {
      title = session.title;
      dirty = session.dirty;
      recent = session.recentFiles;
    };
    update();
    return session.changed.subscribe(update);
  });

  /** DAN-01 K4: menu commands; the menu closes before the command asks anything. */
  function run(command: () => Promise<unknown>) {
    open = false;
    void command();
  }

  const commands = [
    { id: 'new', label: 'file.new', keys: FILE_KEYS.new, action: () => session.newLesson() },
    { id: 'open', label: 'file.open', keys: FILE_KEYS.open, action: () => session.open() },
    { id: 'save', label: 'file.save', keys: FILE_KEYS.save, action: () => session.save() },
    { id: 'save-as', label: 'file.saveAs', keys: FILE_KEYS.saveAs, action: () => session.saveAs() },
  ] as const;

  // DAN-01 K4: Ctrl+N, Ctrl+O, Ctrl+S and Ctrl+Shift+S work everywhere, also in text fields.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      open = false;
      return;
    }
    const command = commands.find((item) => matchesKeys(event, item.keys));
    if (!command) return;
    event.preventDefault();
    run(command.action);
  }

  function onPointerDown(event: PointerEvent) {
    if (open && root && event.target instanceof Node && !root.contains(event.target)) {
      open = false;
    }
  }
</script>

<svelte:window onkeydown={onKeyDown} onpointerdown={onPointerDown} />

<div class="file" bind:this={root}>
  <button
    type="button"
    class="toggle"
    data-testid="file-menu"
    aria-haspopup={POPUP}
    aria-expanded={open}
    title={t('file.menuHint')}
    onclick={() => (open = !open)}>{t('file.menu')}</button
  >
  <span class="lesson" data-testid="lesson-title" data-dirty={dirty}>
    {title}{#if dirty}<span class="dirty" title={t('file.unsaved')} aria-label={t('file.unsaved')}
        >•</span
      >{/if}
  </span>
  {#if open}
    <div class="menu" role="menu" data-testid="file-menu-list">
      {#each commands as command (command.id)}
        <button
          type="button"
          role="menuitem"
          data-testid={`file-${command.id}`}
          onclick={() => run(command.action)}
        >
          <span>{t(command.label)}</span>
          <kbd>{command.keys}</kbd>
        </button>
      {/each}
      <div class="separator" role="separator"></div>
      <p class="group">{t('file.recent')}</p>
      {#each recent as path (path)}
        <button
          type="button"
          role="menuitem"
          data-testid="recent-file"
          title={path}
          onclick={() => run(() => session.open(path))}>{fileName(path)}</button
        >
      {:else}
        <p class="empty">{t('file.noRecent')}</p>
      {/each}
    </div>
  {/if}
</div>

<style>
  .file {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .lesson {
    max-width: 220px;
    overflow: hidden;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dirty {
    margin-left: 4px;
    color: var(--color-accent);
  }

  button {
    font: inherit;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 2px 10px;
    cursor: pointer;
  }

  button:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  .menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    min-width: 240px;
    max-width: 360px;
    padding: 4px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
  }

  .menu button {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-color: transparent;
  }

  .menu button:hover {
    border-color: var(--color-border);
  }

  kbd {
    font: inherit;
    color: var(--color-text-muted);
  }

  .separator {
    margin: 4px 0;
    border-top: 1px solid var(--color-border);
  }

  .group,
  .empty {
    margin: 2px 10px;
    color: var(--color-text-muted);
  }
</style>
