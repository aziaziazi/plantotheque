/**
 * Utilitaires d'affichage des noms et catégories.
 *
 * Beaucoup de `Nom_commun` du CSV contiennent plusieurs synonymes séparés par
 * « ; » ou « , » (ex. « Myosotis des bois, Myosotis des forêts, grémillet, … »).
 * En vue liste, on n'affiche que le nom principal (le premier), les autres
 * restant accessibles dans la fiche détaillée.
 */

/** Découpe un `Nom_commun` en liste de synonymes nettoyés. */
export function synonymes(nomCommun: string): string[] {
  return (nomCommun ?? '')
    .split(/[;,]/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0);
}

/** Nom principal : le premier synonyme (ou la chaîne brute en secours). */
export function nomPrincipal(nomCommun: string): string {
  return synonymes(nomCommun)[0] ?? (nomCommun ?? '').trim();
}

/** Nombre de synonymes supplémentaires (0 si nom unique). */
export function nbSynonymes(nomCommun: string): number {
  return Math.max(0, synonymes(nomCommun).length - 1);
}

const LIBELLES_COURTS: Record<string, string> = {
  "Arbres d'ornement et d'alignement": "Arbre d'ornement",
  'Conifères': 'Conifère',
  'Arbustes': 'Arbuste',
  'Plantes grimpantes': 'Grimpante',
  'Arbres et arbustes fruitiers': 'Fruitier',
  'Plantes vivaces': 'Vivace',
  'Graminées (et plantes proches)': 'Graminée',
  'Plantes annuelles, bisannuelles et de fleurissement': 'Annuelle',
  'Plantes aromatiques & légumes': 'Aromatique',
};

/** Libellé court de catégorie, adapté aux petits écrans. */
export function categorieCourte(categorie: string): string {
  return LIBELLES_COURTS[categorie] ?? (categorie ?? '');
}

const COULEURS: Record<string, string> = {
  "Arbres d'ornement et d'alignement": '#2f7d4f',
  'Conifères': '#1f6b64',
  'Arbustes': '#7a9b2e',
  'Plantes grimpantes': '#4a7fb5',
  'Arbres et arbustes fruitiers': '#c0562b',
  'Plantes vivaces': '#8e5aa8',
  'Graminées (et plantes proches)': '#b08a1f',
  'Plantes annuelles, bisannuelles et de fleurissement': '#c9457f',
  'Plantes aromatiques & légumes': '#5e8d6b',
};

/** Couleur de repère visuel associée à une catégorie. */
export function categorieCouleur(categorie: string): string {
  return COULEURS[categorie] ?? '#8a9a90';
}
