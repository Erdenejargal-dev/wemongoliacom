export type GuidePortalMessages = {
  sidebarPortal:        string
  menuOverview:         string
  menuInquiries:        string
  menuProfile:          string
  menuReviews:          string
  menuSettings:         string
  overviewGreeting:     (name: string) => string
  overviewNewInquiries: string
  overviewAvgRating:    string
  overviewResponseRate: string
  statusNew:            string
  statusReplied:        string
  statusAccepted:       string
  statusDeclined:       string
  inquiriesTitle:       string
  inquiriesAll:         string
  inquiriesEmpty:       string
  inquiriesReplyBtn:    string
  inquiriesAcceptBtn:   string
  inquiriesDeclineBtn:  string
  inquiriesSendReply:   string
  profileTitle:         string
  profileBio:           string
  profileAbout:         string
  profileRate:          string
  profileSpecialties:   string
  profileLanguages:     string
  profileStatus:        string
  profileSave:          string
  profileSaving:        string
  reviewsTitle:         string
  reviewsReplyBtn:      string
  reviewsNoReviews:     string
  analyticsInquiries:   string
  analyticsRate:        string
  analyticsRating:      string
  settingsTitle:        string
  applyTitle:           string
  applyLead:            string
  applyFieldName:       string
  applyFieldBio:        string
  applyFieldLocation:   string
  applyFieldSpecialties: string
  applyFieldLanguages:  string
  applyFieldYearsExp:   string
  applyFieldDailyRate:  string
  applyFieldEmail:      string
  applyFieldPhone:      string
  applyFieldIdPhoto:    string
  applyFieldIdPhotoHint: string
  applyFieldPhoto:      string
  applySubmit:          string
  applySubmitting:      string
  applyAbout:           string
  applyAboutHint:       string
  applySuccessTitle:    string
  applySuccessLead:     string
  applyPendingTitle:    string
  applyPendingLead:     string
  applyRejectedTitle:   string
  applyRejectedLead:    (reason: string) => string
  applyStep1:           string
  applyStep2:           string
  applyStep3:           string
  applyStep4:           string
  adminTitle:           string
  adminApprove:         string
  adminReject:          string
  adminRejectReason:    string
  adminApproving:       string
  adminRejecting:       string
}

export const guidePortalEn: GuidePortalMessages = {
  sidebarPortal:        'Guide Portal',
  menuOverview:         'Overview',
  menuInquiries:        'Inquiries',
  menuProfile:          'My Profile',
  menuReviews:          'Reviews',
  menuSettings:         'Settings',
  overviewGreeting:     (name) => `Welcome back, ${name}`,
  overviewNewInquiries: 'New Inquiries',
  overviewAvgRating:    'Avg. Rating',
  overviewResponseRate: 'Response Rate',
  statusNew:            'New',
  statusReplied:        'Replied',
  statusAccepted:       'Accepted',
  statusDeclined:       'Declined',
  inquiriesTitle:       'Traveler Inquiries',
  inquiriesAll:         'All',
  inquiriesEmpty:       'No inquiries yet',
  inquiriesReplyBtn:    'Reply',
  inquiriesAcceptBtn:   'Accept',
  inquiriesDeclineBtn:  'Decline',
  inquiriesSendReply:   'Send reply',
  profileTitle:         'Edit Profile',
  profileBio:           'Short bio',
  profileAbout:         'About me',
  profileRate:          'Daily rate (USD)',
  profileSpecialties:   'Specialties',
  profileLanguages:     'Languages',
  profileStatus:        'Availability',
  profileSave:          'Save changes',
  profileSaving:        'Saving…',
  reviewsTitle:         'Traveler Reviews',
  reviewsReplyBtn:      'Reply to review',
  reviewsNoReviews:     'No reviews yet',
  analyticsInquiries:   'Total inquiries',
  analyticsRate:        'Response rate',
  analyticsRating:      'Average rating',
  settingsTitle:        'Account Settings',
  applyTitle:           'Become a Guide',
  applyLead:            'Submit your information and we\'ll review your application within 3 business days.',
  applyFieldName:       'Full name',
  applyFieldBio:        'Short bio (max 500 chars)',
  applyFieldLocation:   'Your location',
  applyFieldSpecialties: 'Specialties',
  applyFieldLanguages:  'Languages you speak',
  applyFieldYearsExp:   'Years of experience',
  applyFieldDailyRate:  'Daily rate (USD, optional)',
  applyFieldEmail:      'Contact email',
  applyFieldPhone:      'Contact phone (optional)',
  applyFieldIdPhoto:    'Government ID photo',
  applyFieldIdPhotoHint: 'Upload a photo of your national ID or passport. Only admin will see this.',
  applyFieldPhoto:      'Profile photo (optional)',
  applySubmit:          'Submit application',
  applySubmitting:      'Submitting…',
  applyAbout:           'About you (full description)',
  applyAboutHint:       'Tell travelers about your background, experience, and what makes your tours special.',
  applySuccessTitle:    'Application submitted!',
  applySuccessLead:     'We\'ll review your application and get back to you within 3 business days.',
  applyPendingTitle:    'Application under review',
  applyPendingLead:     'Your application is being reviewed. We\'ll notify you when a decision is made.',
  applyRejectedTitle:   'Application not approved',
  applyRejectedLead:    (reason) => `Your application was not approved: ${reason}. You may resubmit with updated information.`,
  applyStep1:           'Basic info',
  applyStep2:           'Specialties & rate',
  applyStep3:           'Contact & ID',
  applyStep4:           'Review & submit',
  adminTitle:           'Guide Applications',
  adminApprove:         'Approve',
  adminReject:          'Reject',
  adminRejectReason:    'Rejection reason',
  adminApproving:       'Approving…',
  adminRejecting:       'Rejecting…',
}

export const guidePortalMn: GuidePortalMessages = {
  sidebarPortal:        'Хөтчийн портал',
  menuOverview:         'Тойм',
  menuInquiries:        'Хүсэлтүүд',
  menuProfile:          'Миний профайл',
  menuReviews:          'Үнэлгээнүүд',
  menuSettings:         'Тохиргоо',
  overviewGreeting:     (name) => `Тавтай морилно уу, ${name}`,
  overviewNewInquiries: 'Шинэ хүсэлт',
  overviewAvgRating:    'Дундаж үнэлгээ',
  overviewResponseRate: 'Хариу өгөлт',
  statusNew:            'Шинэ',
  statusReplied:        'Хариулсан',
  statusAccepted:       'Зөвшөөрсөн',
  statusDeclined:       'Татгалзсан',
  inquiriesTitle:       'Аяллын хүсэлтүүд',
  inquiriesAll:         'Бүх',
  inquiriesEmpty:       'Хүсэлт байхгүй байна',
  inquiriesReplyBtn:    'Хариулах',
  inquiriesAcceptBtn:   'Зөвшөөрөх',
  inquiriesDeclineBtn:  'Татгалзах',
  inquiriesSendReply:   'Хариу илгээх',
  profileTitle:         'Профайл засах',
  profileBio:           'Товч танилцуулга',
  profileAbout:         'Миний тухай',
  profileRate:          'Өдрийн тариф (USD)',
  profileSpecialties:   'Чиглэлүүд',
  profileLanguages:     'Хэлүүд',
  profileStatus:        'Хүртээмж',
  profileSave:          'Хадгалах',
  profileSaving:        'Хадгалж байна…',
  reviewsTitle:         'Аяллагчдын үнэлгээ',
  reviewsReplyBtn:      'Үнэлгээнд хариулах',
  reviewsNoReviews:     'Үнэлгээ байхгүй байна',
  analyticsInquiries:   'Нийт хүсэлт',
  analyticsRate:        'Хариу өгөлт',
  analyticsRating:      'Дундаж үнэлгээ',
  settingsTitle:        'Бүртгэлийн тохиргоо',
  applyTitle:           'Хөтчөөр бүртгүүлэх',
  applyLead:            'Мэдээллээ илгээнэ үү, бид 3 ажлын өдрийн дотор хянаж шийдвэрлэнэ.',
  applyFieldName:       'Бүтэн нэр',
  applyFieldBio:        'Товч танилцуулга (500 тэмдэгт хүртэл)',
  applyFieldLocation:   'Байршил',
  applyFieldSpecialties: 'Чиглэлүүд',
  applyFieldLanguages:  'Ярьдаг хэлүүд',
  applyFieldYearsExp:   'Туршлагын жил',
  applyFieldDailyRate:  'Өдрийн тариф (USD, заавал биш)',
  applyFieldEmail:      'Холбоо барих имэйл',
  applyFieldPhone:      'Холбоо барих утас (заавал биш)',
  applyFieldIdPhoto:    'Иргэний үнэмлэхний зураг',
  applyFieldIdPhotoHint: 'Иргэний үнэмлэх эсвэл паспортын зургийг оруулна уу. Зөвхөн администратор харах боломжтой.',
  applyFieldPhoto:      'Профайл зураг (заавал биш)',
  applySubmit:          'Хүсэлт илгээх',
  applySubmitting:      'Илгээж байна…',
  applyAbout:           'Миний тухай (дэлгэрэнгүй)',
  applyAboutHint:       'Аяллагчдад өөрийн туршлага, арга барил болон онцлогоо танилцуулна уу.',
  applySuccessTitle:    'Хүсэлт амжилттай илгээгдлээ!',
  applySuccessLead:     'Таны хүсэлтийг хянаж, 3 ажлын өдрийн дотор хариу өгнө.',
  applyPendingTitle:    'Хүсэлт хянагдаж байна',
  applyPendingLead:     'Таны хүсэлт хянагдаж байна. Шийдвэр гарсны дараа мэдэгдэнэ.',
  applyRejectedTitle:   'Хүсэлт зөвшөөрөгдсөнгүй',
  applyRejectedLead:    (reason) => `Таны хүсэлт зөвшөөрөгдсөнгүй: ${reason}. Мэдээллээ шинэчлэн дахин илгээж болно.`,
  applyStep1:           'Үндсэн мэдээлэл',
  applyStep2:           'Чиглэл & тариф',
  applyStep3:           'Холбоо барих & иргэний үнэмлэх',
  applyStep4:           'Хянах & илгээх',
  adminTitle:           'Хөтчийн хүсэлтүүд',
  adminApprove:         'Зөвшөөрөх',
  adminReject:          'Татгалзах',
  adminRejectReason:    'Татгалзах шалтгаан',
  adminApproving:       'Зөвшөөрч байна…',
  adminRejecting:       'Татгалзаж байна…',
}
