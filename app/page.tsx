import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home-client";
import { listDataItems } from "@/server-action/file.upload.server";

export default async function Home() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    redirect("/sign-in");
  }
  const items = await listDataItems(userId);
  return <HomeClient initialItems={items} />;
}
