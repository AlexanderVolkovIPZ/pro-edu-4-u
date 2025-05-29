import getAuthUser from './app/actions/get-auth-user';
import { NextResponse } from 'next/server';

export const config = { matcher: ['/((?!sign-in|sign-up|(?!ws$)).*)'] };

export async function middleware() {
  try {
    const authUser = await getAuthUser();

    if (!authUser || !authUser.isActive) {
      return NextResponse.redirect(new URL('/sign-in'));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/sign-in'));
  }
}
