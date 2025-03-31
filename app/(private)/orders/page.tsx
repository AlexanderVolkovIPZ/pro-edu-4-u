'use client';

import { useQueryParams } from '@/app/hooks/use-query-params';
import { useOrdersByFilter } from '@/app/queries/order';
import Container from '@/components/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import Header from './_components/header';
import Table from './_components/table';
import { orderTabsList } from './_shared/lists/order-tab-list';

const ShippingPage = () => {
  const [activeTab, setActiveTab] = useState(orderTabsList[0].route);

  const { params, setParams } = useQueryParams({
    page: 1,
    limit: 10,
    loadForCurrentUser: true,
    tab: orderTabsList[0].route,
  });

  const { data: { orders = [], total = 0, totalPages = 0, limit = 0 } = {}, isFetching } = useOrdersByFilter({
    filters: {
      page: params.page,
      limit: params.limit,
      tab: activeTab,
    },
    options: {
      staleTime: 1000 * 60 * 3,
    },
  });

  return (
    <Container>
      <Header />

      <Tabs value={activeTab} className='mt-3' onValueChange={(tab) => setActiveTab(tab)}>
        <TabsList className='grid w-full grid-cols-3'>
          {orderTabsList.map((tab) => (
            <TabsTrigger key={tab.route} value={tab.route}>
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value='all-orders'>
          <Table
            isFetching={isFetching}
            orders={orders}
            limit={limit}
            total={total}
            totalPages={totalPages}
            page={params.page}
            setPage={(page) => setParams({ ...params, page })}
          />
        </TabsContent>

        <TabsContent value='my-orders'>
          <Table
            isFetching={isFetching}
            orders={orders}
            limit={limit}
            total={total}
            totalPages={totalPages}
            page={params.page}
            setPage={(page) => setParams({ ...params, page })}
          />
        </TabsContent>

        <TabsContent value='sent-orders'>
          <Table
            isFetching={isFetching}
            orders={orders}
            limit={limit}
            total={total}
            totalPages={totalPages}
            page={params.page}
            setPage={(page) => setParams({ ...params, page })}
          />
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default ShippingPage;
