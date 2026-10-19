[English](../en/Windows.md) | [简体中文](../zh-hans/Windows.md) | [繁體中文](../zh-hant/Windows.md) | [Deutsch](../de/Windows.md) | [Español](../es/Windows.md) | Français | [Italiano](../it/Windows.md) | [日本語](../ja/Windows.md) | [한국어](../ko/Windows.md) | [Português (BR)](../pt-br/Windows.md) | [Português (PT)](../pt-pt/Windows.md)

# Outil de calibration de la série SoARM — Guide Windows

Pour Windows 10 / 11. Couvre l'installation jusqu'à la calibration complète des servos.

> ⚠️ **Compatibilité : cet outil ne prend actuellement en charge que les servos Feetech (série STS3215)**. La table des registres et le format xdat sont conçus pour les Feetech STS3215 ; les autres marques/modèles ne sont pas garantis.

---

## 1. Prérequis

| Dépendance | Version | Remarques |
|-----------|---------|-------|
| Python | >= 3.8 | 3.10+ recommandé, à télécharger sur [python.org](https://www.python.org/downloads/) |
| PySide6 | >= 6.0 | Framework d'interface graphique |
| pyserial | >= 3.5 | Communication série |
| Système | Win10 / Win11 | Toute édition |

## 2. Installer Python

1. Rendez-vous sur <https://www.python.org/downloads/>
2. Téléchargez l'installateur de Python 3.10+
3. **Cochez « Add Python to PATH »** pendant l'installation (sinon python ne sera pas trouvé dans le terminal)

Vérifiez :

```bash
python --version
```

## 3. Installer les dépendances

Installez dans un environnement virtuel pour éviter de polluer le Python du système :

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ **Ne créez l'environnement virtuel qu'UNE SEULE FOIS**. Le relancer réinitialisera/écrasera l'environnement (effaçant les dépendances installées). Ensuite, contentez-vous de l'`activate` à chaque fois.

> L'invite affichera `(.venv)` après l'activation.

## 4. Vérifier l'environnement

```bash
python setup.py
```

`[OK] 环境检查通过，可以运行项目` signifie que l'environnement est prêt.

## 5. Connecter le matériel

1. Branchez l'adaptateur USB-série (CH340 / CP2102)
2. Connectez le contrôleur de servo (carte de commande du bras robotique)
3. Alimentez les servos (DC 5V 5A en standard, DC 12V 5A en Pro)

Vérifiez le port COM dans le Gestionnaire de périphériques (`Win+X` → Gestionnaire de périphériques) :

```
Ports (COM & LPT)
  └─ USB-SERIAL CH340 (COM3)     ← votre port de servo
```

> **Notez le numéro COM** pour le sélectionner au démarrage.

## 6. Lancer l'interface graphique

```bash
python main.py
# or
python -m src.gui.factory_calibration_tool
```

> **Option sans installation (Windows)** : double-cliquez `dist\SO-ARM101-ServoController.exe` ; la machine cible n'a pas besoin de Python. Reconstruisez avec `pyinstaller -y SO-ARM101-ServoController.spec`.

Ou spécifiez les ports (s'ils sont occupés) :

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

Lister les ports disponibles :

```bash
python -m src.gui.factory_calibration_tool --list-ports
```

## 7. Flux de travail de l'interface

### 7.1 Onglet Calibration des servos

1. Sélectionnez le port leader/follower dans la barre supérieure → analyse automatique des servos (ID 1-6)
2. Boutons courants :
   - **Calibration du centre du bras leader / follower** : ouvre l'assistant de calibration LeRobot
     - Colonne de gauche : moniteur en direct des six servos (ID / Pos / curseur)
     - **Start Recording Middle** (devient orange) → positionnez le bras à son centre → **Finish Recording Middle**
     - **Record Range** (devient vert) → balayez chaque articulation d'une limite à l'autre, pince comprise → cliquez à nouveau pour arrêter
     - Une fois les six articulations terminées, le fichier de calibration est enregistré automatiquement et écrase le précédent, et les décalages/limites sont réécrits dans l'EEPROM des servos
   - **Test du centre du bras leader / follower** : active le couple et déplace vers le centre pour vérifier
   - **Désactivation des moteurs du bras leader / follower** : coupe le couple pour une rotation manuelle

> ⚠️ Balayez les deux bras sur la même course, sinon le mouvement du follower ne correspondra pas à celui du leader pendant la téléopération.

### 7.2 Onglet Commande d'un servo individuel

- Chaque ligne : ID / Pos / curseur / L (cible)
- **Pos et le curseur sont liés dans les deux sens** : faire glisser le curseur met Pos à jour ; saisir une valeur dans Pos déplace le curseur et envoie immédiatement la commande
- La commande est envoyée au relâchement du curseur, pas en continu pendant le glissement
- Pendant le mouvement du servo, le curseur et Pos suivent la position réelle
- ⚡ Couple / 🎯 Centre / 🧹 Effacer les limites agissent sur ce seul servo

### 7.3 Onglet Débogueur FT

- **Connexion série** : sélectionnez le port, le débit en bauds (1M par défaut)
- **Analyser les servos** : détecte les servos en ligne
- **Lire les paramètres** : lit tous les registres (EEPROM + SRAM)
- **Table des paramètres** : 5 colonnes affichant les 56 registres, **la sélection d'une ligne remplit automatiquement adresse/longueur/valeur**
- **Popup d'écriture** : « ✅ Written successfully » en vert en cas de succès, « ❌ Write failed » en rouge (avec la raison) en cas d'échec
- **Contrôle de position** :
  - **Curseur** pour ajuster la position cible (0-4095), la zone de valeur se met à jour en direct ; ou saisissez directement dans la zone
  - Après le mouvement, invite à couper le couple
- **Débit en bauds / Réinitialisation d'usine** : modifier le débit en bauds, réinitialisation d'usine
- **Paramètres xdat (EEPROM uniquement)** :
  1. `💾 Save Current Servo` : enregistre les paramètres EEPROM du servo actuel dans un fichier xdat
  2. `📂 Open xdat` : charge un fichier de sauvegarde
  3. `📤 Restore to Servo` : réécrit la sauvegarde dans le servo

### 7.4 Télécommande

> ⚠️ **Sens : le bras leader commande le bras follower**. Le bras leader (maître) ne fait que lire les angles des servos ; le bras follower (esclave) est synchronisé. Nécessite des ID de servo identiques sur les deux ports.

- Bouton `🎮 Remote` de la barre supérieure : le leader lit → le follower commande (servos de même ID)
- Cliquez à nouveau pour arrêter la télécommande

## 8. Dépannage

| Problème | Solution |
|---------|----------|
| Aucun port série | Vérifiez le pilote dans le Gestionnaire de périphériques ; essayez un autre port USB ; installez le pilote CH340 |
| Port occupé | Fermez les moniteurs série ; redémarrez l'outil |
| Texte chinois vide | Le système dispose de Microsoft YaHei ; installez une police CJK en cas de problème |
| Servo introuvable | Vérifiez l'alimentation/le câblage ; confirmez 1M baud |
| PermissionError à l'ouverture du port | Assurez-vous qu'aucun autre processus n'occupe le port COM |

## 9. Outils en ligne de commande (facultatif)

```bash
# Analyse des servos
python -m src.tools.scan_id

# Calibration rapide du centre
python -m src.tools.servo_quick_calibration

# Calibration LeRobot
python -m src.tools.lerobot_calibrate
```
