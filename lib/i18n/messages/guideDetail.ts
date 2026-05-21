export type GuideDetailMessages = {
  breadcrumbGuides:   string
  aboutTitle:         (name: string) => string
  specialtiesTitle:   string
  languagesLabel:     string
  certifiedBadge:     string
  verifiedBadge:      string
  licensedLabel:      string
  licenseNumber:      string
  atAGlance:          string
  statYears:          string
  statToursLed:       string
  statGuests:         string
  statReviews:        string
  reviewsTitle:       string
  reviewsVerified:    (n: number) => string
  reviewsOverall:     string
  reviewTourLine:     (tourName: string) => string
  contactWidgetTitle: (name: string) => string
  dailyRate:          string
  perDay:             string
  labelEmail:         string
  labelPhone:         string
  labelWebsite:       string
  sendMessage:        string
  respondsWithin:     string
  modalMessageTitle:  (name: string) => string
  messageSent:        string
  messageSentSub:     (name: string) => string
  formYourName:       string
  formYourEmail:      string
  yourMessage:        string
  contactCancel:      string
  contactSend:        string
  sending:            string
  placeholderName:    string
  placeholderEmail:   string
  placeholderMessage: string
  quickFactsTitle:    string
  factLocation:       string
  factExperience:     (years: number) => string
  factGuests:         (n: number) => string
  notAvailable:       string
}

export const guideDetailEn: GuideDetailMessages = {
  breadcrumbGuides:   'Guides',
  aboutTitle:         (name) => `About ${name}`,
  specialtiesTitle:   'Specialties',
  languagesLabel:     'Languages',
  certifiedBadge:     'Certified Guide',
  verifiedBadge:      'Verified',
  licensedLabel:      'Licensed',
  licenseNumber:      'License',
  atAGlance:          'At a Glance',
  statYears:          'Years Experience',
  statToursLed:       'Tours Led',
  statGuests:         'Guests',
  statReviews:        'Reviews',
  reviewsTitle:       'Traveler Reviews',
  reviewsVerified:    (n) => `${n} verified review${n !== 1 ? 's' : ''}`,
  reviewsOverall:     'Overall rating',
  reviewTourLine:     (tourName) => `Tour: ${tourName}`,
  contactWidgetTitle: (name) => `Contact ${name}`,
  dailyRate:          'Daily rate',
  perDay:             '/ day',
  labelEmail:         'Email',
  labelPhone:         'Phone',
  labelWebsite:       'Website',
  sendMessage:        'Send Message',
  respondsWithin:     'Usually responds within 24 hours',
  modalMessageTitle:  (name) => `Message ${name}`,
  messageSent:        'Message sent!',
  messageSentSub:     (name) => `${name} will reply by email within 24 hours.`,
  formYourName:       'Your name',
  formYourEmail:      'Your email',
  yourMessage:        'Message',
  contactCancel:      'Cancel',
  contactSend:        'Send',
  sending:            'Sending…',
  placeholderName:    'Jane Smith',
  placeholderEmail:   'jane@example.com',
  placeholderMessage: 'Hi, I\'m interested in booking a guide for…',
  quickFactsTitle:    'Quick Facts',
  factLocation:       'Based in',
  factExperience:     (years) => `${years} year${years !== 1 ? 's' : ''} guiding`,
  factGuests:         (n) => `${n.toLocaleString()} guests served`,
  notAvailable:       'Contact for pricing',
}

export const guideDetailMn: GuideDetailMessages = {
  breadcrumbGuides:   'Хөтчүүд',
  aboutTitle:         (name) => `${name}-ийн тухай`,
  specialtiesTitle:   'Мэргэшил',
  languagesLabel:     'Хэл',
  certifiedBadge:     'Лицензтэй хөтөч',
  verifiedBadge:      'Баталгаажсан',
  licensedLabel:      'Лицензтэй',
  licenseNumber:      'Лицензийн дугаар',
  atAGlance:          'Товч танилцуулга',
  statYears:          'Жилийн туршлага',
  statToursLed:       'Удирдсан аялал',
  statGuests:         'Зочид',
  statReviews:        'Үнэлгээ',
  reviewsTitle:       'Аялагчдын үнэлгээ',
  reviewsVerified:    (n) => `${n} баталгаажсан үнэлгээ`,
  reviewsOverall:     'Нийт үнэлгээ',
  reviewTourLine:     (tourName) => `Аялал: ${tourName}`,
  contactWidgetTitle: (name) => `${name}-тай холбогдох`,
  dailyRate:          'Өдрийн үнэ',
  perDay:             '/ өдөр',
  labelEmail:         'Имэйл',
  labelPhone:         'Утас',
  labelWebsite:       'Вэбсайт',
  sendMessage:        'Мессеж илгээх',
  respondsWithin:     'Ихэвчлэн 24 цагийн дотор хариулдаг',
  modalMessageTitle:  (name) => `${name}-д мессеж`,
  messageSent:        'Мессеж илгээлээ!',
  messageSentSub:     (name) => `${name} имэйлээр 24 цагт хариулна.`,
  formYourName:       'Таны нэр',
  formYourEmail:      'Таны имэйл',
  yourMessage:        'Мессеж',
  contactCancel:      'Болих',
  contactSend:        'Илгээх',
  sending:            'Илгээж байна…',
  placeholderName:    'Ж. Батболд',
  placeholderEmail:   'batbold@example.com',
  placeholderMessage: 'Сайн байна уу, хөтөч захиалахыг хүсч байна…',
  quickFactsTitle:    'Товч мэдээлэл',
  factLocation:       'Байршил',
  factExperience:     (years) => `${years} жил хөтөч`,
  factGuests:         (n) => `${n.toLocaleString()} зочинд үйлчилсэн`,
  notAvailable:       'Үнийн тухай холбоо барина уу',
}
