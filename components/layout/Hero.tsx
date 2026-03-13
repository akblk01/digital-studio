"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Camera } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#0F0F1A] pb-32 pt-40 z-0">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-[-1] pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#6C63FF]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF6584]/20 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-[#2A2A3E] bg-[#1A1A2E]/50 px-3 py-1 text-sm text-[#A0A0B0] backdrop-blur-xl"
          >
            <Sparkles className="mr-2 h-4 w-4 text-[#FF6584]" />
            <span className="font-medium">TexStudio AI 1.0 Yayında</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Tek tıkla <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#FF6584]">moda kataloğunuz</span> hazır.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-lg text-[#A0A0B0] sm:text-xl"
          >
            Sadece cep telefonunuzla çektiğiniz bir ürün fotoğrafını yükleyin. Yapay zeka, onu profesyonel mankenlerin üzerinde büyüleyici bir katalog görseline dönüştürsün.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8"
          >
            <Button asChild size="lg" className="h-14 px-8 bg-[#6C63FF] hover:bg-[#5b54d6] text-white rounded-full group">
              <Link href="/studio">
                <Camera className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Hemen Üretmeye Başla
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full border-[#2A2A3E] bg-transparent hover:bg-[#1A1A2E] text-white">
              <Link href="/gallery">
                Örnekleri İncele
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Muted grid background */}
      <div className="absolute inset-0 z-[-2] h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}
