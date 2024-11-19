import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Login() {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full items-center justify-center bg-background p-4 lg:w-1/2">
        <div className="w-full max-w-[368px] space-y-6">
          <div className="space-y-2 text-center">
            <Image
              src="/placeholder-logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="mx-auto"
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@gmail.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold">
                Password
              </label>
              <Input id="password" type="password" placeholder="********" showPasswordToggle/>
            </div>

            <div className="text-right">
              <a
                href="#"
                className="text-sm font-normal text-[#0B75FF] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button className="w-full rounded-md bg-[#0B75FF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Log in
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Image
                src="/google.svg"
                alt="Google logo"
                width={16}
                height={16}
              />
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      <div className="hidden w-1/2 bg-[#0B75FF] lg:block" />
    </div>
  );
}
