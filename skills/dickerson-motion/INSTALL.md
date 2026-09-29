# Install

What the skill uses:

| Tool | For | Version |
|---|---|---|
| Python, with librosa, numpy and soundfile | `beats.py` (beat-timed cuts), `reference.py` | Python 3.11–3.13 (3.12 recommended) |
| ffmpeg and ffprobe | everything video: encoding, critique images, reference frames, loudness | any recent build (6 or newer) |
| Node.js | `render.mjs` and the layout tests | 22 or newer |
| Google Chrome | headless rendering through puppeteer-core | current |
| Git | cloning this repo, with its skill symlinks | current |

Run the Python steps from the repo root. Paths below are relative to it.

## macOS

```bash
brew install python@3.12 ffmpeg node git
brew install --cask google-chrome        # or install Chrome from google.com/chrome

python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r skills/dickerson-motion/requirements.txt
python skills/dickerson-motion/scripts/beats.py --selftest     # prints "selftest: PASS"
```

## Linux (Debian or Ubuntu)

```bash
sudo apt update
sudo apt install -y python3 python3-venv ffmpeg git   # python3-venv is required: without it, venv can't install pip
# Node.js 22+: https://nodejs.org or nvm. Chrome: the .deb from google.com/chrome.

python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r skills/dickerson-motion/requirements.txt
python skills/dickerson-motion/scripts/beats.py --selftest     # prints "selftest: PASS"
```

## Windows 11 (PowerShell)

1. **Install the tools**, then close and reopen PowerShell so the new PATH entries apply:

   ```powershell
   winget install -e --id Python.Python.3.12
   winget install -e --id Gyan.FFmpeg
   winget install -e --id OpenJS.NodeJS.LTS
   winget install -e --id Git.Git
   winget install -e --id Google.Chrome
   ```

2. **Clone with symlinks.** The skill is exposed to agents through symlinks: `.claude/skills/dickerson-motion` points to `skills/dickerson-motion`, and the same goes for `.agents/` and `.opencode/`. On Windows, Git creates real symlinks only if you do both of these:
   - turn on Developer Mode (Settings → System → For developers → Developer Mode), or run Git as Administrator;
   - clone with symlinks enabled:

     ```powershell
     git clone -c core.symlinks=true https://github.com/tanner1113/brag.git
     cd brag
     ```

   Without symlinks, those paths check out as small text files and agents won't find the skill. To fix an existing clone, run `git config core.symlinks true`, delete the three `dickerson-motion` placeholder files, and run `git checkout -- .claude .agents .opencode`. Or skip symlinks: delete the placeholder file and copy the folder instead:

   ```powershell
   Remove-Item .claude\skills\dickerson-motion
   Copy-Item -Recurse skills\dickerson-motion .claude\skills\dickerson-motion       # this project only
   Copy-Item -Recurse skills\dickerson-motion $env:USERPROFILE\.claude\skills\       # every project
   ```

   Re-copy after you pull updates.

3. **Set up Python.** If `Activate.ps1` is blocked, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or skip activation and call `.\.venv\Scripts\python.exe` directly.

   ```powershell
   py -3.12 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   python -m pip install -r skills\dickerson-motion\requirements.txt
   python skills\dickerson-motion\scripts\beats.py --selftest    # prints "selftest: PASS"
   ```

4. **Run the critique script** natively, or through Git Bash, which Claude Code on Windows already uses:

   ```powershell
   powershell -ExecutionPolicy Bypass -File skills\dickerson-motion\scripts\critique.ps1 -Video out\piece_9x16_1080x1920_v1.mp4 -Strips 3.0,8.15
   bash skills/dickerson-motion/scripts/critique.sh out/piece_9x16_1080x1920_v1.mp4 --strips 3.0,8.15
   ```

   The repo's `.gitattributes` keeps `.sh` files on LF line endings, so they run in Git Bash even when `core.autocrlf` is on.

5. **Chrome** is found at `C:\Program Files\Google\Chrome\Application\chrome.exe`. If it's somewhere else, set `$env:CHROME = "D:\path\to\chrome.exe"` before running `render.mjs`.

## Fonts (per project)

Both faces are SIL OFL. Download them into the project's `composition/fonts/` (the template's `.gitignore` keeps the TTFs out of git):

```bash
mkdir -p composition/fonts
curl -L -o composition/fonts/NotoSansDisplay-VF.ttf "https://github.com/google/fonts/raw/main/ofl/notosansdisplay/NotoSansDisplay%5Bwdth%2Cwght%5D.ttf"
curl -L -o composition/fonts/NotoSans-VF.ttf "https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans%5Bwdth%2Cwght%5D.ttf"
curl -L -o composition/fonts/OFL.txt "https://github.com/google/fonts/raw/main/ofl/notosans/OFL.txt"
```

```powershell
New-Item -ItemType Directory -Force composition\fonts | Out-Null
Invoke-WebRequest "https://github.com/google/fonts/raw/main/ofl/notosansdisplay/NotoSansDisplay%5Bwdth%2Cwght%5D.ttf" -OutFile composition\fonts\NotoSansDisplay-VF.ttf
Invoke-WebRequest "https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans%5Bwdth%2Cwght%5D.ttf" -OutFile composition\fonts\NotoSans-VF.ttf
Invoke-WebRequest "https://github.com/google/fonts/raw/main/ofl/notosans/OFL.txt" -OutFile composition\fonts\OFL.txt
```

## Render dependencies (per project)

From the project folder (a copy of `templates/project/`):

```bash
npm install          # puppeteer-core only; it drives your installed Chrome
npm test             # layout checks for all three formats, no rendering
npm run lint         # the deterministic render contract
```

## Check everything

```bash
python --version && ffmpeg -version && ffprobe -version && node --version && git --version
python skills/dickerson-motion/scripts/beats.py --selftest
python -c "import librosa, soundfile, numpy; print(librosa.__version__, soundfile.__libsndfile_version__, numpy.__version__)"
```

`soundfile`'s wheels bundle libsndfile 1.1 or newer, which reads MP3. If `beats.py` can't read a file, it falls back to ffmpeg.

If you prefer [uv](https://docs.astral.sh/uv/), the repo's other Python tooling already uses it: `uv venv`, then `uv pip install -r skills/dickerson-motion/requirements.txt`.
