import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD), Direct Bank Transfers, JazzCash, and EasyPaisa. All payments are processed securely."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 3-5 business days. Express delivery is available for major cities and takes 1-2 business days."
    },
    {
      question: "Are your products authentic?",
      answer: "Yes, 100% authentic. We source directly from local artisans across Pakistan, ensuring every piece meets our high standards of craftsmanship."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within Pakistan. However, we are working on expanding our reach to international customers soon."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, we'll send you a tracking number via SMS and email. You can use it on our courier partner's website."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day easy return policy for most items. The product must be unused and in its original packaging."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif text-emerald-900 mb-8 text-center">Frequently Asked Questions</h1>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-emerald-100">
              <AccordionTrigger className="text-left text-emerald-800 hover:text-emerald-600 font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
