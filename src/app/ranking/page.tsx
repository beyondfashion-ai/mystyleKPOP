import { redirect } from "next/navigation";

export default function RankingPage() {
  redirect("/gallery?tab=ranking");
}
