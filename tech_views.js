// ==========================================================================
// tech_views.js - Views for Technician (Screen 3 & Screen 4) + Login
// ==========================================================================

let activeTaskDetailId = null;
let techPoolFilter = 'all'; // 'all' | 'pending' | 'urgent' | 'due'
let techSearchQuery = '';

window.setTechPoolFilter = function(f) {
  techPoolFilter = f;
  render();
};

window.setTechSearch = function(q) {
  techSearchQuery = (q || '').toLowerCase();
  render();
};

window.viewTaskDetail = function(id) {
  activeTaskDetailId = id;
  tab = 'task_detail';
  render();
};

window.closeTaskDetail = function() {
  activeTaskDetailId = null;
  tab = 'pool';
  render();
};

// Screen 3: งานที่รับได้ (Technician Task Pool)
function vPool() {
  const allAccepted = T.filter(t => t.status === 'accepted' && !t.tech_name);

  const poolTasks = allAccepted;

  let filtered = poolTasks;
  if (techPoolFilter === 'urgent') filtered = poolTasks.filter(t => t.urgent);
  if (techSearchQuery) {
    filtered = filtered.filter(t => 
      t.id.toLowerCase().includes(techSearchQuery) || 
      (t.items?.[0]?.item || '').toLowerCase().includes(techSearchQuery) ||
      (t.bld || '').toLowerCase().includes(techSearchQuery)
    );
  }

  const urgentCount = poolTasks.filter(t => t.urgent).length;
  const techName = me?.name || 'ช่างซ่อมบำรุง';

  return `
    <div class="content-card">
      <div class="card-header-row" style="margin-bottom:20px; flex-wrap:wrap; gap:10px;">
        <h2 style="font-size:22px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>🧰</span> งานที่รับได้
        </h2>
        <div style="font-size:15px; font-weight:600; color:var(--text-muted); display:flex; align-items:center; gap:8px;">
          <div class="user-avatar" style="width:34px; height:34px; font-size:15px;">👷</div>
          <span>ช่าง: <b>${esc(techName)}</b></span>
        </div>
      </div>

      <!-- Filter pills & Search bar (Screen 3 Top) -->
      <div class="filter-bar">
        <div class="filter-pills">
          <button class="filter-pill ${techPoolFilter === 'all' ? 'active' : ''}" onclick="setTechPoolFilter('all')">
            ทั้งหมด (${poolTasks.length})
          </button>
          <button class="filter-pill ${techPoolFilter === 'pending' ? 'active' : ''}" onclick="setTechPoolFilter('pending')">
            รอดำเนินการ (${poolTasks.length})
          </button>
          <button class="filter-pill ${techPoolFilter === 'urgent' ? 'active' : ''}" onclick="setTechPoolFilter('urgent')">
            ด่วน (${urgentCount})
          </button>
        </div>

        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input class="form-control" placeholder="ค้นหาเลขที่งาน / สถานที่..." value="${esc(techSearchQuery)}" oninput="setTechSearch(this.value)">
        </div>
      </div>

      <!-- Task Card Rows (Screen 3 Middle - Detailed for Technicians) -->
      <div style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
        ${filtered.map(t => {
          const itemObj = t.items?.[0] || {};
          const title = itemObj.item || t.title || 'แจ้งซ่อม';
          const sym = itemObj.sym || t.details || t.note || 'ไม่มีรายละเอียดเพิ่มเติม';
          const asset = itemObj.asset ? `[รหัสครุภัณฑ์: ${itemObj.asset}]` : '';
          const cat = t.types?.[0] || t.sub_type || t.cat || 'งานซ่อมบำรุง';
          const loc = `อาคาร ${t.bld || 'A'} ชั้น ${t.flr || '1'}${t.room ? ' ห้อง/บริเวณ ' + t.room : ''}`;
          const dateStr = fmt(t.created_at) || t.date || '-';
          const reporter = t.name ? `${t.name} (โทร: ${t.tel || '-'})` : 'ไม่ระบุ';
          const hasPhoto = t.photos && t.photos.length > 0;
          const photoThumb = hasPhoto ? url(t.photos[0]) : null;

          return `
            <div class="pool-job-card" style="background:#ffffff; border:1.5px solid var(--border); border-left:5px solid ${t.urgent ? 'var(--danger)' : 'var(--primary)'}; border-radius:14px; padding:18px 20px; box-shadow:0 3px 12px rgba(0,0,0,0.04); transition:all 0.2s ease;">
              <!-- Header Row: ID, Badges, Date -->
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <b style="font-size:17.5px; color:var(--primary); font-weight:800; cursor:pointer;" onclick="viewTaskDetail('${t.id}')">${esc(t.id)}</b>
                  <span class="badge ${t.cat === 'ติดตั้ง/ต่อเติม' ? 'badge-install' : 'badge-doing'}" style="font-size:13.5px;">🏷️ ${esc(cat)}</span>
                  ${t.urgent ? '<span class="badge badge-urgent"><span class="badge-dot"></span> ด่วน</span>' : '<span class="badge badge-normal"><span class="badge-dot"></span> ปกติ</span>'}
                </div>
                <div style="font-size:13.5px; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                  <span>🕒</span>
                  <span>แจ้งเมื่อ: ${esc(dateStr)}</span>
                </div>
              </div>

              <!-- Main Body: Problem details & Location & Photo -->
              <div style="display:grid; grid-template-columns: ${hasPhoto ? '1fr 100px' : '1fr'}; gap:16px; align-items:start;">
                <div>
                  <!-- Title / สิ่งที่ต้องทำ -->
                  <div style="font-size:17px; font-weight:800; color:var(--text-main); margin-bottom:8px; line-height:1.4;">
                    🛠️ สิ่งที่ต้องทำ: <span style="color:var(--text-main);">${esc(title)}</span>
                    ${asset ? `<span style="font-size:13.5px; color:var(--text-muted); font-weight:600; margin-left:6px;">${esc(asset)}</span>` : ''}
                  </div>

                  <!-- Details / รายละเอียดอาการปัญหา -->
                  <div style="background:var(--bg-subtle); border-radius:10px; padding:12px 14px; margin-bottom:12px; border:1px solid #e2e8f0;">
                    <div style="font-size:13.5px; font-weight:700; color:var(--primary); margin-bottom:4px;">📋 รายละเอียดงาน / อาการเสีย:</div>
                    <div style="font-size:15.5px; color:var(--text-main); line-height:1.6; font-weight:500;">${esc(sym)}</div>
                  </div>

                  <!-- Meta Info: Location & Reporter -->
                  <div style="display:flex; flex-wrap:wrap; gap:14px 20px; font-size:14.5px; color:var(--text-muted);">
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span>🏢</span>
                      <span><b>สถานที่:</b> ${esc(loc)}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <span>👤</span>
                      <span><b>ผู้แจ้ง:</b> ${esc(reporter)}</span>
                    </div>
                  </div>
                </div>

                <!-- Optional Photo Thumbnail -->
                ${hasPhoto ? `
                  <div style="text-align:center;">
                    <img src="${photoThumb}" style="width:90px; height:90px; object-fit:cover; border-radius:10px; border:1px solid var(--border); cursor:zoom-in; box-shadow:0 2px 6px rgba(0,0,0,0.06);" onclick="zoom('${t.photos[0]}')" title="คลิกเพื่อดูรูปภาพขนาดเต็ม" alt="รูปปัญหา">
                    <span style="font-size:12px; color:var(--text-muted); display:block; margin-top:4px;">🔍 ดูรูป</span>
                  </div>
                ` : ''}
              </div>

              <!-- Action Buttons Row -->
              <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:14px; padding-top:12px; border-top:1px dashed var(--border); flex-wrap:wrap;">
                <button type="button" class="btn btn-outline btn-sm" onclick="viewTaskDetail('${t.id}')" style="font-weight:700;">
                  📄 รายละเอียดฉบับเต็ม
                </button>
                <button type="button" class="btn btn-primary" onclick="claim('${t.id}')" style="font-weight:700; padding:8px 22px;">
                  ✓ รับงานนี้
                </button>
              </div>
            </div>
          `;
        }).join('') || '<div class="mut" style="text-align:center; padding:40px; font-size:16px;">ไม่มีงานรอรับในหมวดนี้</div>'}
      </div>
    </div>
  `;
}

// Screen 4: รายละเอียดงาน (Task Detail View)
function vTaskDetail() {
  const id = activeTaskDetailId;
  const t = T.find(x => x.id === id);
  if (!t) {
    return `
      <div style="max-width:900px; margin:0 auto;">
        <div style="margin-bottom:14px;">
          <button class="btn btn-outline btn-sm" onclick="closeTaskDetail()">← กลับไปยังรายการ</button>
        </div>
        <div class="content-card" style="text-align:center; padding:48px;">
          <div style="font-size:40px; margin-bottom:12px;">🔍</div>
          <div style="font-weight:700; font-size:18px; margin-bottom:8px;">ไม่พบข้อมูลงาน</div>
          <div class="mut" style="font-size:15px;">งานนี้อาจถูกรับไปแล้วหรือถูกยกเลิก</div>
        </div>
      </div>
    `;
  }

  const title = t.items?.[0]?.item || '-';
  const sym = t.items?.[0]?.sym || '-';
  const loc = `อาคาร ${t.bld || ''} ชั้น ${t.flr || ''}${t.room ? ' ' + t.room : ''}`;
  const reporterName = t.name || '-';
  const reporterTel = t.tel || '-';
  const dateStr = fmt(t.created_at) || '-';

  const photoUrl = t.photos?.length ? url(t.photos[0]) : null;

  return `
    <div style="max-width:900px; margin:0 auto;">
      <div style="margin-bottom:14px;">
        <button class="btn btn-outline btn-sm" onclick="closeTaskDetail()">← กลับไปยังรายการ</button>
      </div>

      <div class="content-card">
        <h2 style="font-size:22px; font-weight:800; margin-bottom:20px; display:flex; align-items:center; gap:8px;">
          <span>📋</span> รายละเอียดงาน
        </h2>

        <!-- 2-column Detail Card (Screen 4 Layout) -->
        <div class="task-detail-container">
          <!-- Left: Photo Preview -->
          <div>
            ${photoUrl
              ? `<img src="${photoUrl}" alt="รูปภาพปัญหา" class="task-preview-photo" onclick="zoom('${t.photos?.[0] || ''}')" style="cursor:zoom-in;">
                 <span class="mut" style="font-size:13px; display:block; text-align:center; margin-top:6px;">คลิกเพื่อดูรูปขนาดเต็ม</span>`
              : `<div class="task-preview-photo" style="display:flex; align-items:center; justify-content:center; background:var(--bg-subtle); border:1px dashed var(--border); border-radius:var(--radius-md);">
                   <span style="font-size:36px; opacity:0.3;">📷</span>
                 </div>
                 <span class="mut" style="font-size:13px; display:block; text-align:center; margin-top:6px;">ไม่มีรูปภาพ</span>`
            }
          </div>

          <!-- Right: Ticket Information -->
          <div style="display:flex; flex-direction:column; gap:12px; font-size:16px;">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <b style="font-size:18px; color:var(--text-main);">เลขที่งาน : ${esc(t.id)}</b>
              ${t.urgent ? '<span class="badge badge-urgent"><span class="badge-dot"></span> ด่วน</span>' : '<span class="badge badge-normal">ปกติ</span>'}
              <span class="badge badge-doing" style="margin-left:auto;">${esc(t.cat || 'ซ่อมแซม')}</span>
            </div>

            <div><b class="mut">หัวข้อ :</b> <span style="font-weight:700; font-size:17px; color:var(--primary);">${esc(title)}</span></div>
            <div><b class="mut">สถานที่ :</b> <span style="font-weight:600;">${esc(loc)}</span></div>
            <div><b class="mut">ผู้แจ้ง :</b> <span>${esc(reporterName)} (${esc(reporterTel)})</span></div>
            <div><b class="mut">วันที่แจ้ง :</b> <span style="color:var(--text-muted);">${esc(dateStr)}</span></div>

            <div style="margin-top:8px; background:var(--bg-subtle); padding:14px; border-radius:var(--radius-md); border:1px solid var(--border);">
              <b style="display:block; margin-bottom:6px; color:var(--text-main); font-size:16px;">รายละเอียดปัญหา:</b>
              <div style="color:var(--text-main); line-height:1.6; font-size:15.5px;">${esc(sym)}</div>
            </div>

            <!-- Action Buttons at bottom of details -->
            <div class="row sp" style="margin-top:20px; border-top:1px solid var(--border); padding-top:16px; flex-wrap:wrap; gap:10px;">
              <button class="btn btn-outline" style="color:var(--danger); border-color:var(--border);" onclick="closeTaskDetail()">กลับ</button>
              <div class="row" style="gap:8px; flex-wrap:wrap;">
                ${t.status === 'accepted' ? `
                  <button class="btn btn-primary" onclick="claim('${t.id}'); closeTaskDetail();">รับงานนี้ 🚀</button>
                ` : `
                  <button class="btn btn-outline" onclick="openMat('${t.id}')">📦 เบิกวัสดุ</button>
                  <button class="btn btn-primary" onclick="openAct('${t.id}')">📝 อัปเดตสถานะ</button>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Screen: งานของฉัน (In Progress Tasks)
function vMine() {
  const isDevOrAdmin = me?.dev || me?.role === 'admin';
  const a = T.filter(t => (isDevOrAdmin ? (t.tech_name === me?.name || t.tech_id === me?.id || (me?.role === 'admin' && t.status === 'doing')) : t.tech_id === me?.id) && ['accepted', 'doing'].includes(t.status)), by = {};
  
  a.forEach(t => (by[`อาคาร ${t.bld} ชั้น ${t.flr}`] ??= []).push(t));
  const ks = Object.keys(by).sort();

  return `
    <div class="content-card">
      <div class="card-header-row" style="flex-wrap:wrap; gap:8px;">
        <h2 style="font-size:22px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>🛠️</span> งานของฉัน (กำลังดำเนินการ)
        </h2>
        <span class="badge badge-doing" style="font-size:15px; padding:6px 14px;">${a.length} งาน</span>
      </div>

      ${ks.map((k, i) => `
        <div style="margin-top:24px; margin-bottom:14px;">
          <h3 style="font-size:17px; font-weight:700; color:var(--primary); display:flex; align-items:center; gap:6px;">
            <span>📍</span> ${esc(k)} <span class="mut" style="font-size:15px; font-weight:normal;">(${by[k].length} งาน)</span>
          </h3>
        </div>
        ${by[k].map(t => card(t)).join('')}
      `).join('') || '<div class="mut" style="text-align:center; padding:40px; font-size:16px;">ไม่มีงานที่กำลังดำเนินการอยู่ในขณะนี้</div>'}
    </div>
  `;
}

// ==========================================================================
// Screen: ประวัติงานที่ทำเสร็จ (ของช่าง) - เรียงใหม่สุดขึ้นก่อน + ลิสต์ย่อ + กรองตามเดือน
// ==========================================================================
let techDoneMonthFilter = 'all';
window.setTechDoneMonth = function(m) {
  techDoneMonthFilter = m;
  render();
};

window.toggleTechDoneDetail = function(id) {
  const body = document.getElementById('done_body_' + id);
  const btn = document.getElementById('done_btn_' + id);
  if (body) {
    const isOpen = body.classList.contains('open');
    if (isOpen) {
      body.classList.remove('open');
      if (btn) btn.innerHTML = 'ดูรายละเอียด ▾';
    } else {
      body.classList.add('open');
      if (btn) btn.innerHTML = 'ย่อรายละเอียด ▴';
    }
  }
};

function vTechDone() {
  const isDevOrAdmin = me?.dev || me?.role === 'admin';
  // กรองเฉพาะงานที่เสร็จสิ้นแล้วของช่าง
  let list = T.filter(t => (isDevOrAdmin ? (t.tech_name === me?.name || t.tech_id === me?.id || (me?.role === 'admin' && (t.status === 'done' || t.status === 'closed'))) : t.tech_id === me?.id) && (t.status === 'done' || t.status === 'closed'));

  // 1. เรียงลำดับ: ให้อันใหม่ขึ้นบนสุด อันเก่าจะอยู่ล่าง (sort descending)
  list.sort((a, b) => {
    const tA = new Date(a.done_at || a.updated_at || a.created_at || 0).getTime();
    const tB = new Date(b.done_at || b.updated_at || b.created_at || 0).getTime();
    return tB - tA;
  });

  // รวบรวมรายชื่อเดือนที่มีงานทำเสร็จสำหรับตัวเลือก Dropdown
  const monthMap = new Map();
  list.forEach(t => {
    const d = new Date(t.done_at || t.created_at);
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      monthMap.set(key, label);
    }
  });

  const allCount = list.length;

  // กรองตามเดือนที่เลือก
  if (techDoneMonthFilter !== 'all') {
    list = list.filter(t => {
      const d = new Date(t.done_at || t.created_at);
      if (isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === techDoneMonthFilter;
    });
  }

  const monthOptions = Array.from(monthMap.entries()).map(([k, lbl]) => `
    <option value="${k}" ${techDoneMonthFilter === k ? 'selected' : ''}>เดือน ${lbl}</option>
  `).join('');

  return `
    <div class="content-card">
      <div class="card-header-row" style="flex-wrap:wrap; gap:8px;">
        <h2 style="font-size:22px; font-weight:800; display:flex; align-items:center; gap:8px;">
          <span>✅</span> ประวัติงานที่ทำเสร็จ
        </h2>
        <span class="badge badge-done" style="font-size:15px; padding:6px 14px;">รวม ${list.length} งาน</span>
      </div>

      <!-- Filter Bar: ดูทั้งหมด หรือ เลือกกรองดูของเดือนนั้นๆ -->
      <div class="done-filter-bar">
        <div class="done-filter-left">
          <button type="button" class="done-filter-pill ${techDoneMonthFilter === 'all' ? 'active' : ''}" onclick="setTechDoneMonth('all')">
            ดูทั้งหมด (${allCount})
          </button>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:14px; font-weight:700; color:#475569;">กรองตามเดือน:</span>
          <select class="done-month-select" onchange="setTechDoneMonth(this.value)">
            <option value="all" ${techDoneMonthFilter === 'all' ? 'selected' : ''}>-- ทุกช่วงเวลา (${allCount}) --</option>
            ${monthOptions}
          </select>
        </div>
      </div>

      <!-- Compact List View (ลิสต์เล็กๆ ก่อน กดดูแล้วค่อยขึ้นรายละเอียดทั้งหมด) -->
      <div class="done-compact-list">
        ${list.length ? list.map(t => {
          const doneDateStr = t.done_at 
            ? fmt(t.done_at) 
            : (t.created_at ? fmt(t.created_at) : '-');
          
          const usedMats = (typeof U !== 'undefined' ? U : []).filter(u => u.ticket_id === t.id);

          return `
            <div class="done-compact-item" id="done_item_${t.id}">
              <!-- Header แถบเล็กกดดูได้ -->
              <div class="done-compact-header" onclick="toggleTechDoneDetail('${t.id}')">
                <div class="done-compact-left">
                  <span class="done-compact-id">${esc(t.id)}</span>
                  <span class="badge badge-done" style="font-size:12px; padding:3px 8px;">✓ เสร็จสิ้น</span>
                  <span class="done-compact-title">${esc(t.title || 'แจ้งซ่อม')}</span>
                  <span class="done-compact-loc">📍 อาคาร ${esc(t.bld || '-')} ชั้น ${esc(t.flr || '-')} (ห้อง ${esc(t.room || '-')})</span>
                </div>
                <div class="done-compact-right">
                  <span class="done-compact-date">🕒 ${doneDateStr}</span>
                  <button type="button" class="done-expand-btn" id="done_btn_${t.id}">ดูรายละเอียด ▾</button>
                </div>
              </div>

              <!-- Collapsible Body รายละเอียดทั้งหมด -->
              <div class="done-compact-body" id="done_body_${t.id}">
                <div style="display:grid; grid-template-columns: 1fr; gap:14px;">
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
                    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                      <b style="color:#0b2545; font-size:16px;">ข้อมูลใบงานและการดำเนินงาน</b>
                      <span class="mut" style="font-size:13.5px;">ผู้แจ้ง: <b>${esc(t.name || t.reporter_name || t.email || '-')}</b> (โทร: ${esc(t.tel || '-')})</span>
                    </div>
                    <div style="font-size:14.5px; line-height:1.6; color:#334155;">
                      <div><b>รายละเอียดอาการ/ปัญหา:</b> ${esc(t.desc || '-')}</div>
                      ${t.note ? `<div style="margin-top:4px; color:#0369a1;"><b>บันทึกช่าง/หมายเหตุ:</b> ${esc(t.note)}</div>` : ''}
                      ${t.budget ? `<div style="margin-top:4px;"><b>งบประมาณที่ใช้:</b> ${Number(t.budget).toLocaleString()} บาท</div>` : ''}
                    </div>

                    ${(t.photos && t.photos.length) ? `
                      <div style="margin-top:12px;">
                        <b style="font-size:13px; color:#475569;">📷 รูปภาพตอนแจ้ง:</b>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:4px;">
                          ${t.photos.map(p => `<img src="${url(p)}" onclick="zoom('${p}')" style="width:70px; height:70px; object-fit:cover; border-radius:6px; cursor:zoom-in; border:1px solid #cbd5e1;">`).join('')}
                        </div>
                      </div>
                    ` : ''}

                    ${(t.done_photos && t.done_photos.length) ? `
                      <div style="margin-top:12px;">
                        <b style="font-size:13px; color:#10b981;">📷 รูปผลงานหลังดำเนินการเสร็จ:</b>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:4px;">
                          ${t.done_photos.map(p => `<img src="${url(p)}" onclick="zoom('${p}')" style="width:70px; height:70px; object-fit:cover; border-radius:6px; cursor:zoom-in; border:1.5px solid #10b981;">`).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>

                  <!-- รายการวัสดุที่ใช้ไปในงานนี้ -->
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
                    <b style="color:#0b2545; font-size:15px; display:flex; align-items:center; gap:6px;">
                      <span>📦</span> รายการวัสดุอุปกรณ์ที่ใช้ในงานนี้ (${usedMats.length} รายการ)
                    </b>
                    ${usedMats.length ? `
                      <div style="margin-top:10px; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; font-size:14px;">
                          <thead>
                            <tr style="background:#f8fafc; text-align:left; color:#64748b;">
                              <th style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">วัสดุ</th>
                              <th style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">จำนวน</th>
                              <th style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">หน่วย</th>
                              <th style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">ผู้เบิก</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${usedMats.map(u => `
                              <tr>
                                <td style="padding:6px 10px; border-bottom:1px solid #f1f5f9; font-weight:600;">${esc(u.name)}</td>
                                <td style="padding:6px 10px; border-bottom:1px solid #f1f5f9; color:#0284c7; font-weight:700;">${u.qty}</td>
                                <td style="padding:6px 10px; border-bottom:1px solid #f1f5f9;">${esc(u.unit)}</td>
                                <td style="padding:6px 10px; border-bottom:1px solid #f1f5f9; color:#64748b;">${esc(u.tech_name || '-')}</td>
                              </tr>
                            `).join('')}
                          </tbody>
                        </table>
                      </div>
                    ` : '<div class="mut" style="font-size:13px; margin-top:6px;">ไม่มีการเบิกใช้วัสดุอุปกรณ์</div>'}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="content-card" style="text-align:center; padding:40px; color:#64748b; font-size:16px;">
            ${techDoneMonthFilter === 'all' ? 'ยังไม่มีประวัติงานที่ทำเสร็จ' : 'ไม่มีงานที่ทำเสร็จในเดือนที่เลือก'}
          </div>
        `}
      </div>
    </div>
  `;
}

// Claim function
window.claim = async function (id) {
  const t = T.find(x => x.id === id);
  const p = {
    tech_name: me?.name || 'ช่างซ่อมบำรุง',
    status: 'doing',
    history: logh(t, 'doing')
  };
  if (typeof isUUID === 'function' && isUUID(me?.id)) {
    p.tech_id = me.id;
  }

  try {
    const res = await sb.from('tickets').update(p).eq('id', id).select();
    if (res?.error) {
      console.warn('claim update warning:', res.error);
    }
  } catch (err) {
    console.warn('claim error:', err);
  }

  if (t) {
    Object.assign(t, p);
    if (!p.tech_id) t.tech_id = me?.id || 'tech-1';
  }
  toast('รับงานสำเร็จ! สถานะเปลี่ยนเป็น: กำลังดำเนินการ');
  if (typeof broadcastTicketUpdate === 'function') broadcastTicketUpdate();
  go();
};

// ==========================================================================
// Modal: Material Requisition (openMat) - ตัวหนังสือใหญ่ อ่านง่าย ชัดเจน
// ==========================================================================
let mRowCounter = 0;
window.matRowChange = function (sel, idx) {
  const customInput = document.getElementById('mcustom_' + idx);
  if (customInput) customInput.style.display = sel.value === 'อื่นๆ' ? 'block' : 'none';
};

window.addMatRow = function (name = '', qty = '', unit = '') {
  mRowCounter++;
  const idx = mRowCounter;
  const matOpts = MATS.map(m => `<option value="${m}" ${name === m ? 'selected' : ''}>${m}</option>`).join('');
  const isOther = name && !MATS.includes(name);

  const html = `
    <div class="mat-row" id="mrow_${idx}" style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:10px; padding:12px 14px; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:10px;">
      <div style="flex:2.2; min-width:180px;">
        <label style="font-size:13px; font-weight:700; color:#475569; margin-bottom:4px; display:block;">เลือกวัสดุ/อะไหล่</label>
        <select class="form-control m-name" onchange="matRowChange(this, ${idx})" style="padding:10px 12px; font-size:15.5px; height:46px;">
          <option value="">-- เลือกวัสดุ --</option>
          ${matOpts}
          <option value="อื่นๆ" ${isOther ? 'selected' : ''}>อื่นๆ (ระบุเอง)</option>
        </select>
        <input class="form-control m-custom" id="mcustom_${idx}" value="${esc(isOther ? name : '')}" placeholder="ระบุชื่อวัสดุ..." style="display:${isOther ? 'block' : 'none'}; margin-top:6px; padding:8px 12px; font-size:15px;">
      </div>
      <div style="flex:1; min-width:95px;">
        <label style="font-size:13px; font-weight:700; color:#475569; margin-bottom:4px; display:block;">จำนวน</label>
        <input class="form-control m-qty" type="number" min="0.01" step="any" value="${qty}" placeholder="จำนวน" style="padding:10px 12px; font-size:16px; font-weight:700; color:#0b2545; height:46px;">
      </div>
      <div style="flex:1; min-width:95px;">
        <label style="font-size:13px; font-weight:700; color:#475569; margin-bottom:4px; display:block;">หน่วยนับ</label>
        <input class="form-control m-unit" value="${esc(unit)}" placeholder="เช่น ชิ้น, ม้วน" style="padding:10px 12px; font-size:15px; height:46px;">
      </div>
      <div style="width:42px; text-align:center; padding-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" style="color:var(--danger); border-color:#cbd5e1; width:40px; height:40px; padding:0; font-size:16px;" onclick="removeMatRow(${idx})" title="ลบแถวนี้">✕</button>
      </div>
    </div>
  `;
  const container = document.getElementById('mat_rows_container');
  if (container) container.insertAdjacentHTML('beforeend', html);
};

window.removeMatRow = function (idx) {
  const container = document.getElementById('mat_rows_container');
  if (container && container.querySelectorAll('.mat-row').length <= 1) return toast('ต้องมีรายการเบิกอย่างน้อย 1 แถว');
  const row = document.getElementById('mrow_' + idx);
  if (row) row.remove();
};

window.setMatRowCount = function (totalCount) {
  const container = document.getElementById('mat_rows_container');
  if (!container) return;
  const currentCount = container.querySelectorAll('.mat-row').length;
  if (totalCount > currentCount) {
    for (let i = 0; i < (totalCount - currentCount); i++) addMatRow();
  }
};

window.openMat = function (id) {
  const t = (typeof T !== 'undefined' ? T.find(x => x.id === id) : null) || (typeof found !== 'undefined' && found?.id === id ? found : { id });
  const us = (typeof U !== 'undefined' ? U : []).filter(u => u.ticket_id === id);
  mRowCounter = 0;

  // นำ dialog สไตล์กว้างและฟอนต์ใหญ่มาใช้
  $('#dlg').className = 'act-dialog-wide';
  $('#dlg').innerHTML = `
    <div style="padding:20px 24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1.5px solid #e2e8f0; padding-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:20px; font-weight:800; color:#0b2545;">📦 เบิกวัสดุอุปกรณ์: ${esc(id)}</span>
          <span class="badge badge-doing" style="font-size:13.5px; padding:4px 10px;">${t.cat === 'ติดตั้ง/ต่อเติม' ? '🛠️ งานติดตั้ง' : '🔧 งานซ่อม'}</span>
        </div>
        <button type="button" onclick="document.querySelector('#dlg').close()" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b;">&times;</button>
      </div>

      <!-- ส่วนที่ 1: รายการที่เคยเบิกไปแล้ว (มองง่าย ชัดเจน ฟอนต์ใหญ่ขึ้น) -->
      <div class="mat-history-card">
        <div class="mat-history-header">
          <span style="display:flex; align-items:center; gap:8px;">
            <span>📋</span> ประวัติวัสดุที่เคยเบิกไปแล้วในใบงานนี้
          </span>
          <span class="badge badge-done" style="font-size:13px; padding:4px 10px;">รวม ${us.length} รายการ</span>
        </div>
        ${us.length ? `
          <div style="max-height:190px; overflow-y:auto;">
            <table class="mat-history-table">
              <thead>
                <tr>
                  <th style="width:45px; text-align:center;">ลำดับ</th>
                  <th>ชื่อวัสดุ / อุปกรณ์</th>
                  <th style="text-align:right;">จำนวนที่เบิก</th>
                  <th>หน่วย</th>
                  <th>ผู้ทำรายการเบิก</th>
                  <th>วัน-เวลา</th>
                </tr>
              </thead>
              <tbody>
                ${us.map((u, i) => `
                  <tr>
                    <td style="text-align:center; color:#64748b; font-weight:600;">${i + 1}</td>
                    <td style="font-weight:700; color:#0f172a; font-size:15.5px;">${esc(u.name)}</td>
                    <td style="text-align:right;" class="mat-qty-highlight">${u.qty}</td>
                    <td style="font-weight:600; color:#475569;">${esc(u.unit)}</td>
                    <td style="color:#0369a1; font-weight:600;">${esc(u.tech_name || 'ช่างซ่อมบำรุง')}</td>
                    <td style="color:#64748b; font-size:13.5px;">${fmt(u.created_at)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div style="padding:20px; text-align:center; color:#64748b; font-size:15px; font-weight:600; background:#ffffff;">
            (ยังไม่มีประวัติการเบิกวัสดุในใบงานนี้ — สามารถเพิ่มรายการเบิกใหม่ด้านล่างได้ทันที)
          </div>
        `}
      </div>

      <!-- ส่วนที่ 2: ฟอร์มเลือกเบิกวัสดุใหม่ -->
      <div style="border:1.5px solid #cbd5e1; padding:18px; border-radius:12px; margin-bottom:16px; background:#f8fafc;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <label style="margin:0; font-weight:800; font-size:16px; color:#0b2545; display:flex; align-items:center; gap:6px;">
            <span>➕</span> เพิ่มรายการเบิกวัสดุใหม่
          </label>
          <div style="display:flex; align-items:center; gap:6px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="addMatRow()">+1 แถว</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="setMatRowCount(3)">3 แถว</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="setMatRowCount(5)">5 แถว</button>
          </div>
        </div>

        <div id="mat_rows_container"></div>

        <div style="display:flex; gap:10px; margin-top:14px;">
          <button type="button" class="btn btn-outline" style="font-size:15px;" onclick="addMatRow()">+ เพิ่มแถววัสดุ</button>
          <button type="button" class="btn btn-primary" style="flex:1; font-size:16px; font-weight:800; background:linear-gradient(135deg, #0b2545 0%, #134074 100%);" onclick="saveMat('${id}')">💾 ยืนยันบันทึกการเบิกวัสดุ</button>
        </div>
      </div>

      <div style="text-align:right;">
        <button type="button" class="btn btn-outline" style="font-size:15px; min-height:42px; padding:8px 20px;" onclick="document.querySelector('#dlg').close()">ปิดหน้าต่าง</button>
      </div>
    </div>
  `;

  addMatRow();
  $('#dlg').showModal();
};

window.saveMat = async function (id) {
  const container = document.getElementById('mat_rows_container');
  if (!container) return;
  const rows = container.querySelectorAll('.mat-row');
  const itemsToSave = [];

  rows.forEach(r => {
    let name = r.querySelector('.m-name').value;
    if (name === 'อื่นๆ') name = (r.querySelector('.m-custom').value || '').trim();
    const qty = parseFloat(r.querySelector('.m-qty').value);
    const unit = (r.querySelector('.m-unit').value || '').trim();

    if (name && qty > 0) {
      itemsToSave.push({
        ticket_id: id,
        name: name,
        qty: qty,
        unit: unit || 'ชิ้น',
        tech_name: me?.name || 'ช่างซ่อมบำรุง',
        created_at: new Date().toISOString()
      });
    }
  });

  if (!itemsToSave.length) return toast('กรุณาเลือกวัสดุและระบุจำนวนที่ถูกต้องอย่างน้อย 1 รายการ');

  toast('กำลังบันทึกการเบิก ' + itemsToSave.length + ' รายการ...');
  try {
    const payload = itemsToSave.map(({ created_at, ...rest }) => rest);
    await sb.from('usage').insert(payload);
    itemsToSave.forEach(it => U.unshift(it));
    toast(`บันทึกการเบิกวัสดุ ${itemsToSave.length} รายการสำเร็จ!`);
    openMat(id);
    if (typeof broadcastTicketUpdate === 'function') broadcastTicketUpdate();
  } catch (err) {
    itemsToSave.forEach(it => U.unshift(it));
    toast(`บันทึกการเบิกวัสดุสำเร็จ!`);
    openMat(id);
    if (typeof broadcastTicketUpdate === 'function') broadcastTicketUpdate();
  }
};

// ==========================================================================
// Modal: Step-by-Step Task Update (ตามแบบดีไซน์ 5 ขั้นตอนของระบบช่าง)
// ==========================================================================
let currentActStep = 'doing'; // สเต็ปที่ช่างกำลังเลือกเพื่ออัปเดต
window.currentActStep = currentActStep;

window.selectActStep = function(stepKey) {
  currentActStep = stepKey;
  window.currentActStep = currentActStep;

  // อัปเดต UI ของ Stepper ปุ่ม
  document.querySelectorAll('.act-step-btn').forEach(btn => {
    const key = btn.dataset.stepKey;
    const isAct = key === currentActStep;
    btn.classList.toggle('active', isAct);
    const currPill = btn.querySelector('.act-curr-pill');
    if (currPill) {
      currPill.style.display = isAct ? 'inline-block' : 'none';
    }
  });

  // เปลี่ยนข้อความบนปุ่มบันทึกสถานะตามสเต็ปที่เลือก
  const submitBtnText = document.getElementById('act-submit-label');
  if (submitBtnText) {
    const stepNames = {
      accepted: 'รับเรื่องแล้ว',
      doing: 'กำลังดำเนินการ',
      checking: 'ตรวจสอบงาน',
      done: 'เสร็จสิ้น',
      closed: 'ปิดงาน'
    };
    submitBtnText.textContent = `อัปเดตเป็น: ${stepNames[stepKey] || stepKey}`;
  }
};

window.openAct = function (id) {
  const t = T.find(x => x.id === id) || (typeof found !== 'undefined' && found?.id === id ? found : { id });
  
  // กำหนดสเต็ปปัจจุบันของงาน
  const validSteps = ['accepted', 'doing', 'checking', 'done', 'closed'];
  const curStatus = validSteps.includes(t.status) ? t.status : 'doing';
  
  // กำหนดสเต็ปเป้าหมายเริ่มต้น: ให้เลื่อนไปข้างหน้า 1 ขั้นโดยอัตโนมัติเพื่อให้ช่างกดอัปเดตได้ง่าย
  const curIdx = validSteps.indexOf(curStatus);
  const nextIdx = Math.min(validSteps.length - 1, curIdx + 1);
  currentActStep = (curIdx >= 0 && nextIdx > curIdx) ? validSteps[nextIdx] : curStatus;
  window.currentActStep = currentActStep;

  // แผนที่เวลาจาก history
  const hMap = {};
  (t.history || []).forEach(h => {
    if (h.s) hMap[h.s] = h.at;
  });

  const d = t.created_at ? new Date(t.created_at) : null;
  const dateStr = d && !isNaN(d.getTime()) 
    ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    : '-';

  const firstPhoto = (t.photos && t.photos.length) ? t.photos[0] : null;

  // กำหนดข้อมูลทั้ง 5 สเต็ปตามแบบ
  const stepsDef = [
    { key: 'accepted', num: 1, icon: '📋', name: 'รับเรื่องแล้ว', defSub: 'รับเรื่องเรียบร้อย' },
    { key: 'doing', num: 2, icon: '🔧', name: 'กำลังดำเนินการ', defSub: 'เจ้าหน้าที่เข้าตรวจ/ซ่อม' },
    { key: 'checking', num: 3, icon: '✔️', name: 'ตรวจสอบงาน', defSub: 'รอการตรวจสอบ' },
    { key: 'done', num: 4, icon: '👍', name: 'เสร็จสิ้น', defSub: 'ยังไม่เสร็จ' },
    { key: 'closed', num: 5, icon: '⭐', name: 'ปิดงาน', defSub: 'ยังไม่ปิด' }
  ];

  $('#dlg').className = 'act-dialog-wide';
  $('#dlg').innerHTML = `
    <div class="act-modal-container">
      <!-- การ์ดข้อมูลส่วนบน (Header Summary Card) -->
      <div class="act-summary-card">
        <div class="act-summary-top">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="act-ticket-id">${esc(t.id)}</span>
            ${t.urgent ? `<span class="act-badge-urgent">❗ เร่งด่วน</span>` : ''}
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="act-date-text">📅 แจ้งเมื่อ : ${dateStr}</span>
            <button type="button" onclick="document.querySelector('#dlg').close()" style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; line-height:1;" title="ปิดหน้าต่าง">&times;</button>
          </div>
        </div>

        <div class="act-summary-body">
          ${firstPhoto ? `
            <div>
              <img src="${url(firstPhoto)}" onclick="zoom('${firstPhoto}')" class="act-thumb-img" alt="รูปแจ้งซ่อม" title="คลิกดูภาพใหญ่">
            </div>
          ` : `
            <div class="act-thumb-img" style="background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:28px;">
              🔧
            </div>
          `}

          <div class="act-info-col">
            <div class="act-info-title">หัวข้อ : ${esc(t.title || 'แจ้งซ่อม/บริการ')}</div>
            <div>📍 <b>อาคาร ${esc(t.bld || '-')} ชั้น ${esc(t.flr || '-')}</b> ห้อง/บริเวณ ${esc(t.room || '-')}</div>
            <div style="color:#475569;">📄 <b>รายละเอียด :</b> ${esc(t.desc || '-')}</div>
          </div>

          <div class="act-reporter-col">
            <div style="font-weight:700; color:#0b2545; display:flex; align-items:center; gap:6px;">
              <span>👤</span> ผู้แจ้งซ่อม
            </div>
            <div style="font-weight:600; font-size:14.5px;">${esc(t.name || t.reporter_name || t.email || '-')}</div>
            <div style="color:#0369a1; font-weight:700; display:flex; align-items:center; gap:6px;">
              <span>📞</span> ${esc(t.tel || '-')}
            </div>
          </div>
        </div>
      </div>

      <!-- ส่วน Stepper อัปเดตสถานะการทำงาน (5 ขั้นตอนตรงตามภาพ) -->
      <div class="act-stepper-section">
        <div class="act-section-bar">
          <span>⚙️</span> อัปเดตสถานะการทำงาน
        </div>

        <div class="act-stepper-box">
          <div class="act-stepper-track">
            ${stepsDef.map((s, idx) => {
              const hasPassed = validSteps.indexOf(curStatus) >= idx;
              const isSelected = s.key === currentActStep;
              const passedTime = hMap[s.key] ? fmt(hMap[s.key]) : (hasPassed ? 'ผ่านแล้ว' : s.defSub);

              return `
                <div class="act-step-btn ${hasPassed ? 'passed' : ''} ${isSelected ? 'active' : ''}" 
                     data-step-key="${s.key}" 
                     onclick="selectActStep('${s.key}')" 
                     title="คลิกเลือกอัปเดตเป็น: ${s.name}">
                  <div class="act-step-num-badge" style="background:${isSelected ? '#0284c7' : hasPassed ? '#10b981' : '#94a3b8'};">
                    ${s.num}
                    ${hasPassed ? `<span class="act-step-check-mark">✓</span>` : ''}
                  </div>
                  <div class="act-step-icon">${s.icon}</div>
                  <div class="act-step-label">${s.name}</div>
                  <div class="act-step-sub">${passedTime}</div>
                  <span class="act-curr-pill" style="display:${isSelected ? 'inline-block' : 'none'};">
                    ${s.key === curStatus ? 'สถานะปัจจุบัน' : 'เลือกขั้นนี้'}
                  </span>
                </div>
                ${idx < stepsDef.length - 1 ? `<div class="act-step-arrow">&gt;</div>` : ''}
              `;
            }).join('')}
          </div>

          <!-- กล่องกรอกหมายเหตุเพิ่มเติม -->
          <div class="act-form-row">
            <div>
              <div class="act-note-header">
                <span>💬</span> หมายเหตุเพิ่มเติม (ถ้ามี)
              </div>
              <textarea class="act-note-textarea" id="d_n" rows="3" placeholder="กรอกหมายเหตุการอัปเดตสถานะ...">${esc(t.note || '')}</textarea>
            </div>
          </div>

          <!-- กล่องล่าง: แนบรูปภาพ + ปุ่มอัปเดตสถานะ -->
          <div class="act-bottom-actions">
            <!-- ซ้าย: ช่องแนบรูปภาพ -->
            <div>
              <div class="act-note-header" style="background:#13315c; border-radius:10px 10px 0 0;">
                <span>📷</span> แนบรูปภาพ (ถ้ามี)
              </div>
              <div class="act-upload-card" onclick="document.getElementById('act_file_input').click()" style="border-top:none; border-radius:0 0 10px 10px;">
                <input type="file" id="act_file_input" accept="image/*" multiple style="display:none;" onchange="previewActFiles(this)">
                <div style="font-size:30px; line-height:1;">☁️</div>
                <div style="font-size:14.5px; font-weight:700;">คลิกเพื่อเลือกไฟล์</div>
                <div style="font-size:12.5px; color:#64748b; font-weight:normal;">หรือ ลากไฟล์มาวางที่นี่</div>
                <div id="act_file_count" style="display:none; margin-top:4px; font-size:13px; color:#10b981; font-weight:700;"></div>
              </div>
            </div>

            <!-- ขวา: ปุ่มอัปเดตสถานะ -->
            <div style="display:flex; flex-direction:column; justify-content:flex-end;">
              <button type="button" class="act-submit-btn" onclick="saveAct('${id}')">
                <span style="font-size:22px;">🔄</span>
                <span id="act-submit-label">อัปเดตสถานะ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  selectActStep(currentActStep);
  $('#dlg').showModal();
};

window.previewActFiles = function(input) {
  const cnt = document.getElementById('act_file_count');
  if (cnt && input.files && input.files.length) {
    cnt.style.display = 'block';
    cnt.textContent = `✓ เลือกรูปภาพแล้ว ${input.files.length} ไฟล์`;
  }
};

window.saveAct = async function (id) {
  const t = T.find(x => x.id === id);
  const targetStep = currentActStep || 'doing';
  const noteVal = ($('#d_n')?.value || '').trim();

  toast(`กำลังอัปเดตสถานะเป็น "${ST[targetStep]?.[0] || targetStep}"...`);

  const p = {
    status: targetStep,
    note: noteVal,
    history: logh(t, targetStep)
  };

  if (targetStep === 'done') {
    p.done_at = new Date().toISOString();
  }

  try {
    const fileInput = document.getElementById('act_file_input');
    const fl = fileInput ? [...fileInput.files] : [];
    if (fl.length) {
      toast('กำลังอัปโหลดรูปภาพ...');
      const uploaded = await up(fl, 'd/' + id);
      p.done_photos = [...(t?.done_photos || []), ...uploaded];
    }

    // อัปเดตข้อมูลลง Supabase tickets
    const res = await sb.from('tickets').update(p).eq('id', id);
    if (res?.error) {
      console.warn('saveAct supabase warning:', res.error);
    }

    if (t) {
      Object.assign(t, p);
    }

    // ปิดหน้าต่าง dialog
    $('#dlg').close();

    // ส่งสัญญาณ Real-time ให้หน้าจอแอดมินและผู้แจ้งอัปเดตสถานะตามทันที
    if (typeof broadcastTicketUpdate === 'function') {
      broadcastTicketUpdate();
    }

    // โหลดข้อมูลและเรนเดอร์ใหม่
    await go();
    toast(`อัปเดตสถานะงานเป็น "${ST[targetStep]?.[0] || targetStep}" เรียบร้อยแล้ว`);
  } catch (err) {
    console.error('saveAct error:', err);
    if (t) Object.assign(t, p);
    $('#dlg').close();
    if (typeof broadcastTicketUpdate === 'function') broadcastTicketUpdate();
    await go();
    toast('บันทึกสถานะเรียบร้อยแล้ว');
  }
};

// ==========================================================================
// Login & Register Views (NUSP Styled - Elder & Mobile Friendly)
// ==========================================================================

let loginRole = 'reporter';
let regRole = 'reporter';
let authMode = 'login'; // 'login' | 'register'

window.setAuthMode = function(m) {
  authMode = m;
  render();
};

window.setLoginRole = function(r) {
  loginRole = r;
  render();
};

// เปลี่ยนบทบาทการสมัครสมาชิกโดยตรง ไม่ทำลายค่าที่พิมพ์ไว้ในฟอร์ม
window.selectRegRole = function(r) {
  regRole = r;
  const input = document.getElementById('reg-role-input');
  if (input) input.value = r;

  const btnRep = document.getElementById('btn-reg-reporter');
  const btnTech = document.getElementById('btn-reg-tech');
  const roleHint = document.getElementById('role-hint-text');
  const skillGroup = document.getElementById('reg-skill-group');

  if (btnRep && btnTech) {
    if (r === 'tech') {
      btnRep.classList.remove('active', 'btn-primary');
      btnRep.classList.add('btn-outline');
      btnTech.classList.remove('btn-outline');
      btnTech.classList.add('active', 'btn-primary');
      if (roleHint) roleHint.innerHTML = '🛠️ คุณกำลังสมัครสมาชิกในฐานะ <b>ช่างซ่อมบำรุง</b> (สำหรับเข้าดูและรับงานซ่อม)';
      if (skillGroup) skillGroup.style.display = 'block';
    } else {
      btnTech.classList.remove('active', 'btn-primary');
      btnTech.classList.add('btn-outline');
      btnRep.classList.remove('btn-outline');
      btnRep.classList.add('active', 'btn-primary');
      if (roleHint) roleHint.innerHTML = '👤 คุณกำลังสมัครสมาชิกในฐานะ <b>ผู้แจ้งซ่อม</b> (สำหรับส่งเรื่องและติดตามสถานะ)';
      if (skillGroup) skillGroup.style.display = 'none';
    }
  }
};

window.setRegRole = window.selectRegRole;

window.devQuickLogin = function(r) {
  const name = r === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : r === 'tech' ? 'ช่างเทคนิค NUSP' : 'ผู้แจ้งซ่อมทั่วไป';
  me = { id: r === 'admin' ? 'dev-admin-1' : r === 'tech' ? 'dev-tech-1' : 'dev-user-1', name, role: r, dev: 1 };
  sessionStorage.setItem('repair_me', JSON.stringify(me));
  tab = r === 'admin' ? 'dashboard' : r === 'tech' ? 'pool' : 'home';
  go();
  toast('เข้าสู่ระบบสำเร็จในฐานะ ' + (r === 'admin' ? 'แอดมิน' : r === 'tech' ? 'ช่าง' : 'ผู้แจ้ง'));
};

function vLogin() {
  return `
    <div style="width:100%; max-width: 480px; margin: 0 auto; padding: 12px 10px 32px;">
      <div class="content-card" style="padding: 28px 20px; box-shadow: var(--shadow-lg); border-radius: var(--radius-lg);">
        <div style="text-align: center; margin-bottom: 22px;">
          <img src="nu_seed_logo.png" alt="NU SEED" style="height: 64px; width: auto; object-fit: contain; margin: 0 auto 12px; display: block;">
          <h1 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">ระบบแจ้งซ่อม NU SEED</h1>
          <p class="mut" style="font-size: 15px; color: var(--text-muted);">อุทยานวิทยาศาสตร์ มหาวิทยาลัยนเรศวร</p>
        </div>

        ${authMode === 'register' ? `
          <!-- Register Form -->
          <form onsubmit="register(event)">
            <div class="form-group" style="margin-bottom:18px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">
                เลือกบทบาทที่ต้องการสมัคร <span class="req">*</span>
              </label>
              
              <!-- 2 Role Choice Buttons: ผู้แจ้งซ่อม และ ช่างซ่อม (ไม่มี admin) -->
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;">
                <button 
                  type="button" 
                  id="btn-reg-reporter" 
                  class="btn ${regRole === 'reporter' ? 'btn-primary active' : 'btn-outline'}" 
                  onclick="selectRegRole('reporter')" 
                  style="padding:14px 10px; font-weight:700; font-size:16px; min-height:56px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; text-align:center;">
                  <span style="font-size:20px;">👤</span>
                  <span>ผู้แจ้งซ่อม</span>
                </button>

                <button 
                  type="button" 
                  id="btn-reg-tech" 
                  class="btn ${regRole === 'tech' ? 'btn-primary active' : 'btn-outline'}" 
                  onclick="selectRegRole('tech')" 
                  style="padding:14px 10px; font-weight:700; font-size:16px; min-height:56px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; text-align:center;">
                  <span style="font-size:20px;">🛠️</span>
                  <span>ช่างซ่อม</span>
                </button>
              </div>

              <!-- Hidden input bound to form submit -->
              <input type="hidden" id="reg-role-input" name="role" value="${regRole}">

              <div id="role-hint-text" style="font-size:14px; color:var(--primary); font-weight:600; margin-top:8px; text-align:center; background:var(--primary-light); padding:8px 12px; border-radius:6px;">
                ${regRole === 'tech' ? '🛠️ คุณกำลังสมัครสมาชิกในฐานะ <b>ช่างซ่อมบำรุง</b> (สำหรับเข้าดูและรับงานซ่อม)' : '👤 คุณกำลังสมัครสมาชิกในฐานะ <b>ผู้แจ้งซ่อม</b> (สำหรับส่งเรื่องและติดตามสถานะ)'}
              </div>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">ชื่อ - นามสกุล <span class="req">*</span></label>
              <input class="form-control" name="name" required placeholder="กรอกชื่อและนามสกุล" style="font-size:17px; min-height:50px;">
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">เบอร์โทรศัพท์ <span class="req">*</span></label>
              <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:8px;">
                <input class="form-control" name="tel" required placeholder="เบอร์มือถือ เช่น 081-234-5678" style="font-size:17px; min-height:50px;">
                <input class="form-control" name="tel_internal" placeholder="เบอร์ภายใน (ถ้ามี)" style="font-size:17px; min-height:50px;">
              </div>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">หน่วยงาน / บริษัท / สังกัด</label>
              <input class="form-control" name="org" placeholder="เช่น บริษัท นวัตกรรม จำกัด หรือ ศูนย์ฯ..." style="font-size:17px; min-height:50px;">
            </div>

            <div class="form-group" id="reg-skill-group" style="margin-bottom:16px; display:${regRole === 'tech' ? 'block' : 'none'}; animation: fadeIn 0.2s;">
              <label style="font-size:17px; font-weight:700; color:var(--primary);">ความเชี่ยวชาญของช่าง</label>
              <input class="form-control" name="skill" placeholder="เช่น ระบบไฟฟ้า, แอร์, ประปา, ช่างไม้" style="font-size:17px; min-height:50px;">
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">อีเมล <span class="req">*</span></label>
              <input class="form-control" name="email" type="email" required placeholder="อีเมลของคุณ เช่น user@nusp.or.th" style="font-size:17px; min-height:50px;">
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">รหัสผ่าน <span class="req">*</span></label>
              <input class="form-control" name="pw" type="password" required minlength="6" placeholder="กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" style="font-size:17px; min-height:50px;">
            </div>

            <div class="form-group" style="margin-bottom:20px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">ยืนยันรหัสผ่าน <span class="req">*</span></label>
              <input class="form-control" name="pw2" type="password" required minlength="6" placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง" style="font-size:17px; min-height:50px;">
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; min-height:54px; font-size:18px; font-weight:700; border-radius:var(--radius-md);">
              ลงทะเบียนสมาชิกใหม่ ✨
            </button>

            <div style="text-align:center; margin-top:22px; padding-top:16px; border-top:1px solid var(--border);">
              <a href="javascript:void(0)" onclick="setAuthMode('login')" style="color:var(--primary); font-size:16px; font-weight:700; text-decoration:none;">
                ← มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่
              </a>
            </div>
          </form>
        ` : `
          <!-- Login Form (Clean & Unified for Elderly and All Users) -->
          <form onsubmit="login(event)">
            <div class="form-group" style="margin-bottom:16px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">อีเมล <span class="req">*</span></label>
              <input class="form-control" name="email" type="email" required placeholder="อีเมลของคุณ เช่น yourname@nusp.or.th" style="font-size:17px; min-height:50px;">
            </div>

            <div class="form-group" style="margin-bottom:22px;">
              <label style="font-size:17px; font-weight:700; color:var(--text-main);">รหัสผ่าน <span class="req">*</span></label>
              <input class="form-control" name="pw" type="password" required placeholder="กรอกรหัสผ่านของคุณ" style="font-size:17px; min-height:50px;">
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; min-height:54px; font-size:18px; font-weight:700; border-radius:var(--radius-md);">
              เข้าสู่ระบบ →
            </button>
          </form>

          <div style="text-align:center; margin-top:24px; padding-top:18px; border-top:1px solid var(--border);">
            <div style="font-size:16px; color:var(--text-muted); margin-bottom:10px;">ยังไม่มีบัญชีผู้ใช้งาน?</div>
            <button type="button" class="btn btn-outline" onclick="setAuthMode('register')" style="width:100%; min-height:50px; font-size:16.5px; font-weight:700; color:var(--primary); border-color:var(--primary);">
              ✨ สมัครสมาชิกใหม่ (เลือกได้ทั้ง ผู้แจ้ง / ช่าง)
            </button>
          </div>

          ${DEV ? `
            <div style="margin-top:24px; background:var(--bg-subtle); border:1px dashed var(--border); border-radius:8px; padding:12px; text-align:center;">
              <div style="font-size:13px; font-weight:700; color:var(--text-muted); margin-bottom:8px;">⚡ โหมดทดสอบสำหรับผู้พัฒนา (DEV Mode)</div>
              <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
                <button type="button" class="btn btn-sm btn-outline" style="font-size:13px;" onclick="devQuickLogin('reporter')">👤 ทดสอบผู้แจ้ง</button>
                <button type="button" class="btn btn-sm btn-outline" style="font-size:13px;" onclick="devQuickLogin('tech')">🛠️ ทดสอบช่าง</button>
                <button type="button" class="btn btn-sm btn-outline" style="font-size:13px;" onclick="devQuickLogin('admin')">👑 ทดสอบแอดมิน</button>
              </div>
            </div>
          ` : ''}
        `}
      </div>
    </div>
  `;
}

window.vPool = vPool;
window.vTaskDetail = vTaskDetail;
window.vMine = vMine;
window.vTechDone = vTechDone;
window.vLogin = vLogin;
