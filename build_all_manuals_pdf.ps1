# build_all_manuals_pdf.ps1
# แปลง HTML คู่มือทั้ง 3 ชุดเป็นไฟล์ PDF ผ่าน Edge โดยตัด Header/Footer เบราว์เซอร์ออก 100%

Write-Output "================================================="
Write-Output "  Generating HTML manuals..."
Write-Output "================================================="

& powershell -ExecutionPolicy Bypass -File .\build_reporter_html.ps1
& powershell -ExecutionPolicy Bypass -File .\build_technician_html.ps1
& powershell -ExecutionPolicy Bypass -File .\build_admin_html.ps1

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}

Write-Output "Using browser engine: $edgePath"

$manuals = @(
    @{ 
        html = "$PWD\manuals\manual_reporter.html"; 
        pdf = "$PWD\manuals\คู่มือการใช้งาน_สำหรับผู้แจ้งซ่อม.pdf"; 
        title = "คู่มือผู้แจ้งซ่อม (Reporter Manual)" 
    },
    @{ 
        html = "$PWD\manuals\manual_technician.html"; 
        pdf = "$PWD\manuals\คู่มือการใช้งาน_สำหรับช่างซ่อมบำรุง.pdf"; 
        title = "คู่มือช่างซ่อมบำรุง (Technician Manual)" 
    },
    @{ 
        html = "$PWD\manuals\manual_admin.html"; 
        pdf = "$PWD\manuals\คู่มือการใช้งาน_สำหรับผู้ดูแลระบบ.pdf"; 
        title = "คู่มือผู้ดูแลระบบ (Admin Manual)" 
    }
)

foreach ($m in $manuals) {
    Write-Output "Converting: $($m.title) -> $($m.pdf)..."
    
    # ลบไฟล์เก่าออกก่อน
    if (Test-Path $m.pdf) { Remove-Item $m.pdf -Force }
    $destRoot = "$PWD\$([System.IO.Path]::GetFileName($m.pdf))"
    if (Test-Path $destRoot) { Remove-Item $destRoot -Force }

    $argList = @(
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        "--print-to-pdf-no-header-footer",
        "--print-to-pdf=`"$($m.pdf)`"",
        "`"$($m.html)`""
    )

    $proc = Start-Process -FilePath $edgePath -ArgumentList $argList -PassThru -Wait
    Start-Sleep -Seconds 2

    if (Test-Path $m.pdf) {
        $size = (Get-Item $m.pdf).Length
        Write-Output "  [SUCCESS] Created: $($m.pdf) ($([math]::Round($size / 1KB, 1)) KB)"
        Copy-Item -Path $m.pdf -Destination $destRoot -Force
        Write-Output "  [COPIED] -> $destRoot"
    } else {
        Write-Output "  [FAILED] Could not create: $($m.pdf)"
    }
}

Write-Output "================================================="
Write-Output "  All 3 PDF manuals generated successfully!"
Write-Output "================================================="
