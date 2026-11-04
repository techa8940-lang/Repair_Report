// ใส่ค่าจาก Supabase > Project Settings > API
// anon key เป็นกุญแจสาธารณะ เปิดเผยในเว็บได้ ความปลอดภัยอยู่ที่กฎใน supabase.sql
window.CONFIG = {
  // true = โหมดทดสอบ: ไม่ต้องล็อกอิน สลับบทบาทได้ที่ปุ่ม ⚙️ (ต้องรัน dev-open.sql ด้วย)
  // ก่อนขึ้นเว็บจริงให้เปลี่ยนเป็น false และรัน dev-close.sql
  DEV: false,
  SUPABASE_URL: "https://qcrozcabcfwzomctrywy.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_ptZAxlZDs4QEvvH4hK11iA_Be3_6ymx"
};
