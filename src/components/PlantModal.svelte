<script lang="ts">
  import type { Plante } from '../types';

  let { plante, onClickImage, onClose }: {
    plante: Plante;
    onClickImage: (src: string) => void;
    onClose: () => void;
  } = $props();

  let selectedImageIndex = $state(0);
  let activeImage = $derived(
    plante.images.length > 0 ? plante.images[selectedImageIndex] || plante.images[0] : null
  );

  let initials = $derived(
    (plante.Genre.slice(0, 1) + (plante.Espece.slice(0, 1) || '')).toUpperCase()
  );

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  function handleClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClickImage(e.target?.src)
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" tabindex="-1">
  <div class="modal-sheet">
    <button class="close-btn" onclick={onClose} aria-label="Fermer la fiche">✕</button>

    <!-- Galerie Photo -->
    <div class="modal-media">
      {#if activeImage}
        <img
          src={activeImage}
          alt="{plante.Nom_commun} - photo {selectedImageIndex + 1}"
          class="main-img"
          onclick={handleClick}
        />
      {:else}
        <div class="plant-fallback modal-fallback">
          <span>{initials}</span>
        </div>
      {/if}
    </div>

    <!-- Sélecteur de photos si plusieurs -->
    {#if plante.images.length > 1}
      <div class="thumbnails-bar">
        {#each plante.images as img, idx}
          {@const isComplet = img.includes('_complet_')}
          <button
            class="thumb-btn"
            class:selected={idx === selectedImageIndex}
            onclick={() => (selectedImageIndex = idx)}
          >
            <img src={img} alt="Miniature {idx + 1}" />
            <span class="thumb-label">{isComplet ? "Vue générale" : `Détail ${idx}`}</span>
          </button>
        {/each}
      </div>
    {/if}

    <!-- Contenu botanique -->
    <div class="modal-content">
      <div class="modal-header">
        <span class="badge">{plante.Categorie}</span>
        <span class="badge badge-family">{plante.Famille}</span>
      </div>

      <h2 class="title">{plante.Nom_commun}</h2>
      <p class="botanical-name">
        <em>{plante.Genre} {plante.Espece}</em>
        {#if plante.Cultivar && plante.Cultivar !== '-'}
          <span class="cultivar-pill">Cultivar : ‘{plante.Cultivar}’</span>
        {/if}
      </p>

      <!-- Anecdote mémotechnique -->
      {#if plante.Anecdote && plante.Anecdote.trim().length > 0}
        <div class="anecdote-box">
          <div class="anecdote-title">
            <span>💡</span> <strong>Astuce & Anecdote concours</strong>
          </div>
          <p class="anecdote-text">{plante.Anecdote}</p>
        </div>
      {/if}

      <!-- Liens externes -->
      <div class="external-links">
        {#if plante.Lien_general}
          <a
            href={plante.Lien_general}
            target="_blank"
            rel="noopener noreferrer"
            class="ext-btn"
          >
            📖 Fiche Wikipédia / Source ↗
          </a>
        {/if}
        {#if plante.Lien_detail}
          <a
            href={plante.Lien_detail}
            target="_blank"
            rel="noopener noreferrer"
            class="ext-btn ext-btn-sec"
          >
            🖼️ Galerie Wikimedia Commons ↗
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(15, 30, 22, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding: 0;
  }

  @media (min-width: 768px) {
    .modal-backdrop {
      align-items: center;
      padding: 24px;
    }
  }

  .modal-sheet {
    background: var(--bg-surface);
    width: 100%;
    max-width: 600px;
    max-height: 92vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
    animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (min-width: 768px) {
    .modal-sheet {
      border-radius: var(--radius-xl);
      max-height: 86vh;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0.5;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .close-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 10;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 700;
    backdrop-filter: blur(6px);
  }

  .modal-media {
    width: 100%;
    height: 270px;
    background: #1b382b;
    overflow: hidden;
    position: relative;
  }

  @media (min-width: 768px) {
    .modal-media {
      height: 340px;
    }
  }

  .main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .modal-fallback {
    font-size: 3.5rem;
  }

  .thumbnails-bar {
    display: flex;
    gap: 8px;
    padding: 10px 16px;
    background: var(--bg-primary);
    overflow-x: auto;
    border-bottom: 1px solid var(--color-border);
  }

  .thumb-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border-radius: var(--radius-sm);
    border: 2px solid transparent;
    background: var(--bg-surface);
    flex-shrink: 0;
  }

  .thumb-btn.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .thumb-btn img {
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 4px;
  }

  .thumb-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .modal-content {
    padding: 20px 20px calc(24px + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .modal-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .title {
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--color-text);
    line-height: 1.2;
  }

  .botanical-name {
    font-size: 1.1rem;
    color: var(--color-primary);
    font-weight: 600;
  }

  .cultivar-pill {
    display: inline-block;
    margin-top: 4px;
    font-size: 0.85rem;
    color: var(--color-accent);
    font-style: normal;
  }

  .anecdote-box {
    background: var(--color-accent-light);
    border-left: 4px solid var(--color-accent);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    padding: 12px 14px;
  }

  .anecdote-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-accent);
    font-size: 0.88rem;
    margin-bottom: 4px;
  }

  .anecdote-text {
    font-size: 0.92rem;
    color: #4a3821;
    line-height: 1.45;
  }

  .external-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
  }

  .ext-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 11px 16px;
    border-radius: var(--radius-md);
    background: var(--color-primary-light);
    color: var(--color-primary);
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 600;
    transition: background-color 0.15s ease;
  }

  .ext-btn-sec {
    background: #f0f3f6;
    color: #3b506b;
  }

  .ext-btn:active {
    opacity: 0.85;
  }
</style>

