/**
 * Provider onboarding wizard — all user-visible copy (steps 1–3 + layout + errors).
 */

export type OnboardingMessages = {
  stepLabel: (n: number, total: number) => string
  saveAndExit: string
  genericError: string
  serviceTitle: string
  serviceLead: string
  nextStep: string
  back: string
  serviceCards: {
    tour: { title: string; subtitle: string }
    hotel: { title: string; subtitle: string }
    carRental: { title: string; subtitle: string }
    all: { title: string; subtitle: string }
  }
  step2: {
    title: string
    lead: string
    nameLabel: string
    namePlaceholder: string
    descLabel: string
    descHint: string
    descPlaceholder: string
    locationLabel: string
    locationPlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    websiteLabel: string
    websiteHint: string
    websitePlaceholder: string
    logoNote: string
  }
  step3: {
    title: string
    lead: string
    sectionBusiness: string
    sectionLocation: string
    sectionContact: string
    typeAll: string
    typeTour: string
    typeHotel: string
    typeCar: string
    helpParagraph: string
    cta: string
    saving: string
  }
  errors: {
    profileCheckFailed: string
    sessionExpired: string
    invalidSelection: string
    submitFailed: string
  }
  layout: {
    exit: string
    heroTitle: string
    heroLead: string
    timeBadge: string
    step1Label: string
    step2Label: string
    step3Label: string
  }
}

export const onboardingEn: OnboardingMessages = {
  stepLabel: (n, total) => `Step ${n} of ${total}`,
  saveAndExit: 'Save & exit',
  genericError: 'Something went wrong. Please try again.',
  serviceTitle: 'What services will you offer?',
  serviceLead: 'Choose what fits your business. You can add more later.',
  nextStep: 'Next step',
  back: 'Back',
  serviceCards: {
    tour: {
      title: 'Tours & experiences',
      subtitle: 'Guided trips, day tours, and adventures',
    },
    hotel: {
      title: 'Stays & lodging',
      subtitle: 'Hotels, ger camps, and lodges',
    },
    carRental: {
      title: 'Transport & drivers',
      subtitle: 'Car rental and driver services',
    },
    all: {
      title: 'All of the above',
      subtitle: 'Tours, stays, and transport',
    },
  },
  step2: {
    title: 'About your business',
    lead: 'Travelers will see this on your profile. You can edit it anytime.',
    nameLabel: 'Business name',
    namePlaceholder: 'e.g. Gobi Adventure Tours',
    descLabel: 'Short description',
    descHint: 'What makes your business stand out?',
    descPlaceholder: 'We offer authentic experiences across Mongolia...',
    locationLabel: 'City / location',
    locationPlaceholder: 'e.g. Ulaanbaatar',
    emailLabel: 'Email',
    emailPlaceholder: 'info@yourbusiness.mn',
    phoneLabel: 'Phone',
    phonePlaceholder: '+976 9900 0000',
    websiteLabel: 'Website',
    websiteHint: 'Optional — you can add this later',
    websitePlaceholder: 'https://yourbusiness.mn',
    logoNote: 'You can add a logo and more details from your dashboard after signup.',
  },
  step3: {
    title: "You're all set",
    lead: "We'll use the details below to create your profile. You can edit anytime.",
    sectionBusiness: 'Business',
    sectionLocation: 'Location',
    sectionContact: 'Contact',
    typeAll: 'Tours, stays & transport',
    typeTour: 'Tours & experiences',
    typeHotel: 'Stays & lodging',
    typeCar: 'Transport & drivers',
    helpParagraph:
      "We'll help you get your first bookings. After signup you can add tours, rooms, and vehicles from your dashboard.",
    cta: 'Start receiving bookings',
    saving: 'Saving…',
  },
  errors: {
    profileCheckFailed: 'Could not verify your profile. Please try again.',
    sessionExpired: 'Your session has expired. Please sign in again.',
    invalidSelection: 'Go back and select a service type.',
    submitFailed: 'Something went wrong. Please try again.',
  },
  layout: {
    exit: 'Exit',
    heroTitle: 'Start receiving bookings',
    heroLead:
      "A few quick steps to get your business online. We're here when you're ready for your first booking.",
    timeBadge: 'Takes under 2 minutes',
    step1Label: 'Services',
    step2Label: 'Business details',
    step3Label: 'Review',
  },
}

export const onboardingMn: OnboardingMessages = {
  stepLabel: (n, total) => `${total}-ийн ${n}-р алхам`,
  saveAndExit: 'Хадгалаад гарах',
  genericError: 'Алдаа гарлаа. Дахин оролдоно уу.',
  serviceTitle: 'Ямар үйлчилгээ санал болгох вэ?',
  serviceLead: 'Бизнестээ тохирох сонголтыг сонгоорой. Дараа нь нэмж болно.',
  nextStep: 'Дараагийн алхам',
  back: 'Буцах',
  serviceCards: {
    tour: {
      title: 'Аялал, тур',
      subtitle: 'Тур аялал, экскурс, адвенчер',
    },
    hotel: {
      title: 'Байршил, буудал',
      subtitle: 'Зочид буудал, гэр буудал, лодж',
    },
    carRental: {
      title: 'Тээвэр, жолооч',
      subtitle: 'Автомашин түрээс, жолоочийн үйлчилгээ',
    },
    all: {
      title: 'Бүгд',
      subtitle: 'Аялал, байршил, тээвэр',
    },
  },
  step2: {
    title: 'Бизнесийнхээ талаар',
    lead: 'Аялагчид таны профайлыг харах болно. Хүссэн үедээ засварлах боломжтой.',
    nameLabel: 'Бизнесийн нэр',
    namePlaceholder: 'жш. Говийн Адал Явдал Турс',
    descLabel: 'Товч тайлбар',
    descHint: 'Таны бизнесийг онцгой болгож буй зүйл юу вэ?',
    descPlaceholder: 'Бид Монголын жинхэнэ мэдрэмжийг санал болгодог...',
    locationLabel: 'Хот, байршил',
    locationPlaceholder: 'жш. Улаанбаатар',
    emailLabel: 'Имэйл',
    emailPlaceholder: 'info@taniibusiness.mn',
    phoneLabel: 'Утас',
    phonePlaceholder: '+976 9900 0000',
    websiteLabel: 'Вэбсайт',
    websiteHint: 'Заавал биш — дараа нэмж болно',
    websitePlaceholder: 'https://taniibusiness.mn',
    logoNote: 'Лого болон бусад мэдээллийг хяналтын самбараас нэмж болно.',
  },
  step3: {
    title: 'Бэлэн боллоо',
    lead: 'Доорх мэдээллээр бүртгэл үүсгэнэ. Хүссэн үедээ засварлах боломжтой.',
    sectionBusiness: 'Бизнес',
    sectionLocation: 'Байршил',
    sectionContact: 'Холбоо барих',
    typeAll: 'Аялал, байршил, тээвэр',
    typeTour: 'Аялал, тур',
    typeHotel: 'Байршил, буудал',
    typeCar: 'Тээвэр, жолооч',
    helpParagraph:
      'Бид танд эхний үйлчлүүлэгчийг олоход тусална. Бүртгүүлсний дараа хяналтын самбараас тур, өрөө, тээврийн хэрэгсэл нэмж болно.',
    cta: 'Захиалга хүлээн авч эхлэх',
    saving: 'Бүртгэж байна…',
  },
  errors: {
    profileCheckFailed: 'Профайл шалгахад алдаа гарлаа.',
    sessionExpired: 'Нэвтрэлт дууссан. Дахин нэвтэрнэ үү.',
    invalidSelection: 'Буцаж очоод үйлчилгээний төрлөө сонгоно уу.',
    submitFailed: 'Алдаа гарлаа. Дахин оролдоно уу.',
  },
  layout: {
    exit: 'Гарах',
    heroTitle: 'Захиалга хүлээн авч эхлэх',
    heroLead:
      'Цөөн алхамаар бизнесийнхээ профайлыг бүртгээрэй. Бид танд аялагчидтай холбогдоход тусална.',
    timeBadge: '2 минутаас бага хугацаа шаардана',
    step1Label: 'Үйлчилгээ',
    step2Label: 'Бизнесийн мэдээлэл',
    step3Label: 'Бэлэн боллоо',
  },
}
