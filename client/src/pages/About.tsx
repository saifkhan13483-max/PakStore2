export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose prose-emerald dark:prose-invert">
        <h1 className="text-4xl font-serif text-emerald-900 mb-4">About Us</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Welcome to NoorBazaar, Pakistan's premier destination for authentic artisanal products.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-serif text-emerald-800">Our Mission</h2>
          <p>
            At NoorBazaar, our mission is to preserve and promote the rich cultural heritage of Pakistan 
            by connecting local artisans with a global audience. We believe in sustainable commerce 
            that empowers communities while delivering exceptional quality to our customers.
          </p>
        </section>

        <section className="mb-12 grid md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
            <h3 className="text-xl font-serif text-emerald-800 mb-3">Nationwide Delivery</h3>
            <p className="text-muted-foreground">
              We deliver our curated products to every corner of Pakistan, ensuring your favorite 
              artisanal pieces reach you safely and promptly.
            </p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
            <h3 className="text-xl font-serif text-emerald-800 mb-3">Authentic Quality</h3>
            <p className="text-muted-foreground">
              Each product in our collection is handpicked and verified for authenticity, 
              guaranteeing you get the very best of Pakistani craftsmanship.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-serif text-emerald-800">Our Story</h2>
          <p>
            NoorBazaar started with a simple idea: to bring the hidden treasures of Pakistan's bazaars 
            to the digital age. From the intricate weaves of Kashmiri shawls to the vibrant pottery 
            of Multan, we represent the soul of our nation's artistry.
          </p>
        </section>
      </div>
    </div>
  );
}
