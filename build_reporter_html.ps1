# build_reporter_html.ps1
$baseDir = "d:\ฝึกงงาน อุทยาน\AMC_Repair\ระบบแจ้งการซ่อม"
$logoPath = Join-Path $baseDir "nu_seed_logo.png"
$logoBase64 = ""
if (Test-Path $logoPath) {
    $bytes = [System.IO.File]::ReadAllBytes($logoPath)
    $logoBase64 = [System.Convert]::ToBase64String($bytes)
}
$logoSrc = if ($logoBase64) { "data:image/png;base64,$logoBase64" } else { "" }
$logoImg = if ($logoSrc) { "<img src='$logoSrc' alt='NU SEED' style='height:36px; vertical-align:middle; filter:brightness(0) invert(1);'>" } else { "" }

$html = @"
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับผู้แจ้งซ่อม (Reporter Manual)</title>
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
  *, *:before, *:after { box-sizing: border-box; margin: 0; padding: 0; }
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
    background: linear-gradient(135deg, #0b2545 0%, #134074 100%);
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
  }
  .page-header-main .title-box p {
    font-size: 11px;
    color: rgba(255,255,255,0.85);
  }
  .badge-role {
    display: inline-block;
    background: #ea580c;
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
    border-left: 4.5px solid #134074;
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
    color: #134074;
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
    color: #0b2545;
    padding-bottom: 3.5px;
    border-bottom: 2px solid #134074;
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
    background: #134074;
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
    border-left: 4px solid #134074;
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
    color: #134074;
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
    background: #134074;
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
  li strong { color: #0f172a; }
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
  .page-footer-bar b { color: #134074; }
</style>
</head>
<body>

<!-- ============================================================== -->
<!-- หน้า 1: ภาพรวมระบบและการเข้าสู่ระบบ -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-main">
      <div class="title-box">
        <h1>📋 คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับผู้แจ้งซ่อม</h1>
        <p>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED AMC Repair)</p>
      </div>
      <div>$logoImg</div>
      <div style="text-align:right;">
        <span class="badge-role">Reporter Manual</span>
      </div>
    </div>

    <div class="page-body">
      <!-- Section 1 -->
      <div class="section-title">
        <span class="num-badge">1</span>
        <span>ภาพรวมระบบแจ้งซ่อม NU SEED (System Overview)</span>
      </div>

      <div class="card-highlight">
        <div class="card-title">💡 ยินดีต้อนรับสู่ระบบแจ้งการซ่อม AMC Repair</div>
        <p>ระบบแจ้งซ่อมออนไลน์ พัฒนาขึ้นเพื่อให้บริการแก่อาจารย์ เจ้าหน้าที่ นักวิจัย และผู้ใช้อาคารในพื้นที่อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร ให้สามารถแจ้งปัญหาการชำรุดของอุปกรณ์ อาคารสถานที่ ครุภัณฑ์ และระบบสาธารณูปโภคได้อย่างสะดวกรวดเร็ว ตลอด 24 ชั่วโมง</p>
      </div>

      <div class="card">
        <div class="card-title">🌟 จุดเด่นและประโยชน์ของระบบ</div>
        <ul>
          <li><strong>แจ้งซ่อมได้ทันที:</strong> ใช้งานผ่านสมาร์ตโฟน แท็บเล็ต หรือคอมพิวเตอร์ โดยไม่ต้องส่งเอกสารกระดาษ</li>
          <li><strong>แนบรูปภาพประกอบ:</strong> ถ่ายรูปจุดชำรุดแนบในคำร้องได้สูงสุด 4 ภาพ ช่วยให้ช่างเตรียมเครื่องมือตรงจุด</li>
          <li><strong>ติดตามสถานะ Real-time:</strong> ทราบความคืบหน้าทันทีเมื่อช่างรับงานและดำเนินการเสร็จสิ้น</li>
          <li><strong>เก็บบันทึกประวัติ:</strong> ตรวจสอบรายการคำร้องย้อนหลังของตนเองได้ตลอดเวลา</li>
        </ul>
      </div>

      <!-- Section 2 -->
      <div class="section-title" style="margin-top:8px;">
        <span class="num-badge">2</span>
        <span>การเข้าสู่ระบบและการลงทะเบียน (Sign In & Sign Up)</span>
      </div>

      <div class="card">
        <div class="card-title">🔐 การเข้าสู่ระบบ (Sign In) สำหรับผู้มีบัญชีแล้ว</div>
        <ol>
          <li>เปิดเว็บบราวเซอร์ เข้าสู่ระบบที่ลิงก์: <strong>https://nu-seed-repair-amc.vercel.app/</strong></li>
          <li>กรอก <strong>อีเมล (Email)</strong> และ <strong>รหัสผ่าน (Password)</strong> ที่ลงทะเบียนไว้</li>
          <li>กดปุ่ม <strong>"เข้าสู่ระบบ"</strong> เพื่อเข้าใช้งานหน้าหลัก</li>
        </ol>
      </div>

      <div class="card-warning">
        <div class="card-title">📝 การลงทะเบียนผู้ใช้ใหม่ (สำหรับผู้ใช้งานครั้งแรก)</div>
        <p style="margin-bottom:4px;">หากยังไม่มีบัญชีผู้ใช้งาน ให้คลิก <strong>"ลงทะเบียนผู้ใช้ใหม่"</strong> และกรอกข้อมูลให้ครบถ้วน:</p>
        <ul>
          <li><strong>ชื่อ-นามสกุล:</strong> ระบุชื่อจริงและนามสกุลสำหรับติดต่อ</li>
          <li><strong>อีเมล:</strong> ใช้อีเมลสถาบัน (@nu.ac.th) หรืออีเมลส่วนบุคคลที่ใช้งานประจำ</li>
          <li><strong>เบอร์โทรศัพท์มือถือ และ เบอร์โทรภายใน:</strong> สำหรับให้ช่างโทรสอบถามตำแหน่งหรืออาการเสีย</li>
          <li><strong>หน่วยงาน / ส่วนงาน:</strong> เลือกสังกัด เช่น ศูนย์บ่มเพาะวิสาหกิจ, งานบริหารทั่วไป, คณะ/ภาควิชา</li>
          <li><strong>รหัสผ่าน:</strong> กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร แล้วกด <strong>"ยืนยันการลงทะเบียน"</strong></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 1 / 3</b> • คู่มือผู้แจ้งซ่อม</span>
  </div>
</div>

<!-- ============================================================== -->
<!-- หน้า 2: ขั้นตอนการส่งคำร้องแจ้งซ่อม -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-sub">
      <span class="sub-title">📋 ขั้นตอนการแจ้งซ่อมใหม่ (Submit Repair Ticket)</span>
      <span class="sub-tag">NU SEED AMC Repair • ส่วนที่ 2</span>
    </div>

    <div class="page-body">
      <div class="section-title">
        <span class="num-badge">3</span>
        <span>ขั้นตอนการส่งคำร้องแจ้งซ่อม (3 ขั้นตอนง่ายๆ)</span>
      </div>

      <div class="card-highlight">
        <div class="card-title">🚀 เริ่มต้นแจ้งซ่อม</div>
        <p>เมื่อเข้าสู่ระบบแล้ว ให้กดที่เมนู <strong>"➕ แจ้งซ่อมใหม่"</strong> บนแถบเมนูหลัก จากนั้นดำเนินการตาม 3 ขั้นตอนดังนี้:</p>
      </div>

      <div class="steps-grid">
        <div class="step-box">
          <span class="step-num">ขั้นตอนที่ 1</span>
          <h4>ระบุสถานที่และประเภท</h4>
          <p>เลือกอาคาร ชั้น ห้อง หรือบริเวณที่พบปัญหา พร้อมเลือกหมวดหมู่งานซ่อมที่ตรงกับอาการ</p>
        </div>
        <div class="step-box">
          <span class="step-num">ขั้นตอนที่ 2</span>
          <h4>ระบุอาการและแนบรูป</h4>
          <p>อธิบายรายละเอียดอาการเสียให้ชัดเจน และแนบรูปถ่ายของอุปกรณ์ที่ชำรุด (สูงสุด 4 รูป)</p>
        </div>
        <div class="step-box">
          <span class="step-num">ขั้นตอนที่ 3</span>
          <h4>ตรวจสอบและยืนยัน</h4>
          <p>ตรวจสอบข้อมูลสรุปความถูกต้อง แล้วกดส่งคำร้อง ระบบจะออกหมายเลข Ticket ทันที</p>
        </div>
      </div>

      <div class="card" style="margin-top:4px;">
        <div class="card-title">🏢 ข้อมูลสถานที่และหมวดหมู่งานซ่อมที่ต้องระบุ</div>
        <ul>
          <li><strong>สถานที่เกิดเหตุ:</strong> เลือกอาคาร (เช่น อาคารมหาธรรมราชา, อาคารอำนวยการ), ระบุชั้น และหมายเลขห้องให้ชัดเจน</li>
          <li><strong>หมวดหมู่งานซ่อม:</strong>
            <ul style="margin-top:2px;">
              <li>⚡ <strong>ระบบไฟฟ้าและแสงสว่าง:</strong> หลอดไฟดับ, ปลั๊กไฟชำรุด, เบรกเกอร์ตัด, สวิตช์เสีย</li>
              <li>❄️ <strong>เครื่องปรับอากาศ:</strong> แอร์ไม่เย็น, มีน้ำหยด, เสียงดังผิดปกติ, รีโมทเสีย</li>
              <li>🚰 <strong>ระบบประปาและสุขภัณฑ์:</strong> ก๊อกน้ำรั่ว, ท่อตัน, ชักโครกชำรุด, น้ำไม่ไหล</li>
              <li>🪑 <strong>ครุภัณฑ์และเฟอร์นิเจอร์:</strong> โต๊ะ, เก้าอี้, ตู้เอกสาร, บานพับประตู/หน้าต่าง</li>
              <li>🧱 <strong>โครงสร้างอาคาร:</strong> ฝ้าเพดาน, กระเบื้องแตก, ประตูล็อคไม่ได้, ราวบันได</li>
              <li>💻 <strong>ระบบเครือข่าย/อุปกรณ์โสตฯ:</strong> สาย LAN, โปรเจกเตอร์, จอแสดงผล</li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="card-warning">
        <div class="card-title">📸 คำแนะนำในการถ่ายรูปแนบคำร้อง</div>
        <ul>
          <li><strong>ควรถ่าย 2 ระยะ:</strong> ภาพมุมกว้างให้เห็นตำแหน่งที่ตั้งของอุปกรณ์ + ภาพระยะใกล้ให้เห็นจุดชำรุดชัดเจน</li>
          <li><strong>ไฟล์ที่รองรับ:</strong> รองรับภาพถ่าย JPG, PNG ขนาดไม่เกิน 5MB ต่อรูป (แนบได้สูงสุด 4 ภาพ)</li>
          <li><strong>ความสำคัญ:</strong> ภาพถ่ายที่ชัดเจนช่วยให้ช่างประเมินและเบิกอะไหล่เตรียมมาซ่อมได้ทันทีโดยไม่ต้องรอตรวจหน้างานรอบสอง</li>
        </ul>
      </div>

      <div class="card-success">
        <div class="card-title">🎫 หมายเลขคำร้อง (Ticket ID)</div>
        <p>เมื่อกด <strong>"ยืนยันส่งคำร้อง"</strong> สำเร็จ ระบบจะแสดงผลสำเร็จพร้อม <strong>หมายเลข Ticket ID</strong> (เช่น <code>#2026-0085</code>) กรุณาจดจำหรือบันทึกหมายเลขนี้ไว้สำหรับใช้สอบถามหรือติดตามความคืบหน้า</p>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 2 / 3</b> • คู่มือผู้แจ้งซ่อม</span>
  </div>
</div>

<!-- ============================================================== -->
<!-- หน้า 3: การติดตามสถานะและการจัดการบัญชี -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-sub">
      <span class="sub-title">🔍 การติดตามสถานะและการจัดการบัญชี (Tracking & Settings)</span>
      <span class="sub-tag">NU SEED AMC Repair • ส่วนที่ 3</span>
    </div>

    <div class="page-body">
      <!-- Section 4 -->
      <div class="section-title">
        <span class="num-badge">4</span>
        <span>การติดตามสถานะคำร้องซ่อม (Tracking Ticket Status)</span>
      </div>

      <div class="card">
        <div class="card-title">🔎 ดูสถานะงานซ่อมของฉัน</div>
        <p>กดที่เมนู <strong>"📋 ติดตามสถานะ"</strong> ระบบจะแสดงรายการคำร้องซ่อมทั้งหมดที่คุณเคยแจ้งไว้ เรียงจากล่าสุด โดยมีแถบสีบอกสถานะการดำเนินงาน 3 ขั้นตอนดังนี้:</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
        <div class="card" style="border-top:3px solid #f97316;">
          <div style="margin-bottom:3px;"><span class="badge badge-orange">🟠 รับเรื่องแล้ว</span></div>
          <p style="font-size:10px; color:#475569;">คำร้องเข้าสู่ระบบเรียบร้อยแล้ว อยู่ระหว่างผู้ดูแลระบบหรือหัวหน้าช่างตรวจสอบและมอบหมายช่างผู้รับผิดชอบ</p>
        </div>
        <div class="card" style="border-top:3px solid #3b82f6;">
          <div style="margin-bottom:3px;"><span class="badge badge-blue">🔵 กำลังดำเนินการ</span></div>
          <p style="font-size:10px; color:#475569;">ช่างได้รับมอบหมายงานแล้ว และกำลังเข้าตรวจสอบหน้างาน เบิกอะไหล่ หรืออยู่ระหว่างดำเนินการซ่อมแซม</p>
        </div>
        <div class="card" style="border-top:3px solid #22c55e;">
          <div style="margin-bottom:3px;"><span class="badge badge-green">🟢 เสร็จสิ้น</span></div>
          <p style="font-size:10px; color:#475569;">ช่างซ่อมแซมเสร็จสมบูรณ์ ทดสอบการใช้งานเรียบร้อย พร้อมบันทึกผลการซ่อมและรูปถ่ายหลังทำเสร็จ</p>
        </div>
      </div>

      <div class="card-highlight">
        <div class="card-title">📄 การเปิดดูรายละเอียดเชิงลึกของคำร้อง</div>
        <p>คลิกที่การ์ดคำร้องเพื่อเปิดหน้าต่างรายละเอียด จะพบข้อมูล:</p>
        <ul>
          <li><strong>ชื่อช่างผู้รับผิดชอบ:</strong> ทราบชื่อและเบอร์โทรติดต่อของช่างผู้เข้าซ่อม</li>
          <li><strong>บันทึกผลการซ่อม:</strong> รายละเอียดที่ช่างบันทึกไว้ เช่น สาเหตุของปัญหา, อะไหล่ที่เปลี่ยน</li>
          <li><strong>รูปภาพเปรียบเทียบ:</strong> ดูรูปถ่ายก่อนซ่อมและรูปถ่ายหลังซ่อมเสร็จสิ้น</li>
        </ul>
      </div>

      <!-- Section 5 -->
      <div class="section-title" style="margin-top:6px;">
        <span class="num-badge">5</span>
        <span>การจัดการข้อมูลส่วนตัวและการติดต่อขอความช่วยเหลือ</span>
      </div>

      <div class="card">
        <div class="card-title">👤 ข้อมูลส่วนตัว (Profile Management)</div>
        <p>กดที่ไอคอนโปรไฟล์หรือชื่อของคุณมุมบนขวา เพื่อตรวจสอบและปรับปรุงข้อมูล:</p>
        <ul>
          <li><strong>แก้ไขเบอร์โทรศัพท์:</strong> อัปเดตเบอร์โทรศัพท์มือถือและเบอร์โทรภายในให้เป็นปัจจุบันอยู่เสมอ</li>
          <li><strong>เปลี่ยนรหัสผ่าน:</strong> กำหนดรหัสผ่านใหม่ได้ทันทีเพื่อความปลอดภัยของบัญชี</li>
        </ul>
      </div>

      <div class="card-success">
        <div class="card-title">📞 ติดต่อฝ่ายสนับสนุนระบบและงานอาคารสถานที่</div>
        <p>หากพบเหตุฉุกเฉินเร่งด่วน (เช่น ท่อน้ำหลักแตก, ไฟฟ้าลัดวงจร) หรือพบปัญหาการใช้งานระบบ:</p>
        <ul>
          <li><strong>หน่วยงาน:</strong> งานอาคารสถานที่และยานพาหนะ อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร</li>
          <li><strong>โทรศัพท์ภายใน:</strong> 0-5596-xxxx ต่อ 101-104 | <strong>สายด่วนฉุกเฉิน:</strong> 08x-xxx-xxxx</li>
          <li><strong>อีเมลแจ้งปัญหา:</strong> amc-repair@nu.ac.th</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 3 / 3</b> • คู่มือผู้แจ้งซ่อม</span>
  </div>
</div>

</body>
</html>
"@

$outHtml = Join-Path $baseDir "manuals\manual_reporter.html"
[System.IO.File]::WriteAllText($outHtml, $html, [System.Text.Encoding]::UTF8)
Write-Output "Successfully generated: manuals\manual_reporter.html"
