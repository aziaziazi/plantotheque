import csv
import json
import os
import re
import time
import urllib.parse
import urllib.request

# 1. Création du dossier 'images'
os.makedirs("images", exist_ok=True)

# User-Agent explicite (exigé par les CGU de la Fondation Wikimedia)
HEADERS = {
    'User-Agent': (
        'BotanicalPrepApp/1.0 (https://github.com/camillegabrieli;'
        ' contact_botanique@domain.com)'
    )
}


def clean_filename(text):
    return re.sub(
        r'[^a-zA-Z0-9_]', '', str(text).lower().strip().replace(' ', '_')
    )


def fetch_with_retry(url, is_json=True, max_retries=3):
    """Effectue la requête HTTP avec gestion du rate-limiting (Erreur 429)."""
    for attempt in range(max_retries):
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            time.sleep(2)  # Pause de 2 secondes minimum entre chaque requête
            with urllib.request.urlopen(req, timeout=15) as response:
                if is_json:
                    return json.loads(response.read().decode())
                return response.read()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_time = (attempt + 1) * 8
                print(
                    f'   [!] Limite de requêtes atteinte (429). Attente de'
                    f' {wait_time}s...'
                )
                time.sleep(wait_time)
            elif e.code == 403:
                print('   [!] Accès refusé (403). Vérification du User-Agent.')
                return None
            else:
                print(f'   [!] Erreur HTTP {e.code}')
                return None
        except Exception as e:
            print(f'   [!] Erreur réseau : {e}')
            return None
    return None


def get_wikimedia_image(taxon, search_keyword):
    """Cherche l'URL d'une image sur Wikimedia via l'API standard."""
    query = f'"{taxon}" {search_keyword} filetype:bitmap'
    params = urllib.parse.urlencode({
        'action': 'query',
        'generator': 'search',
        'gsrsearch': query,
        'gsrnamespace': '6',
        'gsrlimit': '5',
        'prop': 'imageinfo',
        'iiprop': 'url|mime',
        'format': 'json',
    })

    url = f'https://commons.wikimedia.org/w/api.php?{params}'
    data = fetch_with_retry(url, is_json=True)

    if not data:
        return None

    pages = data.get('query', {}).get('pages', {})
    for page_id, page_data in pages.items():
        imageinfo = page_data.get('imageinfo', [])
        if imageinfo:
            file_url = imageinfo[0].get('url')
            mime = imageinfo[0].get('mime', '')

            if (
                file_url
                and ('image/jpeg' in mime or 'image/png' in mime)
                and 'map' not in file_url.lower()
            ):
                return file_url

    return None


def download_file(url, target_path):
    """Télécharge l'image vers le disque."""
    content = fetch_with_retry(url, is_json=False)
    if content:
        try:
            with open(target_path, 'wb') as out_file:
                out_file.write(content)
            return True
        except Exception as e:
            print(f'   [!] Échec d\'écriture fichier : {e}')
    return False


cibles = {
    'complet_1': 'tree OR habit OR plant',
    'detail_1': 'leaf OR leaves OR foliage',
    'detail_2': 'flower OR fruit OR bark',
}

csv_filename = 'plantes_concours_jardinier.csv'

if not os.path.exists(csv_filename):
    print(f"Erreur : Le fichier {csv_filename} n'existe pas !")
    exit()

with open(csv_filename, mode='r', encoding='utf-8') as file:
    reader = csv.DictReader(file, delimiter=';')
    rows = list(reader)

    print(
        f'Début du téléchargement sécurisé pour {len(rows)} plantes avec pauses'
        ' d\'API...\n'
    )

    for idx, row in enumerate(rows):
        genre = row.get('Genre', '').strip()
        espece = row.get('Espece', '').strip()
        taxon = f'{genre} {espece}'
        base_name = f'{clean_filename(genre)}_{clean_filename(espece)}'

        print(f'[{idx+1}/{len(rows)}] Recherche : {taxon}')

        for suffixe, mot_cle in cibles.items():
            filename = f'{base_name}_{suffixe}.jpg'
            filepath = os.path.join('images', filename)

            if not os.path.exists(filepath):
                img_url = get_wikimedia_image(taxon, mot_cle)
                if img_url:
                    if download_file(img_url, filepath):
                        print(f'   -> Téléchargé : {filename}')
                else:
                    print(f'   -> Pas de résultat pour : {suffixe}')
            else:
                print(f'   -> Déjà téléchargé : {filename}')

print('\nTerminé ! Les images sont disponibles dans le dossier /images.')