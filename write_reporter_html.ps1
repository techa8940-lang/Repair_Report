# write_reporter_html.ps1
# เขียน HTML ผู้แจ้งซ่อม ตรงๆ ด้วย .NET UTF8

$logoBase64 = ""
$logoPath = Join-Path $PSScriptRoot "nu_seed_logo.png"
if (Test-Path $logoPath) {
    $logoBytes = [System.IO.File]::ReadAllBytes($logoPath)
    $logoBase64 = [System.Convert]::ToBase64String($logoBytes)
}
$logoSrc = if ($logoBase64) { "data:image/png;base64,$logoBase64" } else { "" }
$logoImg = if ($logoSrc) { "<img src='$logoSrc' alt='NU SEED' style='height:48px;margin-right:14px;vertical-align:middle;'>" } else { "" }

New-Item -ItemType Directory -Force -Path (Join-Path $PSScriptRoot "manuals") | Out-Null

$html = [System.Text.StringBuilder]::new()
[void]$html.Append('<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>คู่มือผู้แจ้งซ่อม — ระบบแจ้งซ่อม AMC</title><style>
@page { margin: 13mm 14mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Leelawadee UI","Cordia New","Angsana New",Tahoma,sans-serif; font-size: 13px; line-height: 1.65; color: #1e293b; background: #fff; }
.header { background: linear-gradient(135deg,#0b2545 0%,#134074 100%); color:#fff; padding:20px 26px 16px 26px; display:flex; align-items:center; page-break-inside:avoid; break-inside:avoid; }
.header-title { font-size:19px; font-weight:800; margin-bottom:3px; }
.header-sub { font-size:11.5px; opacity:0.85; margin-bottom:5px; }
.header-badge { display:inline-block; background:#ea580c; color:#fff; font-size:11px; font-weight:700; padding:2px 10px; border-radius:20px; }
.container { max-width:820px; margin:0 auto; padding:22px 20px 10px; }
.section-block { margin-bottom:22px; page-break-inside:avoid; break-inside:avoid; }
.section-title { display:flex; align-items:center; gap:10px; font-size:14.5px; font-weight:800; color:#0b2545; margin-top:22px; margin-bottom:10px; padding-bottom:6px; border-bottom:2.5px solid #134074; page-break-after:avoid; break-after:avoid; }
.section-title .sn { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; background:#134074; color:#fff; border-radius:50%; font-size:12px; font-weight:800; flex-shrink:0; }
.card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:14px 16px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,0.06); page-break-inside:avoid; break-inside:avoid; }
.card-title { font-size:13px; font-weight:700; color:#134074; margin-bottom:8px; }
.step-card { background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #134074; border-radius:8px; padding:12px 15px; margin-bottom:14px; page-break-inside:avoid; break-inside:avoid; }
.step-label { font-weight:800; font-size:13px; color:#134074; margin-bottom:8px; }
ul,ol { padding-left:20px; margin-top:5px; margin-bottom:5px; }
li { line-height:1.75; margin-bottom:4px; }
.pill { display:inline-block; font-size:11px; font-weight:600; padding:1px 9px; border-radius:20px; vertical-align:middle; }
.pill-orange { background:#fff7ed; color:#c2410c; border:1px solid #fdba74; }
.pill-blue { background:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd; }
.pill-green { background:#f0fdf4; color:#15803d; border:1px solid #86efac; }
.kpi-row { display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
.kpi-card { flex:1 1 140px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; text-align:center; }
.kpi-num { font-size:22px; font-weight:800; color:#134074; }
.kpi-label { font-size:10.5px; color:#64748b; margin-top:2px; }
.note { background:#fffbeb; border:1px solid #fcd34d; border-radius:7px; padding:9px 12px; font-size:12px; color:#78350f; margin-top:8px; }
.status-row { display:flex; gap:10px; flex-wrap:wrap; margin:8px 0; }
.status-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 14px; border-radius:20px; font-size:12px; font-weight:700; }
.s-orange { background:#fff7ed; color:#c2410c; border:2px solid #f97316; }
.s-blue { background:#eff6ff; color:#1d4ed8; border:2px solid #3b82f6; }
.s-green { background:#f0fdf4; color:#15803d; border:2px solid #22c55e; }
table { width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; }
th { background:#134074; color:#fff; padding:7px 10px; text-align:left; font-weight:700; }
td { padding:6px 10px; border-bottom:1px solid #e2e8f0; }
tr:nth-child(even) td { background:#f8fafc; }
.footer { margin-top:30px; padding-top:12px; border-top:1px solid #e2e8f0; text-align:center; font-size:9.5px; color:#94a3b8; }
.page-break { page-break-after:always; height:0; }
</style></head><body>')

[void]$html.Append("<div class='header'>$logoImg<div><div class='header-title'>📋 คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับผู้แจ้งซ่อม</div><div class='header-sub'>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร &nbsp;|&nbsp; AMC Repair Management System</div><div class='header-badge'>Reporter Manual</div></div></div>")
[void]$html.Append("<div class='container'>")

# Section 1
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>1</span>การเข้าสู่ระบบและสมัครสมาชิก</div>")
[void]$html.Append("<div class='card'><div class='card-title'>🌐 เข้าถึงระบบ</div><p>เปิดเว็บเบราว์เซอร์ แล้วไปที่ <strong>https://nu-seed-repair-amc.vercel.app/</strong></p><p style='margin-top:6px;'>รองรับทุกเบราว์เซอร์ (Chrome, Edge, Firefox, Safari) ทั้งบนคอมพิวเตอร์และมือถือ</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📌 วิธีเข้าสู่ระบบ (มีบัญชีแล้ว)</div><ol><li>กรอก <strong>อีเมล</strong> และ <strong>รหัสผ่าน</strong> ในช่องที่กำหนด</li><li>กดปุ่ม <strong>เข้าสู่ระบบ</strong></li><li>ระบบพาเข้าสู่หน้า Dashboard อัตโนมัติ</li></ol></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📌 วิธีสมัครสมาชิกใหม่</div><ol><li>คลิก <strong>ลงทะเบียน / สมัครสมาชิก</strong> ในหน้าเข้าสู่ระบบ</li><li>กรอกข้อมูล: <strong>ชื่อ-นามสกุล, อีเมล, รหัสผ่าน</strong></li><li>กดปุ่ม <strong>สมัครสมาชิก</strong></li><li>ระบบสร้างบัญชีผู้แจ้งซ่อม (Reporter) ให้อัตโนมัติ</li><li>เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ตั้งไว้</li></ol></div>")
[void]$html.Append("<div class='note'>⚠️ หากลืมรหัสผ่าน สามารถแก้ไขได้ในเมนู <strong>ข้อมูลส่วนตัว</strong> หลังจากเข้าสู่ระบบแล้ว</div>")
[void]$html.Append("</div>")

# Section 2
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>2</span>หน้าหลัก (Dashboard ผู้แจ้งซ่อม)</div>")
[void]$html.Append("<div class='card'><div class='card-title'>📊 สรุปข้อมูลการแจ้งซ่อมของฉัน</div><p>หลังเข้าสู่ระบบ จะพบ <strong>การ์ดสรุปสถิติ 4 ใบ</strong> ที่แสดงข้อมูลของคุณ:</p></div>")
[void]$html.Append("<div class='kpi-row'><div class='kpi-card'><div class='kpi-num' style='color:#f97316;'>12</div><div class='kpi-label'>แจ้งซ่อมทั้งหมด</div></div><div class='kpi-card'><div class='kpi-num' style='color:#3b82f6;'>5</div><div class='kpi-label'>รับเรื่องแล้ว</div></div><div class='kpi-card'><div class='kpi-num' style='color:#8b5cf6;'>3</div><div class='kpi-label'>กำลังดำเนินการ</div></div><div class='kpi-card'><div class='kpi-num' style='color:#22c55e;'>4</div><div class='kpi-label'>เสร็จสิ้น</div></div></div>")
[void]$html.Append("<div class='card'><div class='card-title'>📋 ตารางคำร้องซ่อมล่าสุด</div><p>ด้านล่างการ์ดสถิติมีตารางแสดง <strong>รายการแจ้งซ่อมล่าสุด</strong> พร้อมข้อมูล:</p><ul><li>เลขที่คำร้อง (Ticket ID)</li><li>หัวข้อปัญหา / ประเภทงาน</li><li>วันที่แจ้ง</li><li>สถานะปัจจุบัน</li></ul></div>")
[void]$html.Append("</div>")

# Section 3
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>3</span>ขั้นตอนการแจ้งซ่อมใหม่ (3 ขั้นตอน)</div>")
[void]$html.Append("<div class='card'><div class='card-title'>🚀 เริ่มต้นแจ้งซ่อม</div><p>คลิกปุ่ม <strong>+ แจ้งซ่อมใหม่</strong> หรือเลือกเมนู <strong>แจ้งซ่อม</strong> ด้านบน ระบบจะเปิดฟอร์ม 3 ขั้นตอน</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>✏️ ขั้นตอนที่ 1 — กรอกข้อมูลการแจ้งซ่อม</div>")
[void]$html.Append("<p><strong>ประเภทงาน</strong> (เลือก 1 ประเภท)</p><ul><li>🔨 <strong>ซ่อมแซม</strong> — เช่น ระบบไฟฟ้า, ประปา, เครื่องปรับอากาศ, ประตู/หน้าต่าง, ลิฟต์, เครื่องกำเนิดไฟ, งานโยธา, ระบบ IT, เครื่องจักร, วัสดุ, งานทั่วไป</li><li>🔧 <strong>ติดตั้ง</strong> — เช่น ระบบไฟฟ้า, ประปา, เครื่องปรับอากาศ, ประตู/หน้าต่าง, ระบบ IT, เครื่องจักร, งานทั่วไป</li></ul>")
[void]$html.Append("<p style='margin-top:8px;'><strong>ระดับความเร่งด่วน</strong> (เลือก 1 ระดับ)</p><ul><li>🟢 <strong>ปกติ</strong> — งานซ่อมทั่วไป ไม่เร่งด่วน</li><li>🟡 <strong>เร่งด่วน</strong> — ส่งผลกระทบต่อการทำงาน</li><li>🔴 <strong>ฉุกเฉิน</strong> — ต้องแก้ไขทันที</li></ul>")
[void]$html.Append("<p style='margin-top:8px;'><strong>ข้อมูลสถานที่และรายละเอียด</strong></p><ul><li>อาคาร / ห้อง / ชั้น</li><li>รายละเอียดปัญหา (อธิบายให้ชัดเจน)</li><li>แนบรูปภาพประกอบ ได้สูงสุด <strong>4 รูป</strong> (JPG/PNG ไม่เกิน 5MB/รูป)</li></ul>")
[void]$html.Append("</div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>🔍 ขั้นตอนที่ 2 — ตรวจสอบข้อมูล</div><p>ระบบแสดงสรุปข้อมูลที่กรอกทั้งหมด ตรวจสอบความถูกต้อง จากนั้น:</p><ul><li>กด <strong>ส่งคำร้อง</strong> เพื่อยืนยัน</li><li>หรือกด <strong>แก้ไข</strong> เพื่อกลับไปแก้ข้อมูล</li></ul></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>✅ ขั้นตอนที่ 3 — ส่งสำเร็จ</div><p>ระบบแสดงผลสำเร็จพร้อม:</p><ul><li><strong>หมายเลขคำร้อง</strong> (Ticket ID) สำหรับติดตาม</li><li>สรุปรายละเอียดที่ส่งไป</li><li>ปุ่ม <strong>ติดตามสถานะ</strong> หรือ <strong>แจ้งซ่อมใหม่</strong></li></ul></div>")
[void]$html.Append("</div>")

# Section 4
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>4</span>การติดตามสถานะคำร้องซ่อม</div>")
[void]$html.Append("<div class='card'><div class='card-title'>🔎 ดูสถานะคำร้อง</div><p>เลือกเมนู <strong>ติดตามสถานะ</strong> ด้านบน จะเห็นรายการคำร้องซ่อมทั้งหมดของคุณ พร้อมสถานะปัจจุบัน</p></div>")
[void]$html.Append("<div class='status-row'><div class='status-pill s-orange'>🟠 รับเรื่องแล้ว</div><div class='status-pill s-blue'>🔵 กำลังดำเนินการ</div><div class='status-pill s-green'>🟢 เสร็จสิ้น</div></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📄 รายละเอียดคำร้อง</div><p>คลิกที่รายการใดก็ได้ เพื่อดูรายละเอียดเพิ่มเติม:</p><ul><li>ข้อมูลการแจ้งซ่อมทั้งหมด</li><li>สถานะและวันที่อัปเดตล่าสุด</li><li>ชื่อช่างที่รับผิดชอบ (เมื่อได้รับมอบหมาย)</li><li>หมายเหตุหรือผลการซ่อม (เมื่อเสร็จสิ้น)</li></ul></div>")
[void]$html.Append("</div>")

# Section 5
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>5</span>ข้อมูลส่วนตัวและการตั้งค่า</div>")
[void]$html.Append("<div class='card'><div class='card-title'>👤 จัดการบัญชีของฉัน</div><p>คลิกชื่อผู้ใช้มุมบนขวา หรือเลือกเมนู <strong>ข้อมูลส่วนตัว</strong></p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>⚙️ สิ่งที่สามารถแก้ไขได้</div><ul><li><strong>ชื่อ-นามสกุล</strong> — แก้ไขชื่อที่แสดงในระบบ</li><li><strong>เบอร์โทรศัพท์</strong> — เพิ่ม/แก้ไขเบอร์ติดต่อ</li><li><strong>รหัสผ่าน</strong> — เปลี่ยนรหัสผ่านได้ทุกเมื่อ</li></ul><p style='margin-top:8px;'>กด <strong>บันทึก</strong> เพื่อยืนยันการเปลี่ยนแปลง</p></div>")
[void]$html.Append("</div>")

# Footer
[void]$html.Append("<div class='footer'><div>ระบบแจ้งซ่อม AMC — NU SEED | มหาวิทยาลัยนเรศวร</div><div>พัฒนาโดย: อมรเชษฐ์ รัตนากร (68365934) นิสิตวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร</div></div>")
[void]$html.Append("</div></body></html>")

$outPath = Join-Path $PSScriptRoot "manuals\manual_reporter.html"
[System.IO.File]::WriteAllText($outPath, $html.ToString(), [System.Text.Encoding]::UTF8)
Write-Output "Generated: manuals\manual_reporter.html"
