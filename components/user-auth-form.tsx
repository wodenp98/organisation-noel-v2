/* eslint-disable react/no-unescaped-entities */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { authenticate } from "@/lib/actions";
import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending}>
      {pending ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
      Se connecter
    </Button>
  );
}

export const UserAuthForm = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const [errorMessage, formAction] = useFormState(authenticate, undefined);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form action={formAction}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              name="username"
              placeholder="Nom d'utilisateur"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                placeholder="Mot de passe"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect="off"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm">
              Mauvais mot de passe ou nom d'utilisateur
            </div>
          )}

          <SubmitButton />
        </div>
      </form>
    </div>
  );
};
