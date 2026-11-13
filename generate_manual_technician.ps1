# generate_manual_technician.ps1
# สร้างคู่มือช่างซ่อมบำรุง HTML

$logoBase64 = ""
$logoPath = Join-Path $PSScriptRoot "nu_seed_logo.png"
if (Test-Path $logoPath) {
    $logoBytes = [System.IO.File]::ReadAllBytes($logoPath)
    $logoBase64 = [System.Convert]::ToBase64String($logoBytes)
}
$logoSrc = if ($logoBase64) { "data:image/png;base64,$logoBase64" } else { "" }
$logoTag = if ($logoSrc) { "<img src='$logoSrc' alt='NU SEED Logo' style='height:52px;margin-right:14px;vertical-align:middle;'>" } else { "" }

$html = @"
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>คู่มือช่างซ่อมบำรุง — ระบบแจ้งซ่อม NU SEED</title>
<style>
  @page { margin: 9mm 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Leelawadee UI','Cordia New','Angsana New','Tahoma',sans-serif;
    font-size: 12px;
    line-height: 1.6;
    color: #1e293b;
    background: #f8fafc;
  }
  .header {
    background: linear-gradient(135deg, #0b2545 0%, #0369a1 100%);
    color: #fff;
    padding: 20px 28px 16px 28px;
    display: flex;
    align-items: center;
    gap: 14px;
    page-break-after: avoid;
    break-after: avoid;
  }
  .header-text h1 { font-size: 20px; font-weight: 700; letter-spacing: 0.3px; margin-bottom: 3px; }
  .header-text p { font-size: 11.5px; opacity: 0.88; }
  .badge {
    display: inline-block;
    background: #0284c7;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 9px;
    border-radius: 20px;
    margin-top: 5px;
    letter-spacing: 0.5px;
  }
  .workflow-bar {
    background: #e0f2fe;
    border-left: 4px solid #0369a1;
    padding: 10px 16px;
    margin: 14px 0 8px 0;
    border-radius: 0 6px 6px 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .wf-step {
    background: #0369a1;
    color: #fff;
    font-size: 10.5px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    white-space: nowrap;
  }
  .wf-arrow { color: #0369a1; font-weight: 700; font-size: 13px; }
  .wf-label { font-size: 10px; color: #0369a1; font-weight: 600; margin-top: 6px; width: 100%; }
  .navbar {
    background: #0b2545;
    padding: 7px 20px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    page-break-after: avoid;
    break-after: avoid;
  }
  .nav-item {
    background: rgba(255,255,255,0.12);
    color: #e0f2fe;
    font-size: 10.5px;
    padding: 4px 11px;
    border-radius: 5px;
    font-weight: 600;
  }
  .content { padding: 10px 18px 14px 18px; }
  .section-block {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 18px;
  }
  .section-title {
    page-break-after: avoid;
    break-after: avoid;
    font-size: 13.5px;
    font-weight: 700;
    color: #0b2545;
    border-left: 5px solid #0369a1;
    padding: 6px 10px 6px 12px;
    margin-top: 18px;
    margin-bottom: 7px;
    background: #f0f9ff;
    border-radius: 0 5px 5px 0;
  }
  .step-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 11px 14px;
    margin-bottom: 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .step-card h4 { font-size: 11.5px; font-weight: 700; color: #0369a1; margin-bottom: 6px; }
  ul, ol { padding-left: 18px; }
  li { line-height: 1.65; margin-bottom: 4px; font-size: 12px; }
  .note-box {
    background: #fef9c3;
    border-left: 4px solid #eab308;
    padding: 7px 11px;
    border-radius: 0 5px 5px 0;
    margin-top: 8px;
    font-size: 11px;
    color: #713f12;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .info-box {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    padding: 7px 11px;
    border-radius: 0 5px 5px 0;
    margin-top: 8px;
    font-size: 11px;
    color: #1e3a8a;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .success-box {
    background: #f0fdf4;
    border-left: 4px solid #22c55e;
    padding: 7px 11px;
    border-radius: 0 5px 5px 0;
    margin-top: 8px;
    font-size: 11px;
    color: #14532d;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .chat-mockup {
    background: #799fc4;
    border-radius: 10px;
    padding: 11px 14px;
    margin-top: 8px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .chat-header { color: #fff; font-weight: 700; font-size: 11px; margin-bottom: 7px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; }
  .chat-bubble {
    background: #ffffff;
    border-radius: 0 10px 10px 10px;
    padding: 9px 12px;
    max-width: 92%;
    font-size: 11px;
    line-height: 1.65;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  }
  .chat-bubble b { color: #0b2545; }
  .chat-link { color: #0369a1; font-weight: 700; text-decoration: underline; word-break: break-all; }
  .chat-time { font-size: 9px; color: rgba(255,255,255,0.7); text-align: right; margin-top: 5px; }
  .status { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; }
  .status-new { background: #dbeafe; color: #1d4ed8; }
  .status-wip { background: #fef3c7; color: #b45309; }
  .status-done { background: #dcfce7; color: #15803d; }
  .filter-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; align-items: center; }
  .filter-btn { font-size: 10.5px; padding: 3px 10px; border-radius: 5px; font-weight: 600; border: 1px solid #0369a1; color: #0369a1; background: #fff; }
  .filter-btn.active { background: #0369a1; color: #fff; }
  .task-card-mockup { border: 1px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 8px; background: #f8fafc; }
  .task-card-mockup .tc-row { display: flex; gap: 8px; margin-bottom: 3px; flex-wrap: wrap; }
  .tc-label { font-size: 10px; color: #64748b; font-weight: 600; min-width: 70px; }
  .tc-val { font-size: 10.5px; color: #1e293b; }
  .btn-mockup { display: inline-block; font-size: 10.5px; font-weight: 700; padding: 4px 11px; border-radius: 5px; margin-right: 6px; margin-top: 6px; }
  .btn-primary { background: #0369a1; color: #fff; }
  .btn-success { background: #15803d; color: #fff; }
  .btn-warn { background: #f59e0b; color: #fff; }
  .btn-clear { background: #e2e8f0; color: #374151; }
  .history-row { border-bottom: 1px solid #e2e8f0; padding: 7px 2px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .history-row .hr-no { font-size: 10.5px; color: #0369a1; font-weight: 700; }
  .history-row .hr-name { font-size: 11px; color: #1e293b; }
  .history-row .hr-loc { font-size: 10px; color: #64748b; }
  .history-row .hr-date { font-size: 10px; color: #64748b; margin-left: auto; }
  .page-break { page-break-after: always; break-after: always; }
  .mat-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
  .mat-table th { background: #e0f2fe; color: #0b2545; font-weight: 700; padding: 5px 8px; text-align: left; border: 1px solid #bae6fd; }
  .mat-table td { padding: 5px 8px; border: 1px solid #e2e8f0; color: #1e293b; }
  .mat-table tr:nth-child(even) td { background: #f8fafc; }
  .mat-total { font-weight: 700; color: #0369a1; text-align: right; padding-top: 5px; font-size: 11px; }
  .form-row { display: flex; gap: 8px; margin-bottom: 6px; align-items: center; flex-wrap: wrap; }
  .form-label { font-size: 10.5px; color: #374151; font-weight: 600; min-width: 110px; }
  .form-input { flex: 1; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; font-size: 11px; color: #1e293b; min-width: 120px; }
  .footer { margin-top: 20px; padding: 10px 18px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #94a3b8; page-break-inside: avoid; break-inside: avoid; }
  .urgent { background: #fee2e2; color: #b91c1c; border-radius: 4px; padding: 1px 7px; font-size: 10px; font-weight: 700; }
</style>
</head>
<body>

<div class="header">
  `$logoTag
  <div class="header-text">
    <h1>&#128203; คู่มือการใช้งานระบบ &#8212; ช่างซ่อมบำรุง</h1>
    <p>ระบบแจ้งซ่อมออนไลน์ | อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</p>
    <span class="badge">&#128295; สำหรับช่างซ่อมบำรุง</span>
  </div>
</div>

<div class="navbar">
  <div class="nav-item">&#129520; งานที่รับได้</div>
  <div class="nav-item">&#128295; งานของฉัน</div>
  <div class="nav-item">&#9989; ประวัติงานเสร็จ</div>
  <div class="nav-item">&#128100; ข้อมูลส่วนตัว</div>
</div>

<div class="content">
<div class="workflow-bar">
  <div class="wf-label">&#128204; ขั้นตอนการทำงานของช่าง:</div>
  <div class="wf-step">&#128276; ใบงานใหม่<br><small style="font-weight:400;font-size:9px;">(รับเรื่องแล้ว)</small></div>
  <div class="wf-arrow">&#8594;</div>
  <div class="wf-step">&#128295; ช่างกดรับงาน<br><small style="font-weight:400;font-size:9px;">(กำลังดำเนินการ)</small></div>
  <div class="wf-arrow">&#8594;</div>
  <div class="wf-step">&#128230; เบิกวัสดุ</div>
  <div class="wf-arrow">&#8594;</div>
  <div class="wf-step">&#9989; ซ่อมเสร็จ+แนบรูป<br><small style="font-weight:400;font-size:9px;">(เสร็จสิ้น)</small></div>
</div>

<!-- STEP 1 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 1 &#8212; สร้างบัญชีและเข้าสู่ระบบ</div>
  <div class="step-card">
    <h4>&#9398; วิธีที่ 1: แอดมินสร้างบัญชีให้ (แนะนำ)</h4>
    <ol>
      <li>แอดมินเข้าเมนู <b>"จัดการผู้ใช้ / ช่าง"</b></li>
      <li>กดปุ่ม <b>"+ เพิ่มบัญชีใหม่"</b></li>
      <li>เลือกบทบาท <b>"ช่างซ่อมบำรุง"</b></li>
      <li>กรอกข้อมูล: ชื่อ, อีเมล, รหัสผ่าน, เบอร์โทร, ความเชี่ยวชาญ</li>
      <li>แอดมินส่ง <b>email + รหัสผ่าน</b> ให้ช่างทางช่องทางที่ปลอดภัย</li>
    </ol>
  </div>
  <div class="step-card">
    <h4>&#9399; วิธีที่ 2: สมัครด้วยตนเองผ่านเว็บ</h4>
    <ol>
      <li>เปิดเบราว์เซอร์ &#8594; ไปที่ <b>nu-seed-repair-amc.vercel.app</b></li>
      <li>กดปุ่ม <b>"สมัครสมาชิกใหม่"</b></li>
      <li>เลือกบทบาท <b>"&#128295; ช่างซ่อม"</b></li>
      <li>กรอกข้อมูล: ชื่อ-นามสกุล, เบอร์โทร, ความเชี่ยวชาญ, อีเมล, รหัสผ่าน (&#8805; 6 ตัวอักษร)</li>
      <li>กดปุ่ม <b>"ลงทะเบียนสมาชิกใหม่ &#10024;"</b> เพื่อยืนยัน</li>
    </ol>
    <div class="note-box">
      &#9888;&#65039; <b>หมายเหตุ:</b> หากได้รับรหัสผ่านชั่วคราวจากแอดมิน ให้เปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบครั้งแรก
    </div>
  </div>
</div>

<!-- STEP 2 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 2 &#8212; ผูก LINE ID เพื่อรับแจ้งเตือน (LINE Bot Setup)</div>
  <div class="step-card">
    <h4>2.1 ขอรหัส LINE User ID จากบอท</h4>
    <ol>
      <li>เปิดแอป <b>LINE</b> บนมือถือ</li>
      <li>ค้นหา <b>@656qpjdx</b> &#8594; กด <b>"เพิ่มเพื่อน"</b></li>
      <li>พิมพ์ข้อความ <b>"ID"</b> หรือ <b>"สวัสดี"</b> ส่งไปยังบอท</li>
      <li>บอทจะส่งรหัส <b>U... (ยาว 33 ตัวอักษร)</b> กลับมา &#8594; <b>คัดลอกรหัสนั้น</b></li>
    </ol>
    <div class="chat-mockup" style="margin-top:10px;">
      <div class="chat-header">&#128172; ตัวอย่างข้อความจาก LINE Bot (@656qpjdx)</div>
      <div class="chat-bubble">
        <b>&#129302; NU SEED Repair Bot</b><br><br>
        สวัสดีครับ! &#128075;<br>
        LINE User ID ของคุณคือ:<br>
        <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:10.5px;word-break:break-all;">U95dfeab61af0edf2f718d1d7372eb559</code><br><br>
        กรุณาคัดลอก ID นี้ และนำไปวางในระบบแจ้งซ่อม<br>
        เมนู <b>"ข้อมูลส่วนตัว"</b> &#8594; ช่อง <b>LINE User ID</b>
      </div>
      <div class="chat-time">10:23</div>
    </div>
  </div>
  <div class="step-card">
    <h4>2.2 บันทึก LINE User ID ในระบบ</h4>
    <ol>
      <li>ล็อกอินเข้าเว็บระบบแจ้งซ่อม</li>
      <li>ไปที่เมนู <b>"ข้อมูลส่วนตัว"</b></li>
      <li>กดปุ่ม <b>"&#9998;&#65039; แก้ไขข้อมูล"</b></li>
      <li>วางรหัสที่คัดลอกไว้ในช่อง <b>LINE User ID</b></li>
      <li>กดปุ่ม <b>"&#128276; ทดสอบส่งเข้า LINE"</b> เพื่อตรวจสอบ</li>
      <li>กดปุ่ม <b>"&#128190; บันทึก"</b> เพื่อบันทึกข้อมูล</li>
    </ol>
    <div class="success-box">
      &#9989; หากทดสอบสำเร็จ ระบบจะส่งข้อความยืนยันมาที่ LINE ของคุณ แสดงว่าพร้อมรับการแจ้งเตือนงานใหม่แล้ว
    </div>
  </div>
</div>

<!-- STEP 3 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 3 &#8212; รับข้อความแจ้งเตือนงานใหม่ทาง LINE</div>
  <div class="step-card">
    <h4>&#128242; ตัวอย่างข้อความแจ้งเตือนที่ได้รับจากระบบ</h4>
    <div class="chat-mockup">
      <div class="chat-header">&#128172; ข้อความจากระบบ &#8212; งานใหม่เข้ามา!</div>
      <div class="chat-bubble">
        <b>&#128276; แจ้งเตือน: มีงานซ่อมใหม่ที่รอการรับงาน</b><br><br>
        &#128203; <b>เลขที่:</b> REP-2026-4132<br>
        &#128295; <b>อาการ:</b> เครื่องปรับอากาศน้ำหยดและไม่เย็น<br>
        &#128205; <b>สถานที่:</b> อาคาร SCI-LAB ชั้น 3 ห้อง 302<br>
        &#128680; <b>ความเร่งด่วน:</b> <span style="color:#b91c1c;font-weight:700;">ด่วนมาก</span><br>
        &#128100; <b>ผู้แจ้ง:</b> สมชาย รักดี (โทร 081-234-5678)<br>
        &#128197; <b>วันที่แจ้ง:</b> 13 พ.ย. 2026 เวลา 09:45 น.<br><br>
        &#128070; <span class="chat-link">แตะลิงก์เพื่อดูรายละเอียดและรับงาน &#8594;</span><br>
        <span style="font-size:9.5px;color:#64748b;">nu-seed-repair-amc.vercel.app/tasks/REP-2026-4132</span>
      </div>
      <div class="chat-time">09:46</div>
    </div>
    <h4 style="margin-top:10px;">&#9989; สิ่งที่ต้องตรวจดูเมื่อได้รับแจ้งเตือน</h4>
    <ul>
      <li>&#128680; <b>ระดับความเร่งด่วน</b> &#8212; งานด่วนต้องรีบรับก่อน</li>
      <li>&#128205; <b>สถานที่และอาการ</b> &#8212; ประเมินเพื่อเตรียมอุปกรณ์/อะไหล่ที่จำเป็น</li>
      <li>&#128070; <b>แตะลิงก์</b> ในข้อความเพื่อเปิดหน้ารับงานโดยตรง</li>
    </ul>
  </div>
</div>

<div class="page-break"></div>

<!-- STEP 4 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 4 &#8212; เมนู "งานที่รับได้" (Task Pool)</div>
  <div class="step-card">
    <h4>&#128203; ใบงานที่แสดงในหน้า "งานที่รับได้"</h4>
    <p style="margin-bottom:7px;">แสดงเฉพาะใบงานที่มีสถานะ <span class="status status-new">รับเรื่องแล้ว</span> และยังไม่มีช่างรับงาน</p>
    <div class="filter-bar">
      <span style="font-size:10.5px;font-weight:600;color:#374151;">กรองงาน:</span>
      <span class="filter-btn active">ทั้งหมด</span>
      <span class="filter-btn">รอดำเนินการ</span>
      <span class="filter-btn">&#128680; ด่วน</span>
      <input style="font-size:10.5px;padding:3px 8px;border:1px solid #cbd5e1;border-radius:5px;min-width:140px;" placeholder="&#128269; ค้นหาเลขที่งาน / สถานที่" readonly>
    </div>
    <div class="task-card-mockup">
      <div class="tc-row">
        <span class="tc-label">เลขที่งาน:</span><span class="tc-val" style="color:#0369a1;font-weight:700;">REP-2026-4132</span>
        <span style="margin-left:auto;background:#fee2e2;color:#b91c1c;border-radius:4px;padding:1px 7px;font-size:10px;font-weight:700;">&#128680; ด่วนมาก</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">ประเภท:</span><span class="tc-val">ระบบปรับอากาศ</span>
        <span class="tc-label">วันที่แจ้ง:</span><span class="tc-val">13 พ.ย. 2026</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">อาการ:</span><span class="tc-val">เครื่องปรับอากาศน้ำหยดและไม่เย็น</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">สถานที่:</span><span class="tc-val">อาคาร SCI-LAB ชั้น 3 ห้อง 302</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">ผู้แจ้ง:</span><span class="tc-val">สมชาย รักดี | &#128222; 081-234-5678</span>
      </div>
      <div class="tc-row">
        <span class="tc-label">เลขครุภัณฑ์:</span><span class="tc-val">NU-AC-0023</span>
      </div>
      <div>
        <span class="btn-mockup btn-primary">&#128196; รายละเอียดฉบับเต็ม</span>
        <span class="btn-mockup btn-success">&#10003; รับงานนี้</span>
      </div>
    </div>
    <div class="info-box">
      &#8505;&#65039; <b>เมื่อกดปุ่ม "&#10003; รับงานนี้":</b> สถานะจะเปลี่ยนจาก <span class="status status-new">รับเรื่องแล้ว</span> &#8594; <span class="status status-wip">กำลังดำเนินการ</span> ทันที และใบงานจะย้ายเข้าเมนู <b>"งานของฉัน"</b> พร้อมบันทึกชื่อช่างที่รับงาน
    </div>
  </div>
</div>

<!-- STEP 5 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 5 &#8212; เมนู "งานของฉัน" (My Tasks)</div>
  <div class="step-card">
    <h4>&#128295; ดูและจัดการใบงานที่รับผิดชอบ</h4>
    <p style="margin-bottom:7px;">แสดงใบงานทั้งหมดที่ช่างรับผิดชอบ กรองแสดงตามขั้นตอนได้</p>
    <div class="filter-bar" style="margin-bottom:10px;">
      <span style="font-size:10.5px;font-weight:600;color:#374151;">กรองตามสถานะ:</span>
      <span class="filter-btn active">&#128203; รับเรื่องแล้ว</span>
      <span class="filter-btn">&#128295; กำลังดำเนินการ</span>
      <span class="filter-btn">&#128077; ซ่อมเสร็จสิ้น</span>
      <span class="filter-btn btn-clear" style="border-color:#94a3b8;">ดูงานทั้งหมด</span>
    </div>
    <ul>
      <li>รายการใบงานจัดกลุ่มตาม <b>อาคาร</b> และ <b>ชั้น</b> เพื่อให้วางแผนเดินสายได้สะดวก</li>
      <li>คลิกที่แถบกรองเพื่อดูเฉพาะงานในสถานะนั้น</li>
      <li>กดปุ่ม <b>"ดูงานทั้งหมด"</b> เพื่อดูใบงานทุกขั้นตอนพร้อมกัน</li>
    </ul>
    <div class="info-box" style="margin-top:8px;">
      &#128161; <b>เคล็ดลับ:</b> จัดกลุ่มตามอาคารช่วยให้ช่างสามารถเดินทำงานได้หลายจุดในรอบเดียว ประหยัดเวลาและแรง
    </div>
  </div>
</div>

<!-- STEP 6 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 6 &#8212; เบิกใช้วัสดุ/อะไหล่จากคลัง (ถ้ามี)</div>
  <div class="step-card">
    <h4>&#128230; 6.1 วิธีเบิกวัสดุ/อะไหล่</h4>
    <ol>
      <li>เปิดรายละเอียดใบงานที่กำลังดำเนินการ</li>
      <li>กดปุ่ม <b>"&#128230; เบิกวัสดุ"</b></li>
      <li>เลือกรายการวัสดุ/อะไหล่จากรายการในคลัง</li>
      <li>ระบุ<b>จำนวน</b>ที่ต้องการเบิก</li>
      <li>กด <b>"ยืนยัน"</b> &#8212; ระบบจะตัดสต็อกอัตโนมัติ</li>
    </ol>
  </div>
  <div class="step-card">
    <h4>&#128202; 6.2 ตัวอย่างบันทึกวัสดุที่ใช้</h4>
    <table class="mat-table">
      <thead>
        <tr><th>#</th><th>รายการวัสดุ</th><th>จำนวน</th><th>ราคาต่อหน่วย</th><th>รวม</th></tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>ท่อน้ำทิ้งแอร์</td><td>1 เมตร</td><td>80 บาท</td><td>80 บาท</td></tr>
        <tr><td>2</td><td>น้ำยาโฟมล้างแอร์</td><td>1 กระป๋อง</td><td>180 บาท</td><td>180 บาท</td></tr>
      </tbody>
    </table>
    <div class="mat-total">รวมทั้งหมด: 260 บาท</div>
  </div>
</div>

<!-- STEP 7 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 7 &#8212; บันทึกผลงาน แนบรูปถ่าย และปิดงาน</div>
  <div class="step-card">
    <h4>&#9989; ขั้นตอนการปิดงาน</h4>
    <ol>
      <li><b>7.1 บันทึกสรุปการแก้ไข</b> &#8212; พิมพ์รายละเอียดการซ่อม เช่น สิ่งที่พบ, วิธีแก้ไข, วัสดุที่ใช้ ในช่อง textarea</li>
      <li><b>7.2 แนบรูปถ่ายหลังซ่อม</b> &#8212; เลือกไฟล์ JPG/PNG จากกล้องมือถือ เพื่อเป็นหลักฐาน</li>
      <li>กดปุ่ม <b>"&#9989; บันทึกปิดงาน (เสร็จสิ้น)"</b></li>
    </ol>
    <div class="success-box" style="margin-top:8px;">
      <b>&#9989; ผลลัพธ์หลังปิดงาน:</b>
      <ul style="margin-top:4px;">
        <li>สถานะใบงานเปลี่ยนเป็น <span class="status status-done">เสร็จสิ้น</span></li>
        <li>ใบงานย้ายไปยังเมนู <b>"ประวัติงานที่ทำเสร็จ"</b></li>
        <li>ผู้แจ้งสามารถดูรูปภาพก่อน-หลังซ่อมได้ทันที</li>
      </ul>
    </div>
  </div>
</div>

<!-- STEP 8 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 8 &#8212; เมนู "ประวัติงานที่ทำเสร็จ"</div>
  <div class="step-card">
    <h4>&#128194; ค้นหาและดูประวัติการซ่อม</h4>
    <div class="filter-bar" style="margin-bottom:8px;">
      <span style="font-size:10.5px;font-weight:600;color:#374151;">กรองตาม:</span>
      <select style="font-size:10.5px;padding:3px 7px;border:1px solid #cbd5e1;border-radius:5px;" disabled><option>ปี พ.ศ. 2568</option></select>
      <select style="font-size:10.5px;padding:3px 7px;border:1px solid #cbd5e1;border-radius:5px;" disabled><option>พฤศจิกายน</option></select>
      <span class="btn-mockup btn-clear" style="font-size:10px;padding:3px 9px;margin:0;">&#10005; ล้างตัวกรอง</span>
    </div>
    <div style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
      <div style="background:#f1f5f9;padding:5px 10px;font-size:10.5px;font-weight:700;color:#374151;border-bottom:1px solid #e2e8f0;">รายการงานที่เสร็จสิ้นแล้ว</div>
      <div class="history-row" style="padding:7px 10px;">
        <span class="hr-no">REP-2026-4132</span>
        <span class="hr-name">ซ่อมเครื่องปรับอากาศน้ำหยด</span>
        <span class="hr-loc">&#128205; SCI-LAB ชั้น 3</span>
        <span class="hr-date">&#9989; 13 พ.ย. 2026</span>
        <span class="btn-mockup btn-primary" style="margin:0;padding:3px 9px;font-size:10px;">ดูรายละเอียด &#9660;</span>
      </div>
      <div class="history-row" style="padding:7px 10px;background:#f8fafc;">
        <span class="hr-no">REP-2026-4098</span>
        <span class="hr-name">ซ่อมหลอดไฟฟ้าขัดข้อง</span>
        <span class="hr-loc">&#128205; อาคาร A ชั้น 2</span>
        <span class="hr-date">&#9989; 10 พ.ย. 2026</span>
        <span class="btn-mockup btn-primary" style="margin:0;padding:3px 9px;font-size:10px;">ดูรายละเอียด &#9660;</span>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px;">
      &#8505;&#65039; กด <b>"ดูรายละเอียด &#9660;"</b> เพื่อขยายดูข้อมูลเต็ม: รูปภาพก่อน-หลังซ่อม, บันทึกช่าง, วัสดุที่ใช้ และงบประมาณ
    </div>
  </div>
</div>

<!-- STEP 9 -->
<div class="section-block">
  <div class="section-title">ขั้นตอนที่ 9 &#8212; จัดการข้อมูลส่วนตัวและรหัสผ่าน</div>
  <div class="step-card">
    <h4>&#128100; ข้อมูลที่แก้ไขได้</h4>
    <div class="form-row"><span class="form-label">ชื่อ-นามสกุล</span><span class="form-input">สมศักดิ์ ช่างเก่ง</span></div>
    <div class="form-row"><span class="form-label">เบอร์มือถือ</span><span class="form-input">081-234-5678</span></div>
    <div class="form-row"><span class="form-label">เบอร์ภายใน</span><span class="form-input">1234</span></div>
    <div class="form-row"><span class="form-label">ความเชี่ยวชาญ</span><span class="form-input">ระบบปรับอากาศ, ไฟฟ้า</span></div>
    <div class="form-row"><span class="form-label">LINE User ID</span><span class="form-input">U95dfeab61af0edf2f718d1d7372eb559</span></div>
    <div style="margin-top:7px;">
      <span class="btn-mockup btn-primary">&#128276; ทดสอบส่งเข้า LINE</span>
      <span class="btn-mockup btn-success">&#128190; บันทึก</span>
    </div>
  </div>
  <div class="step-card">
    <h4>&#128274; การเปลี่ยนรหัสผ่าน</h4>
    <div class="form-row"><span class="form-label">รหัสผ่านเก่า</span><span class="form-input" style="color:#94a3b8;">&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span></div>
    <div class="form-row"><span class="form-label">รหัสผ่านใหม่</span><span class="form-input" style="color:#94a3b8;">&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226; (&#8805; 6 ตัวอักษร)</span></div>
    <div class="form-row"><span class="form-label">ยืนยันรหัสผ่านใหม่</span><span class="form-input" style="color:#94a3b8;">&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span></div>
    <div style="margin-top:7px;"><span class="btn-mockup btn-warn">&#128273; เปลี่ยนรหัสผ่าน</span></div>
    <div class="note-box" style="margin-top:8px;">
      &#9888;&#65039; <b>ข้อควรระวัง:</b> ควรเปลี่ยนรหัสผ่านทุก 3 เดือน และไม่ควรใช้รหัสเดิมซ้ำ
    </div>
  </div>
</div>

<div class="footer">
  <div>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED) | nu-seed-repair-amc.vercel.app | โทร 055-968600</div>
  <div style="margin-top:3px;">พัฒนาโดย: อมรเชษฐ์ รัตนากร (68365934) นิสิตวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร</div>
</div>

</div>
</body>
</html>
"@

if (-not (Test-Path "manuals")) {
    New-Item -ItemType Directory -Path "manuals" | Out-Null
}

$html | Set-Content -Path "manuals\manual_technician.html" -Encoding UTF8
Write-Output "Generated: manuals\manual_technician.html"