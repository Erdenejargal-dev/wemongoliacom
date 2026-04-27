/**
 * /auth/register — traveler vs host-intent, aligned with `auth` login copy.
 */

export type RegisterPortalCopy = {
  heading: string
  subtitle: string
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordHint: string
  confirmLabel: string
  submit: string
  submitting: string
  hasAccount: string
  signInLink: string
  errorMismatch: string
  errorGeneric: string
  panelBadge: string
  panelHeading: string
  panelSubtitle: string
  trustItems: [string, string, string]
  legalBeforeTerms: string
  termsOfService: string
  legalBetween: string
  privacyPolicy: string
  legalAfter: string
}

export type RegisterAccountMessages = {
  traveler: RegisterPortalCopy
  host: RegisterPortalCopy
}

export const registerAccountEn: RegisterAccountMessages = {
  traveler: {
    heading: 'Create your account',
    subtitle: 'Join WeMongolia and start exploring authentic Mongolian experiences.',
    nameLabel: 'Full name',
    namePlaceholder: 'Your full name',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordHint: 'Must be at least 8 characters',
    confirmLabel: 'Confirm password',
    submit: 'Create account',
    submitting: 'Creating account…',
    hasAccount: 'Already have an account?',
    signInLink: 'Sign in',
    errorMismatch: 'Passwords do not match.',
    errorGeneric: 'Failed to create account. Please try again.',
    panelBadge: 'Your adventure starts here',
    panelHeading: 'Experience the real Mongolia',
    panelSubtitle:
      'From the vast Gobi Desert to the Khuvsgul lakeshores \u2014 find experiences that connect you to this extraordinary land.',
    trustItems: [
      'Explore Mongolia\u2019s most unique destinations',
      'Book with confidence \u2014 secure payments',
      'Support local guides and communities',
    ],
    legalBeforeTerms: 'By creating an account, you agree to our ',
    termsOfService: 'Terms of Service',
    legalBetween: ' and ',
    privacyPolicy: 'Privacy Policy',
    legalAfter: '.',
  },
  host: {
    heading: 'Create your account',
    subtitle: 'Join WeMongolia and start listing your business for travelers worldwide.',
    nameLabel: 'Full name',
    namePlaceholder: 'Your full name',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordHint: 'Must be at least 8 characters',
    confirmLabel: 'Confirm password',
    submit: 'Create account',
    submitting: 'Creating account…',
    hasAccount: 'Already have an account?',
    signInLink: 'Sign in',
    errorMismatch: 'Passwords do not match.',
    errorGeneric: 'Failed to create account. Please try again.',
    panelBadge: 'Partner with WeMongolia',
    panelHeading: 'Grow your Mongolian tourism business',
    panelSubtitle:
      'List tours and stays, reach global travelers, and manage bookings in one place.',
    trustItems: [
      'Simple onboarding for local operators',
      'Secure payouts and booking tools',
      'Reach travelers planning trips to Mongolia',
    ],
    legalBeforeTerms: 'By creating an account, you agree to our ',
    termsOfService: 'Terms of Service',
    legalBetween: ' and ',
    privacyPolicy: 'Privacy Policy',
    legalAfter: '.',
  },
}

export const registerAccountMn: RegisterAccountMessages = {
  traveler: {
    heading: 'Бүртгэл үүсгэх',
    subtitle: 'WeMongolia-д нэгдэж, Монголын жинхэнэ аяллын сонголтыг эхлүүлээрэй.',
    nameLabel: 'Овог, нэр',
    namePlaceholder: 'Таны бүтэн нэр',
    emailLabel: 'Имэйл хаяг',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Нууц үг',
    passwordHint: 'Хамгийн багадаа 8 тэмдэгт',
    confirmLabel: 'Нууц үг давтах',
    submit: 'Бүртгүүлэх',
    submitting: 'Бүртгэж байна…',
    hasAccount: 'Бүртгэлтэй юу?',
    signInLink: 'Нэвтрэх',
    errorMismatch: 'Нууц үг таарахгүй байна.',
    errorGeneric: 'Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.',
    panelBadge: 'Таны адал явдал энд эхэлнэ',
    panelHeading: 'Жинхэнэ Монголыг мэдэр',
    panelSubtitle:
      'Өргөн уудам Говьгоос Хөвсгөлийн эрэг хүртэл бүх л газрууд нэг дор.',
    trustItems: [
      'Монгол оронтой танилцах, өвөрмөц гайхалтай газруудыг үзэх',
      'Төлбөрийн найдвартай шийдэл',
      'Нутгийн хөтөч, нийгмийг дэмжинэ',
    ],
    legalBeforeTerms: 'Бүртгэл үүсгэснээр манай ',
    termsOfService: 'Үйлчилгээний нөхцөл',
    legalBetween: ' болон ',
    privacyPolicy: 'Нууцлалын бодлогыг',
    legalAfter: ' зөвшөөрч байна.',
  },
  host: {
    heading: 'Бүртгүүлэх',
    subtitle: 'WeMongolia-д нэгдэж, бизнесээ олон улсад харуул',
    nameLabel: 'Овог, нэр',
    namePlaceholder: 'Таны бүтэн нэр',
    emailLabel: 'Имэйл хаяг',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Нууц үг',
    passwordHint: 'Хамгийн багадаа 8 тэмдэгт',
    confirmLabel: 'Нууц үг давтах',
    submit: 'Бүртгүүлэх',
    submitting: 'Бүртгэж байна…',
    hasAccount: 'Бүртгэлтэй юу?',
    signInLink: 'Нэвтрэх',
    errorMismatch: 'Нууц үг таарахгүй байна.',
    errorGeneric: 'Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.',
    panelBadge: 'Итгэлтэй түншлэл',
    panelHeading: 'Хамтдаа дэлхийд гарцгаая',
    panelSubtitle: 'Аялал, буудал жагсаалтаа оруул; олон улсын аялагчдад хүр, захиалгыг нэг газраас удирд.',
    trustItems: [
      'Нутгийн үйлчилгээ үзүүлэгчдэд зориулсан энгийн бүртгэл',
      'Аюулгүй төлбөр, захиалгын хэрэгсэл',
      'Монголд аялал төлөвлөгчдөд хүрэх',
    ],
    legalBeforeTerms: 'Бүртгэл үүсгэснээр манай ',
    termsOfService: 'Үйлчилгээний нөхцөл',
    legalBetween: ' болон ',
    privacyPolicy: 'Нууцлалын бодлогыг',
    legalAfter: ' зөвшөөрч байна.',
  },
}
