export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'business', label: 'Business' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'hospitality', label: 'Hotel & Salon' },
  { id: 'events', label: 'Events' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'social', label: 'Social Media' },
  { id: 'personal', label: 'Personal' },
  { id: 'kenya', label: 'Kenya' }
]

export const TEMPLATES = [
  // Business
  {
    id: 'business-website',
    name: 'Business Website',
    category: 'business',
    description: 'Link visitors directly to your business website.',
    icon: 'Globe',
    qrType: 'url',
    fields: { url: 'https://your-business.com' },
    suggestedFg: '#1a1a2e',
    suggestedBg: '#ffffff',
    suggestedRounded: false
  },
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'business',
    description: 'Share your contact details in a scan-ready card.',
    icon: 'Contact',
    qrType: 'contact',
    fields: {
      contactName: 'John Doe',
      contactOrg: 'Smith Enterprises Ltd',
      contactPhone: '+254712345678',
      contactEmail: 'john@example.com',
      contactWebsite: 'https://smithenterprises.co.ke',
      contactAddress: 'Westlands, Nairobi, Kenya'
    },
    suggestedFg: '#0f3460',
    suggestedBg: '#f5f5f5',
    suggestedRounded: true
  },
  {
    id: 'office-wifi',
    name: 'Office Wi-Fi',
    category: 'business',
    description: 'Let employees and visitors connect to office Wi-Fi instantly.',
    icon: 'Wifi',
    qrType: 'wifi',
    fields: {
      wifiSsid: 'CoffeeShop_5G',
      wifiPassword: 'password123',
      wifiSecurity: 'WPA',
      wifiHidden: false
    },
    suggestedFg: '#16213e',
    suggestedBg: '#e8f4f8',
    suggestedRounded: false
  },
  {
    id: 'support-email',
    name: 'Support Email',
    category: 'business',
    description: 'Provide a quick way to reach your support team.',
    icon: 'Mail',
    qrType: 'email',
    fields: {
      email: 'support@business.com',
      emailSubject: 'Help Required',
      emailBody: ''
    },
    suggestedFg: '#2c3e50',
    suggestedBg: '#ecf0f1',
    suggestedRounded: true
  },

  // Restaurant
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    category: 'restaurant',
    description: 'Display your digital menu with a single scan.',
    icon: 'Utensils',
    qrType: 'url',
    fields: { url: 'https://your-restaurant.com/menu' },
    suggestedFg: '#c0392b',
    suggestedBg: '#fdf2e9',
    suggestedRounded: true
  },
  {
    id: 'table-order',
    name: 'Table Order QR',
    category: 'restaurant',
    description: 'Enable table-side ordering from your guests\u2019 phones.',
    icon: 'ClipboardList',
    qrType: 'url',
    fields: { url: 'https://your-restaurant.com/order' },
    suggestedFg: '#d35400',
    suggestedBg: '#fef9e7',
    suggestedRounded: false
  },
  {
    id: 'restaurant-wifi',
    name: 'Wi-Fi for Guests',
    category: 'restaurant',
    description: 'Let diners connect to your guest Wi-Fi network.',
    icon: 'Wifi',
    qrType: 'wifi',
    fields: {
      wifiSsid: 'Restaurant_Guest',
      wifiPassword: 'guest123',
      wifiSecurity: 'WPA',
      wifiHidden: false
    },
    suggestedFg: '#e67e22',
    suggestedBg: '#fdebd0',
    suggestedRounded: true
  },
  {
    id: 'restaurant-contact',
    name: 'Restaurant Contact',
    category: 'restaurant',
    description: 'Share your restaurant\u2019s phone number for reservations.',
    icon: 'Phone',
    qrType: 'phone',
    fields: { phone: '+254712345678' },
    suggestedFg: '#a93226',
    suggestedBg: '#f5b7b1',
    suggestedRounded: false
  },

  // Hotel & Salon
  {
    id: 'hotel-checkin',
    name: 'Hotel Check-in',
    category: 'hospitality',
    description: 'Streamline your hotel check-in with a QR scan.',
    icon: 'Hotel',
    qrType: 'url',
    fields: { url: 'https://hotel.example.com/check-in' },
    suggestedFg: '#1b2631',
    suggestedBg: '#d5d8dc',
    suggestedRounded: true
  },
  {
    id: 'salon-booking',
    name: 'Salon Booking',
    category: 'hospitality',
    description: 'Let clients book salon appointments from their phone.',
    icon: 'Scissors',
    qrType: 'url',
    fields: { url: 'https://salon.example.com/book' },
    suggestedFg: '#6c3483',
    suggestedBg: '#f4ecf7',
    suggestedRounded: false
  },
  {
    id: 'hotel-wifi',
    name: 'Hotel Wi-Fi',
    category: 'hospitality',
    description: 'Help guests connect to hotel Wi-Fi without typing a password.',
    icon: 'Wifi',
    qrType: 'wifi',
    fields: {
      wifiSsid: 'Hotel_GuestRoom',
      wifiPassword: 'Welcome2026',
      wifiSecurity: 'WPA',
      wifiHidden: false
    },
    suggestedFg: '#2e4053',
    suggestedBg: '#eaf2f8',
    suggestedRounded: true
  },

  // Events
  {
    id: 'event-registration',
    name: 'Event Registration',
    category: 'events',
    description: 'Drive sign-ups with a scannable registration link.',
    icon: 'CalendarCheck',
    qrType: 'url',
    fields: { url: 'https://event.example.com/register' },
    suggestedFg: '#1a5276',
    suggestedBg: '#d6eaf8',
    suggestedRounded: false
  },
  {
    id: 'wedding-rsvp',
    name: 'Wedding RSVP',
    category: 'events',
    description: 'Make it easy for guests to RSVP to your wedding.',
    icon: 'Heart',
    qrType: 'url',
    fields: { url: 'https://wedding.example.com/rsvp' },
    suggestedFg: '#943126',
    suggestedBg: '#fadbd8',
    suggestedRounded: true
  },
  {
    id: 'conference-details',
    name: 'Conference Details',
    category: 'events',
    description: 'Share all key conference info in one scan.',
    icon: 'Mic2',
    qrType: 'text',
    fields: {
      text: 'Conference: Tech Summit 2026\nDate: 15 Mar 2026\nVenue: KICC Nairobi\nTime: 9AM-5PM'
    },
    suggestedFg: '#0b5345',
    suggestedBg: '#d5f5e3',
    suggestedRounded: false
  },
  {
    id: 'concert-tickets',
    name: 'Concert Tickets',
    category: 'events',
    description: 'Link fans directly to your concert ticket page.',
    icon: 'Ticket',
    qrType: 'url',
    fields: { url: 'https://tickets.example.com/concert' },
    suggestedFg: '#4a235a',
    suggestedBg: '#ebdef0',
    suggestedRounded: true
  },

  // Marketing
  {
    id: 'product-launch',
    name: 'Product Launch',
    category: 'marketing',
    description: 'Build buzz by linking to your new product page.',
    icon: 'Rocket',
    qrType: 'url',
    fields: { url: 'https://your-brand.com/new-product' },
    suggestedFg: '#b03a2e',
    suggestedBg: '#fdedec',
    suggestedRounded: true
  },
  {
    id: 'discount-code',
    name: 'Discount Code',
    category: 'marketing',
    description: 'Share a promo code that customers can redeem online.',
    icon: 'Tag',
    qrType: 'text',
    fields: {
      text: 'Use code SAVE20 for 20% off at https://store.example.com'
    },
    suggestedFg: '#1e8449',
    suggestedBg: '#d5f5e3',
    suggestedRounded: false
  },
  {
    id: 'campaign-landing',
    name: 'Campaign Landing',
    category: 'marketing',
    description: 'Drive traffic to your latest marketing campaign.',
    icon: 'Megaphone',
    qrType: 'url',
    fields: { url: 'https://campaign.example.com/2026' },
    suggestedFg: '#154360',
    suggestedBg: '#d4e6f1',
    suggestedRounded: true
  },
  {
    id: 'review-request',
    name: 'Review Request',
    category: 'marketing',
    description: 'Ask happy customers to leave a Google review.',
    icon: 'Star',
    qrType: 'url',
    fields: { url: 'https://g.page/your-business/review' },
    suggestedFg: '#7d6608',
    suggestedBg: '#fef9e7',
    suggestedRounded: false
  },

  // Social Media
  {
    id: 'instagram-profile',
    name: 'Instagram Profile',
    category: 'social',
    description: 'Grow your Instagram following with a quick scan.',
    icon: 'Instagram',
    qrType: 'url',
    fields: { url: 'https://instagram.com/your-profile' },
    suggestedFg: '#833ab4',
    suggestedBg: '#f5f0f0',
    suggestedRounded: true
  },
  {
    id: 'whatsapp-contact',
    name: 'WhatsApp Contact',
    category: 'social',
    description: 'Start a WhatsApp chat with a single scan.',
    icon: 'MessageCircle',
    qrType: 'url',
    fields: { url: 'https://wa.me/254700000000' },
    suggestedFg: '#25d366',
    suggestedBg: '#eafaf1',
    suggestedRounded: true
  },
  {
    id: 'youtube-channel',
    name: 'YouTube Channel',
    category: 'social',
    description: 'Point viewers straight to your YouTube channel.',
    icon: 'Youtube',
    qrType: 'url',
    fields: { url: 'https://youtube.com/@your-channel' },
    suggestedFg: '#ff0000',
    suggestedBg: '#fef5f5',
    suggestedRounded: false
  },

  // Personal
  {
    id: 'personal-website',
    name: 'Personal Website',
    category: 'personal',
    description: 'Share your personal website or portfolio.',
    icon: 'User',
    qrType: 'url',
    fields: { url: 'https://your-name.com' },
    suggestedFg: '#2c3e50',
    suggestedBg: '#f0f3f4',
    suggestedRounded: false
  },
  {
    id: 'personal-contact',
    name: 'My Contact Card',
    category: 'personal',
    description: 'Let others save your contact info instantly.',
    icon: 'Contact',
    qrType: 'contact',
    fields: {
      contactName: 'John Doe',
      contactOrg: 'JD Company',
      contactPhone: '+254711436169',
      contactEmail: 'john@example.com',
      contactWebsite: '',
      contactAddress: ''
    },
    suggestedFg: '#1c2833',
    suggestedBg: '#eaecee',
    suggestedRounded: true
  },

  // Kenya
  {
    id: 'mpesa-till',
    name: 'M-Pesa Till Number',
    category: 'kenya',
    description: 'Accept payments via your M-Pesa Buy Goods till.',
    icon: 'Smartphone',
    qrType: 'text',
    fields: {
      text: 'PAY BILL: Till No: 123456 Business Name: Your Shop'
    },
    suggestedFg: '#4caf50',
    suggestedBg: '#e8f5e9',
    suggestedRounded: false
  },
  {
    id: 'paybill-payment',
    name: 'Paybill Payment',
    category: 'kenya',
    description: 'Share M-Pesa Paybill details for easy payments.',
    icon: 'CreditCard',
    qrType: 'text',
    fields: {
      text: 'PAY BILL: Account No: 12345\nPaybill: 123456\nBusiness Name: Your Business'
    },
    suggestedFg: '#388e3c',
    suggestedBg: '#f1f8e9',
    suggestedRounded: true
  },
  {
    id: 'church-registration',
    name: 'Church Registration',
    category: 'kenya',
    description: 'Simplify church event or membership registration.',
    icon: 'Church',
    qrType: 'url',
    fields: { url: 'https://church.example.com/register' },
    suggestedFg: '#5d4037',
    suggestedBg: '#efebe9',
    suggestedRounded: false
  }
]

export function applyTemplate(template) {
  return {
    type: template.qrType,
    fields: { ...template.fields }
  }
}
