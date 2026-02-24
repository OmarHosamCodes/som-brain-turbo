"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  signUpDefaultValues,
  signUpPayloadSchema,
  signUpSchema,
  type SignUpFormValues,
} from "@som-brain-turbo/validators";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "./auth-client";

export function useSignUpForm() {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onBlur",
    shouldUnregister: true,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = signUpPayloadSchema.parse(values);

    await authClient.signUp.email(payload, {
      onSuccess: () => {
        router.push("/dashboard");
        toast.success("Sign up successful");
      },
      onError: (error) => {
        toast.error(error.error.message || error.error.statusText);
      },
    });
  });

  return {
    form,
    onSubmit,
  } as const;
}
