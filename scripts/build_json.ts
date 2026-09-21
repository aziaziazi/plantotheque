import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Interface représentant une plante avec ses métadonnées botaniques
 * et ses photos associées.
 */
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

/**
 * Nettoie une chaîne pour former un nom de fichier standardisé
 * (identique à la convention du script de téléchargement).
 */
export function cleanFilename(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ /g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Génère un identifiant URL-friendly (slug) unique par plante.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parseur CSV robuste supportant les délimiteurs personnalisés,
 * les champs entre guillemets et les retours à la ligne éventuels.
 */
export function parseCSV(csvContent: string, delimiter = ';'): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Saute le guillemet échappé
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.replace(/^\uFEFF/, '').trim()); // Retire le BOM UTF-8 éventuel
  const dataRows = rows.slice(1);

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });
}

/**
 * Lit le CSV, scanne le dossier d'images et produit data.json.
 */
export function buildJson(options?: {
  csvPath?: string;
  imagesDir?: string;
  outputPath?: string;
}): Plante[] {
  const rootDir = process.cwd();
  const defaultImagesDir = fs.existsSync(path.join(rootDir, 'public', 'images'))
    ? path.join(rootDir, 'public', 'images')
    : path.join(rootDir, 'images');
  const csvPath = options?.csvPath ?? path.join(rootDir, 'plantes_concours_jardinier.csv');
  const imagesDir = options?.imagesDir ?? defaultImagesDir;
  const outputPath = options?.outputPath ?? path.join(rootDir, 'data.json');

  if (!fs.existsSync(csvPath)) {
    throw new Error(`Fichier CSV introuvable : ${csvPath}`);
  }

  console.log(`🌿 Lecture du CSV : ${csvPath}`);
  const csvRaw = fs.readFileSync(csvPath, 'utf-8');
  const rawRecords = parseCSV(csvRaw, ';');

  // Scanner les images disponibles dans le dossier images/
  let availableImages: string[] = [];
  if (fs.existsSync(imagesDir)) {
    availableImages = fs
      .readdirSync(imagesDir)
      .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file));
  } else {
    console.warn(`⚠️ Dossier d'images introuvable : ${imagesDir}`);
  }

  console.log(`🖼️  ${availableImages.length} images détectées dans ${imagesDir}`);

  const matchedImageFiles = new Set<string>();

  const plantes: Plante[] = rawRecords.map((row) => {
    const genre = (row.Genre ?? '').trim();
    const espece = (row.Espece ?? '').trim();
    const cleanGenre = cleanFilename(genre);
    const cleanEspece = cleanFilename(espece);

    const prefix = `${cleanGenre}_${cleanEspece}`;
    const slug = slugify(`${genre} ${espece} ${row.Cultivar !== '-' ? row.Cultivar : ''}`);

    // Recherche de toutes les images correspondant au préfixe genre_espece
    // ex: acer_campestre_complet_1.jpg, acer_campestre_detail_1.jpg
    const plantImages = availableImages
      .filter((img) => {
        const lowerImg = img.toLowerCase();
        return (
          lowerImg.startsWith(`${prefix}_`) ||
          lowerImg.startsWith(`${prefix}.`)
        );
      })
      .sort((a, b) => {
        // Mettre les vues d'ensemble (complet) en premier, puis les détails
        const aIsComplet = a.includes('_complet_');
        const bIsComplet = b.includes('_complet_');
        if (aIsComplet && !bIsComplet) return -1;
        if (!aIsComplet && bIsComplet) return 1;
        return a.localeCompare(b);
      })
      .map((img) => `images/${img}`);

    // Marquer les images associées
    plantImages.forEach((p) => matchedImageFiles.add(path.basename(p)));

    // Déterminer l'image principale : priorité à une vue 'complet', sinon la première
    const primaryImage =
      plantImages.find((p) => p.includes('_complet_')) ??
      plantImages[0] ??
      null;

    return {
      id: slug || prefix,
      Nom_commun: row.Nom_commun ?? '',
      Categorie: row.Categorie ?? '',
      Famille: row.Famille ?? '',
      Genre: genre,
      Espece: espece,
      Cultivar: row.Cultivar ?? '-',
      Lien_general: row.Lien_general ?? '',
      Lien_detail: row.Lien_detail ?? '',
      Anecdote: row.Anecdote ?? '',
      note: row.note ?? '',
      images: plantImages,
      image_principale: primaryImage,
    };
  });

  // Statistiques
  const withImages = plantes.filter((p) => p.images.length > 0);
  const withoutImages = plantes.filter((p) => p.images.length === 0);
  const totalImageLinks = plantes.reduce((acc, p) => acc + p.images.length, 0);
  const unmatched = availableImages.filter((img) => !matchedImageFiles.has(img));

  console.log(`\n📊 Bilan du traitement :`);
  console.log(`   - Plantes traitées : ${plantes.length}`);
  console.log(`   - Plantes avec image(s) : ${withImages.length} (${totalImageLinks} liaisons images)`);
  console.log(`   - Plantes sans image : ${withoutImages.length}`);

  if (withoutImages.length > 0) {
    console.log(`\n⚠️  Exemples de plantes sans image (les images ne sont pas toutes présentes) :`);
    withoutImages.slice(0, 5).forEach((p) => {
      console.log(`     • ${p.Nom_commun} (${p.Genre} ${p.Espece})`);
    });
  }

  if (unmatched.length > 0) {
    console.log(`\nℹ️  ${unmatched.length} image(s) orpheline(s) non rattachée(s) :`);
    unmatched.slice(0, 5).forEach((img) => console.log(`     • ${img}`));
  }

  // Écriture du fichier JSON
  fs.writeFileSync(outputPath, JSON.stringify(plantes, null, 2), 'utf-8');
  console.log(`\n✅ Fichier généré avec succès : ${outputPath}\n`);

  return plantes;
}

// Exécution directe si invoqué via ligne de commande
buildJson();

