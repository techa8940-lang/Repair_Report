// ==========================================================================
// user_views.js - Views for Reporter / User (Screen 1 & Screen 2)
// ==========================================================================

let reportStep = 1;

const REPAIR_SUBTYPES = [
  'ระบบปรับอากาศ',
  'เครื่องจักร',
  'ระบบไฟฟ้ากำลัง',
  'ระบบแสงสว่าง',
  'ระบบประปา',
  'ระบบ Internet',
  'ระบบน้ำบริสุทธิ์ (DI)',
  'ฝ้าเพดาน',
  'ประตู',
  'หน้าต่าง',
  'ห้องน้ำ',
  'พื้น',
  'อื่นๆ'
];

const INSTALL_SUBTYPES = [
  'ติดตั้งเครื่องจักร',
  'ติดตั้งระบบไฟฟ้ากำลัง',
  'ติดตั้งระบบแสงสว่าง',
  'ติดตั้งระบบประปา',
  'ติดตั้งระบบ Internet',
  'ต่อเติมอาคาร',
  'อื่นๆ'
];

let newReportDraft = {
  cat: 'ซ่อมแซม', // 'ซ่อมแซม' | 'ติดตั้ง/ต่อเติม'
  org: '',
  tel_internal: '',
  tel: '',
  bld: 'อาคาร A',
  bld_other: '',
  flr: '1',
  room: '',
  area: '',
  remark: '',
  sub_type: 'ระบบปรับอากาศ',
  sub_type_other: '',
  title: '',
  details: '',
  asset_no: '',
  priority: 'normal',
  files: []
};

window.resetReportDraft = function() {
  selectedFilesList = [];
  window.selectedFilesList = selectedFilesList;
  newReportDraft = {
    cat: 'ซ่อมแซม',
    org: '',
    tel_internal: '',
    tel: me?.tel || '',
    bld: 'อาคาร A',
    bld_other: '',
    flr: '1',
    room: '',
    area: '',
    remark: '',
    sub_type: 'ระบบปรับอากาศ',
    sub_type_other: '',
    title: '',
    details: '',
    asset_no: '',
    priority: 'normal',
    files: []
  };
};

window.setReportStep = function(step) {
  reportStep = step;
  render();
};

window.setReportCat = function(c) {
  newReportDraft.cat = c;
  newReportDraft.sub_type = c === 'ซ่อมแซม' ? 'ระบบปรับอากาศ' : 'ติดตั้งเครื่องจักร';
  newReportDraft.sub_type_other = '';
  render();
};

window.setReportBld = function(val) {
  newReportDraft.bld = val;
  if (val !== 'อื่นๆ') {
    newReportDraft.bld_other = '';
  }
  render();
};

window.setReportSubType = function(val) {
  newReportDraft.sub_type = val;
  if (val !== 'อื่นๆ') {
    newReportDraft.sub_type_other = '';
  }
  render();
};

window.updateDraft = function(key, val) {
  newReportDraft[key] = val;
};

// Screen 1: หน้าหลัก (User Dashboard)
function vHome() {
  const myT = (typeof getMyTickets === 'function') ? getMyTickets() : JSON.parse(localStorage.getItem('myT') || '[]');
  
  // Real stats calculation from myT (Matching the reporter's history and real tickets)
  const validList = myT.filter(t => t.status !== 'deleted');
  const totalCount = validList.length;
  const doingCount = validList.filter(t => t.status === 'doing' || t.status === 'checking').length;
  const doneCount = validList.filter(t => t.status === 'done' || t.status === 'closed').length;
  const pendingCount = validList.filter(t => t.status === 'accepted' || t.status === 'pending' || !t.status || (!['doing', 'checking', 'done', 'closed', 'deleted'].includes(t.status))).length;

  // Real recent tickets list (No fake mock tickets)
  const recentTickets = validList.slice(0, 5);

  return `
    <!-- Hero Banner (Screen 1 Top) -->
    <div class="nusp-hero-banner">
      <div class="hero-content">
        <h1>ระบบแจ้งซ่อม</h1>
        <h2>อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร</h2>
        <p>“พร้อมดูแล เพื่อการทำงานที่ต่อเนื่อง รวดเร็ว ปลอดภัย”</p>
      </div>
      <div class="hero-badge-nusp" style="display:flex; align-items:center; gap:12px;">
        <img src="nu_seed_logo.png" alt="NU SEED" style="height:58px; width:auto; object-fit:contain; background:#ffffff; border-radius:10px; padding:3px; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
        <div>
          <b>NU SEED ✦</b>
          <span>Naresuan University<br>Science Park</span>
        </div>
      </div>
    </div>

    <!-- 4 KPI Metric Cards (กดสถานะแต่ละอันจะเด้งไปที่สถานะนั้นในหน้าประวัติการแจ้งซ่อม) -->
    <div class="kpi-grid">
      <div class="kpi-card" onclick="goToHistoryWithFilter('all')" style="cursor:pointer;" title="กดเพื่อดูประวัติแจ้งซ่อมทั้งหมด">
        <div class="kpi-icon-box kpi-icon-blue">🔧</div>
        <div class="kpi-info-box">
          <div class="kpi-label">แจ้งซ่อมทั้งหมด</div>
          <div class="kpi-value-row">
            <span class="kpi-value">${totalCount}</span>
            <span class="kpi-unit">รายการ</span>
          </div>
        </div>
      </div>

      <div class="kpi-card" onclick="goToHistoryWithFilter('doing')" style="cursor:pointer;" title="กดเพื่อดูงานกำลังดำเนินการ">
        <div class="kpi-icon-box kpi-icon-orange">🕒</div>
        <div class="kpi-info-box">
          <div class="kpi-label">กำลังดำเนินการ</div>
          <div class="kpi-value-row">
            <span class="kpi-value">${doingCount}</span>
            <span class="kpi-unit">รายการ</span>
          </div>
        </div>
      </div>

      <div class="kpi-card" onclick="goToHistoryWithFilter('done')" style="cursor:pointer;" title="กดเพื่อดูงานซ่อมเสร็จแล้ว">
        <div class="kpi-icon-box kpi-icon-green">✅</div>
        <div class="kpi-info-box">
          <div class="kpi-label">ซ่อมเสร็จแล้ว</div>
          <div class="kpi-value-row">
            <span class="kpi-value">${doneCount}</span>
            <span class="kpi-unit">รายการ</span>
          </div>
        </div>
      </div>

      <div class="kpi-card" onclick="goToHistoryWithFilter('pending')" style="cursor:pointer;" title="กดเพื่อดูงานรอดำเนินการ">
        <div class="kpi-icon-box kpi-icon-red">❗</div>
        <div class="kpi-info-box">
          <div class="kpi-label">รอดำเนินการ</div>
          <div class="kpi-value-row">
            <span class="kpi-value">${pendingCount}</span>
            <span class="kpi-unit">รายการ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2 Columns: Recent Tickets Table (Left) + Promo Card (Right) -->
    <div class="dashboard-columns">
      <!-- Recent Tickets (Table on Desktop / Card List on Mobile) -->
      <div class="content-card">
        <div class="card-header-row" style="flex-wrap:wrap; gap:8px;">
          <div class="card-header-title" style="font-size:18px; font-weight:800;">
            <span>📢</span> รายการแจ้งซ่อมล่าสุด
          </div>
          <a href="javascript:void(0)" class="card-header-link" onclick="goToHistoryWithFilter('all')" style="font-size:15px; font-weight:700;">ดูประวัติทั้งหมด →</a>
        </div>

        <!-- Desktop Table View -->
        <div class="nusp-table-wrapper desktop-only-table">
          <table class="nusp-table">
            <thead>
              <tr>
                <th>เลขที่ใบแจ้งซ่อม</th>
                <th>หัวข้อปัญหา</th>
                <th>ประเภท</th>
                <th>สถานะ</th>
                <th>วันที่แจ้ง</th>
              </tr>
            </thead>
            <tbody>
              ${recentTickets.length ? recentTickets.map(t => {
                let badge = '<span class="badge badge-pending"><span class="badge-dot"></span> รอดำเนินการ</span>';
                if (t.status === 'doing') {
                  const pTag = t.tag || t.note?.match(/^\[(.*?)\]/)?.[1] || '';
                  if (pTag.includes('รออุปกรณ์') || pTag.includes('อะไหล่')) badge = '<span class="badge badge-waiting-parts"><span class="badge-dot"></span> ⏳ รออุปกรณ์</span>';
                  else if (pTag.includes('ตรวจสอบ')) badge = '<span class="badge badge-inspecting"><span class="badge-dot"></span> 🔍 กำลังตรวจสอบ</span>';
                  else if (pTag.includes('ติดปัญหา') || pTag.includes('ประสานงาน')) badge = '<span class="badge badge-issue"><span class="badge-dot"></span> ⚠️ ติดปัญหา</span>';
                  else if (pTag.includes('ติดตั้ง')) badge = '<span class="badge badge-install"><span class="badge-dot"></span> 🛠️ กำลังติดตั้ง</span>';
                  else badge = '<span class="badge badge-doing"><span class="badge-dot"></span> กำลังดำเนินการ</span>';
                }
                if (t.status === 'done') badge = '<span class="badge badge-done"><span class="badge-dot"></span> ' + ((t.done_type === 'ติดตั้ง/ต่อเติม' || t.cat === 'ติดตั้ง/ต่อเติม') ? 'ติดตั้งเสร็จแล้ว' : 'ซ่อมเสร็จแล้ว') + '</span>';
                
                return `
                  <tr onclick="quickTrack('${t.no}', '${t.email || ''}')" style="cursor:pointer;" title="คลิกเพื่อดูรายละเอียด">
                    <td style="font-weight:800; color:var(--primary); font-size:15px; white-space:nowrap;">
                      <span>${esc(t.no)}</span>
                      <button type="button" class="btn-copy-tag" onclick="copyNo('${esc(t.no)}', event)" title="คัดลอกเลขใบแจ้งซ่อม">📋</button>
                    </td>
                    <td style="font-weight:600; font-size:15px;">${esc(t.title || t.no)}</td>
                    <td style="font-size:14px;">${esc(t.type || 'ทั่วไป')}</td>
                    <td>${badge}</td>
                    <td style="color:var(--text-muted); font-size:14px; white-space:nowrap;">${esc(t.date || fmt(t.created_at) || '-')}</td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="5" style="text-align:center; padding:36px; color:var(--text-muted); font-size:16px;">
                    ยังไม่มีรายการแจ้งซ่อม สามารถกด <b>"+ แจ้งซ่อมด่วน"</b> เพื่อเริ่มต้นส่งเรื่องได้ทันที
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List View -->
        <div class="mobile-only-cards" style="display:none; flex-direction:column; gap:12px; margin-top:8px;">
          ${recentTickets.length ? recentTickets.map(t => {
            let badge = '<span class="badge badge-pending"><span class="badge-dot"></span> รอดำเนินการ</span>';
            if (t.status === 'doing') {
              const pTag = t.tag || t.note?.match(/^\[(.*?)\]/)?.[1] || '';
              if (pTag.includes('รออุปกรณ์') || pTag.includes('อะไหล่')) badge = '<span class="badge badge-waiting-parts"><span class="badge-dot"></span> ⏳ รออุปกรณ์</span>';
              else if (pTag.includes('ตรวจสอบ')) badge = '<span class="badge badge-inspecting"><span class="badge-dot"></span> 🔍 กำลังตรวจสอบ</span>';
              else if (pTag.includes('ติดปัญหา') || pTag.includes('ประสานงาน')) badge = '<span class="badge badge-issue"><span class="badge-dot"></span> ⚠️ ติดปัญหา</span>';
              else if (pTag.includes('ติดตั้ง')) badge = '<span class="badge badge-install"><span class="badge-dot"></span> 🛠️ กำลังติดตั้ง</span>';
              else badge = '<span class="badge badge-doing"><span class="badge-dot"></span> กำลังดำเนินการ</span>';
            }
            if (t.status === 'done') badge = '<span class="badge badge-done"><span class="badge-dot"></span> ' + ((t.done_type === 'ติดตั้ง/ต่อเติม' || t.cat === 'ติดตั้ง/ต่อเติม') ? 'ติดตั้งเสร็จแล้ว' : 'ซ่อมเสร็จแล้ว') + '</span>';

            return `
              <div onclick="quickTrack('${t.no}', '${t.email || ''}')" style="background:var(--bg-subtle); border:1.5px solid var(--border); border-radius:var(--radius-md); padding:14px; cursor:pointer; display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                  <div style="display:flex; align-items:center;">
                    <b style="color:var(--primary); font-size:16px;">${esc(t.no)}</b>
                    <button type="button" class="btn-copy-tag" onclick="copyNo('${esc(t.no)}', event)" title="คัดลอกเลขใบแจ้งซ่อม">📋</button>
                  </div>
                  ${badge}
                </div>
                <div style="font-weight:700; font-size:16px; color:var(--text-main); line-height:1.4;">
                  ${esc(t.title || t.no)}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:13.5px; color:var(--text-muted); border-top:1px dashed var(--border); padding-top:6px; margin-top:2px;">
                  <span>🏷️ ${esc(t.type || 'ทั่วไป')}</span>
                  <span>🕒 ${esc(t.date || fmt(t.created_at) || '-')}</span>
                </div>
              </div>
            `;
          }).join('') : `
            <div style="text-align:center; padding:28px 16px; color:var(--text-muted); font-size:15px; background:var(--bg-subtle); border-radius:var(--radius-md);">
              ยังไม่มีรายการแจ้งซ่อม สามารถกด <b>"+ แจ้งซ่อมด่วน"</b> เพื่อเริ่มต้นส่งเรื่องได้ทันที
            </div>
          `}
        </div>
      </div>

      <!-- NUSP Smart Campus Feature Card -->
      <div class="smart-campus-card">
        <div>
          <h3>NUSP<br>Smart Campus</h3>
          <p>พื้นที่แห่งนวัตกรรมและการบริการ<br>เพื่อความสะดวกและรวดเร็ว</p>
        </div>
        <div style="margin-top:16px;">
          <button class="btn btn-primary" style="width:100%; min-height:48px; font-size:16px; font-weight:700; background:#ffffff; color:var(--primary); border:none;" onclick="setTab('report')">
            + แจ้งซ่อมด่วนทันที
          </button>
        </div>
      </div>
    </div>
  `;
}

// Screen 2: แจ้งซ่อมใหม่ (Multi-Step Form Wizard)
function vReport() {
  if (reportStep === 3) {
    // Step 3: ยืนยันการแจ้งซ่อมสำเร็จ
    return `
      <div class="content-card" style="max-width: 680px; margin: 20px auto; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #d1fae5; color: #059669; font-size: 32px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          ✓
        </div>
        <h2 style="font-size: 22px; color: var(--text-main); margin-bottom: 6px;">ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว!</h2>
        <p class="mut" style="margin-bottom: 24px;">เจ้าหน้าที่และทีมช่าง NUSP ได้รับข้อมูลของท่านแล้ว</p>

        <div style="background: var(--bg-subtle); border: 1px dashed var(--border); border-radius: var(--radius-md); padding: 16px; max-width: 400px; margin: 0 auto 24px;">
          <div style="font-size: 15px; color: var(--text-muted); margin-bottom: 4px; font-weight:600;">เลขที่ใบแจ้งซ่อมของคุณ</div>
          <div style="font-size: 26px; font-weight: 800; color: var(--primary); letter-spacing: 0.5px;">${esc(lastNo || '-')}</div>
          ${lastNo ? `<button type="button" class="btn btn-outline btn-sm" style="margin-top: 10px; font-size:14px; font-weight:700;" onclick="copyNo('${esc(lastNo)}', event)">📋 คัดลอกเลขที่ใบแจ้งซ่อม</button>` : ''}
        </div>

        <div class="row" style="justify-content: center; gap: 10px;">
          <button class="btn btn-outline" onclick="setReportStep(1); setTab('history');">ดูประวัติการแจ้งซ่อม</button>
          <button class="btn btn-primary" onclick="setReportStep(1); setTab('home');">กลับหน้าหลัก</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="content-card" style="max-width: 820px; margin: 0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main); display:flex; align-items:center; gap:8px;">
          <span>🔧</span> แจ้งซ่อมใหม่
        </h2>
      </div>

      <!-- Stepper Wizard (3 Steps) -->
      <div class="rw-stepper">
        <div class="rw-step ${reportStep >= 1 ? 'active' : ''} ${reportStep > 1 ? 'completed' : ''}">
          <div class="rw-circle">${reportStep > 1 ? '✓' : '1'}</div>
          <div class="rw-label"><span class="rw-full">ข้อมูลปัญหา</span><span class="rw-short">ข้อมูล</span></div>
        </div>
        <div class="rw-line ${reportStep > 1 ? 'completed' : ''}"></div>
        <div class="rw-step ${reportStep >= 2 ? 'active' : ''} ${reportStep > 2 ? 'completed' : ''}">
          <div class="rw-circle">${reportStep > 2 ? '✓' : '2'}</div>
          <div class="rw-label"><span class="rw-full">ตรวจสอบข้อมูล</span><span class="rw-short">ตรวจสอบ</span></div>
        </div>
        <div class="rw-line ${reportStep > 2 ? 'completed' : ''}"></div>
        <div class="rw-step ${reportStep === 3 ? 'active' : ''}">
          <div class="rw-circle">3</div>
          <div class="rw-label"><span class="rw-full">ยืนยันการแจ้งซ่อม</span><span class="rw-short">ยืนยัน</span></div>
        </div>
      </div>

      ${reportStep === 1 ? `
        <!-- Step 1: ฟอร์มกรอกข้อมูลตามใบแจ้งซ่อมจริงของ NUSP -->
        <form id="reportFormStep1" onsubmit="handleNextStep(event)">
          <!-- ปุ่มสลับหมวดงานหลัก: งานซ่อมแซม หรือ งานติดตั้ง/ต่อเติม -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
            <button type="button" class="btn ${newReportDraft.cat === 'ซ่อมแซม' ? 'btn-primary' : 'btn-outline'}" style="padding:12px; font-size:14.5px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="setReportCat('ซ่อมแซม')">
              🔧 งานซ่อมแซม
            </button>
            <button type="button" class="btn ${newReportDraft.cat === 'ติดตั้ง/ต่อเติม' ? 'btn-primary' : 'btn-outline'}" style="padding:12px; font-size:14.5px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="setReportCat('ติดตั้ง/ต่อเติม')">
              🛠️ งานติดตั้ง / ต่อเติม
            </button>
          </div>

          <!-- Section 1: ข้อมูลผู้แจ้งและสถานที่ -->
          <div style="background:var(--bg-subtle); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px 18px; margin-bottom:18px;">
            <div style="font-weight:700; font-size:16.5px; color:var(--text-main); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <span>🏢</span> ข้อมูลผู้แจ้งและสถานที่
            </div>
            <div class="form-grid" style="margin-bottom:0;">
              <div class="form-group">
                <label>หน่วยงาน / บริษัท</label>
                <input class="form-control" name="org" value="${esc(newReportDraft.org || '')}" placeholder="เช่น บริษัท นวัตกรรม จำกัด หรือ ศูนย์ฯ..." oninput="updateDraft('org', this.value)">
              </div>

              <div class="form-group">
                <label>เบอร์โทรศัพท์ <span class="req">*</span></label>
                <div class="tel-grid" style="display:grid; grid-template-columns:1.5fr 1fr; gap:8px;">
                  <input class="form-control" name="tel" value="${esc(newReportDraft.tel || (me?.tel || ''))}" placeholder="เบอร์มือถือ เช่น 081-234-5678" required oninput="updateDraft('tel', this.value)">
                  <input class="form-control" name="tel_internal" value="${esc(newReportDraft.tel_internal || '')}" placeholder="เบอร์ภายใน" oninput="updateDraft('tel_internal', this.value)">
                </div>
              </div>

              <div class="form-group">
                <label>อาคาร <span class="req">*</span></label>
                <select class="form-control" name="bld" required onchange="setReportBld(this.value)">
                  <option value="อาคาร A" ${newReportDraft.bld === 'อาคาร A' ? 'selected' : ''}>อาคาร A</option>
                  <option value="อาคาร B" ${newReportDraft.bld === 'อาคาร B' ? 'selected' : ''}>อาคาร B</option>
                  <option value="อาคาร C" ${newReportDraft.bld === 'อาคาร C' ? 'selected' : ''}>อาคาร C</option>
                  <option value="อื่นๆ" ${newReportDraft.bld === 'อื่นๆ' ? 'selected' : ''}>อื่นๆ (ระบุเอง)</option>
                </select>
                ${newReportDraft.bld === 'อื่นๆ' ? `
                  <input class="form-control" name="bld_other" value="${esc(newReportDraft.bld_other || '')}" placeholder="โปรดพิมพ์ระบุชื่ออาคาร..." required style="margin-top:6px; animation: fadeIn 0.2s;" oninput="updateDraft('bld_other', this.value)">
                ` : ''}
              </div>

              <div class="form-group">
                <label>ชั้น <span class="req">*</span> และ เลขห้อง (ถ้ามี)</label>
                <div style="display:grid; grid-template-columns:1fr 1.6fr; gap:8px;">
                  <select class="form-control" name="flr" required onchange="updateDraft('flr', this.value)">
                    <option value="1" ${newReportDraft.flr === '1' ? 'selected' : ''}>ชั้น 1</option>
                    <option value="2" ${newReportDraft.flr === '2' ? 'selected' : ''}>ชั้น 2</option>
                    <option value="3" ${newReportDraft.flr === '3' ? 'selected' : ''}>ชั้น 3</option>
                    <option value="4" ${newReportDraft.flr === '4' ? 'selected' : ''}>ชั้น 4</option>
                  </select>
                  <input class="form-control" name="room" value="${esc(newReportDraft.room || '')}" placeholder="เลขห้อง เช่น TC 320 (ถ้ามี)" oninput="updateDraft('room', this.value)">
                </div>
              </div>

              <div class="form-group full-width">
                <label>บริเวณพื้นที่ (ถ้ามี)</label>
                <input class="form-control" name="area" value="${esc(newReportDraft.area || '')}" placeholder="เช่น โถงทางเดิน, หน้าลิฟต์" oninput="updateDraft('area', this.value)">
              </div>
            </div>
          </div>

          <!-- Section 2: ประเภทงานและรายละเอียด -->
          <div class="form-grid">
            <div class="form-group ${newReportDraft.sub_type === 'อื่นๆ' ? '' : 'full-width'}">
              <label>ประเภทงาน${newReportDraft.cat === 'ซ่อมแซม' ? 'ซ่อมแซม' : ' ติดตั้ง/ต่อเติม'} <span class="req">*</span></label>
              <select class="form-control" name="sub_type" required onchange="setReportSubType(this.value)">
                ${(newReportDraft.cat === 'ซ่อมแซม' ? REPAIR_SUBTYPES : INSTALL_SUBTYPES).map(st => `
                  <option value="${esc(st)}" ${newReportDraft.sub_type === st ? 'selected' : ''}>${esc(st)}</option>
                `).join('')}
              </select>
            </div>

            ${newReportDraft.sub_type === 'อื่นๆ' ? `
              <div class="form-group" style="animation: fadeIn 0.2s;">
                <label style="color:var(--primary); font-weight:700;">ระบุประเภทงานอื่นๆ <span class="req">*</span></label>
                <input class="form-control" name="sub_type_other" value="${esc(newReportDraft.sub_type_other || '')}" placeholder="โปรดระบุประเภทงานที่ต้องการ..." required oninput="updateDraft('sub_type_other', this.value)">
              </div>
            ` : ''}

            <div class="form-group">
              <label>${newReportDraft.cat === 'ซ่อมแซม' ? 'รายการซ่อมแซม' : 'รายการติดตั้ง / ต่อเติม'} <span class="req">*</span></label>
              <input class="form-control" name="title" value="${esc(newReportDraft.title)}" placeholder="${newReportDraft.cat === 'ซ่อมแซม' ? 'เช่น ล้างแผ่นกรองอากาศ, อุดท่อน้ำทิ้ง' : 'เช่น ติดตั้งเต้ารับไฟฟ้าเพิ่ม, ติดตั้งเครื่องจักรใหม่'}" required oninput="updateDraft('title', this.value)">
            </div>

            <div class="form-group">
              <label>หมายเลขครุภัณฑ์ (ถ้ามี)</label>
              <input class="form-control" name="asset_no" value="${esc(newReportDraft.asset_no || '')}" placeholder="เช่น 7440-001-0001/67 (ถ้ามี)" oninput="updateDraft('asset_no', this.value)">
            </div>

            <div class="form-group full-width">
              <label>${newReportDraft.cat === 'ซ่อมแซม' ? 'อาการที่ชำรุด' : 'รายละเอียดการติดตั้ง / ต่อเติม'} <span class="req">*</span></label>
              <textarea class="form-control" name="details" rows="3" placeholder="อธิบายอาการชำรุด หรือรายละเอียดสิ่งที่ต้องการให้ดำเนินการ..." required oninput="updateDraft('details', this.value)">${esc(newReportDraft.details)}</textarea>
            </div>

            <div class="form-group full-width">
              <label>หมายเหตุเพิ่มเติม (ถ้ามี)</label>
              <textarea class="form-control" name="remark" rows="2" placeholder="ระบุเพิ่มเติม (ถ้ามี)" oninput="updateDraft('remark', this.value)">${esc(newReportDraft.remark || '')}</textarea>
            </div>

            <div class="form-group full-width">
              <label>ความเร่งด่วน</label>
              <div class="priority-options">
                <label class="priority-pill ${newReportDraft.priority === 'normal' ? 'selected' : ''}" onclick="selectPriority('normal')">
                  <input type="radio" name="priority" value="normal" ${newReportDraft.priority === 'normal' ? 'checked' : ''}>
                  <span style="color:#ea580c;">●</span> ปกติ
                </label>
                <label class="priority-pill ${newReportDraft.priority === 'urgent' ? 'selected' : ''}" onclick="selectPriority('urgent')">
                  <input type="radio" name="priority" value="urgent" ${newReportDraft.priority === 'urgent' ? 'checked' : ''}>
                  <span style="color:#f59e0b;">●</span> เร่งด่วน
                </label>
                <label class="priority-pill ${newReportDraft.priority === 'emergency' ? 'selected' : ''}" onclick="selectPriority('emergency')">
                  <input type="radio" name="priority" value="emergency" ${newReportDraft.priority === 'emergency' ? 'checked' : ''}>
                  <span style="color:#ef4444;">●</span> ฉุกเฉิน
                </label>
              </div>
            </div>

            <div class="form-group full-width">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label style="margin:0;">แนบรูปภาพ (ถ้ามี)</label>
                <span id="file-count-badge" style="font-size:13px; font-weight:700; color:${selectedFilesList.length >= 4 ? '#ef4444' : '#ea580c'};">
                  แนบแล้ว (${selectedFilesList.length}/4 รูป)
                </span>
              </div>
              <div class="upload-dropzone" 
                   onclick="document.getElementById('report_files').click()"
                   ondragover="event.preventDefault(); this.style.borderColor='var(--primary)';"
                   ondragleave="this.style.borderColor='';"
                   ondrop="handleFileDrop(event)">
                <span class="upload-icon">🖼️</span>
                <p>ลากไฟล์มาวางที่นี่ หรือ <span style="color:var(--primary);">คลิกเพื่อเลือกไฟล์</span></p>
                <span>รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5 MB (สูงสุด 4 รูป)</span>
                <input type="file" id="report_files" name="pics" accept="image/*" multiple style="display:none;" onchange="handleFileSelect(this)">
              </div>
              <div id="file-previews" style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                ${renderReportFilePreviewsHtml()}
              </div>
            </div>
          </div>

          <div class="row sp" style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px;">
            <button type="button" class="btn btn-outline" onclick="setTab('home')">ยกเลิก</button>
            <button type="submit" class="btn btn-primary">ถัดไป →</button>
          </div>
        </form>
      ` : `
        <!-- Step 2: ตรวจสอบข้อมูลก่อนส่งเรื่อง -->
        <div style="background:var(--bg-subtle); border:1px solid var(--border); border-radius:var(--radius-lg); padding:24px 20px; margin-bottom:20px;">
          <h3 style="font-size:18px; font-weight:800; margin-bottom:16px; color:var(--text-main); display:flex; align-items:center; gap:8px;">
            <span>🔍</span> ตรวจสอบข้อมูลใบแจ้งซ่อม / ติดตั้ง
          </h3>
          <div style="display:flex; flex-direction:column; gap:12px; font-size:16px; line-height:1.5;">
            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
              <span class="mut" style="font-weight:700;">หมวดงาน:</span>
              <span><span class="badge ${newReportDraft.cat === 'ติดตั้ง/ต่อเติม' ? 'badge-install' : 'badge-doing'}" style="font-size:14px;">${esc(newReportDraft.cat)}</span></span>
            </div>

            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
              <span class="mut" style="font-weight:700;">ประเภทงาน:</span>
              <span style="font-weight:700; color:var(--primary);">${esc(newReportDraft.sub_type === 'อื่นๆ' ? (newReportDraft.sub_type_other ? 'อื่นๆ: ' + newReportDraft.sub_type_other : 'อื่นๆ') : newReportDraft.sub_type)}</span>
            </div>

            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
              <span class="mut" style="font-weight:700;">${newReportDraft.cat === 'ซ่อมแซม' ? 'รายการซ่อมแซม' : 'รายการติดตั้ง'}:</span>
              <span style="font-weight:700;">${esc(newReportDraft.title)}</span>
            </div>

            <div style="display:flex; flex-direction:column; gap:4px; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
              <span class="mut" style="font-weight:700;">${newReportDraft.cat === 'ซ่อมแซม' ? 'อาการที่ชำรุด' : 'รายละเอียดงาน'}:</span>
              <div style="background:#ffffff; border:1px solid var(--border); padding:10px 14px; border-radius:8px;">${esc(newReportDraft.details)}</div>
            </div>

            ${newReportDraft.remark ? `
              <div style="display:flex; flex-direction:column; gap:4px; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
                <span class="mut" style="font-weight:700;">หมายเหตุเพิ่มเติม:</span>
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px 14px; border-radius:8px; font-weight:600; color:#166534;">${esc(newReportDraft.remark)}</div>
              </div>
            ` : ''}

            ${newReportDraft.asset_no ? `
              <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
                <span class="mut" style="font-weight:700;">หมายเลขครุภัณฑ์:</span>
                <span>
                  <b style="font-family:monospace; color:#9a3412;">${esc(newReportDraft.asset_no)}</b>
                  <button type="button" class="btn-copy-tag btn-copy-asset" onclick="copyAsset('${esc(newReportDraft.asset_no)}', event)" title="คัดลอกเลขครุภัณฑ์">📋 คัดลอก</button>
                </span>
              </div>
            ` : ''}

            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
              <span class="mut" style="font-weight:700;">สถานที่:</span>
              <span style="font-weight:600;">${esc(formatTicketLocation({
                bld: newReportDraft.bld,
                bld_other: newReportDraft.bld === 'อื่นๆ' ? newReportDraft.bld_other : null,
                flr: newReportDraft.flr,
                room: newReportDraft.room,
                area: newReportDraft.area
              }))}</span>
            </div>

            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
              <span class="mut" style="font-weight:700;">หน่วยงาน / บริษัท:</span>
              <span>${esc(newReportDraft.org || '-')}</span>
            </div>

            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; border-bottom:1px solid var(--border-light); padding-bottom:8px;">
              <span class="mut" style="font-weight:700;">ผู้แจ้ง:</span>
              <span>${esc(me?.name || 'ผู้แจ้ง')} (โทร: ${esc(newReportDraft.tel || '-')}${newReportDraft.tel_internal ? ' ภายใน: ' + esc(newReportDraft.tel_internal) : ''})</span>
            </div>

            <div style="display:flex; flex-wrap:wrap; justify-content:space-between; ${selectedFilesList.length ? 'border-bottom:1px solid var(--border-light); padding-bottom:8px;' : 'padding-top:4px;'}">
              <span class="mut" style="font-weight:700;">ความเร่งด่วน:</span>
              <div>
                ${newReportDraft.priority === 'emergency' ? '<span class="badge badge-urgent"><span class="badge-dot"></span> ฉุกเฉิน</span>' : newReportDraft.priority === 'urgent' ? '<span class="badge badge-pending"><span class="badge-dot"></span> เร่งด่วน</span>' : '<span class="badge badge-doing"><span class="badge-dot"></span> ปกติ</span>'}
              </div>
            </div>

            ${selectedFilesList.length ? `
              <div style="display:flex; flex-direction:column; gap:8px; padding-top:4px;">
                <span class="mut" style="font-weight:700;">รูปภาพที่แนบ (${selectedFilesList.length}/4 รูป):</span>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                  ${selectedFilesList.map((f, idx) => `
                    <div style="position:relative; width:65px; height:65px; border-radius:8px; overflow:hidden; border:1px solid var(--border); box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                      <img src="${URL.createObjectURL(f)}" alt="รูปที่ ${idx+1}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="row sp" style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px;">
          <button type="button" class="btn btn-outline" onclick="setReportStep(1)">← ย้อนกลับไปแก้ไข</button>
          <button type="button" class="btn btn-primary" onclick="confirmSubmitReport(event)">ยืนยันการแจ้งซ่อม ✓</button>
        </div>
      `}
    </div>
  `;
}

window.selectPriority = function(pri) {
  newReportDraft.priority = pri;
  const pills = document.querySelectorAll('.priority-pill');
  pills.forEach(p => p.classList.remove('selected'));
  if (event?.currentTarget) event.currentTarget.classList.add('selected');
};

let selectedFilesList = [];
window.selectedFilesList = selectedFilesList;

window.renderReportFilePreviewsHtml = function() {
  if (!selectedFilesList || !selectedFilesList.length) {
    return '';
  }
  return selectedFilesList.map((file, idx) => {
    let url = '';
    try { url = URL.createObjectURL(file); } catch(e) {}
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `
      <div style="position:relative; width:76px; height:76px; border-radius:10px; overflow:hidden; border:1.5px solid #cbd5e1; box-shadow:0 2px 6px rgba(0,0,0,0.06); background:#f8fafc;" title="${esc(file.name)} (${sizeMb} MB)">
        <img src="${url}" alt="${esc(file.name)}" style="width:100%; height:100%; object-fit:cover;">
        <button type="button" onclick="event.stopPropagation(); removeReportFile(${idx})" style="position:absolute; top:3px; right:3px; width:22px; height:22px; border-radius:50%; background:rgba(239,68,68,0.92); color:#fff; border:none; font-size:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1; box-shadow:0 1px 3px rgba(0,0,0,0.3);" title="ลบรูปนี้">✕</button>
        <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(15,23,42,0.68); color:#fff; font-size:10px; text-align:center; padding:1px 0; font-family:sans-serif;">${sizeMb}MB</div>
      </div>
    `;
  }).join('');
};

window.renderReportFilePreviews = function() {
  const previewBox = document.getElementById('file-previews');
  if (previewBox) {
    previewBox.innerHTML = renderReportFilePreviewsHtml();
  }
  const badge = document.getElementById('file-count-badge');
  if (badge) {
    badge.textContent = `แนบแล้ว (${selectedFilesList.length}/4 รูป)`;
    badge.style.color = selectedFilesList.length >= 4 ? '#ef4444' : '#ea580c';
  }
};

window.removeReportFile = function(idx) {
  if (idx >= 0 && idx < selectedFilesList.length) {
    selectedFilesList.splice(idx, 1);
    renderReportFilePreviews();
    toast('ลบรูปภาพแล้ว');
  }
};

window.handleFileDrop = function(e) {
  e.preventDefault();
  if (e.currentTarget) e.currentTarget.style.borderColor = '';
  if (e.dataTransfer && e.dataTransfer.files) {
    processNewReportFiles([...e.dataTransfer.files]);
  }
};

window.handleFileSelect = function(input) {
  if (input && input.files) {
    processNewReportFiles([...input.files]);
    input.value = ''; // เคลียร์ input เพื่อให้เลือกไฟล์เดิมซ้ำได้ถ้าเคยลบออกไป
  }
};

window.processNewReportFiles = function(files) {
  if (!files || !files.length) return;
  
  let addedCount = 0;
  for (const file of files) {
    if (!file.type || !file.type.startsWith('image/')) {
      toast(`ไฟล์ "${file.name}" ไม่ใช่ไฟล์รูปภาพ (รองรับเฉพาะ JPG, PNG)`);
      continue;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast(`รูป "${file.name}" มีขนาดเกิน 5 MB ไม่สามารถแนบได้`);
      continue;
    }
    if (selectedFilesList.length >= 4) {
      toast('แนบรูปภาพได้สูงสุดไม่เกิน 4 รูปเท่านั้นครับ');
      break;
    }
    // ตรวจสอบรูปซ้ำ (ชื่อ, ขนาด, เวลาแก้ไข)
    const isDup = selectedFilesList.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
    if (isDup) {
      continue;
    }

    selectedFilesList.push(file);
    addedCount++;
  }

  renderReportFilePreviews();
  if (addedCount > 0) {
    toast(`แนบรูปภาพสำเร็จ (${selectedFilesList.length}/4 รูป)`);
  }
};

window.handleNextStep = function(e) {
  e.preventDefault();
  const form = e.target;
  if (form) {
    if (form.org) newReportDraft.org = form.org.value;
    if (form.tel) newReportDraft.tel = form.tel.value;
    if (form.tel_internal) newReportDraft.tel_internal = form.tel_internal.value;
    if (form.bld) newReportDraft.bld = form.bld.value;
    if (form.bld_other) newReportDraft.bld_other = form.bld_other.value;
    if (form.flr) newReportDraft.flr = form.flr.value;
    if (form.room) newReportDraft.room = form.room.value;
    if (form.area) newReportDraft.area = form.area.value;
    if (form.sub_type) newReportDraft.sub_type = form.sub_type.value;
    if (form.sub_type_other) newReportDraft.sub_type_other = form.sub_type_other.value;
    if (form.title) newReportDraft.title = form.title.value;
    if (form.asset_no) newReportDraft.asset_no = form.asset_no.value;
    if (form.details) newReportDraft.details = form.details.value;
    if (form.remark) newReportDraft.remark = form.remark.value;
  }
  if (!newReportDraft.title || !newReportDraft.details) {
    return toast('กรุณากรอกรายการและรายละเอียดปัญหาให้ครบถ้วน');
  }
  if (newReportDraft.bld === 'อื่นๆ' && !newReportDraft.bld_other.trim()) {
    return toast('กรุณาระบุชื่ออาคาร');
  }
  if (newReportDraft.sub_type === 'อื่นๆ' && !newReportDraft.sub_type_other.trim()) {
    return toast('กรุณาระบุประเภทงานอื่นๆ');
  }
  setReportStep(2);
};

window.confirmSubmitReport = async function(e) {
  const btn = e?.target?.closest ? (e.target.closest('button') || e.target) : (e?.target || {});
  btn.disabled = true;
  toast('กำลังส่งเรื่องแจ้งซ่อม...');

  const no = 'REP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const cat = newReportDraft.cat || 'ซ่อมแซม';
  const chosenType = newReportDraft.sub_type === 'อื่นๆ'
    ? (newReportDraft.sub_type_other ? 'อื่นๆ: ' + newReportDraft.sub_type_other : 'อื่นๆ')
    : (newReportDraft.sub_type || 'ทั่วไป');

  try {
    let photos = [];
    if (selectedFilesList.length) {
      photos = await up(selectedFilesList, 'r/' + no);
    }

    const telCombined = newReportDraft.tel + (newReportDraft.tel_internal ? ' (ภายใน ' + newReportDraft.tel_internal + ')' : '');

    const chosenBld = newReportDraft.bld === 'อื่นๆ'
      ? (newReportDraft.bld_other ? 'อาคาร: ' + newReportDraft.bld_other : 'อื่นๆ')
      : (newReportDraft.bld || 'อาคาร A');

    const userTel = telCombined || me?.tel || '';
    const userOrg = newReportDraft.org || me?.org || '';
    const userEmail = (me?.email || localStorage.getItem('last_reporter_email') || localStorage.getItem('last_logged_in_email') || '').toLowerCase();

    const payload = {
      id: no,
      user_id: me?.id && isUUID(me.id) ? me.id : null,
      name: me?.name ? (userOrg ? `${me.name} (${userOrg})` : me.name) : 'ผู้แจ้งทั่วไป',
      email: userEmail,
      tel: userTel,
      org: userOrg,
      cat: cat,
      bld: chosenBld,
      bld_other: newReportDraft.bld === 'อื่นๆ' ? newReportDraft.bld_other : null,
      flr: newReportDraft.flr || '1',
      room: newReportDraft.room || '',
      area: newReportDraft.area?.trim() || null,
      remark: newReportDraft.remark?.trim() || null,
      types: [chosenType],
      sub_type: chosenType,
      sub_type_other: newReportDraft.sub_type === 'อื่นๆ' ? newReportDraft.sub_type_other : null,
      items: [{
        item: newReportDraft.title,
        sym: newReportDraft.details,
        asset: newReportDraft.asset_no || '',
        area: newReportDraft.area?.trim() || '',
        remark: newReportDraft.remark?.trim() || ''
      }],
      urgent: newReportDraft.priority !== 'normal',
      photos: photos,
      history: [{ s: 'accepted', at: Date.now() }]
    };

    let { error } = await sb.from('tickets').insert(payload);
    if (error && (error.message?.includes('area') || error.message?.includes('remark') || error.code === '42703')) {
      console.warn('Direct area/remark insert failed, fallback without root columns:', error);
      const fallbackPayload = { ...payload };
      delete fallbackPayload.area;
      delete fallbackPayload.remark;
      const res2 = await sb.from('tickets').insert(fallbackPayload);
      error = res2.error;
    }
    if (error && !CONFIG.DEV) throw error;

    // Save to user tickets
    const myT = (typeof getMyTickets === 'function') ? getMyTickets() : JSON.parse(localStorage.getItem('myT') || '[]');
    myT.unshift({
      no: no,
      id: no,
      user_id: me?.id && isUUID(me.id) ? me.id : null,
      title: newReportDraft.title,
      details: newReportDraft.details,
      desc: newReportDraft.details,
      asset_no: newReportDraft.asset_no || '',
      type: chosenType,
      bld: chosenBld,
      flr: newReportDraft.flr || '1',
      location: `${chosenBld} ชั้น ${newReportDraft.flr}`,
      room: newReportDraft.room || '',
      area: newReportDraft.area?.trim() || '',
      remark: newReportDraft.remark?.trim() || '',
      email: payload.email,
      status: 'accepted',
      urgent: payload.urgent,
      photos: photos,
      created_at: new Date().toISOString(),
      date: new Date().toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' })
    });
    if (typeof saveMyTickets === 'function') {
      saveMyTickets(myT);
    } else {
      localStorage.setItem('myT', JSON.stringify(myT));
    }

    // Also update in memory T if technician or admin is logged in
    if (window.T) {
      T.unshift({
        ...payload,
        created_at: new Date().toISOString()
      });
    }

    lastNo = no;
    // Reset draft
    resetReportDraft();
    selectedFilesList = [];
    
    setReportStep(3);
    toast('ส่งเรื่องแจ้งซ่อมสำเร็จ!');
  } catch (err) {
    if (CONFIG.DEV) {
      lastNo = no;
      setReportStep(3);
      toast('(โหมดทดสอบ) ส่งเรื่องแจ้งซ่อมสำเร็จ!');
      return;
    }
    toast('ส่งเรื่องไม่สำเร็จ: ' + (err.message || err));
    btn.disabled = false;
  }
};

// Screen: ติดตามสถานะ (Track Ticket)
function vTrack() {
  return `
    <div class="content-card" style="max-width:700px; margin:0 auto 20px;">
      <h2 style="font-size:18px; margin-bottom:8px;">🔍 ติดตามสถานะใบแจ้งซ่อม</h2>
      <p class="mut" style="margin-bottom:16px;">กรอกเลขที่ใบแจ้งซ่อม เช่น REP-2026-1001 หรือ RP-...</p>
      
      <form onsubmit="trackT(event)" style="display:flex; gap:8px;">
        <input class="form-control" name="no" placeholder="เช่น REP-2026-1001" required style="font-size:15px; font-weight:600;">
        <button class="btn btn-primary" type="submit" style="white-space:nowrap;">ค้นหาใบงาน</button>
      </form>
    </div>

    ${found === null ? '<div class="content-card mut" style="max-width:860px; margin:auto; text-align:center;">ไม่พบใบงาน โปรดตรวจสอบเลขที่ใบแจ้งซ่อมอีกครั้ง</div>' : found ? `<div style="max-width:860px; margin:auto;">${card(found, steps(found))}</div>` : ''}
  `;
}

let reporterHistoryYear = 'all';
let reporterHistoryMonth = 'all';
window.reporterHistoryYear = reporterHistoryYear;
window.reporterHistoryMonth = reporterHistoryMonth;

window.setReporterHistoryYear = function(y) {
  reporterHistoryYear = y;
  render();
};

window.setReporterHistoryMonth = function(m) {
  reporterHistoryMonth = m;
  render();
};

window.resetReporterHistoryPeriod = function() {
  reporterHistoryYear = 'all';
  reporterHistoryMonth = 'all';
  render();
};

function getTicketDateObj(t) {
  if (t.created_at) {
    const d = new Date(t.created_at);
    if (!isNaN(d.getTime())) return d;
  }
  if (t.date) {
    const d = new Date(t.date);
    if (!isNaN(d.getTime())) return d;
    const thaiMonthMap = {
      'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
      'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
    };
    for (const [mName, mNum] of Object.entries(thaiMonthMap)) {
      if (typeof t.date === 'string' && t.date.includes(mName)) {
        const yearMatch = t.date.match(/25\d\d/);
        const y = yearMatch ? parseInt(yearMatch[0]) - 543 : 2026;
        return new Date(y, mNum - 1, 1);
      }
    }
  }
  return null;
}

window.goToHistoryWithFilter = function(filterKey) {
  hFil = filterKey;
  setTab('history');
};

// Screen: ประวัติการแจ้งซ่อม (History) - รองรับตัวกรอง 4 หมวด + กรองปีและเดือน
function vHistory() {
  const myT = (typeof getMyTickets === 'function') ? getMyTickets() : JSON.parse(localStorage.getItem('myT') || '[]');
  const validList = myT.filter(t => t.status !== 'deleted');
  
  const totalCount = validList.length;
  const doingCount = validList.filter(t => t.status === 'doing' || t.status === 'checking').length;
  const doneCount = validList.filter(t => t.status === 'done' || t.status === 'closed').length;
  const pendingCount = validList.filter(t => t.status === 'accepted' || t.status === 'pending' || !t.status || (!['doing', 'checking', 'done', 'closed', 'deleted'].includes(t.status))).length;

  let filtered = validList;
  if (hFil === 'pending') {
    filtered = validList.filter(t => t.status === 'accepted' || t.status === 'pending' || !t.status || (!['doing', 'checking', 'done', 'closed', 'deleted'].includes(t.status)));
  } else if (hFil === 'doing') {
    filtered = validList.filter(t => t.status === 'doing' || t.status === 'checking');
  } else if (hFil === 'done') {
    filtered = validList.filter(t => t.status === 'done' || t.status === 'closed');
  }

  // รวบรวมรายชื่อปีที่มีในประวัติของผู้แจ้ง
  const yearSet = new Set();
  validList.forEach(t => {
    const d = getTicketDateObj(t);
    if (d) yearSet.add(d.getFullYear());
  });
  if (!yearSet.size) yearSet.add(new Date().getFullYear());
  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);

  // 12 เดือนภาษาไทย
  const thaiMonths = [
    { num: '01', name: 'มกราคม' },
    { num: '02', name: 'กุมภาพันธ์' },
    { num: '03', name: 'มีนาคม' },
    { num: '04', name: 'เมษายน' },
    { num: '05', name: 'พฤษภาคม' },
    { num: '06', name: 'มิถุนายน' },
    { num: '07', name: 'กรกฎาคม' },
    { num: '08', name: 'สิงหาคม' },
    { num: '09', name: 'กันยายน' },
    { num: '10', name: 'ตุลาคม' },
    { num: '11', name: 'พฤศจิกายน' },
    { num: '12', name: 'ธันวาคม' }
  ];

  // กรองตาม ปี และ เดือน
  if (reporterHistoryYear !== 'all') {
    filtered = filtered.filter(t => {
      const d = getTicketDateObj(t);
      return d ? String(d.getFullYear()) === String(reporterHistoryYear) : true;
    });
  }
  if (reporterHistoryMonth !== 'all') {
    filtered = filtered.filter(t => {
      const d = getTicketDateObj(t);
      if (!d) return true;
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      return mStr === String(reporterHistoryMonth);
    });
  }

  const isPeriodFiltered = reporterHistoryYear !== 'all' || reporterHistoryMonth !== 'all';

  return `
    <div class="content-card">
      <div class="card-header-row" style="flex-wrap:wrap; gap:8px;">
        <h2 style="font-size:18px; display:flex; align-items:center; gap:8px;">
          <span>📋</span> ประวัติการแจ้งซ่อมของฉัน (${totalCount} งาน)
        </h2>
        <button class="btn btn-primary btn-sm" onclick="setTab('report')">+ แจ้งซ่อมใหม่</button>
      </div>

      <div class="filter-bar">
        <div class="filter-pills">
          <button class="filter-pill ${hFil === 'all' ? 'active' : ''}" onclick="setHFil('all')">ทั้งหมด (${totalCount})</button>
          <button class="filter-pill ${hFil === 'pending' ? 'active' : ''}" onclick="setHFil('pending')">รอดำเนินการ (${pendingCount})</button>
          <button class="filter-pill ${hFil === 'doing' ? 'active' : ''}" onclick="setHFil('doing')">กำลังดำเนินการ (${doingCount})</button>
          <button class="filter-pill ${hFil === 'done' ? 'active' : ''}" onclick="setHFil('done')">เสร็จสิ้น (${doneCount})</button>
        </div>
      </div>

      <!-- แถบเลือกดูตามช่วงเวลา: ปี / เดือน สองคอลัมน์กว้างเท่ากัน -->
      <div class="period-bar">
        <div class="period-bar-head">
          <span class="period-bar-title"><span>🗓️</span> ช่วงเวลา
            <span class="period-bar-count">${isPeriodFiltered ? `พบ ${filtered.length} จาก ${validList.length} รายการ` : `ทั้งหมด ${validList.length} รายการ`}</span>
          </span>
          ${isPeriodFiltered ? `<button type="button" class="period-bar-reset" onclick="resetReporterHistoryPeriod()">✕ ล้างตัวกรอง</button>` : ''}
        </div>
        <div class="period-bar-grid">
          <label class="period-field">
            <span class="period-field-label">ปี</span>
            <select class="period-select" onchange="setReporterHistoryYear(this.value)">
              <option value="all" ${reporterHistoryYear === 'all' ? 'selected' : ''}>ทุกปี</option>
              ${sortedYears.map(y => `
                <option value="${y}" ${String(reporterHistoryYear) === String(y) ? 'selected' : ''}>พ.ศ. ${y + 543}</option>
              `).join('')}
            </select>
          </label>
          <label class="period-field">
            <span class="period-field-label">เดือน</span>
            <select class="period-select" onchange="setReporterHistoryMonth(this.value)">
              <option value="all" ${reporterHistoryMonth === 'all' ? 'selected' : ''}>ทุกเดือน</option>
              ${thaiMonths.map(m => `
                <option value="${m.num}" ${reporterHistoryMonth === m.num ? 'selected' : ''}>${m.name}</option>
              `).join('')}
            </select>
          </label>
        </div>
      </div>

      <div class="nusp-table-wrapper">
        <table class="nusp-table table-cards">
          <thead>
            <tr>
              <th>เลขที่ใบแจ้งซ่อม</th>
              <th>หัวข้อ / ชนิดอุปกรณ์</th>
              <th>หมายเลขครุภัณฑ์</th>
              <th>สถานะ</th>
              <th>วันที่แจ้ง</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => {
              const assetNo = t.items?.[0]?.asset || t.asset_no || t.asset || '';
              const equipType = (typeof getTicketTitle === 'function' ? getTicketTitle(t) : (t.items?.[0]?.item || t.title || t.type || 'อุปกรณ์ทั่วไป'));

              let badge = '<span class="badge badge-pending"><span class="badge-dot"></span> รอดำเนินการ</span>';
              if (t.status === 'doing') {
                const pTag = t.tag || t.note?.match(/^\[(.*?)\]/)?.[1] || '';
                if (pTag.includes('รออุปกรณ์') || pTag.includes('อะไหล่')) badge = '<span class="badge badge-waiting-parts"><span class="badge-dot"></span> ⏳ รออุปกรณ์</span>';
                else if (pTag.includes('ตรวจสอบ')) badge = '<span class="badge badge-inspecting"><span class="badge-dot"></span> 🔍 กำลังตรวจสอบ</span>';
                else if (pTag.includes('ติดปัญหา') || pTag.includes('ประสานงาน')) badge = '<span class="badge badge-issue"><span class="badge-dot"></span> ⚠️ ติดปัญหา</span>';
                else if (pTag.includes('ติดตั้ง')) badge = '<span class="badge badge-install"><span class="badge-dot"></span> 🛠️ กำลังติดตั้ง</span>';
                else badge = '<span class="badge badge-doing"><span class="badge-dot"></span> กำลังดำเนินการ</span>';
              } else if (t.status === 'checking') {
                badge = '<span class="badge badge-doing" style="background:#e0f2fe; color:#0284c7; border:1px solid #bae6fd;"><span class="badge-dot" style="background:#0284c7;"></span> ✔️ ตรวจสอบงาน</span>';
              } else if (t.status === 'done' || t.status === 'closed') {
                badge = '<span class="badge badge-done"><span class="badge-dot"></span> ' + ((t.done_type === 'ติดตั้ง/ต่อเติม' || t.cat === 'ติดตั้ง/ต่อเติม') ? '🛠️ ติดตั้งเสร็จแล้ว' : '✓ ซ่อมเสร็จแล้ว') + '</span>';
              } else if (t.status === 'deleted') {
                badge = '<span class="badge badge-canceled"><span class="badge-dot"></span> ✕ ยกเลิกแล้ว</span>';
              }

              return `
                <tr>
                  <td data-label="เลขที่ใบแจ้งซ่อม" style="font-weight:700; color:var(--primary); font-size:15px; white-space:nowrap;">
                    <span>${esc(t.no)}</span>
                    <button type="button" class="btn-copy-tag" onclick="copyNo('${esc(t.no)}', event)" title="คัดลอกเลขใบแจ้งซ่อม">📋</button>
                  </td>
                  <td data-label="หัวข้อ"><div style="text-align:right;">
                    <div style="font-weight:700; color:#0b2545; font-size:15px;">${esc(equipType)}</div>
                    <div style="font-size:12.5px; color:#64748b;">หมวด: ${esc(t.type || t.cat || 'ทั่วไป')}</div>
                  </div></td>
                  <td data-label="เลขครุภัณฑ์">
                    ${assetNo ? `
                      <span class="badge" style="background:#fff7ed; color:#ea580c; border:1px solid #fed7aa; font-family:monospace; font-size:13.5px; font-weight:700; padding:4px 8px;">🏷️ ${esc(assetNo)}</span>
                      <button type="button" class="btn-copy-tag btn-copy-asset" onclick="copyAsset('${esc(assetNo)}', event)" title="คัดลอกเลขครุภัณฑ์">📋</button>
                    ` : `
                      <span style="color:#94a3b8; font-size:13px;">- ไม่ได้ระบุ -</span>
                    `}
                  </td>
                  <td data-label="สถานะ">${badge}</td>
                  <td data-label="วันที่แจ้ง" style="color:var(--text-muted); font-size:14.5px; white-space:nowrap;">${esc(t.date || fmt(t.created_at) || '-')}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="quickTrack('${t.no}', '${t.email || ''}')" style="font-weight:700;">ดูรายละเอียด</button>
                  </td>
                </tr>
              `;
            }).join('') || `<tr><td colspan="6" class="mut" style="text-align:center; padding:32px;">${isPeriodFiltered ? 'ไม่พบรายการแจ้งซ่อมในช่วงเวลาที่เลือก' : 'ไม่พบรายการในหมวดนี้'}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================================================
// Screen: ข้อมูลส่วนตัว (Profile) - แสดงทุกข้อมูล อันไหนไม่มีให้แดช (-) ไว้ + แก้ไขได้
// ==========================================================================
let isEditingProfile = false;
window.setProfileEditMode = function(editing) {
  isEditingProfile = editing;
  render();
};

window.saveProfile = async function(e) {
  if (e) e.preventDefault();
  const nameVal = (document.getElementById('prof_name')?.value || '').trim();
  const telVal = (document.getElementById('prof_tel')?.value || '').trim();
  const telIntVal = (document.getElementById('prof_tel_internal')?.value || '').trim();
  const orgVal = (document.getElementById('prof_org')?.value || '').trim();
  const skillVal = (document.getElementById('prof_skill')?.value || '').trim();

  if (!nameVal) return toast('กรุณาระบุชื่อ-นามสกุล');

  toast('กำลังบันทึกข้อมูลส่วนตัว...');

  const updatedProfile = {
    name: nameVal,
    tel: telVal || null,
    tel_internal: telIntVal || null,
    org: orgVal || null
  };

  if (me?.role === 'tech' || me?.role === 'admin') {
    updatedProfile.skill = skillVal || null;
  }

  // อัปเดตในหน่วยความจำและ sessionStorage ทันที
  Object.assign(me, updatedProfile);
  sessionStorage.setItem('repair_me', JSON.stringify(me));

  // บันทึกค่าไว้ใน localStorage สำหรับกรอกฟอร์มแจ้งซ่อมอัตโนมัติ
  if (telVal) localStorage.setItem('profile_tel', telVal);
  if (orgVal) localStorage.setItem('profile_org', orgVal);
  if (telIntVal) localStorage.setItem('profile_tel_internal', telIntVal);
  if (nameVal) localStorage.setItem('profile_name', nameVal);

  // อัปเดตลงตาราง public.profiles ใน Supabase
  try {
    if (me?.id && typeof isUUID === 'function' && isUUID(me.id)) {
      const { error } = await sb.from('profiles').update(updatedProfile).eq('id', me.id);
      if (error) console.warn('Supabase profile update warning:', error);
    } else if (me?.id) {
      const { error } = await sb.from('profiles').upsert({ id: me.id, role: me.role, ...updatedProfile }, { onConflict: 'id' });
      if (error) console.warn('Supabase profile upsert warning:', error);
    }
  } catch (err) {
    console.warn('Profile save db error:', err);
  }

  isEditingProfile = false;
  toast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
  render();
};

function vProfile() {
  const emailDisplay = me?.email || localStorage.getItem('last_reporter_email') || '-';
  const roleDisplay = me?.role === 'admin' 
    ? 'ผู้ดูแลระบบ (Admin)' 
    : me?.role === 'tech' 
      ? 'ช่างซ่อมบำรุง (Technician)' 
      : 'ผู้แจ้งซ่อม (บุคลากร / ทั่วไป)';

  // ถ้าอยู่ในโหมดแก้ไขข้อมูล
  if (isEditingProfile) {
    return `
      <div class="profile-card-modern">
        <div class="profile-header-banner">
          <div class="profile-avatar-circle">
            ${(me?.name || 'N').charAt(0)}
          </div>
          <div class="profile-header-name">แก้ไขข้อมูลส่วนตัว</div>
          <div class="profile-header-role">บทบาท: ${roleDisplay}</div>
        </div>

        <form class="profile-content-body" onsubmit="saveProfile(event)">
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div>
              <label style="font-weight:700; color:#0b2545; font-size:15px; margin-bottom:6px; display:block;">ชื่อ - นามสกุล *</label>
              <input class="form-control" id="prof_name" value="${esc(me?.name || '')}" placeholder="เช่น นายสมชาย ใจดี" required style="font-size:16px; padding:10px 14px;">
            </div>

            <div>
              <label style="font-weight:700; color:#0b2545; font-size:15px; margin-bottom:6px; display:block;">อีเมล (บัญชีผู้ใช้)</label>
              <input class="form-control" value="${esc(emailDisplay)}" disabled style="background:#f1f5f9; color:#64748b; font-size:15px; padding:10px 14px;">
              <small class="mut" style="font-size:12.5px; margin-top:3px; display:block;">* อีเมลใช้เป็นบัญชีเข้าสู่ระบบ ไม่สามารถแก้ไขได้</small>
            </div>

            <div class="stack-sm" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <label style="font-weight:700; color:#0b2545; font-size:15px; margin-bottom:6px; display:block;">เบอร์โทรศัพท์มือถือ</label>
                <input class="form-control" id="prof_tel" value="${esc(me?.tel || '')}" placeholder="เช่น 081-234-5678" style="font-size:16px; padding:10px 14px;">
              </div>
              <div>
                <label style="font-weight:700; color:#0b2545; font-size:15px; margin-bottom:6px; display:block;">เบอร์ต่อภายใน</label>
                <input class="form-control" id="prof_tel_internal" value="${esc(me?.tel_internal || '')}" placeholder="เช่น 8899" style="font-size:16px; padding:10px 14px;">
              </div>
            </div>

            <div>
              <label style="font-weight:700; color:#0b2545; font-size:15px; margin-bottom:6px; display:block;">หน่วยงาน / สังกัด / ฝ่าย</label>
              <input class="form-control" id="prof_org" value="${esc(me?.org || '')}" placeholder="เช่น ฝ่ายโครงสร้างพื้นฐาน อุทยานวิทยาศาสตร์ มน." style="font-size:16px; padding:10px 14px;">
            </div>

            ${(me?.role === 'tech' || me?.role === 'admin') ? `
              <div>
                <label style="font-weight:700; color:#0b2545; font-size:15px; margin-bottom:6px; display:block;">สายงานความชำนาญ ${me?.role === 'admin' ? '(ฝ่ายช่าง / งานเทคนิค)' : '(ช่าง)'}</label>
                <input class="form-control" id="prof_skill" value="${esc(me?.skill || '')}" placeholder="เช่น ระบบปรับอากาศ, ระบบไฟฟ้า, ระบบประปา" style="font-size:16px; padding:10px 14px;">
              </div>
            ` : ''}
          </div>

          <div class="profile-actions-bar" style="margin-top:28px; display:flex; flex-wrap:wrap; gap:10px;">
            <button type="button" class="btn btn-outline" style="min-width:120px; font-size:15.5px;" onclick="setProfileEditMode(false)">ยกเลิก</button>
            <button type="button" class="btn btn-outline" style="border-color:#0284c7; color:#0284c7; font-weight:700; font-size:15px; padding:8px 18px;" onclick="openChangePasswordModal()">🔑 เปลี่ยนรหัสผ่าน</button>
            <button type="submit" class="btn btn-primary" style="min-width:180px; font-size:16px; font-weight:800; background:linear-gradient(135deg, #0b2545 0%, #134074 100%);">💾 บันทึกการเปลี่ยนแปลง</button>
          </div>
        </form>
      </div>
    `;
  }

  // โหมดแสดงข้อมูลปกติ (แสดงทุกข้อมูลที่มี อันไหนไม่มีให้แดช - ไว้)
  return `
    <div class="profile-card-modern">
      <div class="profile-header-banner">
        <div class="profile-avatar-circle">
          ${(me?.name || 'N').charAt(0)}
        </div>
        <div class="profile-header-name">${esc(me?.name || 'ผู้ใช้งาน')}</div>
        <div class="profile-header-role">บทบาท: ${roleDisplay}</div>
      </div>

      <div class="profile-content-body">
        <div class="profile-grid-details">
          <div class="profile-detail-row">
            <span class="profile-label-text"><span>👤</span> ชื่อ - นามสกุล:</span>
            <span class="profile-val-text">${me?.name ? esc(me.name) : '<span class="profile-empty-dash">-</span>'}</span>
          </div>

          <div class="profile-detail-row">
            <span class="profile-label-text"><span>✉️</span> อีเมล (Email):</span>
            <span class="profile-val-text">${emailDisplay !== '-' ? esc(emailDisplay) : '<span class="profile-empty-dash">-</span>'}</span>
          </div>

          <div class="profile-detail-row">
            <span class="profile-label-text"><span>🛡️</span> บทบาทในระบบ:</span>
            <span class="badge badge-doing" style="font-size:13.5px; padding:4px 12px;">${roleDisplay}</span>
          </div>

          <div class="profile-detail-row">
            <span class="profile-label-text"><span>📞</span> เบอร์โทรศัพท์มือถือ:</span>
            <span class="profile-val-text">${me?.tel ? esc(me.tel) : '<span class="profile-empty-dash">-</span>'}</span>
          </div>

          <div class="profile-detail-row">
            <span class="profile-label-text"><span>☎️</span> เบอร์โทรศัพท์ภายใน:</span>
            <span class="profile-val-text">${me?.tel_internal ? esc(me.tel_internal) : '<span class="profile-empty-dash">-</span>'}</span>
          </div>

          <div class="profile-detail-row">
            <span class="profile-label-text"><span>🏢</span> หน่วยงาน / สังกัด:</span>
            <span class="profile-val-text">${me?.org ? esc(me.org) : '<span class="profile-empty-dash">-</span>'}</span>
          </div>

          ${(me?.role === 'tech' || me?.role === 'admin') ? `
            <div class="profile-detail-row">
              <span class="profile-label-text"><span>🔧</span> ความชำนาญ / สายงานช่าง:</span>
              <span class="profile-val-text">${me?.skill ? esc(me.skill) : '<span class="profile-empty-dash">-</span>'}</span>
            </div>
          ` : ''}

          <div class="profile-detail-row">
            <span class="profile-label-text"><span>🟢</span> สถานะบัญชี:</span>
            <span style="color:#10b981; font-weight:700;">✓ ใช้งานได้ปกติ</span>
          </div>
        </div>

        <div class="profile-actions-bar" style="margin-top:24px; display:flex; flex-wrap:wrap; gap:10px;">
          <button type="button" class="btn btn-primary" style="min-width:170px; font-size:15.5px; font-weight:700; background:linear-gradient(135deg, #0b2545 0%, #134074 100%);" onclick="setProfileEditMode(true)">
            ✏️ แก้ไขข้อมูลส่วนตัว
          </button>
          <button type="button" class="btn btn-outline" style="min-width:150px; font-size:15.5px; font-weight:700; border-color:#0284c7; color:#0284c7;" onclick="openChangePasswordModal()">
            🔑 เปลี่ยนรหัสผ่าน
          </button>
          <button type="button" class="btn btn-outline" style="color:var(--danger); border-color:var(--danger); min-width:130px; font-size:15.5px; font-weight:700;" onclick="signOut()">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// Modal เปลี่ยนรหัสผ่านสำหรับทุกยูสเซอร์ (Change Password Modal)
// ==========================================================================
window.openChangePasswordModal = function() {
  const dlg = document.getElementById('dlg');
  if (!dlg) return;

  const currentEmail = me?.email || localStorage.getItem('last_reporter_email') || 'บัญชีของคุณ';

  dlg.innerHTML = `
    <div style="background:#ffffff; color:#0f172a; font-family:'Prompt','Noto Sans Thai',sans-serif; overflow:hidden; border-radius:18px; max-width:440px; margin:0 auto; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #0b2545 0%, #134074 100%); color:#ffffff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">🔑</span>
          <span style="font-size:18px; font-weight:800;">เปลี่ยนรหัสผ่านใหม่</span>
        </div>
        <button type="button" onclick="document.getElementById('dlg').close()" style="background:rgba(255,255,255,0.2); border:none; color:#ffffff; width:34px; height:34px; border-radius:9999px; font-size:22px; line-height:1; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="ปิดหน้าต่าง">&times;</button>
      </div>

      <!-- Body Form -->
      <form onsubmit="submitChangePassword(event)" style="padding:22px 24px;">
        <p style="font-size:14px; color:#64748b; margin-top:0; margin-bottom:18px; line-height:1.5;">
          กำหนดรหัสผ่านใหม่สำหรับ <b>${esc(currentEmail)}</b> (ความยาวอย่างน้อย 6 ตัวอักษร)
        </p>

        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:14px; font-weight:700; color:#0b2545; margin-bottom:6px;">รหัสผ่านใหม่ <span style="color:#ef4444;">*</span></label>
          <div style="position:relative;">
            <input class="form-control" type="password" id="new_pw" name="new_pw" placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร" required minlength="6" autocomplete="new-password" style="padding-right:42px; font-size:15px; height:44px; border-radius:8px;">
            <button type="button" onclick="togglePasswordVis('new_pw', this)" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:18px; color:#64748b; padding:4px;" title="แสดง/ซ่อนรหัสผ่าน">👁️</button>
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <label style="display:block; font-size:14px; font-weight:700; color:#0b2545; margin-bottom:6px;">ยืนยันรหัสผ่านใหม่ <span style="color:#ef4444;">*</span></label>
          <div style="position:relative;">
            <input class="form-control" type="password" id="confirm_new_pw" name="confirm_new_pw" placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน" required minlength="6" autocomplete="new-password" style="padding-right:42px; font-size:15px; height:44px; border-radius:8px;">
            <button type="button" onclick="togglePasswordVis('confirm_new_pw', this)" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:18px; color:#64748b; padding:4px;" title="แสดง/ซ่อนรหัสผ่าน">👁️</button>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:22px; border-top:1px solid #e2e8f0; padding-top:16px;">
          <button type="button" class="btn btn-outline" onclick="document.getElementById('dlg').close()" style="min-width:100px; font-weight:600;">ยกเลิก</button>
          <button type="submit" class="btn btn-primary" id="btn_submit_change_pw" style="min-width:150px; font-weight:800; background:linear-gradient(135deg, #0b2545 0%, #134074 100%);">✓ ยืนยันเปลี่ยนรหัส</button>
        </div>
      </form>
    </div>
  `;

  dlg.showModal();
};

window.togglePasswordVis = function(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁️';
  }
};

window.submitChangePassword = async function(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const p1 = String(f.get('new_pw') || '').trim();
  const p2 = String(f.get('confirm_new_pw') || '').trim();

  if (p1.length < 6) {
    return toast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }
  if (p1 !== p2) {
    return toast('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
  }

  const btn = document.getElementById('btn_submit_change_pw');
  if (btn) {
    btn.disabled = true;
    btn.innerText = 'กำลังเปลี่ยนรหัสผ่าน...';
  }

  try {
    const isDev = (typeof DEV !== 'undefined' && DEV) || (window.CONFIG && window.CONFIG.DEV);
    const { data, error } = await sb.auth.updateUser({ password: p1 });
    if (error) {
      if (isDev) {
        toast('(โหมดทดสอบ) เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว 🔑');
        document.getElementById('dlg')?.close();
        return;
      }
      throw error;
    }
    toast('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว 🔑');
    document.getElementById('dlg')?.close();
  } catch (err) {
    console.error('Change password error:', err);
    toast('เปลี่ยนรหัสผ่านไม่สำเร็จ: ' + (err.message || 'เกิดข้อผิดพลาด'));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '✓ ยืนยันเปลี่ยนรหัส';
    }
  }
};

// ==========================================================================
// Pop-up แสดงรายละเอียดใบงานของผู้แจ้ง (ขึ้นเป็น Modal Popup + ไม่มีปุ่มเบิกวัสดุ)
// ==========================================================================
window.quickTrack = async function (no, email) {
  if (!no) return toast('กรุณาระบุเลขที่ใบแจ้งซ่อม');
  const cleanNo = String(no).trim();
  toast('กำลังโหลดข้อมูลใบงาน ' + cleanNo + '...');

  let data = null;
  const myT = (typeof getMyTickets === 'function') ? getMyTickets() : JSON.parse(localStorage.getItem('myT') || '[]');
  const localItem = myT.find(x => (x.no && x.no.toUpperCase() === cleanNo.toUpperCase()) || (x.id && x.id.toUpperCase() === cleanNo.toUpperCase()));

  // 1. ลองค้นหาผ่าน RPC track_ticket แบบไม่ระบุอีเมล (ค้นหาด้วย id ผ่าน security definer)
  try {
    const res = await sb.rpc('track_ticket', { p_id: cleanNo, p_email: null });
    if (res?.data) {
      const item = Array.isArray(res.data) ? res.data[0] : res.data;
      if (item && item.id) data = item;
    }
  } catch (err) {}

  // 2. ถ้าไม่เจอ ลองดึงจากฐานข้อมูลตาราง tickets โดยตรง
  if (!data) {
    try {
      const { data: ticketData } = await sb.from('tickets').select('*').eq('id', cleanNo).maybeSingle();
      if (ticketData) data = ticketData;
    } catch (err) {}
  }

  // 3. ถ้าไม่เจอ ลองส่ง email เข้าไปใน track_ticket
  if (!data && (email || localItem?.email)) {
    try {
      const res = await sb.rpc('track_ticket', { p_id: cleanNo, p_email: email || localItem?.email });
      if (res?.data) {
        const item = Array.isArray(res.data) ? res.data[0] : res.data;
        if (item && item.id) data = item;
      }
    } catch (err) {}
  }

  // 4. ถ้าใน DB ไม่เจอ แต่มีในตัวแปร T หรือ localItem
  if (!data && typeof T !== 'undefined') {
    data = T.find(x => x.id && x.id.toUpperCase() === cleanNo.toUpperCase()) || null;
  }

  // 5. Fallback: ถ้ายังไม่มี ให้ใช้ข้อมูลจาก localItem ใน localStorage
  if (!data && localItem) {
    const locParts = (localItem.location || '').split(/\s+ชั้น\s+/);
    data = {
      id: localItem.no,
      title: localItem.title,
      details: localItem.details || '',
      desc: localItem.details || '',
      asset_no: localItem.asset_no || '',
      cat: localItem.type,
      bld: localItem.bld || (locParts[0] ? locParts[0].replace(/^อาคาร\s*/, '') : ''),
      flr: localItem.flr || locParts[1] || '',
      room: localItem.room || '',
      area: localItem.area || '',
      remark: localItem.remark || '',
      status: localItem.status || 'accepted',
      created_at: localItem.date,
      email: localItem.email
    };
  }

  if (!data) {
    return toast('ไม่พบข้อมูลใบแจ้งซ่อมเลขที่ ' + cleanNo);
  }

  // นำข้อมูลที่ได้มาเปิดเป็น Pop-up Modal Dialog สวยงาม (ไม่มีปุ่มเบิกวัสดุ)
  // ดึงเบอร์/อีเมลช่างผู้รับผิดชอบ (ถ้ามี) ก่อนเปิดป๊อปอัพ
  try { data._techContact = await getTechContact(data); } catch (e) { data._techContact = null; }
  openReporterTicketModal(data);
};

// ฟังก์ชันเปิด Modal Pop-up รายละเอียดใบงานสำหรับผู้แจ้งซ่อม
window.openReporterTicketModal = function(t) {
  const dlg = document.getElementById('dlg');
  if (!dlg) return;

  const d = t.created_at ? new Date(t.created_at) : null;
  const dateStr = d && !isNaN(d.getTime()) 
    ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    : (t.date || '-');

  const titleText = (typeof getTicketTitle === 'function') ? getTicketTitle(t) : (t.title || 'แจ้งซ่อม/บริการ');
  const descText = (typeof getTicketDesc === 'function') ? getTicketDesc(t) : (t.desc || '-');
  const assetNo = t.items?.[0]?.asset || t.asset_no || t.asset || '';
  const equipType = (typeof getTicketTitle === 'function' ? getTicketTitle(t) : (t.items?.[0]?.item || t.title || t.type || 'อุปกรณ์ทั่วไป'));
  const rep = (typeof getReporterInfo === 'function') ? getReporterInfo(t) : {
    name: t.name || t.reporter_name || '-',
    org: t.org || '-',
    tel: t.tel || '-',
    email: t.email || '-'
  };

  dlg.className = 'act-dialog-wide';
  dlg.innerHTML = `
    <div style="background:#ffffff; color:#0f172a; font-family:'Prompt','Noto Sans Thai',sans-serif; overflow:hidden; border-radius:18px;">
      <!-- แถบหัว Pop-up -->
      <div style="background:linear-gradient(135deg, #7c2d12 0%, #c2410c 45%, #ea580c 100%); color:#ffffff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:20px;">📄</span>
          <span style="font-size:18px; font-weight:800;">รายละเอียดการแจ้งซ่อม: ${esc(t.id || t.no)}</span>
          <button type="button" class="btn-copy-tag" style="background:rgba(255,255,255,0.2); color:#ffffff; border-color:rgba(255,255,255,0.4);" onclick="copyNo('${esc(t.id || t.no)}', event)" title="คัดลอกเลขใบแจ้งซ่อม">📋 คัดลอก</button>
        </div>
        <button type="button" onclick="document.getElementById('dlg').close()" style="background:rgba(255,255,255,0.2); border:none; color:#ffffff; width:34px; height:34px; border-radius:9999px; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="ปิดหน้าต่าง">&times;</button>
      </div>

      <div class="modal-body-wrap" style="padding:20px 24px; max-height:80vh; overflow-y:auto; overflow-x:hidden;">
        <!-- Stepper แนวนอนด้านบน (คงไว้ในทุกการ์ด) -->
        <div style="margin-bottom:16px; border-bottom:1.5px dashed #fed7aa; padding-bottom:12px;">
          ${(typeof steps === 'function') ? steps(t) : ''}
        </div>

        <!-- กล่องข้อมูลหลัก 3 คอลัมน์ -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:18px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
            <div style="font-size:12.5px; color:#64748b; font-weight:700;">เลขที่ใบแจ้งซ่อม</div>
            <div style="font-size:17px; font-weight:800; color:#0b2545; margin-top:2px; display:flex; align-items:center; gap:6px;">
              <span>${esc(t.id || t.no)}</span>
              <button type="button" class="btn-copy-tag" onclick="copyNo('${esc(t.id || t.no)}', event)" title="คัดลอกเลขใบแจ้งซ่อม">📋 คัดลอก</button>
            </div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px;">
            <div style="font-size:12.5px; color:#64748b; font-weight:700;">วันที่แจ้ง</div>
            <div style="font-size:15px; font-weight:700; color:#0f172a; margin-top:2px;">${esc(dateStr)}</div>
          </div>
          <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:12px 14px;">
            <div style="font-size:12.5px; color:#ea580c; font-weight:700;">สถานะปัจจุบัน</div>
            <div style="font-size:15.5px; font-weight:800; color:#c2410c; margin-top:2px;">${(typeof ST !== 'undefined' && ST[t.status]) ? ST[t.status][0] : (t.status || 'รอดำเนินการ')}</div>
          </div>
        </div>

        <!-- ข้อมูลหมายเลขครุภัณฑ์และชนิดอุปกรณ์ -->
        <div style="background:#fff7ed; border:1.5px solid #fed7aa; border-radius:12px; padding:14px 18px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-size:12.5px; color:#c2410c; font-weight:700;">🏷️ หมายเลขครุภัณฑ์ (Asset Number)</div>
            <div style="font-size:17.5px; font-weight:800; color:#9a3412; font-family:monospace; margin-top:2px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              ${assetNo ? `
                <span>${esc(assetNo)}</span>
                <button type="button" class="btn-copy-tag btn-copy-asset" onclick="copyAsset('${esc(assetNo)}', event)" title="คัดลอกเลขครุภัณฑ์">📋 คัดลอก</button>
              ` : '<span style="color:#94a3b8; font-weight:normal; font-size:14px;">- ผู้แจ้งไม่ได้ระบุหมายเลขครุภัณฑ์ -</span>'}
            </div>
          </div>
          <div>
            <div style="font-size:12.5px; color:#64748b; font-weight:700;">⚙️ ชนิดอุปกรณ์ / รายการครุภัณฑ์</div>
            <div style="font-size:16px; font-weight:800; color:#0b2545; margin-top:2px;">
              ${esc(equipType)}
            </div>
          </div>
        </div>

        <!-- รายละเอียดสถานที่และปัญหา -->
        <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:18px;">
          <div style="display:flex; flex-direction:column; gap:10px; font-size:15px; line-height:1.6;">
            <div>
              <b>หัวข้อการแจ้ง:</b> <span style="font-weight:700; color:#0b2545;">${esc(titleText)}</span>
            </div>
            <div>
              <b>ผู้แจ้งซ่อม:</b> <span style="font-weight:700; color:#0b2545;">${esc(rep.name)}</span>
            </div>
            <div>
              <b>หน่วยงาน / สังกัด:</b> <span style="font-weight:700; color:#0b2545;">${esc(rep.org)}</span>
            </div>
            <div>
              <b>เบอร์โทรศัพท์:</b> <a href="tel:${esc(rep.tel.replace(/[^0-9+]/g, ''))}" style="font-weight:700; color:#0284c7; text-decoration:none;" title="แตะเพื่อโทรออก">📞 ${esc(rep.tel)}</a>
            </div>
            <div>
              <b>อีเมล:</b> <span style="color:#334155;">${esc(rep.email)}</span>
            </div>
            <div>
              <b>สถานที่:</b> ${esc(formatTicketLocation(t))}
              ${t.urgent ? '<span class="badge badge-urgent" style="font-size:12px; margin-left:6px;">ด่วน</span>' : ''}
            </div>
            <div>
              <b>ประเภทงาน:</b> ${esc(t.cat || t.sub_type || 'ทั่วไป')}
            </div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; margin-top:4px;">
              <b style="color:#0b2545;">รายละเอียดอาการ / ปัญหา:</b>
              <div style="color:#1e293b; font-weight:600; margin-top:4px;">${esc(descText)}</div>
            </div>
            ${(() => {
              const tRemark = (typeof getTicketRemark === 'function') ? getTicketRemark(t) : (t.remark || t.items?.[0]?.remark || '');
              return tRemark ? `
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 14px; color:#166534; font-size:14.5px; margin-top:4px;">
                  <b>📌 หมายเหตุเพิ่มเติม:</b> ${esc(tRemark)}
                </div>
              ` : '';
            })()}
            ${t.note ? `
              <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px 14px; color:#1e40af; font-size:14.5px;">
                <b>บันทึกความคืบหน้าจากเจ้าหน้าที่:</b> ${esc(t.note)}
              </div>
            ` : ''}
            ${t.tech_name ? `
              <div><b>ช่างผู้รับผิดชอบ:</b> <span style="color:#0284c7; font-weight:700;">${esc(t.tech_name)}</span></div>
              <div><b>📞 เบอร์ช่าง:</b> ${(t._techContact && t._techContact.tel) ? `<a href="tel:${esc(String(t._techContact.tel).replace(/[^0-9+]/g, ''))}" style="color:#0284c7; font-weight:700; text-decoration:none;">${esc(t._techContact.tel)}</a>` : '<span style="color:#94a3b8;">-</span>'}</div>
              <div><b>✉️ อีเมลช่าง:</b> ${(t._techContact && t._techContact.email) ? `<a href="mailto:${esc(t._techContact.email)}" style="color:#334155; text-decoration:none;">${esc(t._techContact.email)}</a>` : '<span style="color:#94a3b8;">-</span>'}</div>
            ` : ''}
          </div>

          <!-- รูปภาพประกอบตอนแจ้ง -->
          <div style="margin-top:16px; border-top:1px dashed #e2e8f0; padding-top:12px;">
            <b style="font-size:14px; color:#475569;">📷 รูปภาพประกอบที่แนบมาตอนแจ้ง:</b>
            ${(t.photos && t.photos.length) ? `
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
                ${t.photos.map(p => `<img src="${url(p)}" onclick="zoom('${p}')" style="width:80px; height:80px; object-fit:cover; border-radius:8px; cursor:zoom-in; border:1px solid #cbd5e1;" title="คลิกดูภาพใหญ่">`).join('')}
              </div>
            ` : `
              <div style="color:#94a3b8; font-size:14px; margin-top:4px;">- ไม่มีรูปภาพประกอบตอนแจ้ง -</div>
            `}
          </div>

          <!-- รูปภาพผลงานตอนเสร็จสิ้น (ที่ช่างใส่ไว้) -->
          <div style="margin-top:16px; border-top:1px dashed #e2e8f0; padding-top:12px;">
            <b style="font-size:14px; color:#10b981;">📷 รูปผลงานตอนช่างทำงานเสร็จสิ้น:</b>
            ${(t.done_photos && t.done_photos.length) ? `
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
                ${t.done_photos.map(p => `<img src="${url(p)}" onclick="zoom('${p}')" style="width:80px; height:80px; object-fit:cover; border-radius:8px; cursor:zoom-in; border:1.5px solid #10b981;" title="คลิกดูภาพใหญ่">`).join('')}
              </div>
            ` : `
              <div style="color:#94a3b8; font-size:14px; margin-top:4px;">- ช่างไม่ได้แนบรูปภาพตอนเสร็จสิ้น -</div>
            `}
          </div>
        </div>

        <!-- ปุ่มปิดหน้าต่าง (ไม่มีปุ่มเบิกวัสดุสำหรับผู้แจ้ง) -->
        <div style="text-align:center; margin-top:16px;">
          <button type="button" class="btn btn-outline" style="min-width:140px; font-size:15px; font-weight:700; padding:10px 24px;" onclick="document.getElementById('dlg').close()">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  `;

  dlg.showModal();
};

window.trackT = async function (e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const no = (f.get('no') || '').trim();
  quickTrack(no, '');
};

window.cancelMyTicket = async function (id) {
  if (!confirm('คุณต้องการ "ยกเลิก" ใบงานนี้ใช่หรือไม่?')) return;
  try {
    await sb.rpc('cancel_my_ticket', { p_id: id, p_email: lastTrackEmail });
  } catch (err) {}
  toast('ยกเลิกใบงานเรียบร้อยแล้ว');
  found = null;
  render();
};

window.vHome = vHome;
window.vReport = vReport;
window.vTrack = vTrack;
window.vHistory = vHistory;
window.vProfile = vProfile;