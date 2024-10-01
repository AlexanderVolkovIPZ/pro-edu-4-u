const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className='
            max-w-[2520px]
            2xl:px-16
            xl:px-12
            lg:px-10
            md:px-8
            sm:px-6
            px-4
            py-4
            '
    >
      {children}
    </div>
  );
};

export default Container;
