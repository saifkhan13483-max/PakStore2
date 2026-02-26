import { Helmet } from "react-helmet-async";
import ContactForm from "@/components/contact/ContactForm";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Contact Us | PakCart</title>
        <meta name="description" content="Get in touch with PakCart for any inquiries about our authentic Pakistani artisanal products." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our products or your order? We're here to help. 
            Fill out the form below or reach us through our contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-muted-foreground">contact@pakcart.store</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <p className="text-muted-foreground">+92 318 8055850</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9am - 6pm PKT</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-xl border border-primary/10">
              <h3 className="text-lg font-bold mb-2">Artisan Support</h3>
              <p className="text-muted-foreground text-sm">
                Are you an artisan looking to showcase your work? 
                Email us at <span className="font-medium text-primary">artisans@pakcart.com</span> with your portfolio.
              </p>
            </div>

            <div className="bg-primary/5 p-8 rounded-xl border border-primary/10 mt-6">
              <h3 className="text-lg font-bold mb-2">Build Your Own Store</h3>
              <p className="text-muted-foreground text-sm">
                Interested in launching your own professional e-commerce platform like this one? 
                Get in touch with us at <a href="mailto:saifkhan@pakcart.store" className="font-medium text-primary hover:underline">saifkhan@pakcart.store</a> to start your digital journey today.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-md mx-auto lg:mx-0 w-full">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
