"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/form/password-input";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { loginAction } from "./actions";

export interface LoginFormProps {
  onSuccessRedirect?: string;
}

export function LoginForm({
  onSuccessRedirect = "/inventory",
}: LoginFormProps): React.ReactElement {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (values) => {
    startTransition(async () => {
      try {
        const result = await loginAction(values);
        if (result.success) {
          toast.success(tAuth("messages.login_success"));
          router.push(onSuccessRedirect);
          router.refresh();
        } else {
          toast.error(result.error || tAuth("messages.login_failed"));
        }
      } catch {
        toast.error(tAuth("messages.login_failed"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email input field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-semibold">
          {tAuth("fields.email")}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={tAuth("fields.email_placeholder")}
          autoComplete="email"
          disabled={isPending}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password input field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-semibold">
          {tAuth("fields.password")}
        </Label>
        <PasswordInput
          id="password"
          placeholder={tAuth("fields.password_placeholder")}
          autoComplete="current-password"
          disabled={isPending}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full cursor-pointer gap-2 font-semibold"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {tAuth("buttons.logging_in")}
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            {tAuth("buttons.login")}
          </>
        )}
      </Button>

      {/* Status fallback indicator */}
      {isPending && (
        <p className="text-muted-foreground animate-pulse text-center text-xs">
          {tCommon("status.loading")}
        </p>
      )}
    </form>
  );
}
