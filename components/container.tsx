const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="
            mx-w-[2520px]
            mx-auto 
            2xl:px-5
            xl:px-4
            lg:px-3
            md:px-2
            sm:px-1
            "
    >
      {children}
    </div>
  );
};

export default Container;
