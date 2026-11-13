# generate_manual_reporter.ps1
# สร้างคู่มือผู้แจ้งซ่อม (HTML)

$logoBase64 = ""
$logoPath = Join-Path $PSScriptRoot "nu_seed_logo.png"
if (Test-Path $logoPath) {
    $logoBytes = [System.IO.File]::ReadAllBytes($logoPath)
    $logoBase64 = [System.Convert]::ToBase64String($logoBytes)
}
$logoSrc = if ($logoBase64) { "data:image/png;base64,$logoBase64" } else { "" }
$logoImg = if ($logoSrc) { "<img src='$logoSrc' alt='NU SEED Logo' style='height:52px;margin-right:16px;vertical-align:middle;'>" } else { "" }

New-Item -ItemType Directory -Force -Path (Join-Path $PSScriptRoot "manuals") | Out-Null

$html = @"
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>คู่มือผู้แจ้งซ่อม — ระบบแจ้งซ่อม AMC (NU SEED)</title>
<style>
  @page { margin: 13mm 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Leelawadee UI','Cordia New','Angsana New','Tahoma',sans-serif; font-size: 13px; line-height: 1.65; color: #1e293b; background: #f8fafc; }
  .header { background: linear-gradient(135deg,#0b2545 0%,#134074 100%); color:#fff; padding:22px 28px 18px 28px; display:flex; align-items:center; page-break-inside:avoid; break-inside:avoid; }
  .header-logo { display:flex; align-items:center; margin-right:18px; }
  .header-title { font-size:20px; font-weight:700; letter-spacing:0.3px; margin-bottom:2px; }
  .header-sub { font-size:12px; opacity:0.82; margin-bottom:6px; }
  .header-badge { display:inline-block; background:#ea580c; color:#fff; font-size:11px; font-weight:600; padding:2px 10px; border-radius:20px; }
  .container { max-width:820px; margin:0 auto; padding:24px 20px 10px 20px; }
  .section-block { margin-bottom:20px; page-break-inside:avoid; break-inside:avoid; }
  .section-title { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:700; color:#0b2545; margin-top:20px; margin-bottom:10px; padding-bottom:6px; border-bottom:2.5px solid #134074; page-break-after:avoid; break-after:avoid; }
  .section-title .sec-num { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; background:#134074; color:#fff; border-radius:50%; font-size:13px; font-weight:700; flex-shrink:0; }
  .card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:14px 16px; margin-bottom:16px; box-shadow:0 1px 4px rgba(0,0,0,0.06); page-break-inside:avoid; break-inside:avoid; }
  .card-title { font-size:13px; font-weight:700; color:#134074; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .step-card { background:#fff; border:1px solid #e2e8f0; border-left:4px solid #134074; border-radius:8px; padding:14px 16px; margin-bottom:16px; box-shadow:0 1px 4px rgba(0,0,0,0.05); page-break-inside:avoid; break-inside:avoid; }
  .step-label { display:inline-flex; align-items:center; gap:7px; font-weight:700; font-size:13px; color:#134074; margin-bottom:9px; }
  .step-badge { background:#134074; color:#fff; font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; }
  ul, ol { padding-left:20px; margin-top:4px; margin-bottom:4px; }
  li { line-height:1.7; margin-bottom:4px; }
  li:last-child { margin-bottom:0; }
  .pill { display:inline-block; font-size:11px; font-weight:600; padding:1px 9px; border-radius:20px; vertical-align:middle; }
  .pill-orange { background:#fff7ed; color:#c2410c; border:1px solid #fdba74; }
  .pill-blue { background:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd; }
  .pill-green { background:#f0fdf4; color:#15803d; border:1px solid #86efac; }
  .pill-gray { background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; }
  .kpi-row { display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
  .kpi-card { flex:1 1 140px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
  .kpi-num { font-size:22px; font-weight:700; color:#134074; }
  .kpi-label { font-size:11px; color:#64748b; margin-top:2px; }
  table { width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; }
  th { background:#134074; color:#fff; padding:7px 10px; text-align:left; font-weight:600; }
  td { padding:6px 10px; border-bottom:1px solid #e2e8f0; vertical-align:top; }
  tr:nth-child(even) td { background:#f8fafc; }
  .browser-box { background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; margin-top:10px; page-break-inside:avoid; break-inside:avoid; }
  .browser-bar { background:#e2e8f0; padding:5px 10px; display:flex; align-items:center; gap:5px; font-size:11px; color:#64748b; }
  .browser-dot { width:9px; height:9px; border-radius:50%; display:inline-block; }
  .browser-body { padding:12px 14px; background:#fff; font-size:12px; }
  .note { background:#eff6ff; border-left:3px solid #3b82f6; border-radius:0 6px 6px 0; padding:7px 12px; font-size:12px; color:#1e3a5f; margin-top:8px; }
  .tip { background:#f0fdf4; border-left:3px solid #22c55e; border-radius:0 6px 6px 0; padding:7px 12px; font-size:12px; color:#14532d; margin-top:8px; }
  .req { color:#dc2626; font-weight:700; }
  .divider { border:none; border-top:1px dashed #cbd5e1; margin:12px 0; }
  .footer { background:#0b2545; color:#94a3b8; text-align:center; padding:14px 20px; font-size:9.5px; margin-top:28px; line-height:1.7; }
  .footer a { color:#7dd3fc; text-decoration:none; }
  @media print {
    body { background:#fff; font-size:12px; }
    .container { max-width:100%; padding:0 4px; }
    .header { padding:14px 18px 12px 18px; }
    .card, .step-card { box-shadow:none; }
    .footer { background:#0b2545 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .section-title { page-break-after:avoid; break-after:avoid; }
    .section-block { page-break-inside:avoid; break-inside:avoid; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-logo">$($logoImg)</div>
  <div class="header-text">
    <div class="header-title">📋 คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับผู้แจ้งซ่อม</div>
    <div class="header-sub">อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร &nbsp;|&nbsp; AMC Repair Management System</div>
    <span class="header-badge">USER MANUAL</span>
  </div>
</div>

<div class="container">

  <div class="section-block">
    <div class="section-title"><span class="sec-num">1</span>เข้าสู่ระบบและสมัครสมาชิก</div>

    <div class="card">
      <div class="card-title">🌐 เปิดเบราว์เซอร์และไปที่ URL</div>
      <div class="browser-box">
        <div class="browser-bar">
          <span class="browser-dot" style="background:#ef4444;"></span>
          <span class="browser-dot" style="background:#f59e0b;"></span>
          <span class="browser-dot" style="background:#22c55e;"></span>
          &nbsp;<span style="background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:2px 10px;font-size:11px;color:#334155;flex:1;">🔒 https://nu-seed-repair-amc.vercel.app/</span>
        </div>
        <div class="browser-body">
          <div style="font-weight:700;color:#0b2545;font-size:13px;margin-bottom:6px;">ระบบแจ้งซ่อม — NU SEED AMC</div>
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <div style="flex:1;"><div style="font-size:11px;color:#64748b;margin-bottom:2px;">อีเมล</div><div style="border:1px solid #cbd5e1;border-radius:5px;padding:4px 8px;font-size:11px;color:#94a3b8;">email@example.com</div></div>
            <div style="flex:1;"><div style="font-size:11px;color:#64748b;margin-bottom:2px;">รหัสผ่าน</div><div style="border:1px solid #cbd5e1;border-radius:5px;padding:4px 8px;font-size:11px;color:#94a3b8;">••••••••</div></div>
          </div>
          <div style="display:flex;gap:8px;">
            <div style="background:#134074;color:#fff;border-radius:5px;padding:5px 14px;font-size:11px;font-weight:600;">เข้าสู่ระบบ</div>
            <div style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:5px;padding:5px 14px;font-size:11px;">ลงทะเบียนบัญชีใหม่</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔑 กรณีมีบัญชีแล้ว</div>
      <ol>
        <li>กรอก <strong>Email</strong> และ <strong>Password</strong> ในช่องที่กำหนด</li>
        <li>กดปุ่ม <strong>"เข้าสู่ระบบ"</strong> เพื่อเข้าใช้งาน</li>
      </ol>
    </div>

    <div class="card">
      <div class="card-title">🆕 กรณีสมัครสมาชิกใหม่</div>
      <ol>
        <li>กดปุ่ม <strong>"ลงทะเบียนบัญชีใหม่"</strong></li>
        <li>กรอกข้อมูลให้ครบถ้วน:
          <ul>
            <li><strong>ชื่อ-นามสกุล</strong></li>
            <li><strong>อีเมล</strong></li>
            <li><strong>รหัสผ่าน</strong> (อย่างน้อย 6 ตัวอักษร)</li>
            <li><strong>เบอร์โทรศัพท์มือถือ</strong></li>
            <li><strong>หน่วยงาน</strong></li>
          </ul>
        </li>
        <li>กดปุ่ม <strong>"สร้างบัญชีผู้ใช้งาน"</strong> เพื่อดำเนินการ</li>
      </ol>
      <div class="note">📌 ข้อมูลเบอร์โทรและหน่วยงานที่ลงทะเบียนจะถูกดึงมาใช้ในฟอร์มแจ้งซ่อมโดยอัตโนมัติ</div>
    </div>
  </div>

  <div class="section-block">
    <div class="section-title"><span class="sec-num">2</span>หน้าหลัก (Dashboard)</div>

    <div class="card">
      <div class="card-title">📊 การ์ด KPI สรุปสถานะการแจ้งซ่อม</div>
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-num" style="color:#134074;">—</div><div class="kpi-label">แจ้งซ่อมทั้งหมด</div></div>
        <div class="kpi-card"><div class="kpi-num" style="color:#ea580c;">—</div><div class="kpi-label">รอดำเนินการ</div></div>
        <div class="kpi-card"><div class="kpi-num" style="color:#2563eb;">—</div><div class="kpi-label">กำลังดำเนินการ</div></div>
        <div class="kpi-card"><div class="kpi-num" style="color:#16a34a;">—</div><div class="kpi-label">ซ่อมเสร็จแล้ว</div></div>
      </div>
      <p>กดที่การ์ดแต่ละใบเพื่อ <strong>กรองรายการแจ้งซ่อม</strong> ตามสถานะนั้น ๆ</p>
    </div>

    <div class="card">
      <div class="card-title">📋 ตารางรายการแจ้งซ่อมล่าสุด</div>
      <p style="margin-bottom:8px;">ตารางแสดง <strong>5 รายการล่าสุด</strong> ที่คุณแจ้งซ่อม ประกอบด้วย:</p>
      <table>
        <thead><tr><th>เลขที่ใบงาน</th><th>หัวข้อปัญหา</th><th>ประเภท</th><th>สถานะ</th><th>วันที่แจ้ง</th></tr></thead>
        <tbody>
          <tr><td>REP-2026-XXXX</td><td>ตัวอย่างปัญหา</td><td>ระบบปรับอากาศ</td><td><span class="pill pill-orange">รับเรื่องแล้ว</span></td><td>01/01/2026</td></tr>
          <tr><td>REP-2026-XXXX</td><td>ตัวอย่างปัญหา</td><td>ระบบไฟฟ้า</td><td><span class="pill pill-blue">กำลังดำเนินการ</span></td><td>01/01/2026</td></tr>
          <tr><td>REP-2026-XXXX</td><td>ตัวอย่างปัญหา</td><td>ระบบประปา</td><td><span class="pill pill-green">เสร็จสิ้น</span></td><td>01/01/2026</td></tr>
        </tbody>
      </table>
      <div class="tip">💡 กดปุ่ม <strong>"ดูประวัติทั้งหมด →"</strong> เพื่อดูรายการแจ้งซ่อมทั้งหมด หรือกด <strong>"แจ้งซ่อมด่วนทันที"</strong> เพื่อเปิดฟอร์มแจ้งซ่อมใหม่</div>
    </div>
  </div>

  <div class="section-block">
    <div class="section-title"><span class="sec-num">3</span>ขั้นตอนการแจ้งซ่อม (3 Steps)</div>

    <div class="step-card">
      <div class="step-label"><span class="step-badge">Step 1</span>กรอกข้อมูลปัญหา</div>
      <p style="font-weight:600;margin-bottom:6px;color:#334155;">📌 เลือกหมวดงานหลัก</p>
      <ul>
        <li>🔧 <strong>งานซ่อมแซม</strong> — สำหรับอุปกรณ์/ระบบที่ชำรุด ต้องการซ่อม</li>
        <li>🛠️ <strong>งานติดตั้ง/ต่อเติม</strong> — สำหรับการขอติดตั้งอุปกรณ์ใหม่ หรือต่อเติมอาคาร</li>
      </ul>
      <hr class="divider">
      <p style="font-weight:600;margin-bottom:6px;color:#334155;">🔧 ประเภทย่อย — งานซ่อมแซม (13 ประเภท)</p>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px;">
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ระบบปรับอากาศ</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">เครื่องจักร</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ระบบไฟฟ้ากำลัง</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ระบบแสงสว่าง</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ระบบประปา</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ระบบ Internet</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ระบบน้ำบริสุทธิ์ (DI)</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ฝ้าเพดาน</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ประตู</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">หน้าต่าง</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">ห้องน้ำ</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">พื้น</span>
        <span style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:2px 8px;font-size:11px;">อื่นๆ</span>
      </div>
      <hr class="divider">
      <p style="font-weight:600;margin-bottom:6px;color:#334155;">🛠️ ประเภทย่อย — งานติดตั้ง/ต่อเติม (7 ประเภท)</p>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px;">
        <span style="background:#fef3c7;border:1px solid #fcd34d;border-radius:5px;padding:2px 8px;font-size:11px;">ติดตั้งเครื่องจักร</span>
        <span style="background:#fef3c7;border:1px solid #fcd34d;border-radius:5px;padding:2px 8px;font-size:11px;">ติดตั้งระบบไฟฟ้ากำลัง</span>
        <span style="background:#fef3c7;border:1px solid #fcd34d;border-radius:5px;padding:2px 8px;font-size:11px;">ติดตั้งระบบแสงสว่าง</span>
        <span style="background:#fef3c7;border:1px solid #fcd34d;border-radius:5px;padding:2px 8px;font-size:11px;">ติดตั้งระบบประปา</span>
        <span style="background:#fef3c7;border:1px solid #fcd34d;border-radius:5px;padding:2px 8px;font-size:11px;">ติดตั้งระบบ Internet</span>
        <span style="background:#fef3c7;border:1px solid #fcd34d;border-radius:5px;padding:2px 8px;font-size:11px;">ต่อเติมอาคาร</span>
        <span style="background:#fef3c7;border:1px solid #fcd34d;border-radius:5px;padding:2px 8px;font-size:11px;">อื่นๆ</span>
      </div>
      <hr class="divider">
      <p style="font-weight:600;margin-bottom:6px;color:#334155;">📝 ข้อมูลที่ต้องกรอก</p>
      <table>
        <thead><tr><th style="width:30%;">ช่องข้อมูล</th><th>รายละเอียด</th></tr></thead>
        <tbody>
          <tr><td>หน่วยงาน</td><td>ชื่อหน่วยงาน/แผนกของผู้แจ้ง</td></tr>
          <tr><td>เบอร์มือถือ <span class="req">*</span></td><td>เบอร์ติดต่อผู้แจ้งซ่อม (บังคับกรอก)</td></tr>
          <tr><td>เบอร์ภายใน</td><td>เบอร์โทรภายในอาคาร (ถ้ามี)</td></tr>
          <tr><td>อาคาร <span class="req">*</span></td><td>เลือกอาคาร A / B / C / อื่นๆ (บังคับกรอก)</td></tr>
          <tr><td>ชั้น <span class="req">*</span></td><td>ระบุชั้นที่ 1–4 (บังคับกรอก)</td></tr>
          <tr><td>เลขห้อง</td><td>หมายเลขห้อง (ถ้ามี)</td></tr>
          <tr><td>บริเวณ</td><td>บริเวณเพิ่มเติมเพื่อให้ช่างหาสถานที่ได้ง่าย</td></tr>
          <tr><td>รายการซ่อม <span class="req">*</span></td><td>ชื่ออุปกรณ์/รายการที่ต้องการซ่อม (บังคับกรอก)</td></tr>
          <tr><td>เลขครุภัณฑ์</td><td>หมายเลขครุภัณฑ์ (ถ้ามีสติกเกอร์ติดอยู่)</td></tr>
          <tr><td>อาการ <span class="req">*</span></td><td>อธิบายอาการที่พบ เช่น ไม่เปิด, มีเสียงดัง (บังคับกรอก)</td></tr>
          <tr><td>หมายเหตุ</td><td>ข้อมูลเพิ่มเติมสำหรับช่าง</td></tr>
        </tbody>
      </table>
      <hr class="divider">
      <p style="font-weight:600;margin-bottom:6px;color:#334155;">⚡ ระดับความเร่งด่วน</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:5px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:5px 10px;font-size:12px;">⚪ <strong>ปกติ</strong> — ซ่อมตามคิวปกติ</div>
        <div style="display:flex;align-items:center;gap:5px;background:#fef9c3;border:1px solid #fde68a;border-radius:6px;padding:5px 10px;font-size:12px;">🟡 <strong>เร่งด่วน</strong> — ส่งผลกระทบต่อการทำงาน</div>
        <div style="display:flex;align-items:center;gap:5px;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:5px 10px;font-size:12px;">🔴 <strong>ฉุกเฉิน</strong> — ต้องแก้ไขทันที เสี่ยงอันตราย</div>
      </div>
      <hr class="divider">
      <p style="font-weight:600;margin-bottom:4px;color:#334155;">📎 การแนบรูปภาพ</p>
      <ul>
        <li>แนบรูปภาพได้สูงสุด <strong>4 รูป</strong> (ไฟล์ JPG / PNG ขนาดไม่เกิน 5 MB ต่อรูป)</li>
        <li>วิธีแนบ: <strong>ลากวางไฟล์</strong> ลงในกรอบ หรือ <strong>คลิกเลือกไฟล์</strong></li>
        <li>รูปภาพช่วยให้ช่างเข้าใจปัญหาได้ชัดเจนยิ่งขึ้น</li>
      </ul>
    </div>

    <div class="step-card" style="border-left-color:#ea580c;">
      <div class="step-label"><span class="step-badge" style="background:#ea580c;">Step 2</span>ตรวจสอบข้อมูล</div>
      <p style="margin-bottom:8px;">ระบบจะแสดงสรุปข้อมูลทั้งหมดก่อนยืนยัน โปรดตรวจสอบความถูกต้องของ:</p>
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;">
        <span class="pill pill-gray">หมวดงาน</span>
        <span class="pill pill-gray">ประเภท</span>
        <span class="pill pill-gray">รายการซ่อม</span>
        <span class="pill pill-gray">อาการ</span>
        <span class="pill pill-gray">หมายเหตุ</span>
        <span class="pill pill-gray">เลขครุภัณฑ์</span>
        <span class="pill pill-gray">สถานที่</span>
        <span class="pill pill-gray">ผู้แจ้ง</span>
        <span class="pill pill-gray">ความเร่งด่วน</span>
        <span class="pill pill-gray">รูปภาพที่แนบ</span>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:5px 14px;font-size:12px;font-weight:600;color:#334155;">← ย้อนกลับไปแก้ไข</div>
        <div style="background:#134074;color:#fff;border-radius:6px;padding:5px 14px;font-size:12px;font-weight:600;">ยืนยันการแจ้งซ่อม ✓</div>
      </div>
    </div>

    <div class="step-card" style="border-left-color:#16a34a;">
      <div class="step-label"><span class="step-badge" style="background:#16a34a;">Step 3</span>ส่งสำเร็จ</div>
      <div class="browser-box" style="margin-bottom:10px;">
        <div class="browser-bar">
          <span class="browser-dot" style="background:#ef4444;"></span>
          <span class="browser-dot" style="background:#f59e0b;"></span>
          <span class="browser-dot" style="background:#22c55e;"></span>
          &nbsp;ตัวอย่างหน้าส่งสำเร็จ
        </div>
        <div class="browser-body" style="text-align:center;padding:16px;">
          <div style="font-size:28px;margin-bottom:6px;">✅</div>
          <div style="font-weight:700;color:#15803d;font-size:14px;margin-bottom:4px;">แจ้งซ่อมสำเร็จ!</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:8px;">เลขที่ใบแจ้งซ่อม</div>
          <div style="font-size:18px;font-weight:700;color:#134074;background:#eff6ff;border:1px dashed #3b82f6;border-radius:8px;padding:6px 18px;display:inline-block;margin-bottom:10px;">REP-2026-4132</div>
          <div style="display:flex;gap:7px;justify-content:center;flex-wrap:wrap;">
            <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:5px;padding:4px 11px;font-size:11px;">📋 คัดลอกเลขที่</div>
            <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:5px;padding:4px 11px;font-size:11px;">📜 ดูประวัติ</div>
            <div style="background:#134074;color:#fff;border-radius:5px;padding:4px 11px;font-size:11px;">🏠 กลับหน้าหลัก</div>
          </div>
        </div>
      </div>
      <ul>
        <li>ระบบสร้าง <strong>เลขที่ใบแจ้งซ่อม</strong> ให้อัตโนมัติ เช่น <code>REP-2026-4132</code></li>
        <li>กด <strong>"📋 คัดลอกเลขที่"</strong> เพื่อบันทึกเลขที่ไว้ติดตาม</li>
        <li>กด <strong>"📜 ดูประวัติ"</strong> เพื่อดูรายการแจ้งซ่อมทั้งหมด</li>
        <li>กด <strong>"🏠 กลับหน้าหลัก"</strong> เพื่อกลับสู่ Dashboard</li>
      </ul>
      <div class="tip">🔔 ระบบจะส่งการแจ้งเตือนผ่าน <strong>LINE</strong> ไปยังช่างทันทีหลังจากส่งฟอร์ม</div>
    </div>
  </div>

  <div class="section-block">
    <div class="section-title"><span class="sec-num">4</span>ติดตามสถานะการซ่อม</div>
    <div class="card">
      <div class="card-title">📂 เปิดเมนู "ประวัติการแจ้งซ่อม"</div>
      <p style="margin-bottom:10px;">คลิกที่เมนู <strong>"ประวัติการแจ้งซ่อม"</strong> ในแถบนำทาง เพื่อดูรายการแจ้งซ่อมทั้งหมดของคุณ</p>
      <p style="font-weight:600;margin-bottom:6px;color:#334155;">🔍 แถบกรองสถานะ</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:5px;background:#fff7ed;border:1px solid #fdba74;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;color:#c2410c;">🟠 รับเรื่องแล้ว</div>
        <div style="display:flex;align-items:center;gap:5px;background:#eff6ff;border:1px solid #93c5fd;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;color:#1d4ed8;">🔵 กำลังดำเนินการ</div>
        <div style="display:flex;align-items:center;gap:5px;background:#f0fdf4;border:1px solid #86efac;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;color:#15803d;">🟢 เสร็จสิ้น</div>
      </div>
      <table>
        <thead><tr><th style="width:22%;">สถานะ</th><th>ความหมาย</th></tr></thead>
        <tbody>
          <tr><td><span class="pill pill-orange">🟠 รับเรื่องแล้ว</span></td><td>ระบบรับเรื่องแล้ว รอมอบหมายให้ช่างดำเนินการ ช่างได้รับการแจ้งเตือนทาง LINE แล้ว</td></tr>
          <tr><td><span class="pill pill-blue">🔵 กำลังดำเนินการ</span></td><td>ช่างรับงานและกำลังดำเนินการซ่อมแซมอยู่</td></tr>
          <tr><td><span class="pill pill-green">🟢 เสร็จสิ้น</span></td><td>ช่างดำเนินการซ่อมแซมเสร็จเรียบร้อยแล้ว งานปิดแล้ว</td></tr>
        </tbody>
      </table>
      <div class="note">📌 กดที่แถบสถานะเพื่อกรองรายการตามสถานะที่ต้องการ</div>
    </div>
  </div>

  <div class="section-block">
    <div class="section-title"><span class="sec-num">5</span>ข้อมูลส่วนตัวและการเปลี่ยนรหัสผ่าน</div>
    <div class="card">
      <div class="card-title">👤 แก้ไขข้อมูลส่วนตัว</div>
      <p style="margin-bottom:8px;">คลิกที่เมนู <strong>"โปรไฟล์"</strong> หรือ <strong>"ข้อมูลส่วนตัว"</strong> เพื่อแก้ไขข้อมูลต่อไปนี้:</p>
      <ul>
        <li><strong>ชื่อ-นามสกุล</strong></li>
        <li><strong>เบอร์มือถือ</strong></li>
        <li><strong>เบอร์ภายใน</strong></li>
        <li><strong>หน่วยงาน</strong></li>
      </ul>
      <div class="tip">💡 ข้อมูลเบอร์โทรในโปรไฟล์จะ<strong>ดึงมาใส่ฟอร์มแจ้งซ่อมโดยอัตโนมัติ</strong> ทำให้ไม่ต้องกรอกซ้ำทุกครั้ง</div>
    </div>
    <div class="card">
      <div class="card-title">🔐 การเปลี่ยนรหัสผ่าน</div>
      <ol>
        <li>กรอก <strong>รหัสผ่านเก่า</strong> ในช่องที่กำหนด</li>
        <li>กรอก <strong>รหัสผ่านใหม่</strong> (อย่างน้อย 6 ตัวอักษร)</li>
        <li>กรอก <strong>ยืนยันรหัสผ่านใหม่</strong> อีกครั้ง</li>
        <li>กดปุ่ม <strong>"บันทึก"</strong> เพื่อยืนยันการเปลี่ยนรหัสผ่าน</li>
      </ol>
      <div class="note">🔒 รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร แนะนำให้ผสมตัวอักษรและตัวเลข</div>
    </div>
  </div>

</div>

<div class="footer">
  <div>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED) &nbsp;|&nbsp; <a href="https://nu-seed-repair-amc.vercel.app/">nu-seed-repair-amc.vercel.app</a> &nbsp;|&nbsp; โทร 055-968600</div>
  <div style="margin-top:3px;">พัฒนาโดย: อมรเชษฐ์ รัตนากร (68365934) นิสิตวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร</div>
</div>

</body>
</html>
"@

$html | Set-Content -Path "manuals\manual_reporter.html" -Encoding UTF8
Write-Output "Generated: manuals\manual_reporter.html"