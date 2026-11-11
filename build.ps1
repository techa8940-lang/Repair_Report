# ==============================================================================
# NU SEED Repair System - Build & Minification Script
# รวมและบีบอัดโค้ด JavaScript เป็น bundle.min.js ไฟล์เดียวสำหรับ Production
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  NU SEED Repair - Production Bundler     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$sourceFiles = @(
    "app.js",
    "user_views.js",
    "tech_views.js",
    "admin_views.js"
)

$outputFile = "bundle.min.js"
$combined = ""

foreach ($file in $sourceFiles) {
    if (Test-Path $file) {
        Write-Host "Packing: $file..." -ForegroundColor Gray
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        $combined += "`n" + $content + "`n"
    } else {
        Write-Error "Missing required source file: $file"
    }
}

Write-Host "Minifying and stripping comments..." -ForegroundColor Yellow

$lines = $combined -split "`r?`n"
$cleaned = [System.Collections.Generic.List[string]]::new()
$inBlockComment = $false

foreach ($line in $lines) {
    $trimmed = $line.Trim()

    if ($inBlockComment) {
        if ($trimmed.Contains("*/")) {
            $inBlockComment = $false
            $line = $line.Substring($line.IndexOf("*/") + 2)
            $trimmed = $line.Trim()
        } else {
            continue
        }
    }

    if ($trimmed.StartsWith("/*") -and -not $trimmed.EndsWith("*/")) {
        $inBlockComment = $true
        continue
    }

    # ตัดคอมเมนต์บรรทัดเต็มที่ขึ้นต้นด้วย //
    if ($trimmed.StartsWith("//")) {
        continue
    }

    if ($trimmed.Length -eq 0) {
        continue
    }

    $cleaned.Add($line)
}

$finalCode = [string]::Join("`n", $cleaned)

# เขียนไฟล์ผลลัพธ์ UTF-8 ไม่มี BOM เพื่อความเร็วในการโหลด
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $outputFile), $finalCode, $utf8NoBom)

$origSize = 0
foreach ($f in $sourceFiles) { $origSize += (Get-Item $f).Length }
$newSize = (Get-Item $outputFile).Length
$saved = [Math]::Round((1 - ($newSize / $origSize)) * 100, 1)

Write-Host ""
Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "Original Size: $([Math]::Round($origSize / 1024, 1)) KB (4 files)" -ForegroundColor Gray
Write-Host "Bundle Size:   $([Math]::Round($newSize / 1024, 1)) KB ($outputFile)" -ForegroundColor Green
Write-Host "Reduced by:    $saved%" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
