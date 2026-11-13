# build_technician_html.ps1
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
<title>คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับช่างซ่อมบำรุง (Technician Manual)</title>
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
    background: linear-gradient(135deg, #0b2545 0%, #0284c7 100%);
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
    background: #0284c7;
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
    border-left: 4.5px solid #0284c7;
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
    color: #0284c7;
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
    border-bottom: 2px solid #0284c7;
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
    background: #0284c7;
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
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-left: 4px solid #0284c7;
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
    color: #0369a1;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
    margin-top: 3px;
  }
  .step-box {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
    text-align: left;
  }
  .step-num {
    display: inline-block;
    background: #0284c7;
    color: #fff;
    font-weight: 800;
    font-size: 9.5px;
    padding: 1px 6px;
    border-radius: 10px;
    margin-bottom: 4px;
  }
  .step-box h4 {
    font-size: 10.5px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
  }
  .step-box p {
    font-size: 9.5px;
    color: #475569;
    line-height: 1.35;
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
  .code-box {
    background: #0f172a;
    color: #38bdf8;
    padding: 5px 9px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 10.5px;
    display: inline-block;
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
  .page-footer-bar b { color: #0284c7; }
</style>
</head>
<body>

<!-- ============================================================== -->
<!-- หน้า 1: บทบาทหน้าที่และการผูก LINE แจ้งเตือน -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-main">
      <div class="title-box">
        <h1>🛠️ คู่มือการใช้งานระบบแจ้งซ่อม — สำหรับช่างซ่อมบำรุง</h1>
        <p>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED AMC Repair)</p>
      </div>
      <div>$logoImg</div>
      <div style="text-align:right;">
        <span class="badge-role">Technician Manual</span>
      </div>
    </div>

    <div class="page-body">
      <!-- Section 1 -->
      <div class="section-title">
        <span class="num-badge">1</span>
        <span>บทบาทและหน้าที่ของช่างซ่อมบำรุง (Technician Role Overview)</span>
      </div>

      <div class="card-highlight">
        <div class="card-title">🔧 หน้าที่หลักของช่างในระบบ AMC Repair</div>
        <p>ช่างเทคนิคมีบทบาทสำคัญในการดูแลรักษาอาคารสถานที่และระบบสาธารณูปโภค โดยระบบนี้ออกแบบมาเพื่อช่วยให้ช่างทำงานได้อย่างมีประสิทธิภาพ:</p>
        <ul>
          <li><strong>รับแจ้งเตือนงานทันทีผ่าน LINE:</strong> ไม่พลาดทุกงานซ่อมที่ได้รับมอบหมาย ทราบสถานที่และอาการเสียทันที</li>
          <li><strong>จัดการใบงานผ่านมือถือ:</strong> ตรวจสอบรายละเอียด ถ่ายรูปผลงานก่อน-หลัง และกดอัปเดตสถานะได้หน้างานจริง</li>
          <li><strong>เบิกใช้อะไหล่สะดวก:</strong> บันทึกตัดสต็อกอะไหล่ที่ใช้จริงได้อย่างแม่นยำ</li>
        </ul>
      </div>

      <!-- Section 2 -->
      <div class="section-title" style="margin-top:6px;">
        <span class="num-badge">2</span>
        <span>การผูก LINE User ID เพื่อรับการแจ้งเตือนงานซ่อม (สำคัญที่สุด ⭐)</span>
      </div>

      <div class="card-warning">
        <div class="card-title">⚡ ทำไมช่างทุกคนต้องผูก LINE User ID?</div>
        <p>เมื่อผู้ดูแลระบบมอบหมายงานซ่อม ระบบจะส่งข้อความแจ้งเตือนเข้าแอป LINE บนมือถือของช่างโดยอัตโนมัติทันที พร้อมปุ่มกดเปิดดูงาน หากไม่ได้ผูกรหัสนี้ ช่างจะไม่ได้รับการแจ้งเตือนงานใหม่ทาง LINE</p>
      </div>

      <div class="card">
        <div class="card-title">📱 3 ขั้นตอนง่ายๆ ในการรับรหัส LINE User ID และเชื่อมต่อเข้าระบบ</div>
        <ol>
          <li><strong>เพิ่มเพื่อนกับ LINE Official Account ของระบบ:</strong> สแกน QR Code หรือเพิ่มเพื่อนกับบอทแจ้งซ่อม NU SEED</li>
          <li><strong>ทักทายบอทเพื่อรับรหัส:</strong> เปิดแชทแล้วพิมพ์คำว่า <span class="code-box">id</span> หรือส่งข้อความใดๆ บอทจะตอบกลับเป็นรหัส User ID ประจำตัวของคุณทันที (รหัสขึ้นต้นด้วยตัว <strong>U</strong> เช่น <code>U89a0b1c2d3e4f5...</code>)</li>
          <li><strong>บันทึกรหัสลงในระบบ:</strong>
            <ul style="margin-top:2px;">
              <li>เข้าสู่ระบบ -> ไปที่เมนู <strong>"ข้อมูลส่วนตัว"</strong> ด้านบนขวา</li>
              <li>วางรหัสที่ได้ลงในช่อง <strong>"🟢 LINE User ID สำหรับรับแจ้งเตือน"</strong></li>
              <li>กดปุ่ม <strong>"บันทึกข้อมูลส่วนตัว"</strong> เพื่อยืนยัน (หรือแจ้งแอดมินให้ช่วยบันทึกให้)</li>
            </ul>
          </li>
        </ol>
      </div>

      <div class="card-success">
        <div class="card-title">🔔 การทดสอบการแจ้งเตือน</div>
        <p>หลังจากบันทึกแล้ว ในหน้าจัดการข้อมูลส่วนตัวสามารถกดปุ่ม <strong>"🔔 ทดสอบส่ง LINE"</strong> เพื่อยืนยันว่าระบบสามารถส่งข้อความเข้ามือถือของคุณได้ถูกต้องเรียบร้อย</p>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 1 / 3</b> • คู่มือช่างซ่อมบำรุง</span>
  </div>
</div>

<!-- ============================================================== -->
<!-- หน้า 2: การรับงาน ดำเนินการ และปิดงานซ่อม -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-sub">
      <span class="sub-title">📋 การรับงาน ดำเนินงาน และบันทึกผลการซ่อม (Job Handling Workflow)</span>
      <span class="sub-tag">NU SEED AMC Repair • ส่วนที่ 2</span>
    </div>

    <div class="page-body">
      <div class="section-title">
        <span class="num-badge">3</span>
        <span>ขั้นตอนการปฏิบัติงานซ่อมบำรุง (4 ขั้นตอนหลัก)</span>
      </div>

      <div class="card-highlight">
        <div class="card-title">📲 แดชบอร์ดโต๊ะทำงานของช่าง (Technician Workbench)</div>
        <p>เมื่อเข้าสู่ระบบด้วยบัญชีช่าง ระบบจะนำเข้าสู่หน้าโต๊ะทำงานช่างทันที แสดงรายการงานทั้งหมดที่ได้รับมอบหมาย โดยแบ่งเป็น 4 ขั้นตอน:</p>
      </div>

      <div class="steps-grid">
        <div class="step-box">
          <span class="step-num">ขั้นตอน 1</span>
          <h4>ตรวจสอบงานที่ได้รับ</h4>
          <p>ตรวจดูอาคาร ห้อง อาการเสีย ความเร่งด่วน และรูปถ่ายที่ผู้แจ้งแนบมา</p>
        </div>
        <div class="step-box">
          <span class="step-num">ขั้นตอน 2</span>
          <h4>กดรับงานซ่อม</h4>
          <p>กดปุ่ม "รับงาน / กำลังดำเนินการ" เพื่อแจ้งผู้แจ้งและแอดมินว่าเริ่มเข้าทำ</p>
        </div>
        <div class="step-box">
          <span class="step-num">ขั้นตอน 3</span>
          <h4>ลงมือซ่อมและถ่ายรูป</h4>
          <p>เข้าแก้ไขปัญหาตามมาตรฐานความปลอดภัย และถ่ายภาพผลงานหลังทำเสร็จ</p>
        </div>
        <div class="step-box">
          <span class="step-num">ขั้นตอน 4</span>
          <h4>บันทึกผลและปิดงาน</h4>
          <p>ระบุสาเหตุ บันทึกอะไหล่ที่ใช้ และกดปุ่ม "เสร็จสิ้นงานซ่อม"</p>
        </div>
      </div>

      <div class="card" style="margin-top:4px;">
        <div class="card-title">📝 รายละเอียดการบันทึกผลการซ่อม (Work Notes & Evidence)</div>
        <p style="margin-bottom:3px;">เมื่อดำเนินการซ่อมเสร็จสิ้น ให้กดที่คำร้องและกรอกข้อมูลในกล่อง <strong>"บันทึกผลการปฏิบัติงาน"</strong>:</p>
        <ul>
          <li><strong>สาเหตุของปัญหา (Root Cause):</strong> ระบุสาเหตุที่แท้จริง เช่น สายไฟหลวม, สวิตช์หมดอายุการใช้งาน, ท่ออุดตันจากเศษวัสดุ</li>
          <li><strong>วิธีการแก้ไข (Action Taken):</strong> อธิบายสิ่งที่ได้ทำ เช่น เดินสายไฟใหม่, เปลี่ยนลูกลอยชักโครก, ล้างแผงคอยล์เย็น</li>
          <li><strong>แนบภาพถ่ายหลังซ่อม (After Photo):</strong> ควรถ่ายภาพอุปกรณ์หลังซ่อมเสร็จเพื่อเป็นหลักฐานยืนยันความเรียบร้อย</li>
        </ul>
      </div>

      <div class="card-success">
        <div class="card-title">✅ การปิดงาน (Status Transition to Done)</div>
        <p>เมื่อตรวจสอบความเรียบร้อยและทดสอบการทำงานแล้ว ให้เลือกเปลี่ยนสถานะเป็น <strong>"🟢 เสร็จสิ้น (Resolved)"</strong> ระบบจะบันทึกเวลาที่ซ่อมเสร็จ และส่งการแจ้งเตือนไปยังผู้แจ้งซ่อมว่างานเสร็จสิ้นเรียบร้อย</p>
      </div>

      <div class="card-warning">
        <div class="card-title">⚠️ กรณียังไม่สามารถซ่อมให้เสร็จได้ในทันที</div>
        <ul>
          <li><strong>รออะไหล่:</strong> หากต้องรอจัดซื้ออะไหล่ ให้ระบุในหมายเหตุว่า "รออะไหล่..." เพื่อให้ผู้แจ้งและแอดมินรับทราบ</li>
          <li><strong>ประสานผู้รับเหมาภายนอก:</strong> หากเป็นงานขนาดใหญ่ ให้รายงานต่อผู้ดูแลระบบเพื่อทำเรื่องส่งต่อ</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 2 / 3</b> • คู่มือช่างซ่อมบำรุง</span>
  </div>
</div>

<!-- ============================================================== -->
<!-- หน้า 3: การเบิกอะไหล่ สถิติ และความปลอดภัย -->
<!-- ============================================================== -->
<div class="manual-page">
  <div>
    <div class="page-header-sub">
      <span class="sub-title">📦 การจัดการอะไหล่ สถิติผลงาน และความปลอดภัย (Parts & Safety)</span>
      <span class="sub-tag">NU SEED AMC Repair • ส่วนที่ 3</span>
    </div>

    <div class="page-body">
      <!-- Section 4 -->
      <div class="section-title">
        <span class="num-badge">4</span>
        <span>การเบิกใช้อะไหล่และอุปกรณ์ (Parts Requisition)</span>
      </div>

      <div class="card">
        <div class="card-title">📦 ขั้นตอนการบันทึกเบิกใช้อะไหล่ในใบงาน</div>
        <ol>
          <li>ในหน้าต่างรายละเอียดงานซ่อม ให้เลื่อนลงมาที่ส่วน <strong>"เบิกใช้อะไหล่ / อุปกรณ์"</strong></li>
          <li>คลิกเลือกรายการอะไหล่จากคลังสต็อก (เช่น หลอดไฟ LED T8 18W, ท่อ PVC 1/2 นิ้ว, เทปพันสายไฟ)</li>
          <li>ระบุจำนวนชิ้นที่เบิกใช้จริง แล้วกดปุ่ม <strong>"บันทึกการเบิกอะไหล่"</strong></li>
          <li>ระบบจะตัดสต็อกคงเหลือในคลังพัสดุอัตโนมัติ และแสดงรายการอะไหล่ที่ใช้แนบไว้ในรายงานของคำร้องนั้น</li>
        </ol>
      </div>

      <!-- Section 5 -->
      <div class="section-title" style="margin-top:4px;">
        <span class="num-badge">5</span>
        <span>การดูสถิติผลงานและประวัติงานซ่อม (Technician Stats & History)</span>
      </div>

      <div class="card-highlight">
        <div class="card-title">📊 ตัวชี้วัดผลการทำงานส่วนบุคคล</div>
        <p>บนแดชบอร์ดช่างจะแสดงการ์ดสรุปผลงานของคุณแบบ Real-time:</p>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:5px;">
          <div class="card" style="text-align:center; padding:7px;">
            <div style="font-size:16px; font-weight:800; color:#0284c7;">งานในมือ</div>
            <div style="font-size:9.5px; color:#64748b;">กำลังดำเนินการ</div>
          </div>
          <div class="card" style="text-align:center; padding:7px;">
            <div style="font-size:16px; font-weight:800; color:#16a34a;">งานที่สำเร็จ</div>
            <div style="font-size:9.5px; color:#64748b;">ปิดงานเรียบร้อยแล้ว</div>
          </div>
          <div class="card" style="text-align:center; padding:7px;">
            <div style="font-size:16px; font-weight:800; color:#d97706;">คะแนนประเมิน</div>
            <div style="font-size:9.5px; color:#64748b;">ความพึงพอใจเฉลี่ย</div>
          </div>
        </div>
      </div>

      <!-- Section 6 -->
      <div class="section-title" style="margin-top:4px;">
        <span class="num-badge">6</span>
        <span>มาตรฐานความปลอดภัยในการปฏิบัติงาน (Safety First ⚠️)</span>
      </div>

      <div class="card-warning">
        <div class="card-title">🚨 กฎเหล็กด้านความปลอดภัยที่ต้องปฏิบัติตามอย่างเคร่งครัด</div>
        <ul>
          <li><strong>ตัดระบบพลังงานก่อนเริ่มซ่อม (LOTO):</strong> ปลดคัตเอาต์/เบรกเกอร์ไฟฟ้า หรือปิดวาล์วน้ำหลักทุกครั้ง และแขวนป้ายเตือน</li>
          <li><strong>สวมอุปกรณ์คุ้มครองความปลอดภัย (PPE):</strong> สวมถุงมือฉนวน, แว่นตานิรภัย, รองเท้าหัวเหล็ก/กันลื่นตามประเภทงาน</li>
          <li><strong>การทำงานบนที่สูง:</strong> ใช้บันไดที่ได้มาตรฐาน มีผู้ช่วยจับฐาน และสวมเข็มขัดนิรภัยเมื่อทำงานสูงเกิน 2 เมตร</li>
          <li><strong>ตรวจสอบความเรียบร้อย:</strong> ทดสอบระบบไฟฟ้า/ประปาหลังซ่อมเสร็จ และทำความสะอาดเก็บกวาดเศษวัสดุก่อนส่งมอบงาน</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="page-footer-bar">
    <span>ระบบแจ้งการซ่อมบำรุง อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร (NU SEED)</span>
    <span><b>หน้า 3 / 3</b> • คู่มือช่างซ่อมบำรุง</span>
  </div>
</div>

</body>
</html>
"@

$outHtml = Join-Path $baseDir "manuals\manual_technician.html"
[System.IO.File]::WriteAllText($outHtml, $html, [System.Text.Encoding]::UTF8)
Write-Output "Successfully generated: manuals\manual_technician.html"
