import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 pb-24 md:pb-0 px-4 py-6 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </>
  );
}
