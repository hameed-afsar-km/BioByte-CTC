import AdminDashboard from "@/components/AdminDashboard";

export const metadata = {
  title: "Organiser Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}