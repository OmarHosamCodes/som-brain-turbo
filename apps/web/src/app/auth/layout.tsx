export default function Layout({ children }: React.PropsWithChildren) {
	return (
		<div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center overflow-y-hidden p-6">
			{children}
		</div>
	);
}
