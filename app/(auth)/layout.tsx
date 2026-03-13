import Header from "@/components/layout/Header"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full bg-[#0F0F1A]">
        {children}
      </main>
    </div>
  )
}
