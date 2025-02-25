'use client';

import Container from '@/components/container';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const CoursesPage = () => {
  const router = useRouter();
  return (
    <Container>
      <div className='flex items-center justify-between'>
        <Button onClick={() => router.push('/auctions/create')}>Create new auction</Button>
        <div>Pagination</div>
      </div>
    </Container>
  );
};

export default CoursesPage;
