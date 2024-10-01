type TabPageHeaderProps = {
  title: string;
  description: string;
};

const TabPageHeader = ({ title, description }: TabPageHeaderProps) => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium text-rose-400'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
      <div className='shrink-0 bg-border h-[1px] w-full'></div>
    </div>
  );
};

export default TabPageHeader;
