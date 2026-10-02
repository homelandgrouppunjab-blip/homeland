import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, FileText, RefreshCw } from "lucide-react";

const DOCS = {
  terms: {
    icon: FileText,
    title: "Terms & Conditions",
    intro:
      "These Terms & Conditions govern your use of the Homeland Group website operated by Quality Real Estate (authorised channel partner). By accessing or using this website you agree to these terms.",
    sections: [
      { h: "1. Information & Accuracy", p: "All project information, images, plans, dimensions, pricing and amenities are indicative and for general information only. They do not constitute a legal offer or contract. Final details are governed by the respective RERA registration, allotment letter and agreement to sell." },
      { h: "2. Channel Partner Role", p: "This website is managed by Quality Real Estate for marketing, branding and promotional purposes as an authorised channel partner of Homeland Group. Bookings and sales are subject to the developer's terms and applicable law." },
      { h: "3. Intellectual Property", p: "All content, logos, images and brand elements are the property of their respective owners and may not be reproduced without written permission." },
      { h: "4. Use of the Site", p: "You agree not to misuse the website, attempt unauthorised access, or use automated means to extract data. We may update or discontinue features at any time." },
      { h: "5. Third-Party Links", p: "The site may contain links to third-party websites. We are not responsible for their content or practices." },
      { h: "6. Limitation of Liability", p: "To the maximum extent permitted by law, we are not liable for any indirect or consequential loss arising from use of this website or reliance on its content." },
      { h: "7. Governing Law", p: "These terms are governed by the laws of India, with jurisdiction of the courts at Mohali, Punjab." },
    ],
  },
  privacy: {
    icon: ShieldCheck,
    title: "Privacy Policy",
    intro:
      "This Privacy Policy explains how we collect, use and protect the personal information you share through enquiry and site-visit forms on this website.",
    sections: [
      { h: "1. Information We Collect", p: "When you submit an enquiry or book a visit, we collect your name, phone number, email, project of interest, requirement, budget and any message you provide." },
      { h: "2. How We Use It", p: "Your information is used only to respond to your enquiry, share relevant project details, schedule site visits and provide customer support. We do not sell your personal data." },
      { h: "3. Communication", p: "By submitting a form you consent to be contacted by phone, email, SMS or WhatsApp regarding your enquiry and related offerings." },
      { h: "4. Data Security", p: "We apply reasonable technical and organisational measures to protect your information. No method of transmission over the internet is 100% secure." },
      { h: "5. Cookies & Analytics", p: "We may use cookies and analytics to understand site usage and improve the experience. You can control cookies through your browser settings." },
      { h: "6. Your Rights", p: "You may request access to, correction of, or deletion of your personal data by contacting us using the details on the Contact page." },
      { h: "7. Updates", p: "We may update this policy from time to time. The latest version will always be available on this page." },
    ],
  },
  refund: {
    icon: RefreshCw,
    title: "Payment, Cancellation & Refund Policy",
    intro:
      "This policy outlines how booking payments, cancellations and refunds are handled. Property bookings are governed by the developer's agreement; this page summarises the general framework.",
    sections: [
      { h: "1. Booking & Payments", p: "Any booking amount is accepted only through official channels of the developer (Homeland Group) and is subject to the terms of the allotment letter and agreement to sell. Quality Real Estate does not collect sale consideration directly." },
      { h: "2. Cancellation", p: "Requests for cancellation must be made in writing. Cancellation and associated deductions (if any) are governed by the booking terms, the agreement to sell and applicable RERA provisions." },
      { h: "3. Refunds", p: "Eligible refunds, after permissible deductions as per the agreement and applicable law, will be processed by the developer to the original payment source within the timeline specified in the booking terms." },
      { h: "4. Enquiries Are Free", p: "Submitting an enquiry or booking a site visit through this website is completely free and does not constitute a financial transaction." },
      { h: "5. Taxes & Charges", p: "Applicable taxes, statutory charges and registration costs are as per prevailing government rates and are borne by the buyer unless stated otherwise in the agreement." },
      { h: "6. Contact", p: "For any payment, cancellation or refund query, please reach us via the details on the Contact page and we will coordinate with the developer on your behalf." },
    ],
  },
};

export default function Legal() {
  const { doc } = useParams();
  const data = DOCS[doc] || DOCS.terms;
  const Icon = data.icon;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${data.title} | Homeland Group Mohali`;
  }, [doc, data.title]);

  return (
    <div className="container-lux py-20 max-w-3xl" data-testid={`legal-${doc || "terms"}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="h-11 w-11 grid place-items-center rounded-xl bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)]">
          <Icon className="h-5 w-5 text-gold" />
        </span>
        <h1 className="font-display text-3xl sm:text-4xl text-ivory">{data.title}</h1>
      </div>
      <p className="text-sm text-[color:var(--lux-ivory)]/65 leading-relaxed">{data.intro}</p>

      <div className="mt-10 space-y-8">
        {data.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-lg text-ivory mb-2">{s.h}</h2>
            <p className="text-sm text-[color:var(--lux-ivory)]/70 leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>

      <p className="mt-12 text-xs text-[color:var(--lux-ivory)]/40 border-t border-[color:var(--border-hairline)] pt-6">
        Website designed, published and managed by Quality Real Estate — authorised channel partner with Homeland Group for marketing, branding and promotional purposes.
      </p>
    </div>
  );
}
