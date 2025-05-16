
import { Check, Clock, Shield, Shirt } from "lucide-react";

export const WhyChooseUs = () => {
  const benefits = [
    {
      title: "Next-Day Delivery",
      description: "Always speedy, never pricey.",
      icon: <Clock className="h-10 w-10" />
    },
    {
      title: "Trust & Reliability",
      description: "Pickup and delivery that shows up on time, every time.",
      icon: <Check className="h-10 w-10" />
    },
    {
      title: "Free Reprocessing Guarantee",
      description: "Ensuring your satisfaction.",
      icon: <Shirt className="h-10 w-10" />
    },
    {
      title: "Safety Assured",
      description: "Zero lost items, every wash.",
      icon: <Shield className="h-10 w-10" />
    }
  ];

  return (
    <section id="why-choose-us" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose MixedWash</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We're not just another laundry service. Here's what makes us different.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-bold text-xl">{benefit.title}</h3>
                <p className="mt-2 text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
