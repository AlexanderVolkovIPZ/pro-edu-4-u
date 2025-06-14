'use client';

import Container from '@/components/container';
import Header from './_components/header';
import { useContext } from 'react';
import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { UserRole } from '@prisma/client';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

const DashboardStats = dynamic(() => import('./_components/dashboard-stats'), { ssr: false });

const DashboardPage = () => {
  const authUser = useContext(AuthUserContext);
  if (authUser?.role !== UserRole.ADMIN) {
    notFound();
  }

  return (
    <Container>
      <Header />
      <DashboardStats />
    </Container>
  );
};

export default DashboardPage;
