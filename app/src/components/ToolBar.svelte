<script lang="ts">
  import type { Board } from '../lib/core/board';
  import { t } from '../lib/i18n/i18n.svelte';

  interface Props {
    board: Board;
  }

  interface ToolItem {
    readonly key: string;
    readonly label: string;
  }

  const { board }: Props = $props();
  let tools: readonly ToolItem[] = $state([]);
  let activeKey: string | undefined = $state();

  // Tools registered by the plugins (WAR-12), each usable with the mouse (WEJ-04 K2).
  $effect(() => {
    const update = () => {
      tools = board.tools.list().map((tool) => ({
        key: tool.key,
        label: t(`${tool.pluginId}.${tool.definition.labelKey}`),
      }));
      activeKey = board.tools.active?.key;
    };
    update();
    return board.tools.changed.subscribe(update);
  });
</script>

<div class="tools" role="toolbar" aria-label={t('tools.label')} data-testid="tool-bar">
  {#each tools as tool (tool.key)}
    <button
      type="button"
      data-testid="tool"
      data-tool={tool.key}
      aria-pressed={tool.key === activeKey}
      title={t('tools.select', { name: tool.label })}
      onclick={() => board.tools.setActive(tool.key)}
    >
      {tool.label}
    </button>
  {/each}
</div>

<style>
  .tools {
    display: flex;
    gap: 4px;
  }

  button {
    height: 28px;
    padding: 0 10px;
    font: inherit;
    color: var(--color-text);
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
  }

  button[aria-pressed='true'] {
    border-color: var(--color-accent);
    box-shadow: inset 0 0 0 1px var(--color-accent);
  }

  button:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }
</style>
