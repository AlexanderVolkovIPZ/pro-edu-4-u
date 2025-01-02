import AppHeader from '@/app/(private)/_components/app-header';
import Footer from '@/app/(private)/_components/footer';
import Sidebar from '@/app/(private)/_components/sidebar';
import { redirect } from 'next/navigation';
import getAuthUser from '../actions/get-auth-user';
import { AuthUserProvider } from '../providers/auth-user-provider';

const HomeLayout = async ({ children }: { children: React.ReactNode }) => {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/sign-in');
  }

  return (
    <AuthUserProvider authUser={authUser}>
      <div className='flex flex-col min-h-screen'>
        <div className='fixed h-20 w-full sm:pl-40 max-w-7xl z-50'>
          <AppHeader />
        </div>
        <div className='fixed h-full w-40 hidden sm:block'>
          <Sidebar />
        </div>
        <div className='flex-1 mt-20 sm:ml-40'>{children}</div>
        <div className='ml-40'>
          <Footer />
        </div>
      </div>
    </AuthUserProvider>
  );
};

export default HomeLayout;
