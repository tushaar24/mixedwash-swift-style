
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy & Refunds</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Confidentiality and Security of Personal Information</h2>
            <p className="text-gray-700 leading-relaxed">
              Except as otherwise provided in this Privacy Policy your Personal Information will be maintained as private and confidential will unless such disclosure is absolutely necessary. You acknowledge that MixedWash can share customer/client information with a company which it acquires or is acquired by, to the Government or law enforcement agencies (if officially requested or required by Order, Notification, Statute or Court Order) and with anyone else upon prior written consent of the customer/client.
            </p>
          </section>

          <section>
            <p className="text-gray-700 leading-relaxed">
              As a Website, our online portal acts as a public domain and is therefore open to security breaches. <strong>MixedWash</strong> disclaims all responsibility to maintenance of security standards beyond reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Security Precautions</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. Whenever you change or access your account information, we offer the use of a secure server. Once your information is in our possession we adhere to strict security guidelines, protecting it against unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Information Collected from you</h2>
            <p className="text-gray-700 leading-relaxed">
              In order for you to access certain Services on the Website, we may require you to provide us with information to record your identification ("Personal Information"). Personal Information may include: Name, mailing and e-mail addresses, Phone number, Address, pin-code, state. If you communicate with us by Email, or fill in survey forms on the Website, the information you provide may be collected as Personal Information. This Personal Information will also be used in case of creation of a User Account on the Website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Your Consent</h2>
            <p className="text-gray-700 leading-relaxed">
              By using the website and/ or by providing your information, you consent to the collection and use of the information you disclose on the Website in accordance with this Privacy Policy, including but not limited to Your consent for sharing your information as per this privacy policy.
            </p>
          </section>

          <section>
            <p className="text-gray-700 leading-relaxed">
              The server may track and collect the following information when you visit the Website, including your IP address; (ii) domain server; and (iii) Type of web browser (collectively "General Information"). This information will not reveal anything additional about you or your identity but shall be used only for purpose of adapting the display content on the Website to your preference.
            </p>
          </section>

          <section>
            <p className="text-gray-700 leading-relaxed">
              By using the website and/ or by providing your information, you consent to the collection and use of the information you disclose on the Website in accordance with this Privacy Policy, including but not limited to Your consent for sharing your information as per this privacy policy.
            </p>
          </section>

          <section>
            <p className="text-gray-700 leading-relaxed">
              The server may track and collect the following information when you visit the Website, including your IP address; (ii) domain server; and (iii) Type of web browser (collectively "General Information"). This information will not reveal anything additional about you or your identity but shall be used only for purpose of adapting the display content on the Website to your preference.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Refund</h2>
            <p className="text-gray-700 leading-relaxed">
              The refunds are only processed if in case the garment is damaged/lost by our driver, in transit or while processing. The refunds shall be directly made to the source account and the amount of refund shall be not more than 2.5 times if the billing amount is below <Rs.2000 and 2 times if the billing amount is >Rs.2000. Refunds might take upto 5-7 working days to reflect in your account depending on your bank.
            </p>
          </section>

          <section>
            <p className="text-gray-700 leading-relaxed">
              Please refer to <strong>T&C</strong> for more details on the refunds
            </p>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 font-medium">
              MixedWash is liable to change/edit the the above policies as in when required without any prior notice
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
