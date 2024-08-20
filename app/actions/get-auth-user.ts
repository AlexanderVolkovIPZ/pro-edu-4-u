import { getServerSession } from "next-auth";

export default async function getAuthUser() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await prismaDb?.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
    if (!currentUser) {
      return null;
    }

    return currentUser;
  } catch {
    return null;
  }
}
