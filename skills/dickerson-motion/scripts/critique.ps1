<#
.SYNOPSIS
  Critique images for one rendered video: the PowerShell port of critique.sh (see CRITIQUE.md).

.DESCRIPTION
  Writes review\<video-name>\round-<N>\ (N defaults to the next unused round):
    contact_2fps_NN.png  the whole video at 2 fps, tiled, with timestamps
    strip_<t>.png        8 consecutive frames from 4 frames before each fast action
                         (-Strips from the shot list; default: detected cuts)
    phone_360.mp4        the video at 360 px wide, plus phone_360_NN.png sheets at 1 fps
    loop_seam.png/.txt   last frame | first frame | difference, their SSIM, audio level at both ends
    probe.txt            streams, duration and loudness (integrated LUFS, true peak)
  Needs ffmpeg and ffprobe on PATH. Works in Windows PowerShell 5.1 and PowerShell 7.

.EXAMPLE
  .\critique.ps1 -Video out\piece_9x16_1080x1920_v1.mp4 -Strips 3.0,8.15,16.25

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File skills\dickerson-motion\scripts\critique.ps1 -Video out\piece.mp4 -Round 2
#>
param(
  [Parameter(Mandatory = $true, Position = 0)] [string] $Video,
  [string[]] $Strips,
  [int] $Round = 0,
  [string] $Out,
  [string] $Font = $env:CRITIQUE_FONT
)

$ErrorActionPreference = 'Stop'
$Inv = [Globalization.CultureInfo]::InvariantCulture

function Invoke-Tool([string] $Exe, [string[]] $Argv) {
  # Native tools write progress to stderr; in PowerShell 5.1 that must not become a terminating error.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try { $lines = @(& $Exe @Argv 2>&1 | ForEach-Object { "$_" }) }
  finally { $ErrorActionPreference = $prev }
  if ($LASTEXITCODE -ne 0) { throw "$Exe failed (exit $LASTEXITCODE):`n$($lines -join "`n")" }
  return $lines
}
function Num([double] $x, [string] $fmt) { return $x.ToString($fmt, $Inv) }
function Last-Match([string[]] $lines, [string] $pattern) {
  $m = [regex]::Matches(($lines -join "`n"), $pattern)
  if ($m.Count -eq 0) { return $null }
  return $m[$m.Count - 1].Groups[1].Value
}

if (-not (Test-Path -LiteralPath $Video)) { throw "critique.ps1: $Video not found" }
foreach ($tool in 'ffmpeg', 'ffprobe') {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "critique.ps1: $tool is not on PATH (see INSTALL.md)" }
}

$name = [IO.Path]::GetFileNameWithoutExtension($Video)
if (-not $Out) {
  if ($Round -le 0) { $Round = 1; while (Test-Path (Join-Path 'review' "$name\round-$Round")) { $Round++ } }
  $Out = Join-Path 'review' "$name\round-$Round"
}
New-Item -ItemType Directory -Force -Path $Out | Out-Null

function Probe([string] $sel, [string] $entries) {
  $r = Invoke-Tool 'ffprobe' @('-v', 'error', '-select_streams', $sel, '-show_entries', $entries, '-of', 'default=nw=1:nk=1', $Video)
  return ($r | Select-Object -First 1)
}
$W = [int](Probe 'v:0' 'stream=width')
$H = [int](Probe 'v:0' 'stream=height')
$rate = (Probe 'v:0' 'stream=r_frame_rate') -split '/'
$Fps = [double]::Parse($rate[0], $Inv) / $(if ($rate.Count -gt 1) { [double]::Parse($rate[1], $Inv) } else { 1 })
$Dur = [double]::Parse((Invoke-Tool 'ffprobe' @('-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', $Video) | Select-Object -First 1), $Inv)
$HasAudio = [bool](Invoke-Tool 'ffprobe' @('-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', $Video) | Select-Object -First 1)

# Timestamps need a font file on some ffmpeg builds (Windows). Find one, or leave them off.
if (-not $Font) {
  $candidates = @()
  if ($env:OS -eq 'Windows_NT') {
    $candidates += (Join-Path $env:WINDIR 'Fonts\arial.ttf'), (Join-Path $env:WINDIR 'Fonts\segoeui.ttf')
  } else {
    if (Get-Command fc-match -ErrorAction SilentlyContinue) { $candidates += (& fc-match -f '%{file}' 'DejaVu Sans') }
    $candidates += '/System/Library/Fonts/Supplemental/Arial.ttf', '/Library/Fonts/Arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
  }
  $Font = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
}
function Stamp([int] $size) {
  # "drawtext=...," showing each frame's time, or nothing without a font
  if (-not $Font) { return '' }
  $f = ($Font -replace '\\', '/') -replace ':', '\:'
  return "drawtext=fontfile='$f':text='%{pts\:hms}':x=6:y=6:fontsize=${size}:fontcolor=yellow:box=1:boxcolor=black@0.6,"
}

# Tile sizes by shape: sheets stay about 1500 px wide.
if ($H -gt $W) { $cols = 8; $th = 320; $sh = 360 }
elseif ($H -eq $W) { $cols = 6; $th = 240; $sh = 270 }
else { $cols = 5; $th = 180; $sh = 180 }

# 1. Contact sheet at 2 fps.
Remove-Item (Join-Path $Out 'contact_2fps_*.png') -ErrorAction SilentlyContinue
Invoke-Tool 'ffmpeg' @('-v', 'error', '-y', '-i', $Video,
  '-vf', "fps=2,scale=-2:${th},$(Stamp 16)tile=${cols}x5:padding=4:color=0x222222",
  (Join-Path $Out 'contact_2fps_%02d.png')) | Out-Null

# 2. Frame strips around fast actions. Default: detected cuts at least 1 s apart (up to 8),
#    or the quarter points if nothing cuts.
$times = @()
if ($Strips) {
  foreach ($s in (($Strips -join ',') -split ',')) { if ($s.Trim()) { $times += [double]::Parse($s.Trim(), $Inv) } }
} else {
  $lines = Invoke-Tool 'ffmpeg' @('-v', 'info', '-i', $Video, '-an', '-vf', "select='gt(scene,0.25)',showinfo", '-f', 'null', '-')
  $last = -10.0
  foreach ($m in [regex]::Matches(($lines -join "`n"), 'pts_time:([0-9.]+)')) {
    $t = [double]::Parse($m.Groups[1].Value, $Inv)
    if (($t - $last) -ge 1 -and $times.Count -lt 8) { $times += $t; $last = $t }
  }
  if ($times.Count -eq 0) { $times = @(($Dur / 4), ($Dur / 2), (3 * $Dur / 4)) }
}
Remove-Item (Join-Path $Out 'strip_*.png') -ErrorAction SilentlyContinue
foreach ($t in $times) {
  $start = [Math]::Max(0, $t - 4.5 / $Fps)
  Invoke-Tool 'ffmpeg' @('-v', 'error', '-y', '-ss', (Num $start '0.000'), '-copyts', '-i', $Video, '-frames:v', '1',
    '-vf', "select='lt(n\,8)',scale=-2:${sh},$(Stamp 14)tile=8x1:padding=2:color=0x222222",
    (Join-Path $Out "strip_$(Num $t '000.00').png")) | Out-Null
}

# 3. Phone test: the whole video at 360 px wide, and 1 fps sheets at that size.
Invoke-Tool 'ffmpeg' @('-v', 'error', '-y', '-i', $Video, '-vf', 'scale=360:-2:flags=area', '-c:v', 'libx264',
  '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart',
  (Join-Path $Out 'phone_360.mp4')) | Out-Null
Remove-Item (Join-Path $Out 'phone_360_*.png') -ErrorAction SilentlyContinue
Invoke-Tool 'ffmpeg' @('-v', 'error', '-y', '-i', $Video,
  '-vf', "fps=1,scale=360:-2:flags=area,$(Stamp 12)tile=6x2:padding=4:color=0x222222",
  (Join-Path $Out 'phone_360_%02d.png')) | Out-Null

# 4. Loop seam: last frame | first frame | 4x-amplified difference, SSIM, and audio level at both ends.
$first = Join-Path $Out 'first.png'
$lastFrame = Join-Path $Out 'last.png'
Invoke-Tool 'ffmpeg' @('-v', 'error', '-y', '-i', $Video, '-frames:v', '1', $first) | Out-Null
Invoke-Tool 'ffmpeg' @('-v', 'error', '-y', '-sseof', '-0.5', '-i', $Video, '-update', '1', $lastFrame) | Out-Null
$ssimRaw = Last-Match (Invoke-Tool 'ffmpeg' @('-i', $lastFrame, '-i', $first, '-lavfi', '[0][1]ssim', '-f', 'null', '-')) 'All:([0-9.]+)'
$ssim = $(if ($ssimRaw) { Num ([double]::Parse($ssimRaw, $Inv)) '0.000' } else { 'n/a' })
Invoke-Tool 'ffmpeg' @('-v', 'error', '-y', '-i', $lastFrame, '-i', $first, '-filter_complex',
  "[0]format=gbrp,split[a][a2];[1]format=gbrp,split[b][b2];[a2][b2]blend=all_mode=difference,lutrgb=r='min(val*4\,255)':g='min(val*4\,255)':b='min(val*4\,255)'[d];[a]scale=-2:360[x];[b]scale=-2:360[y];[d]scale=-2:360[z];[x][y][z]hstack=inputs=3",
  (Join-Path $Out 'loop_seam.png')) | Out-Null
function Rms([string[]] $pre) {
  $v = Last-Match (Invoke-Tool 'ffmpeg' ($pre + @('-i', $Video, '-vn', '-af', 'astats', '-f', 'null', '-'))) 'RMS level dB:\s*(\S+)'
  if (-not $v) { return 'n/a' }
  if ($v -match 'inf') { return '-inf' }
  return Num ([double]::Parse($v, $Inv)) '0.0'
}
$aStart = 'n/a'; $aEnd = 'n/a'
if ($HasAudio) { $aStart = Rms @('-t', '0.05'); $aEnd = Rms @('-sseof', '-0.05') }
@"
loop_seam.png: last frame | first frame | difference (amplified 4x)
SSIM, last vs first frame: $ssim   (1.0 = identical; a seamless loop needs about 0.9 or more)
audio RMS, first 50 ms: $aStart dB   last 50 ms: $aEnd dB
Looping piece: the last frame should flow into the first, and neither end should be loud (a click at the seam).
One-shot piece: the first frame is the poster, and the last 50 ms should be near silence (below about -40 dB)
so the ending doesn't cut a sound off.
"@ | Set-Content -Path (Join-Path $Out 'loop_seam.txt') -Encoding ASCII

# 5. Probe: streams, duration, loudness.
$probe = @("file: $Video")
$probe += Invoke-Tool 'ffprobe' @('-v', 'error', '-show_entries',
  'format=duration,size,bit_rate:stream=codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,color_space,sample_rate,channels',
  '-of', 'default=nw=1', $Video)
$loud = $null
if ($HasAudio) {
  $probe += 'loudness (EBU R128, target about -14 LUFS, true peak at or below -1 dBTP):'
  $inSummary = $false
  foreach ($l in (Invoke-Tool 'ffmpeg' @('-nostats', '-hide_banner', '-i', $Video, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'))) {
    if ($l -match 'Summary:') { $inSummary = $true }
    if ($inSummary -and $l -cmatch '^\s*(I|LRA|Peak):') { $probe += '  ' + $l.Trim() }
    if ($inSummary -and $l -match '^\s*I:\s*(\S+)\s*LUFS') { $loud = "$($Matches[1]) LUFS" }
  }
}
$probe | Set-Content -Path (Join-Path $Out 'probe.txt') -Encoding ASCII

$sheets = @(Get-ChildItem (Join-Path $Out 'contact_2fps_*.png')).Count
$loudText = $(if ($loud) { ", $loud" } else { '' })
Write-Host "critique: $Out"
Write-Host "  ${W}x${H} at $(Num $Fps '0.##') fps, $(Num $Dur '0.0') s$loudText"
Write-Host "  contact_2fps_NN.png ($sheets sheets), strips at $(($times | ForEach-Object { Num $_ '0.00' }) -join ','), phone_360.mp4 and sheets"
Write-Host "  loop seam SSIM $ssim; audio ends $aStart / $aEnd dB; probe.txt"
if (-not $Font) { Write-Host '  (no font found for timestamps: pass -Font FILE or set CRITIQUE_FONT)' }
Write-Host 'Next: look at every image, then grade with prompts/harsh-director.md and log docs/review_log.md.'
