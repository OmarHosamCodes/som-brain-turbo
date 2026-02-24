export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div className="mx-auto w-full max-w-md min-h-screen p-6 flex items-center justify-center overflow-y-hidden">
      {children}
    </div>
  );
}
