
export const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Schedule your pickup effortlessly",
      description: "Use our simple booking system to schedule a convenient time for us to collect your laundry."
    },
    {
      number: "2",
      title: "We pick up your laundry at your doorstep",
      description: "Our friendly team arrives at your doorstep at the scheduled time to collect your items."
    },
    {
      number: "3",
      title: "Clean laundry delivered next day, guaranteed",
      description: "Your fresh, clean laundry is delivered back to you the next day, no extra charge."
    }
  ];

  return (
    <section id="how-it-works" className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Book. Pickup. Deliver. It's that simple.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-md relative">
              <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 right-0 w-8 h-1 bg-black transform translate-x-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
