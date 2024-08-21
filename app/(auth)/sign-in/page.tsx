import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AiFillGithub } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  return (
    <Container>
      <div className="mx-auto w-full max-w-md space-y-4 rounded-lg bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <p className="text-muted-foreground">
            Enter your email and password to sign in
          </p>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" title="Email" />
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" title="Password" />
            <Input
              id="password"
              type="password"
              placeholder="Enter a secure password"
              required
            />
          </div>
          <Button className="w-full" type="submit" color="">
            Sign In
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline">
            <AiFillGithub size={25} className="mr-0.5" />
            GitHub
          </Button>
          <Button variant="outline">
            <FcGoogle size={25} className="mr-0.5" />
            Google
          </Button>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Don&#39;t have an account?
          <Link
            href="/sign-up"
            className="font-medium underline underline-offset-4 ml-1 hover:text-slate-700"
            prefetch={false}
          >
            Sign up
          </Link>
        </div>
      </div>
    </Container>
  );
}
