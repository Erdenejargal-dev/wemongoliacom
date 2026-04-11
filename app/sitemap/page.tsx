'use client'

import { useState } from 'react'
import Link from 'next/link'

const content = {
  en: {
    title: 'Sitemap',
    subtitle: 'Everything on WeMongolia, in one place.',
    groups: [
      {
        heading: 'Main',
        links: [
          { label: 'Home', href: '/', description: 'Start your Mongolian journey' },
          { label: 'Explore', href: '/explore', description: 'Discover all experiences and stays' },
          { label: 'Destinations', href: '/destinations', description: 'Browse Mongolia by region' },
          { label: 'Tours & Experiences', href: '/tours', description: 'Find unique local tours' },
          { label: 'Stays', href: '/stays', description: 'Book camps, gers, and lodges' },
        ],
      },
      {
        heading: 'Hosting',
        links: [
          { label: 'Become a Host', href: '/onboarding', description: 'List your tour or property' },
          { label: 'Business Portal', href: '/dashboard/business', description: 'Manage your listings and bookings' },
          { label: 'Provider Resources', href: '/help/provider-guidelines', description: 'Guidelines for hosts and operators' },
          { label: 'Hosting Standards', href: '/help/standards', description: 'Quality and safety expectations' },
        ],
      },
      {
        heading: 'Account',
        links: [
          { label: 'Sign In', href: '/auth/login', description: 'Access your account' },
          { label: 'Register', href: '/auth/register', description: 'Create a new account' },
          { label: 'Dashboard', href: '/dashboard', description: 'View your bookings and trips' },
        ],
      },
      {
        heading: 'Support',
        links: [
          { label: 'Help Center', href: '/help', description: 'Browse common questions and guides' },
          { label: 'Booking Support', href: '/help/bookings', description: 'Help with reservations' },
          { label: 'Trust & Safety', href: '/trust', description: 'How we keep our community safe' },
          { label: 'Cancellation Policy', href: '/help/cancellation', description: 'Understand refund and cancellation rules' },
          { label: 'Contact', href: '/contact', description: 'Reach our support team' },
        ],
      },
      {
        heading: 'Company',
        links: [
          { label: 'About', href: '/about', description: 'Our story and mission' },
          { label: 'Our Mission', href: '/about#mission', description: 'Why we built WeMongolia' },
          { label: 'Partnerships', href: '/partnerships', description: 'Work with us' },
        ],
      },
      {
        heading: 'Legal',
        links: [
          { label: 'Terms of Service', href: '/terms', description: 'Rules for using our platform' },
          { label: 'Privacy Policy', href: '/privacy', description: 'How we handle your data' },
          { label: 'Cookie Policy', href: '/cookies', description: 'How we use cookies' },
          { label: 'Sitemap', href: '/sitemap', description: 'You are here' },
        ],
      },
    ],
  },
  mn: {
    title: 'Сайтын зураглал',
    subtitle: 'WeMongolia дээрх бүх зүйл нэг дор.',
    groups: [
      {
        heading: 'Үндсэн',
        links: [
          { label: 'Нүүр хуудас', href: '/', description: 'Монголын аялалаа эхлүүл' },
          { label: 'Судлах', href: '/explore', description: 'Бүх туршлага, байрлах газрыг нээх' },
          { label: 'Газар нутаг', href: '/destinations', description: 'Монголыг бүс нутгаар хайх' },
          { label: 'Аялал & Туршлага', href: '/tours', description: 'Орон нутгийн аялал олох' },
          { label: 'Байрлах газар', href: '/stays', description: 'Гэр, майхан, зочид буудал захиалах' },
        ],
      },
      {
        heading: 'Хостинг',
        links: [
          { label: 'Хост болох', href: '/onboarding', description: 'Аялал, байршлаа жагсаах' },
          { label: 'Бизнесийн портал', href: '/dashboard/business', description: 'Зар болон захиалгаа удирдах' },
          { label: 'Нийлүүлэгчийн нөөц', href: '/help/provider-guidelines', description: 'Хост болон операторуудад зориулсан удирдамж' },
          { label: 'Хостингийн стандарт', href: '/help/standards', description: 'Чанар болон аюулгүй байдлын шаардлага' },
        ],
      },
      {
        heading: 'Данс',
        links: [
          { label: 'Нэвтрэх', href: '/auth/login', description: 'Дансандаа нэвтрэх' },
          { label: 'Бүртгүүлэх', href: '/auth/register', description: 'Шинэ данс үүсгэх' },
          { label: 'Хянах самбар', href: '/dashboard', description: 'Захиалга болон аяллаа харах' },
        ],
      },
      {
        heading: 'Дэмжлэг',
        links: [
          { label: 'Тусламжийн төв', href: '/help', description: 'Нийтлэг асуулт болон гарын авлага' },
          { label: 'Захиалгын дэмжлэг', href: '/help/bookings', description: 'Захиалгатай холбоотой тусламж' },
          { label: 'Итгэлцэл & Аюулгүй байдал', href: '/trust', description: 'Бидний нийгэмлэгийг хэрхэн хамгаалдаг' },
          { label: 'Цуцлалтын бодлого', href: '/help/cancellation', description: 'Буцаалт болон цуцлалтын дүрэм' },
          { label: 'Холбоо барих', href: '/contact', description: 'Манай дэмжлэгийн багтай холбогдох' },
        ],
      },
      {
        heading: 'Компани',
        links: [
          { label: 'Бидний тухай', href: '/about', description: 'Манай түүх ба эрхэм зорилго' },
          { label: 'Манай эрхэм зорилго', href: '/about#mission', description: 'WeMongolia-г яагаад байгуулсан' },
          { label: 'Хамтын ажиллагаа', href: '/partnerships', description: 'Бидэнтэй хамтарч ажиллах' },
        ],
      },
      {
        heading: 'Хууль эрх зүй',
        links: [
          { label: 'Үйлчилгээний нөхцөл', href: '/terms', description: 'Платформ ашиглах дүрэм' },
          { label: 'Нууцлалын бодлого', href: '/privacy', description: 'Өгөгдлийг хэрхэн зохицуулдаг' },
          { label: 'Күүкийн бодлого', href: '/cookies', description: 'Күүки хэрхэн ашигладаг' },
          { label: 'Сайтын зураглал', href: '/sitemap', description: 'Та энд байна' },
        ],
      },
    ],
  },
}

type Lang = 'en' | 'mn'

export default function SitemapPage() {
  const [lang, setLang] = useState<Lang>('en')
  const t = content[lang]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">

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
        <div className="mb-16 pb-8 border-b border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">{t.title}</h1>
          <p className="text-base text-gray-400">{t.subtitle}</p>
        </div>

        {/* Link Groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {t.groups.map(group => (
            <section key={group.heading} aria-label={group.heading}>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-indigo-500 mb-5">
                {group.heading}
              </h2>
              <ul className="space-y-4">
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex flex-col gap-0.5"
                    >
                      <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors duration-150">
                        {link.label}
                      </span>
                      <span className="text-xs text-gray-400 leading-relaxed">
                        {link.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

      </div>
    </main>
  )
}
