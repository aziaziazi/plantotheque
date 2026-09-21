<script lang="ts">

  let { src, onClose }: {
    src: string;
    onClose: () => void;
  } = $props();

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  function handleClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="imageFullPage-wrapper">
  <button class="imageFullPage-btn" onclick={onClose} aria-label="Fermer l'image'">✕</button>
    <img
      src={src}
      class="imageFullPage-img"
    />
</div>

<style>
  .imageFullPage-wrapper {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    z-index: 400;
    background-color: var(--color-primary-hover);
  }
  
  .imageFullPage-btn {
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

  .imageFullPage-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
</style>

