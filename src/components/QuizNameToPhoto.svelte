<script lang="ts">
  import type { Plante, QuizNameQuestion, QuizPhotoChoice } from '../types';

  let { plantes, onOpenDetail }: {
    plantes: Plante[];
    onOpenDetail: (p: Plante) => void;
  } = $props();

  // Filtrer uniquement les plantes ayant au moins une photo
  let eligiblePlantes = $derived(plantes.filter((p) => p.images.length > 0));

  let currentQuestion = $state<QuizNameQuestion | null>(null);

  function generateQuestion() {
    if (eligiblePlantes.length < 4) return;

    // 1. Choix de la plante cible
    const target = eligiblePlantes[Math.floor(Math.random() * eligiblePlantes.length)];
    const targetPhoto = target.images[Math.floor(Math.random() * target.images.length)];

    // 2. Choix de 3 distracteurs avec photo
    const others = eligiblePlantes.filter((p) => p.id !== target.id);
    const distractorChoices: QuizPhotoChoice[] = [];
    const usedIds = new Set<string>([target.id]);

    while (distractorChoices.length < 3 && others.length > 0) {
      const randIdx = Math.floor(Math.random() * others.length);
      const pick = others.splice(randIdx, 1)[0];
      if (!usedIds.has(pick.id)) {
        const photo = pick.images[Math.floor(Math.random() * pick.images.length)];
        distractorChoices.push({ plante: pick, photoUrl: photo });
        usedIds.add(pick.id);
      }
    }

    // 3. Mélange des 4 choix
    const targetChoice: QuizPhotoChoice = { plante: target, photoUrl: targetPhoto };
    const options = [targetChoice, ...distractorChoices].sort(() => Math.random() - 0.5);

    currentQuestion = {
      targetPlante: target,
      options,
      selectedIndex: null,
      isAnswered: false,
    };
  }

  $effect(() => {
    if (!currentQuestion && eligiblePlantes.length >= 4) {
      generateQuestion();
    }
  });

  function selectOption(index: number) {
    if (!currentQuestion || currentQuestion.isAnswered) return;
    currentQuestion.selectedIndex = index;
    currentQuestion.isAnswered = true;
  }
</script>

<div class="quiz-container">
  <div class="quiz-header">
    <span class="quiz-badge">Quiz 2 : Reconnaissance Visuelle</span>
    <h2 class="quiz-title">Quelle photo correspond à :</h2>
  </div>

  {#if currentQuestion}
    <!-- Fiche d'identité de la plante demandée -->
    <div class="target-card">
      <div class="target-badges">
        <span class="badge">{currentQuestion.targetPlante.Categorie}</span>
        <span class="badge badge-family">{currentQuestion.targetPlante.Famille}</span>
      </div>
      <h3 class="target-name">{currentQuestion.targetPlante.Nom_commun}</h3>
      <p class="target-latin">
        <em>{currentQuestion.targetPlante.Genre} {currentQuestion.targetPlante.Espece}</em>
        {#if currentQuestion.targetPlante.Cultivar && currentQuestion.targetPlante.Cultivar !== '-'}
          <span class="cultivar">‘{currentQuestion.targetPlante.Cultivar}’</span>
        {/if}
      </p>
    </div>

    <!-- Grille de 4 photos à choisir -->
    <div class="photo-choices-grid">
      {#each currentQuestion.options as option, idx}
        {@const isSelected = currentQuestion.selectedIndex === idx}
        {@const isCorrect = option.plante.id === currentQuestion.targetPlante.id}
        {@const showCorrect = currentQuestion.isAnswered && isCorrect}
        {@const showWrong = currentQuestion.isAnswered && isSelected && !isCorrect}

        <button
          class="photo-choice-btn"
          class:correct={showCorrect}
          class:wrong={showWrong}
          onclick={() => selectOption(idx)}
          disabled={currentQuestion.isAnswered}
        >
          <img
            src={option.photoUrl}
            alt="Option photo {idx + 1}"
            class="choice-img"
          />

          {#if showCorrect}
            <div class="overlay-badge correct-badge">✓ Bonne réponse</div>
          {:else if showWrong}
            <div class="overlay-badge wrong-badge">✕ Faux</div>
          {/if}

          {#if currentQuestion.isAnswered}
            <div class="choice-caption">
              {option.plante.Nom_commun}
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Panneau de feedback & actions -->
    {#if currentQuestion.isAnswered}
      {@const won = currentQuestion.options[currentQuestion.selectedIndex!].plante.id === currentQuestion.targetPlante.id}
      <div class="feedback-panel" class:won class:lost={!won}>
        <div class="feedback-text">
          <span class="feedback-title">{won ? 'Bravo ! 🎉' : 'Oups ! 🌿'}</span>
          <p>
            {#if won}
              Excellente reconnaissance visuelle de <strong>{currentQuestion.targetPlante.Nom_commun}</strong> !
            {:else}
              Vous aviez sélectionné <em>{currentQuestion.options[currentQuestion.selectedIndex!].plante.Nom_commun}</em>.
            {/if}
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
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--color-text-muted);
  }

  .target-card {
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    padding: 16px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .target-badges {
    display: flex;
    gap: 6px;
    margin-bottom: 2px;
  }

  .target-name {
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--color-text);
  }

  .target-latin {
    font-size: 1.05rem;
    color: var(--color-primary);
    font-weight: 600;
  }

  .cultivar {
    color: var(--color-accent);
    font-size: 0.85rem;
    margin-left: 4px;
  }

  /* Grille des 4 photos */
  .photo-choices-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .photo-choice-btn {
    position: relative;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-md);
    overflow: hidden;
    background: #1b382b;
    border: 3px solid transparent;
    padding: 0;
    box-shadow: var(--shadow-sm);
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .photo-choice-btn:active:not(:disabled) {
    transform: scale(0.96);
  }

  .choice-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .photo-choice-btn.correct {
    border-color: var(--color-success);
    box-shadow: 0 0 0 2px var(--color-success);
  }

  .photo-choice-btn.wrong {
    border-color: var(--color-error);
    box-shadow: 0 0 0 2px var(--color-error);
  }

  .overlay-badge {
    position: absolute;
    top: 6px;
    left: 6px;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    color: #ffffff;
    backdrop-filter: blur(6px);
  }

  .correct-badge {
    background: var(--color-success);
  }

  .wrong-badge {
    background: var(--color-error);
  }

  .choice-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(15, 30, 22, 0.85);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 4px 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    backdrop-filter: blur(4px);
  }

  .feedback-panel {
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

  .feedback-title {
    font-size: 1.05rem;
    font-weight: 800;
    display: block;
    margin-bottom: 2px;
  }

  .feedback-panel.won .feedback-title {
    color: var(--color-success);
  }

  .feedback-panel.lost .feedback-title {
    color: var(--color-error);
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
</style>

