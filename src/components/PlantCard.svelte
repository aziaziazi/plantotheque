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
<div class="card" onclick={() => onClick(plante)} role="button" tabindex="0">
  <div class="card-media">
    {#if hasImage}
      <img
        src={plante.image_principale!}
        alt={plante.Nom_commun}
        loading="lazy"
        decoding="async"
      />
    {:else}
      <div class="plant-fallback">
        <span>{initials}</span>
      </div>
    {/if}
    <span class="category-tag">{plante.Categorie}</span>
  </div>

  <div class="card-body">
    <h3 class="common-name">{plante.Nom_commun}</h3>
    <p class="latin-name"><em>{plante.Genre} {plante.Espece}</em></p>
    <p class="family-name">{plante.Famille}</p>
    {#if plante.Cultivar && plante.Cultivar !== '-'}
      <span class="cultivar">‘{plante.Cultivar}’</span>
    {/if}
  </div>
</div>

<style>
  .card {
    background: var(--bg-surface);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    user-select: none;
  }

  .card:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-sm);
  }

  .card-media {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: #e6ede8;
  }

  .card-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .category-tag {
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: rgba(20, 40, 28, 0.78);
    color: #ffffff;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
    max-width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-body {
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
  }

  .common-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.25;
  }

  .latin-name {
    font-size: 0.82rem;
    color: var(--color-primary);
    font-weight: 500;
  }

  .family-name {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .cultivar {
    display: inline-block;
    font-size: 0.72rem;
    color: var(--color-accent);
    font-style: italic;
    font-weight: 600;
  }
</style>

