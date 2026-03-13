"use client"

import {
  LineChart,
  Shirt,
  Sparkles,
  Zap
} from "lucide-react"

const features = [
  {
    name: "Hızlı Üretim",
    description: "Yalnızca birkaç dakika içinde 20 farklı varyasyonla yüksek çözünürlüklü görseller elde edin.",
    icon: Zap,
  },
  {
    name: "Eksiksiz Kumaş Transferi",
    description: "Giysinin dokusu, desenleri ve en ince detayları olduğu gibi mankene geçirilir.",
    icon: Shirt,
  },
  {
    name: "Yapay Zeka Destekli Modeller",
    description: "Fal.ai ve gelişmiş difüzyon modelleri sayesinde gerçek bir fotoğraf stüdyosu kalitesini yakalayın.",
    icon: Sparkles,
  },
  {
    name: "Satışlarınızı Artırın",
    description: "Profesyonel kataloglar oluşturarak müşterilerinizin satın alma kararına doğrudan etki edin.",
    icon: LineChart,
  },
]

export function Features() {
  return (
    <div className="bg-[#0F0F1A] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-[#FF6584]">Daha Hızlı Çalışın</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Her Şey Bir Fotoğrafla Başlar
          </p>
          <p className="mt-6 text-lg leading-8 text-[#A0A0B0]">
            Pahalı fotoğraf çekimlerine, manken kiralamaya ve günlerce süren teslimatlara son. TexStudio AI ile dakikalar içinde hazır olun.
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
