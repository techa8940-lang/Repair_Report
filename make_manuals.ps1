# make_manuals.ps1 - สร้างไฟล์ HTML คู่มือการใช้งานทั้ง 3 ชุดอย่างประณีต

$baseDir = $PSScriptRoot
$logoPath = Join-Path $baseDir "nu_seed_logo.png"
$logoBase64 = ""
if (Test-Path $logoPath) {
    $bytes = [System.IO.File]::ReadAllBytes($logoPath)
    $logoBase64 = [System.Convert]::ToBase64String($bytes)
}
$logoSrc = if ($logoBase64) { "data:image/png;base64,$logoBase64" } else { "" }

New-Item -ItemType Directory -Force -Path (Join-Path $baseDir "manuals") | Out-Null

# -------------------------------------------------------------
# Common CSS Styles
# -------------------------------------------------------------
function Get-CommonCss($themeColor, $themeGradEnd, $badgeColor) {
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

  /* Page Top Header */
  .page-header-main {
    background: linear-gradient(135deg, $themeColor 0%, $themeGradEnd 100%);
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }
  .page-header-main .title-box h1 {
    font-size: 17px;
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
    font-size: 10.5px;
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
    padding: 8px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 13px;
  }
  .page-header-sub .sub-title {
    font-size: 12.5px;
    font-weight: 800;
    color: $themeColor;
  }
  .page-header-sub .sub-tag {
    font-size: 10px;
    color: #64748b;
    font-weight: 600;
  }

  /* Content Wrapper */
  .page-body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Section Title */
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: $themeColor;
    padding-bottom: 4px;
    border-bottom: 2px solid $themeColor;
    margin-top: 2px;
    margin-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
  }
  .section-title .num-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: $themeColor;
    color: #ffffff;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 800;
    flex-shrink: 0;
  }

  /* Cards */
  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 13px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .card-highlight {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid $themeColor;
    border-radius: 8px;
    padding: 10px 13px;
  }
  .card-warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-left: 4px solid #f59e0b;
    border-radius: 8px;
    padding: 9px 12px;
  }
  .card-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-left: 4px solid #16a34a;
    border-radius: 8px;
    padding: 9px 12px;
  }
  .card-title {
    font-size: 12px;
    font-weight: 700;
    color: $themeColor;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* Steps Grid & Lists */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
    margin-top: 4px;
  }
  .step-box {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 9px 11px;
    text-align: left;
  }
  .step-num {
    display: inline-block;
    background: $themeColor;
    color: #fff;
    font-weight: 800;
    font-size: 10px;
    padding: 1px 7px;
    border-radius: 12px;
    margin-bottom: 5px;
  }
  .step-box h4 {
    font-size: 11.5px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 3px;
  }
  .step-box p {
    font-size: 10.5px;
    color: #475569;
    line-height: 1.45;
  }

  /* Lists */
  ul, ol {
    padding-left: 19px;
    margin-top: 4px;
    margin-bottom: 4px;
  }
  li {
    margin-bottom: 3.5px;
    line-height: 1.5;
  }
  li strong {
    color: #0f172a;
  }

  /* Badges & Pills */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10.5px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 16px;
  }
  .badge-orange { background: #fff7ed; color: #c2410c; border: 1.5px solid #f97316; }
  .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1.5px solid #3b82f6; }
  .badge-green { background: #f0fdf4; color: #15803d; border: 1.5px solid #22c55e; }

  /* KPI Row */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 4px;
  }
  .kpi-card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
    text-align: center;
  }
  .kpi-val {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.1;
  }
  .kpi-lbl {
    font-size: 10px;
    color: #64748b;
    margin-top: 3px;
    font-weight: 600;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10.5px;
    margin-top: 5px;
  }
  th {
    background: $themeColor;
    color: #ffffff;
    padding: 5px 8px;
    text-align: left;
    font-weight: 700;
  }
  td {
    padding: 4.5px 8px;
    border-bottom: 1px solid #e2e8f0;
  }
  tr:nth-child(even) td {
    background: #f8fafc;
  }

  /* Page Footer Bar */
  .page-footer-bar {
    border-top: 1.5px solid #e2e8f0;
    padding-top: 6px;
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9.5px;
    color: #64748b;
  }
  .page-footer-bar b {
    color: $themeColor;
  }
</style>
"@
}

Write-Output "Helper script make_manuals.ps1 loaded."
