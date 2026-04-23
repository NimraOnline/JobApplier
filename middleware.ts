import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // --- BYPASS START: Skip all auth logic ---
  return supabaseResponse;
  // --- BYPASS END ---

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: 'employee-auth-token' },
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

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // 2. Pre-fetch Role (Optimization for Phase 1 Logic)
  let isEmployee = false
  let profile = null
  let profileError = null

  if (user) {
    const result = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    profile = result.data
    profileError = result.error
    isEmployee = profile && ['employee', 'manager', 'admin'].includes(profile.role)
  }

  // A. Root Path logic
  if (url.pathname === '/') {
    url.pathname = (user && isEmployee) ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  // B. Dashboard Protection
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (!isEmployee) {
      url.pathname = '/login'
      url.searchParams.set('message', `Access denied.`)
      return NextResponse.redirect(url)
    }
  }

  // C. Login Page logic
  if (url.pathname.startsWith('/login') && user) {
    if (isEmployee) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
