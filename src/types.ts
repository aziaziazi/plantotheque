export interface Plante {
  id: string;
  Nom_commun: string;
  Categorie: string;
  Famille: string;
  Genre: string;
  Espece: string;
  Cultivar: string;
  Lien_general: string;
  Lien_detail: string;
  Anecdote: string;
  note: string;
  images: string[];
  image_principale: string | null;
}

export type ActiveTab = 'catalogue' | 'quiz-photo' | 'quiz-nom';
export type ViewMode = 'grid' | 'list';

export interface QuizPhotoOption {
  plante: Plante;
}

export interface QuizPhotoQuestion {
  targetPlante: Plante;
  photoUrl: string;
  options: Plante[];
  selectedIndex: number | null;
  isAnswered: boolean;
}

export interface QuizPhotoChoice {
  plante: Plante;
  photoUrl: string;
}

export interface QuizNameQuestion {
  targetPlante: Plante;
  options: QuizPhotoChoice[];
  selectedIndex: number | null;
  isAnswered: boolean;
}

