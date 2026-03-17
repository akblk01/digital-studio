"use client"

import {
  LineChart,
  Shirt,
  Sparkles,
  Zap
} from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

export function Features() {
  const { t } = useTranslation()

  const features = [
    {
      name: t('feature_speed_title'),
      description: t('feature_speed_desc'),
      icon: Zap,
    },
    {
      name: t('feature_fabric_title'),
      description: t('feature_fabric_desc'),
      icon: Shirt,
    },
    {
      name: t('feature_ai_title'),
      description: t('feature_ai_desc'),
      icon: Sparkles,
    },
    {
      name: t('feature_sales_title'),
      description: t('feature_sales_desc'),
      icon: LineChart,
    },
  ]

  return (
    <div className="bg-[#0F0F1A] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-[#FF6584]">{t('features_section_badge')}</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('features_section_title')}
          </p>
          <p className="mt-6 text-lg leading-8 text-[#A0A0B0]">
            {t('features_section_subtitle')}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C63FF]">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-[#A0A0B0]">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
