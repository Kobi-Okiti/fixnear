import { useEffect, useState } from "react";
import api from "@/service/api";
import { Artisan } from "@/context/authTypes";
import { useAuth } from "@/context/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { Textarea } from "@/components/ui/textarea";

const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  bio: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const authCtx = useAuth();
  const [profile, setProfile] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (!authCtx?.token) return;

    setLoading(true);
    api
      .get<Artisan>("/artisan/profile")
      .then((res) => {
        setProfile(res.data);
        form.reset({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          bio: res.data.bio || "",
        });
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [authCtx?.token, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);

    const payload: Partial<ProfileFormValues> = {};
    if (values.fullName !== profile?.fullName)
      payload.fullName = values.fullName;
    if (values.email !== profile?.email) payload.email = values.email;
    if (values.phone !== profile?.phone) payload.phone = values.phone;
     if (values.bio !== profile?.bio) payload.bio = values.bio;

    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.patch<Artisan>("/artisan/me", payload);
      setProfile(res.data);
      setEditMode(false);
      toast.success("Profile updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const addr = profile?.readableAddress;
  const addressString = addr
    ? [addr.road, addr.county, addr.state, addr.country]
        .filter(Boolean)
        .join(", ")
    : "Location not available";

  if (!authCtx?.token)
    return <p>You must be logged in to view your profile.</p>;
  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!profile) return <p>No profile data available.</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {!editMode ? (
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {profile.fullName}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Phone:</strong> {profile.phone || "Not provided"}
          </p>
          <p>
            <strong>Trade:</strong> {profile.tradeType}
          </p>
          <p className="max-w-[400px]">
            <strong>Bio:</strong>{" "}
            {profile.bio && profile.bio.trim() !== ""
              ? profile.bio
              : "No bio yet. Update your bio."}
          </p>
          <p>
            <strong>Available:</strong>{" "}
            {profile.isAvailable ? "Available" : "Unavailable"}
          </p>
          <p>
            <strong>Address:</strong> {addressString}
          </p>
          <p>
            <strong>Rating:</strong> {profile.rating}
          </p>
          <p>
            <strong>Review Count:</strong> {profile.reviewCount}
          </p>
          <p>
            <strong>Account created</strong>{" "}
            {profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : "N/A"}
          </p>
          <Button onClick={() => setEditMode(true)} className="mt-4">
            Update Profile
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} className="resize-none" />
                    
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                className=""
                onClick={() => {
                  form.reset({
                    fullName: profile.fullName || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    bio: profile.bio || "",
                  });
                  setEditMode(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      )}
      <Button
        onClick={() => setPwdOpen(true)}
        className="!bg-blue-600 text-white mt-4"
      >
        Change Password
      </Button>
      <ChangePasswordModal viewOpen={pwdOpen} setViewOpen={setPwdOpen} />
    </div>
  );
}
