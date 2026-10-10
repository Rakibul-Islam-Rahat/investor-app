import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Field from "./Field";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/features/auth/AuthContext";
import { ROLE_HOME } from "@/config/roles";
import { env } from "@/config/env";
import { MOCK_USERS, MOCK_VERIFICATION_CODE } from "@/services/mock/users";

export default function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, verify } = useAuth();
    const [challenge, setChallenge] = useState(null); // set when OTP / 2FA is required
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm();

    const goHome = (user) => navigate(location.state?.from?.pathname ?? ROLE_HOME[user.role], { replace: true });

    const onCredentials = async (data) => {
        try {
            const res = await login(data);
            if (res.requiresVerification) setChallenge(res);
            else goHome(res.user);
        } catch (e) {
            setError("root.server", { message: e.message });
        }
    };

    const onCode = async ({ code }) => {
        try {
            goHome(await verify({ challengeId: challenge.challengeId, code }));
        } catch (e) {
            setError("root.server", { message: e.message });
        }
    };

    const inputClass = (err) => `auth-input ${err ? "border-red-500" : "border-gray-200"}`;
    const serverError = errors?.root?.server?.message;

    return (
        <Card>
            <CardContent>
                {!challenge ? (
                    <form className="p-2" onSubmit={handleSubmit(onCredentials)} noValidate>
                        <Field label="Email" error={errors.email}>
                            <input {...register("email", { required: "Email is required" })} className={inputClass(errors.email)}
                                placeholder="Enter your email" type="email" id="email" autoComplete="username" />
                        </Field>
                        <Field label="Password" error={errors.password}>
                            <input {...register("password", { required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } })}
                                className={inputClass(errors.password)} placeholder="Enter your password" type="password" id="password" autoComplete="current-password" />
                        </Field>
                        {serverError && <p role="alert" className="text-red-600 mb-2 font-semibold">{serverError}</p>}
                        <Field>
                            <Button className="w-full text-lg" type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="animate-spin" />} Login
                            </Button>
                        </Field>
                        {env.useMock && (
                            <div className="mt-4 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                                <p className="font-semibold mb-1">Demo accounts (mock mode)</p>
                                {MOCK_USERS.map((u) => <p key={u.id}>{u.role}: {u.email} / {u.password}</p>)}
                                <p className="mt-1">OTP / 2FA code: {MOCK_VERIFICATION_CODE}</p>
                            </div>
                        )}
                    </form>
                ) : (
                    <form className="p-2" onSubmit={handleSubmit(onCode)} noValidate>
                        <p className="mb-3 text-sm">Enter the 6-digit {challenge.method === "OTP" ? "OTP sent to your phone" : "code from your authenticator app"}.</p>
                        <Field label="Verification code" error={errors.code}>
                            <input {...register("code", { required: "Code is required", pattern: { value: /^\d{6}$/, message: "Enter 6 digits" } })}
                                className={inputClass(errors.code)} inputMode="numeric" maxLength={6} autoComplete="one-time-code" id="code" />
                        </Field>
                        {serverError && <p role="alert" className="text-red-600 mb-2 font-semibold">{serverError}</p>}
                        <Field>
                            <Button className="w-full text-lg" type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="animate-spin" />} Verify
                            </Button>
                        </Field>
                        <Button type="button" variant="ghost" className="w-full" onClick={() => setChallenge(null)}>Back</Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
