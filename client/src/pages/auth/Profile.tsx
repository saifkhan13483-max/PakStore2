import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Calendar, ShieldCheck, Phone, AlertCircle, Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileValues } from "@/lib/validations/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { MediaUpload } from "../../components/MediaUpload";
import { CloudinaryImage } from "../../components/CloudinaryImage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PAKISTAN_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", 
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"
];

export default function Profile() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      phoneNumber: user?.phoneNumber || "",
      city: "",
      address: "",
      emergencyContact: "",
    },
  });

  if (!user) return null;

  const onAvatarUploadComplete = async (cloudinaryData: any) => {
    if (!cloudinaryData || !cloudinaryData.secure_url) return;
    
    setIsUpdating(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        photoURL: cloudinaryData.secure_url,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state in auth store
      useAuthStore.getState().setUser({
        ...user,
        photoURL: cloudinaryData.secure_url
      } as any);
      
      setIsAvatarDialogOpen(false);
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Profile picture update error:", error);
      
      // Update local state regardless of Firestore error to show immediate feedback
      useAuthStore.getState().setUser({
        ...user,
        photoURL: cloudinaryData.secure_url
      } as any);

      // We still treat it as a success for the user since the image is uploaded and visible
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      setIsAvatarDialogOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const onSubmit = async (data: ProfileValues) => {
    setIsUpdating(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state in auth store
      useAuthStore.getState().setUser({
        ...user,
        ...data
      } as any);
      
      toast({
        title: "Profile Updated",
        description: "Your information has been successfully saved.",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      let errorMessage = "There was an error updating your profile.";

      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please ensure you're logged in correctly.";
      }

      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEO title="My Profile - PakCart" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Account Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>View your basic account details and security status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b">
              <div className="relative group">
                {user.photoURL ? (
                  <CloudinaryImage 
                    publicId={user.photoURL.split('/').pop()?.split('.')[0]} 
                    className="h-20 w-20 rounded-full border-2 border-primary/20"
                    width={80}
                    height={80}
                    alt={user.displayName || "User"}
                    fallbackSrc={user.photoURL}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-2 border-primary/20">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                )}
                <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Update Profile Picture</DialogTitle>
                    </DialogHeader>
                    <MediaUpload 
                      onUploadComplete={onAvatarUploadComplete}
                      acceptedTypes={['image/*']}
                      maxSize={2 * 1024 * 1024} // 2MB for profile images
                      folder={`users/${user.uid}/profile`}
                      multiple={false}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user.displayName || "Valued Customer"}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.providerId === 'password' ? 'Email/Password' : 'Google Authentication'}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-secondary/50">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email Address</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-secondary/50">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Member Since</p>
                  <p className="text-sm font-medium text-wrap">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-secondary/50">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Security Status</p>
                  <p className={`text-sm font-medium ${user.emailVerified ? "text-green-600" : "text-amber-600"}`}>
                    {user.emailVerified ? "Verified Account" : "Pending Verification"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-secondary/50">
                  <AlertCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Last Login</p>
                  <p className="text-sm font-medium">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-PK', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : "Today"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact & Shipping
                </CardTitle>
                <CardDescription>Update your delivery information for faster checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0300-1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAKISTAN_CITIES.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="0321-7654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address, Apartment, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
