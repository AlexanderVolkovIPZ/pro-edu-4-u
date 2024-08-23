const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <div>HEADER</div>
      <div className='flex flex-1 justify-center items-center'>{children}</div>
      <div>FOOTER</div>
    </div>
  );
};

export default AuthLayout;
