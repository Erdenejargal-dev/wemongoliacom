'use client'

import { useState } from 'react'

const content = {
  en: {
    title: 'Cookie Policy',
    updated: 'Last updated: January 1, 2025',
    intro:
      'This Cookie Policy explains what cookies are, how WeMongolia uses them, and the choices you have regarding their use. By continuing to use our platform, you consent to the use of cookies as described in this policy.',
    sections: [
      {
        heading: '1. What Are Cookies?',
        body: [
          'Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work efficiently, to remember your preferences, and to provide information to website owners.',
          'Cookies are not harmful and do not contain viruses or personal information like your name or credit card details. However, they can be used to recognise your browser and to remember certain information about your visit.',
          'Similar tracking technologies such as web beacons, pixels, and local storage may also be used in conjunction with cookies to achieve similar purposes. Throughout this policy, we use the term "cookies" to refer to all such technologies collectively.',
        ],
      },
      {
        heading: '2. Types of Cookies We Use',
        body: [
          '**Essential Cookies** — These cookies are strictly necessary for our platform to function and cannot be switched off. They are usually set in response to actions you take, such as logging in, filling out forms, or setting your privacy preferences. Without these cookies, parts of the platform will not work correctly.',
          '**Analytics & Performance Cookies** — These cookies help us understand how visitors interact with our platform by collecting information about pages visited, time spent on the platform, and any errors encountered. This data is aggregated and anonymized, meaning it cannot be used to identify you personally. We use this information to improve the performance and usability of our platform.',
          '**Functionality Cookies** — These cookies allow the platform to remember choices you make (such as your preferred language, currency, or region) and provide enhanced, more personalised features. They may also be used to provide services you have requested, such as watching a video or leaving a comment.',
          '**Marketing & Targeting Cookies** — These cookies are used to build a profile of your interests and show you relevant advertisements on our platform and across the web. They track your activity across websites and are usually placed by third-party advertising networks. You can opt out of these cookies at any time.',
        ],
      },
      {
        heading: '3. How to Control Cookies',
        body: [
          'When you first visit our platform, you will be presented with a cookie consent banner that allows you to accept all cookies, reject non-essential cookies, or manage your preferences individually by category. You can change your preferences at any time by clicking the "Cookie Settings" link in the footer.',
          'You can also control cookies through your web browser settings. Most browsers allow you to view, delete, and block cookies from websites. Please note that if you block essential cookies, some parts of our platform may not function properly. Instructions for managing cookies vary by browser — please refer to your browser\'s help documentation for guidance.',
          'To opt out of interest-based advertising from third-party networks that use cookies on our platform, you can visit the Network Advertising Initiative opt-out page or the Digital Advertising Alliance opt-out page. Please note that even after opting out, you may still receive generic (non-personalised) advertisements.',
        ],
      },
    ],
    contact: 'If you have any questions about our use of cookies, please contact us at privacy@wemongolia.com.',
  },
  mn: {
    title: 'Күүкийн бодлого',
    updated: 'Сүүлд шинэчилсэн: 2025 оны 1-р сарын 1',
    intro:
      'Энэхүү Күүкийн бодлого нь күүки гэж юу болох, WeMongolia тэдгээрийг хэрхэн ашигладаг болон таны сонголтыг тайлбарлана. Манай платформыг үргэлжлүүлэн ашигласнаар та энэ бодлогод заасны дагуу күүки ашиглахыг зөвшөөрч байна.',
    sections: [
      {
        heading: '1. Күүки гэж юу вэ?',
        body: [
          'Күүки нь вебсайтад зочлох үед таны төхөөрөмжид (компьютер, гар утас эсвэл таблет) байрлуулагдах жижиг текст файл юм. Вебсайт хэвийн ажиллах, уподобаллуурыг санах болон вебсайтын эзэдэд мэдээлэл өгөх зорилгоор өргөн ашиглагддаг.',
          'Күүки нь хортой биш бөгөөд вирус, нэр эсвэл картын дугаар зэрэг хувийн мэдээлэл агуулдаггүй. Гэхдээ тэд таны хөтчийг таних, зочилсон мэдээллийг санахад ашиглагдаж болно.',
          'Вэб маяк, пиксел, локал хадгалалт зэрэг ижил төстэй технологиуд мөн адил зорилгоор ашиглагдаж болно. Энэ бодлогод бид бүх ийм технологийг "күүки" гэж нэрлэнэ.',
        ],
      },
      {
        heading: '2. Бидний ашигладаг күүкийн төрлүүд',
        body: [
          '**Үндсэн күүки** — Эдгээр күүки нь платформыг ажиллуулахад заавал шаардлагатай бөгөөд унтрааж болохгүй. Нэвтрэх, маягт бөглөх зэрэг таны үйлдлийн хариуд тохируулагддаг. Эдгээргүйгээр платформын зарим хэсэг зөв ажиллахгүй.',
          '**Аналитик & Гүйцэтгэлийн күүки** — Эдгээр күүки нь хэрэглэгчдийн платформтой харилцах байдлыг — зочилсон хуудас, өнгөрөөсөн цаг, алдаанууд — нэгтгэсэн, нэрийг нуусан хэлбэрээр ойлгоход тусалдаг. Бид энэ мэдээллийг гүйцэтгэлийг сайжруулахад ашигладаг.',
          '**Функциональ күүки** — Эдгээр күүки нь таны сонгосон хэл, валют, бүс нутгийг санах болон сайжруулсан, хувийн туршлага хангахад ашиглагддаг.',
          '**Маркетинг & Чиглүүлэх күүки** — Эдгээр күүки нь таны сонирхлын профайл үүсгэж, платформ дотор болон вэб дэлгэрэнгүй сурталчилгаа харуулахад ашиглагддаг. Та хэдийд ч эдгээрээс гаргаж болно.',
        ],
      },
      {
        heading: '3. Күүкийг хэрхэн хянах вэ?',
        body: [
          'Манай платформд анх зочлох үед бүх күүки зөвшөөрөх, чухал бус күүкийг татгалзах эсвэл ангиллаар тохируулах боломжтой күүкийн зөвшөөрлийн самбар харагдана. Та хэдийд ч хөлийн "Күүкийн тохиргоо" холбоосоор тохиргоогоо өөрчилж болно.',
          'Та мөн хөтчийн тохиргооны тусламжтайгаар күүкийг хянаж, устгаж, блоклох боломжтой. Үндсэн күүкийг блоклосон тохиолдолд платформын зарим хэсэг зөв ажиллахгүй байж болно. Тохиргоо нь хөтчөөс хамаарч өөр өөр байдаг — тусламжийн хэсгийг лавлана уу.',
          'Гуравдагч талын сурталчилгааны сүлжээний сонирхолд тулгуурласан зарнаас гарахын тулд Network Advertising Initiative эсвэл Digital Advertising Alliance-ийн гарах хуудсыг зочлоорой. Гараад байсан ч ерөнхий сурталчилгаа харагдаж болохыг анхаараарай.',
        ],
      },
    ],
    contact: 'Күүки ашиглахтай холбоотой асуулт байвал privacy@wemongolia.com хаягаар бидэнтэй холбогдоно уу.',
  },
}

type Lang = 'en' | 'mn'

export default function CookiesPage() {
  const [lang, setLang] = useState<Lang>('en')
  const t = content[lang]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">

        {/* Language Toggle */}
        <div className="flex items-center gap-1 mb-12 p-1 bg-gray-100 rounded-lg w-fit">
          {(['en', 'mn'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                lang === l
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {l === 'en' ? '🇬🇧 English' : '🇲🇳 Монгол'}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-gray-100">
          <p className="text-sm font-medium text-indigo-600 mb-3 uppercase tracking-wider">Legal</p>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">{t.title}</h1>
          <p className="text-sm text-gray-400">{t.updated}</p>
        </div>

        {/* Intro */}
        <p className="text-base text-gray-600 leading-relaxed mb-12">{t.intro}</p>

        {/* Sections */}
        <div className="space-y-12">
          {t.sections.map(section => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.heading}</h2>
              <div className="space-y-4">
                {section.body.map((para, i) => {
                  // Render bold markdown **text** inline
                  const parts = para.split(/(\*\*[^*]+\*\*)/)
                  return (
                    <p key={i} className="text-base text-gray-600 leading-relaxed">
                      {parts.map((part, j) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={j} className="font-semibold text-gray-800">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">{t.contact}</p>
        </div>

      </div>
    </main>
  )
}
