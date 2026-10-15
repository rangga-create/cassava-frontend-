"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
    } catch {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <img src="/logo-indocassava.jpeg" alt="INDOCASSAVA" className="w-20 h-20 rounded-full object-cover mb-5" />
          <h1 className="text-3xl font-bold mb-3">INDOCASSAVA</h1>
          <p className="text-lg text-white/80 text-center max-w-md">
            From Root to Global Market
          </p>
          <p className="mt-3 text-white/60 text-center max-w-md text-sm leading-relaxed">
            Join thousands of cassava traders worldwide. Start managing your
            business operations efficiently.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img src="/logo-indocassava.jpeg" alt="INDOCASSAVA" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <h1 className="text-lg font-semibold text-navy">INDOCASSAVA</h1>
              <p className="text-xs text-text-secondary">Export</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-xl font-bold text-navy">Create an account</h2>
            <p className="mt-1.5 text-text-secondary text-sm">
              Start your cassava trading journey with INDOCASSAVA today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-danger/10 border border-danger/20 rounded-md">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              icon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register("name", { onChange: clearError })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email", { onChange: clearError })}
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="+62 812 3456 7890"
              icon={<Phone className="h-4 w-4" />}
              error={errors.phone?.message}
              {...register("phone", { onChange: clearError })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                helperText="Must contain uppercase, lowercase, and number"
                {...register("password", { onChange: clearError })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-secondary hover:text-text"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                icon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", { onChange: clearError })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-text-secondary hover:text-text"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                required
              />
              <span className="text-sm text-text-secondary">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:text-primary-dark">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:text-primary-dark">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
