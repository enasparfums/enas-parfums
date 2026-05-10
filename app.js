/* ============================================================
   ÊNAS PARFUMS — app.js
   ============================================================ */

'use strict';

/* ── State ── */
const STATE = {
  lang: 'ar',
  tab: 'homme',
  selected: [],       // [{id, name, gender, inspiration}]
  wishlist: new Set(),
  searchQuery: '',
  filters: { family: '', intensity: '' },
  quizAnswers: {},
  quizStep: 0,
  data: null
};

const MAX = 4;
const WA_NUMBER = '+212601533785';

/* ── Translations ── */
const T = {
  ar: {
    counter: (n) => `اخترت ${n}/${MAX} عطور`,
    finalize: 'أكمل الطلب ✓',
    max_reached: 'وصلت للحد الأقصى',
    select: 'اختر',
    deselect: 'إزالة',
    homme_label: '👨 رجال',
    femme_label: '👩 نساء',
    search_placeholder: 'ابحث عن عطر...',
    add_to_selection: 'أضف إلى الاختيار',
    remove: 'إزالة',
    notes_top: 'رأس',
    notes_heart: 'قلب',
    notes_base: 'قاعدة',
    order_title: 'أكمل طلبك',
    your_selection: '🛒 عطورك المختارة',
    full_name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    city: 'المدينة',
    address: 'العنوان الكامل',
    notes_field: 'ملاحظات إضافية (اختياري)',
    send_whatsapp: 'إرسال الطلب عبر واتساب',
    delivery_free: '✅ التوصيل مجاني — Livraison offerte 🎁',
    cod: '💰 الدفع عند الاستلام — Paiement à la livraison',
    added: (name) => `✓ تمت إضافة ${name}`,
    removed: (name) => `✗ تمت إزالة ${name}`,
    max_toast: `⚠️ الحد الأقصى 4 عطور`,
    no_results: 'لا توجد نتائج',
    quiz_start: '🔍 اكتشف عطرك المثالي',
    quiz_recommend: 'عطورنا المقترحة لك',
    quiz_apply: 'أضف هذه الاختيارات لطلبي',
    homme_tag: 'رجال',
    femme_tag: 'نساء',
    vol_homme: '50ml',
    vol_femme: '30ml',
    free_delivery_badge: '🚚 توصيل مجاني',
    wishlisted: '❤️ في قائمة الأمنيات',
    select_hint: 'انقر للاختيار',
    form_required: 'يرجى ملء جميع الحقول المطلوبة',
    select_city: 'اختر مدينتك'
  },
  fr: {
    counter: (n) => `${n}/${MAX} parfums sélectionnés`,
    finalize: 'Finaliser ✓',
    max_reached: 'Maximum atteint',
    select: 'Choisir',
    deselect: 'Retirer',
    homme_label: '👨 Homme',
    femme_label: '👩 Femme',
    search_placeholder: 'Rechercher un parfum...',
    add_to_selection: 'Ajouter à la sélection',
    remove: 'Retirer',
    notes_top: 'Tête',
    notes_heart: 'Cœur',
    notes_base: 'Fond',
    order_title: 'Finalisez votre commande',
    your_selection: '🛒 Vos parfums',
    full_name: 'Nom complet',
    phone: 'Numéro de téléphone',
    city: 'Ville',
    address: 'Adresse complète',
    notes_field: 'Remarques (optionnel)',
    send_whatsapp: 'Envoyer via WhatsApp',
    delivery_free: '✅ Livraison gratuite 🎁',
    cod: '💰 Paiement à la livraison',
    added: (name) => `✓ ${name} ajouté`,
    removed: (name) => `✗ ${name} retiré`,
    max_toast: `⚠️ Maximum 4 parfums`,
    no_results: 'Aucun résultat',
    quiz_start: '🔍 Découvrez votre parfum idéal',
    quiz_recommend: 'Nos recommandations pour vous',
    quiz_apply: 'Ajouter à ma sélection',
    homme_tag: 'Homme',
    femme_tag: 'Femme',
    vol_homme: '50ml',
    vol_femme: '30ml',
    free_delivery_badge: '🚚 Livraison gratuite',
    wishlisted: '❤️ En favoris',
    select_hint: 'Cliquer pour choisir',
    form_required: 'Veuillez remplir tous les champs requis',
    select_city: 'Choisissez votre ville'
  }
};

/* ── Helpers ── */
const t = (key, ...args) => {
  const val = T[STATE.lang][key];
  return typeof val === 'function' ? val(...args) : val;
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ── Load Data ── */
async function loadData() {
  try {
    const res = await fetch('data.json');
    STATE.data = await res.json();
    loadWishlist();
    init();
  } catch (e) {
    console.error('Failed to load data.json', e);
  }
}

/* ── Init ── */
function init() {
  renderTicker();
  renderProducts();
  renderTestimonials();
  renderQuiz();
  buildOrderForm();
  setupEventListeners();
  startIntroSplash();
  setupScrollReveal();
}

/* ── Intro Splash ── */
function startIntroSplash() {
  const splash = $('#intro-splash');
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => { splash.style.display = 'none'; }, 800);
  }, 2200);
}

/* ── Language ── */
function setLang(lang) {
  STATE.lang = lang;
  document.body.direction = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  if (lang === 'fr') {
    document.body.classList.add('lang-fr');
  } else {
    document.body.classList.remove('lang-fr');
  }

  $$('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update all bilingual elements
  $$('[data-ar]').forEach(el => {
    el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.fr;
  });

  // Update search placeholder
  const searchInput = $('#search-input');
  if (searchInput) searchInput.placeholder = t('search_placeholder');

  updateCounter();
  renderProducts();
  buildOrderForm();
  renderQuiz();
}

/* ── Ticker ── */
function renderTicker() {
  const track = $('#ticker-track');
  if (!track) return;
  const items = [
    '🎁 توصيل مجاني لجميع أنحاء المغرب 🇲🇦',
    'Livraison Gratuite partout au Maroc',
    '📦 الدفع عند الاستلام',
    'Paiement à la livraison',
    '⏱️ 2-5 أيام عمل',
    '2-5 jours ouvrables',
    '🌿 Ênas Parfums — L\'Essence de Luxe',
    '💛 4 عطور بـ 200 درهم فقط',
  ];
  const double = [...items, ...items];
  track.innerHTML = double.map(i => `<span class="ticker-item">${i}</span>`).join('');
}

/* ── Products ── */
function getFilteredProducts() {
  const pool = STATE.tab === 'homme'
    ? STATE.data.perfumes_homme
    : STATE.data.perfumes_femme;

  return pool.filter(p => {
    const q = STATE.searchQuery.toLowerCase();
    const nameMatch = p.name.toLowerCase().includes(q) ||
      p.inspiration.toLowerCase().includes(q);
    const familyMatch = !STATE.filters.family || p.family === STATE.filters.family;
    const intensityMatch = !STATE.filters.intensity || p.intensity === STATE.filters.intensity;
    return (q === '' || nameMatch) && familyMatch && intensityMatch;
  });
}

function renderProducts() {
  const grid = $('#products-grid');
  if (!grid) return;

  const products = getFilteredProducts();
  const isMaxed = STATE.selected.length >= MAX;

  if (products.length === 0) {
    grid.innerHTML = `<div class="no-results">${t('no_results')} 🔍</div>`;
    return;
  }

  grid.innerHTML = products.map(p => {
    const sel = STATE.selected.find(s => s.id === p.id);
    const isSel = !!sel;
    const wishlisted = STATE.wishlist.has(p.id);
    const isMaxedOut = isMaxed && !isSel;
    const gender = p.gender;
    const genderTag = gender === 'homme' ? t('homme_tag') : t('femme_tag');
    const volClass = gender === 'homme' ? 'vol-homme' : 'vol-femme';
    const badgeClass = gender === 'homme' ? 'badge-homme' : 'badge-femme';
    const selClass = isSel ? `selected-${gender}` : '';
    const maxClass = isMaxedOut ? 'maxed' : '';

    return `
      <div class="product-card ${selClass} ${maxClass}"
           data-id="${p.id}"
           data-gender="${gender}"
           onclick="toggleProduct('${p.id}')">
        <div class="product-img-wrap">
          <span class="product-gender-badge ${badgeClass}">${genderTag}</span>
          <img src="${p.image}" alt="${p.name}" loading="lazy"
               onerror="this.src='images/placeholder.jpg'">
          <div class="product-check">✓</div>
          <button class="product-wishlist ${wishlisted ? 'wishlisted' : ''}"
                  onclick="toggleWishlist(event, '${p.id}')"
                  title="Wishlist">
            ${wishlisted ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-inspiration">${p.inspiration}</div>
          <div class="product-footer">
            <span class="product-volume ${volClass}">${p.volume}</span>
            <span class="product-delivery">🚚 مجاني</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── Toggle Product ── */
function toggleProduct(id) {
  const pool = [...STATE.data.perfumes_homme, ...STATE.data.perfumes_femme];
  const product = pool.find(p => p.id === id);
  if (!product) return;

  const idx = STATE.selected.findIndex(s => s.id === id);
  if (idx !== -1) {
    STATE.selected.splice(idx, 1);
    showToast(t('removed', product.name), product.gender);
  } else {
    if (STATE.selected.length >= MAX) {
      showToast(t('max_toast'), 'max');
      return;
    }
    STATE.selected.push({ id: product.id, name: product.name, gender: product.gender, inspiration: product.inspiration, image: product.image });
    showToast(t('added', product.name), product.gender);
  }

  updateCounter();
  renderProducts();
  updateOrderRecap();
}

/* ── Counter ── */
function updateCounter() {
  const n = STATE.selected.length;

  // Update counter text
  const cText = $('#counter-text');
  if (cText) cText.textContent = t('counter', n);

  // Update dots
  const dots = $$('.counter-dot');
  dots.forEach((dot, i) => {
    dot.className = 'counter-dot';
    if (i < n) {
      const gender = STATE.selected[i]?.gender || 'homme';
      dot.classList.add(`filled-${gender}`);
      dot.textContent = STATE.selected[i]?.gender === 'femme' ? '👩' : '👨';
    } else {
      dot.textContent = '';
    }
  });

  // Update finalize button
  const btn = $('#finalize-btn');
  if (btn) {
    btn.textContent = n === MAX ? t('finalize') : `${t('finalize')} (${n}/${MAX})`;
    btn.classList.toggle('active', n === MAX);
  }

  // Cart badge
  const badge = $('#cart-badge');
  if (badge) {
    badge.textContent = n;
    badge.classList.toggle('show', n > 0);
  }

  // Show/hide order section
  const orderSection = $('#order-section');
  if (orderSection) {
    orderSection.classList.toggle('show', n === MAX);
    if (n === MAX) {
      setTimeout(() => {
        orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }
}

/* ── Wishlist ── */
function toggleWishlist(e, id) {
  e.stopPropagation();
  if (STATE.wishlist.has(id)) {
    STATE.wishlist.delete(id);
  } else {
    STATE.wishlist.add(id);
  }
  saveWishlist();
  renderProducts();
}

function saveWishlist() {
  localStorage.setItem('enas_wishlist', JSON.stringify([...STATE.wishlist]));
}
function loadWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem('enas_wishlist') || '[]');
    STATE.wishlist = new Set(saved);
  } catch { STATE.wishlist = new Set(); }
}

/* ── Toast ── */
let toastTimer;
function showToast(msg, type) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `show toast-${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.className = '', 2800);
}

/* ── Order Recap ── */
function updateOrderRecap() {
  const list = $('#recap-list');
  if (!list) return;

  if (STATE.selected.length === 0) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = STATE.selected.map((p, i) => `
    <li class="recap-item">
      <span class="recap-num ${p.gender === 'homme' ? 'num-homme' : 'num-femme'}">${i + 1}</span>
      <span class="recap-name">${p.name}</span>
      <span class="recap-gender">${p.gender === 'homme' ? '👨' : '👩'}</span>
      <button class="recap-remove" onclick="removeFromRecap('${p.id}')" title="Supprimer">✕</button>
    </li>
  `).join('');
}

function removeFromRecap(id) {
  const idx = STATE.selected.findIndex(s => s.id === id);
  if (idx !== -1) STATE.selected.splice(idx, 1);
  updateCounter();
  renderProducts();
  updateOrderRecap();
}

/* ── Build Order Form ── */
function buildOrderForm() {
  const form = $('#order-form');
  if (!form || !STATE.data) return;

  const cities = STATE.data.cities;
  const lang = STATE.lang;

  form.innerHTML = `
    <div class="order-recap" id="order-recap">
      <div class="order-recap-title">${t('your_selection')}</div>
      <ul class="order-recap-list" id="recap-list"></ul>
      <div class="recap-total">
        <span class="recap-price">200 <small style="font-size:1rem">${STATE.data.bundle.currency}</small></span>
        <div class="recap-badges">
          <span class="recap-badge badge-green">🎁 ${lang === 'ar' ? 'توصيل مجاني' : 'Livraison gratuite'}</span>
          <span class="recap-badge badge-gold">💰 ${lang === 'ar' ? 'دفع عند الاستلام' : 'Paiement à la livraison'}</span>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">${t('full_name')} *</label>
      <input class="form-input" id="field-name" type="text" required
             placeholder="${lang === 'ar' ? 'محمد العلوي' : 'Mohammed Alaoui'}">
    </div>
    <div class="form-group">
      <label class="form-label">${t('phone')} *</label>
      <input class="form-input" id="field-phone" type="tel" required
             placeholder="06 XX XX XX XX" dir="ltr">
    </div>
    <div class="form-group">
      <label class="form-label">${t('city')} *</label>
      <select class="form-select" id="field-city" required>
        <option value="">${t('select_city')}</option>
        ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">${t('address')} *</label>
      <input class="form-input" id="field-address" type="text" required
             placeholder="${lang === 'ar' ? 'شارع محمد الخامس، رقم 12...' : 'Rue Mohammed V, N° 12...'}">
    </div>
    <div class="form-group">
      <label class="form-label">${t('notes_field')}</label>
      <textarea class="form-textarea" id="field-notes"
                placeholder="${lang === 'ar' ? 'ملاحظات خاصة بطلبك...' : 'Remarques particulières...'}"></textarea>
    </div>

    <div style="background: rgba(26,74,46,0.06); border-radius: 12px; padding: 14px; margin-bottom: 20px; text-align: center;">
      <div style="font-weight: 700; color: var(--green); margin-bottom: 6px; font-size: 0.9rem;">${t('delivery_free')}</div>
      <div style="font-weight: 600; color: var(--gold); font-size: 0.85rem;">${t('cod')}</div>
    </div>

    <button class="form-submit-btn" onclick="submitOrder()">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      ${t('send_whatsapp')}
    </button>
  `;

  updateOrderRecap();
}

/* ── Submit Order ── */
function submitOrder() {
  if (STATE.selected.length < MAX) {
    showToast(t('max_toast'), 'max');
    return;
  }

  const name = $('#field-name')?.value?.trim();
  const phone = $('#field-phone')?.value?.trim();
  const city = $('#field-city')?.value;
  const address = $('#field-address')?.value?.trim();
  const notes = $('#field-notes')?.value?.trim() || '—';

  if (!name || !phone || !city || !address) {
    showToast(t('form_required'), 'max');
    return;
  }

  const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
  const perfumesLine = STATE.selected.map((p, i) =>
    `${emoji[i]} ${p.name} — ${p.gender === 'homme' ? '👨 Homme' : '👩 Femme'}`
  ).join('\n');

  const message = `🌿 *طلب جديد — Ênas Parfums*
━━━━━━━━━━━━━━━━━━━━
👤 الاسم: ${name}
📞 الهاتف: ${phone}
📍 المدينة: ${city}
🏠 العنوان: ${address}
━━━━━━━━━━━━━━━━━━━━
🛒 *العطور المختارة:*
${perfumesLine}
━━━━━━━━━━━━━━━━━━━━
💰 المبلغ الإجمالي: *200 درهم*
🎁 التوصيل: *مجاني* ✅
📦 الدفع عند الاستلام
━━━━━━━━━━━━━━━━━━━━
📝 ملاحظات: ${notes}
🌿 Ênas Parfums — L'Essence de Luxe`;

  const encoded = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WA_NUMBER.replace('+', '')}?text=${encoded}`;
  window.open(waUrl, '_blank');
}

/* ── Testimonials ── */
function renderTestimonials() {
  const track = $('#testimonials-track');
  if (!track || !STATE.data) return;

  const items = [...STATE.data.testimonials, ...STATE.data.testimonials]; // double for infinite scroll
  track.innerHTML = items.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">${STATE.lang === 'ar' ? t.text_ar : t.text_fr}</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.name[0]}</div>
        <div>
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-city">📍 ${t.city}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── Quiz ── */
function renderQuiz() {
  const container = $('#quiz-container');
  if (!container || !STATE.data) return;

  const { questions } = STATE.data.quiz;
  const lang = STATE.lang;
  const step = STATE.quizStep;

  if (step >= questions.length) {
    renderQuizResults();
    return;
  }

  const q = questions[step];
  const progress = ((step / questions.length) * 100);

  container.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-progress">
        <div class="quiz-progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="quiz-step-label">${step + 1} / ${questions.length}</div>
      <div class="quiz-question">${lang === 'ar' ? q.text_ar : q.text_fr}</div>
      <div class="quiz-options">
        ${q.options.map(o => `
          <button class="quiz-option ${STATE.quizAnswers[q.id] === o.value ? 'selected' : ''}"
                  onclick="answerQuiz('${q.id}', '${o.value}')">
            ${lang === 'ar' ? o.label_ar : o.label_fr}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function answerQuiz(qId, value) {
  STATE.quizAnswers[qId] = value;
  STATE.quizStep++;

  if (STATE.quizStep >= STATE.data.quiz.questions.length) {
    renderQuizResults();
  } else {
    renderQuiz();
  }
}

function renderQuizResults() {
  const container = $('#quiz-container');
  if (!container) return;

  // Pick recommendations based on answers
  const gender = STATE.quizAnswers['q1'];
  const family = STATE.quizAnswers['q2'];
  const intensity = STATE.quizAnswers['q4'];
  const lang = STATE.lang;

  let pool = [];
  if (gender === 'femme') pool = STATE.data.perfumes_femme;
  else if (gender === 'homme') pool = STATE.data.perfumes_homme;
  else pool = [...STATE.data.perfumes_homme, ...STATE.data.perfumes_femme];

  // Score matching
  let scored = pool.map(p => {
    let score = 0;
    if (p.family && family && p.family.includes(family)) score += 3;
    if (p.intensity === intensity) score += 2;
    score += Math.random(); // slight randomness
    return { ...p, score };
  }).sort((a, b) => b.score - a.score).slice(0, 4);

  container.innerHTML = `
    <div class="quiz-card quiz-results show">
      <div class="quiz-result-title">✨ ${t('quiz_recommend')}</div>
      <div class="quiz-result-grid">
        ${scored.map(p => `
          <div class="quiz-result-card" onclick="applyQuizResult('${p.id}')">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='images/placeholder.jpg'">
            <div class="quiz-result-name">${p.name}</div>
            <div style="font-size:0.7rem;color:var(--grey);margin-top:4px">${p.gender === 'homme' ? '👨' : '👩'} ${p.volume}</div>
          </div>
        `).join('')}
      </div>
      <button class="quiz-apply-btn" onclick="applyAllQuizResults(${JSON.stringify(scored.map(p => p.id))})">
        ${t('quiz_apply')}
      </button>
      <br><br>
      <button class="quiz-option" onclick="resetQuiz()" style="margin-top:8px">
        🔄 ${lang === 'ar' ? 'إعادة الاختبار' : 'Recommencer'}
      </button>
    </div>
  `;
}

function applyQuizResult(id) {
  toggleProduct(id);
}

function applyAllQuizResults(ids) {
  STATE.selected = [];
  const pool = [...STATE.data.perfumes_homme, ...STATE.data.perfumes_femme];
  ids.slice(0, MAX).forEach(id => {
    const p = pool.find(x => x.id === id);
    if (p) STATE.selected.push({ id: p.id, name: p.name, gender: p.gender, inspiration: p.inspiration, image: p.image });
  });
  updateCounter();
  renderProducts();
  updateOrderRecap();
  showToast('✓ ' + (STATE.lang === 'ar' ? 'تمت الإضافة!' : 'Ajouté!'), 'homme');
  $('#products-section')?.scrollIntoView({ behavior: 'smooth' });
}

function resetQuiz() {
  STATE.quizStep = 0;
  STATE.quizAnswers = {};
  renderQuiz();
}

/* ── Event Listeners ── */
function setupEventListeners() {
  // Language buttons
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Tab buttons
  const tabHomme = $('#tab-homme');
  const tabFemme = $('#tab-femme');
  if (tabHomme) tabHomme.addEventListener('click', () => switchTab('homme'));
  if (tabFemme) tabFemme.addEventListener('click', () => switchTab('femme'));

  // Finalize button
  const finalizeBtn = $('#finalize-btn');
  if (finalizeBtn) {
    finalizeBtn.addEventListener('click', () => {
      if (STATE.selected.length === MAX) {
        $('#order-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Search
  const searchInput = $('#search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      STATE.searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Filter buttons
  $$('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.filterType;
      const val = btn.dataset.filter;

      if (STATE.filters[type] === val) {
        STATE.filters[type] = '';
        btn.classList.remove('active', 'active-homme', 'active-femme');
      } else {
        // deactivate siblings
        $$(`[data-filter-type="${type}"]`).forEach(b => {
          b.classList.remove('active', 'active-homme', 'active-femme');
        });
        STATE.filters[type] = val;
        btn.classList.add('active');
      }
      renderProducts();
    });
  });

  // Hero buttons
  $('#hero-btn-homme')?.addEventListener('click', () => {
    switchTab('homme');
    $('#products-section')?.scrollIntoView({ behavior: 'smooth' });
  });
  $('#hero-btn-femme')?.addEventListener('click', () => {
    switchTab('femme');
    $('#products-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Cart button
  $('#nav-cart-btn')?.addEventListener('click', () => {
    if (STATE.selected.length > 0) {
      $('#order-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      $('#products-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Navbar scroll effect
  window.addEventListener('scroll', onScroll, { passive: true });

  // Close modal on backdrop click
  $('#product-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
}

function switchTab(tab) {
  STATE.tab = tab;
  STATE.searchQuery = '';
  STATE.filters = { family: '', intensity: '' };

  const searchInput = $('#search-input');
  if (searchInput) searchInput.value = '';

  const tabHomme = $('#tab-homme');
  const tabFemme = $('#tab-femme');

  if (tabHomme && tabFemme) {
    tabHomme.className = 'tab-btn' + (tab === 'homme' ? ' active-homme' : '');
    tabFemme.className = 'tab-btn' + (tab === 'femme' ? ' active-femme' : '');
  }

  $$('.filter-btn').forEach(b => b.classList.remove('active', 'active-homme', 'active-femme'));
  renderProducts();
}

/* ── Modal ── */
function openModal(id) {
  const pool = [...STATE.data.perfumes_homme, ...STATE.data.perfumes_femme];
  const p = pool.find(x => x.id === id);
  if (!p) return;

  const lang = STATE.lang;
  const isSel = !!STATE.selected.find(s => s.id === id);
  const gender = p.gender;
  const badgeClass = gender === 'homme' ? 'badge-homme' : 'badge-femme';
  const btnClass = gender === 'homme' ? 'modal-add-btn-homme' : 'modal-add-btn-femme';
  const genderTag = gender === 'homme' ? t('homme_tag') : t('femme_tag');

  const modalBody = $('#modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <span class="modal-gender-badge ${badgeClass}">${genderTag} — ${p.volume}</span>
      <div class="modal-name">${p.name}</div>
      <div class="modal-inspiration">${lang === 'ar' ? 'مستوحى من' : 'Inspiré de'}: ${p.inspiration}</div>
      <div class="modal-notes">
        <div class="modal-notes-title">${lang === 'ar' ? 'الرائحة' : 'Pyramide olfactive'}</div>
        <div class="notes-pyramid">
          <div class="note-group">
            <span class="note-label">${t('notes_top')}</span>
            <span class="note-value">${p.notes.top}</span>
          </div>
          <div class="note-group">
            <span class="note-label">${t('notes_heart')}</span>
            <span class="note-value">${p.notes.heart}</span>
          </div>
          <div class="note-group">
            <span class="note-label">${t('notes_base')}</span>
            <span class="note-value">${p.notes.base}</span>
          </div>
        </div>
      </div>
      <button class="modal-add-btn ${btnClass} ${isSel ? 'selected' : ''}"
              onclick="toggleProduct('${p.id}'); closeModal()">
        ${isSel ? ('✓ ' + t('remove')) : ('+ ' + t('add_to_selection'))}
      </button>
    `;
  }

  const modalImg = $('#modal-img');
  if (modalImg) {
    modalImg.src = p.image;
    modalImg.alt = p.name;
    modalImg.onerror = () => { modalImg.src = 'images/placeholder.jpg'; };
  }

  const modal = $('#product-modal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = $('#product-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Scroll ── */
function onScroll() {
  const navbar = $('#navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);

  const backTop = $('#back-top');
  if (backTop) backTop.classList.toggle('show', window.scrollY > 400);

  checkRevealElements();
}

function checkRevealElements() {
  $$('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('visible');
    }
  });
}

function setupScrollReveal() {
  checkRevealElements();
  window.addEventListener('scroll', checkRevealElements, { passive: true });
}

/* ── Expose globals ── */
window.toggleProduct = toggleProduct;
window.toggleWishlist = toggleWishlist;
window.removeFromRecap = removeFromRecap;
window.submitOrder = submitOrder;
window.openModal = openModal;
window.closeModal = closeModal;
window.answerQuiz = answerQuiz;
window.applyQuizResult = applyQuizResult;
window.applyAllQuizResults = applyAllQuizResults;
window.resetQuiz = resetQuiz;
window.setLang = setLang;
window.switchTab = switchTab;

/* ── Start ── */
document.addEventListener('DOMContentLoaded', loadData);
