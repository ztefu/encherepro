import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone();

  // If user is not authenticated
  if (!user) {
    // If user accesses the secret login URL, rewrite to the actual login page
    if (url.pathname === '/jeny') {
      url.pathname = '/admin/login';
      return NextResponse.rewrite(url);
    }

    // Block any direct access to /admin or /login routes (except password reset)
    if (
      url.pathname === '/login' || 
      (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/reset-password'))
    ) {
      url.pathname = '/404'; // Rewrite to a non-existent route to trigger a 404
      return NextResponse.rewrite(url);
    }
  }

  // If user is authenticated
  if (user) {
    // If trying to access the login page or the secret URL, redirect to dashboard
    if (url.pathname === '/jeny' || url.pathname.startsWith('/admin/login')) {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
