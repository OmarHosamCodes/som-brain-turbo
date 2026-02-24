"use client";

import { useAuthSession, useSignUpForm } from "@som-brain-turbo/hooks";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GridBackground } from "./backgrounds/grid-background";
import Loader from "./loader";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const { isPending } = useAuthSession();
	const { form, onSubmit, onGoogleSignUp } = useSignUpForm();
	const {
		register,
		formState: { errors, isSubmitting },
	} = form;

	if (isPending) {
		return <Loader />;
	}

	return (
		<>
			<form onSubmit={onSubmit} className="space-y-4">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader className="text-center">
							<CardTitle className="text-xl">Signup</CardTitle>
							<CardDescription>Signup with your account</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<Button
										variant="outline"
										type="button"
										onClick={onGoogleSignUp}
										disabled={isSubmitting}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<title>Google</title>
											<path
												d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
												fill="currentColor"
											/>
										</svg>
										Continue with Google
									</Button>
								</Field>
								<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
									Or continue with
								</FieldSeparator>
								<Field data-invalid={Boolean(errors.name)}>
									<FieldLabel htmlFor="name">Name</FieldLabel>
									<Input
										id="name"
										type="text"
										placeholder="Your name"
										autoComplete="name"
										aria-invalid={Boolean(errors.name)}
										{...register("name")}
									/>
									<FieldError errors={[errors.name]} />
								</Field>
								<Field data-invalid={Boolean(errors.email)}>
									<FieldLabel htmlFor="email">Email</FieldLabel>
									<Input
										id="email"
										type="email"
										placeholder="m@example.com"
										autoComplete="email"
										aria-invalid={Boolean(errors.email)}
										{...register("email")}
									/>
									<FieldError errors={[errors.email]} />
								</Field>
								<Field className="grid grid-cols-2 gap-4">
									<Field data-invalid={Boolean(errors.password)}>
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<Input
											id="password"
											type="password"
											autoComplete="new-password"
											aria-invalid={Boolean(errors.password)}
											{...register("password")}
										/>
										<FieldError errors={[errors.password]} />
									</Field>
									<Field data-invalid={Boolean(errors.confirmPassword)}>
										<FieldLabel htmlFor="confirm-password">
											Confirm Password
										</FieldLabel>
										<Input
											id="confirm-password"
											type="password"
											autoComplete="new-password"
											aria-invalid={Boolean(errors.confirmPassword)}
											{...register("confirmPassword")}
										/>
										<FieldError errors={[errors.confirmPassword]} />
									</Field>
								</Field>
								<FieldDescription>
									Must be at least 8 characters long.
								</FieldDescription>
								<Field>
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Creating account..." : "Sign up"}
									</Button>
									<Button
										type="button"
										onClick={onSwitchToSignIn}
										variant="ghost"
										size="xs"
										className="mx-auto max-w-min text-center"
									>
										Already have an account? Login
									</Button>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>
					<FieldDescription className="px-6 text-center">
						By clicking continue, you agree to our{" "}
						<a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
					</FieldDescription>
				</div>
			</form>
			<GridBackground />
		</>
	);
}
