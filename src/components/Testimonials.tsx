
import { Card, CardContent } from "@/components/ui/card";

export const Testimonials = () => {
  const testimonials = [
    {
      quote: "MixedWash turned laundry into a no-brainer—fast, friendly, and super easy!",
      author: "Ananya",
      role: "College Student",
      avatar: "A"
    },
    {
      quote: "Reliable, quick, and fun—MixedWash has become my laundry lifesaver.",
      author: "Rohit",
      role: "Young Professional",
      avatar: "R"
    },
    {
      quote: "Finally, a laundry service that delivers when they say they will!",
      author: "Priya",
      role: "Graduate Student",
      avatar: "P"
    }
  ];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">What Our Customers Say</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it—hear from the people who use MixedWash.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-medium mb-4">
                    {testimonial.avatar}
                  </div>
                  <blockquote className="mb-4">
                    <p className="text-lg">"{testimonial.quote}"</p>
                  </blockquote>
                  <cite className="not-italic">
                    <span className="font-bold block">{testimonial.author}</span>
                    <span className="text-gray-600">{testimonial.role}</span>
                  </cite>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
