# write_admin_html.ps1
# เขียน HTML ผู้ดูแลระบบ ตรงๆ ด้วย .NET UTF8

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
[void]$html.Append('<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>คู่มือผู้ดูแลระบบ — ระบบแจ้งซ่อม AMC</title><style>
@page { margin: 11mm 13mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Leelawadee UI","Cordia New","Angsana New",Tahoma,sans-serif; font-size: 12px; line-height: 1.65; color: #1e293b; background: #fff; }
.header { background: linear-gradient(135deg,#0b2545 0%,#1e1b4b 100%); color:#fff; padding:20px 26px 16px 26px; display:flex; align-items:center; page-break-inside:avoid; break-inside:avoid; }
.header-title { font-size:18px; font-weight:800; margin-bottom:3px; }
.header-sub { font-size:11px; opacity:0.85; margin-bottom:5px; }
.header-badge { display:inline-block; background:#f59e0b; color:#1e293b; font-size:11px; font-weight:700; padding:2px 10px; border-radius:20px; }
.container { max-width:820px; margin:0 auto; padding:18px 20px 10px; }
.section-block { margin-bottom:20px; page-break-inside:avoid; break-inside:avoid; }
.section-title { display:flex; align-items:center; gap:9px; font-size:13.5px; font-weight:800; color:#0b2545; margin-top:20px; margin-bottom:10px; padding-bottom:5px; border-bottom:2.5px solid #d97706; page-break-after:avoid; break-after:avoid; }
.section-title .sn { display:inline-flex; align-items:center; justify-content:center; width:25px; height:25px; background:#d97706; color:#fff; border-radius:50%; font-size:12px; font-weight:800; flex-shrink:0; }
.card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px 15px; margin-bottom:12px; box-shadow:0 1px 4px rgba(0,0,0,0.06); page-break-inside:avoid; break-inside:avoid; }
.card-title { font-size:12px; font-weight:700; color:#92400e; margin-bottom:7px; }
.step-card { background:#fffbeb; border:1px solid #fde68a; border-left:4px solid #f59e0b; border-radius:8px; padding:11px 14px; margin-bottom:12px; page-break-inside:avoid; break-inside:avoid; }
.step-label { font-weight:800; font-size:12px; color:#92400e; margin-bottom:7px; }
ul,ol { padding-left:20px; margin-top:5px; margin-bottom:5px; }
li { line-height:1.75; margin-bottom:4px; }
.note { background:#fef2f2; border:1px solid #fca5a5; border-radius:7px; padding:9px 12px; font-size:11.5px; color:#991b1b; margin-top:8px; }
.info { background:#eff6ff; border:1px solid #93c5fd; border-radius:7px; padding:9px 12px; font-size:11.5px; color:#1e3a8a; margin-top:8px; }
.kpi-row { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.kpi-card { flex:1 1 120px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:9px 10px; text-align:center; }
.kpi-num { font-size:20px; font-weight:800; color:#d97706; }
.kpi-label { font-size:10px; color:#64748b; margin-top:2px; }
table { width:100%; border-collapse:collapse; font-size:11.5px; margin-top:8px; }
th { background:#0b2545; color:#fff; padding:7px 9px; text-align:left; font-weight:700; }
td { padding:6px 9px; border-bottom:1px solid #e2e8f0; }
tr:nth-child(even) td { background:#f8fafc; }
.role-yes { color:#15803d; font-weight:700; text-align:center; }
.role-no { color:#9ca3af; text-align:center; }
.footer { margin-top:28px; padding-top:10px; border-top:1px solid #e2e8f0; text-align:center; font-size:9.5px; color:#94a3b8; }
.page-break { page-break-after:always; height:0; }
</style></head><body>')

[void]$html.Append("<div class='header'>$logoImg<div><div class='header-title'>🛡️ คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับผู้ดูแลระบบ</div><div class='header-sub'>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร &nbsp;|&nbsp; AMC Repair Management System</div><div class='header-badge'>Administrator Manual</div></div></div>")
[void]$html.Append("<div class='container'>")

# Section 1 — Dashboard
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>1</span>หน้า Dashboard (ภาพรวมระบบ)</div>")
[void]$html.Append("<div class='card'><div class='card-title'>📊 ภาพรวมสถิติระบบ (Admin Analytics)</div><p>หน้าหลักแสดงข้อมูลสรุปภาพรวมของระบบทั้งหมด มี <strong>4 การ์ด KPI</strong> หลัก:</p></div>")
[void]$html.Append("<div class='kpi-row'><div class='kpi-card'><div class='kpi-num'>128</div><div class='kpi-label'>คำร้องทั้งหมด</div></div><div class='kpi-card'><div class='kpi-num' style='color:#3b82f6;'>12</div><div class='kpi-label'>รับเรื่องแล้ว</div></div><div class='kpi-card'><div class='kpi-num' style='color:#8b5cf6;'>18</div><div class='kpi-label'>กำลังดำเนินการ</div></div><div class='kpi-card'><div class='kpi-num' style='color:#22c55e;'>98</div><div class='kpi-label'>เสร็จสิ้น (76.5%)</div></div></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📈 ฟังก์ชันใน Dashboard</div><ul><li>กราฟแสดงแนวโน้มคำร้องรายสัปดาห์/รายเดือน</li><li>Top 5 ประเภทงานที่แจ้งซ่อมมากที่สุด</li><li>สถิติงานเสร็จ (%)</li><li>ตาราง <strong>คำร้องล่าสุด</strong> (อาคาร, ประเภท, ช่าง, สถานะ)</li><li>ตัวกรองช่วงเวลา: Dropdown เลือกดูตาม Dashboard</li></ul></div>")
[void]$html.Append("</div>")

# Section 2 — All Tickets
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>2</span>จัดการคำร้องซ่อมทั้งหมด (All Tickets)</div>")
[void]$html.Append("<div class='card'><div class='card-title'>📋 ดูและจัดการคำร้องซ่อมทั้งระบบ</div><p>เมนู <strong>คำร้องทั้งหมด</strong> แสดงคำร้องซ่อมจากทุกผู้ใช้ในระบบ</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>🔍 การค้นหาและกรอง</div><ul><li>ค้นหาด้วย Keyword (ชื่อ, อาคาร, หมายเลขคำร้อง)</li><li>กรองตาม <strong>สถานะ</strong>: รับเรื่องแล้ว / กำลังดำเนินการ / เสร็จสิ้น</li><li>กรองตาม <strong>ประเภทงาน</strong> และ <strong>ระดับความเร่งด่วน</strong></li><li>กรองตาม <strong>ช่วงเวลา</strong></li></ul></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>⚙️ การดำเนินการกับคำร้อง</div><ul><li><strong>มอบหมายงาน</strong> — เลือกช่างรับผิดชอบงาน</li><li><strong>อัปเดตสถานะ</strong> — เปลี่ยนสถานะได้โดยตรง</li><li><strong>ดูรายละเอียด</strong> — ดูข้อมูลครบถ้วน รวมถึงรูปภาพ</li><li><strong>Export CSV</strong> — ดาวน์โหลดรายงานเป็นไฟล์ <code>repair_tickets_YYYY-MM-DD.csv</code></li></ul></div>")
[void]$html.Append("</div>")

# Section 3 — User Management
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>3</span>จัดการผู้ใช้งานและพนักงาน (User &amp; Staff Management)</div>")
[void]$html.Append("<div class='card'><div class='card-title'>👥 จัดการบัญชีในระบบ</div><p>เมนู <strong>จัดการผู้ใช้งาน</strong> ให้ Admin ดูและจัดการบัญชีทั้งหมด ทั้ง Admin และช่าง</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📌 ขั้นตอนเพิ่มพนักงานใหม่ (7 ขั้นตอน)</div>")
[void]$html.Append("<ol><li>คลิกปุ่ม <strong>+ เพิ่มพนักงาน</strong></li><li>กรอก <strong>ชื่อ-นามสกุล</strong></li><li>กรอก <strong>อีเมล</strong> (ใช้เป็น username)</li><li>ตั้ง <strong>รหัสผ่านเริ่มต้น</strong></li><li>เลือก <strong>บทบาท</strong>: Admin หรือ ช่าง (Technician)</li><li>กรอก <strong>เบอร์โทรศัพท์</strong> (ไม่บังคับ)</li><li>กดปุ่ม <strong>บันทึก</strong> — ระบบสร้างบัญชีทันที</li></ol></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>✏️ แก้ไขและลบบัญชี</div><ul><li><strong>แก้ไข</strong> — คลิกไอคอนดินสอ &gt; แก้ไขข้อมูลที่ต้องการ &gt; บันทึก</li><li><strong>ลบบัญชี</strong> — คลิกไอคอนถังขยะ &gt; ยืนยันการลบ (ไม่สามารถกู้คืนได้)</li><li><strong>ดู LINE Status</strong> — ตรวจสอบว่าช่างผูก LINE แล้วหรือยัง</li></ul></div>")
[void]$html.Append("<div class='note'>⚠️ การลบบัญชีช่างจะไม่ลบประวัติงานที่ทำไปแล้ว แต่งานที่ยังดำเนินการอยู่จะต้องมอบหมายใหม่</div>")
[void]$html.Append("</div>")

# Page break
[void]$html.Append("<div class='page-break'></div>")

# Section 4 — Stock
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>4</span>จัดการคลังวัสดุ (Material Stock)</div>")
[void]$html.Append("<div class='card'><div class='card-title'>📦 ระบบคลังวัสดุและอุปกรณ์</div><p>ติดตามวัสดุที่ใช้ในงานซ่อมทั้งหมด ดูยอดคงเหลือและประวัติการใช้งาน</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>🔍 ฟังก์ชันคลังวัสดุ</div><ul><li><strong>ค้นหา</strong> วัสดุด้วยชื่อหรือรหัส</li><li><strong>กรอง</strong> ตามประเภทวัสดุ</li><li><strong>ดูยอดคงเหลือ</strong> และประวัติการเบิก-จ่าย</li><li><strong>Export CSV</strong> — ดาวน์โหลดรายงานเป็น <code>material_usage_YYYY-MM-DD.csv</code></li></ul></div>")
[void]$html.Append("</div>")

# Section 5 — Asset History
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>5</span>ประวัติสินทรัพย์ (Asset History)</div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>🏷️ ตรวจสอบประวัติสินทรัพย์</div><ul><li>ค้นหาด้วย <strong>หมายเลขสินทรัพย์</strong> (Asset Number)</li><li>กรองตาม <strong>ช่วงเวลา</strong></li><li>ดูประวัติการซ่อม/บำรุงรักษาทั้งหมดของแต่ละสินทรัพย์</li><li>ตรวจสอบค่าใช้จ่ายและวัสดุที่ใช้ต่อสินทรัพย์</li></ul></div>")
[void]$html.Append("</div>")

# Section 6 — Workflow
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>6</span>ขั้นตอนการทำงานประจำวัน</div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>🌅 ตรวจสอบตอนเช้า (ทุกวัน)</div>")
[void]$html.Append("<ol><li>เข้าหน้า <strong>Dashboard</strong> ดูภาพรวมคำร้องใหม่</li><li>เข้าเมนู <strong>คำร้องทั้งหมด</strong> กรองดูคำร้อง <em>รับเรื่องแล้ว</em> ที่ยังไม่มีช่าง</li><li><strong>มอบหมายงาน</strong> ให้ช่างที่เหมาะสม</li><li>ตรวจสอบงาน <em>เร่งด่วน/ฉุกเฉิน</em> ที่ต้องดำเนินการทันที</li></ol></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📅 งานสิ้นเดือน</div>")
[void]$html.Append("<ol type='A'><li>Export รายงานคำร้องซ่อม CSV จากเมนูคำร้องทั้งหมด</li><li>Export รายงานการใช้วัสดุ CSV จากเมนูคลังวัสดุ</li><li>ตรวจสอบสต็อกวัสดุที่เหลือน้อย เพื่อสั่งเพิ่ม</li><li>ตรวจสอบประสิทธิภาพช่าง จากจำนวนงานที่ทำ</li></ol></div>")
[void]$html.Append("</div>")

# Section 7 — Roles table
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>7</span>สิทธิ์การใช้งานตามบทบาท</div>")
[void]$html.Append("<table><thead><tr><th>ฟังก์ชัน</th><th style='text-align:center;'>ผู้แจ้งซ่อม</th><th style='text-align:center;'>ช่าง</th><th style='text-align:center;'>Admin</th></tr></thead><tbody>")
$roles = @(
    @("แจ้งซ่อมใหม่", "✅", "❌", "❌"),
    @("ติดตามสถานะคำร้องของตัวเอง", "✅", "❌", "✅"),
    @("ดูงานที่รับได้ (Task Pool)", "❌", "✅", "❌"),
    @("รับงาน / บันทึกผลการซ่อม", "❌", "✅", "❌"),
    @("เบิกวัสดุ", "❌", "✅", "❌"),
    @("ดูคำร้องทั้งหมด", "❌", "❌", "✅"),
    @("มอบหมายงานให้ช่าง", "❌", "❌", "✅"),
    @("จัดการผู้ใช้งาน", "❌", "❌", "✅"),
    @("จัดการคลังวัสดุ", "❌", "❌", "✅"),
    @("ดูประวัติสินทรัพย์", "❌", "❌", "✅"),
    @("Export รายงาน CSV", "❌", "❌", "✅")
)
foreach ($row in $roles) {
    [void]$html.Append("<tr><td>$($row[0])</td><td class='$(if($row[1] -eq "✅"){"role-yes"}else{"role-no"})'>$($row[1])</td><td class='$(if($row[2] -eq "✅"){"role-yes"}else{"role-no"})'>$($row[2])</td><td class='$(if($row[3] -eq "✅"){"role-yes"}else{"role-no"})'>$($row[3])</td></tr>")
}
[void]$html.Append("</tbody></table>")
[void]$html.Append("</div>")

# Footer
[void]$html.Append("<div class='footer'><div>ระบบแจ้งซ่อม AMC — NU SEED | มหาวิทยาลัยนเรศวร</div><div>พัฒนาโดย: อมรเชษฐ์ รัตนากร (68365934) นิสิตวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร</div></div>")
[void]$html.Append("</div></body></html>")

$outPath = Join-Path $PSScriptRoot "manuals\manual_admin.html"
[System.IO.File]::WriteAllText($outPath, $html.ToString(), [System.Text.Encoding]::UTF8)
Write-Output "Generated: manuals\manual_admin.html"
