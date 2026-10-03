import Registration from "@/components/Registration";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Register - BioByte",
};

export default function RegisterPage() {
  return (
    <main className="page-body register-page">
      <header className="register-page-head">
        <div className="container register-page-head-inner">
          <Link href="/" className="back-home"><ArrowLeft size={15} /> Return to BioByte</Link>
          <span><ShieldCheck size={15} /> Secure registration channel</span>
        </div>
      </header>
      <Registration />
    </main>
  );
}
