import { NextRequest } from 'next/server';
import getAuthUser from './app/actions/get-auth-user';
import { NextResponse } from 'next/server';

export const config = { matcher: ['/((?!sign-in|sign-up|(?!ws$)).*)'] };

export async function middleware(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || !authUser.isActive) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}
