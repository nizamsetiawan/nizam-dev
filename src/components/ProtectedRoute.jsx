import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from "../supabase"; 

export default function ProtectedRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const check = async () => {
      // Check local dev preview session first
      if (localStorage.getItem("admin_session") === "true") {
        setAllowed(true);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setAllowed(false);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setAllowed(profile?.role === 'admin');
      } catch (err) {
        setAllowed(false);
      }
    };
    check();
  }, []);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to="/login" />;

  return children;
}
