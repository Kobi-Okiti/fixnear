import { useEffect, useState } from "react";
import api from "@/services/api";
import { User } from "@/context/authTypes";
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

const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const authCtx = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
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
      .get<User>("/user/profile")
      .then((res) => {
        setProfile(res.data);
        form.reset({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
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

    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.patch<User>("/user/me", payload);
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
          <p><strong>Name:</strong> {profile.fullName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
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

          <div className="flex gap-2">
            <Button
                className=""
                onClick={() => {
                  // reset to original profile data when cancelling
                  form.reset({
                    fullName: profile.fullName || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
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
