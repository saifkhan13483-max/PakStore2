import { useQuery } from "@tanstack/react-query";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";

export function useDropshipperStatus() {
  const { user, isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["dropshipper-status", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const q = query(
        collection(db, "dropshipper_applications"),
        where("email", "==", user.email.toLowerCase().trim()),
        where("status", "==", "approved"),
        limit(1)
      );
      const snap = await getDocs(q);
      return snap.empty ? null : snap.docs[0].data();
    },
    enabled: isAuthenticated && !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isApprovedDropshipper: !!data,
    isLoading,
  };
}
