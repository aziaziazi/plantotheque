<script lang="ts">
  import type { Plante, QuizPhotoQuestion } from '../types';

  let { plantes, onOpenDetail, onClickImage }: {
    plantes: Plante[];
    onOpenDetail: (p: Plante) => void;
    onClickImage: (src: string) => void;
  } = $props();

  // Filtrer uniquement les plantes ayant au moins une photo disponible
  let eligiblePlantes = $derived(plantes.filter((p) => p.images.length > 0));

  let currentQuestion = $state<QuizPhotoQuestion | null>(null);

  function generateQuestion() {
    if (eligiblePlantes.length === 0) return;

    // 1. Choix de la plante cible
    const target = eligiblePlantes[Math.floor(Math.random() * eligiblePlantes.length)];

    // 2. Choix aléatoire d'une photo de cette plante (complet ou détail)
    const photo = target.images[Math.floor(Math.random() * target.images.length)];

    // 3. Choix de 3 distracteurs parmi la même catégorie si possible, sinon au hasard
    const sameCat = eligiblePlantes.filter(
      (p) => p.id !== target.id && p.Categorie === target.Categorie
    );
    const otherPool = eligiblePlantes.filter((p) => p.id !== target.id);

    const distractors: Plante[] = [];
    const usedIds = new Set<string>([target.id]);

    // Privilégier 2 de la même catégorie si disponible
    while (sameCat.length > 0 && distractors.length < 2) {
      const randIdx = Math.floor(Math.random() * sameCat.length);
      const pick = sameCat.splice(randIdx, 1)[0];
      if (!usedIds.has(pick.id)) {
        distractors.push(pick);
        usedIds.add(pick.id);
      }
    }

    // Compléter avec le reste
    while (distractors.length < 3 && otherPool.length > 0) {
      const randIdx = Math.floor(Math.random() * otherPool.length);
      const pick = otherPool.splice(randIdx, 1)[0];
      if (!usedIds.has(pick.id)) {
        distractors.push(pick);
        usedIds.add(pick.id);
      }
    }

    // 4. Mélanger les 4 options
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);

    currentQuestion = {
      targetPlante: target,
      photoUrl: photo,
      options,
      selectedIndex: null,
      isAnswered: false,
    };
  }

  // Initialisation à l'ouverture
  $effect(() => {
    if (!currentQuestion && eligiblePlantes.length > 0) {
      generateQuestion();
    }
  });

  function selectOption(index: number) {
    if (!currentQuestion || currentQuestion.isAnswered) return;
    currentQuestion.selectedIndex = index;
    currentQuestion.isAnswered = true;
  }

  function handleClickPhoto() {
    currentQuestion && onClickImage(currentQuestion.photoUrl)
  }
</script>

<div class="quiz-container">
  <div class="quiz-header">
    <span class="quiz-badge">Quiz 1 : Reconnaissance Taxonomique</span>
    <h2 class="quiz-title">Quelle est cette plante ?</h2>
  </div>

  {#if currentQuestion}
    <div class="quiz-card">
      <!-- Photo de la plante -->
      <div class="photo-frame" onclick={handleClickPhoto}>
        <img
          src={currentQuestion.photoUrl}
          alt="Plante à identifier"
          class="quiz-photo"
        />
        <div class="photo-hint">
          {currentQuestion.photoUrl.includes('_complet_') ? "Vue d'ensemble" : "Vue de détail"}
        </div>
      </div>

      <!-- Choix de réponse -->
      <div class="options-grid">
        {#each currentQuestion.options as option, idx}
          {@const isSelected = currentQuestion.selectedIndex === idx}
          {@const isCorrect = option.id === currentQuestion.targetPlante.id}
          {@const showCorrect = currentQuestion.isAnswered && isCorrect}
          {@const showWrong = currentQuestion.isAnswered && isSelected && !isCorrect}

          <button
            class="option-btn"
            class:selected={isSelected}
            class:correct={showCorrect}
            class:wrong={showWrong}
            onclick={() => selectOption(idx)}
            disabled={currentQuestion.isAnswered}
          >
            <div class="option-header">
              <span class="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span class="option-common">{option.Nom_commun}</span>
            </div>
            <div class="option-sub">
              <em>{option.Genre} {option.Espece}</em>
              <span class="option-family">• {option.Famille}</span>
            </div>
          </button>
        {/each}
      </div>

      <!-- Bandeau de feedback immédiat après réponse -->
      {#if currentQuestion.isAnswered}
        {@const won = currentQuestion.options[currentQuestion.selectedIndex!].id === currentQuestion.targetPlante.id}
        <div class="feedback-panel" class:won class:lost={!won}>
          <div class="feedback-msg">
            <span class="feedback-icon">{won ? '✨ Bravo !' : '❌ Pas tout à fait...'}</span>
            <p class="feedback-detail">
              Il s'agit bien de <strong>{currentQuestion.targetPlante.Nom_commun}</strong>
              (<em>{currentQuestion.targetPlante.Genre} {currentQuestion.targetPlante.Espece}</em> - {currentQuestion.targetPlante.Famille}).
            </p>
          </div>

          <div class="feedback-actions">
            <button
              class="btn-detail"
              onclick={() => onOpenDetail(currentQuestion!.targetPlante)}
            >
              📖 Voir la fiche info
            </button>
            <button class="btn-next" onclick={generateQuestion}>
              Plante suivante ➔
            </button>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="loading-state">
      <p>Chargement du quiz...</p>
    </div>
  {/if}
</div>

<style>
  .quiz-container {
    max-width: 650px;
    margin: 0 auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .quiz-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .quiz-badge {
    display: inline-block;
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: var(--radius-sm);
  }

  .quiz-title {
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--color-text);
  }

  .quiz-card {
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-bottom: 14px;
  }

  .photo-frame {
    position: relative;
    width: 100%;
    height: 280px;
    background: #1b382b;
  }

  @media (min-width: 600px) {
    .photo-frame {
      height: 350px;
    }
  }

  .quiz-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .photo-hint {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.65);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    backdrop-filter: blur(4px);
  }

  .options-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 14px;
  }

  .option-btn {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    border: 2px solid var(--color-border);
    text-align: left;
    transition: all 0.15s ease;
    cursor: pointer;
    min-height: 58px;
  }

  .option-btn:active:not(:disabled) {
    transform: scale(0.98);
    background: var(--color-primary-light);
  }

  .option-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .option-letter {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--color-border);
    color: var(--color-text);
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .option-common {
    font-size: 0.98rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .option-sub {
    font-size: 0.8rem;
    color: var(--color-primary);
    padding-left: 30px;
  }

  .option-family {
    color: var(--color-text-muted);
    font-style: normal;
    font-size: 0.75rem;
    margin-left: 4px;
  }

  /* États de réponse */
  .option-btn.correct {
    background: var(--color-success-light);
    border-color: var(--color-success);
  }

  .option-btn.correct .option-letter {
    background: var(--color-success);
    color: #ffffff;
  }

  .option-btn.wrong {
    background: var(--color-error-light);
    border-color: var(--color-error);
  }

  .option-btn.wrong .option-letter {
    background: var(--color-error);
    color: #ffffff;
  }

  .feedback-panel {
    margin: 4px 14px 0;
    padding: 14px;
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .feedback-panel.won {
    background: var(--color-success-light);
    border: 1px solid var(--color-success);
  }

  .feedback-panel.lost {
    background: var(--color-error-light);
    border: 1px solid var(--color-error);
  }

  .feedback-icon {
    font-size: 1.05rem;
    font-weight: 800;
    display: block;
    margin-bottom: 2px;
  }

  .feedback-panel.won .feedback-icon {
    color: var(--color-success);
  }

  .feedback-panel.lost .feedback-icon {
    color: var(--color-error);
  }

  .feedback-detail {
    font-size: 0.88rem;
    color: var(--color-text);
    line-height: 1.35;
  }

  .feedback-actions {
    display: flex;
    gap: 8px;
  }

  .btn-detail {
    flex: 1;
    background: var(--bg-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    font-weight: 600;
    font-size: 0.85rem;
    padding: 11px 12px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .btn-next {
    flex: 1.3;
    background: var(--color-primary);
    color: #ffffff;
    font-weight: 700;
    font-size: 0.92rem;
    padding: 11px 16px;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .btn-next:active, .btn-detail:active {
    transform: scale(0.97);
  }

  .loading-state {
    text-align: center;
    padding: 40px;
    color: var(--color-text-muted);
  }
</style>

