
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <section className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-400">
            <h2 className="text-xl font-semibold mb-4 text-orange-800">Important Note</h2>
            <p className="text-gray-700 leading-relaxed">
              Dear customer, please note that there are certain inherent risks involved in dry cleaning and laundry of garments. Therefore <strong>MixedWash</strong> suggests all its customers to read the Terms & Conditions carefully before handing over the garments for processing.
            </p>
          </section>

          <div className="space-y-6">
            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- Count/Weight of the garments shall be taken by our staff/Driver upon receiving the garments. It is the responsibility of the customer to match the count while accepting the delivery.</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- No claims on the basis of count shall be accepted after the order is delivered.</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- In the event of loss by fire or any other loss and damage to the garments for which we may accept liability, without prejudice shall not exceed 6 times the rates charged for washing or dry-cleaning of that particular garment only.</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- For Shoe Cleaning - At any point of time the compensation shall not be more than 5 times the amount charged for that particular shoe/item.</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- If not satisfied with the quality of any service offered, customers should get in touch with the company within 24 hours for resolution</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- We will not be responsible for any single item valued at more than Rs. 4500 unless we have received (and acknowledged) notification via email to hey@mixedwash.in prior to the collection.</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- We are not responsible for fastness, color bleed, color running, shrinkage, damages to embellishments or embroidery work on the articles during processing</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- We shall not be held responsible for any ornaments or jewellery fittings on your clothes getting damaged during the processing.</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- Stain Removal is not guaranteed while dry-cleaning</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- We would not take any responsibility for the clothes of the customer beyond 1 ( one ) week of the scheduled delivery date.</strong>
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                <strong>All disputes are subject to the jurisdiction of courts in Bengaluru only.</strong>
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>-- The final decision to refund or compensate solely lies on MixedWash's facility team.</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
