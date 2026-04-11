'use client'

import { useState } from 'react'

const content = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: January 1, 2025',
    intro:
      'Your privacy is important to us. This Privacy Policy explains how WeMongolia collects, uses, and safeguards your personal information when you use our platform. By using our services, you consent to the practices described in this policy.',
    sections: [
      {
        heading: '1. Data We Collect',
        body: [
          'We collect information you provide directly to us when you create an account, make a booking, communicate with hosts or travelers, or contact our support team. This includes your name, email address, phone number, profile photo, payment information, and any other information you choose to share.',
          'We automatically collect certain technical information when you use our platform, including your IP address, browser type, operating system, referring URLs, device identifiers, and cookie data. We also collect information about how you interact with our platform, such as pages visited, search queries, and booking history.',
          'When you connect third-party accounts (such as Google or Facebook) for login, we may receive limited profile information from those services in accordance with your privacy settings on those platforms.',
        ],
      },
      {
        heading: '2. How We Use Your Data',
        body: [
          'We use your personal information to provide, operate, and improve our platform — including processing bookings, facilitating payments, enabling communication between users, and providing customer support. We may also use your data to personalize your experience and recommend relevant tours or stays.',
          'We may send you transactional communications (booking confirmations, receipts, safety alerts) and, with your consent, promotional communications about new features, offers, and updates. You can opt out of marketing communications at any time via your account settings.',
          'We may use aggregated, anonymized data for analytics and research to understand trends in platform usage and improve our services. This data cannot be used to identify you individually.',
        ],
      },
      {
        heading: '3. Cookies',
        body: [
          'We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small text files stored on your device that allow us to remember your preferences, maintain your session, and analyze platform usage.',
          'We use essential cookies (necessary for the platform to function), analytics cookies (to understand how users interact with our platform), and marketing cookies (to deliver relevant advertisements). You can manage your cookie preferences through our Cookie Consent banner or your browser settings.',
          'Please refer to our Cookie Policy for detailed information about the specific cookies we use and how you can control them.',
        ],
      },
      {
        heading: '4. Third-Party Services',
        body: [
          'We work with trusted third-party service providers to operate our platform. These include payment processors (for secure transaction handling), cloud hosting providers, analytics services, and customer support tools. These providers access your data only as necessary to perform services on our behalf and are contractually obligated to protect it.',
          'Our platform may contain links to external websites or services not operated by us. We are not responsible for the privacy practices of those third parties and encourage you to review their privacy policies before providing any personal information.',
          'We may share your information with law enforcement or government authorities when required by applicable law, court order, or to protect the safety and rights of our users.',
        ],
      },
      {
        heading: '5. Your Rights',
        body: [
          'Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the processing of your personal data. You may also have the right to data portability and to withdraw consent where processing is based on consent.',
          'To exercise any of these rights, please contact us at privacy@wemongolia.com. We will respond to your request within 30 days. We may need to verify your identity before processing your request.',
          'If you believe we have not handled your data in compliance with applicable privacy laws, you have the right to lodge a complaint with the relevant supervisory authority in your jurisdiction.',
        ],
      },
    ],
    contact: 'For privacy-related inquiries, contact our Data Protection team at privacy@wemongolia.com.',
  },
  mn: {
    title: 'Нууцлалын бодлого',
    updated: 'Сүүлд шинэчилсэн: 2025 оны 1-р сарын 1',
    intro:
      'Таны нууцлал бидэнд чухал. Энэхүү Нууцлалын бодлого нь WeMongolia платформыг ашиглах үед таны хувийн мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалдагийг тайлбарлана. Манай үйлчилгээг ашигласнаар та энэ бодлогод заасан практикийг зөвшөөрч байна.',
    sections: [
      {
        heading: '1. Бидний цуглуулдаг өгөгдөл',
        body: [
          'Та бүртгэл үүсгэх, захиалга хийх, эзэд болон аялагчидтай харилцах, эсвэл манай дэмжлэгийн багтай холбогдох үед шууд өгсөн мэдээллийг бид цуглуулна. Үүнд таны нэр, и-мэйл хаяг, утасны дугаар, профайл зураг, төлбөрийн мэдээлэл болон бусад мэдээлэл орно.',
          'Платформыг ашиглах үед IP хаяг, хөтчийн төрөл, үйлдлийн систем, хэрэглэгчийн үйлдлийн мэдээлэл (хайлт, захиалгын түүх, зочилсон хуудас) зэргийг автоматаар цуглуулна.',
          'Та гуравдагч талын данс (Google, Facebook) ашиглан нэвтэрвэл тэдгээр платформ дахь нууцлалын тохиргооны дагуу хязгаарлагдмал профайл мэдээллийг авч болно.',
        ],
      },
      {
        heading: '2. Өгөгдлийг хэрхэн ашигладаг',
        body: [
          'Бид таны хувийн мэдээллийг платформыг ажиллуулах, захиалга боловсруулах, төлбөр хийх, хэрэглэгчдийн хоорондын харилцааг хангах болон хэрэглэгчийн дэмжлэг үзүүлэх зорилгоор ашиглана.',
          'Бид таны зөвшөөрөлтэйгөөр шинэ боломж, санал, мэдээллийн талаар сурталчилгааны и-мэйл илгээж болно. Та хэдийд ч дансны тохиргооноосоо бүртгэлээ гаргаж болно.',
          'Бид платформын хэрэглээний чиг хандлагыг ойлгох, үйлчилгээгээ сайжруулах зорилгоор нэгтгэсэн, нэрийг нь нуусан өгөгдлийг ашиглаж болно. Энэ өгөгдлийг тодорхой хүнийг таньж мэдэхэд ашиглаж болохгүй.',
        ],
      },
      {
        heading: '3. Күүки',
        body: [
          'Бид таны платформ дахь туршлагыг сайжруулахын тулд күүки болон ижил төстэй технологи ашигладаг. Күүки нь таны уподобаллуур, сессийг хадгалах, платформын хэрэглээг шинжлэхэд ашиглагдах төхөөрөмжид хадгалагдсан жижиг текст файл юм.',
          'Бид үндсэн күүки (платформ ажиллахад шаардлагатай), аналитик күүки болон маркетингийн күүки ашигладаг. Та күүкийн тохиргоогоо Күүкийн зөвшөөрлийн самбар эсвэл хөтчийн тохиргооноосоо удирдаж болно.',
          'Дэлгэрэнгүй мэдээллийг манай Күүкийн бодлогоос үзнэ үү.',
        ],
      },
      {
        heading: '4. Гуравдагч талын үйлчилгээ',
        body: [
          'Бид платформыг ажиллуулахын тулд найдвартай гуравдагч талын үйлчилгээ үзүүлэгчидтэй хамтарч ажилладаг. Тэдгээрт төлбөр боловсруулагч, үүлэн хостинг, аналитик болон хэрэглэгчийн дэмжлэгийн хэрэгслүүд орно. Тэд таны өгөгдөлд зөвхөн шаардлагатай хэмжээнд нэвтэрч, хуулийн үүрэг хүлээн хамгаалдаг.',
          'Манай платформ дээр гадаад вебсайт болон үйлчилгээний холбоос байж болно. Тэдгээрийн нууцлалын бодлогод хяналт тавих боломжгүй тул мэдээлэл өгөхөөсөө өмнө тэдний бодлогыг уншихыг зөвлөж байна.',
          'Хуулиар шаардлагатай тохиолдолд, эсвэл хэрэглэгчдийн аюулгүй байдлыг хамгаалах зорилгоор бид таны мэдээллийг хууль хяналтын байгууллагад дамжуулж болно.',
        ],
      },
      {
        heading: '5. Таны эрхүүд',
        body: [
          'Таны харъяалах улсын хуулиас хамааран та хувийн өгөгдлөө авах, засах, устгах, боловсруулалтыг хязгаарлах эрхтэй байж болно. Мөн зөвшөөрөлд үндэслэсэн тохиолдолд зөвшөөрлөө буцааж авах эрхтэй.',
          'Эдгээр эрхийг хэрэгжүүлэхийн тулд privacy@wemongolia.com хаягаар бидэнтэй холбогдоно уу. Бид 30 хоногийн дотор хариу өгнө. Хүсэлтийг боловсруулахаасаа өмнө таны иргэний баталгааг шаардаж болно.',
          'Хэрэв бид таны өгөгдлийг зохих журмын дагуу зохицуулаагүй гэж үзвэл та харъяалах хяналтын байгууллагад гомдол гаргах эрхтэй.',
        ],
      },
    ],
    contact: 'Нууцлалтай холбоотой асуулт байвал privacy@wemongolia.com хаягаар бидний Өгөгдлийн хамгаалалтын багтай холбогдоно уу.',
  },
}

type Lang = 'en' | 'mn'

export default function PrivacyPage() {
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
                {section.body.map((para, i) => (
                  <p key={i} className="text-base text-gray-600 leading-relaxed">
                    {para}
                  </p>
                ))}
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
