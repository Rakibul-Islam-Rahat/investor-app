import LoginForm from "@/components/auth/LoginForm";
import AuthIllustrationSvg from "../assets/login.svg";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center  py-8">
            <div className="max-w-[1368px] flex-1">
                <div className="container grid items-center gap-8 lg:grid-cols-2">
                    {/* title & image */}
                    <div>
                        <div>
                            <h1 className="mb-3 text-4xl font-bold lg:text-[40px]">Premium Fruits Ltd.</h1>
                            <p className=" text-gray-600/95 lg:text-lg mb-0">
                                Please login to your account to get acess with Premium Fruits investor dashboard.
                            </p>
                        </div>
                        <img
                            className="max-w-[480px] max-lg:hidden"
                            src={AuthIllustrationSvg}
                            alt="auth_illustration"
                        />

                    </div>
                    {/* login form */}
                    <LoginForm />
                </div>
            </div>
        </main>

    )
}
