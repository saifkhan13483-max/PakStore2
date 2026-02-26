import { ContactForm } from "@/components/ContactForm";
import SEO from "@/components/SEO";

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh] flex flex-col items-center justify-center">
      <SEO 
        title="Contact Us | PakCart"
        description="Get in touch with PakCart. We're here to help with your orders and inquiries."
      />
      
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg">
          Have a question or need assistance? Fill out the form below and our team 
          will get back to you within 24 hours.
        </p>
      </div>

      <ContactForm />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-center">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Email</h3>
          <p className="text-muted-foreground">support@pakcart.store</p>
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-2">Phone</h3>
          <p className="text-muted-foreground">+92 (300) 123-4567</p>
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-2">Location</h3>
          <p className="text-muted-foreground">Karachi, Pakistan</p>
        </div>
      </div>
    </div>
  );
}
