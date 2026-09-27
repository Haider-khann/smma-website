import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CLIENT" | "ADMIN" | "SMM";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "CLIENT" | "ADMIN" | "SMM";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CLIENT" | "ADMIN" | "SMM";
  }
}
