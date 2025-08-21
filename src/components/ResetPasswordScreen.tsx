import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ResetPasswordScreenProps {
  onComplete: () => void;
}

export const ResetPasswordScreen = ({ onComplete }: ResetPasswordScreenProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session for password reset:', error);
          toast.error("Error validating reset link. Please try requesting a new password reset.");
          navigate("/");
          return;
        }
        
          if (!session) {
            toast.error("Invalid or expired reset link. Please request a new password reset.");
            navigate("/");
            return;
        }

        setSessionValid(true);
      } catch (err) {
        console.error('Session check failed:', err);
        toast.error("Error validating reset link. Please try requesting a new password reset.");
        navigate("/");
      }
    };

    checkSession();
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

      try {
        const { data, error } = await supabase.auth.updateUser({
          password: password
        });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }
      
        toast.success("Password updated successfully! You can now sign in with your new password.");
      
      // Sign out the user so they can sign in with new password
      await supabase.auth.signOut();
      onComplete();
      } catch (error) {
        console.error("Password reset error:", error);
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('session_not_found') || message.includes('invalid_token')) {
          toast.error("Session expired. Please request a new password reset link.");
          navigate("/");
        } else {
          toast.error(message || "Failed to update password. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

  if (!sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md shadow-xl border-border/20">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Validating reset link...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md shadow-xl border-border/20">
        <CardHeader className="text-center space-y-2">
          <div className="text-4xl font-bold text-primary pulse-glow">
            Math Battle
          </div>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold btn-primary"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};