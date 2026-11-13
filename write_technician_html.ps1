# write_technician_html.ps1
# เขียน HTML ช่างซ่อมบำรุง ตรงๆ ด้วย .NET UTF8

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
[void]$html.Append('<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>คู่มือช่างซ่อมบำรุง — ระบบแจ้งซ่อม AMC</title><style>
@page { margin: 11mm 13mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Leelawadee UI","Cordia New","Angsana New",Tahoma,sans-serif; font-size: 12.5px; line-height: 1.65; color: #1e293b; background: #fff; }
.header { background: linear-gradient(135deg,#0b2545 0%,#0369a1 100%); color:#fff; padding:20px 26px 16px 26px; display:flex; align-items:center; page-break-inside:avoid; break-inside:avoid; }
.header-title { font-size:18px; font-weight:800; margin-bottom:3px; }
.header-sub { font-size:11px; opacity:0.85; margin-bottom:5px; }
.header-badge { display:inline-block; background:#0284c7; color:#fff; font-size:11px; font-weight:700; padding:2px 10px; border-radius:20px; }
.container { max-width:820px; margin:0 auto; padding:20px 20px 10px; }
.section-block { margin-bottom:20px; page-break-inside:avoid; break-inside:avoid; }
.section-title { display:flex; align-items:center; gap:9px; font-size:14px; font-weight:800; color:#0b2545; margin-top:20px; margin-bottom:10px; padding-bottom:5px; border-bottom:2.5px solid #0369a1; page-break-after:avoid; break-after:avoid; }
.section-title .sn { display:inline-flex; align-items:center; justify-content:center; width:25px; height:25px; background:#0369a1; color:#fff; border-radius:50%; font-size:12px; font-weight:800; flex-shrink:0; }
.card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px 15px; margin-bottom:12px; box-shadow:0 1px 4px rgba(0,0,0,0.06); page-break-inside:avoid; break-inside:avoid; }
.card-title { font-size:12.5px; font-weight:700; color:#0369a1; margin-bottom:7px; }
.step-card { background:#f0f9ff; border:1px solid #bae6fd; border-left:4px solid #0284c7; border-radius:8px; padding:11px 14px; margin-bottom:12px; page-break-inside:avoid; break-inside:avoid; }
.step-label { font-weight:800; font-size:12.5px; color:#0369a1; margin-bottom:7px; }
ul,ol { padding-left:20px; margin-top:5px; margin-bottom:5px; }
li { line-height:1.75; margin-bottom:4px; }
.note { background:#fffbeb; border:1px solid #fcd34d; border-radius:7px; padding:9px 12px; font-size:11.5px; color:#78350f; margin-top:8px; }
.info { background:#eff6ff; border:1px solid #93c5fd; border-radius:7px; padding:9px 12px; font-size:11.5px; color:#1e3a8a; margin-top:8px; }
.chat-box { background:#0b2545; border-radius:10px; padding:12px 14px; color:#e2e8f0; font-size:11.5px; margin:8px 0; }
.chat-line { margin-bottom:6px; }
.chat-you { color:#93c5fd; }
.chat-bot { color:#34d399; }
table { width:100%; border-collapse:collapse; font-size:12px; margin-top:8px; }
th { background:#0369a1; color:#fff; padding:7px 10px; text-align:left; font-weight:700; }
td { padding:6px 10px; border-bottom:1px solid #e2e8f0; }
tr:nth-child(even) td { background:#f8fafc; }
.footer { margin-top:28px; padding-top:10px; border-top:1px solid #e2e8f0; text-align:center; font-size:9.5px; color:#94a3b8; }
.page-break { page-break-after:always; height:0; }
.workflow-bar { display:flex; gap:0; margin:10px 0; }
.wf-step { flex:1; background:#0369a1; color:#fff; text-align:center; padding:7px 4px; font-size:11px; font-weight:700; position:relative; }
.wf-step:not(:last-child)::after { content:"▶"; position:absolute; right:-8px; top:50%; transform:translateY(-50%); color:#0369a1; font-size:14px; z-index:1; }
.wf-step:nth-child(2) { background:#0284c7; }
.wf-step:nth-child(3) { background:#0ea5e9; }
.wf-step:nth-child(4) { background:#38bdf8; color:#0b2545; }
</style></head><body>')

[void]$html.Append("<div class='header'>$logoImg<div><div class='header-title'>🔧 คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับช่างซ่อมบำรุง</div><div class='header-sub'>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร &nbsp;|&nbsp; AMC Repair Management System</div><div class='header-badge'>Technician Manual</div></div></div>")
[void]$html.Append("<div class='container'>")

# Section 1 — สร้างบัญชี
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>1</span>การสร้างบัญชีและเข้าสู่ระบบ</div>")
[void]$html.Append("<div class='card'><div class='card-title'>👤 บัญชีช่างซ่อมบำรุง (Technician)</div><p>บัญชีช่างสามารถสร้างได้ <strong>2 วิธี</strong> ตามความเหมาะสม:</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📌 วิธีที่ 1 — สมัครด้วยตัวเอง (ไม่มีบัญชีในระบบ)</div>")
[void]$html.Append("<ol><li>เปิดเว็บ <strong>https://nu-seed-repair-amc.vercel.app/</strong></li><li>คลิก <strong>สมัครสมาชิก / ลงทะเบียน</strong></li><li>กรอก <strong>ชื่อ-นามสกุล, อีเมล, รหัสผ่าน</strong></li><li>เลือก <strong>ประเภทบัญชี: ช่าง (Technician)</strong></li><li>กดปุ่ม <strong>สมัครสมาชิก</strong></li><li>ระบบสร้างบัญชีช่างให้อัตโนมัติ รอการอนุมัติจาก Admin</li><li>เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ตั้งไว้</li></ol></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📌 วิธีที่ 2 — Admin สร้างบัญชีให้</div>")
[void]$html.Append("<ol><li>ผู้ดูแลระบบ (Admin) เข้าเมนู <strong>จัดการผู้ใช้งาน</strong></li><li>Admin กรอกข้อมูลช่างและกดเพิ่มบัญชี</li><li>ช่างได้รับข้อมูล อีเมล + รหัสผ่านเริ่มต้น จาก Admin</li><li>เข้าสู่ระบบ แล้วเปลี่ยนรหัสผ่านในเมนู <strong>ข้อมูลส่วนตัว</strong></li></ol></div>")
[void]$html.Append("<div class='note'>⚠️ ไม่ว่าจะสมัครด้วยตัวเองหรือ Admin สร้างให้ ต้องผูก LINE ID ก่อนถึงจะรับแจ้งเตือนงานได้</div>")
[void]$html.Append("</div>")

# Section 2 — ผูก LINE
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>2</span>การผูก LINE ID เพื่อรับแจ้งเตือน</div>")
[void]$html.Append("<div class='card'><div class='card-title'>📱 ทำไมต้องผูก LINE?</div><p>ระบบส่งการแจ้งเตือนงานซ่อมใหม่ผ่าน <strong>LINE Bot</strong> เมื่อมีงานที่ตรงกับความเชี่ยวชาญของคุณ การผูก LINE ID ทำให้ไม่พลาดงาน</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📌 ขั้นตอนการผูก LINE</div>")
[void]$html.Append("<ol><li>เปิดแอป LINE บนมือถือ</li><li>ค้นหา LINE Bot: <strong>@656qpjdx</strong> แล้วกด <strong>เพิ่มเพื่อน</strong></li><li>พิมพ์คำสั่ง <strong>register</strong> ส่งไปใน LINE Bot</li><li>Bot ตอบกลับพร้อม <strong>รหัสยืนยัน (OTP)</strong></li><li>นำรหัส OTP ไปกรอกในเมนู <strong>ข้อมูลส่วนตัว &gt; ผูก LINE ID</strong> บนเว็บ</li><li>กด <strong>ยืนยัน</strong> — ระบบแสดงข้อความ <em>ผูก LINE สำเร็จ</em></li></ol></div>")
[void]$html.Append("<div class='chat-box'><div class='chat-line chat-you'>คุณ: register</div><div class='chat-line chat-bot'>Bot: รหัส OTP ของคุณคือ <strong>A8X2K9</strong> (หมดอายุใน 10 นาที)</div><div class='chat-line chat-bot'>Bot: กรุณานำรหัสนี้ไปกรอกบนเว็บระบบแจ้งซ่อม</div></div>")
[void]$html.Append("</div>")

# Section 3 — รับแจ้งเตือน
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>3</span>การรับแจ้งเตือนงานซ่อมทาง LINE</div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>🔔 แจ้งเตือนอัตโนมัติ</div><p>เมื่อมีคำร้องซ่อมใหม่เข้ามา ระบบจะส่งข้อความ LINE อัตโนมัติ:</p><ul><li>🏷️ หมายเลขคำร้อง (Ticket ID)</li><li>📌 ประเภทงาน / รายละเอียดปัญหา</li><li>📍 อาคาร / ห้อง / ชั้น</li><li>🚨 ระดับความเร่งด่วน (ปกติ / เร่งด่วน / ฉุกเฉิน)</li><li>🔗 ลิงก์เข้าสู่ระบบโดยตรง</li></ul></div>")
[void]$html.Append("<div class='note'>💡 ตรวจสอบว่าไม่ได้ Mute การแจ้งเตือน LINE Bot เพื่อให้รับแจ้งเตือนได้ทันท่วงที</div>")
[void]$html.Append("</div>")

# Page break
[void]$html.Append("<div class='page-break'></div>")

# Section 4 — Task Pool
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>4</span>เมนู &quot;งานที่รับได้&quot; (Task Pool)</div>")
[void]$html.Append("<div class='card'><div class='card-title'>🧰 งานที่รับได้คืออะไร?</div><p>แสดงรายการคำร้องซ่อมทั้งหมดที่ <strong>ยังไม่มีช่างรับ</strong> สามารถเลือกรับงานที่ถนัดได้</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📌 วิธีค้นหาและรับงาน</div>")
[void]$html.Append("<ol><li>เลือกเมนู <strong>งานที่รับได้</strong> ในแถบเมนูด้านบน</li><li>ใช้ตัวกรอง (Filter) เพื่อค้นหางานที่ต้องการ:<ul><li>กรองตาม <strong>ประเภทงาน</strong> หรือ <strong>อาคาร</strong></li><li>พิมพ์ค้นหาด้วย <strong>Keyword</strong></li></ul></li><li>คลิกที่รายการงานที่ต้องการ เพื่อดูรายละเอียดเพิ่มเติม</li><li>กดปุ่ม <strong>รับงานนี้</strong> เพื่อรับผิดชอบงาน</li><li>งานจะย้ายไปยังเมนู <strong>งานของฉัน</strong> อัตโนมัติ</li></ol></div>")
[void]$html.Append("</div>")

# Section 5 — งานของฉัน
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>5</span>เมนู &quot;งานของฉัน&quot; (My Tasks)</div>")
[void]$html.Append("<div class='card'><div class='card-title'>🛠️ งานของฉันคืออะไร?</div><p>แสดงรายการงานซ่อมทั้งหมดที่คุณ <strong>รับผิดชอบ</strong> จัดกลุ่มตามอาคาร/ชั้น</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📌 การจัดการงานของฉัน</div>")
[void]$html.Append("<ol><li>เลือกเมนู <strong>งานของฉัน</strong></li><li>กรองดูงานด้วย 3 ตัวเลือก:<ul><li><strong>ทั้งหมด</strong> — ดูงานทุกสถานะ</li><li><strong>กำลังดำเนินการ</strong> — งานที่กำลังซ่อม</li><li><strong>เสร็จสิ้น</strong> — งานที่ปิดแล้ว</li></ul></li><li>งานจัดกลุ่มตาม <strong>อาคาร / ชั้น</strong> เพื่อวางแผนเส้นทาง</li><li>คลิกรายการงานเพื่อดูรายละเอียดและดำเนินการ</li></ol></div>")
[void]$html.Append("</div>")

# Section 6 — เบิกวัสดุ
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>6</span>การเบิกวัสดุ/อุปกรณ์</div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>📦 ขั้นตอนเบิกวัสดุ</div>")
[void]$html.Append("<ol><li>เปิดรายละเอียดงานที่ต้องการเบิกวัสดุ</li><li>คลิกปุ่ม <strong>เบิกวัสดุ / อุปกรณ์</strong></li><li>เลือกรายการวัสดุจาก <strong>คลังวัสดุ</strong></li><li>กรอกจำนวนที่ต้องการ</li><li>กด <strong>ยืนยันเบิก</strong></li><li>ระบบบันทึกการใช้วัสดุและตัดสต็อกอัตโนมัติ</li></ol></div>")
[void]$html.Append("<div class='note'>⚠️ เบิกวัสดุได้เฉพาะงานที่คุณรับผิดชอบเท่านั้น และต้องไม่เกินจำนวนที่มีในคลัง</div>")
[void]$html.Append("</div>")

# Section 7 — บันทึกผลและปิดงาน
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>7</span>การบันทึกผลและปิดงาน</div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>✅ ขั้นตอนบันทึกผลการซ่อม</div>")
[void]$html.Append("<ol><li>เปิดรายการงานจากเมนู <strong>งานของฉัน</strong></li><li>คลิกปุ่ม <strong>บันทึกผลการซ่อม</strong></li><li>กรอก <strong>รายละเอียดงานที่ทำ</strong> (อธิบายให้ชัดเจน)</li><li>แนบ <strong>รูปภาพผลงาน</strong> (ถ้ามี)</li><li>กด <strong>ปิดงาน / เสร็จสิ้น</strong></li><li>สถานะงานเปลี่ยนเป็น <strong>เสร็จสิ้น</strong> อัตโนมัติ</li><li>ผู้แจ้งซ่อมจะเห็นสถานะอัปเดตในระบบ</li></ol></div>")
[void]$html.Append("</div>")

# Section 8 — ประวัติงาน
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>8</span>ประวัติงานที่เสร็จสิ้น</div>")
[void]$html.Append("<div class='card'><div class='card-title'>📂 ดูประวัติงานย้อนหลัง</div><p>เลือกเมนู <strong>ประวัติงาน</strong> เพื่อดูงานที่ปิดแล้วทั้งหมด</p></div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>🔍 ตัวกรองประวัติงาน</div><ul><li>กรองตาม <strong>ปี</strong> และ <strong>เดือน</strong></li><li>ค้นหาด้วย Keyword</li><li>ดูสถิติงานที่ทำในแต่ละช่วงเวลา</li></ul></div>")
[void]$html.Append("</div>")

# Section 9 — ข้อมูลส่วนตัว
[void]$html.Append("<div class='section-block'><div class='section-title'><span class='sn'>9</span>ข้อมูลส่วนตัวและการตั้งค่า</div>")
[void]$html.Append("<div class='step-card'><div class='step-label'>⚙️ สิ่งที่จัดการได้ในโปรไฟล์</div><ul><li><strong>ชื่อ-นามสกุล</strong> — แก้ไขชื่อที่แสดง</li><li><strong>เบอร์โทรศัพท์</strong> — เพิ่ม/แก้ไขเบอร์</li><li><strong>รหัสผ่าน</strong> — เปลี่ยนรหัสผ่านได้ทุกเมื่อ</li><li><strong>ผูก LINE ID</strong> — กรอก OTP จาก LINE Bot เพื่อเชื่อมต่อ</li></ul><p style='margin-top:8px;'>กด <strong>บันทึก</strong> เพื่อยืนยันการเปลี่ยนแปลงทุกครั้ง</p></div>")
[void]$html.Append("</div>")

# Footer
[void]$html.Append("<div class='footer'><div>ระบบแจ้งซ่อม AMC — NU SEED | มหาวิทยาลัยนเรศวร</div><div>พัฒนาโดย: อมรเชษฐ์ รัตนากร (68365934) นิสิตวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร</div></div>")
[void]$html.Append("</div></body></html>")

$outPath = Join-Path $PSScriptRoot "manuals\manual_technician.html"
[System.IO.File]::WriteAllText($outPath, $html.ToString(), [System.Text.Encoding]::UTF8)
Write-Output "Generated: manuals\manual_technician.html"
