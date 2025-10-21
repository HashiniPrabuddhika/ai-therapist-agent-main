"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const TOTAL_ROUNDS = 5;

export function BreathingGame() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [progress, setProgress] = useState(0);
  const [round, setRound] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isComplete || isPaused) return;

    let timer: NodeJS.Timeout;

    if (phase === "inhale") {
      timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setPhase("hold");
            return 0;
          }
          return p + 2;
        });
      }, 100);
    } else if (phase === "hold") {
      timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setPhase("exhale");
            return 0;
          }
          return p + 4;
        });
      }, 100);
    } else {
      timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            if (round >= TOTAL_ROUNDS) {
              setIsComplete(true);
              return p;
            }
            setPhase("inhale");
            setRound((r) => r + 1);
            return 0;
          }
          return p + 2;
        });
      }, 100);
    }

    return () => clearInterval(timer);
  }, [phase, round, isComplete, isPaused]);

  const handleReset = () => {
    setPhase("inhale");
    setProgress(0);
    setRound(1);
    setIsComplete(false);
    setIsPaused(false);
  };

  if (isComplete) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          gap: "1.5rem",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            width: "5rem",
            height: "5rem",
            borderRadius: "9999px",
            backgroundColor: "hsl(142 76% 36% / 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check
            style={{
              width: "2.5rem",
              height: "2.5rem",
              color: "hsl(142 76% 36%)",
            }}
          />
        </motion.div>
        <h3
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "hsl(var(--foreground))",
          }}
        >
          Great job!
        </h3>
        <p
          style={{
            color: "hsl(var(--muted-foreground))",
            textAlign: "center",
            maxWidth: "24rem",
          }}
        >
          You've completed {TOTAL_ROUNDS} rounds of breathing exercises. How do
          you feel?
        </p>
        <Button onClick={handleReset} style={{ marginTop: "1rem" }}>
          Start Again
        </Button>
      </div>
    );
  }

 return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "hsl(var(--background))",
        justifyContent: "center",
        height: "400px",
        gap: "2rem",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "8rem",
              height: "8rem",
              margin: "0 auto",
            }}
          >
            <motion.div
              animate={{
                scale: phase === "inhale" ? 1.5 : phase === "exhale" ? 1 : 1.2,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: "0",
                backgroundColor: "#e0f2fe",
                borderRadius: "9999px",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wind
                style={{
                  width: "2rem",
                  height: "2rem",
                  color: "hsl(var(--primary))",
                }}
              />
            </div>
          </div>
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "hsl(var(--foreground))",
            }}
          >
            {phase === "inhale"
              ? "Breathe In"
              : phase === "hold"
              ? "Hold"
              : "Breathe Out"}
          </h3>
        </motion.div>
      </AnimatePresence>

      <div style={{ width: "16rem" }}>
        <Progress value={progress} style={{ height: "0.5rem" }} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.875rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Round {round} of {TOTAL_ROUNDS}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </div>
    </div>
  );
}