"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  signInDefaultValues,
  signInSchema,
  type SignInFormValues,
} from "@som-brain-turbo/validators";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "./auth-client";

export function useSignInForm() {
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onBlur",
    shouldUnregister: true,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
          toast.success("Sign in successful");
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      },
    );
  });

  return {
    form,
    onSubmit,
  } as const;
}
