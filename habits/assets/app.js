/* GM Habits — free habit tracker by George Mousa, built on the ideas of "Atomic Habits" (James Clear).
   Everything is stored on the device (localStorage). No account, no server. */
(function () {
  'use strict';

  var COACH_WA = '963987461750';
  var SITE = 'https://georgemousa.com';
  var KEY = 'gm_habits_v1';
  var IS_ANDROID_APP = typeof window.GMAndroid !== 'undefined';

  /* ---------------- storage ---------------- */
  function blank() { return { profile: null, habits: [], challenges: [], fit: { workouts: {}, water: {}, weights: [], waterGoal: 8, weekGoal: 4 } }; }
  var S = load();
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && typeof d === 'object') { var b = blank(); d = Object.assign(b, d); d.fit = Object.assign(blank().fit, d.fit || {}); return d; }
    } catch (e) {}
    return blank();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('تعذّر الحفظ'); } }

  /* ---------------- helpers ---------------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dstr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayStr() { return dstr(new Date()); }
  function parseD(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parseD(s); d.setDate(d.getDate() + n); return dstr(d); }
  function daysBetween(a, b) { return Math.round((parseD(b) - parseD(a)) / 864e5); }
  var MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  var WDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  var WD_SHORT = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  function fmtDate(s) { var d = parseD(s); return d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  function fmtShort(s) { var d = parseD(s); return d.getDate() + '/' + (d.getMonth() + 1); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function num(v) { return '<span class="num">' + v + '</span>'; }
  function signed(n) { n = r1(n); return (n > 0 ? '+' : '') + n; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2300);
  }
  function scoreClass(s) { return s >= 80 ? 'good' : s >= 55 ? 'mid' : 'low'; }

  /* ---------------- content ---------------- */
  var IDENTITIES = { athlete: 'رياضي', healthy: 'صحي', disciplined: 'منضبط', reader: 'قارئ', calm: 'هادي ومتوازن', productive: 'منتج' };
  var HCATS = { fit: '💪 لياقة', food: '🥗 تغذية', mind: '🧠 عقل', life: '⏰ حياة', quit: '🚫 ترك عادة' };
  var TEMPLATES = [
    { c: 'fit', icon: '🏋️', name: 'تمرين', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص رياضي', stack: 'بعد ما أرجع من الشغل', cue: 'الساعة 6 المسا بالجيم', tiny: 'ألبس تياب الرياضة وأعمل إحماء 2 دقيقة' },
    { c: 'fit', icon: '👟', name: 'مشي 8000 خطوة', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص نشيط', stack: 'بعد الغدا', cue: 'مشي 20 دقيقة حول البيت', tiny: 'أطلع أمشي 5 دقايق' },
    { c: 'fit', icon: '🧘', name: 'تمطيط 10 دقايق', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص بيهتم بجسمه', stack: 'بعد ما أصحى', cue: 'بغرفة النوم', tiny: 'تمرين تمطيط واحد' },
    { c: 'fit', icon: '💪', name: '20 ضغط', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص قوي', stack: 'بعد ما أغسل وجهي الصبح', cue: 'بالصالون', tiny: 'ضغطة وحدة' },
    { c: 'food', icon: '💧', name: 'شرب 8 كاسات مي', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص صحي', stack: 'بعد كل وجبة كاسة مي', cue: 'قنينة مي على المكتب', tiny: 'كاسة مي أول ما أصحى' },
    { c: 'food', icon: '🥩', name: 'بروتين بكل وجبة', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص بيغذّي عضلاته', stack: 'لما حضّر صحني', cue: 'البروتين أول شي بالصحن', tiny: 'بيضة أو لبنة أو تونة مع الفطور' },
    { c: 'food', icon: '🥗', name: 'خضار بكل وجبة', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص بياكل أكل حقيقي', stack: 'لما حضّر صحني', cue: 'نص الصحن خضار', tiny: 'خيارة أو بندورة مع الأكل' },
    { c: 'food', icon: '🍳', name: 'فطور صحي', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص بيبلّش يومه صح', stack: 'بعد القهوة', cue: 'بالمطبخ قبل الشغل', tiny: 'بيضتين وخبز أسمر' },
    { c: 'mind', icon: '📖', name: 'قراءة 10 صفحات', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص قارئ', stack: 'بعد ما أطفي الضو بالليل… لا، قبله', cue: 'بالسرير قبل النوم', tiny: 'صفحة وحدة' },
    { c: 'mind', icon: '🧠', name: 'تأمل 5 دقايق', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص هادي', stack: 'بعد القهوة الصبح', cue: 'على الكنباية', tiny: '3 أنفاس عميقة' },
    { c: 'mind', icon: '✍️', name: 'كتابة 3 أشياء ممتن إلها', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص ممتن', stack: 'بعد العشا', cue: 'بالدفتر جنب السرير', tiny: 'شغلة وحدة' },
    { c: 'life', icon: '😴', name: 'نوم 7 ساعات', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص بيحترم نومه', stack: 'الساعة 11 بحط الموبايل برا الغرفة', cue: 'بغرفة النوم', tiny: 'أنام قبل 12' },
    { c: 'life', icon: '🛏️', name: 'ترتيب السرير', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص مرتب', stack: 'أول ما أقوم من السرير', cue: 'غرفة النوم', tiny: 'أرتب المخدة بس' },
    { c: 'life', icon: '📅', name: 'تخطيط اليوم', kind: 'build', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص منظم', stack: 'بعد القهوة', cue: 'على المكتب', tiny: 'أكتب أهم مهمة وحدة' },
    { c: 'quit', icon: '🍬', name: 'بدون سكر مضاف', kind: 'quit', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص ما بياكل سكر', stack: 'لما بدّي شي حلو', cue: 'باكل فاكهة أو تمر بداله', tiny: 'بلا سكر بالقهوة' },
    { c: 'quit', icon: '🥤', name: 'بدون مشروبات غازية', kind: 'quit', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص بيشرب مي', stack: 'لما بدّي شي بارد', cue: 'مي باردة أو صودا بلا سكر', tiny: 'نص الكمية' },
    { c: 'quit', icon: '📵', name: 'بلا موبايل آخر ساعة قبل النوم', kind: 'quit', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص بيتحكم بوقته', stack: 'الساعة 11', cue: 'الموبايل بيشحن بالصالون', tiny: 'وضع الطيران' },
    { c: 'quit', icon: '🚭', name: 'بدون تدخين', kind: 'quit', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص ما بيدخّن', stack: 'لما بحس إني بدّي سيجارة', cue: 'باشرب مي وبمشي 5 دقايق', tiny: 'أأجّل السيجارة 10 دقايق' },
    { c: 'quit', icon: '🍔', name: 'بدون أكل سريع', kind: 'quit', days: [0, 1, 2, 3, 4, 5, 6], identity: 'أنا شخص بيحضّر أكله', stack: 'يوم الجمعة', cue: 'بحضّر وجبات الأسبوع', tiny: 'مرة وحدة بالأسبوع بس' }
  ];
  var CH_PRESETS = [
    { icon: '🍬', title: '30 يوم بدون سكر', kind: 'quit', days: 30, identity: 'أنا شخص ما بياكل سكر', plan: 'لما بدّي شي حلو، باكل فاكهة أو تمر', tip: 'خلّي الإغراء غير مرئي: شيل الحلويات من البيت ومن مكتبك.' },
    { icon: '🍞', title: '30 يوم بدون خبز أبيض', kind: 'quit', days: 30, identity: 'أنا شخص بيختار الأكل الصح', plan: 'باستبدل الخبز الأبيض بخبز أسمر أو شوفان', tip: 'سهّل البديل: اشتري الخبز الأسمر وحطه بمكان الخبز الأبيض.' },
    { icon: '🥤', title: '21 يوم بدون مشروبات غازية', kind: 'quit', days: 21, identity: 'أنا شخص بيشرب مي مش سكر', plan: 'لما بدّي شي بارد، بشرب مي باردة', tip: 'حط قنينة مي باردة بالبراد بمكان الغازيات.' },
    { icon: '👟', title: '30 يوم 10,000 خطوة', kind: 'build', days: 30, identity: 'أنا شخص نشيط', plan: 'بعد الغدا بمشي 20 دقيقة', tip: 'قاعدة الدقيقتين: إذا ما في وقت، البس صباطك واطلع 5 دقايق.' },
    { icon: '💪', title: '30 يوم 50 ضغط', kind: 'build', days: 30, identity: 'أنا شخص قوي', plan: 'بعد ما أغسل وجهي الصبح بعمل 50 ضغط على دفعات', tip: 'قسّمها: 5 مجموعات × 10 على طول اليوم.' },
    { icon: '💧', title: '21 يوم 3 لتر مي', kind: 'build', days: 21, identity: 'أنا شخص بيهتم بجسمه', plan: 'كاسة مي بعد كل وجبة وكل ما فوت عالحمام', tip: 'قنينة كبيرة على المكتب قدام عينك.' },
    { icon: '📵', title: '14 يوم بلا سوشال ميديا قبل النوم', kind: 'quit', days: 14, identity: 'أنا شخص بيتحكم بوقته', plan: 'الساعة 11 الموبايل بيشحن برا غرفة النوم', tip: 'صعّب العادة: سجّل خروج من التطبيقات بالليل.' },
    { icon: '📖', title: '30 يوم قراءة', kind: 'build', days: 30, identity: 'أنا شخص قارئ', plan: 'قبل النوم بقرأ 10 صفحات', tip: 'خلّي الكتاب على المخدة، مش على الرف.' },
    { icon: '🌙', title: '21 يوم بلا أكل بعد 10 بالليل', kind: 'quit', days: 21, identity: 'أنا شخص مطبخه بيسكّر بكير', plan: 'بعد العشا بنضّف سناني، وهيك خلص الأكل', tip: 'تكديس العادات: تنظيف السنان يعني المطبخ سكّر.' },
    { icon: '🏋️', title: '30 يوم ولا تمرين بيتفوّت', kind: 'build', days: 30, identity: 'أنا شخص ما بيفوّت تمرينه', plan: 'بتمرن بنفس الساعة، وشنطتي جاهزة من الليل', tip: 'جهّز شنطة الجيم وحطها جنب الباب.' },
    { icon: '😴', title: '14 يوم نوم قبل 12', kind: 'build', days: 14, identity: 'أنا شخص بيحترم نومه', plan: 'الساعة 11:30 الضو مطفي', tip: 'منبّه "روح نام" الساعة 11 بالليل.' },
    { icon: '🍔', title: '30 يوم بدون أكل سريع', kind: 'quit', days: 30, identity: 'أنا شخص بيحضّر أكله', plan: 'بحضّر وجباتي يوم الجمعة للأسبوع', tip: 'امسح تطبيقات التوصيل خلال التحدي.' }
  ];
  var CH_DURATIONS = { 7: '7', 14: '14', 21: '21', 30: '30', 60: '60', 90: '90' };
  var ICONS = ['🎯', '🏋️', '👟', '🧘', '💪', '💧', '🥩', '🥗', '🍳', '📖', '🧠', '✍️', '😴', '🛏️', '📅', '🍬', '🥤', '📵', '🚭', '🍔', '☕', '🍞', '🌙', '🎸', '💰', '🙏'];
  var LAWS = [
    ['👀', 'القانون 1: خلّيها واضحة', 'العادة بتبلّش بإشارة. حدّد بالظبط إمتى ووين: "رح أتمرن الساعة 6 بالجيم". أو اربطها بعادة موجودة: "بعد ما أشرب قهوتي، رح أقرأ صفحة". وللعادة السيئة اعكس القانون: خلّي إشارتها مخفية.'],
    ['✨', 'القانون 2: خلّيها جذابة', 'اربط العادة يلي لازم تعملها بشي بتحبه: اسمع البودكاست المفضّل بس وإنت عم تمشي. وكون مع ناس العادة الجديدة طبيعية عندهم. وللعادة السيئة: ركّز على أضرارها لتصير غير جذابة.'],
    ['⚡', 'القانون 3: خلّيها سهلة', 'قاعدة الدقيقتين: كل عادة جديدة لازم تبلّش بنسخة بتاخد أقل من دقيقتين. "اقرأ صفحة" بدل "اقرأ كتاب". المهم تظهر كل يوم، والإتقان بيجي بعدين. وللعادة السيئة: زيد العقبات وصعّبها.'],
    ['🏆', 'القانون 4: خلّيها مُرضية', 'الدماغ بيكرّر يلي بيعطيه مكافأة فورية. كل ✓ بالتطبيق مكافأة، وسلسلة الأيام 🔥 بتصير شي ما بدك تكسره. وإذا انكسرت: لا تفوّت مرتين.'],
    ['🪪', 'العادات بتبني هويتك', 'أعمق تغيير مش بالنتيجة، بالهوية. بدل "بدي خسّر 10 كيلو" قول "أنا شخص بيتحرك كل يوم". كل مرة بتعمل العادة، عم تعطي صوت للشخص يلي بدك تصيره.'],
    ['📈', '1% أحسن كل يوم', 'إذا صرت أحسن بـ 1% كل يوم لسنة، بتصير أحسن بحوالي 37 ضعف. التغييرات الصغيرة ما بتبيّن بالبداية، بس مع الوقت بتتراكم وبتعمل فرق ضخم.'],
    ['🔁', 'لا تفوّت مرتين', 'كلنا منفوّت أيام. الغلطة مش إنك تفوّت يوم، الغلطة إنك تفوّت يومين ورا بعض، لأنه هيك بتبلّش عادة جديدة. يوم سيء ما بيخرب شي، المهم ترجع بكرا.'],
    ['🏠', 'صمّم محيطك', 'المحيط أقوى من قوة الإرادة. حط الفاكهة على الطاولة، والمي قدامك، وشنطة الجيم جنب الباب. وخبّي الحلويات والموبايل. خلّي الخيار الصح هو الأسهل.']
  ];
  var QUOTES = [
    ['ما بترتفع لمستوى أهدافك، بتنزل لمستوى أنظمتك.', 'جيمس كلير'],
    ['كل فعل بتعمله هو صوت للشخص يلي بدك تصيره.', 'جيمس كلير'],
    ['النجاح هو نتيجة عادات يومية، مش تحوّلات بتصير مرة بالعمر.', 'جيمس كلير'],
    ['كل ما يُقاس يتحسّن.', 'بيتر دراكر']
  ];

  /* ---------------- habit logic ---------------- */
  function isDue(h, date) { return h.days.indexOf(parseD(date).getDay()) >= 0 && date >= h.created; }
  function habitsDue(date) { return S.habits.filter(function (h) { return !h.archived && isDue(h, date); }); }
  function hStats(h) {
    var today = todayStr(), streak = 0, best = 0, run = 0, wins = 0, due = 0, d;
    // current streak: consecutive due-days done, counting back (today counts only if done)
    d = today;
    if (isDue(h, d) && h.log[d] !== 1) d = addDays(d, -1);
    for (var guard = 0; guard < 800 && d >= h.created; guard++) {
      if (isDue(h, d)) { if (h.log[d] === 1) streak++; else break; }
      d = addDays(d, -1);
    }
    var span = Math.min(30, daysBetween(h.created, today) + 1);
    for (var i = span - 1; i >= 0; i--) {
      d = addDays(today, -i);
      if (!isDue(h, d)) continue;
      if (d === today && h.log[d] !== 1) continue;
      due++; if (h.log[d] === 1) wins++;
    }
    d = h.created;
    while (d <= today) {
      if (isDue(h, d)) { if (h.log[d] === 1) { run++; best = Math.max(best, run); } else if (d < today) run = 0; }
      d = addDays(d, 1);
    }
    var votes = Object.keys(h.log).filter(function (k) { return h.log[k] === 1; }).length;
    // never miss twice: the previous due day was missed
    var prev = addDays(today, -1), g2 = 0;
    while (!isDue(h, prev) && prev >= h.created && g2++ < 7) prev = addDays(prev, -1);
    var missedLast = prev >= h.created && isDue(h, prev) && h.log[prev] !== 1;
    return { streak: streak, best: best, rate: due ? Math.round(wins / due * 100) : 0, votes: votes, missedLast: missedLast };
  }
  function dots(h) {
    var out = '';
    for (var i = 6; i >= 0; i--) {
      var d = addDays(todayStr(), -i), v = h.log[d];
      out += '<i class="' + (!isDue(h, d) ? 'off' : v === 1 ? 'win' : (v === 0 || d < todayStr()) && d >= h.created ? 'miss' : '') + '"></i>';
    }
    return '<div class="dots">' + out + '</div>';
  }

  /* ---------------- challenges ---------------- */
  function chEnd(c) { return addDays(c.start, c.days - 1); }
  function chActive(c, date) { date = date || todayStr(); return !c.archived && date >= c.start && date <= chEnd(c); }
  function chDayNum(c, date) { return daysBetween(c.start, date || todayStr()) + 1; }
  function chStats(c) {
    var today = todayStr(), last = today < chEnd(c) ? today : chEnd(c);
    var elapsed = Math.max(0, daysBetween(c.start, last) + 1), wins = 0, best = 0, run = 0, d;
    for (var i = 0; i < elapsed; i++) {
      d = addDays(c.start, i);
      if (c.log[d] === 1) { wins++; run++; best = Math.max(best, run); } else if (c.log[d] === 0 || d < today) run = 0;
    }
    var streakNow = 0; d = last;
    if (c.log[d] !== 1 && c.log[d] !== 0) d = addDays(d, -1);
    while (d >= c.start && c.log[d] === 1) { streakNow++; d = addDays(d, -1); }
    var y = addDays(today, -1);
    return { elapsed: elapsed, wins: wins, rate: elapsed ? Math.round(wins / elapsed * 100) : 0, best: best, streak: streakNow, left: Math.max(0, daysBetween(today, chEnd(c))), missedYesterday: y >= c.start && c.log[y] !== 1 && today <= chEnd(c) };
  }
  function chChain(c) {
    var today = todayStr(), cells = '';
    for (var i = 0; i < c.days; i++) {
      var d = addDays(c.start, i), v = c.log[d];
      cells += '<i class="' + (v === 1 ? 'win' : v === 0 ? 'miss' : d < today ? 'skip' : d === today ? 'now' : '') + '"></i>';
    }
    return '<div class="chain" style="--n:' + Math.min(c.days, 10) + '">' + cells + '</div>';
  }
  function chById(id) { return S.challenges.filter(function (x) { return x.id === id; })[0]; }
  function hById(id) { return S.habits.filter(function (x) { return x.id === id; })[0]; }

  /* ---------------- icons ---------------- */
  var I = {
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/></svg>',
    stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M6 16l4-5 3 3 5-7"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  };

  /* ---------------- shell ---------------- */
  var tab = 'today';
  function render() {
    var app = $('#app');
    if (!S.profile) { app.innerHTML = onboardView(); bindOnboard(); return; }
    var titles = { today: 'عاداتي اليوم', challenges: 'التحديات', fit: 'اللياقة', progress: 'تقدّمي' };
    app.innerHTML =
      '<div class="shell"><header class="topbar"><div class="t"><img src="assets/img/logo.png" alt=""><div>' + titles[tab] + '<small>GM Habits</small></div></div>' +
      '<button class="iconbtn" data-act="settings" aria-label="الإعدادات">' + I.gear + '</button></header>' +
      '<main class="page" id="page"></main>' +
      '<nav class="tabbar five">' + tabBtn('today', 'اليوم', I.today) + tabBtn('challenges', 'التحديات', I.target) + tabBtn('fit', 'اللياقة', I.fit) + tabBtn('progress', 'تقدّمي', I.stats) + '</nav></div>';
    ({ today: todayView, challenges: challengesView, fit: fitView, progress: progressView })[tab]($('#page'));
  }
  function tabBtn(k, t, ic) { return '<button class="tab' + (tab === k ? ' on' : '') + '" data-tab="' + k + '">' + ic + '<span>' + t + '</span></button>'; }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tab]');
    if (t) { tab = t.getAttribute('data-tab'); closeSheet(); render(); window.scrollTo(0, 0); return; }
    var a = e.target.closest('[data-act]');
    if (a) { var fn = ACTIONS[a.getAttribute('data-act')]; if (fn) fn(a, e); return; }
    if (e.target.closest('[data-close]')) closeSheet();
  });

  function field(l, inner) { return '<div class="field"><label>' + l + '</label>' + inner + '</div>'; }
  function chip(v, t, on) { return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-v="' + v + '">' + t + '</button>'; }
  function chips(name, map, val, extraCls) {
    return '<div class="chips ' + (extraCls || '') + '" data-chips="' + name + '">' + Object.keys(map).map(function (k) { return chip(k, map[k], val != null && String(val) === String(k)); }).join('') + '</div>';
  }
  function bindChips(root, onChange) {
    $$('[data-chips]', root).forEach(function (g) {
      g.addEventListener('click', function (e) {
        var c = e.target.closest('.chip'); if (!c) return;
        if (g.hasAttribute('data-multi')) c.classList.toggle('on');
        else { $$('.chip', g).forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on'); }
        if (onChange) onChange(g.getAttribute('data-chips'));
      });
    });
  }
  function chipVal(root, name) { var c = $('[data-chips="' + name + '"] .chip.on', root); return c ? c.getAttribute('data-v') : null; }
  function chipVals(root, name) { return $$('[data-chips="' + name + '"] .chip.on', root).map(function (c) { return c.getAttribute('data-v'); }); }
  function ring(pct, size) {
    var r = 36, c = 2 * Math.PI * r;
    return '<svg viewBox="0 0 86 86" style="width:' + (size || 86) + 'px;height:' + (size || 86) + 'px;flex:none"><circle cx="43" cy="43" r="' + r + '" stroke="#222" stroke-width="9" fill="none"/>' +
      '<circle cx="43" cy="43" r="' + r + '" stroke="#ffb800" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="' + (c * pct / 100) + ' ' + c + '" transform="rotate(-90 43 43)"/>' +
      '<text x="43" y="50" text-anchor="middle" fill="#fff" font-size="19" font-weight="900" font-family="Cairo">' + pct + '%</text></svg>';
  }
  function quoteOfDay() { var q = QUOTES[daysBetween('2024-01-01', todayStr()) % QUOTES.length]; return '<div class="bigquote">«' + q[0] + '»<small>' + q[1] + '</small></div>'; }
  function waLink(text) { return 'https://wa.me/' + COACH_WA + '?text=' + encodeURIComponent(text); }
  function coachCta(title, sub) {
    return '<section class="cta"><div class="bg"></div><div class="c"><h3>' + (title || 'بدك نتائج أسرع؟ تدرّب مع جورج أونلاين') + '</h3>' +
      '<p>' + (sub || 'برنامج تمرين وتغذية مفصّل إلك، ومتابعة أسبوعية.') + '</p>' +
      '<button class="btn" data-act="coach">احكي مع جورج</button></div></section>';
  }
  function installHint() {
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var standalone = window.navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (!ios && /android/i.test(navigator.userAgent) && !standalone && !IS_ANDROID_APP)
      return '<div class="install"><span style="font-size:22px">🤖</span><div><b>عندك أندرويد؟</b> نزّل التطبيق وخلّيه على شاشتك. <a class="gold" href="GM_Habits.apk" download><b>تحميل APK</b></a></div></div>';
    if (!ios || standalone || IS_ANDROID_APP) return '';
    return '<div class="install"><span style="font-size:22px">📲</span><div><b>ثبّت التطبيق على الآيفون:</b> اضغط زر المشاركة <b>⬆︎</b> بأسفل Safari ثم <b>إضافة إلى الشاشة الرئيسية</b>.</div></div>';
  }

  /* ---------------- onboarding ---------------- */
  function onboardView() {
    return '<div class="onboard"><div class="onboard-bg"></div><div class="onboard-inner">' +
      '<div class="brand"><img src="assets/img/logo.png" alt="George Mousa"></div>' +
      '<h1>عادات صغيرة،<br><span>نتائج كبيرة</span></h1>' +
      '<p class="lead">تطبيق مجاني من الكوتش George Mousa لبناء العادات الصح وترك العادات السيئة، مبني على أفكار كتاب "العادات الذرية".</p>' +
      '<form class="form" id="onb">' +
      field('اسمك', '<input name="name" required placeholder="شو اسمك؟">') +
      '<div class="field"><label>مين الشخص يلي بدك تصيره؟ (اختار أكتر من وحدة)</label><div class="chips" data-chips="identity" data-multi>' +
      Object.keys(IDENTITIES).map(function (k, i) { return chip(k, IDENTITIES[k], i < 2); }).join('') + '</div></div>' +
      '<div class="field"><label>بتتمرن أو بدك تبلّش تتمرن؟</label>' + chips('trains', { 1: 'إي 💪', 0: 'لا هلق' }, 1) + '</div>' +
      '<button class="btn" type="submit">يلا نبلّش</button>' +
      '<button class="btn ghost" type="button" data-act="import">عندي نسخة احتياطية</button>' +
      '</form></div></div>';
  }
  function bindOnboard() {
    var f = $('#onb'); bindChips(f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      S.profile = { name: f.name.value.trim(), identity: chipVals(f, 'identity'), trains: chipVal(f, 'trains') === '1', created: todayStr() };
      save(); tab = 'today'; render(); toast('أهلاً ' + S.profile.name + '! ابدأ بعادة وحدة صغيرة 🌱');
      setTimeout(function () { ACTIONS.addHabit(); }, 400);
    });
  }

  /* ---------------- today ---------------- */
  function todayView(page) {
    var today = todayStr(), due = habitsDue(today), done = due.filter(function (h) { return h.log[today] === 1; }).length;
    var pct = due.length ? Math.round(done / due.length * 100) : 0;
    var d = new Date();
    page.innerHTML =
      installHint() +
      '<section class="hero" style="min-height:200px"><div class="hero-bg"></div><div class="hero-c">' +
      '<span class="pill">' + WDAYS[d.getDay()] + ' ' + fmtDate(today) + '</span>' +
      '<div class="hi">أهلاً ' + esc(S.profile.name) + ' 👋</div><h2>1% أحسن من مبارح</h2></div></section>' +
      (due.length ? '<section class="card daytop">' + ring(pct, 76) + '<div class="txt"><b>' + num(done) + ' من ' + num(due.length) + ' عادات اليوم</b><small>' +
        (pct === 100 ? 'يوم كامل! كل ✓ صوت لهويتك الجديدة 🔥' : 'كل عادة بتعملها هي صوت للشخص يلي بدك تصيره.') + '</small></div></section>' : '') +
      '<div class="section-title"><b>عاداتي</b><button class="btn sm ghost" data-act="addHabit">+ عادة</button></div>' +
      (due.length ? '<div class="habits" id="hlist">' + due.map(habitCard).join('') + '</div>' :
        '<div class="card empty">🌱 ما في عادات لليوم.<br>ابدأ بعادة وحدة صغيرة كتير، أصغر مما بتتخيّل.<br><br><button class="btn sm" data-act="addHabit">أضف أول عادة</button></div>') +
      chTodayCard() +
      (S.profile.trains ? fitStrip() : '') +
      '<section class="card">' + quoteOfDay() + '</section>' +
      (S.habits.length >= 2 ? coachCta() : '');
  }
  function habitCard(h) {
    var today = todayStr(), on = h.log[today] === 1, s = hStats(h);
    return '<div class="habit-card' + (on ? ' done' : '') + '" id="h-' + h.id + '">' +
      '<span class="chic">' + h.icon + '</span>' +
      '<button class="hmain" data-act="habitOpen" data-id="' + h.id + '"><b>' + esc(h.name) + '</b><small>' +
      (h.stack ? esc(h.stack) : h.cue ? esc(h.cue) : (h.kind === 'quit' ? 'عادة بدّي أتركها' : '')) + '</small>' +
      '<div style="display:flex;align-items:center;gap:8px">' + dots(h) + (s.streak ? '<span class="hstreak">🔥 ' + num(s.streak) + '</span>' : '') +
      (s.missedLast && !on ? '<span class="missed">لا تفوّت مرتين!</span>' : '') + '</div></button>' +
      '<button class="check' + (on ? ' on' : '') + '" data-act="habitToggle" data-id="' + h.id + '" aria-label="تم">✓</button></div>';
  }
  function fitStrip() {
    var t = todayStr(), w = S.fit.water[t] || 0, wk = S.fit.workouts[t];
    return '<section class="card" id="fitstrip"><h3><span>💪 لياقة اليوم</span><button class="sub" data-tab="fit">كل التفاصيل ←</button></h3>' +
      '<div class="water"><div class="glasses">' + glasses(w) + '</div><div class="pm"><button data-act="water" data-v="-1">−</button><button data-act="water" data-v="1">+</button></div></div>' +
      '<div style="margin-top:10px">' + (wk ? '<span class="streak">✅ ' + WK_TYPES[wk.type] + (wk.min ? ' · ' + num(wk.min) + ' دقيقة' : '') + '</span>' : '<button class="btn sm" data-act="logWorkout">+ سجّل تمرين اليوم</button>') + '</div></section>';
  }
  function glasses(n) { var o = ''; for (var i = 0; i < S.fit.waterGoal; i++) o += '<i class="' + (i < n ? 'f' : '') + '"></i>'; if (n > S.fit.waterGoal) o += '<b class="gold" style="font-size:13px">+' + (n - S.fit.waterGoal) + '</b>'; return o; }

  function chTodayCard() {
    var date = todayStr(), act = S.challenges.filter(function (c) { return chActive(c, date); });
    if (!act.length) return '';
    return '<section class="card" id="chToday"><h3><span>🎯 تحدّياتك</span><span class="sub">التزمت اليوم؟</span></h3><div class="list">' +
      act.map(function (c) {
        var v = c.log[date];
        return '<div class="chrow"><div class="chname"><span class="chic">' + c.icon + '</span><div><b>' + esc(c.title) + '</b><small>اليوم ' + num(chDayNum(c, date)) + ' من ' + num(c.days) + '</small></div></div>' +
          '<div class="yn"><button type="button" class="' + (v === 1 ? 'on yes' : '') + '" data-act="chMark" data-id="' + c.id + '" data-d="' + date + '" data-v="1">✓</button>' +
          '<button type="button" class="' + (v === 0 ? 'on no' : '') + '" data-act="chMark" data-id="' + c.id + '" data-d="' + date + '" data-v="0">✗</button></div></div>';
      }).join('') + '</div></section>';
  }

  /* ---------------- habit form ---------------- */
  function habitPicker() {
    var cat = 'fit';
    var draw = function (b) {
      $('#tpl', b).innerHTML = TEMPLATES.filter(function (t) { return t.c === cat; }).map(function (t) {
        var i = TEMPLATES.indexOf(t);
        return '<button class="preset" data-act="habitTpl" data-i="' + i + '"><span>' + t.icon + '</span><b>' + t.name + '</b><small>' + (t.kind === 'quit' ? 'ترك عادة' : 'بناء عادة') + '</small></button>';
      }).join('') + '<button class="preset custom" data-act="habitCustom"><span>✍️</span><b>عادة خاصة فيك</b><small>اكتبها بنفسك</small></button>';
    };
    openSheet('<h2>أضف عادة</h2><p class="hint" style="margin:0 0 10px">💡 ابدأ بعادة وحدة أو اتنين بس. القليل يلي بيستمر أحسن من الكتير يلي بيوقف.</p>' +
      '<div class="catrow chips" data-chips="cat">' + Object.keys(HCATS).map(function (k) { return chip(k, HCATS[k], k === cat); }).join('') + '</div>' +
      '<div class="presets" id="tpl"></div>', function (b) {
      bindChips(b, function () { cat = chipVal(b, 'cat'); draw(b); }); draw(b);
    });
  }
  var DAYMAP = { 6: 'س', 0: 'ح', 1: 'ن', 2: 'ث', 3: 'ر', 4: 'خ', 5: 'ج' };
  function habitForm(p) {
    p = p || {};
    var days = p.days || [0, 1, 2, 3, 4, 5, 6];
    openSheet('<h2>' + (p.id ? 'تعديل العادة' : 'عادة جديدة') + '</h2><form class="form" id="hf">' +
      '<div class="field"><label>الأيقونة</label><div class="chips icons" data-chips="icon">' + ICONS.map(function (i) { return chip(i, i, i === (p.icon || '🎯')); }).join('') + '</div></div>' +
      field('اسم العادة', '<input name="name" required maxlength="40" value="' + esc(p.name || '') + '" placeholder="مثلاً: قراءة 10 صفحات">') +
      '<div class="field"><label>النوع</label>' + chips('kind', { build: 'بدّي أبني عادة', quit: 'بدّي أترك عادة' }, p.kind || 'build') + '</div>' +
      '<div class="field"><label>أيام العادة</label><div class="chips dayschips" data-chips="days" data-multi>' +
      [6, 0, 1, 2, 3, 4, 5].map(function (k) { return chip(k, DAYMAP[k], days.indexOf(k) >= 0); }).join('') + '</div></div>' +
      '<p class="hint">🪪 <b>الهوية:</b> ركّز على مين بدك تصير، مش بس على النتيجة.</p>' +
      field('أنا شخص...', '<input name="identity" maxlength="80" value="' + esc(p.identity || '') + '" placeholder="أنا شخص بيقرأ كل يوم">') +
      '<p class="hint">👀 <b>خلّيها واضحة:</b> اربطها بعادة بتعملها أصلاً (تكديس العادات).</p>' +
      field('بعد ما...', '<input name="stack" maxlength="80" value="' + esc(p.stack || '') + '" placeholder="بعد ما أشرب قهوة الصبح">') +
      field('إمتى ووين؟', '<input name="cue" maxlength="80" value="' + esc(p.cue || '') + '" placeholder="الساعة 7 على الكنباية">') +
      '<p class="hint">⚡ <b>خلّيها سهلة:</b> شو النسخة يلي بتاخد أقل من دقيقتين؟</p>' +
      field('نسخة الدقيقتين', '<input name="tiny" maxlength="80" value="' + esc(p.tiny || '') + '" placeholder="أقرأ صفحة وحدة">') +
      '<button class="btn" type="submit">' + (p.id ? 'حفظ' : 'أضف العادة 🌱') + '</button></form>', function (b) {
      var f = $('#hf', b); bindChips(f);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var dd = chipVals(f, 'days').map(Number);
        if (!dd.length) return toast('اختار يوم واحد على الأقل');
        var data = { icon: chipVal(f, 'icon') || '🎯', name: f.name.value.trim(), kind: chipVal(f, 'kind') || 'build', days: dd, identity: f.identity.value.trim(), stack: f.stack.value.trim(), cue: f.cue.value.trim(), tiny: f.tiny.value.trim() };
        if (!data.name) return;
        if (p.id) Object.assign(hById(p.id), data);
        else S.habits.push(Object.assign({ id: uid(), created: todayStr(), log: {} }, data));
        save(); closeSheet(); tab = 'today'; render(); toast(p.id ? 'تم الحفظ ✅' : 'انضافت العادة! ابدأ بنسخة الدقيقتين 💪');
      });
    });
  }
  function habitDetail(h) {
    var s = hStats(h), today = todayStr(), cells = '';
    for (var i = 34; i >= 0; i--) {
      var d = addDays(today, -i), v = h.log[d], due = isDue(h, d);
      cells += '<i class="' + (!due ? 'skip' : v === 1 ? 'win' : v === 0 ? 'miss' : d === today ? 'now' : '') + '"' + (due ? ' data-act="habitCell" data-id="' + h.id + '" data-d="' + d + '"' : '') + ' title="' + fmtDate(d) + '"></i>';
    }
    openSheet('<h2>' + h.icon + ' ' + esc(h.name) + '</h2>' +
      '<div class="chstats big"><span>السلسلة الحالية<b>' + num(s.streak) + '</b></span><span>أطول سلسلة<b>' + num(s.best) + '</b></span><span>آخر 30 يوم<b>' + num(s.rate + '%') + '</b></span></div>' +
      '<div class="idbox tip"><small>أصوات لهويتك</small><b>🗳️ ' + num(s.votes) + ' مرة صوّتت إنك ' + esc(h.identity ? h.identity.replace(/^أنا /, '') : 'الشخص يلي بدك تصيره') + '</b></div>' +
      '<div class="chain" style="--n:7">' + cells + '</div>' +
      '<p class="muted" style="font-size:12px;margin:6px 0 12px">آخر 5 أسابيع. اضغط على أي يوم لتعدّله: 🟩 عملتها · 🟥 ما عملتها</p>' +
      (h.identity ? '<div class="idbox"><small>هويتك</small><b>' + esc(h.identity) + '</b></div>' : '') +
      (h.stack || h.cue ? '<div class="idbox"><small>خطتك</small><b>' + esc([h.stack, h.cue].filter(Boolean).join('، ')) + '</b></div>' : '') +
      (h.tiny ? '<div class="idbox"><small>نسخة الدقيقتين</small><b>' + esc(h.tiny) + '</b></div>' : '') +
      '<div class="actions2"><button class="btn ghost" data-act="habitEdit" data-id="' + h.id + '">تعديل</button><button class="btn ghost" data-act="habitShare" data-id="' + h.id + '">شارك إنجازك</button></div>' +
      '<button class="btn danger" data-act="habitDelete" data-id="' + h.id + '">حذف العادة</button>');
  }

  /* ---------------- challenges view ---------------- */
  function challengesView(page) {
    var cs = S.challenges.filter(function (c) { return !c.archived; });
    var active = cs.filter(function (c) { return todayStr() <= chEnd(c); }), done = cs.filter(function (c) { return todayStr() > chEnd(c); });
    page.innerHTML =
      '<section class="hero" style="min-height:190px"><div class="hero-bg mirror"></div><div class="hero-c"><span class="pill">تحدّى حالك</span><h2>التحديات</h2><div class="hi">أيام محددة، هدف واضح، وسلسلة ما بدك تكسرها</div></div></section>' +
      '<button class="btn" data-act="chNew">+ ابدأ تحدّي</button>' +
      (active.length ? active.map(chCard).join('') : '<div class="card empty">اختار تحدّي جاهز متل "30 يوم بدون سكر"، أو اعمل تحدّي خاص فيك.</div>') +
      (done.length ? '<section class="card"><h3>تحديات خلصت 🏁</h3><div class="list">' + done.map(function (c) {
        var s = chStats(c);
        return '<button class="li dayrow" data-act="chOpen" data-id="' + c.id + '"><div><div class="v">' + c.icon + ' ' + esc(c.title) + '</div><div class="d">' + fmtDate(c.start) + ' · ' + num(c.days) + ' يوم</div></div><span class="score ' + scoreClass(s.rate) + '">' + num(s.rate + '%') + '</span></button>';
      }).join('') + '</div></section>' : '') +
      coachCta('خلّصت التحدي؟ خلّي جورج يكمّل معك', 'حوّل الالتزام لنتيجة حقيقية ببرنامج تدريب وتغذية خاص فيك.');
  }
  function chCard(c) {
    var s = chStats(c), today = todayStr(), started = today >= c.start, v = c.log[today];
    return '<section class="card chcard"><button class="chhead" data-act="chOpen" data-id="' + c.id + '"><span class="chic big">' + c.icon + '</span><div><b>' + esc(c.title) + '</b><small>' +
      (started ? 'اليوم ' + num(chDayNum(c)) + ' من ' + num(c.days) + ' · باقي ' + num(s.left) + ' يوم' : 'بيبلش ' + fmtDate(c.start)) + '</small></div><span class="streak">🔥 ' + num(s.streak) + '</span></button>' +
      (s.missedYesterday && started ? '<div class="warn">⚠️ فوّتت مبارح. القاعدة الذهبية: <b>لا تفوّت مرتين</b>.</div>' : '') + chChain(c) +
      '<div class="chstats"><span>الالتزام <b>' + num(s.rate + '%') + '</b></span><span>أطول سلسلة <b>' + num(s.best) + '</b></span><span>أيام ناجحة <b>' + num(s.wins) + '</b></span></div>' +
      (started ? '<div class="yn wide"><button type="button" class="' + (v === 1 ? 'on yes' : '') + '" data-act="chMark" data-id="' + c.id + '" data-d="' + today + '" data-v="1">✓ التزمت اليوم</button>' +
        '<button type="button" class="' + (v === 0 ? 'on no' : '') + '" data-act="chMark" data-id="' + c.id + '" data-d="' + today + '" data-v="0">✗ ما التزمت</button></div>' : '') + '</section>';
  }
  function chForm(p) {
    p = p || {};
    openSheet('<h2>' + (p.id ? 'تعديل التحدي' : 'تحدّي جديد') + '</h2><form class="form" id="chf">' +
      '<div class="field"><label>الأيقونة</label><div class="chips icons" data-chips="icon">' + ICONS.map(function (i) { return chip(i, i, i === (p.icon || '🎯')); }).join('') + '</div></div>' +
      field('اسم التحدي', '<input name="title" required maxlength="40" value="' + esc(p.title || '') + '" placeholder="مثلاً: شهر بدون سكر">') +
      '<div class="field"><label>نوع التحدي</label>' + chips('kind', { quit: 'بدّي أترك عادة', build: 'بدّي أبني عادة' }, p.kind || 'quit') + '</div>' +
      '<div class="field"><label>المدة (أيام)</label>' + chips('days', CH_DURATIONS, p.days || 30) + '</div>' +
      field('هويتك الجديدة', '<input name="identity" maxlength="80" value="' + esc(p.identity || '') + '" placeholder="أنا شخص ...">') +
      field('خطتك: إمتى ووين وكيف؟', '<textarea name="plan" rows="2" maxlength="160" placeholder="لما ... رح ...">' + esc(p.plan || '') + '</textarea>') +
      '<p class="hint">💡 يلي بيكتب خطة واضحة (شو، إمتى، ووين) احتمال يلتزم أعلى بكتير.</p>' +
      field('تاريخ البداية', '<input name="start" type="date" required value="' + (p.start || todayStr()) + '">') +
      '<button class="btn" type="submit">' + (p.id ? 'حفظ' : 'ابدأ التحدي 🚀') + '</button></form>', function (b) {
      var f = $('#chf', b); bindChips(f);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = { icon: chipVal(f, 'icon') || '🎯', title: f.title.value.trim(), kind: chipVal(f, 'kind') || 'quit', days: +(chipVal(f, 'days') || 30), identity: f.identity.value.trim(), plan: f.plan.value.trim(), start: f.start.value || todayStr(), tip: p.tip || '' };
        if (!data.title) return;
        if (p.id) Object.assign(chById(p.id), data); else S.challenges.push(Object.assign({ id: uid(), log: {} }, data));
        save(); closeSheet(); tab = 'challenges'; render(); toast(p.id ? 'تم الحفظ ✅' : 'بلّش التحدي! 💪');
      });
    });
  }

  /* ---------------- fitness ---------------- */
  var WK_TYPES = { strength: 'قوة 🏋️', cardio: 'كارديو 🏃', walk: 'مشي 🚶', sport: 'رياضة ⚽', mobility: 'مرونة 🧘', rest: 'راحة 😌' };
  function weekDates() {
    var t = todayStr(), dow = parseD(t).getDay(), start = addDays(t, -((dow + 1) % 7)); // week starts Saturday
    var out = []; for (var i = 0; i < 7; i++) out.push(addDays(start, i)); return out;
  }
  function fitView(page) {
    if (!S.profile.trains) {
      page.innerHTML = '<section class="hero" style="min-height:220px"><div class="hero-bg"></div><div class="hero-c"><span class="pill">لياقة</span><h2>جاهز تبلّش تتمرن؟</h2></div></section>' +
        '<div class="card empty">فعّل قسم اللياقة لتسجّل تمارينك وشرب المي ووزنك، وتحسب سعراتك وبروتينك ببلاش.<br><br><button class="btn sm" data-act="enableFit">فعّل قسم اللياقة</button></div>' + coachCta();
      return;
    }
    var t = todayStr(), wk = weekDates(), count = wk.filter(function (d) { var w = S.fit.workouts[d]; return w && w.type !== 'rest'; }).length;
    var tw = S.fit.workouts[t], water = S.fit.water[t] || 0;
    var ws = S.fit.weights.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    page.innerHTML =
      '<section class="hero" style="min-height:190px"><div class="hero-bg"></div><div class="hero-c"><span class="pill">' + num(count) + ' من ' + num(S.fit.weekGoal) + ' تمارين هالأسبوع</span><h2>كل تمرين بيحسب</h2></div></section>' +
      '<section class="card"><h3><span>🗓️ تمارين الأسبوع</span><span class="sub">الهدف ' + num(S.fit.weekGoal) + '</span></h3><div class="week">' +
      wk.map(function (d) { var w = S.fit.workouts[d]; return '<div class="' + (w && w.type !== 'rest' ? 'on' : '') + (d === t ? ' today' : '') + '">' + WD_SHORT[parseD(d).getDay()] + '<b>' + (w ? WK_TYPES[w.type].split(' ')[1] : '·') + '</b></div>'; }).join('') + '</div>' +
      '<div style="margin-top:12px">' + (tw ? '<button class="btn ghost" data-act="logWorkout">✅ ' + WK_TYPES[tw.type] + (tw.min ? ' · ' + num(tw.min) + ' دقيقة' : '') + ' (تعديل)</button>' : '<button class="btn" data-act="logWorkout">+ سجّل تمرين اليوم</button>') + '</div></section>' +
      '<section class="card"><h3><span>💧 المي اليوم</span><span class="sub">' + num(water) + ' / ' + num(S.fit.waterGoal) + ' كاسات</span></h3><div class="water"><div class="glasses">' + glasses(water) + '</div><div class="pm"><button data-act="water" data-v="-1">−</button><button data-act="water" data-v="1">+</button></div></div></section>' +
      '<section class="card"><h3><span>⚖️ الوزن</span><button class="btn sm ghost" data-act="addWeight">+ وزن</button></h3>' +
      (ws.length ? '<div class="stats" style="margin-bottom:8px"><div class="stat"><b>' + num(r1(ws[ws.length - 1].kg)) + '</b><span>الحالي</span></div><div class="stat"><b>' + num(signed(ws[ws.length - 1].kg - ws[0].kg)) + '</b><span>من البداية</span></div><div class="stat"><b>' + num(ws.length) + '</b><span>قراءة</span></div></div>' + weightChart(ws) : '<div class="empty">سجّل وزنك مرة بالأسبوع، الصبح وقبل الأكل.</div>') + '</section>' +
      '<section class="card" id="calc"><h3><span>🧮 حاسبة السعرات والبروتين</span><span class="sub">مجاناً</span></h3>' +
      '<form class="form" id="cf"><div class="field"><label>الجنس</label>' + chips('sex', { m: 'ذكر', f: 'أنثى' }, (S.calc && S.calc.sex) || 'm') + '</div>' +
      '<div class="row2">' + field('العمر', '<input name="age" type="number" inputmode="numeric" min="14" max="90" value="' + ((S.calc && S.calc.age) || '') + '" required>') + field('الطول (سم)', '<input name="h" type="number" inputmode="numeric" min="120" max="230" value="' + ((S.calc && S.calc.h) || '') + '" required>') + '</div>' +
      '<div class="row2">' + field('الوزن (كغ)', '<input name="w" type="number" inputmode="decimal" step="0.1" min="30" max="300" value="' + ((S.calc && S.calc.w) || (ws.length ? ws[ws.length - 1].kg : '')) + '" required>') +
      field('النشاط', '<select name="act"><option value="1.2">قليل (مكتب)</option><option value="1.375">خفيف (1-3 تمارين)</option><option value="1.55" selected>متوسط (3-5 تمارين)</option><option value="1.725">عالي (6-7 تمارين)</option></select>') + '</div>' +
      '<div class="field"><label>هدفك</label>' + chips('goal', { cut: 'خسارة دهون', keep: 'ثبات', bulk: 'بناء عضل' }, (S.calc && S.calc.goal) || 'cut') + '</div>' +
      '<button class="btn" type="submit">احسب</button></form><div id="cres"></div></section>' +
      coachCta('بدك برنامج غذائي وتمرين مفصّل إلك؟', 'الحاسبة بداية. مع جورج بتاخد خطة كاملة ومتابعة أسبوعية لحد ما توصل لهدفك.');
    var f = $('#cf'); bindChips(f);
    if (S.calc && S.calc.act) f.act.value = S.calc.act;
    f.addEventListener('submit', function (e) { e.preventDefault(); calc(f); });
    if (S.calc && S.calc.w) calc(f, true);
  }
  function calc(f, silent) {
    var sex = chipVal(f, 'sex'), age = +f.age.value, h = +f.h.value, w = +f.w.value, act = +f.act.value, goal = chipVal(f, 'goal');
    if (!(age && h && w)) return;
    S.calc = { sex: sex, age: age, h: h, w: w, act: f.act.value, goal: goal }; save();
    var bmr = 10 * w + 6.25 * h - 5 * age + (sex === 'm' ? 5 : -161), tdee = bmr * act;
    var cal = Math.round((goal === 'cut' ? tdee * 0.8 : goal === 'bulk' ? tdee * 1.1 : tdee) / 10) * 10;
    var protein = Math.round(w * (goal === 'cut' ? 2 : 1.8)), water = r1(w * 0.035);
    $('#cres').innerHTML = '<div class="result"><div><b>' + num(cal) + '</b><span>سعرة باليوم</span></div><div><b dir="ltr">' + num(protein) + 'g</b><span>بروتين باليوم</span></div><div><b dir="ltr">' + num(water) + 'L</b><span>مي باليوم</span></div></div>' +
      '<p class="muted" style="font-size:12px;margin:8px 0 0">معدل الحرق اليومي التقريبي ' + num(Math.round(tdee)) + ' سعرة. هي أرقام تقريبية كبداية، والخطة الدقيقة بتختلف من شخص لشخص.</p>';
    if (!silent) $('#cres').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function weightChart(w) {
    if (w.length < 2) return '';
    var W = 340, H = 150, pl = 30, pr = 8, pt = 10, pb = 22;
    var ys = w.map(function (x) { return x.kg; }), min = Math.min.apply(null, ys), max = Math.max.apply(null, ys), padv = Math.max(0.5, (max - min) * 0.15); min -= padv; max += padv;
    var t0 = parseD(w[0].date).getTime(), t1 = parseD(w[w.length - 1].date).getTime(), span = Math.max(1, t1 - t0);
    var X = function (d) { return pl + (parseD(d).getTime() - t0) / span * (W - pl - pr); }, Y = function (v) { return pt + (max - v) / (max - min) * (H - pt - pb); };
    var pts = w.map(function (x) { return X(x.date).toFixed(1) + ',' + Y(x.kg).toFixed(1); }).join(' ');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" direction="ltr"><text x="' + (pl - 4) + '" y="' + (Y(max - padv) + 4) + '" fill="#777" font-size="10" text-anchor="end">' + r1(max - padv) + '</text><text x="' + (pl - 4) + '" y="' + (Y(min + padv) + 4) + '" fill="#777" font-size="10" text-anchor="end">' + r1(min + padv) + '</text>' +
      '<polyline points="' + pts + '" fill="none" stroke="#ffb800" stroke-width="2.5" stroke-linejoin="round"/>' +
      w.map(function (x) { return '<circle cx="' + X(x.date) + '" cy="' + Y(x.kg) + '" r="3" fill="#000" stroke="#ffb800" stroke-width="2"/>'; }).join('') +
      '<text x="' + pl + '" y="' + (H - 6) + '" fill="#777" font-size="10">' + fmtShort(w[0].date) + '</text><text x="' + (W - pr) + '" y="' + (H - 6) + '" fill="#777" font-size="10" text-anchor="end">' + fmtShort(w[w.length - 1].date) + '</text></svg>';
  }

  /* ---------------- progress & learn ---------------- */
  function progressView(page) {
    var hs = S.habits.filter(function (h) { return !h.archived; });
    var votes = hs.reduce(function (a, h) { return a + hStats(h).votes; }, 0);
    var days = Math.max(1, daysBetween(S.profile.created, todayStr()) + 1);
    var last7 = 0, due7 = 0;
    for (var i = 0; i < 7; i++) { var d = addDays(todayStr(), -i); habitsDue(d).forEach(function (h) { if (i === 0 && h.log[d] !== 1) return; due7++; if (h.log[d] === 1) last7++; }); }
    var rate7 = due7 ? Math.round(last7 / due7 * 100) : 0;
    page.innerHTML =
      '<div class="stats"><div class="stat"><b>' + num(votes) + '</b><span>صوت لهويتك 🗳️</span></div><div class="stat"><b>' + num(rate7 + '%') + '</b><span>التزام آخر 7 أيام</span></div><div class="stat"><b>' + num(days) + '</b><span>يوم مع التطبيق</span></div></div>' +
      (S.profile.identity && S.profile.identity.length ? '<section class="card"><h3>🪪 الشخص يلي عم تصيره</h3><div class="chips">' + S.profile.identity.map(function (k) { return '<span class="chip on">' + (IDENTITIES[k] || k) + '</span>'; }).join('') + '</div></section>' : '') +
      '<section class="card"><h3>📊 التزامك بكل عادة <span class="sub">آخر 30 يوم</span></h3>' +
      (hs.length ? hs.map(function (h) { var s = hStats(h); return '<div class="hbar"><span class="n">' + h.icon + ' ' + esc(h.name) + '</span><span class="t"><i style="width:' + s.rate + '%"></i></span><em>' + num(s.rate + '%') + '</em></div>'; }).join('') : '<div class="empty">أضف عادات لتشوف تقدّمك هون.</div>') + '</section>' +
      '<section class="card"><h3>📈 قوة 1% <span class="sub">التحسّن المركّب</span></h3>' + compoundChart(days) +
      '<p class="muted" style="font-size:13px;margin:8px 0 0">لو تحسّنت 1% كل يوم، بعد سنة بتكون أحسن بحوالي <b class="gold">37 ضعف</b>. إنت هلق باليوم ' + num(days) + ' من رحلتك.</p></section>' +
      '<div class="section-title"><b>📘 تعلّم: مبادئ العادات الذرية</b></div>' +
      '<div class="learn">' + LAWS.map(function (l, i) { return '<details class="lcard"' + (i === 0 ? ' open' : '') + '><summary><span>' + l[0] + '</span>' + l[1] + '</summary><p>' + l[2] + '</p></details>'; }).join('') + '</div>' +
      '<p class="muted" style="font-size:12px;margin:0">الأفكار مستوحاة من كتاب "العادات الذرية" (Atomic Habits) لجيمس كلير. ننصحك تقرأه.</p>' +
      coachCta() +
      '<button class="btn ghost" data-act="shareApp">شارك التطبيق مع صاحبك 🤝</button>';
  }
  function compoundChart(day) {
    var W = 340, H = 150, pl = 8, pr = 8, pt = 12, pb = 22, max = Math.pow(1.01, 365);
    var X = function (d) { return pl + d / 365 * (W - pl - pr); }, Y = function (v) { return pt + (1 - v / max) * (H - pt - pb); };
    var up = [], down = [];
    for (var d = 0; d <= 365; d += 5) { up.push(X(d).toFixed(1) + ',' + Y(Math.pow(1.01, d)).toFixed(1)); down.push(X(d).toFixed(1) + ',' + Y(Math.pow(0.99, d)).toFixed(1)); }
    var cd = Math.min(365, day);
    return '<svg class="compound" viewBox="0 0 ' + W + ' ' + H + '" direction="ltr">' +
      '<polyline points="' + up.join(' ') + '" fill="none" stroke="#25d366" stroke-width="2.5"/><polyline points="' + down.join(' ') + '" fill="none" stroke="#ff5b5b" stroke-width="2" stroke-dasharray="4 3"/>' +
      '<circle cx="' + X(cd) + '" cy="' + Y(Math.pow(1.01, cd)) + '" r="5" fill="#ffb800"/>' +
      '<text x="' + (W - pr) + '" y="' + (pt + 4) + '" fill="#25d366" font-size="11" text-anchor="end">1.01³⁶⁵ = 37.8</text>' +
      '<text x="' + (W - pr) + '" y="' + (H - pb - 4) + '" fill="#ff5b5b" font-size="11" text-anchor="end">0.99³⁶⁵ = 0.03</text>' +
      '<text x="' + pl + '" y="' + (H - 6) + '" fill="#777" font-size="10">اليوم 1</text><text x="' + (W - pr) + '" y="' + (H - 6) + '" fill="#777" font-size="10" text-anchor="end">سنة</text></svg>';
  }

  /* ---------------- sheets & platform ---------------- */
  function openSheet(html, onMount) {
    $('#sheet-body').innerHTML = html; $('#sheet').hidden = false; document.body.style.overflow = 'hidden';
    $('.sheet-panel').scrollTop = 0;
    if (onMount) onMount($('#sheet-body'));
  }
  function closeSheet() { $('#sheet').hidden = true; $('#sheet-body').innerHTML = ''; document.body.style.overflow = ''; }
  function openExternal(url) {
    if (IS_ANDROID_APP && window.GMAndroid.openUrl) { window.GMAndroid.openUrl(url); return; }
    var w = window.open(url, '_blank'); if (!w) location.href = url;
  }
  function downloadText(name, text) {
    if (IS_ANDROID_APP && window.GMAndroid.saveFile) { var where = window.GMAndroid.saveFile(name, text); toast(where ? 'انحفظ الملف في: ' + where : 'تعذّر حفظ الملف'); return; }
    var blob = new Blob([text], { type: 'application/json' });
    if (navigator.canShare && navigator.share) {
      try { var file = new File([blob], name, { type: blob.type }); if (navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(function () {}); return; } } catch (e) {}
    }
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  }
  function pickFile(accept, cb) {
    var inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept; inp.style.display = 'none'; document.body.appendChild(inp);
    inp.addEventListener('change', function () { cb(inp.files && inp.files[0]); inp.remove(); }); inp.click();
  }
  function shareText(text) {
    if (navigator.share) { navigator.share({ text: text }).catch(function () {}); return; }
    openExternal('https://wa.me/?text=' + encodeURIComponent(text));
  }
  function keepScroll(fn) { var y = window.scrollY; fn(); window.scrollTo(0, y); }

  var ACTIONS = {
    addHabit: habitPicker,
    habitTpl: function (el) { var t = TEMPLATES[+el.getAttribute('data-i')]; habitForm({ icon: t.icon, name: t.name, kind: t.kind, days: t.days, identity: t.identity, stack: t.stack, cue: t.cue, tiny: t.tiny }); },
    habitCustom: function () { habitForm({}); },
    habitToggle: function (el) {
      var h = hById(el.getAttribute('data-id')), t = todayStr(); if (!h) return;
      if (h.log[t] === 1) delete h.log[t]; else h.log[t] = 1;
      save();
      if (h.log[t] === 1) {
        var s = hStats(h);
        toast(s.streak >= 3 && s.streak % 7 === 0 ? '🔥 ' + s.streak + ' مرة ورا بعض! لا تكسر السلسلة' : s.missedLast ? 'رجعت عالطريق 💪 هيك ما فوّتت مرتين' : 'صوت جديد لهويتك ✅');
        if (navigator.vibrate) navigator.vibrate(20);
      }
      keepScroll(render);
    },
    habitOpen: function (el) { var h = hById(el.getAttribute('data-id')); if (h) habitDetail(h); },
    habitCell: function (el) {
      var h = hById(el.getAttribute('data-id')), d = el.getAttribute('data-d'); if (!h) return;
      if (d > todayStr()) return;
      h.log[d] = h.log[d] === 1 ? 0 : h.log[d] === 0 ? undefined : 1;
      if (h.log[d] === undefined) delete h.log[d];
      if (d < h.created) h.created = d;
      save(); habitDetail(h); if (tab === 'today') keepScroll(render);
    },
    habitEdit: function (el) { var h = hById(el.getAttribute('data-id')); if (h) habitForm(h); },
    habitShare: function (el) {
      var h = hById(el.getAttribute('data-id')); if (!h) return; var s = hStats(h);
      shareText(h.icon + ' ' + h.name + '\n🔥 سلسلة ' + s.streak + ' يوم · التزام ' + s.rate + '%\n' + (h.identity ? '🪪 ' + h.identity + '\n' : '') + '\nعم تابع عاداتي بتطبيق GM Habits المجاني من الكوتش George Mousa 👇\n' + SITE + '/#app');
    },
    habitDelete: function (el) {
      if (!confirm('حذف العادة وكل سجلها؟')) return;
      var id = el.getAttribute('data-id'); S.habits = S.habits.filter(function (x) { return x.id !== id; }); save(); closeSheet(); render();
    },
    chNew: function () {
      openSheet('<h2>اختار تحدّي</h2><div class="presets">' +
        CH_PRESETS.map(function (p, i) { return '<button class="preset" data-act="chPreset" data-i="' + i + '"><span>' + p.icon + '</span><b>' + p.title + '</b><small>' + (p.kind === 'quit' ? 'ترك عادة' : 'بناء عادة') + '</small></button>'; }).join('') +
        '<button class="preset custom" data-act="chCustom"><span>✍️</span><b>تحدّي خاص فيك</b><small>اكتبه بنفسك</small></button></div>');
    },
    chPreset: function (el) { var p = CH_PRESETS[+el.getAttribute('data-i')]; chForm({ icon: p.icon, title: p.title, kind: p.kind, days: p.days, identity: p.identity, plan: p.plan, tip: p.tip }); },
    chCustom: function () { chForm({}); },
    chMark: function (el) {
      var c = chById(el.getAttribute('data-id')); if (!c) return;
      var d = el.getAttribute('data-d'), v = +el.getAttribute('data-v');
      if (c.log[d] === v) delete c.log[d]; else c.log[d] = v;
      save(); var s = chStats(c);
      if (c.log[d] === 1) toast(d === chEnd(c) ? '🏁 خلّصت التحدي! التزامك ' + s.rate + '%' : s.streak > 1 && s.streak % 7 === 0 ? '🔥 ' + s.streak + ' يوم ورا بعض!' : 'صوت جديد لهويتك ✅');
      else if (c.log[d] === 0) toast('مش مشكلة. المهم لا تفوّت مرتين 💪');
      keepScroll(render);
    },
    chOpen: function (el) {
      var c = chById(el.getAttribute('data-id')); if (!c) return; var s = chStats(c);
      openSheet('<h2>' + c.icon + ' ' + esc(c.title) + '</h2>' +
        '<div class="chstats big"><span>الالتزام<b>' + num(s.rate + '%') + '</b></span><span>السلسلة الحالية<b>' + num(s.streak) + '</b></span><span>أطول سلسلة<b>' + num(s.best) + '</b></span></div>' + chChain(c) +
        '<p class="muted" style="font-size:12px;margin:6px 0 12px">من ' + fmtDate(c.start) + ' إلى ' + fmtDate(chEnd(c)) + ' · 🟩 التزمت · 🟥 ما التزمت</p>' +
        (c.identity ? '<div class="idbox"><small>هويتك</small><b>' + esc(c.identity) + '</b></div>' : '') +
        (c.plan ? '<div class="idbox"><small>خطتك</small><b>' + esc(c.plan) + '</b></div>' : '') +
        (c.tip ? '<div class="idbox tip"><small>نصيحة</small><b>' + esc(c.tip) + '</b></div>' : '') +
        '<div class="actions2"><button class="btn ghost" data-act="chEdit" data-id="' + c.id + '">تعديل</button><button class="btn ghost" data-act="chShare" data-id="' + c.id + '">شارك التحدي</button></div>' +
        '<button class="btn danger" data-act="chDelete" data-id="' + c.id + '">حذف التحدي</button>');
    },
    chEdit: function (el) { var c = chById(el.getAttribute('data-id')); if (c) chForm(c); },
    chShare: function (el) {
      var c = chById(el.getAttribute('data-id')); if (!c) return; var s = chStats(c);
      shareText('🎯 تحدّي: ' + c.title + '\n📅 اليوم ' + Math.min(chDayNum(c), c.days) + ' من ' + c.days + '\n🔥 سلسلة ' + s.streak + ' يوم\n\nتحدّاني! نزّل تطبيق GM Habits المجاني من الكوتش George Mousa 👇\n' + SITE + '/#app');
    },
    chDelete: function (el) {
      if (!confirm('حذف التحدي وكل سجله؟')) return;
      var id = el.getAttribute('data-id'); S.challenges = S.challenges.filter(function (x) { return x.id !== id; }); save(); closeSheet(); render();
    },
    water: function (el) {
      var t = todayStr(), n = Math.max(0, (S.fit.water[t] || 0) + +el.getAttribute('data-v'));
      S.fit.water[t] = n; save();
      if (n === S.fit.waterGoal && +el.getAttribute('data-v') > 0) toast('💧 وصلت لهدف المي اليوم!');
      keepScroll(render);
    },
    logWorkout: function () {
      var t = todayStr(), w = S.fit.workouts[t] || {};
      openSheet('<h2>تمرين اليوم</h2><form class="form" id="wf"><div class="field"><label>نوع التمرين</label>' + chips('type', WK_TYPES, w.type || 'strength') + '</div>' +
        field('المدة (دقيقة)', '<input name="min" type="number" inputmode="numeric" min="0" max="400" value="' + (w.min || '') + '" placeholder="45">') +
        '<button class="btn" type="submit">حفظ</button>' + (w.type ? '<button class="btn danger" type="button" data-act="delWorkout">مسح تمرين اليوم</button>' : '') + '</form>', function (b) {
        var f = $('#wf', b); bindChips(f);
        f.addEventListener('submit', function (e) {
          e.preventDefault(); S.fit.workouts[t] = { type: chipVal(f, 'type'), min: +f.min.value || 0 }; save(); closeSheet(); keepScroll(render);
          toast(S.fit.workouts[t].type === 'rest' ? 'الراحة جزء من التمرين 😌' : 'عاش! تمرين جديد بالسجل 💪');
        });
      });
    },
    delWorkout: function () { delete S.fit.workouts[todayStr()]; save(); closeSheet(); render(); },
    addWeight: function () {
      openSheet('<h2>سجّل وزنك</h2><form class="form" id="wtf"><div class="row2">' + field('الوزن (كغ)', '<input name="kg" type="number" inputmode="decimal" step="0.1" min="30" max="300" required>') +
        field('التاريخ', '<input name="date" type="date" value="' + todayStr() + '" max="' + todayStr() + '" required>') + '</div><button class="btn" type="submit">حفظ</button></form>', function (b) {
        var f = $('#wtf', b);
        f.addEventListener('submit', function (e) {
          e.preventDefault(); var kg = parseFloat(f.kg.value), d = f.date.value || todayStr(); if (!(kg > 0)) return;
          S.fit.weights = S.fit.weights.filter(function (x) { return x.date !== d; }); S.fit.weights.push({ date: d, kg: kg }); save(); closeSheet(); render(); toast('تم ✅');
        });
      });
    },
    enableFit: function () { S.profile.trains = true; save(); render(); },
    coach: function () { openExternal(waLink('مرحبا كوتش جورج 👋 أنا ' + (S.profile ? S.profile.name : '') + '، جيت من تطبيق GM Habits ومهتم بالتدريب أونلاين.')); },
    shareApp: function () { shareText('عم استخدم تطبيق GM Habits المجاني لبناء عادات أحسن وتحديات متل 30 يوم بدون سكر 💪\nنزّله من هون 👇\n' + SITE + '/#app'); },
    settings: function () {
      var p = S.profile;
      openSheet('<h2>الإعدادات</h2><form class="form" id="sf">' + field('الاسم', '<input name="name" required value="' + esc(p.name) + '">') +
        '<div class="field"><label>الهوية يلي عم تبنيها</label><div class="chips" data-chips="identity" data-multi>' + Object.keys(IDENTITIES).map(function (k) { return chip(k, IDENTITIES[k], (p.identity || []).indexOf(k) >= 0); }).join('') + '</div></div>' +
        '<div class="field"><label>قسم اللياقة</label>' + chips('trains', { 1: 'مفعّل', 0: 'مخفي' }, p.trains ? 1 : 0) + '</div>' +
        '<div class="row2">' + field('هدف المي (كاسات)', '<input name="waterGoal" type="number" min="4" max="16" value="' + S.fit.waterGoal + '">') + field('تمارين بالأسبوع', '<input name="weekGoal" type="number" min="1" max="7" value="' + S.fit.weekGoal + '">') + '</div>' +
        '<button class="btn" type="submit">حفظ</button>' +
        '<div class="actions2"><button class="btn ghost" type="button" data-act="export">نسخة احتياطية</button><button class="btn ghost" type="button" data-act="import">استرجاع نسخة</button></div>' +
        '<button class="btn ghost" type="button" data-act="coach">تواصل مع الكوتش جورج</button>' +
        '<button class="btn ghost" type="button" data-act="site">موقع George Mousa</button>' +
        '<button class="btn danger" type="button" data-act="reset">مسح كل البيانات</button>' +
        '<p class="muted" style="margin:0;font-size:12px;text-align:center">بياناتك محفوظة على جهازك فقط، وما في حساب ولا سيرفر.<br>GM Habits v1.1 · مجاني من George Mousa Online Coaching</p></form>', function (b) {
        var f = $('#sf', b); bindChips(f);
        f.addEventListener('submit', function (e) {
          e.preventDefault(); p.name = f.name.value.trim(); p.identity = chipVals(f, 'identity'); p.trains = chipVal(f, 'trains') === '1';
          S.fit.waterGoal = Math.max(4, +f.waterGoal.value || 8); S.fit.weekGoal = Math.max(1, Math.min(7, +f.weekGoal.value || 4));
          save(); closeSheet(); render(); toast('تم الحفظ ✅');
        });
      });
    },
    site: function () { openExternal(SITE); },
    export: function () { downloadText('GM_Habits_' + todayStr() + '.json', JSON.stringify({ app: 'gm-habits', v: 1, exported: new Date().toISOString(), state: S })); },
    import: function () {
      pickFile('application/json,.json', function (file) {
        if (!file) return; var r = new FileReader();
        r.onload = function () {
          try { var d = JSON.parse(r.result); if (!d || d.app !== 'gm-habits' || !d.state) throw 0; S = Object.assign(blank(), d.state); S.fit = Object.assign(blank().fit, S.fit || {}); save(); closeSheet(); tab = 'today'; render(); toast('تم استرجاع بياناتك ✅'); }
          catch (e) { toast('الملف غير صالح'); }
        };
        r.readAsText(file);
      });
    },
    reset: function () { if (!confirm('متأكد؟ رح ينمسح كل شي.')) return; S = blank(); save(); closeSheet(); render(); }
  };

  window.gmBack = function () {
    if (!$('#sheet').hidden) { closeSheet(); return true; }
    if (S.profile && tab !== 'today') { tab = 'today'; render(); return true; }
    return false;
  };

  render();
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !IS_ANDROID_APP) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
