import { LoginForm } from "@/components/auth/login-form";
import { ResetToast } from "@/components/auth/reset-toast";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <ResetToast />
    </>
  );
}
