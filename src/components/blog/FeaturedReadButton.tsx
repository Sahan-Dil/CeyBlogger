"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface FeaturedReadButtonProps {
  postId: string;
}

export function FeaturedReadButton({ postId }: FeaturedReadButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      setOpen(true);
      return;
    }
    window.location.href = `/posts/${postId}`;
  };

  return (
    <>
      <Button
        size="lg"
        className="bg-accent hover:bg-accent/90 text-accent-foreground outline-2 outline outline-accent/30 hover:outline-accent/50"
        onClick={handleClick}
      >
        Read Article <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <p className="my-4">
            You must be logged in to read the full article.
          </p>
          <DialogFooter className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
