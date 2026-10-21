// Private training sign-up (GYM APEX) -> WhatsApp
(function(){
  const form = document.getElementById("privateForm");
  if(!form) return;
  const partner = document.getElementById("privatePartner");
  const days = document.getElementById("privateDays");
  const PRIVATE_DAYS = ["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];

  days.innerHTML = PRIVATE_DAYS.map(d =>
    `<label class="day-option"><input type="checkbox" name="p_days" value="${d}"><span>${d}</span></label>`
  ).join("");

  function syncPartner(){
    const duo = form.p_type.value === "ثنائي";
    partner.hidden = !duo;
    form.p_partner_name.required = duo;
    form.p_partner_phone.required = duo;
  }
  form.querySelectorAll('[name="p_type"]').forEach(r => r.addEventListener("change", syncPartner));
  syncPartner();

  window.submitPrivateForm = function(e){
    e.preventDefault();
    if(!form.reportValidity()) return false;
    const f = form.elements;
    const duo = f.p_type.value === "ثنائي";
    const picked = [...form.querySelectorAll('[name="p_days"]:checked')].map(i => i.value);
    const lines = [
      "مرحباً كوتش جورج، بدي اشترك بالتدريب البرايفت في GYM APEX – السقيلبية",
      "",
      `نوع الاشتراك: ${duo ? "ثنائي (60$ مقسومة: 30$ للشخص)" : "فردي (60$ شهرياً)"}`,
      `الاسم: ${f.p_name.value}`,
      `واتساب: ${f.p_phone.value}`,
      `العمر: ${f.p_age.value}`,
      `الجنس: ${f.p_gender.value}`
    ];
    if(duo){
      lines.push(`اسم الشريك/ة: ${f.p_partner_name.value}`, `واتساب الشريك/ة: ${f.p_partner_phone.value}`);
    }
    lines.push(
      `الهدف: ${f.p_goal.value}`,
      `مستوى الخبرة: ${f.p_level.value}`,
      `الوقت المفضل: ${f.p_time.value}`,
      `الأيام المفضلة: ${picked.length ? picked.join("، ") : "مرن"}`
    );
    if(f.p_notes.value.trim()) lines.push(`ملاحظات / إصابات: ${f.p_notes.value.trim()}`);
    window.open(`https://wa.me/963987461750?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
    return false;
  };
})();
