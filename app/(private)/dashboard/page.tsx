'use client';

import Container from '@/components/container';
import DashboardStats from './_components/dashboard-stats';
import Header from './_components/header';
import { useContext } from 'react';
import { AuthUserContext } from '@/app/providers/auth-user-provider';
import { UserRole } from '@prisma/client';
import { notFound } from 'next/navigation';

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
