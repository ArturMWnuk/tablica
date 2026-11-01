<script lang="ts">
  import { t } from '../lib/i18n/i18n.svelte';
</script>

<!-- Empty board area; layers are mounted here from step 1.2 on (WAR-01). -->
<main class="board" data-testid="board" aria-label={t('board.label')}></main>

<style>
  .board {
    flex: 1;
    min-height: 0;
    background: var(--color-board);
    touch-action: none;
  }
</style>
