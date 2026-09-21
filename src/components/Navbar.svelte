<script lang="ts">
  import type { ActiveTab } from '../types';

  let { activeTab = 'catalogue', onSelectTab }: {
    activeTab: ActiveTab;
    onSelectTab: (tab: ActiveTab) => void;
  } = $props();
</script>

<nav class="tabbar" aria-label="Navigation principale">
  <button
    class="tab-btn"
    class:active={activeTab === 'catalogue'}
    onclick={() => onSelectTab('catalogue')}
  >
    <span class="tab-icon">🌿</span>
    <span class="tab-label">Catalogue</span>
  </button>

  <button
    class="tab-btn"
    class:active={activeTab === 'quiz-photo'}
    onclick={() => onSelectTab('quiz-photo')}
  >
    <span class="tab-icon">🔍</span>
    <span class="tab-label">Photo ➔ Nom</span>
  </button>

  <button
    class="tab-btn"
    class:active={activeTab === 'quiz-nom'}
    onclick={() => onSelectTab('quiz-nom')}
  >
    <span class="tab-icon">🖼️</span>
    <span class="tab-label">Nom ➔ Photo</span>
  </button>
</nav>

<style>
  .tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--color-border);
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(var(--tabbar-height) + env(safe-area-inset-bottom));
  }

  .tab-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    height: 100%;
    color: var(--color-text-muted);
    transition: color 0.15s ease, transform 0.1s ease;
    user-select: none;
  }

  .tab-btn:active {
    transform: scale(0.94);
  }

  .tab-btn.active {
    color: var(--color-primary);
  }

  .tab-icon {
    font-size: 1.35rem;
    line-height: 1;
  }

  .tab-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .tab-btn.active .tab-label {
    color: var(--color-primary);
    font-weight: 700;
  }
</style>

