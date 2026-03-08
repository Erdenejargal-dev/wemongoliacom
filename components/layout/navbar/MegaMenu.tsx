'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  label: string
  href: string
  description?: string
  icon?: LucideIcon
}

interface MenuSection {
  title: string
  icon: LucideIcon
  items: readonly MenuItem[]
}

interface MegaMenuProps {
  sections: readonly MenuSection[]
}

export function MegaMenu({ sections }: MegaMenuProps) {
  return (
    <div className={cn(
      'absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50',
      'pointer-events-none opacity-0 translate-y-1',
      'group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0',
      'transition-all duration-200 ease-out'
    )}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        style={{ minWidth: `${sections.length * 220}px`, maxWidth: '780px' }}>
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className={`grid p-6 gap-8`}
          style={{ gridTemplateColumns: `repeat(${sections.length}, 1fr)` }}>
          {sections.map((section) => {
            const SectionIcon = section.icon
            return (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-3">
                  <SectionIcon className="w-3.5 h-3.5 text-green-500" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{section.title}</p>
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const ItemIcon = 'icon' in item ? item.icon as LucideIcon : undefined
                    return (
                      <li key={item.label}>
                        <Link href={item.href}
                          className="group/item flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                          {ItemIcon && (
                            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-green-100 transition-colors">
                              <ItemIcon className="w-3.5 h-3.5 text-green-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover/item:text-green-700 transition-colors leading-tight">
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{item.description}</p>
                            )}
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
