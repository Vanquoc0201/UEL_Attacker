"use client";
import ForensicsClient from "@/components/forensics/ForensicsClient";
interface ForensicsPageProps {
  params: {
    id: string;
  };
}
export default function ForensicsPage({ params }: ForensicsPageProps) {
  return (
    <ForensicsClient transactionId={params.id} />
  );
}