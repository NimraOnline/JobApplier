// middleware.ts
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

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // A. Root Path logic
  if (url.pathname === '/') {
    url.pathname = user ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  // B. Dashboard Protection
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // ROLE CHECK
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error("MIDDLEWARE DB ERROR:", error.message, "Code:", error.code)
    }
    console.log("MIDDLEWARE CHECK:", { 
      email: user.email, 
      id: user.id, 
      roleFound: profile?.role || 'NULL' 
    })

    const isEmployee = profile && ['employee', 'manager', 'admin'].includes(profile.role)

    if (!isEmployee) {
      const reason = profile ? `Role is ${profile.role}` : (error ? `DB Error: ${error.code}` : "Profile not found")
      url.pathname = '/login'
      url.searchParams.set('message', `Access denied. (${reason})`)
      return NextResponse.redirect(url)
    }
  }

  // C. Login Page logic – FIXED
  if (url.pathname.startsWith('/login') && user) {
    // Only redirect to dashboard if the user is an employee
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile && ['employee', 'manager', 'admin'].includes(profile.role)) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    // Otherwise stay on login page (no redirect)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
