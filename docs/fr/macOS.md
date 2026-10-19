[English](../en/macOS.md) | [简体中文](../zh-hans/macOS.md) | [繁體中文](../zh-hant/macOS.md) | [Deutsch](../de/macOS.md) | [Español](../es/macOS.md) | Français | [Italiano](../it/macOS.md) | [日本語](../ja/macOS.md) | [한국어](../ko/macOS.md) | [Português (BR)](../pt-br/macOS.md) | [Português (PT)](../pt-pt/macOS.md)

# Outil de calibration de la série SoARM — Guide macOS

Pour macOS 11 (Big Sur) et versions ultérieures. Points clés : nommage des ports série (`cu.*` vs `tty.*`), pilotes USB.

> ⚠️ **Compatibilité : cet outil ne prend actuellement en charge que les servos Feetech (série STS3215)**. La table des registres et le format xdat sont conçus pour les Feetech STS3215 ; les autres marques/modèles ne sont pas garantis.

---

## 1. Prérequis

| Dépendance | Version |
|-----------|---------|
| Python | >= 3.8 (3.10+ recommandé, via Homebrew) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| Système | macOS 11+ (Apple Silicon / Intel) |

## 2. Installer Python

Recommandé via Homebrew :

```bash
# Installer Homebrew si absent
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Python
brew install python
```

Vérifiez :

```bash
python3 --version
```

## 3. Installer les dépendances

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Ne créez l'environnement virtuel qu'UNE SEULE FOIS**. Le relancer réinitialisera/écrasera l'environnement (effaçant les dépendances installées). Ensuite, contentez-vous de `source .venv/bin/activate`.

## 4. ⚠️ Nommage des ports série sous macOS [important]

macOS place les périphériques série USB sous `/dev` selon **deux conventions de nommage** :

| Préfixe | Signification | Utilisable |
|--------|---------|--------|
| `/dev/tty.usbserial-*` | style modem (bloquant) | peut se figer, non recommandé |
| `/dev/cu.usbserial-*` | style call/terminal (**non bloquant**) | ✅ recommandé |

**Trouvez votre port :**

```bash
ls /dev/cu.*
```

Sortie typique :

```
/dev/cu.usbserial-0001      # CP2102 / FTDI
/dev/cu.usbmodem141101      # série USB intégrée (Arduino/ESP32)
/dev/cu.wchusbserial1420    # CH340
```

> L'outil privilégie automatiquement les périphériques `cu.*`. Si vous spécifiez un port manuellement, utilisez `cu.` et non `tty.`.

## 5. Pilotes USB

La plupart des puces courantes (CH340, CP2102, FTDI) disposent de pilotes macOS intégrés. Si le périphérique n'est pas reconnu :

```bash
system_profiler SPUSBDataType | grep -A5 -i "serial\|CH340\|CP210"
```

- **CH340** : les anciens lots nécessitent le pilote officiel WCH
- En général, il suffit que `ls /dev/cu.*` affiche le périphérique

## 6. Vérifier l'environnement

```bash
python setup.py
```

## 7. Lancer l'interface graphique

```bash
python main.py
# or
python -m src.gui.factory_calibration_tool
```

Spécifier les ports :

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

> S'il n'y a qu'un seul port série, le second port est automatiquement désactivé.

## 8. Flux de travail de l'interface

### 8.1 Onglet Calibration des servos
Sélectionnez le port leader/follower ; analyse automatique des servos.

- La calibration du centre ouvre l'assistant de calibration LeRobot : moniteur en direct à gauche (ID / Pos / curseur), table de calibration à droite.
- **Start Recording Middle** → positionnez le bras à son centre → **Finish Recording Middle** ; puis **Record Range** (devient vert) → balayez chaque articulation d'une limite à l'autre, pince comprise → cliquez à nouveau pour arrêter.
- Une fois les six articulations terminées, le fichier de calibration est enregistré automatiquement et écrase le précédent.

> ⚠️ Balayez les deux bras sur la même course, sinon le mouvement du follower ne correspondra pas à celui du leader.

### 8.2 Onglet Commande d'un servo individuel
- Chaque ligne : ID / Pos / curseur / L (cible)
- **Pos et le curseur sont liés dans les deux sens** : faire glisser le curseur met Pos à jour ; saisir une valeur dans Pos déplace le curseur et envoie immédiatement la commande
- La commande est envoyée au relâchement, pas pendant le glissement

### 8.3 Onglet Débogueur FT
- Connexion série (1M par défaut), analyse des servos
- Lire tous les registres, table des paramètres (56 registres), la sélection d'une ligne remplit automatiquement adresse/longueur/valeur
- Popup d'écriture : succès en vert / échec en rouge (avec la raison)
- Contrôle de position : curseur (0-4095) avec synchronisation de la zone de valeur
- Débit en bauds / réinitialisation d'usine
- Paramètres xdat (EEPROM uniquement) : enregistrer → ouvrir → restaurer

### 8.4 Télécommande

> ⚠️ **Sens : le bras leader commande le bras follower**. Le bras leader (maître) lit les angles ; le bras follower (esclave) est synchronisé. Nécessite des ID identiques sur les deux ports.

Barre supérieure `🎮 Télécommande` : le leader lit → le follower contrôle (ID de servos identiques requis sur les deux ports)

## 9. Dépannage

| Problème | Solution |
|---------|----------|
| Port en `tty.` qui se fige | Utilisez plutôt le préfixe `cu.` |
| Périphérique introuvable | `ls /dev/cu.*` ; rebranchez ; `system_profiler SPUSBDataType` |
| Interface chinoise vide | PingFang du système convient généralement ; installez Noto Sans CJK en cas de problème |
| Échec de l'activation du venv | `source .venv/bin/activate` (et non `.bat`) |
| Erreur de compilation sur Apple Silicon | Python 3.10+ est natif ; évitez les anciens Python via Rosetta |

## 10. Outils en ligne de commande (facultatif)

```bash
# Analyse des servos
python -m src.tools.scan_id

# Calibration LeRobot
python -m src.tools.lerobot_calibrate /dev/cu.usbserial-0001
```

## 11. Conseils

- **Le nom du port change** : les noms `cu.*` peuvent varier selon les ports USB ; sélectionnez-le dans la liste déroulante à chaque lancement
- **Veille** : macOS peut se mettre en veille et perdre la liaison série ; maintenez l'appareil éveillé pendant l'utilisation
- **Autorisation de confidentialité** : si le système demande d'« accéder aux disques amovibles », autorisez-le
