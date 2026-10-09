[English](../en/Linux.md) | [简体中文](../zh-hans/Linux.md) | [繁體中文](../zh-hant/Linux.md) | [Deutsch](../de/Linux.md) | [Español](../es/Linux.md) | Français | [Italiano](../it/Linux.md) | [日本語](../ja/Linux.md) | [한국어](../ko/Linux.md) | [Português (BR)](../pt-br/Linux.md) | [Português (PT)](../pt-pt/Linux.md)

# Outil de calibration de la série SoARM — Guide Linux

Pour Ubuntu / Debian / autres distributions courantes. Points clés : permissions série (dialout), détection des périphériques USB-série.

> ⚠️ **Compatibilité : cet outil ne prend actuellement en charge que les servos Feetech (série STS3215)**. La table des registres et le format xdat sont conçus pour les Feetech STS3215 ; les autres marques/modèles ne sont pas garantis.

---

## 1. Prérequis

| Dépendance | Version |
|-----------|---------|
| Python | >= 3.8 (3.10+ recommandé) |
| PySide6 | >= 6.0 |
| pyserial | >= 3.5 |
| Système | Ubuntu 20.04+ / Debian 11+ |

Polices chinoises (nécessaires pour l'interface en chinois) :

```bash
sudo apt install fonts-noto-cjk
```

Polices d'icônes emoji (pour ✅⚠️ etc. dans les journaux) :

```bash
sudo apt install fonts-noto-color-emoji
```

## 2. Installer les dépendances Python

```bash
cd SO-ARM101-ServoController
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> ⚠️ **Ne créez l'environnement virtuel qu'UNE SEULE FOIS**. Le relancer réinitialisera/écrasera l'environnement (effaçant les dépendances installées). Ensuite, contentez-vous de `source .venv/bin/activate`.

> Si pip signale « externally-managed-environment », utilisez un venv ou `pip install --break-system-packages -r requirements.txt`.

## 3. ⚠️ Permission de port série (dialout) [requis]

Par défaut, les utilisateurs normaux **ne peuvent pas accéder** à `/dev/ttyUSB*` / `/dev/ttyACM*`. Ajoutez votre utilisateur au groupe `dialout` :

```bash
sudo usermod -a -G dialout $USER
```

**Déconnectez-vous puis reconnectez-vous** (ou redémarrez). Vérifiez :

```bash
groups
# La sortie doit inclure dialout
```

> Certaines distributions utilisent `uucp` (Arch) ou `tty`.

## 4. Identifier le périphérique série USB

Après le branchement :

```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```

Sortie typique :

```
/dev/ttyUSB0   # CH340 / CP2102 / PL2303
/dev/ttyACM0   # série USB natif (Arduino/ESP32 intégré)
```

Pour afficher les informations détaillées sur le fabricant :

```bash
dmesg | tail -20 | grep -i tty
# ou
lsusb
```

> En présence de plusieurs périphériques, ttyUSB0/ttyUSB1 sont attribués dans l'ordre de branchement et peuvent être instables. Il est recommandé d'**utiliser `/dev/ttyACM*` ou de fixer selon le fabricant**.

## 5. Vérifier l'environnement

```bash
python setup.py
```

## 6. Lancer l'interface graphique

```bash
python -m src.gui.factory_calibration_tool
```

Spécifier les ports :

```bash
python -m src.gui.factory_calibration_tool --port1 /dev/ttyUSB0 --port2 /dev/ttyUSB1
```

> S'il n'y a qu'un seul port série, l'outil définit automatiquement le second port sur « désactivé ».

## 7. Flux de travail de l'interface

### 7.1 Onglet Calibration des servos
Sélectionnez le port, analyse automatique des servos ; calibration du centre / test du centre / désactivation des servos.

### 7.2 Onglet Commande d'un servo individuel
Contrôle de position par curseur, interrupteur de couple.

### 7.3 Onglet Débogueur FT
- Connexion série (1M par défaut), analyse des servos
- Lire tous les registres, table des paramètres (56 registres), la sélection d'une ligne remplit automatiquement adresse/longueur/valeur
- Popup d'écriture : succès en vert / échec en rouge (avec la raison)
- Contrôle de position : curseur (0-4095) avec synchronisation de la zone de valeur
- Débit en bauds / réinitialisation d'usine
- Paramètres xdat (EEPROM uniquement) : enregistrer → ouvrir → restaurer

### 7.4 Télécommande

> ⚠️ **Sens : le port 1 commande le port 2**. Le port 1 (maître) lit les angles, le port 2 (esclave) est synchronisé. Nécessite des ID identiques sur les deux ports.

Barre supérieure `🎮 Télécommande` : le port 1 lit → le port 2 contrôle (ID de servos identiques requis sur les deux ports)

## 8. Dépannage

| Problème | Solution |
|---------|----------|
| **Permission denied: /dev/ttyUSB0** | Vous n'êtes pas dans le groupe dialout, voir la section 3 ; ou `sudo chmod 666 /dev/ttyUSB0` (temporaire) |
| Aucun port série | `ls /dev/ttyUSB* /dev/ttyACM*` ; `lsusb` pour confirmer le périphérique |
| Le nom du périphérique change | La numérotation ttyUSB dépend de l'ordre de branchement ; utilisez une règle udev ou sélectionnez-le à chaque lancement |
| Interface chinoise vide | Installez `fonts-noto-cjk` |
| Les emoji s'affichent en carrés | Installez `fonts-noto-color-emoji` |
| Échec de pip install | Utilisez un venv ; ou `--break-system-packages` |

## 9. Outils en ligne de commande (facultatif)

```bash
# Analyse des servos
python -m src.tools.scan_id

# Calibration LeRobot
python -m src.tools.lerobot_calibrate /dev/ttyACM0
```

## 10. Avancé : nom de périphérique fixe via udev (facultatif)

Créez `/etc/udev/rules.d/99-servo.rules` pour fixer le nom du périphérique par ID USB :

```
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyServo"
```

Ensuite `ls -l /dev/ttyServo`. Obtenez l'ID du fabricant avec `lsusb`.
