# build_admin_html.ps1
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
<title>คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับผู้ดูแลระบบ (Administrator Manual)</title>
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
    background: linear-gradient(135deg, #0b2545 0%, #1e1b4b 100%);
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
    background: #d97706;
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
    border-left: 4.5px solid #d97706;
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
    color: #0b2545;
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
    border-bottom: 2px solid #d97706;
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
    background: #d97706;
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
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-left: 4px solid #d97706;
    border-radius: 8px;
    padding: 9px 12px;
  }
  .card-warning {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-left: 4px solid #e11d48;
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
    color: #92400e;
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
    background: #d97706;
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
    background: #0b2545;
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
  .page-footer-bar b { color: #d97706; }
</style>
</head>
<body>

<!-- ============================================================== -->
<!-- หน้า 1: ภาพรวมระบบ แดชบอร์ด และการจัดการคำร้อง -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-main">
      <div class="title-box">
        <h1>🛡️ คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับผู้ดูแลระบบ</h1>
        <p>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED AMC Repair)</p>
      </div>
      <div>$logoImg</div>
      <div style="text-align:right;">
        <span class="badge-role">Administrator Manual</span>
      </div>
    </div>

    <div class="page-body">
      <!-- Section 1 -->
      <div class="section-title">
        <span class="num-badge">1</span>
        <span>แดชบอร์ดภาพรวมระบบและสถิติ KPI (Admin Analytics Dashboard)</span>
      </div>

      <div class="card-highlight">
        <div class="card-title">📊 ศูนย์ควบคุมภาพรวม (Operational Dashboard)</div>
        <p>เมื่อผู้ดูแลระบบเข้าสู่ระบบ จะพบกับหน้าภาพรวมสถิติคำร้องซ่อมทั้งหมดแบบ Real-time ช่วยให้เห็นสถานะการทำงานในภาพรวมและบริหารจัดการทรัพยากรได้อย่างทันท่วงที:</p>
      </div>

      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-val" style="color:#0b2545;">128</div>
          <div class="kpi-lbl">คำร้องทั้งหมด (สะสม)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color:#ea580c;">12</div>
          <div class="kpi-lbl">🟠 รับเรื่องแล้ว (รอช่าง)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color:#0284c7;">18</div>
          <div class="kpi-lbl">🔵 กำลังดำเนินการ</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color:#16a34a;">98</div>
          <div class="kpi-lbl">🟢 เสร็จสิ้น (76.5%)</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📈 กราฟวิเคราะห์และสรุปแนวโน้ม (Analytical Charts)</div>
        <ul>
          <li><strong>Top 5 หมวดหมู่งานซ่อมที่พบบ่อย:</strong> วิเคราะห์จุดที่มีการชำรุดซ้ำซาก เช่น หลอดไฟ, แอร์, ก๊อกน้ำ เพื่อวางแผนซ่อมบำรุงเชิงป้องกัน (PM)</li>
          <li><strong>ปริมาณงานแยกตามอาคาร:</strong> เปรียบเทียบจำนวนคำร้องระหว่างอาคารมหาธรรมราชา และอาคารอื่นๆ ในพื้นที่</li>
          <li><strong>ระยะเวลาเฉลี่ยในการปิดงาน (Mean Time to Repair - MTTR):</strong> ติดตามประสิทธิภาพการให้บริการของทีมช่าง</li>
        </ul>
      </div>

      <!-- Section 2 -->
      <div class="section-title" style="margin-top:6px;">
        <span class="num-badge">2</span>
        <span>การตรวจสอบและกรองรายการคำร้องซ่อม (All Tickets Control)</span>
      </div>

      <div class="card">
        <div class="card-title">🔍 ตัวกรองและค้นหาคำร้องขั้นสูง (Smart Filtering & Search)</div>
        <p>ในแท็บ <strong>"คำร้องทั้งหมด"</strong> แอดมินสามารถค้นหาและจัดเรียงข้อมูลได้อย่างยืดหยุ่น:</p>
        <ul>
          <li><strong>ค้นหาด้วยคำสำคัญ:</strong> ค้นหาด้วยหมายเลข Ticket ID, ชื่อผู้แจ้ง, อาคาร, หรือคำค้นในอาการเสีย</li>
          <li><strong>ตัวกรองสถานะ:</strong> เลือกดูเฉพาะงานที่ค้างรอมอบหมาย (รับเรื่องแล้ว) หรืองานที่กำลังทำ</li>
          <li><strong>ตัวกรองตามช่าง:</strong> คัดกรองดูว่าช่างแต่ละคนกำลังถือครองงานอยู่กี่รายการ</li>
          <li><strong>พิมพ์ใบสั่งงาน (Print Job Sheet):</strong> กดพิมพ์รายละเอียดคำร้องออกมาเป็นเอกสารสำหรับการปฏิบัติงานนอกสถานที่</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 1 / 3</b> • คู่มือผู้ดูแลระบบ</span>
  </div>
</div>

<!-- ============================================================== -->
<!-- หน้า 2: การมอบหมายงานและการควบคุมสต็อกอะไหล่ -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-sub">
      <span class="sub-title">👨‍🔧 การมอบหมายงานช่าง และการบริหารคลังอะไหล่ (Dispatch & Stock)</span>
      <span class="sub-tag">NU SEED AMC Repair • ส่วนที่ 2</span>
    </div>

    <div class="page-body">
      <!-- Section 3 -->
      <div class="section-title">
        <span class="num-badge">3</span>
        <span>ขั้นตอนการมอบหมายงานให้ช่างซ่อมบำรุง (Task Assignment & LINE Dispatch)</span>
      </div>

      <div class="card-highlight">
        <div class="card-title">⚡ การกระจายงานและแจ้งเตือนผ่าน LINE ทันที</div>
        <p>ระบบเชื่อมโยงระหว่างการมอบหมายงานของแอดมินและการส่ง LINE Notification อัตโนมัติไปยังช่างผู้รับผิดชอบ:</p>
      </div>

      <div class="steps-grid">
        <div class="step-box">
          <span class="step-num">ขั้นตอน 1</span>
          <h4>กดปุ่มมอบหมายงาน</h4>
          <p>ในตารางคำร้อง คลิกปุ่ม "มอบหมายช่าง" หรือกดแก้ไขที่การ์ดคำร้อง</p>
        </div>
        <div class="step-box">
          <span class="step-num">ขั้นตอน 2</span>
          <h4>เลือกช่างผู้รับผิดชอบ</h4>
          <p>ตรวจสอบความเชี่ยวชาญ (ไฟฟ้า, แอร์, ประปา) และจำนวนงานที่ช่างถืออยู่</p>
        </div>
        <div class="step-box">
          <span class="step-num">ขั้นตอน 3</span>
          <h4>ระบบส่ง LINE ทันที</h4>
          <p>กดยืนยัน ระบบจะส่งข้อความแจ้งเตือนเข้าแอป LINE ของช่างคนนั้นทันที</p>
        </div>
      </div>

      <div class="card" style="margin-top:4px;">
        <div class="card-title">🔄 การโอนย้ายงานหรือเปลี่ยนตัวช่าง</div>
        <p>หากช่างติดภารกิจอื่น หรือจำเป็นต้องส่งต่อให้ช่างผู้มีความเชี่ยวชาญเฉพาะทาง:</p>
        <ul>
          <li>เปิดหน้าต่างคำร้องซ่อม -> เลือกเปลี่ยนชื่อช่างในช่อง "ช่างผู้รับผิดชอบ" -> กดยืนยัน</li>
          <li>ระบบจะบันทึกประวัติการเปลี่ยนตัวช่าง และส่ง LINE แจ้งเตือนไปยังช่างคนใหม่โดยอัตโนมัติ</li>
        </ul>
      </div>

      <!-- Section 4 -->
      <div class="section-title" style="margin-top:6px;">
        <span class="num-badge">4</span>
        <span>การบริหารคลังอะไหล่และอุปกรณ์ (Stock & Inventory Control)</span>
      </div>

      <div class="card">
        <div class="card-title">📦 จัดการรายการอะไหล่ในแท็บ "คลังอะไหล่"</div>
        <ul>
          <li><strong>เพิ่มรายการอะไหล่ใหม่:</strong> ระบุชื่ออะไหล่, รหัสพัสดุ, หมวดหมู่, จำนวนคงเหลือ และจุดสั่งซื้อขั้นต่ำ (Min Stock)</li>
          <li><strong>การรับของเข้าคลัง (Stock In):</strong> บันทึกจำนวนเมื่อมีการจัดซื้อพัสดุใหม่เข้ามา</li>
          <li><strong>การตัดสต็อกอัตโนมัติ:</strong> เมื่อช่างบันทึกเบิกใช้อะไหล่ในใบงาน ระบบจะหักยอดคงเหลือทันทีแบบ Real-time</li>
        </ul>
      </div>

      <div class="card-warning">
        <div class="card-title">⚠️ ระบบแจ้งเตือนอะไหล่ใกล้หมด (Low Stock Alert)</div>
        <p>เมื่อยอดคงเหลือของอะไหล่ลดลงจนต่ำกว่าค่า <strong>จุดสั่งซื้อขั้นต่ำ (Safety Stock)</strong> ระบบจะแสดงแถบสีแดงแจ้งเตือนหน้าแดชบอร์ด เพื่อให้เจ้าหน้าที่จัดซื้อดำเนินการสั่งซื้อล่วงหน้า ป้องกันปัญหางานซ่อมหยุดชะงัก</p>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 2 / 3</b> • คู่มือผู้ดูแลระบบ</span>
  </div>
</div>

<!-- ============================================================== -->
<!-- หน้า 3: การจัดการบุคลากรและการออกรายงาน -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-sub">
      <span class="sub-title">👥 การจัดการบุคลากร และการออกรายงาน (Staff & Export Reports)</span>
      <span class="sub-tag">NU SEED AMC Repair • ส่วนที่ 3</span>
    </div>

    <div class="page-body">
      <!-- Section 5 -->
      <div class="section-title">
        <span class="num-badge">5</span>
        <span>การจัดการบัญชีผู้ใช้งานและเจ้าหน้าที่ช่าง (Staff & User Management)</span>
      </div>

      <div class="card">
        <div class="card-title">👤 การจัดการบัญชีในแท็บ "จัดการบุคลากร"</div>
        <p style="margin-bottom:3px;">ผู้ดูแลระบบสามารถตรวจสอบและจัดการบัญชีผู้ใช้ทุกคนในระบบได้อย่างสมบูรณ์:</p>
        <ul>
          <li><strong>ตรวจสอบสถานะ LINE:</strong> ตรวจดูสัญลักษณ์ <code>🟢 ผูก LINE แล้ว</code> หรือ <code>⚪ ยังไม่ผูก LINE</code> หากช่างยังไม่ผูก ให้ช่วยนำ LINE User ID มากรอกเพื่อเปิดรับแจ้งเตือน</li>
          <li><strong>กำหนดบทบาทและความเชี่ยวชาญ:</strong> ปรับเปลี่ยนบทบาทระหว่าง ช่างซ่อมบำรุง, แอดมิน หรือผู้แจ้งซ่อม พร้อมระบุความชำนาญเฉพาะทาง (เช่น ไฟฟ้า, เครื่องกล, ประปา)</li>
          <li><strong>รีเซ็ตรหัสผ่านโดยตรง (Admin Direct Password Reset):</strong> หากผู้ใช้ลืมรหัสผ่าน แอดมินสามารถเปิดหน้าแก้ไขบัญชี แล้วกดปุ่ม <strong>"🎲 สุ่มรหัสผ่าน"</strong> (เช่น <code>Seed4821</code>) และกดบันทึกเพื่อแจ้งรหัสใหม่ให้ผู้ใช้ล็อกอินได้ทันที</li>
        </ul>
      </div>

      <!-- Section 6 -->
      <div class="section-title" style="margin-top:6px;">
        <span class="num-badge">6</span>
        <span>การออกรายงานสรุปและการส่งออกข้อมูล (Export Reports)</span>
      </div>

      <div class="card-highlight">
        <div class="card-title">📑 การส่งออกข้อมูลสำหรับรายงานและประเมินผล (Excel / CSV)</div>
        <p>แอดมินสามารถดาวน์โหลดข้อมูลประวัติการซ่อมทั้งหมดออกมาในรูปแบบไฟล์ <strong>Excel (.xlsx)</strong> หรือ <strong>CSV</strong> เพื่อนำไปใช้ประกอบรายงานประจำเดือน เสนอผู้บริหาร หรือวิเคราะห์ต้นทุนการซ่อมบำรุง:</p>
        <ul>
          <li><strong>รายงานปริมาณงานซ่อม:</strong> สรุปยอดงานเข้า งานเสร็จ และงานค้างส่งตามช่วงเวลา</li>
          <li><strong>รายงานการใช้อะไหล่:</strong> รายละเอียดจำนวนและมูลค่าของวัสดุอุปกรณ์ที่ใช้ไปในแต่ละหมวดงาน</li>
          <li><strong>รายงานผลการประเมินความพึงพอใจ:</strong> คะแนนและข้อเสนอแนะจากผู้รับบริการ</li>
        </ul>
      </div>

      <div class="card-success">
        <div class="card-title">🔒 นโยบายความมั่นคงปลอดภัยและการสำรองข้อมูล (Security & Backup)</div>
        <ul>
          <li>ระบบจัดเก็บฐานข้อมูลบน Cloud Database พร้อมการเข้ารหัสข้อมูล (Encryption at Rest & in Transit)</li>
          <li>มีการสำรองฐานข้อมูลอัตโนมัติเป็นประจำทุกวัน เพื่อรับประกันความต่อเนื่องในการให้บริการ</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 3 / 3</b> • คู่มือผู้ดูแลระบบ</span>
  </div>
</div>

</body>
</html>
"@

$outHtml = Join-Path $baseDir "manuals\manual_admin.html"
[System.IO.File]::WriteAllText($outHtml, $html, [System.Text.Encoding]::UTF8)
Write-Output "Successfully generated: manuals\manual_admin.html"
