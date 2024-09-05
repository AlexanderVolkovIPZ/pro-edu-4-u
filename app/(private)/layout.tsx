import Header from '@/app/(private)/_components/header';
import Footer from '@/app/(private)/_components/footer';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <div className='flex flex-1 justify-center items-center'>{children}</div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
