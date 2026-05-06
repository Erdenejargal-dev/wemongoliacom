/**
 * Auth screens — login (traveler vs host-intent) and related copy.
 * `traveler` = default public login; `host` = callback to onboarding / business.
 */

export type AuthPortalCopy = {
  heading:            string
  subtitle:           string
  emailLabel:         string
  emailPlaceholder:   string
  passwordLabel:      string
  forgotPassword:     string
  submit:             string
  submitting:         string
  noAccount:          string
  createAccount:      string
  errorInvalid:       string
  errorGeneric:       string
  panelBadge:         string
  panelHeading:       string
  panelSubtitle:      string
  trustItems:         [string, string, string]
  /** Legal line around Terms + Privacy links (order varies by language) */
  legalBeforeTerms:   string
  termsOfService:     string
  legalBetween:       string
  privacyPolicy:      string
  legalAfter:         string
}

export type AuthMessages = {
  traveler: AuthPortalCopy
  host:     AuthPortalCopy
}

export const authEn: AuthMessages = {
  traveler: {
    heading:          'Welcome back',
    subtitle:         'Sign in to explore and book authentic Mongolian experiences.',
    emailLabel:       'Email address',
    emailPlaceholder: 'you@example.com',
    passwordLabel:    'Password',
    forgotPassword:   'Forgot password?',
    submit:           'Sign in',
    submitting:       'Signing in…',
    noAccount:        'Don\u2019t have an account?',
    createAccount:    'Create one',
    errorInvalid:     'Invalid email or password. Please try again.',
    errorGeneric:     'Something went wrong. Please try again.',
    panelBadge:       'Trusted by travelers worldwide',
    panelHeading:     'Discover authentic Mongolia',
    panelSubtitle:
      'Connect with local guides, book unique experiences, and explore one of the world\u2019s last great frontiers.',
    trustItems: [
      'Curated tours by local Mongolian providers',
      'Verified experiences with secure booking',
      'Join a community of adventurous travelers',
    ],
    legalBeforeTerms: 'By continuing, you agree to our ',
    termsOfService:   'Terms of Service',
    legalBetween:     ' and ',
    privacyPolicy:    'Privacy Policy',
    legalAfter:       '.',
  },
  host: {
    heading:          'Welcome',
    subtitle:         'Sign in to your business dashboard and manage listings.',
    emailLabel:       'Email address',
    emailPlaceholder: 'you@example.com',
    passwordLabel:    'Password',
    forgotPassword:   'Forgot password?',
    submit:           'Sign in',
    submitting:       'Signing in…',
    noAccount:        'New provider?',
    createAccount:    'Register',
    errorInvalid:     'Invalid email or password. Please try again.',
    errorGeneric:     'Something went wrong. Please try again.',
    panelBadge:       'Partner with WeMongolia',
    panelHeading:     'Grow your Mongolian tourism business',
    panelSubtitle:
      'List tours and stays, reach global travelers, and manage bookings in one place.',
    trustItems: [
      'Simple onboarding for local operators',
      'Secure payouts and booking tools',
      'Reach travelers planning trips to Mongolia',
    ],
    legalBeforeTerms: 'By continuing, you agree to our ',
    termsOfService:   'Terms of Service',
    legalBetween:     ' and ',
    privacyPolicy:    'Privacy Policy',
    legalAfter:       '.',
  },
}

export const authMn: AuthMessages = {
  traveler: {
    heading:          'Тавтай морилно уу',
    subtitle:         'Өргөөндөө нэвтрэн, Монгол орноор аялах сонголтоо бүтээгээрэй.',
    emailLabel:       'Имэйл хаяг',
    emailPlaceholder: 'you@example.com',
    passwordLabel:    'Нууц үг',
    forgotPassword:   'Нууц үг мартсан уу?',
    submit:           'Нэвтрэх',
    submitting:       'Нэвтэрч байна…',
    noAccount:        'Бүртгэл байхгүй юу?',
    createAccount:    'Бүртгүүлэх',
    errorInvalid:     'Имэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу.',
    errorGeneric:     'Алдаа гарлаа. Дахин оролдоно уу.',
    panelBadge:       'Дэлхий дахины аялагчдын итгэлт түнш',
    panelHeading:     'Туйлын эрх чөлөөг мэдрээрэй',
    panelSubtitle:
      'Нутгийн мэргэжилтнүүдтэй холбогдон, тусгай аяллын сонголт бүртгээрэй.',
    trustItems: [
      'Монголын нутгийн төрөлжсөн түншлүүдийн аялал',
      'Найдвартай байдал, аюулгүй захиалга',
      'Адал явдалд тэмүүлэгчдийн цугларах газар',
    ],
    legalBeforeTerms: 'Үргэлжлүүлснээр ',
    termsOfService:   'Үйлчилгээний нөхцөл',
    legalBetween:     ', ',
    privacyPolicy:    'Нууцлалын бодлого',
    legalAfter:       'ыг зөвшөөрч байна.',
  },
  host: {
    heading:          'Тавтай морил',
    subtitle:         'Үйлчилгээнийхээ удирдлагаар нэвтэрнэ үү',
    emailLabel:       'Имэйл хаяг',
    emailPlaceholder: 'you@example.com',
    passwordLabel:    'Нууц үг',
    forgotPassword:   'Нууц үг мартсан?',
    submit:           'Нэвтрэх',
    submitting:       'Нэвтэрч байна…',
    noAccount:        'Бүртгэл үүсгээгүй юу?',
    createAccount:    'Бүртгүүлэх',
    errorInvalid:     'Имэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу.',
    errorGeneric:     'Алдаа гарлаа. Дахин оролдоно уу.',
    panelBadge:       'Итгэлтэй түншлэл',
    panelHeading:     'Хамтдаа дэлхийд гарцгаая',
    panelSubtitle:
      'Эх орноо олон улсад сурталчилж борлуулалтын сувгаа тэлээрээй.',
    trustItems: [
      'Бизнесээ хялбар бүртгэж, удирдах боломж',
      'Баталгаатай төлбөр, найдвартай систем',
      'Олон улсын аялагчдад хүрэх боломж',
    ],
    legalBeforeTerms: 'Үргэлжлүүлснээр та манай ',
    termsOfService:   'Үйлчилгээний нөхцөл',
    legalBetween:     ' болон ',
    privacyPolicy:    'Нууцлалын бодлого',
    legalAfter:       '-ыг зөвшөөрч байна.',
  },
}
