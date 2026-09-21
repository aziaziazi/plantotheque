<script lang="ts">
  import type { Plante, ViewMode } from '../types';
  import PlantCard from './PlantCard.svelte';
  import PlantRow from './PlantRow.svelte';

  let { plantes, onSelectPlant }: {
    plantes: Plante[];
    onSelectPlant: (p: Plante) => void;
  } = $props();

  let searchQuery = $state('');
  let selectedCategory = $state('');
  let selectedFamily = $state('');
  let viewMode = $state<ViewMode>('grid');

  // Listes uniques pour les filtres
  let categories = $derived(
    Array.from(new Set(plantes.map((p) => p.Categorie).filter(Boolean))).sort()
  );
  let families = $derived(
    Array.from(new Set(plantes.map((p) => p.Famille).filter(Boolean))).sort()
  );

  function normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  let filteredPlantes = $derived(
    plantes.filter((p) => {
      // Filtre Catégorie
      if (selectedCategory && p.Categorie !== selectedCategory) {
        return false;
      }
      // Filtre Famille
      if (selectedFamily && p.Famille !== selectedFamily) {
        return false;
      }
      // Filtre Recherche
      if (searchQuery.trim()) {
        const q = normalize(searchQuery);
        const searchable = normalize(
          `${p.Nom_commun} ${p.Genre} ${p.Espece} ${p.Cultivar} ${p.Famille} ${p.Categorie}`
        );
        return searchable.includes(q);
      }
      return true;
    })
  );

  function clearFilters() {
    searchQuery = '';
    selectedCategory = '';
    selectedFamily = '';
  }
</script>

<div class="catalogue-page">
  <!-- En-tête avec Recherche & Mode de vue -->
  <header class="catalogue-header">
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        type="search"
        placeholder="Rechercher nom, latin, famille..."
        bind:value={searchQuery}
        class="search-input"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      {#if searchQuery}
        <button class="clear-search" onclick={() => (searchQuery = '')}>✕</button>
      {/if}
    </div>

    <div class="view-toggle">
      <button
        class="toggle-btn"
        class:active={viewMode === 'grid'}
        onclick={() => (viewMode = 'grid')}
        aria-label="Affichage en grille"
      >
        <span class="btn-icon">▦</span>
        <span class="btn-text">Grille</span>
      </button>
      <button
        class="toggle-btn"
        class:active={viewMode === 'list'}
        onclick={() => (viewMode = 'list')}
        aria-label="Affichage en liste"
      >
        <span class="btn-icon">☰</span>
        <span class="btn-text">Liste</span>
      </button>
    </div>
  </header>

  <!-- Ligne des filtres de sélection -->
  <div class="filters-container">
    <select bind:value={selectedCategory} class="filter-select">
      <option value="">Toutes les catégories ({categories.length})</option>
      {#each categories as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>

    <select bind:value={selectedFamily} class="filter-select">
      <option value="">Toutes les familles ({families.length})</option>
      {#each families as fam}
        <option value={fam}>{fam}</option>
      {/each}
    </select>
  </div>

  <!-- Barre d'état des résultats -->
  <div class="results-bar">
    <span class="count-badge">
      <strong>{filteredPlantes.length}</strong> {filteredPlantes.length > 1 ? 'plantes' : 'plante'}
    </span>
    {#if selectedCategory || selectedFamily || searchQuery}
      <button class="reset-link" onclick={clearFilters}>Réinitialiser les filtres</button>
    {/if}
  </div>

  <!-- Contenu : Grille ou Liste -->
  {#if filteredPlantes.length > 0}
    {#if viewMode === 'grid'}
      <div class="plants-grid">
        {#each filteredPlantes as plante (plante.id)}
          <PlantCard {plante} onClick={onSelectPlant} />
        {/each}
      </div>
    {:else}
      <div class="plants-list">
        {#each filteredPlantes as plante (plante.id)}
          <PlantRow {plante} onClick={onSelectPlant} />
        {/each}
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <span class="empty-icon">🌱</span>
      <p class="empty-title">Aucune plante trouvée</p>
      <p class="empty-subtitle">Essayez de modifier votre recherche ou vos filtres.</p>
      <button class="reset-btn" onclick={clearFilters}>Voir toutes les plantes</button>
    </div>
  {/if}
</div>

<style>
  .catalogue-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 14px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .catalogue-header {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .search-bar {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    background: var(--bg-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0 10px;
    box-shadow: var(--shadow-sm);
  }

  .search-icon {
    font-size: 0.95rem;
    color: var(--color-text-muted);
    margin-right: 6px;
  }

  .search-input {
    width: 100%;
    height: 42px;
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.95rem;
    color: var(--color-text);
  }

  .clear-search {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .view-toggle {
    display: flex;
    background: var(--bg-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 3px;
    box-shadow: var(--shadow-sm);
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 7px 10px;
    border-radius: 6px;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .toggle-btn.active {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  @media (max-width: 480px) {
    .btn-text {
      display: none;
    }
  }

  .filters-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .filter-select {
    width: 100%;
    height: 38px;
    padding: 0 10px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background: var(--bg-surface);
    color: var(--color-text);
    font-size: 0.82rem;
    font-weight: 500;
    outline: none;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-shadow: var(--shadow-sm);
  }

  .results-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 4px;
  }

  .count-badge {
    font-size: 0.82rem;
    color: var(--color-text-muted);
  }

  .count-badge strong {
    color: var(--color-primary);
  }

  .reset-link {
    font-size: 0.8rem;
    color: var(--color-primary);
    font-weight: 600;
    text-decoration: underline;
  }

  /* Disposition en Grille Responsive */
  .plants-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (min-width: 600px) {
    .plants-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
  }

  @media (min-width: 900px) {
    .plants-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }
  }

  /* Disposition en Liste */
  .plants-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .empty-state {
    text-align: center;
    padding: 48px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .empty-subtitle {
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .reset-btn {
    margin-top: 6px;
    background: var(--color-primary);
    color: #ffffff;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: var(--radius-md);
  }
</style>

