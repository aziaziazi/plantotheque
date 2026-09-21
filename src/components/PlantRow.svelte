<script lang="ts">
  import type { Plante } from '../types';

  let { plante, onClick }: {
    plante: Plante;
    onClick: (p: Plante) => void;
  } = $props();

  let hasImage = $derived(Boolean(plante.image_principale));
  let initials = $derived(
    (plante.Genre.slice(0, 1) + (plante.Espece.slice(0, 1) || '')).toUpperCase()
  );
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="row" onclick={() => onClick(plante)} role="button" tabindex="0">
  <div class="row-thumb">
    {#if hasImage}
      <img
        src={plante.image_principale!}
        alt={plante.Nom_commun}
        loading="lazy"
        decoding="async"
      />
    {:else}
      <div class="plant-fallback row-fallback">
        <span>{initials}</span>
      </div>
    {/if}
  </div>

  <div class="row-content">
    <div class="row-header">
      <h4 class="common-name">{plante.Nom_commun}</h4>
      <span class="category-pill">{plante.Categorie}</span>
    </div>
    <p class="latin-name">
      <em>{plante.Genre} {plante.Espece}</em>
      {#if plante.Cultivar && plante.Cultivar !== '-'}
        <span class="cultivar">‘{plante.Cultivar}’</span>
      {/if}
    </p>
    <p class="family-name">{plante.Famille}</p>
  </div>

  <div class="row-arrow">›</div>
</div>

<style>
  .row {
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid var(--color-border);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: background-color 0.1s ease, transform 0.1s ease;
    user-select: none;
  }

  .row:active {
    background-color: var(--color-primary-light);
    transform: scale(0.99);
  }

  .row-thumb {
    width: 54px;
    height: 54px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    flex-shrink: 0;
    background: #e6ede8;
  }

  .row-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .row-fallback {
    font-size: 1.1rem;
  }

  .row-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .common-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category-pill {
    font-size: 0.65rem;
    color: var(--color-text-muted);
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .latin-name {
    font-size: 0.82rem;
    color: var(--color-primary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cultivar {
    color: var(--color-accent);
    font-size: 0.75rem;
    margin-left: 4px;
  }

  .family-name {
    font-size: 0.72rem;
    color: var(--color-text-muted);
  }

  .row-arrow {
    color: #b0bfb6;
    font-size: 1.4rem;
    line-height: 1;
    padding-left: 4px;
  }
</style>

