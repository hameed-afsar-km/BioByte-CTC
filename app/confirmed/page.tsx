import { Suspense } from "react";
import ConfirmationTicket from "@/components/ConfirmationTicket";

export const metadata = {
  title: "Registration Pass",
};

export default function ConfirmedPage() {
  return (
    <main className="page-body">
      <Suspense fallback={<div className="page-loading">Decoding pass…</div>}>
        <ConfirmationTicket />
      </Suspense>
    </main>
  );
}