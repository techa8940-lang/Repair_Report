# build_pdfs_new.ps1 — แปลง HTML ใหม่เป็น PDF
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$base = "d:\ฝึกงงาน อุทยาน\AMC_Repair\ระบบแจ้งการซ่อม"
$manuals = Join-Path $base "manuals"

$jobs = @(
    @{ html = "$manuals\manual_reporter.html";   pdf = "$manuals\คู่มือการใช้งาน_สำหรับผู้แจ้งซ่อม.pdf";  name = "ผู้แจ้งซ่อม" },
    @{ html = "$manuals\manual_technician.html"; pdf = "$manuals\คู่มือการใช้งาน_สำหรับช่างซ่อมบำรุง.pdf"; name = "ช่างซ่อมบำรุง" },
    @{ html = "$manuals\manual_admin.html";      pdf = "$manuals\คู่มือการใช้งาน_สำหรับผู้ดูแลระบบ.pdf"; name = "ผู้ดูแลระบบ" }
)

foreach ($job in $jobs) {
    $htmlPath = $job.html
    $pdfPath  = $job.pdf
    $name     = $job.name

    Write-Host "Converting: $name ..."
    $uri = "file:///" + ($htmlPath -replace '\\','/' -replace ' ','%20')
    $pdfArg = "--print-to-pdf=$pdfPath"

    & $edge --headless --disable-gpu --no-sandbox --run-all-compositor-stages-before-draw --print-to-pdf-no-header-footer $pdfArg $uri
    Start-Sleep -Seconds 2

    if (Test-Path $pdfPath) {
        $kb = [math]::Round((Get-Item $pdfPath).Length / 1KB, 1)
        Write-Host "  [OK] $name — $kb KB"
    } else {
        Write-Host "  [FAIL] $name — PDF not created"
    }
}

Write-Host ""
Write-Host "Done! All PDFs in: $manuals"
