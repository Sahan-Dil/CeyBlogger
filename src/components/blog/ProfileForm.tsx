"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Mail, Save, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().max(200, "Bio cannot exceed 200 characters.").optional(),
  avatarUrl: z.string().url("Please enter a valid URL.").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user: initialUser }: ProfileFormProps) {
  const { user, updateUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentUser = user?.id === initialUser?.id;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialUser?.name,
      bio: initialUser?.bio,
      avatarUrl: initialUser?.avatarUrl,
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!isCurrentUser) return;
    setIsLoading(true);

    try {
      const updatedUser = await updateUser(data);
      if (updatedUser) {
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved successfully.",
        });
        setIsEditing(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not save your changes. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue("avatarUrl", result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isCurrentUser) {
    // Render read-only view for other users' profiles
    return (
      <div className="flex flex-col md:flex-row items-center gap-8">
        <Avatar className="h-32 w-32 border-4 border-background shadow-md">
          <AvatarImage src={initialUser.avatarUrl} alt={initialUser.name} />
          <AvatarFallback>{initialUser.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold">{initialUser.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-xl">
            {initialUser.bio}
          </p>
          <div className="mt-4 flex items-center justify-center md:justify-start gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Author</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{initialUser.email}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render editable form for the current user
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background shadow-md">
              <AvatarImage
                src={form.watch("avatarUrl")}
                alt={initialUser.name}
              />
              <AvatarFallback>
                {initialUser.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-8 w-8 text-white" />
                <input
                  id="avatar-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </label>
            )}
          </div>
          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="text-2xl font-bold h-auto p-0 border-0 shadow-none focus-visible:ring-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={isLoading}
                          placeholder="Tell us about yourself"
                          className="text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author</span>
                  <Mail className="h-4 w-4 text-muted-foreground ml-4" />
                  <span className="text-muted-foreground">
                    {initialUser.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold">{initialUser.name}</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-xl">
                  {initialUser.bio}
                </p>
                <div className="mt-4 flex items-center justify-center md:justify-start gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>Author</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{initialUser.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {isCurrentUser && (
            <div className="md:ml-auto">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
