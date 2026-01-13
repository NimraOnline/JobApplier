import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Create the Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // This ensures the auth cookie is persisted in the response
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Get the user (this refreshes the session if needed)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // -----------------------------------------------------------------
  // PROTECTION LOGIC
  // -----------------------------------------------------------------

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isRootPath = request.nextUrl.pathname === '/'

  if (isRootPath) {
    const url = request.nextUrl.clone()
    if (user) {
      url.pathname = '/dashboard'
    } else {
      url.pathname = '/login'
    }
    return NextResponse.redirect(url)
  }

  // Case A: User is NOT logged in and tries to access Dashboard
  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Case B: User IS logged in, but we need to check if they are an Employee
  if (user && isDashboardRoute) {
    // Fetch the user profile to check the role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isEmployee = profile && ['employee', 'manager', 'admin'].includes(profile.role)

    if (!isEmployee) {
      // Access Denied: Sign them out and send back to login
      await supabase.auth.signOut()
      
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('message', 'Access denied. Employees only.')
      return NextResponse.redirect(url)
    }
  }

  // Case C: User is already logged in but tries to visit Login page
  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes, optional if you want to protect them too)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
