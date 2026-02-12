import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
  // We need to know the role to prevent the redirect loop
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
    
    // Check if role is valid for this portal
    isEmployee = profile && ['employee', 'manager', 'admin'].includes(profile.role)
  }

  // A. Root Path logic
  if (url.pathname === '/') {
    // If they are logged in AND an employee, go to dashboard. Otherwise login.
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
      // LOGIC FIX: User is logged in, but not an employee.
      // We explicitly allow them to fall through to the login page (via redirect)
      // instead of looping.
      const reason = profile ? `Role is ${profile.role}` : (profileError ? `DB Error` : "Profile not found")
      
      url.pathname = '/login'
      url.searchParams.set('message', `Access denied. (${reason})`)
      return NextResponse.redirect(url)
    }
  }

  // C. Login Page logic (The Fix)
  if (url.pathname.startsWith('/login') && user) {
    // CRITICAL FIX: Only redirect to dashboard if they are actually an employee.
    // If they are a 'client', DO NOT redirect them back to dashboard, 
    // allow them to see the login page (which might show an error or a sign out button).
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
