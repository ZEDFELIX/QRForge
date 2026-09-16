const PLATFORM_CONFIG = {
  instagram: { icon: '📸', label: 'Instagram', color: '#E4405F', gradient: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
  facebook: { icon: '📘', label: 'Facebook', color: '#1877F2' },
  tiktok: { icon: '🎵', label: 'TikTok', color: '#000000' },
  x: { icon: '🐦', label: 'X', color: '#000000' },
  linkedin: { icon: '💼', label: 'LinkedIn', color: '#0A66C2' },
  youtube: { icon: '📺', label: 'YouTube', color: '#FF0000' },
  whatsapp: { icon: '💬', label: 'WhatsApp', color: '#25D366' },
  website: { icon: '🌐', label: 'Website', color: '#6366f1' },
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cssVar(brand) {
  return `:root{--primary:${brand?.primary || '#6366f1'};--secondary:${brand?.secondary || '#e0e7ff'};--text:${brand?.text || '#111827'};}`;
}

function baseStyles() {
  return `
    *{box-sizing:border-box;margin:0;padding:0;}
    body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f9fafb;color:var(--text);line-height:1.5;}
    .container{width:100%;max-width:480px;padding:24px 16px;}
    .logo{max-width:120px;height:auto;border-radius:12px;margin:0 auto 16px;display:block;}
    h1{font-size:1.5rem;font-weight:700;text-align:center;margin-bottom:4px;color:var(--text);}
    .description{text-align:center;color:#6b7280;margin-bottom:24px;font-size:0.95rem;}
    .btn{display:flex;align-items:center;gap:12px;width:100%;padding:14px 18px;border:none;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;text-decoration:none;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1);transition:transform 0.15s,box-shadow 0.15s;margin-bottom:12px;}
    .btn:active{transform:scale(0.97);}
    .btn .icon{font-size:1.2rem;}
    .btn-label{display:flex;flex-direction:column;align-items:flex-start;}
    .btn-label small{font-weight:400;font-size:0.8rem;opacity:0.85;}
    .section-title{font-size:1.1rem;font-weight:700;color:var(--text);margin:20px 0 12px;border-bottom:2px solid var(--secondary);padding-bottom:8px;}
    .card{background:#fff;border-radius:16px;padding:24px;box-shadow:0 4px 16px rgba(0,0,0,0.06);margin-bottom:16px;width:100%;}
    .footer{text-align:center;padding:16px;color:#9ca3af;font-size:0.75rem;margin-top:auto;}
    @media(max-width:360px){.container{padding:16px 12px;}.btn{padding:12px 14px;font-size:0.95rem;}}
  `;
}

function baseTemplate(title, brand, content) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${cssVar(brand)}${baseStyles()}</style>
</head>
<body>
<div class="container">${content}</div>
<div class="footer">Powered by QRForge</div>
</body>
</html>`;
}

function buildSocialPage(config) {
  const { title, description, logo, social, brand } = config;
  let links = '';
  for (const link of social || []) {
    const p = PLATFORM_CONFIG[link.platform] || PLATFORM_CONFIG.website;
    links += `<a class="btn" href="${escapeHtml(link.url)}" target="_blank" rel="noopener" style="background:${p.gradient || p.color};">
      <span class="icon">${p.icon}</span>
      <span class="btn-label"><span>${escapeHtml(link.label || p.label)}</span></span>
    </a>`;
  }
  const logoHtml = logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="Logo">` : '';
  return baseTemplate(title || 'Connect With Us', brand, `
    ${logoHtml}
    <h1>${escapeHtml(title || 'Connect With Us')}</h1>
    ${description ? `<p class="description">${escapeHtml(description)}</p>` : ''}
    <div>${links}</div>
  `);
}

function buildCardPage(config) {
  const { card, brand } = config;
  const c = card || {};
  const photoHtml = c.photo ? `<img src="${escapeHtml(c.photo)}" alt="${escapeHtml(c.name)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid var(--primary);margin-bottom:12px;">` : '';

  let fields = '';
  if (c.phone) fields += `<a class="btn" href="tel:${escapeHtml(c.phone)}" style="background:var(--primary);"><span class="icon">📞</span><span class="btn-label"><span>${escapeHtml(c.phone)}</span><small>Call</small></span></a>`;
  if (c.email) fields += `<a class="btn" href="mailto:${escapeHtml(c.email)}" style="background:#4f46e5;"><span class="icon">✉️</span><span class="btn-label"><span>${escapeHtml(c.email)}</span><small>Email</small></span></a>`;
  if (c.website) fields += `<a class="btn" href="${escapeHtml(c.website)}" target="_blank" rel="noopener" style="background:#059669;"><span class="icon">🌐</span><span class="btn-label"><span>${escapeHtml(c.website)}</span><small>Website</small></span></a>`;
  if (c.address) fields += `<a class="btn" href="https://maps.google.com/?q=${encodeURIComponent(c.address)}" target="_blank" rel="noopener" style="background:#d97706;"><span class="icon">📍</span><span class="btn-label"><span>${escapeHtml(c.address)}</span><small>Maps</small></span></a>`;

  const vcardDataUri = buildVCardDownload(c);

  return baseTemplate(c.name || 'Contact Card', brand, `
    <div class="card" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
      ${photoHtml}
      <h1 style="margin-bottom:2px;">${escapeHtml(c.name || 'Your Name')}</h1>
      ${c.title ? `<p style="color:#6b7280;font-size:0.95rem;margin-bottom:2px;">${escapeHtml(c.title)}</p>` : ''}
      ${c.company ? `<p style="color:var(--primary);font-weight:600;font-size:0.9rem;margin-bottom:12px;">${escapeHtml(c.company)}</p>` : ''}
    </div>
    <div>${fields}</div>
    <a class="btn" href="${vcardDataUri}" download="${escapeHtml(c.name || 'contact')}.vcf" style="background:var(--primary);justify-content:center;margin-top:8px;">
      <span class="icon">➕</span><span class="btn-label"><span>Save Contact</span><small>Add to your address book</small></span>
    </a>
  `);
}

function buildMenuPage(config) {
  const { title, menu, brand } = config;
  const m = menu || {};
  let categoriesHtml = '';
  for (const cat of m.categories || []) {
    let itemsHtml = '';
    for (const item of cat.items || []) {
      const imgHtml = item.image ? `<img src="${escapeHtml(item.image)}" alt="" style="width:60px;height:60px;border-radius:8px;object-fit:cover;">` : '';
      itemsHtml += `
        <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f3f4f6;align-items:center;">
          ${imgHtml}
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-weight:600;color:var(--text);">${escapeHtml(item.name)}</span>
              ${item.price ? `<span style="font-weight:700;color:var(--primary);white-space:nowrap;margin-left:8px;">${escapeHtml(item.price)}</span>` : ''}
            </div>
            ${item.description ? `<p style="font-size:0.85rem;color:#6b7280;margin-top:2px;">${escapeHtml(item.description)}</p>` : ''}
          </div>
        </div>`;
    }
    categoriesHtml += `
      <h2 class="section-title">${escapeHtml(cat.name)}</h2>
      <div class="card" style="padding:0 16px;">${itemsHtml}</div>`;
  }
  const logoHtml = config.logo ? `<img class="logo" src="${escapeHtml(config.logo)}" alt="Logo">` : '';
  return baseTemplate(m.restaurantName || title || 'Menu', brand, `
    ${logoHtml}
    <h1>${escapeHtml(m.restaurantName || title || 'Menu')}</h1>
    ${config.description ? `<p class="description">${escapeHtml(config.description)}</p>` : ''}
    ${categoriesHtml}
  `);
}

function buildProductPage(config) {
  const { title, description, product, logo, brand } = config;
  const p = product || {};
  const imgHtml = p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:16px;">` : '';
  const logoHtml = !p.image && logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="Logo">` : '';
  return baseTemplate(p.name || title || 'Product', brand, `
    ${logoHtml}
    ${imgHtml}
    <div class="card">
      ${p.id ? `<p style="font-size:0.8rem;color:#9ca3af;margin-bottom:4px;">SKU: ${escapeHtml(p.id)}</p>` : ''}
      <h1 style="text-align:left;margin-bottom:8px;">${escapeHtml(p.name || title || 'Product')}</h1>
      ${p.price ? `<p style="font-size:1.4rem;font-weight:700;color:var(--primary);margin-bottom:12px;">${escapeHtml(p.price)}</p>` : ''}
      ${description || p.description ? `<p style="color:#4b5563;font-size:0.95rem;margin-bottom:16px;">${escapeHtml(description || p.description)}</p>` : ''}
      ${p.website ? `<a class="btn" href="${escapeHtml(p.website)}" target="_blank" rel="noopener" style="background:var(--primary);justify-content:center;"><span class="icon">🛒</span><span class="btn-label"><span>Visit Product</span></span></a>` : ''}
    </div>
  `);
}

function buildEventPage(config) {
  const { title, event, logo, brand } = config;
  const e = event || {};
  const logoHtml = logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="Logo">` : '';
  const icsDataUri = buildIcs(e);
  return baseTemplate(e.name || title || 'Event', brand, `
    ${logoHtml}
    <div class="card" style="text-align:center;">
      <h1 style="margin-bottom:16px;">${escapeHtml(e.name || title || 'Event')}</h1>
      ${e.date ? `<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;color:var(--text);font-weight:600;"><span>📅</span><span>${escapeHtml(e.date)}${e.time ? ` at ${escapeHtml(e.time)}` : ''}</span></div>` : ''}
      ${e.location ? `<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;color:#6b7280;"><span>📍</span><span>${escapeHtml(e.location)}</span></div>` : ''}
      ${e.description ? `<p style="color:#4b5563;font-size:0.95rem;margin-bottom:20px;text-align:left;">${escapeHtml(e.description)}</p>` : ''}
      ${e.website ? `<a class="btn" href="${escapeHtml(e.website)}" target="_blank" rel="noopener" style="background:var(--primary);justify-content:center;margin-bottom:10px;"><span class="icon">🎟️</span><span class="btn-label"><span>Register</span></span></a>` : ''}
      ${icsDataUri ? `<a class="btn" href="${icsDataUri}" download="${escapeHtml(e.name || 'event')}.ics" style="background:#059669;justify-content:center;"><span class="icon">📆</span><span class="btn-label"><span>Add to Calendar</span></span></a>` : ''}
      ${e.contact ? `<p style="margin-top:16px;font-size:0.85rem;color:#6b7280;">Contact: ${escapeHtml(e.contact)}</p>` : ''}
    </div>
  `);
}

function buildReviewPage(config) {
  const { title, review, brand } = config;
  const r = review || {};
  const stars = Math.min(5, Math.max(0, parseInt(r.stars, 10) || 5));
  let starsHtml = '';
  for (let i = 0; i < 5; i++) {
    starsHtml += i < stars ? '★' : '☆';
  }
  return baseTemplate(title || 'Leave a Review', brand, `
    <div class="card" style="text-align:center;">
      <h1 style="margin-bottom:8px;">${escapeHtml(r.businessName || title || 'We Value Your Feedback')}</h1>
      <p style="font-size:2.2rem;color:#f59e0b;letter-spacing:4px;margin:16px 0;">${starsHtml}</p>
      <p style="color:#6b7280;font-size:1.05rem;margin-bottom:24px;">How was your experience?</p>
      ${r.reviewUrl ? `<a class="btn" href="${escapeHtml(r.reviewUrl)}" target="_blank" rel="noopener" style="background:var(--primary);justify-content:center;padding:16px 24px;font-size:1.1rem;"><span class="icon">⭐</span><span class="btn-label"><span>Leave a Review</span><small>It only takes a minute</small></span></a>` : ''}
    </div>
  `);
}

function buildWhatsappPage(config) {
  const { title, description, whatsapp, logo, brand } = config;
  const w = whatsapp || {};
  const phone = (w.phone || '').replace(/[^0-9]/g, '');
  const msg = w.message || '';
  const waUrl = `https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
  const logoHtml = logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="Logo">` : '';
  return baseTemplate(title || 'Chat on WhatsApp', brand, `
    ${logoHtml}
    <h1>${escapeHtml(title || 'Chat on WhatsApp')}</h1>
    ${description ? `<p class="description">${escapeHtml(description)}</p>` : ''}
    <div class="card" style="text-align:center;">
      <div style="font-size:3rem;margin-bottom:12px;">💬</div>
      <a class="btn" href="${escapeHtml(waUrl)}" target="_blank" rel="noopener" style="background:#25D366;justify-content:center;padding:18px 24px;font-size:1.15rem;">
        <span class="icon">💬</span><span class="btn-label"><span>Chat on WhatsApp</span></span>
      </a>
      <p style="margin-top:12px;font-size:0.85rem;color:#6b7280;">Tap to start a conversation</p>
    </div>
  `);
}

function buildPaymentPage(config) {
  const { title, payment, logo, brand } = config;
  const p = payment || {};
  const logoHtml = logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="Logo">` : '';
  let detailsHtml = '';
  if (p.tillNumber) detailsHtml += `<div style="padding:12px 0;border-bottom:1px solid #e5e7eb;"><span style="font-size:0.85rem;color:#6b7280;display:block;">Till Number</span><span style="font-size:1.3rem;font-weight:700;color:#111827;letter-spacing:1px;">${escapeHtml(p.tillNumber)}</span></div>`;
  if (p.paybill) detailsHtml += `<div style="padding:12px 0;border-bottom:1px solid #e5e7eb;"><span style="font-size:0.85rem;color:#6b7280;display:block;">Paybill</span><span style="font-size:1.3rem;font-weight:700;color:#111827;letter-spacing:1px;">${escapeHtml(p.paybill)}</span></div>`;
  if (p.accountNo) detailsHtml += `<div style="padding:12px 0;"><span style="font-size:0.85rem;color:#6b7280;display:block;">Account Number</span><span style="font-size:1.3rem;font-weight:700;color:#111827;letter-spacing:1px;">${escapeHtml(p.accountNo)}</span></div>`;

  return baseTemplate(p.businessName || title || 'Payment', brand, `
    ${logoHtml}
    <div class="card" style="text-align:center;border-top:4px solid #4CAF50;">
      <div style="display:inline-block;background:#4CAF50;color:#fff;font-weight:700;font-size:0.85rem;padding:4px 14px;border-radius:20px;margin-bottom:12px;letter-spacing:0.5px;">M-PESA</div>
      <h1 style="margin-bottom:4px;">${escapeHtml(p.businessName || title || 'Pay Now')}</h1>
      ${p.businessName ? `<p style="color:#6b7280;margin-bottom:16px;">${escapeHtml(title || 'Make a Payment')}</p>` : ''}
      <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin-bottom:16px;text-align:left;">
        ${detailsHtml}
      </div>
      ${p.instructions ? `<div style="text-align:left;margin-bottom:16px;"><p style="font-weight:600;margin-bottom:8px;color:var(--text);">Instructions</p><p style="font-size:0.9rem;color:#4b5563;white-space:pre-line;">${escapeHtml(p.instructions)}</p></div>` : ''}
      <div style="background:#4CAF50;color:#fff;border-radius:12px;padding:14px;font-weight:700;font-size:1.05rem;">Pay Now</div>
    </div>
  `);
}

function buildIcs({ name, date, time, location, description }) {
  if (!date) return '';
  const dtStr = (date || '').replace(/[^0-9]/g, '');
  if (dtStr.length < 8) return '';
  const y = dtStr.slice(0, 4);
  const m = dtStr.slice(4, 6);
  const d = dtStr.slice(6, 8);
  let hh = '00', mm = '00';
  if (time) {
    const tParts = time.replace(/[^0-9:]/g, '').split(':');
    hh = (tParts[0] || '00').padStart(2, '0');
    mm = (tParts[1] || '00').padStart(2, '0');
  }
  const dtStart = `${y}${m}${d}T${hh}${mm}00`;
  const endH = String(Math.min(23, parseInt(hh, 10) + 1)).padStart(2, '0');
  const dtEnd = `${y}${m}${d}T${endH}${mm}00`;
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QRForge//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${name || 'Event'}`,
    location ? `LOCATION:${location}` : '',
    description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
    `DTSTAMP:${stamp}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines)}`;
}

function buildVCardDownload({ name, title, company, phone, email, website, address }) {
  const parts = (name || '').trim().split(/\s+/);
  const first = parts[0] || '';
  const last = parts.slice(1).join(' ');
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name || ''}`,
    `N:${last};${first};;;`,
    title ? `TITLE:${title}` : '',
    company ? `ORG:${company}` : '',
    phone ? `TEL;TYPE=CELL:${phone}` : '',
    email ? `EMAIL:${email}` : '',
    website ? `URL:${website}` : '',
    address ? `ADR;TYPE=WORK:;;${address};;;;` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n');
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(lines)}`;
}

export function buildLandingPage(config) {
  const c = config || {};
  switch (c.type) {
    case 'social':
      return buildSocialPage(c);
    case 'card':
      return buildCardPage(c);
    case 'menu':
      return buildMenuPage(c);
    case 'product':
      return buildProductPage(c);
    case 'event':
      return buildEventPage(c);
    case 'review':
      return buildReviewPage(c);
    case 'whatsapp':
      return buildWhatsappPage(c);
    case 'payment':
      return buildPaymentPage(c);
    default:
      return baseTemplate(c.title || 'Page', c.brand, `
        <h1>${escapeHtml(c.title || 'Page')}</h1>
        ${c.description ? `<p class="description">${escapeHtml(c.description)}</p>` : ''}
      `);
  }
}

export function downloadLandingPage(html, filename) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
