"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/contexts/session-context";
import { logActivity } from "@/lib/api/activity";

const activityTypes = [
  { id: "meditation", name: "Meditation" },
  { id: "exercise", name: "Exercise" },
  { id: "walking", name: "Walking" },
  { id: "reading", name: "Reading" },
  { id: "journaling", name: "Journaling" },
  { id: "therapy", name: "Therapy Session" },
];

interface ActivityLoggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityLogged: () => void;
}

export function ActivityLogger({
  open,
  onOpenChange,
  onActivityLogged,
}: ActivityLoggerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated, loading } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to log activities",
        variant: "destructive",
      });
      return;
    }

    if (!type || !name) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await logActivity({
        type,
        name,
        description,
        duration: duration ? parseInt(duration) : undefined,
      });

      // Reset form
      setType("");
      setName("");
      setDuration("");
      setDescription("");

      toast({
        title: "Activity logged successfully!",
        description: "Your activity has been recorded.",
      });

      onActivityLogged();
      onOpenChange(false);
    } catch (error) {
      console.error("Error logging activity:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to log activity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md bg-black">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-semibold">
            Log Activity
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record your wellness activity
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="activity-type" className="text-foreground">
              Activity Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger 
                id="activity-type"
                className="bg-background border-border hover:border-primary/50 focus:border-primary transition-colors"
              >
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-md border-border shadow-xl">
                {activityTypes.map((type) => (
                  <SelectItem 
                    key={type.id} 
                    value={type.id}
                    className="hover:bg-primary/20 focus:bg-primary/20 cursor-pointer text-foreground"
                  >
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-name" className="text-foreground">
              Name
            </Label>
            <Input
              id="activity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning Meditation, Evening Walk, etc."
              className="bg-background border-border hover:border-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-duration" className="text-foreground">
              Duration (minutes)
            </Label>
            <Input
              id="activity-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="15"
              className="bg-background border-border hover:border-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-description" className="text-foreground">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="activity-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How did it go?"
              className="bg-background border-border hover:border-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : loading ? (
                "Loading..."
              ) : (
                "Save Activity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}