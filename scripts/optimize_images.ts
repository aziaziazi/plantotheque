import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

interface OptimizeOptions {
  imagesDir?: string;
  maxDimension?: number;
  quality?: number;
  concurrency?: number;
}

/**
 * Formate un nombre d'octets en chaîne lisible (Ko, Mo, Go).
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

/**
 * Calcule la taille totale d'un ensemble de fichiers.
 */
function getTotalSize(files: string[], dir: string): number {
  return files.reduce((total, file) => {
    try {
      const stats = fs.statSync(path.join(dir, file));
      return total + stats.size;
    } catch {
      return total;
    }
  }, 0);
}

/**
 * Optimise une image unique avec l'utilitaire natif macOS `sips`.
 * Redimensionne la plus grande dimension à `maxDimension` (sans étirement)
 * et compresse en JPEG avec la qualité demandée.
 */
async function optimizeImage(
  filePath: string,
  maxDimension: number,
  quality: number
): Promise<{ originalSize: number; newSize: number }> {
  const originalSize = fs.statSync(filePath).size;

  // sips -s format jpeg -s formatOptions <quality> -Z <maxDimension> <file>
  await execFileAsync('sips', [
    '-s',
    'format',
    'jpeg',
    '-s',
    'formatOptions',
    quality.toString(),
    '-Z',
    maxDimension.toString(),
    filePath,
  ]);

  const newSize = fs.statSync(filePath).size;
  return { originalSize, newSize };
}

/**
 * Exécute une file de tâches asynchrones avec un niveau de concurrence contrôlé.
 */
async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function next(): Promise<void> {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await worker(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => next());
  await Promise.all(workers);
  return results;
}

/**
 * Script principal d'optimisation du dossier images/.
 */
export async function optimizeAllImages(options?: OptimizeOptions): Promise<void> {
  const rootDir = process.cwd();
  const imagesDir = options?.imagesDir ?? path.join(rootDir, 'images');
  const maxDimension = options?.maxDimension ?? 1200;
  const quality = options?.quality ?? 80;
  const concurrency = options?.concurrency ?? 6;

  if (!fs.existsSync(imagesDir)) {
    throw new Error(`Dossier d'images introuvable : ${imagesDir}`);
  }

  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(jpe?g|png)$/i.test(f));

  if (files.length === 0) {
    console.log(`ℹ️  Aucune image à optimiser dans ${imagesDir}`);
    return;
  }

  const totalOriginalSize = getTotalSize(files, imagesDir);

  console.log(`🌿 Démarrage de l'optimisation des images :`);
  console.log(`   - Répertoire : ${imagesDir}`);
  console.log(`   - Fichiers à traiter : ${files.length}`);
  console.log(`   - Poids initial total : ${formatBytes(totalOriginalSize)}`);
  console.log(`   - Résolution max : ${maxDimension}px`);
  console.log(`   - Qualité JPEG : ${quality}%`);
  console.log(`   - Parallélisme : ${concurrency} threads\n`);

  const startTime = Date.now();
  let completed = 0;

  await runWithConcurrency(files, concurrency, async (file) => {
    const fullPath = path.join(imagesDir, file);
    try {
      await optimizeImage(fullPath, maxDimension, quality);
    } catch (err) {
      console.error(`❌ Erreur sur ${file} :`, err);
    } finally {
      completed++;
      if (completed % 25 === 0 || completed === files.length) {
        const percent = ((completed / files.length) * 100).toFixed(0);
        console.log(`   [${completed}/${files.length}] - ${percent}% terminé`);
      }
    }
  });

  const totalNewSize = getTotalSize(files, imagesDir);
  const savedBytes = totalOriginalSize - totalNewSize;
  const savedPercent = ((savedBytes / totalOriginalSize) * 100).toFixed(1);
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n✨ Optimisation terminée avec succès en ${durationSec}s !`);
  console.log(`   - Poids avant : ${formatBytes(totalOriginalSize)}`);
  console.log(`   - Poids après : ${formatBytes(totalNewSize)}`);
  console.log(`   - Gain d'espace : ${formatBytes(savedBytes)} (${savedPercent}% économisés)`);
  console.log(`   - Poids moyen par photo : ${formatBytes(totalNewSize / files.length)}`);
}

// Exécution si invoqué directement en CLI
optimizeAllImages();
