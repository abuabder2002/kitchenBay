import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_ROUTES = ['/checkout', '/payment', '/orders/create'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bypass proxy/session checks for API routes to dramatically improve site performance
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const { supabaseResponse, supabase } = await updateSession(request);

  // Defensive check in case Supabase isn't properly configured
  if (!supabase || !supabase.auth) {
    return supabaseResponse;
  }

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  
  if (isProtected) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      url.searchParams.set('message', 'checkout');
      return NextResponse.redirect(url);
    }
  }

  // If request is for an admin route, verify the user is an admin
  if (pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    
    // Check if user email is an admin email
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com';
    const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());
    // Add hardcoded admins for safety
    adminEmails.push('kitchenbaypvtltd@gmail.com', 'abdershaheen4@gmail.com', 'yousufsuhaily@gmail.com', 'kitchenbaythehomeneeds@gmail.com');
    
    const userEmail = user.email?.toLowerCase();
    if (!userEmail || !adminEmails.includes(userEmail)) {
      // Redirect unauthorized users to home page
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { supabaseResponse, supabase: {} as any };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if needed
  if (supabase.auth) {
    await supabase.auth.getUser();
  }

  return { supabaseResponse, supabase };
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public asset images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
