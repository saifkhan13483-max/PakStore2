import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    
    // Use environment variable for access key
    // Remember to set VITE_WEB3FORMS_ACCESS_KEY in your .env file
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    
    if (!accessKey) {
      const error = "Web3Forms Access Key is missing. Please check your environment variables.";
      setErrorMessage(error);
      setStatus("error");
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: error,
      });
      return;
    }

    formData.append("access_key", accessKey);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We'll get back to you soon.",
        });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message,
      });
    }
  };

  return (
    <Card className="w-full shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-x-0 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Your Name"
              required
              disabled={status === "loading"}
              data-testid="input-contact-name"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              disabled={status === "loading"}
              data-testid="input-contact-email"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Message
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder="How can we help you?"
              required
              className="min-h-[120px] resize-none"
              disabled={status === "loading"}
              data-testid="textarea-contact-message"
            />
          </div>

          {status === "error" && errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md" data-testid="status-contact-error">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-md dark:bg-green-900/20 dark:text-green-400" data-testid="status-contact-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your message has been sent successfully!</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={status === "loading"}
            data-testid="button-contact-submit"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
