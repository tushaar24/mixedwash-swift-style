
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "Is next-day delivery really guaranteed?",
      answer: "Absolutely! Every order is delivered next day without extra charges. That's our standard service level."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We'll reprocess your laundry free of charge until you're completely happy. Customer satisfaction is our priority."
    },
    {
      question: "How do I know my clothes are safe?",
      answer: "Our reliable service ensures zero lost items and total peace of mind. We have extensive tracking systems in place."
    },
    {
      question: "How do I schedule a pickup?",
      answer: "Simply use our website or app to schedule a convenient pickup time. We'll be there at your doorstep!"
    }
  ];

  return (
    <section id="faq" className="bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-600">
            Get answers to the most common questions about our service.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
