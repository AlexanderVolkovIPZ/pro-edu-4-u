import { TabsList as TabsListComponent, TabsTrigger } from '@/components/ui/tabs';
import { tabsList as list } from '../../../../_shared/lists/overview-tab-list';

type TabsListProps = {
  shouldHideTabsNamesList: (typeof list)[number]['name'][];
};

const TabsList = ({ shouldHideTabsNamesList }: TabsListProps) => {
  return (
    <TabsListComponent className='w-full mb-2'>
      {list
        .filter(({ name }) => !shouldHideTabsNamesList.includes(name))
        .map(({ name, route }) => (
          <TabsTrigger key={route} value={route} className='w-full'>
            {name}
          </TabsTrigger>
        ))}
    </TabsListComponent>
  );
};

export default TabsList;
