import Footer from '@/app/(auth)/_components/footer';
import Header from '@/app/(auth)/_components/header';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <div className='flex flex-1 justify-center items-center'>{children}</div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
