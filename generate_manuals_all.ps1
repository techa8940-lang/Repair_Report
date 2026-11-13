# generate_manuals_all.ps1
# สร้างคู่มือทั้ง 3 ชุด เป็น HTML และแปลงเป็น PDF ผ่าน Microsoft Edge

$baseDir = "d:\ฝึกงงาน อุทยาน\AMC_Repair\ระบบแจ้งการซ่อม"
$logoPath = Join-Path $baseDir "nu_seed_logo.png"
$logoBase64 = ""
if (Test-Path $logoPath) {
    $bytes = [System.IO.File]::ReadAllBytes($logoPath)
    $logoBase64 = [System.Convert]::ToBase64String($bytes)
}
$logoSrc = if ($logoBase64) { "data:image/png;base64,$logoBase64" } else { "" }
$logoImg = if ($logoSrc) { "<img src='$logoSrc' alt='NU SEED' style='height:38px; vertical-align:middle; filter:brightness(0) invert(1);'>" } else { "" }

$manualsDir = Join-Path $baseDir "manuals"
New-Item -ItemType Directory -Force -Path $manualsDir | Out-Null

function Get-Style($themeColor, $themeGradEnd, $badgeColor) {
    return @"
<style>
  @page {
    size: A4 portrait;
    margin: 10mm 12mm 10mm 12mm;
  }
  @media print {
    html, body {
      width: 210mm;
      height: auto;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
  *, *:before, *:after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: 'Leelawadee UI', 'Sarabun', Tahoma, 'Segoe UI', sans-serif;
    font-size: 11.5px;
    line-height: 1.55;
    color: #1e293b;
    background: #ffffff;
  }
  
  .manual-page {
    box-sizing: border-box;
    width: 100%;
    min-height: 270mm;
    max-height: 276mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
  }
  .manual-page:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .page-header-main {
    background: linear-gradient(135deg, $themeColor 0%, $themeGradEnd 100%);
    color: #ffffff;
    padding: 13px 18px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }
  .page-header-main .title-box h1 {
    font-size: 16.5px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 2px;
    letter-spacing: -0.2px;
  }
  .page-header-main .title-box p {
    font-size: 11px;
    color: rgba(255,255,255,0.85);
  }
  .badge-role {
    display: inline-block;
    background: $badgeColor;
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 20px;
    text-transform: uppercase;
  }

  .page-header-sub {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4.5px solid $themeColor;
    border-radius: 8px;
    padding: 7px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 11px;
  }
  .page-header-sub .sub-title {
    font-size: 12px;
    font-weight: 800;
    color: $themeColor;
  }
  .page-header-sub .sub-tag {
    font-size: 10px;
    color: #64748b;
    font-weight: 600;
  }

  .page-body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    font-weight: 800;
    color: $themeColor;
    padding-bottom: 3.5px;
    border-bottom: 2px solid $themeColor;
    margin-top: 2px;
    margin-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
  }
  .section-title .num-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 21px;
    height: 21px;
    background: $themeColor;
    color: #ffffff;
    border-radius: 50%;
    font-size: 10.5px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 9px 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .card-highlight {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid $themeColor;
    border-radius: 8px;
    padding: 9px 12px;
  }
  .card-warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-left: 4px solid #f59e0b;
    border-radius: 8px;
    padding: 8px 11px;
  }
  .card-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-left: 4px solid #16a34a;
    border-radius: 8px;
    padding: 8px 11px;
  }
  .card-title {
    font-size: 11.5px;
    font-weight: 700;
    color: $themeColor;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 3px;
  }
  .step-box {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 10px;
    text-align: left;
  }
  .step-num {
    display: inline-block;
    background: $themeColor;
    color: #fff;
    font-weight: 800;
    font-size: 9.5px;
    padding: 1px 6px;
    border-radius: 10px;
    margin-bottom: 4px;
  }
  .step-box h4 {
    font-size: 11px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
  }
  .step-box p {
    font-size: 10px;
    color: #475569;
    line-height: 1.4;
  }

  ul, ol {
    padding-left: 18px;
    margin-top: 3px;
    margin-bottom: 3px;
  }
  li {
    margin-bottom: 3px;
    line-height: 1.45;
  }
  li strong {
    color: #0f172a;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 14px;
  }
  .badge-orange { background: #fff7ed; color: #c2410c; border: 1.5px solid #f97316; }
  .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1.5px solid #3b82f6; }
  .badge-green { background: #f0fdf4; color: #15803d; border: 1.5px solid #22c55e; }

  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
    margin-top: 3px;
  }
  .kpi-card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 7px 6px;
    text-align: center;
  }
  .kpi-val {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.1;
  }
  .kpi-lbl {
    font-size: 9.5px;
    color: #64748b;
    margin-top: 2px;
    font-weight: 600;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
    margin-top: 4px;
  }
  th {
    background: $themeColor;
    color: #ffffff;
    padding: 4.5px 7px;
    text-align: left;
    font-weight: 700;
  }
  td {
    padding: 4px 7px;
    border-bottom: 1px solid #e2e8f0;
  }
  tr:nth-child(even) td {
    background: #f8fafc;
  }

  .page-footer-bar {
    border-top: 1.5px solid #e2e8f0;
    padding-top: 5px;
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9px;
    color: #64748b;
  }
  .page-footer-bar b {
    color: $themeColor;
  }
</style>
"@
}

Write-Output "Style generator ready."
