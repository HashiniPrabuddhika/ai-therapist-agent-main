"use client";

import Link from "next/link";

interface SignInButtonProps {
  className?: string;
}

export function SignInButton({ className }: SignInButtonProps) {
  return (
    <Link
      href="/login"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        backgroundColor: "#60b56f", // primary green
        color: "#f0f9ff", // light text
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: 500,
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#4a9a5c"; // darker green
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#60b56f"; // back to primary
      }}
      className={className}
    >
      Sign In
    </Link>
  );
}