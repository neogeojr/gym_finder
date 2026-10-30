"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/errors";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
      toast.success("You are logged out.");
      router.push("/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <nav className="flex items-center gap-4 border-b border-line p-4">
      <Link href="/" className="text-lg font-bold">
        Gym Day Pass Finder
      </Link>
      <Link href="/search">Search</Link>

      <div className="ml-auto flex items-center gap-4">
        {loading ? null : user ? (
          <>
            {user.role === "owner" && <Link href="/owner">My gyms</Link>}
            <Link href="/passes">My passes</Link>
            <span>{user.email}</span>
            <button onClick={onLogout} className="btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
