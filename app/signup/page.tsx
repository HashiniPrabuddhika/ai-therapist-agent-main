"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Mail, User, Lock } from "lucide-react";
import { registerUser } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(name, email, password);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--background)) 50%, hsl(var(--secondary) / 0.3) 100%)"
      }}
    >
      <Container 
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%"
        }}
      >
        <Card 
          style={{
            width: "100%",
            maxWidth: "32rem",
            padding: "2.5rem",
            borderRadius: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid hsl(var(--primary) / 0.1)",
            backgroundColor: "hsl(var(--card) / 0.9)",
            backdropFilter: "blur(16px)",
            marginTop: "5rem"
          }}
        >
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <h1 
              style={{
                fontSize: "1.875rem",
                fontWeight: "800",
                background: "linear-gradient(to right, #10b981, #059669)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "0.25rem",
                letterSpacing: "-0.025em"
              }}
            >
              Sign Up
            </h1>
            <p 
              style={{
                fontSize: "0.875rem",
                color: "hsl(var(--muted-foreground))",
                fontWeight: "500"
              }}
            >
              Create your account to start your journey with Nova.
            </p>
          </div>
          
          <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* Name and Email Row */}
              <div 
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1rem",
                  flexWrap: "wrap"
                }}
              >
                <div style={{ flex: "1 1 0%", minWidth: "200px" }}>
                  <label
                    htmlFor="name"
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      color: "hsl(var(--foreground))"
                    }}
                  >
                    Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User 
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "1.25rem",
                        height: "1.25rem",
                        color: "hsl(var(--muted-foreground))"
                      }}
                    />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      style={{
                        paddingLeft: "3rem",
                        paddingTop: "0.625rem",
                        paddingBottom: "0.625rem",
                        fontSize: "0.875rem",
                        borderRadius: "0.75rem",
                        backgroundColor: "hsl(var(--card) / 0.8)",
                        border: "1px solid hsl(var(--primary) / 0.3)",
                        color: "hsl(var(--foreground))",
                        outline: "none",
                        transition: "all 0.2s",
                        width: "100%"
                      }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = "hsl(var(--primary))";
                        e.target.style.boxShadow = "0 0 0 2px hsl(var(--primary) / 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "hsl(var(--primary) / 0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ flex: "1 1 0%", minWidth: "200px" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      color: "hsl(var(--foreground))"
                    }}
                  >
                    Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail 
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "1.25rem",
                        height: "1.25rem",
                        color: "hsl(var(--muted-foreground))"
                      }}
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      style={{
                        paddingLeft: "3rem",
                        paddingTop: "0.625rem",
                        paddingBottom: "0.625rem",
                        fontSize: "0.875rem",
                        borderRadius: "0.75rem",
                        backgroundColor: "hsl(var(--card) / 0.8)",
                        border: "1px solid hsl(var(--primary) / 0.3)",
                        color: "hsl(var(--foreground))",
                        outline: "none",
                        transition: "all 0.2s",
                        width: "100%"
                      }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = "hsl(var(--primary))";
                        e.target.style.boxShadow = "0 0 0 2px hsl(var(--primary) / 0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "hsl(var(--primary) / 0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    color: "hsl(var(--foreground))"
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock 
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "hsl(var(--muted-foreground))"
                    }}
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    style={{
                      paddingLeft: "3rem",
                      paddingTop: "0.625rem",
                      paddingBottom: "0.625rem",
                      fontSize: "0.875rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "hsl(var(--card) / 0.8)",
                      border: "1px solid hsl(var(--primary) / 0.3)",
                      color: "hsl(var(--foreground))",
                      outline: "none",
                      transition: "all 0.2s"
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = "hsl(var(--primary))";
                      e.target.style.boxShadow = "0 0 0 2px hsl(var(--primary) / 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "hsl(var(--primary) / 0.3)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
              
              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    color: "hsl(var(--foreground))"
                  }}
                >
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock 
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "hsl(var(--muted-foreground))"
                    }}
                  />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    style={{
                      paddingLeft: "3rem",
                      paddingTop: "0.625rem",
                      paddingBottom: "0.625rem",
                      fontSize: "0.875rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "hsl(var(--card) / 0.8)",
                      border: "1px solid hsl(var(--primary) / 0.3)",
                      color: "hsl(var(--foreground))",
                      outline: "none",
                      transition: "all 0.2s"
                    }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = "hsl(var(--primary))";
                      e.target.style.boxShadow = "0 0 0 2px hsl(var(--primary) / 0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "hsl(var(--primary) / 0.3)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            </div>
            
            {error && (
              <p 
                style={{
                  color: "hsl(var(--destructive))",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  fontWeight: "500",
                  padding: "0.75rem",
                  backgroundColor: "hsl(var(--destructive) / 0.1)",
                  borderRadius: "0.5rem",
                  border: "1px solid hsl(var(--destructive) / 0.2)"
                }}
              >
                {error}
              </p>
            )}
            
            <Button
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "0.875rem",
                borderRadius: "0.75rem",
                fontWeight: "700",
                background: "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "none",
                color: "hsl(var(--primary-foreground))",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s"
              }}
              size="lg"
              type="submit"
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
              }}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          
          <div 
            style={{
              marginTop: "1.5rem",
              marginBottom: "1.5rem",
              borderTop: "1px solid hsl(var(--primary) / 0.1)"
            }}
          />
          
          <p 
            style={{
              fontSize: "0.875rem",
              textAlign: "center",
              color: "hsl(var(--muted-foreground))"
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "hsl(var(--primary))",
                fontWeight: "600",
                textDecoration: "underline",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "hsl(var(--primary) / 0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "hsl(var(--primary))";
              }}
            >
              Sign in
            </Link>
          </p>
        </Card>
      </Container>
    </div>
  );
}