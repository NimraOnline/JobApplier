import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Create the initial response
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Initialize Supabase with the UNIQUE COOKIE NAME
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // <--- THIS IS THE KEY FIX FOR YOUR 403 ERROR
      cookieOptions: {
        name: 'employee-auth-token', 
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update the request cookies so they are available immediately
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Update the response object (handling the session refresh)
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

  // 3. Check Auth
  // IMPORTANT: Do not protect static assets or API routes here to save performance
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isDashboard = url.pathname.startsWith('/dashboard')
  const isLoginPage = url.pathname.startsWith('/login')
  const isRoot = url.pathname === '/'

  // -----------------------------------------------------------
  // ROUTING LOGIC
  // -----------------------------------------------------------

  // A. Root Path -> Redirect based on auth
  if (isRoot) {
    url.pathname = user ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  // B. Dashboard Access -> Requires User + Employee Role
  if (isDashboard) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Role Check (Only runs if user is trying to access dashboard)
    // Note: Fetching DB in middleware adds latency. 
    // Ideally, keep this minimal or use Custom Claims.
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isEmployee = profile && ['employee', 'manager', 'admin'].includes(profile.role)

    if (!isEmployee) {
      // Access Denied: Sign out and kick to login
      await supabase.auth.signOut()
      url.pathname = '/login'
      url.searchParams.set('message', 'Access denied. Employees only.')
      
      // We must return a redirect that *also* clears the cookies
      // (The signOut call above updated 'supabaseResponse', but NextResponse.redirect creates a NEW response)
      const redirectResponse = NextResponse.redirect(url)
      
      // Copy cookies from supabaseResponse to the redirect (CRITICAL FIX)
      const cookiesToSet = supabaseResponse.cookies.getAll()
      cookiesToSet.forEach(cookie => redirectResponse.cookies.set(cookie))
      
      return redirectResponse
    }
  }

  // C. Login Page -> If already logged in, go to Dashboard
  if (isLoginPage && user) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // D. Return the response (carrying any session updates)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
