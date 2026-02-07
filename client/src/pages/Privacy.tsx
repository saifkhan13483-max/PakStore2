export default function Privacy() {
  const lastUpdated = "February 07, 2026";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-emerald dark:prose-invert">
        <h1 className="text-4xl font-serif text-emerald-900 mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-serif text-emerald-800">1. Introduction</h2>
          <p>
            Welcome to NoorCrafts. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our 
            website and tell you about your privacy rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif text-emerald-800">2. Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul>
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data:</strong> includes payment card details (processed securely by our partners).</li>
            <li><strong>Technical Data:</strong> includes IP address, browser type and version, time zone setting and location.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif text-emerald-800">3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul>
            <li>To register you as a new customer.</li>
            <li>To process and deliver your order.</li>
            <li>To manage our relationship with you.</li>
            <li>To improve our website, products/services, and customer experiences.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif text-emerald-800">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. 
            In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif text-emerald-800">5. Contact Information</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact our data privacy manager at:
            <br />
            Email: <a href="mailto:privacy@noorcrafts.pk">privacy@noorcrafts.pk</a>
          </p>
        </section>
      </div>
    </div>
  );
}
