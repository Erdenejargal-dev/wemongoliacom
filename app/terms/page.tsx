'use client'

import { useState } from 'react'

const content = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: January 1, 2025',
    intro:
      'Please read these Terms of Service carefully before using our platform. By accessing or using WeMongolia, you agree to be bound by these terms. If you do not agree, please do not use our services.',
    sections: [
      {
        heading: '1. Use of Service',
        body: [
          'WeMongolia provides an online marketplace connecting travelers with local tour operators, accommodation hosts, and transport providers in Mongolia. Our platform is available to users who are at least 18 years of age and capable of entering into legally binding agreements.',
          'You agree to use the platform only for lawful purposes and in a manner consistent with all applicable local, national, and international laws and regulations. You must not use our services to engage in fraudulent activity, harassment, or any conduct that could harm other users or third parties.',
          'We reserve the right to modify, suspend, or discontinue any part of the platform at any time without prior notice. We will not be liable to you or any third party for any such modifications.',
        ],
      },
      {
        heading: '2. User Responsibilities',
        body: [
          'When you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
          'You are solely responsible for all content you submit, post, or otherwise make available through our platform, including but not limited to reviews, listings, photos, and messages. You warrant that such content does not infringe any third-party rights and complies with our community guidelines.',
          'Hosts and service providers are responsible for the accuracy of their listings, availability, pricing, and for fulfilling bookings as agreed. Travelers are responsible for reviewing listing details carefully before booking and for adhering to any policies set by the host.',
        ],
      },
      {
        heading: '3. Intellectual Property',
        body: [
          'All content on the WeMongolia platform, including but not limited to text, graphics, logos, icons, images, and software, is the property of WeMongolia or its content suppliers and is protected by applicable intellectual property laws.',
          'You are granted a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial purposes. You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit any content from our platform without our express prior written consent.',
          'By submitting content to our platform, you grant WeMongolia a worldwide, royalty-free, non-exclusive license to use, reproduce, modify, and display that content in connection with the operation and promotion of our services.',
        ],
      },
      {
        heading: '4. Termination',
        body: [
          'We reserve the right to suspend or terminate your account and access to our platform at our sole discretion, with or without notice, for conduct that we believe violates these Terms of Service, is harmful to other users, us, or third parties, or for any other reason.',
          'You may terminate your account at any time by contacting us. Upon termination, your right to use the platform will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.',
          'We are not liable for any loss or damage arising from the termination of your account or access to our services.',
        ],
      },
      {
        heading: '5. Limitation of Liability',
        body: [
          'To the fullest extent permitted by applicable law, WeMongolia and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, arising out of or in connection with your use of the platform.',
          'Our total aggregate liability to you for any claims arising out of or relating to these Terms or the platform shall not exceed the greater of (a) the amount you paid to us in the twelve months preceding the claim or (b) USD 100.',
          'Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for certain types of damages. In such jurisdictions, our liability shall be limited to the maximum extent permitted by law.',
        ],
      },
    ],
    contact: 'If you have any questions about these Terms, please contact us at legal@wemongolia.com.',
  },
  mn: {
    title: 'Үйлчилгээний нөхцөл',
    updated: 'Сүүлд шинэчилсэн: 2025 оны 1-р сарын 1',
    intro:
      'Манай платформыг ашиглахаасаа өмнө Үйлчилгээний нөхцөлийг анхааралтай уншина уу. WeMongolia-г ашигласнаар та эдгээр нөхцөлийг хүлээн зөвшөөрч байна. Хэрэв та зөвшөөрөхгүй бол манай үйлчилгээг ашиглахгүй байна уу.',
    sections: [
      {
        heading: '1. Үйлчилгээ ашиглах',
        body: [
          'WeMongolia нь аялагчдыг Монголын орон нутгийн аялалын операторууд, байрлах газрын эзэд болон тээврийн үйлчилгээ үзүүлэгчидтэй холбосон онлайн зах зээл юм. Манай платформыг 18 насаа хүрсэн, хуулийн дагуу гэрээ байгуулах чадвартай хэрэглэгчид ашиглаж болно.',
          'Та платформыг зөвхөн хууль ёсны зорилгоор, холбогдох орон нутгийн, үндэсний болон олон улсын хуулийн хүрээнд ашиглахаа зөвшөөрч байна. Бусад хэрэглэгчид эсвэл гуравдагч этгээдэд хор хохирол учруулах үйлдэл хийхийг хориглоно.',
          'Бид урьдчилан мэдэгдэлгүйгээр платформын аль ч хэсгийг өөрчлөх, түдгэлзүүлэх, зогсоох эрхтэй. Ийм өөрчлөлтөөс үүдсэн хохирлыг бид хариуцахгүй.',
        ],
      },
      {
        heading: '2. Хэрэглэгчийн үүрэг хариуцлага',
        body: [
          'Та бүртгэл үүсгэсэн тохиолдолд нэвтрэх мэдээллийнхээ нууцлалыг хамгаалах болон бүртгэл дор явагдах бүх үйл ажиллагааны хариуцлагыг өөрөө хүлээнэ. Зөвшөөрөлгүй ашиглалтын талаар биднийг нэн даруй мэдэгдэнэ үү.',
          'Та платформ дээр оруулсан бүх контент — шүүмж, зар, зураг, мессежийг хамт оролцуулаад — хуулийн хүрээнд байх бөгөөд гуравдагч этгээдийн эрхийг зөрчихгүй байх хариуцлагыг дангаар хүлээнэ.',
          'Үйлчилгээ үзүүлэгчид зарынхаа үнэн зөв байдал, боломжит огноо, үнэ болон захиалгаа биелүүлэх хариуцлагыг хүлээнэ. Аялагчид захиалга хийхээсаа өмнө зарын дэлгэрэнгүй мэдээллийг нягтлан танилцах хариуцлагатай.',
        ],
      },
      {
        heading: '3. Оюуны өмч',
        body: [
          'WeMongolia платформ дээрх бүх контент — текст, зураг, логотип, дүрс болон программ хангамжийг оролцуулан — WeMongolia болон контент нийлүүлэгчдийн өмч бөгөөд холбогдох оюуны өмчийн хуулиар хамгаалагдсан.',
          'Та платформыг хувийн, арилжааны бус зорилгоор ашиглах хязгаарлагдмал, дамжуулшгүй лицензийг хүлээн авна. Манай тусгай бичгийн зөвшөөрөлгүйгээр ямар нэгэн контентыг хуулбарлах, тарааx, арилжааны зорилгоор ашиглахыг хориглоно.',
          'Та платформ руу контент оруулснаар WeMongolia-д тухайн контентыг үйлчилгээний хүрээнд ашиглах, нийтлэх, өөрчлөх дэлхий нийтийн, хоноро шаардахгүй лицензийг олгож байна.',
        ],
      },
      {
        heading: '4. Дансыг хаах',
        body: [
          'Бид эдгээр Нөхцөлийг зөрчсөн, бусад хэрэглэгч, бидэнд эсвэл гуравдагч этгээдэд хор учруулсан гэж үзвэл таны данс болон платформд нэвтрэх эрхийг урьдчилан мэдэгдэлгүйгээр зогсоох эрхтэй.',
          'Та биднийтэй холбогдож дансаа хэдийд ч хаалгаж болно. Данс хаагдсан үед платформ ашиглах эрх нэн даруй дуусгавар болно. Мөн чанараараа хэвээр үлдэх ёстой заалтууд — тухайлбал өмчлөлийн заалт, хариуцлагын хязгаарлалт — хүчин төгөлдөр хэвээр үлдэнэ.',
          'Бид таны данс, үйлчилгээнд нэвтрэх эрх зогссоноос үүдсэн алдагдал, хохирлыг хариуцахгүй.',
        ],
      },
      {
        heading: '5. Хариуцлагын хязгаарлалт',
        body: [
          'Холбогдох хуулиар зөвшөөрөгдсөн дээд хэмжээгээр WeMongolia болон түүний ажилтнууд нь платформ ашигласнаас үүдэлтэй шууд бус, тохиолдлын, тусгай болон дагалдах хохирлыг хариуцахгүй.',
          'Манай нийт хариуцлагын дээд хэмжээ нь (а) та нэхэмжлэлийн өмнөх 12 сарын хугацаанд манайд төлсөн дүн эсвэл (б) 100 USD-аас аль ихийг нь бодлогоор тооцно.',
          'Зарим улс орны хуулиар тодорхой хариуцлагын хязгаарлалтыг зөвшөөрдөггүй. Ийм тохиолдолд бид хуулиар зөвшөөрөгдөх дээд хэмжээгээр хариуцлага хүлээнэ.',
        ],
      },
    ],
    contact: 'Эдгээр Нөхцөлтэй холбоотой асуулт байвал legal@wemongolia.com хаягаар бидэнтэй холбогдоно уу.',
  },
}

type Lang = 'en' | 'mn'

export default function TermsPage() {
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
