import { useState } from 'react';

type UserInfoType = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: string;
}[];

export const useSortUsers = ({ users }: { users: UserInfoType }) => {
  const [sortBy, setSortBy] = useState(['createdAt']);
  const [sortDirection, setSortDirection] = useState<Record<string, 'asc' | 'desc'>>({
    name: 'desc',
    createdAt: 'desc',
    emailVerified: 'desc',
  });

  const sortedUsers = users.sort((a, b) => {
    const createdDateA = new Date(a.createdAt);
    const createdDateB = new Date(b.createdAt);

    const emailVerifiedA = new Date(a.emailVerified);
    const emailVerifiedB = new Date(b.emailVerified);

    const lastField = sortBy[sortBy.length - 1];

    if (sortBy.includes('name') && lastField === 'name') {
      return sortDirection['name'] === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (sortBy.includes('createdAt') && lastField === 'createdAt') {
      const dateA = a.createdAt ? createdDateA.getTime() : 0;
      const dateB = b.createdAt ? createdDateB.getTime() : 0;

      return sortDirection['createdAt'] === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy.includes('verifiedAt') && lastField === 'verifiedAt') {
      const dateA = a.emailVerified ? emailVerifiedA.getTime() : 0;
      const dateB = b.emailVerified ? emailVerifiedB.getTime() : 0;

      return sortDirection['verifiedAt'] === 'asc' ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });

  return { sortedUsers, sortBy, setSortBy, sortDirection, setSortDirection };
};
