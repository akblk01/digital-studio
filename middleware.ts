import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Auth sayfaları — middleware Supabase işlemi yapma, doğrudan geç
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next()
  }

  // Korumalı rotalar
  const protectedPaths = ['/studio', '/gallery', '/profile', '/billing']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Sadece korumalı rotalar için Supabase auth kontrolü yap
  let supabaseResponse = NextResponse.next({ request })
  
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch (e) {
    // getUser() başarısız = auth geçersiz → login'e yönlendir
    // Stale cookie fallback KALDIRILDI — güvenlik açığı yaratıyordu
    console.warn('Middleware auth failed:', (e as Error).message)
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
