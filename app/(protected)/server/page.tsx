import { UserInfo } from "@/components/user-info";
import { currentUser } from "@/lib/auth";

export default async function ServerPage() {
  const user = await currentUser();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <UserInfo user={user} label="Server component" />
    </div>
  );
}