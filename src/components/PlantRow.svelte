<script lang="ts">
  import type { Plante } from '../types';
  import {
    nomPrincipal,
    nbSynonymes,
    categorieCourte,
    categorieCouleur,
  } from '../utils/noms';

  let { plante, onClick }: {
    plante: Plante;
    onClick: (p: Plante) => void;
  } = $props();

  let hasImage = $derived(Boolean(plante.image_principale));
  let initials = $derived(
    (plante.Genre.slice(0, 1) + (plante.Espece.slice(0, 1) || '')).toUpperCase()
  );

  // Le nom principal seul : les synonymes restent dans la fiche détaillée.
  let nom = $derived(nomPrincipal(plante.Nom_commun));
  let autresNoms = $derived(nbSynonymes(plante.Nom_commun));
  let categorie = $derived(categorieCourte(plante.Categorie));
  let couleur = $derived(categorieCouleur(plante.Categorie));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="row" onclick={() => onClick(plante)} role="button" tabindex="0">
  <div class="row-thumb">
    {#if hasImage}
      <img
        src={plante.image_principale!}
        alt={nom}
        loading="lazy"
        decoding="async"
      />
    {:else}
      <div class="plant-fallback row-fallback">
        <span>{initials}</span>
      </div>
    {/if}
    <span class="cat-stripe" style="background: {couleur}" aria-hidden="true"></span>
  </div>

  <div class="row-content">
    <div class="row-header">
      <h4 class="common-name" title={plante.Nom_commun}>{nom}</h4>
      {#if autresNoms > 0}
        <span
          class="syn-count"
          title="{autresNoms} autre{autresNoms > 1 ? 's' : ''} nom{autresNoms > 1 ? 's' : ''} commun{autresNoms > 1 ? 's' : ''}"
          aria-label="{autresNoms} autres noms communs"
        >+{autresNoms}</span>
      {/if}
    </div>

    <p class="latin-name">
      <em>{plante.Genre} {plante.Espece}</em>
      {#if plante.Cultivar && plante.Cultivar !== '-'}
        <span class="cultivar">‘{plante.Cultivar}’</span>
      {/if}
    </p>

    <p class="meta-line">
      <span class="family-name">{plante.Famille}</span>
      <span class="meta-sep" aria-hidden="true">·</span>
      <span class="category-label" style="color: {couleur}">{categorie}</span>
    </p>
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
    position: relative;
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

  /* Repère couleur de catégorie : lisible d'un coup d'œil au scroll,
     sans consommer la largeur de la ligne du nom. */
  .cat-stripe {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
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
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  .common-name {
    flex: 1;
    min-width: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .syn-count {
    flex-shrink: 0;
    font-size: 0.62rem;
    font-weight: 600;
    color: var(--color-text-muted);
    background: var(--bg-primary);
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0 5px;
    line-height: 1.5;
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

  .meta-line {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta-sep {
    margin: 0 4px;
    opacity: 0.6;
  }

  .category-label {
    font-weight: 600;
  }

  .row-arrow {
    color: #b0bfb6;
    font-size: 1.4rem;
    line-height: 1;
    padding-left: 4px;
    flex-shrink: 0;
  }
</style>
