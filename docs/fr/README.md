[English](../en/README.md) | [简体中文](../zh-hans/README.md) | [繁體中文](../zh-hant/README.md) | [Deutsch](../de/README.md) | [Español](../es/README.md) | Français | [Italiano](../it/README.md) | [日本語](../ja/README.md) | [한국어](../ko/README.md) | [Português (BR)](../pt-br/README.md) | [Português (PT)](../pt-pt/README.md)

<div align="center">

# Outil de calibration de la série So-ARM

**Une boîte à outils de calibration d'usine et de calibration LeRobot pour les servos FTServo des bras robotiques de la série So-ARM 10X**

> ⚠️ **Avis de compatibilité : ce système ne prend actuellement en charge que les servos Feetech (série STS3215).** La table des registres, le format de paramètres xdat et la table des débits en bauds sont tous conçus pour la série Feetech STS3215 ; la compatibilité des servos d'autres marques ou modèles n'est pas garantie.

> 📜 **Origine et crédits : cet outil est construit sur [Seeed Studio's Seeed_RoboController](https://github.com/Seeed-Studio) et l'étend**, publié sous licence MIT. Tout en préservant les fonctionnalités de base d'origine, ce projet remanie l'interface graphique et ajoute un débogueur FT, la sauvegarde/restauration des paramètres xdat, la prise en charge multiplateforme et d'autres améliorations. Voir [LICENSE](../../LICENSE) pour plus de détails.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Ubuntu%20%7C%20macOS-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![GUI](https://img.shields.io/badge/GUI-PySide6-orange)

[Fonctionnalités](#-fonctionnalités) · [Aperçu de l'interface](#-aperçu-de-linterface) · [Démarrage rapide](#-démarrage-rapide) · [Étapes d'utilisation](#-étapes-dutilisation) · [Précautions](#-précautions) · [Dépannage](#-dépannage)

</div>

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
| ---- | ---- |
| Détection automatique des ports | Identifie les ports série USB et filtre les périphériques virtuels |
| Prise en charge multiplateforme | Fonctionne sous Windows / Ubuntu / macOS |
| Synchronisation double port | Les ports série gauche et droit fonctionnent indépendamment, avec télécommande synchronisée maître/esclave sur les deux ports |
| Bascule chinois/anglais | Basculez l'interface entre le chinois et l'anglais en un clic ; le choix est mémorisé |
| Calibration du centre | Grave la position actuelle du servo comme centre 2048 (persistée dans l'EEPROM) |
| Test du centre | Active le couple et déplace les servos vers le centre pour vérifier la calibration |
| Désactivation des moteurs | Désactive le couple sur tous les servos en un clic pour un réglage manuel |
| Analyse automatique | Détecte automatiquement chaque servo en ligne dont l'ID est compris entre 1 et 20 |
| Commande d'un servo individuel | Contrôle en temps réel, via un curseur, de la position d'un servo et de son interrupteur de couple |
| Débogueur FT | Connexion série, analyse, lecture/écriture de paramètres, contrôle de position, changement de débit en bauds, réinitialisation d'usine, sauvegarde des paramètres xdat |
| Paramètres xdat | Enregistre les paramètres EEPROM du servo actuel / ouvre une sauvegarde à restaurer |
| Calibration LeRobot | Génère des fichiers de calibration JSON au format LeRobot |
| Retour au centre depuis un fichier de calibration | Déplace le bras vers le centre à partir d'un fichier de calibration |

---

## 📚 Guides par système d'exploitation

| Système | Guide |
|----|-------|
| Windows | [Guide Windows](Windows.md) |
| Linux | [Guide Linux](Linux.md) |
| macOS | [Guide macOS](macOS.md) |

---

## 🖥️ Aperçu de l'interface

Le programme principal comporte trois onglets :

```
┌────────────────────────────────────────────────────────────────────────┐
│  Suite de calibration SoARM  [Port1▾] [Port2▾] [🔄] [🎮 Télécommande][EN]│  ← Barre supérieure
├────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┬──────────────────────────────────┐ │
│  │ Port 1 - Calibration servo     │ Port 2 - Calibration servo       │ │
│  │ [🔴 Non connecté] Position : …  │ [🔴 Non connecté] Position : …    │ │
│  │ Table d'état des servos 1–6    │ Table d'état des servos 1–6      │ │
│  │ [Calib. centre][Test centre]…  │ [Calib. centre][Test centre]…    │ │
│  └────────────────────────────────┴──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

- **Barre supérieure** : titre de l'application, listes déroulantes des ports série, bouton d'actualisation, bouton de télécommande et bouton de bascule de langue.
- **🦾 Onglet 1 — Calibration des servos** : actions rapides sur les panneaux gauche et droit (calibration du centre, test du centre, désactivation des moteurs) ainsi que l'état en temps réel.
- **🎚️ Onglet 2 — Commande d'un servo individuel** : ajustez finement la position de chaque servo en ligne à l'aide d'un curseur et activez ou désactivez son couple.
- **🔬 Onglet 3 — Débogueur FT** : connexion série, analyse, lecture/écriture de paramètres, contrôle de position, débit en bauds / réinitialisation d'usine, ainsi que sauvegarde et restauration des paramètres xdat.

---

## 🚀 Démarrage rapide

> Voir les [📚 Guides par système d'exploitation](#-guides-par-système-dexploitation) pour les procédures complètes par système. L'essentiel pour chaque système est présenté ci-dessous.

### Windows

1. Installez [Python 3.10+](https://www.python.org/downloads/) (cochez **Add to PATH**).
2. Créez un environnement virtuel et installez les dépendances :

```bash
cd SO-ARM101-ServoController
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

3. Vérifiez l'environnement et lancez :

```bash
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Confirmez le port COM dans le Gestionnaire de périphériques (par exemple `COM3`) et sélectionnez-le dans la barre supérieure. Pour spécifier les ports manuellement :

```bash
python -m src.gui.factory_calibration_tool --port1 COM3 --port2 COM4
```

### Linux (Ubuntu / Debian)

1. Installez les polices CJK et les dépendances :

```bash
sudo apt install python3-venv fonts-noto-cjk fonts-noto-color-emoji
```

2. **⚠️ Ajoutez les permissions de port série (groupe dialout)** [requis] :

```bash
sudo usermod -a -G dialout $USER
# Prend effet après déconnexion puis reconnexion
```

3. Créez un environnement virtuel, installez les dépendances et lancez :

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

4. Les périphériques série sont `/dev/ttyUSB0` / `/dev/ttyACM0`. Pour les spécifier manuellement :

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

### macOS

1. Installez Python avec Homebrew :

```bash
brew install python
```

2. Créez un environnement virtuel, installez les dépendances et lancez :

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python setup.py
python -m src.gui.factory_calibration_tool
```

3. **⚠️ Nommage des ports série** : sous macOS, utilisez `/dev/cu.usbserial-*` (**recommandé, non bloquant**) plutôt que `/dev/tty.*`. Pour les lister :

```bash
ls /dev/cu.*
```

Pour les spécifier manuellement :

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/cu.usbserial-0001 --port2 /dev/cu.usbmodem141101
```

### Outils en ligne de commande généraux (sans interface graphique)

```bash
# Analyse des servos
python -m src.tools.scan_id

# Calibration rapide du centre des servos
python -m src.tools.servo_quick_calibration

# Test du centre des servos
python -m src.tools.servo_center_test

# Désactiver tous les servos
python -m src.tools.servo_disable

# Calibration de style LeRobot
python -m src.tools.lerobot_calibrate

# Télécommande synchronisée sur deux ports
python -m src.tools.servo_remote_control
```

---

## 📖 Étapes d'utilisation

### 1. Connecter et détecter les servos

1. Reliez la carte de commande du bras via un adaptateur USB-série et alimentez les servos.
2. Ouvrez l'interface graphique et sélectionnez le port correspondant dans la liste déroulante des ports série de la barre supérieure (ou cliquez sur `🔄` pour actualiser).
3. L'en-tête du panneau affiche `🟢 Connected` et recherche automatiquement les servos en ligne dont l'ID est compris entre 1 et 20 (généralement 1 à 6).

> Si le port est signalé comme occupé, assurez-vous qu'aucun autre programme (un moniteur série, ou une exécution précédente de l'outil qui ne s'est jamais fermée) ne l'occupe.

### 2. Calibration du centre (définir la position actuelle sur 2048)

> Avant de calibrer, positionnez physiquement le bras de sorte que chaque articulation se trouve à la position « zéro / centre » souhaitée.

1. Cliquez sur le bouton **Calibration du centre du port série X** du panneau.
2. Le programme désactive d'abord les servos et vous invite à les déplacer à la main jusqu'au centre souhaité.
3. Une fois que vous confirmez, le programme traite chaque servo : déverrouiller l'EEPROM → écrire la commande de calibration (value 128 to address 40) → reverrouiller l'EEPROM.
4. Vérifiez avec « Test du centre » : les servos doivent maintenir leur position (ne bouger que légèrement), ce qui confirme le succès de la calibration.

### 3. Test du centre

1. Cliquez sur **Test du centre du port série X**.
2. Le programme active le couple et déplace tous les servos vers 2048.
3. Si un servo ne bouge presque pas par rapport à sa position actuelle, la calibration est correcte ; s'il bouge beaucoup, la valeur de calibration n'est pas fiable et doit être refaite.

### 4. Désactivation des moteurs (réglage manuel)

- Cliquez sur **Désactivation des moteurs du port série X** pour désactiver le couple sur tous les servos de ce port, afin qu'ils puissent être tournés librement à la main.
- Un servo individuel peut être activé ou désactivé dans l'onglet **Commande d'un servo individuel** à l'aide de l'interrupteur de couple situé sous son curseur.

### 5. Modifier l'ID d'un servo

1. Ouvrez l'onglet **🔬 Débogueur FT**, connectez le port série et lancez l'analyse des servos.
2. Sélectionnez le servo cible, modifiez sa valeur « Servo ID » (adresse 0x05) dans la table des paramètres et cliquez sur Écrire.
3. Le programme exécute alors : déverrouiller → écrire l'adresse 5 → vérifier le nouvel ID → reverrouiller.

> ⚠️ Avant de modifier un ID, assurez-vous toujours que c'est le seul servo sur le bus afin d'éviter les conflits d'ID.

### 6. Modifier le débit en bauds / restaurer les paramètres d'usine

- **Modifier le débit en bauds** : dans la zone « Débit en bauds / Réinitialisation d'usine » de l'onglet Débogueur FT, sélectionnez le nouveau débit en bauds (38400 – 1000000 bps) et appliquez-le. Après l'écriture, le débit série bascule automatiquement et est vérifié par un ping ; en cas d'échec, il revient automatiquement à sa valeur précédente.
- **Restaurer les paramètres d'usine** : le servo revient à ses paramètres d'usine (ID=1, débit en bauds=1000000) ; vous devez relancer l'analyse ensuite.

### 7. Sauvegarde et restauration des paramètres xdat

Dans la zone « paramètres xdat (enregistrer l'EEPROM uniquement) » de l'onglet Débogueur FT :

1. **💾 Enregistrer le servo actuel** : enregistre les paramètres EEPROM du servo sélectionné dans un fichier xdat (une sauvegarde).
2. Après avoir modifié les paramètres du servo à volonté, si vous souhaitez les restaurer :
3. **📂 Ouvrir xdat** : charge un fichier de sauvegarde.
4. **📤 Restaurer les paramètres sur le servo** : réécrit la sauvegarde dans l'EEPROM du servo actuel.

### 8. Télécommande synchronisée sur deux ports

> ⚠️ **Remarque sur le sens : le port 1 commande le port 2.** Le port 1 (maître) ne fait que lire les angles des servos ; le port 2 (esclave) est piloté en synchronisation.

1. Dans la barre supérieure, cliquez sur **🎮 Télécommande** (le port 1 lit les angles → le port 2 pilote en synchronisation les servos ayant les mêmes ID).
2. Les deux ports doivent utiliser des ID de servo identiques ; seuls les servos présents sur les deux ports sont synchronisés.
3. Cliquez à nouveau sur le même bouton pour arrêter ; les threads d'analyse des panneaux gauche et droit reprennent alors automatiquement.

### 9. Calibration LeRobot (ligne de commande)

```bash
# Calibrer le bras suiveur (enregistré dans ~/.cache/huggingface/lerobot/calibration/robots/so_follower/)
python -m src.tools.lerobot_calibrate --arm-type follower

# Calibrer le bras meneur
python -m src.tools.lerobot_calibrate --arm-type leader
```

Procédure : désactiver les servos → positionner chaque articulation au centre et enregistrer `homing_offset` → faire tourner lentement sur toute la plage pour enregistrer `range_min/max` (`wrist_roll` est une articulation à rotation continue dont la plage est fixée à `[0,4095]`) → enregistrer le JSON.

Revenir au centre à partir d'un fichier de calibration :

```bash
python -m src.tools.run_calibration_middle <calibration_file.json> --mode zero
```

---

## ⚠️ Précautions

1. **La sécurité avant tout** : la calibration du centre est persistée dans l'EEPROM. Avant de calibrer, assurez-vous que l'alimentation est stable et que le bras n'entrera pas en collision avec des personnes ou des objets.
2. **Alimentation** : l'édition standard du SoARM 101 est idéalement alimentée en DC 5V 5A, et l'édition Pro en DC 12V 5A. Une alimentation insuffisante provoque des pertes de pas ou des échecs de communication.
3. **Port série exclusif** : sous Windows, le port série est exclusif, de sorte qu'un même port ne peut pas être utilisé en même temps par le thread d'analyse de l'interface graphique et par un sous-processus de calibration. L'outil arrête le thread d'analyse et termine l'ancien processus avant d'opérer ; ne cliquez pas de façon répétée à la main.
4. **Permissions série sous Linux** : pour accéder à `/dev/ttyUSB*` / `/dev/ttyACM*`, vous devez ajouter votre utilisateur au groupe `dialout` (voir le [Guide Linux](Linux.md)).
5. **Nommage des ports série sous macOS** : utilisez `/dev/cu.*` (non bloquant) plutôt que `/dev/tty.*` (bloquant, peut se figer) ; voir le [Guide macOS](macOS.md).
6. **Branchement à chaud** : lorsque vous débranchez le câble USB, le programme tente de se reconnecter automatiquement ; une fois le câble rebranché, cliquez sur `🔄` pour actualiser la liste des ports.
7. **Protection contre la surchauffe / les surtensions** : le programme surveille la tension et la température (avertissement au-dessus de 60°C). Si un servo reste chaud, arrêtez et laissez-le refroidir.
8. **La calibration du centre est irréversible** : l'écriture écrase le décalage d'origine et ne peut pas être annulée. Notez la position d'origine avant de calibrer.
9. **Risque lié au changement d'ID** : si l'écriture ou la vérification échoue, le programme signale une erreur et reprend l'analyse, mais dans des cas extrêmes un servo peut devenir « perdu ». Si cela se produit, essayez « Restaurer les paramètres d'usine » (après quoi l'ID revient à 1).
10. **Problèmes d'encodage** : si les emoji s'affichent de manière illisible dans une console Windows, définissez `PYTHONIOENCODING=utf-8` avant d'exécuter les outils en ligne de commande. Linux/macOS utilisent l'UTF-8 natif et ne sont normalement pas concernés.

---

## 🛠️ Dépannage

| Symptôme | Cause possible | Solution |
| ---- | -------- | -------- |
| Impossible d'ouvrir le port série / port occupé | Un autre programme l'utilise | Fermez les programmes tels que les moniteurs série, ou changez de port et redémarrez l'outil |
| Aucun servo détecté | Alimentation insuffisante / câblage incorrect / débit en bauds inadapté | Vérifiez l'alimentation et le câblage, et confirmez que les servos sont à 1M baud |
| Les servos s'emballent après la calibration du centre | La pose n'a pas été définie avant la calibration | Répétez « désactiver → positionner à la main → calibration du centre » |
| Température qui monte trop rapidement | Charge excessive ou articulation bloquée | Vérifiez les points de blocage mécanique et réduisez la vitesse/l'accélération |
| Servo introuvable après modification de son ID | Conflit d'ID ou échec de l'écriture | Restaurez les paramètres d'usine et relancez l'analyse |
| Télécommande désynchronisée | Les ID des deux ports diffèrent | Confirmez que des servos ayant les mêmes ID sont en ligne sur les ports maître et esclave |

---

## 📁 Structure du projet

```
SO-ARM101-ServoController/
├── docs/                    # Documentation, un dossier par langue
│   └── <lang>/              # en, zh-hans, zh-hant, de, es, fr, it, ja, ko, pt-br, pt-pt
│       ├── README.md        # Ce document
│       ├── Windows.md
│       ├── Linux.md
│       └── macOS.md
├── src/
│   ├── gui/                  # Interface graphique PySide6
│   │   ├── factory_calibration_tool.py   # Outil principal (calibration double port + télécommande + changement de langue)
│   │   ├── ft_debugger.py                # Débogueur FT (lecture/écriture de paramètres / sauvegarde xdat)
│   │   ├── calibration_wizard.py         # Assistant de calibration LeRobot
│   │   ├── theme_utils.py                # Thème clair
│   │   └── language_dialog.py            # Boîte de dialogue de sélection de la langue
│   ├── tools/                # Outils en ligne de commande
│   ├── xdat_utils.py         # Lecture/écriture des fichiers de paramètres xdat
│   ├── i18n*.py / i18n_translations/     # Internationalisation chinois/anglais
│   ├── port_utils.py         # Détection des ports série
│   └── calibration_manager.py# Gestion des fichiers de calibration LeRobot
├── scservo_sdk/              # SDK de communication des servos FTServo
├── requirements.txt
└── setup.py                  # Script de vérification de l'environnement
```
