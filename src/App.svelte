<script lang="ts">
  import rawPlantes from '../data.json';
  import Catalogue from './components/Catalogue.svelte';
  import ImageFullPage from './components/ImageFullPage.svelte';
  import Navbar from './components/Navbar.svelte';
  import PlantModal from './components/PlantModal.svelte';
  import QuizNameToPhoto from './components/QuizNameToPhoto.svelte';
  import QuizPhotoToName from './components/QuizPhotoToName.svelte';
  import type { ActiveTab, Plante } from './types';

  const plantes = rawPlantes as Plante[];

  let activeTab = $state<ActiveTab>('catalogue');
  let selectedPlant = $state<Plante | null>(null);
  let fullImage = $state<string | null>(null);

  function openDetail(p: Plante) {
    selectedPlant = p;
  }

  function closeDetail() {
    selectedPlant = null;
  }

  function openFullImage(src: string) {
    fullImage = src;
  }

  function closeFullImage() {
    fullImage = null;
  }
</script>

<!-- full page image -->
  {#if fullImage}
    <ImageFullPage src={fullImage} onClose={closeFullImage} />
  {/if}
  
<div class="app-container">
  <!-- Barre supérieure de l'application -->
  <header class="app-topbar">
    <div class="topbar-inner">
      <div class="brand">
        <span class="brand-icon">🌿</span>
        <div class="brand-text">
          <h1 class="brand-title">Concours Jardinier</h1>
          <span class="brand-sub">Révision botanique • {plantes.length} espèces</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Contenu actif selon l'onglet -->
  <main class="app-main">
    {#if activeTab === 'catalogue'}
      <Catalogue {plantes} onSelectPlant={openDetail} />
    {:else if activeTab === 'quiz-photo'}
      <QuizPhotoToName {plantes} onOpenDetail={openDetail} onClickImage={openFullImage}/>
    {:else if activeTab === 'quiz-nom'}
      <QuizNameToPhoto {plantes} onOpenDetail={openDetail} onClickImage={openFullImage}/>
    {/if}
  </main>

  <!-- Modal de fiche plante détaillée -->
  {#if selectedPlant}
    <PlantModal plante={selectedPlant} onClickImage={openFullImage} onClose={closeDetail} />
  {/if}

  <!-- Barre de navigation inférieure mobile (Tab Bar) -->
  <Navbar {activeTab} onSelectTab={(tab) => (activeTab = tab)} />
</div>

<style>
  .app-topbar {
    background: var(--bg-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 50;
    padding-top: env(safe-area-inset-top);
  }

  .topbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    font-size: 1.6rem;
    line-height: 1;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .brand-sub {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .app-main {
    flex: 1;
  }
</style>

