// ── BOOKING STATE ──
var bkState = {
  date: '', adults: 2, children: 0,
  payMethod: 0, // 0=pay-later, 1=bank, 2=revolut, 3=stripe
  ref: '', name: '', email: '', phone: '',
  bokunBookingId: null
};

var BK_PRICES = {
  0: { adult: 85, child: 70 }, // pay-later (same base price)
  1: { adult: 85, child: 70 },
  2: { adult: 86, child: 71 },
  3: { adult: 87, child: 72 }
};


// ── I18N LOOKUP (Phase 1 — English baseline only) ──
var BK_I18N = {
  en: {
    // Daiga card
    'daiga.title': 'Not sure yet? Ask Daiga.',
    'daiga.sub': 'Most guests message first \u2014 no pressure to book on the spot.',
    'daiga.waBtn': 'WhatsApp Daiga',
    'daiga.emailBtn': 'Send email',
    'daiga.chooseHow': 'Choose how to send',
    'daiga.gmail': 'Open in Gmail',
    'daiga.outlook': 'Open in Outlook',
    'daiga.apple': 'Apple Mail / Default',
    'daiga.copy': 'Copy email text to clipboard',

    // Booking header
    'header.priceLabel': 'Book direct with Daiga',
    'header.priceSave': 'Save 34%',
    'header.priceSub': 'per adult \u00a0\u00b7\u00a0 child \u20ac70',

    // Zero strip
    'zero.main': 'Reserve today \u2014 nothing to pay right now',
    'zero.step1': '\u20ac0 upfront',
    'zero.step2': '20% deposit 48\u00a0hrs before',
    'zero.step3': 'Rest at the van',
    'zero.step4': 'Free cancellation 24\u00a0hrs prior',

    // Step 1
    's1.pill': 'Step 1 of 2 \u2014 your date & group',
    's1.dateLabel': 'Date',
    's1.adultsLabel': 'Adults',
    's1.childrenLabel': 'Children (u-12)',
    's1.zeroNote': 'No payment needed to reserve \u2014 choose how to pay on the next step.',
    's1.nextBtn': 'Next: your details \u2192',
    's1.orDivider': 'or',
    's1.waBtn': 'Ask Daiga via WhatsApp',

    // Step 2 — details
    's2.pill': 'Step 2 of 3 \u2014 your details',
    's2a.nameLabel': 'Full name',
    's2a.namePh': 'e.g. Sarah Johnson',
    's2a.emailLabel': 'Email address',
    's2a.emailPh': 'you@example.com',
    's2a.phoneLabel': 'Phone / WhatsApp <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span>',
    's2a.phonePh': '+44 7700 900000',
    's2a.langLabel': 'Preferred guide language',
    's2a.langEn': 'English (default)',
    's2a.langLv': 'Latvian (default)',
    's2a.langRu': 'Russian (on request)',
    's2a.langDe': 'German (on request)',
    's2a.langFr': 'French (on request)',
    's2a.langNote': 'Russian, German & French are subject to guide availability \u2014 we\u2019ll confirm by message before your tour.',
    's2a.sendOtpBtn': 'Send verification code \u2192',
    's2a.backBtn': '\u2190 Change date or group',
    's2b.codeSentPrefix': '\u2713 Code sent to',
    's2b.otpCodeLabel': '6-digit verification code',
    's2b.otpCodePh': 'e.g. 847291',
    's2b.verifyBtn': 'Verify & choose payment \u2192',
    's2b.resendBtn': '\u21ba Resend code or change email',

    // Step 3 — payment
    's3.pill': 'Step 3 of 3 \u2014 payment',
    's3.totalLabel': 'Estimated total',
    's3.closeWarn': '<strong>Departure in under 3 days</strong> \u2014 bank transfer and Revolut can\u2019t be processed in time.\n                Pay instantly online below, or <a href="tel:+37126440152" style="color:var(--moss);font-weight:600">call Daiga (+371 264 40 152)</a> to arrange a seat hold and pay at the bus on the day.',
    's3.opts.paylaterBadge': '\u2726 Reserve free today',
    's3.opts.paylaterName': 'Pay at the van \u2014 zero upfront',
    's3.opts.paylaterPrice': '\u20ac0 today',
    's3.opts.paylaterDesc': 'Secure your seats now with no payment. A 20% deposit link arrives 48 hrs before departure. Pay the rest in cash or card at the van on the day.',
    's3.opts.bankBadge': 'Lowest price',
    's3.opts.bankName': 'Bank transfer',
    's3.opts.bankDesc': 'Seats held in B\u00f3kun for 2 working days while you transfer. Available 3+ days before departure.',
    's3.opts.revName': 'Revolut payment link',
    's3.opts.revDesc': 'Daiga sends a secure Revolut invoice. Card, Apple Pay, Google Pay accepted. Available 3+ days before departure.',
    's3.opts.stripeBadge': 'Instant confirmation',
    's3.opts.stripeName': 'Pay online \u2014 Stripe',
    's3.opts.stripeDesc': 'Secure card payment. Seats blocked instantly, confirmation by email. No B\u00f3kun account needed.',
    's3.proceedBank': 'Reserve with bank transfer \u2192',
    's3.backBtn': '\u2190 Back',

    // Step 4 bank
    's4bank.pill': '\u2713 Seats held \u2014 transfer to confirm',
    'ref.label': 'Your booking reference',
    's4bank.refSub': 'Seats held for 2 working days \u00b7 Quote this reference in your transfer',
    's4bank.transferPrefix': 'Transfer',
    's4bank.transferSuffix': ' to:',
    's4bank.acctName': 'Account name',
    's4bank.iban': 'IBAN',
    's4bank.bic': 'BIC',
    's4bank.reference': 'Reference',
    's4bank.amount': 'Amount',
    's4bank.paymentNote': 'After transferring, send Daiga your reference on WhatsApp and she\u2019ll confirm your booking \u2014 usually within a few hours.',
    's4bank.waBtn': 'Notify Daiga via WhatsApp',
    's4.backBtn': '\u2190 Back to payment options',
    's4.backBtnEnt': '\u2190 Back to payment options',

    // Step 4 revolut
    's4rev.pill': 'Revolut payment link',
    's4rev.refSub': 'Seats held for 2 working days pending payment',
    's4rev.intro': 'Daiga will generate a <strong>secure Revolut payment link</strong> and send it to you \u2014 usually within a few hours. Pay by card, Apple Pay, or Google Pay.',
    's4rev.waBtn': 'Send request via WhatsApp',
    's4rev.emailBtn': 'Or send via email',

    // Step 4 stripe
    's4stripe.holding': 'Holding your seats in B\u00f3kun and opening secure Stripe checkout\u2026',
    's4stripe.noClose': 'Do not close this window.',

    // Step 4 paylater
    's4pl.pill': '\u2714 Seat reserved \u2014 nothing to pay today',
    's4pl.refSub': 'Keep this handy \u2014 we\u2019ll email it to you too',
    's4pl.row1': '<strong>Right now</strong> \u2014 your seat is held. Check your email for confirmation.',
    's4pl.row2': '<strong>48 hrs before departure</strong> \u2014 Daiga sends a secure link for a <span id="bk-paylater-deposit" style="color:var(--moss);font-weight:700">\u20ac0</span> deposit (20%) to permanently lock in your spot.',
    's4pl.row3': '<strong>Morning of the tour</strong> \u2014 pay the remaining <span id="bk-paylater-remaining" style="color:var(--bark);font-weight:700">\u20ac0</span> in cash or by card tap at the van.',
    's4pl.freeCancel': '\uD83D\uDD14 <strong>Free cancellation</strong> up to 24 hours before departure \u2014 no chasing refunds, just send Daiga a message.',
    's4pl.waBtn': 'Say hi to Daiga on WhatsApp',

    // Error step
    'err.pill': 'Something went wrong',
    'err.defaultMsg': 'An error occurred. Please try again or contact Daiga directly.',
    'err.waBtn': 'Contact Daiga on WhatsApp',
    'err.tryDiff': '\u2190 Try a different payment method',
    'err.stripeCheckoutPrefix': 'Could not start Stripe checkout: ',
    'err.stripeCheckoutSuffix': '. Please try bank transfer or contact Daiga directly.',

    // JS runtime strings
    'js.alert.name': 'Please enter your full name.',
    'js.err.invalidEmail': '\u26a0 Please enter a valid email address.',
    'js.err.warnPrefix': '\u26a0 ',
    'js.err.sendFail': 'Could not send code. Please try again.',
    'js.err.network': '\u26a0 Network error. Please try again.',
    'js.err.timeout': '\u26a0 Request timed out. Please check your connection and try again.',
    'js.err.enterCode': '\u26a0 Please enter the 6-digit code from your email.',
    'js.err.codeDigits': '\u26a0 The code should be exactly 6 digits.',
    'js.err.incorrectCode': 'Incorrect code \u2014 please check and try again.',
    'js.btn.sendOtp': 'Send verification code \u2192',
    'js.btn.sendingCode': 'Sending code\u2026',
    'js.btn.verifyOtp': 'Verify & choose payment \u2192',
    'js.btn.verifying': 'Verifying\u2026',
    'js.btn.reserving': 'Reserving your seat\u2026',
    'js.btn.holdingSeats': 'Holding seats in Bokun...',
    'js.countdown.prefix': 'Code expires in ',
    'js.countdown.expired': 'Code expired \u2014 please request a new one.',
    'js.pay.label0': 'Reserve My Seat \u2014 Pay Nothing Today \u2192',
    'js.pay.label1': 'Reserve with bank transfer \u2192',
    'js.pay.label2': 'Request Revolut payment link \u2192',
    'js.pay.label3': 'Pay securely online (Stripe) \u2192',

    // Availability state map
    'avail.idle': 'Select a date to check live availability.',
    'avail.loading': '<span style="opacity:.7">\u23f3 Checking live availability\u2026</span>',
    'avail.ok.prefix': '\u2713 Available \u2014 <strong>',
    'avail.ok.suffix': '</strong> remaining on this date.',
    'avail.limited.prefix': '\u26a0 Only <strong>',
    'avail.limited.suffix': '</strong> left \u2014 book soon!',
    'avail.soldout': '\u2717 Fully booked for this date. <a href="https://wa.me/37126440152" target="_blank" rel="noopener" style="color:var(--moss);font-weight:600">Ask Daiga</a> about alternatives.',
    'avail.toomany.prefix': '\u26a0 Only <strong>',
    'avail.toomany.suffix': '</strong> available \u2014 please reduce your group size.',
    'avail.error': '\ud83d\udcc5 Date selected. Daiga will confirm availability personally \u2014 or <a href="https://wa.me/37126440152" target="_blank" rel="noopener" style="color:var(--moss);font-weight:600">ask her directly</a>.',
    'avail.seat': 'seat',
    'avail.seats': 'seats',

    // Email clipboard
    'js.copyLabel': 'Copy email text to clipboard',
    'js.copied': '\u2713 Copied to clipboard!',
    'js.copiedShort': '\u2713 Copied!'
  }
};

// Active-locale translation table — falls back to English.
var T = BK_I18N[document.documentElement.lang] || BK_I18N.en;

// Walks [data-bk-i18n], [data-bk-i18n-html], [data-bk-i18n-attr] and applies T.
function applyBkI18n() {
  var active = BK_I18N[document.documentElement.lang] || BK_I18N.en;
  // textContent keys
  document.querySelectorAll('[data-bk-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-bk-i18n');
    if (k && active[k] != null) el.textContent = active[k];
  });
  // innerHTML keys (for strings containing HTML entities / markup)
  document.querySelectorAll('[data-bk-i18n-html]').forEach(function(el) {
    var k = el.getAttribute('data-bk-i18n-html');
    if (k && active[k] != null) el.innerHTML = active[k];
  });
  // attribute keys: "placeholder:s2a.namePh" or "aria-label:foo,title:bar"
  document.querySelectorAll('[data-bk-i18n-attr]').forEach(function(el) {
    var spec = el.getAttribute('data-bk-i18n-attr');
    if (!spec) return;
    spec.split(',').forEach(function(pair) {
      var parts = pair.split(':');
      if (parts.length !== 2) return;
      var attr = parts[0].trim();
      var key  = parts[1].trim();
      if (active[key] != null) el.setAttribute(attr, active[key]);
    });
  });
}
document.addEventListener('DOMContentLoaded', applyBkI18n);

var EXCURSION_NAME = 'Rundāle Palace, Bauska Castle & Brewery';
var BOKUN_WORKER_URL = 'https://bokun-availability.daiga.workers.dev';
var BOKUN_ACTIVITY_ID = '1212737';

var bkAvailCache = {};
var bkAvailLoaded = {};

// ── UTILITIES ──
// TEST MODE (G-INV-1.B): ?test=1 in the page URL routes this booking to
// a TEST invoice flow — TEST- ref prefix is detected by the Worker, which
// flags isTest:true to Apps Script. Apps Script then skips the Series A
// counter, drops the watermarked PDF in Drive's /_test/ subfolder, and
// never touches the main Invoices ledger. Used by Daiga for end-to-end
// verification without burning real invoice numbers.
function bkIsTestMode() {
  return /[?&]test=1\b/.test(location.search);
}
function bkGenerateRef() {
  var d = new Date();
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  var rand = Math.floor(1000 + Math.random() * 9000);
  var prefix = bkIsTestMode() ? 'TEST-' : 'BBR-';
  return prefix + mm + dd + '-' + rand;
}

function bkFormatDate(dateStr) {
  if (!dateStr) return '\u2014';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

function bkCalcTotal(method) {
  var p = BK_PRICES[method || bkState.payMethod];
  return (bkState.adults * p.adult) + (bkState.children * p.child);
}

function bkChipText() {
  return bkFormatDate(bkState.date) + ' \u00b7 ' + bkState.adults + ' adult' + (bkState.adults > 1 ? 's' : '') +
    (bkState.children > 0 ? ' + ' + bkState.children + ' child' + (bkState.children > 1 ? 'ren' : '') : '');
}

function bkIsTooClose() {
  if (!bkState.date) return false;
  var today = new Date(); today.setHours(0,0,0,0);
  var dep = new Date(bkState.date + 'T00:00:00');
  return (dep - today) / 86400000 < 3;
}

// ── STEP NAVIGATION ──
function bkShowStep(stepId) {
  ['bk-s1','bk-s2','bk-s3','bk-s4-bank','bk-s4-revolut','bk-s4-stripe','bk-s4-paylater','bk-s-err'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  var t = document.getElementById(stepId);
  if (t) { t.classList.add('active'); }
}

function bkGoStep1() { bkShowStep('bk-s1'); }

function bkGoStep2() {
  bkState.date = document.getElementById('bk-date').value;
  bkState.adults = parseInt(document.getElementById('bk-adults').value) || 2;
  bkState.children = parseInt(document.getElementById('bk-children').value) || 0;
  document.getElementById('bk-s2-chip').textContent = bkChipText();
  bkShowStep('bk-s2');
}

function bkGoStep2Back() {
  bkShowStep('bk-s2');
}

// OTP state
var bkOtpToken = null;
var bkOtpTimestamp = null;
var bkOtpCountdownTimer = null;

async function bkSendOtp() {
  bkState.name  = (document.getElementById('bk-name').value  || '').trim();
  bkState.email = (document.getElementById('bk-email').value || '').trim();
  bkState.phone = (document.getElementById('bk-phone').value || '').trim();
  bkState.guideLang = (document.getElementById('bk-guide-lang') && document.getElementById('bk-guide-lang').value) || 'en';

  var emailHint = document.getElementById('bk-email-hint');
  var btn = document.getElementById('bk-send-otp-btn');

  if (!bkState.name) { alert(T['js.alert.name']); return; }
  if (!bkState.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bkState.email)) {
    if (emailHint) { emailHint.textContent = T['js.err.invalidEmail']; emailHint.style.display = 'block'; }
    return;
  }
  if (emailHint) emailHint.style.display = 'none';
  if (btn) { btn.disabled = true; btn.textContent = T['js.btn.sendingCode']; }

  try {
    var resp = await fetch(BOKUN_WORKER_URL + '/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: bkState.email, name: bkState.name, lang: document.documentElement.lang || 'en' })
    });
    var data = await resp.json();

    if (!data.sent) {
      if (emailHint) { emailHint.textContent = T['js.err.warnPrefix'] + (data.reason || T['js.err.sendFail']); emailHint.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = T['js.btn.sendOtp']; }
      return;
    }

    bkOtpToken     = data.token;
    bkOtpTimestamp = data.timestamp;

    document.getElementById('bk-s2a').style.display = 'none';
    document.getElementById('bk-s2b').style.display = 'block';
    document.getElementById('bk-otp-email-display').textContent = bkState.email;
    document.getElementById('bk-otp-code').value = '';
    document.getElementById('bk-otp-hint').style.display = 'none';
    document.getElementById('bk-otp-code').focus();
    bkStartOtpCountdown(10 * 60); // 10 minutes

  } catch(e) {
    if (emailHint) { emailHint.textContent = T['js.err.network']; emailHint.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.textContent = T['js.btn.sendOtp']; }
  }
}

function bkStartOtpCountdown(seconds) {
  if (bkOtpCountdownTimer) clearInterval(bkOtpCountdownTimer);
  var remaining = seconds;
  var countEl = document.getElementById('bk-otp-countdown');

  function tick() {
    if (!countEl) return;
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    countEl.textContent = T['js.countdown.prefix'] + m + ':' + String(s).padStart(2, '0');
    if (remaining <= 0) {
      clearInterval(bkOtpCountdownTimer);
      countEl.textContent = T['js.countdown.expired'];
      countEl.style.color = 'var(--clay)';
      var verifyBtn = document.getElementById('bk-verify-otp-btn');
      if (verifyBtn) verifyBtn.disabled = true;
    }
    remaining--;
  }
  tick();
  bkOtpCountdownTimer = setInterval(tick, 1000);
}

function bkResendOtp() {
  if (bkOtpCountdownTimer) clearInterval(bkOtpCountdownTimer);
  document.getElementById('bk-s2a').style.display = 'block';
  document.getElementById('bk-s2b').style.display = 'none';
  var btn = document.getElementById('bk-send-otp-btn');
  if (btn) { btn.disabled = false; btn.textContent = T['js.btn.sendOtp']; }
  bkOtpToken = null; bkOtpTimestamp = null;
}

async function bkVerifyOtp() {
  var code = (document.getElementById('bk-otp-code').value || '').replace(/\s/g, '');
  var hint = document.getElementById('bk-otp-hint');
  var btn  = document.getElementById('bk-verify-otp-btn');

  // Instant client-side checks — no network needed
  if (!code) {
    if (hint) { hint.textContent = T['js.err.enterCode']; hint.style.display = 'block'; }
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    if (hint) { hint.textContent = T['js.err.codeDigits']; hint.style.display = 'block'; }
    return;
  }
  if (hint) hint.style.display = 'none';
  if (btn) { btn.disabled = true; btn.textContent = T['js.btn.verifying']; }

  // Timeout so button never stays stuck
  var controller = new AbortController();
  var timeout = setTimeout(function() { controller.abort(); }, 8000);

  try {
    var resp = await fetch(BOKUN_WORKER_URL + '/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: bkState.email, code, token: bkOtpToken, timestamp: bkOtpTimestamp }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    var data = await resp.json();

    if (!data.valid) {
      if (hint) { hint.textContent = T['js.err.warnPrefix'] + (data.reason || T['js.err.incorrectCode']); hint.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = T['js.btn.verifyOtp']; }
      // Clear the code field and refocus for retry
      document.getElementById('bk-otp-code').value = '';
      document.getElementById('bk-otp-code').focus();
      return;
    }

    if (bkOtpCountdownTimer) clearInterval(bkOtpCountdownTimer);
    bkGoStep3();

  } catch(e) {
    clearTimeout(timeout);
    var msg = e.name === 'AbortError'
      ? T['js.err.timeout']
      : T['js.err.network'];
    if (hint) { hint.textContent = msg; hint.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.textContent = T['js.btn.verifyOtp']; }
  }
}

// Auto-verify when 6 digits entered
document.addEventListener('DOMContentLoaded', function() {
  var codeInput = document.getElementById('bk-otp-code');
  if (codeInput) {
    codeInput.addEventListener('input', function() {
      var val = this.value.replace(/\D/g, '').slice(0, 6);
      this.value = val;
      if (val.length === 6) bkVerifyOtp();
    });
  }

  // Test-mode banner — only when ?test=1 is in the URL. Strong red bar
  // at the top so we can never miss that this booking won't issue a
  // real invoice. Stripe is still wired and would charge a real card,
  // so the banner explicitly says "avoid Stripe."
  if (bkIsTestMode()) {
    var banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#7a1a2c;color:#fff;text-align:center;font-weight:700;padding:8px 12px;font-size:13px;letter-spacing:.3px;font-family:Arial,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.2)';
    banner.textContent = '⚠ TEST MODE — invoices saved to /_test/ folder, no real numbers burned. AVOID Stripe (real card charge).';
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.style.paddingTop = '36px';
  }
});

function bkGoStep3() {
  document.getElementById('bk-s3-chip').textContent = bkChipText();
  document.getElementById('bk-p1-price').textContent = '\u20ac' + BK_PRICES[1].adult + ' / adult';
  document.getElementById('bk-p2-price').textContent = '\u20ac' + BK_PRICES[2].adult + ' / adult';
  document.getElementById('bk-p3-price').textContent = '\u20ac' + BK_PRICES[3].adult + ' / adult';

  var tooClose = bkIsTooClose();
  document.getElementById('bk-opt-0').style.display = tooClose ? 'none' : 'block';
  document.getElementById('bk-opt-1').style.display = tooClose ? 'none' : 'block';
  document.getElementById('bk-opt-2').style.display = tooClose ? 'none' : 'block';
  document.getElementById('bk-close-warning').style.display = tooClose ? 'flex' : 'none';

  bkSelectPay(tooClose ? 3 : 0);
  bkShowStep('bk-s3');
}

function bkSelectPay(n) {
  bkState.payMethod = n;
  [0,1,2,3].forEach(function(i) {
    var opt = document.getElementById('bk-opt-' + i);
    if (opt) { opt.classList.toggle('selected', i===n); opt.setAttribute('aria-checked', i===n?'true':'false'); }
  });
  var totalEl = document.getElementById('bk-total-display');
  if (n === 0) {
    if (totalEl) totalEl.textContent = '\u20ac0 today';
  } else {
    if (totalEl) totalEl.textContent = '\u20ac' + bkCalcTotal(n);
  }
  var labels = [
    T['js.pay.label0'],
    T['js.pay.label1'],
    T['js.pay.label2'],
    T['js.pay.label3']
  ];
  var btn = document.getElementById('bk-s3-proceed');
  if (btn) btn.textContent = labels[n];
}

async function bkProceed() {
  var method = bkState.payMethod;
  bkState.ref = bkGenerateRef();
  var chipText = bkChipText();

  if (method === 0) {
    await bkCallPayLater(chipText);
  } else if (method === 3) {
    await bkCallStripeCheckout(chipText);
  } else {
    await bkCallReserve(method, chipText);
  }
}

async function bkCallPayLater(chipText) {
  var btn = document.getElementById('bk-s3-proceed');
  if (btn) { btn.disabled = true; btn.textContent = T['js.btn.reserving']; }

  var total = bkCalcTotal(0);
  var deposit = Math.ceil(total * 0.20);
  var remaining = total - deposit;

  try {
    await fetch(BOKUN_WORKER_URL + '/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityId: parseInt(BOKUN_ACTIVITY_ID),
        date: bkState.date,
        adults: bkState.adults,
        children: bkState.children,
        name: bkState.name,
        email: bkState.email,
        phone: bkState.phone,
        ref: bkState.ref,
        total: total,
        deposit: deposit,
        method: 'pay-later',
        excursion: EXCURSION_NAME,
        guideLang: bkState.guideLang || 'en',
        lang: document.documentElement.lang || 'en'
      })
    });
  } catch(e) {
    console.warn('Pay-later reserve (non-blocking):', e.message);
  }

  if (btn) { btn.disabled = false; }

  document.getElementById('bk-paylater-chip').textContent = chipText;
  document.getElementById('bk-paylater-ref').textContent = bkState.ref;
  document.getElementById('bk-paylater-deposit').textContent = '\u20ac' + deposit;
  document.getElementById('bk-paylater-remaining').textContent = '\u20ac' + remaining;

  var waMsg = 'Hi Daiga! I\u2019ve just reserved seats for the Rund\u0101le Palace excursion \u2014 looking forward to it!\n\n'
    + 'Reference: ' + bkState.ref + '\n'
    + 'Date: ' + bkFormatDate(bkState.date) + '\n'
    + 'Adults: ' + bkState.adults + '\n'
    + (bkState.children > 0 ? 'Children: ' + bkState.children + '\n' : '')
    + 'Name: ' + bkState.name;
  document.getElementById('bk-paylater-wa-btn').href = 'https://wa.me/37126440152?text=' + encodeURIComponent(waMsg);

  bkFireConversion('pay_later', 0, bkState.ref);
  bkShowStep('bk-s4-paylater');
}

async function bkCallReserve(method, chipText) {
  var btn = document.getElementById('bk-s3-proceed');
  if (btn) { btn.disabled = true; btn.textContent = T['js.btn.holdingSeats']; }

  try {
    var resp = await fetch(BOKUN_WORKER_URL + '/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityId: parseInt(BOKUN_ACTIVITY_ID),
        date: bkState.date,
        adults: bkState.adults,
        children: bkState.children,
        name: bkState.name,
        email: bkState.email,
        phone: bkState.phone,
        ref: bkState.ref,
        total: bkCalcTotal(method),
        method: method === 1 ? 'bank' : 'revolut',
        excursion: EXCURSION_NAME,
        guideLang: bkState.guideLang || 'en',
        lang: document.documentElement.lang || 'en'
      })
    });
    var data = await resp.json();
    if (data.bokunBookingId) bkState.bokunBookingId = data.bokunBookingId;
  } catch(e) {
    console.warn('Bokun reserve (non-blocking):', e.message);
  }

  if (btn) { btn.disabled = false; bkSelectPay(method); }

  var total = bkCalcTotal(method);

  if (method === 1) {
    document.getElementById('bk-ref-num').textContent = bkState.ref;
    document.getElementById('bk-iban-ref').textContent = bkState.ref;
    document.getElementById('bk-bank-chip').textContent = chipText;
    document.getElementById('bk-bank-total').textContent = '\u20ac' + total;
    document.getElementById('bk-iban-amount').textContent = '\u20ac' + total.toFixed(2);
    if (bkState.bokunBookingId) {
      document.getElementById('bk-bokun-id-row').style.display = 'flex';
      document.getElementById('bk-bokun-id-val').textContent = bkState.bokunBookingId;
    }
    bkShowStep('bk-s4-bank');
  } else {
    document.getElementById('bk-rev-chip').textContent = chipText;
    document.getElementById('bk-rev-ref').textContent = bkState.ref;
    bkShowStep('bk-s4-revolut');
  }
}

async function bkCallStripeCheckout(chipText) {
  bkShowStep('bk-s4-stripe');
  var total = bkCalcTotal(3);

  try {
    var resp = await fetch(BOKUN_WORKER_URL + '/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityId: parseInt(BOKUN_ACTIVITY_ID),
        date: bkState.date,
        adults: bkState.adults,
        children: bkState.children,
        name: bkState.name,
        email: bkState.email,
        phone: bkState.phone,
        ref: bkState.ref,
        total: total,
        excursion: EXCURSION_NAME,
        guideLang: bkState.guideLang || 'en',
        lang: document.documentElement.lang || 'en'
      })
    });
    var data = await resp.json();
    if (data.url) {
      bkFireConversion('stripe_initiated', total, bkState.ref);
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'No checkout URL returned');
    }
  } catch(e) {
    document.getElementById('bk-err-msg').textContent =
      T['err.stripeCheckoutPrefix'] + e.message + T['err.stripeCheckoutSuffix'];
    bkShowStep('bk-s-err');
  }
}

function bkSendBankConfirmWA() {
  var total = bkCalcTotal(1);
  var msg = 'Hi Daiga!\n\nI have made a bank transfer for the Rund\u0101le Palace excursion.\n\n'
    + 'Reference: ' + bkState.ref + '\n'
    + 'Date: ' + bkFormatDate(bkState.date) + '\n'
    + 'Adults: ' + bkState.adults + '\n'
    + (bkState.children > 0 ? 'Children: ' + bkState.children + '\n' : '')
    + 'Name: ' + bkState.name + '\n'
    + 'Email: ' + bkState.email + '\n'
    + 'Amount: \u20ac' + total.toFixed(2) + '\n'
    + (bkState.bokunBookingId ? 'Bokun hold ID: ' + bkState.bokunBookingId + '\n' : '')
    + '\nPlease confirm when received. Thank you!';
  bkFireConversion('bank_transfer', total, bkState.ref);
  window.open('https://wa.me/37126440152?text=' + encodeURIComponent(msg), '_blank');
  setTimeout(function() {
    window.location.href = '../thank-you.html'
      + '?ref='      + encodeURIComponent(bkState.ref)
      + '&exc=rundale&adults=' + bkState.adults
      + '&children=' + bkState.children
      + '&total='    + total
      + '&method=bank'
      + '&date='     + encodeURIComponent(bkState.date)
      + '&name='     + encodeURIComponent(bkState.name);
  }, 800);
}

function bkSendRevolutWA() {
  var total = bkCalcTotal(2);
  var msg = 'Hi Daiga!\n\nI\'d like to pay via Revolut for the Rund\u0101le Palace excursion.\n\n'
    + 'Reference: ' + bkState.ref + '\n'
    + 'Date: ' + bkFormatDate(bkState.date) + '\n'
    + 'Adults: ' + bkState.adults + '\n'
    + (bkState.children > 0 ? 'Children: ' + bkState.children + '\n' : '')
    + 'Name: ' + bkState.name + '\n'
    + 'Email: ' + bkState.email + '\n'
    + 'Total: \u20ac' + total.toFixed(2) + '\n'
    + (bkState.bokunBookingId ? 'Bokun hold ID: ' + bkState.bokunBookingId + '\n' : '')
    + '\nPlease send me a Revolut payment link. Thank you!';
  bkFireConversion('revolut_enquiry', total, bkState.ref);
  window.open('https://wa.me/37126440152?text=' + encodeURIComponent(msg), '_blank');
  setTimeout(function() {
    window.location.href = '../thank-you.html'
      + '?ref='      + encodeURIComponent(bkState.ref)
      + '&exc=rundale&adults=' + bkState.adults
      + '&children=' + bkState.children
      + '&total='    + total
      + '&method=revolut'
      + '&date='     + encodeURIComponent(bkState.date)
      + '&name='     + encodeURIComponent(bkState.name);
  }, 800);
}

// ── EMAIL HELPERS ─────────────────────────────────────────
var EMAIL_TO = 'daiga@rondasprints.com';

function buildInquiryEmail() {
  return {
    subject: 'Question about Rundāle Palace excursion',
    body: 'Hi Daiga,\n\nI\'m interested in the Rundāle Palace, Bauska Castle & Brewery excursion and have a few questions before booking.\n\n[Your questions here]\n\nThank you!'
  };
}

function buildBookingEmail() {
  var total = bkCalcTotal(2);
  var fmtDate = bkFormatDate(bkState.date);
  return {
    subject: 'Revolut payment request — Rundāle excursion ' + fmtDate,
    body: 'Hi Daiga,\n\nI\'d like to pay via Revolut for the Rundāle Palace excursion.\n\n'
      + 'Reference: ' + bkState.ref + '\n'
      + 'Date: ' + fmtDate + '\n'
      + 'Adults: ' + bkState.adults + '\n'
      + (bkState.children > 0 ? 'Children: ' + bkState.children + '\n' : '')
      + 'Name: ' + bkState.name + '\n'
      + 'Total: €' + total.toFixed(2) + '\n'
      + '\nPlease send me a Revolut payment link. Thank you!'
  };
}

function populateEmailPanel(panelId, emailData) {
  var panel = document.getElementById(panelId);
  if (!panel) return;
  var subjectEnc = encodeURIComponent(emailData.subject);
  var bodyEnc    = encodeURIComponent(emailData.body);
  var mailto     = 'mailto:' + EMAIL_TO + '?subject=' + subjectEnc + '&body=' + bodyEnc;

  // Gmail
  var gmailUrl = 'https://mail.google.com/mail/?view=cm&to=' + encodeURIComponent(EMAIL_TO)
    + '&su=' + subjectEnc + '&body=' + bodyEnc;

  // Outlook Web
  var outlookUrl = 'https://outlook.live.com/mail/0/deeplink/compose?to=' + encodeURIComponent(EMAIL_TO)
    + '&subject=' + subjectEnc + '&body=' + encodeURIComponent(emailData.body.replace(/\n/g, '<br>'));

  // Set link hrefs
  var gmailEl   = panel.querySelector('[data-client="gmail"]');
  var outlookEl = panel.querySelector('[data-client="outlook"]');
  var appleEl   = panel.querySelector('[data-client="apple"]');
  if (gmailEl)   gmailEl.href   = gmailUrl;
  if (outlookEl) outlookEl.href = outlookUrl;
  if (appleEl)   appleEl.href   = mailto;

  // Store body text for clipboard copy
  panel.dataset.copyText = 'To: ' + EMAIL_TO + '\nSubject: ' + emailData.subject + '\n\n' + emailData.body;

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function daigopenEmail() {
  populateEmailPanel('daiga-email-reveal', buildInquiryEmail());
}

function bkSendRevolutEmail() {
  populateEmailPanel('bk-rev-email-reveal', buildBookingEmail());
}

function copyEmailDraft(btnId, type) {
  var btn = document.getElementById(btnId);
  var panelId = (type === 'inquiry') ? 'daiga-email-reveal' : 'bk-rev-email-reveal';
  var panel = document.getElementById(panelId);
  var text = panel ? panel.dataset.copyText : '';
  if (!text) {
    var d = (type === 'inquiry') ? buildInquiryEmail() : buildBookingEmail();
    text = 'To: ' + EMAIL_TO + '\nSubject: ' + d.subject + '\n\n' + d.body;
  }
  navigator.clipboard.writeText(text).then(function() {
    if (btn) { btn.innerHTML = btn.innerHTML.replace(T['js.copyLabel'], T['js.copied']); }
    setTimeout(function() {
      if (btn) { btn.innerHTML = btn.innerHTML.replace(T['js.copied'], T['js.copyLabel']); }
    }, 2500);
  }).catch(function() {
    // Fallback for browsers that block clipboard
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (btn) { btn.innerHTML = btn.innerHTML.replace(T['js.copyLabel'], T['js.copiedShort']); }
    setTimeout(function() {
      if (btn) { btn.innerHTML = btn.innerHTML.replace(T['js.copiedShort'], T['js.copyLabel']); }
    }, 2500);
  });
}


function bkScrollToSidebar() {
  // Scroll to the two-column layout so sticky sidebar is fully in view
  var grid = document.querySelector('.content-grid');
  var sidebar = document.querySelector('.content-sidebar');
  if (!grid) return;
  var targetY = grid.getBoundingClientRect().top + window.pageYOffset - 90;
  window.scrollTo({ top: targetY, behavior: 'smooth' });
  // After scroll, flash the booking card to draw attention
  setTimeout(function() {
    var card = document.getElementById('bkCard');
    if (card) {
      card.classList.add('bk-highlight-pulse');
      setTimeout(function() { card.classList.remove('bk-highlight-pulse'); }, 1800);
    }
  }, 600);
}

function bkFireConversion(method, value, ref) {
  if (typeof gtag !== 'undefined') {
    var ev = (method === 'bank_transfer') ? 'purchase' : 'generate_lead';
    gtag('event', ev, {
      transaction_id: ref, value: value, currency: 'EUR',
      items: [{ item_id:'rundale-palace-brewery', item_name:'Rund\u0101le Palace, Bauska Castle & Brewery',
        quantity: bkState.adults + bkState.children }]
    });
  }
}

// Keyboard support for payment options
document.querySelectorAll('.bk-pay-opt').forEach(function(opt) {
  opt.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      var id = opt.id; // e.g. 'bk-opt-0'
      var n = parseInt(id.replace('bk-opt-', ''));
      if (!isNaN(n)) bkSelectPay(n);
    }
  });
});

// Initialise date min
(function() {
  var d = document.getElementById('bk-date');
  if (d) d.setAttribute('min', new Date().toISOString().split('T')[0]);
})();

// ── AVAILABILITY ──
function bkCheckAvailability(dateStr) {
  if (!dateStr) return;
  if (bkAvailLoaded[dateStr]) { bkRenderAvail(bkAvailCache[dateStr]); return; }
  bkSetAvailUI('loading');
  var url = BOKUN_WORKER_URL + '?activityId=' + BOKUN_ACTIVITY_ID + '&start=' + dateStr + '&end=' + dateStr;
  fetch(url)
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(data) {
      var slot = (Array.isArray(data) && data.length > 0) ? data[0] : null;
      bkAvailCache[dateStr] = slot; bkAvailLoaded[dateStr] = true;
      bkRenderAvail(slot);
    })
    .catch(function() { bkAvailCache[dateStr] = null; bkAvailLoaded[dateStr] = true; bkRenderAvail(null); });
}

function bkRenderAvail(slot) {
  if (!slot) { bkSetAvailUI('error'); return; }
  var avail = slot.soldOut ? 0 : (slot.availabilityCount || 0);
  var need = (bkState.adults || 2) + (bkState.children || 0);
  if (avail === 0 || slot.soldOut) bkSetAvailUI('soldout', 0);
  else if (need > avail) bkSetAvailUI('toomany', avail);
  else if (avail <= 3) bkSetAvailUI('limited', avail);
  else bkSetAvailUI('ok', avail);
}

function bkSetAvailUI(state, count) {
  var hint = document.getElementById('bk-avail-hint');
  var nextBtn = document.getElementById('bk-s1-next');
  var canProceed = !!bkState.date && (state === 'ok' || state === 'limited' || state === 'error');
  if (nextBtn) nextBtn.disabled = !canProceed;
  if (!hint) return;
  var n = count || 0;
  var seat = n === 1 ? T['avail.seat'] : T['avail.seats'];
  var map = {
    idle:    { html: T['avail.idle'], cls: '' },
    loading: { html: T['avail.loading'], cls: '' },
    ok:      { html: T['avail.ok.prefix'] + n + ' ' + seat + T['avail.ok.suffix'], cls: 'avail-ok' },
    limited: { html: T['avail.limited.prefix'] + n + ' ' + seat + T['avail.limited.suffix'], cls: 'avail-warn' },
    soldout: { html: T['avail.soldout'], cls: 'avail-bad' },
    toomany: { html: T['avail.toomany.prefix'] + n + ' ' + seat + T['avail.toomany.suffix'], cls: 'avail-warn' },
    error:   { html: T['avail.error'], cls: '' }
  };
  var c = map[state] || { html: '', cls: '' };
  hint.innerHTML = c.html;
  hint.className = 'bk-avail-hint' + (c.cls ? ' ' + c.cls : '');
}

function bkUpdateTotal() {
  var prevDate = bkState.date;
  bkState.date = document.getElementById('bk-date').value;
  bkState.adults = parseInt(document.getElementById('bk-adults').value) || 2;
  bkState.children = parseInt(document.getElementById('bk-children').value) || 0;
  var nextBtn = document.getElementById('bk-s1-next');
  if (!bkState.date) { if (nextBtn) nextBtn.disabled = true; bkSetAvailUI('idle'); return; }
  if (bkState.date !== prevDate) { if (nextBtn) nextBtn.disabled = true; bkCheckAvailability(bkState.date); }
  else { if (bkAvailLoaded[bkState.date]) bkRenderAvail(bkAvailCache[bkState.date]); }
}

// ── KEPT: Hero slideshow, hamburger, FAQ, lightbox ──

// Hero slideshow with Ken Burns
(function(){
  const slides = document.querySelectorAll('.hero-slide');
  if(slides.length < 2) return;
  const anims = ['kb-drift-right','kb-drift-left','kb-zoom-centre','kb-drift-up','kb-drift-down'];
  const creditEl = document.getElementById('heroPhotoCredit');
  // initialise first slide animation explicitly
  const firstImg = slides[0].querySelector('img');
  if (firstImg) firstImg.style.animationName = anims[0];
  let current = 0;
  setInterval(()=>{
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
    const img = slides[current].querySelector('img');
    img.style.animationName = 'none';
    void img.offsetHeight;
    img.style.animationName = anims[current % anims.length];
    if (creditEl) creditEl.textContent = slides[current].getAttribute('data-credit') || '';
  }, 6500);
})();

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', !expanded);
  navLinks.classList.toggle('open');
});

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      document.getElementById(other.getAttribute('aria-controls')).setAttribute('aria-hidden', 'true');
    });
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      document.getElementById(btn.getAttribute('aria-controls')).setAttribute('aria-hidden', 'false');
    }
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
});

// ── PHOTO GALLERY LIGHTBOX ──
const lbPhotos = [
  {src:'/images/exc-rundale/rundale-palace-south-facade-formal-gardens-latvia.jpg', cap:'Rundāle Palace south façade'},
  {src:'/images/exc-rundale/rundale-palace-white-hall-daiga-guide-latvia.jpg', cap:'Daiga in the White Hall'},
  {src:'/images/exc-rundale/rundale-palace-baroque-ceiling-paintings-interior.jpg', cap:'Baroque ceiling paintings'},
  {src:'/images/exc-rundale/bauska-castle-tower-panoramic-view-latvia.jpg', cap:'View from Bauska Castle tower'},
  {src:'/images/exc-rundale/rundale-palace-guests-exploring-french-gardens.jpg', cap:'Guests exploring the palace gardens'},
  {src:'/images/exc-rundale/latvian-traditional-lunch-rundale-excursion.jpg', cap:'Traditional Latvian lunch'},
  {src:'/images/exc-rundale/rundale-palace-gold-hall-gilded-stucco-latvia.jpg', cap:'Gold Hall gilded stucco'},
  {src:'/images/exc-rundale/barefoot-baltic-guests-minibus-excursion-latvia.jpg', cap:'Guests in the minibus'},
  {src:'/images/exc-rundale/bauskas-alus-brewery-beer-tasting-latvia.jpg', cap:'Bauskas Alus brewery tasting'},
  {src:'/images/exc-rundale/bauskas-alus-craft-beer-tasting-brewery-latvia.jpg', cap:'Beer tasting at the brewery'},
  {src:'/images/exc-rundale/rundale-palace-baroque-corridor-interior-latvia.jpg', cap:'Inside Rundāle Palace corridors'},
  {src:'/images/exc-rundale/bauska-castle-courtyard-medieval-latvia.jpg', cap:'Exploring Bauska Castle courtyard'},
  {src:'/images/exc-rundale/bauska-castle-daiga-guide-explaining-latvia.jpg', cap:'Daiga explaining at Bauska Castle'},
  {src:'/images/exc-rundale/bauska-castle-daiga-guide-guest-portrait-latvia.jpg', cap:'Daiga with guest at the castle'},
  {src:'/images/exc-rundale/rundale-palace-red-room-baroque-interior-latvia.jpg', cap:'The Red Room at Rundāle'},
  {src:'/images/exc-rundale/rundale-palace-formal-gardens-winter-latvia.jpg', cap:'Palace gardens in winter'},
  {src:'/images/exc-rundale/bauska-castle-historical-costumes-reenactment-latvia.jpg', cap:'Historical costumes at Bauska Castle'},
  {src:'/images/exc-rundale/barefoot-baltic-group-minibus-summer-latvia.jpg', cap:'Guests with the minibus in summer'},
  {src:'/images/exc-rundale/rundale-palace-daiga-guide-castle-gate-latvia.jpg', cap:'Daiga at the castle gate'},
];

let lbCur = 0;
const lbEl = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCaption');
const lbCnt = document.getElementById('lbCounter');
const lbThumbs = document.getElementById('lbThumbs');

lbPhotos.forEach((p, i) => {
  const d = document.createElement('div');
  d.className = 'lb-thumb' + (i === 0 ? ' active' : '');
  d.innerHTML = '<img src="' + p.src + '" loading="lazy" alt="">';
  d.addEventListener('click', () => lbGo(i));
  lbThumbs.appendChild(d);
});
const thumbEls = lbThumbs.querySelectorAll('.lb-thumb');

function lbGo(n) {
  lbCur = ((n % lbPhotos.length) + lbPhotos.length) % lbPhotos.length;
  lbImg.src = lbPhotos[lbCur].src;
  lbImg.alt = lbPhotos[lbCur].cap;
  lbCap.textContent = lbPhotos[lbCur].cap;
  lbCnt.textContent = (lbCur + 1) + ' / ' + lbPhotos.length;
  thumbEls.forEach((t, i) => t.classList.toggle('active', i === lbCur));
  thumbEls[lbCur].scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
}

function openLightbox(n) {
  lbGo(n);
  lbEl.classList.add('open');
  lbEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lbEl.classList.remove('open');
  lbEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.getElementById('lbPrev').addEventListener('click', () => lbGo(lbCur - 1));
document.getElementById('lbNext').addEventListener('click', () => lbGo(lbCur + 1));
document.getElementById('lbClose').addEventListener('click', closeLightbox);

document.addEventListener('keydown', e => {
  if (!lbEl.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbGo(lbCur - 1);
  if (e.key === 'ArrowRight') lbGo(lbCur + 1);
});

let lbStartX = 0;
lbEl.addEventListener('touchstart', e => { lbStartX = e.touches[0].clientX; }, {passive: true});
lbEl.addEventListener('touchend', e => {
  const diff = lbStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) lbGo(lbCur + (diff > 0 ? 1 : -1));
});

document.querySelector('.gallery-grid').addEventListener('click', function(e) {
  const gImg = e.target.closest('.g-img');
  if (!gImg) return;
  const allImgs = this.querySelectorAll('.g-img');
  const idx = Array.from(allImgs).indexOf(gImg);
  const galleryMap = [6, 4, 12, 2, 15];
  if (idx >= 0 && idx < galleryMap.length) openLightbox(galleryMap[idx]);
  else openLightbox(0);
});