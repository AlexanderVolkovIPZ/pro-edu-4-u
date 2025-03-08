import Container from '@/components/container';
import DashboardStats from './_components/dashboard-stats';
import Header from './_components/header';

const DashboardPage = () => {
  return (
    <Container>
      <Header />
      <DashboardStats />
    </Container>
  );
};

export default DashboardPage;
