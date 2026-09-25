const WHATSAPP = "963987461750";

const FREE_PDFS = {
  3: {
    filename: "GM_Arnold_Split_3_Days.pdf",
    url: "downloads/GM_Arnold_Split_3_Days.pdf"
  },
  4: {
    filename: "GM_Womens_Foundation_8_Weeks.pdf",
    url: "downloads/GM_Womens_Foundation_8_Weeks.pdf"
  }
};

function downloadFreePdf(id) {
  const file = FREE_PDFS[id];
  if (!file) return;

  const a = document.createElement("a");
  a.href = file.url;
  a.download = file.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const DAYS = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
let currentStep = 1;
const totalSteps = 8;


function toggleFaq(btn){
  btn.parentElement.classList.toggle("open");
  const mark = btn.querySelector("span");
  if(mark) mark.textContent = btn.parentElement.classList.contains("open") ? "−" : "+";
}

function choosePackage(name, price){
  const form = document.getElementById("intakeForm");
  const wrap = document.getElementById("intakeWrap");
  const title = document.getElementById("selectedPackageTitle");

  if(!form || !wrap) return;

  form.elements.selected_package.value = name;
  form.elements.selected_price.value = price;
  if(title) title.textContent = `${name} — ${price}`;

  currentStep = 1;
  showStep();

  wrap.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeForm(){
  const wrap = document.getElementById("intakeWrap");
  if(wrap) wrap.classList.remove("show");
  document.body.style.overflow = "";
}

function showStep(){
  document.querySelectorAll(".form-step").forEach(step => {
    step.classList.toggle("active", Number(step.dataset.step) === currentStep);
  });

  const progress = document.getElementById("formProgress");
  const label = document.getElementById("stepLabel");
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  const error = document.getElementById("stepError");

  if(progress) progress.style.width = `${(currentStep / totalSteps) * 100}%`;
  if(label) label.textContent = `الخطوة ${currentStep} من ${totalSteps}`;
  if(prev) prev.style.visibility = currentStep === 1 ? "hidden" : "visible";
  if(next) next.style.display = currentStep === totalSteps ? "none" : "inline-flex";
  if(error) error.style.display = "none";

  if(currentStep === totalSteps) buildSummary();
}

function validateStep(){
  const step = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if(!step) return true;

  let ok = true;

  step.querySelectorAll("[required]").forEach(el => {
    if(el.type === "radio"){
      if(!step.querySelector(`[name="${el.name}"]:checked`)) ok = false;
    } else if(el.type === "checkbox"){
      if(!el.checked) ok = false;
    } else if(!String(el.value || "").trim()){
      ok = false;
    }
  });

  const error = document.getElementById("stepError");
  if(error) error.style.display = ok ? "none" : "block";

  return ok;
}

function nextStep(){
  if(!validateStep()) return;

  if(currentStep < totalSteps){
    currentStep++;
    showStep();
    saveDraft();
  }
}

function prevStep(){
  if(currentStep > 1){
    currentStep--;
    showStep();
  }
}

function gv(name){
  const form = document.getElementById("intakeForm");
  if(!form) return "";

  const all = [...form.querySelectorAll(`[name="${name}"]`)];
  if(!all.length) return "";

  if(all[0].type === "radio"){
    const checked = all.find(x => x.checked);
    return checked ? checked.value : "";
  }

  if(all[0].type === "checkbox"){
    return all.filter(x => x.checked).map(x => x.value).join("، ");
  }

  return all[0].value || "";
}

function gDays(name){
  const values = [...document.querySelectorAll(`[name="${name}"]:checked`)].map(x => x.value);
  return values.length ? values.join("، ") : "غير محدد";
}

function buildSummary(){
  const rows = [
    ["الباقة", `${gv("selected_package")} — ${gv("selected_price")}`],
    ["الاسم", gv("name")],
    ["العمر", gv("age")],
    ["الجنس", gv("gender")],
    ["الطول / الوزن", `${gv("height")} سم / ${gv("weight")} كغ`],
    ["الهدف", gv("goal")],
    ["أيام التمرين", gDays("training_days")],
    ["أيام الراحة", gDays("rest_days")],
    ["موعد التمرين", gv("workout_time")],
    ["النوم", `${gv("sleep_time")} — النهوض ${gv("wake_time")}`],
    ["مكان التدريب", gv("training_place")],
    ["موعد البدء", gv("start_time")]
  ];

  const target = document.getElementById("formSummary");
  if(target){
    target.innerHTML = rows.map(r =>
      `<div class="summary-row"><strong>${r[0]}:</strong> ${r[1] || "—"}</div>`
    ).join("");
  }
}

function buildMessage(){
  return `طلب اشتراك تدريب أونلاين — George Mousa

📦 الباقة:
${gv("selected_package")} — ${gv("selected_price")}

👤 البيانات الأساسية:
الاسم: ${gv("name")}
العمر: ${gv("age")}
الجنس: ${gv("gender")}
الطول: ${gv("height")} سم
الوزن: ${gv("weight")} كغ
المدينة/الدولة: ${gv("location")}
رقم واتساب العميل: ${gv("client_whatsapp")}

🎯 الهدف:
الهدف الرئيسي: ${gv("goal")}
شرح الهدف: ${gv("goal_desc")}
الوزن المستهدف: ${gv("target_weight")}
الموعد/المناسبة: ${gv("deadline")}
أكبر مشكلة حالية: ${gv("main_problem")}

🏋️ التدريب:
مستوى الخبرة: ${gv("experience")}
عدد أيام الالتزام: ${gv("available_days")}
أيام التمرين: ${gDays("training_days")}
أيام الراحة: ${gDays("rest_days")}
موعد التمرين: ${gv("workout_time")}
مدة التمرين: ${gv("duration")}
مكان التدريب: ${gv("training_place")}
معرفة أداء التمارين: ${gv("form_knowledge")}

🏥 الصحة:
إصابات: ${gv("injuries")}
تفاصيل الإصابات/الألم: ${gv("injury_details")}
حالات صحية: ${gv("health_conditions")}
أدوية: ${gv("medications")}
حساسية غذائية: ${gv("allergies")}

🍽️ التغذية الحالية:
عدد الوجبات: ${gv("meals_count")}
الماء: ${gv("water")}
الأكل المعتاد: ${gv("usual_food")}
حساب السعرات: ${gv("count_calories")}
ميزان الطعام: ${gv("food_scale")}
أطعمة محببة: ${gv("liked_foods")}
أطعمة غير محببة/غير ممكنة: ${gv("disliked_foods")}
الشهية: ${gv("appetite")}

😴 نمط الحياة:
العمل/الدراسة: ${gv("occupation")}
طبيعة اليوم: ${gv("work_nature")}
ساعات العمل/الدراسة: ${gv("work_hours")}
وقت النهوض: ${gv("wake_time")}
وقت النوم: ${gv("sleep_time")}
جودة النوم: ${gv("sleep_quality")}
التوتر: ${gv("stress")}
تغير الروتين/السفر: ${gv("routine_changes")}

💊 المكملات والمتابعة:
المكملات الحالية: ${gv("supplements")}
صور التقدم: ${gv("progress_photos")}
اشتراك سابق مع مدرب: ${gv("previous_coach")}
موعد البدء: ${gv("start_time")}
الجاهزية: ${gv("ready")}
ملاحظات إضافية: ${gv("extra_notes")}

💳 الدفع:
تم إبلاغ العميل أن كافة وسائل الدفع الدولية والسورية متوفرة.`;
}

function submitToWhatsapp(){
  const confirmBox = document.querySelector('[name="confirm_info"]');
  const confirmError = document.getElementById("confirmError");

  if(confirmBox && !confirmBox.checked){
    if(confirmError) confirmError.style.display = "block";
    return;
  }

  if(confirmError) confirmError.style.display = "none";

  const msg = buildMessage();
  try { localStorage.removeItem("gm_intake_draft"); } catch(e) {}

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
}

function initDays(){
  [["trainingDays","training_days"],["restDays","rest_days"]].forEach(([id, name]) => {
    const target = document.getElementById(id);
    if(!target) return;

    target.innerHTML = DAYS.map(day =>
      `<label class="day-option">
        <input type="checkbox" name="${name}" value="${day}">
        <span>${day}</span>
      </label>`
    ).join("");
  });
}

function saveDraft(){
  const form = document.getElementById("intakeForm");
  if(!form) return;

  const data = {};

  [...form.elements].forEach(el => {
    if(!el.name) return;

    if(el.type === "radio"){
      if(el.checked) data[el.name] = el.value;
    }else if(el.type === "checkbox"){
      data[el.name] = data[el.name] || [];
      if(el.checked) data[el.name].push(el.value);
    }else{
      data[el.name] = el.value;
    }
  });

  try { localStorage.setItem("gm_intake_draft", JSON.stringify(data)); } catch(e) {}
}

function restoreDraft(){
  let data = null;
  try { data = JSON.parse(localStorage.getItem("gm_intake_draft") || "null"); } catch(e) {}
  if(!data) return;

  const form = document.getElementById("intakeForm");
  if(!form) return;

  Object.entries(data).forEach(([name, val]) => {
    const els = [...form.querySelectorAll(`[name="${name}"]`)];
    els.forEach(el => {
      if(el.type === "radio"){
        el.checked = el.value === val;
      }else if(el.type === "checkbox"){
        el.checked = Array.isArray(val) && val.includes(el.value);
      }else{
        el.value = val;
      }
    });
  });
}

document.addEventListener("input", saveDraft);
document.addEventListener("change", saveDraft);


const PRODUCTS = [
  {id:1,title:"Pro Split — 5 Days",subtitle:"برنامج رجال — مستوى متقدم",category:"رجال",price:"12$",paid:true,cover:"assets/images/pro-split-5-days.webp",url:""},
  {id:2,title:"Pro Split — 4 Days",subtitle:"برنامج رجال — مستوى متوسط",category:"رجال",price:"9$",paid:true,cover:"assets/images/pro-split-4-days.webp",url:""},
  {id:3,title:"Arnold Split — 3 Days",subtitle:"برنامج رجال — مستوى مبتدئ",category:"رجال",price:"مجاني",paid:false,cover:"assets/images/arnold-split-3-days.webp",url:"#"},
  {id:4,title:"برنامج التأسيس للسيدات",subtitle:"شد الجسم وتقوية العضلات — 8 أسابيع",category:"سيدات",price:"مجاني",paid:false,cover:"assets/images/women-foundation-8-weeks.webp",url:"#"}
];

function renderStore(filter="الكل"){
  const cats=["الكل","رجال","سيدات"];
  document.getElementById("storeFilters").innerHTML=cats.map(c=>`<button class="filter-btn ${c===filter?"active":""}" onclick="renderStore('${c}')">${c}</button>`).join("");
  const list=PRODUCTS.filter(p=>filter==="الكل"||p.category===filter);
  document.getElementById("productsGrid").innerHTML=list.map(p=>`
    <article class="card product-card">
      <div class="product-cover">
        ${p.cover?`<img src="${p.cover}" alt="${p.title}">`:`<div class="product-placeholder">ضع غلاف المنتج هنا<br><span class="tag">${p.category}</span></div>`}
      </div>
      <div class="product-body">
        <div>${p.category==="سيدات"?'<span class="tag">سيدات</span>':p.category==="رجال"?'<span class="tag">رجال</span>':'<span class="tag">'+p.category+'</span>'}</div>
        <h3>${p.title}</h3>
        <p>${p.subtitle}</p>
        <div class="product-price">${p.price}</div>
        <button class="btn full" onclick="productAction(${p.id})">${p.paid?"اطلب عبر واتساب":"تحميل مجاني"}</button>
      </div>
    </article>`).join("");
}
function productAction(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;

  if(p.paid){
    const msg = `مرحباً كوتش جورج، أريد شراء: ${p.title} — السعر ${p.price}.`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    return;
  }

  downloadFreePdf(id);
}
initDays();restoreDraft();showStep();

/* --------------------------------------------- */

(function(){
  const form = document.getElementById("gmCalculatorForm");
  if(!form) return;

  const get = id => document.getElementById(id);
  const gender = get("calcGender");
  const age = get("calcAge");
  const height = get("calcHeight");
  const weight = get("calcWeight");
  const activity = get("calcActivity");
  const goal = get("calcGoal");
  const error = get("gmCalcError");
  const empty = get("gmCalcEmpty");
  const output = get("gmCalcOutput");

  function round10(n){
    return Math.round(n / 10) * 10;
  }

  function bmiCategory(v){
    if(v < 18.5) return "أقل من النطاق الطبيعي";
    if(v < 25) return "ضمن النطاق الطبيعي";
    if(v < 30) return "أعلى من النطاق الطبيعي";
    return "مرتفع";
  }

  function goalMeta(value){
    if(value === "lose") return { factor:0.85, label:"خسارة الدهون", protein:2.0 };
    if(value === "gain") return { factor:1.10, label:"زيادة الكتلة", protein:1.8 };
    return { factor:1.00, label:"الثبات", protein:1.8 };
  }

  form.addEventListener("submit", function(e){
    e.preventDefault();

    const g = gender.value;
    const a = Number(age.value);
    const h = Number(height.value);
    const w = Number(weight.value);
    const act = Number(activity.value);
    const goalValue = goal.value;

    const valid =
      (g === "male" || g === "female") &&
      Number.isFinite(a) && a >= 18 && a <= 80 &&
      Number.isFinite(h) && h >= 130 && h <= 230 &&
      Number.isFinite(w) && w >= 35 && w <= 250 &&
      Number.isFinite(act) && act >= 1.2 && act <= 1.725 &&
      ["lose","maintain","gain"].includes(goalValue);

    if(!valid){
      error.textContent = "أدخل جميع البيانات بشكل صحيح قبل الحساب.";
      error.style.display = "block";
      return;
    }

    error.style.display = "none";

    // Mifflin-St Jeor equation for adults.
    const bmr = (10 * w) + (6.25 * h) - (5 * a) + (g === "male" ? 5 : -161);
    const maintenance = bmr * act;

    const meta = goalMeta(goalValue);
    const target = maintenance * meta.factor;

    // Macro starting point for a general fitness estimate.
    const protein = w * meta.protein;
    const fat = w * 0.8;
    const remainingCalories = target - (protein * 4) - (fat * 9);
    const carbs = Math.max(0, remainingCalories / 4);

    const bmi = w / Math.pow(h / 100, 2);

    get("resultTargetCalories").textContent = round10(target).toLocaleString("en-US");
    get("resultGoalLabel").textContent = meta.label;
    get("resultBmr").textContent = Math.round(bmr).toLocaleString("en-US");
    get("resultMaintenance").textContent = round10(maintenance).toLocaleString("en-US");
    get("resultBmi").textContent = bmi.toFixed(1);
    get("resultBmiCategory").textContent = bmiCategory(bmi);
    get("resultProtein").textContent = `${Math.round(protein)} g`;
    get("resultCarbs").textContent = `${Math.round(carbs)} g`;
    get("resultFat").textContent = `${Math.round(fat)} g`;

    const targetExplanation =
      goalValue === "lose"
        ? "تم استخدام عجز تقريبي 15% كنقطة بداية."
        : goalValue === "gain"
          ? "تم استخدام فائض تقريبي 10% كنقطة بداية."
          : "سعرات الهدف مساوية تقريباً لسعرات الثبات.";

    get("gmResultNote").textContent =
      `${targetExplanation} الأرقام تقديرية وقد تحتاج للتعديل حسب الوزن، الأداء، الجوع، والنشاط الفعلي خلال الأسابيع التالية.`;

    empty.style.display = "none";
    output.hidden = false;

    if(window.innerWidth <= 720){
      output.scrollIntoView({behavior:"smooth", block:"start"});
    }
  });
})();
