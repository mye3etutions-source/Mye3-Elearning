import React from 'react';
import { useLocation } from 'react-router-dom';

const LegalPage = () => {
  const location = useLocation();
  let title = '';
  let content = '';

  switch (location.pathname) {
    case '/privacy-policy':
      title = 'Privacy Policy';
      content = `Last Updated: April 2026

At Mye3 Academy (Mye3 e-Tuitions), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.

1. Information We Collect:
We collect personal information that you provide to us, such as your name, email address, phone number, academic class, and board details when you register for an account or purchase a subscription.

2. How We Use Your Information:
- To provide and maintain our Service.
- To process your payments through secure third-party gateways like Razorpay.
- To communicate with you about your account or subscriptions.
- To improve our platform and educational content.

3. Data Security:
We implement standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.

4. Third-Party Services:
We may use third-party services (like Razorpay for payments) that have their own privacy policies. We are not responsible for the privacy practices of these third parties.

5. Cookies:
We use cookies to enhance your experience and remember your login preferences.`;
      break;

    case '/refund-policy':
      title = 'Refund Policy';
      content = `Last Updated: April 2026

At Mye3 Academy, we strive to ensure our students have the best learning experience. Please read our refund policy carefully before subscribing to any course or bundle.

1. Course Subscriptions:
- Since our courses provide immediate access to digital content (Live classes, recorded sessions, and study materials), we generally do not offer refunds once a subscription is active.
- For 1-month subscriptions, no refunds are provided under any circumstances.

2. Exceptions:
- If a double payment occurs due to a technical error, the extra amount will be refunded to the original payment method within 7-10 business days.
- If you have technical issues preventing access to the content that our support team cannot resolve within 48 hours, a pro-rated refund may be considered at the discretion of management.

3. How to Request a Refund:
To request an exception refund, please email us at mye3etuitions@gmail.com with your transaction ID and the reason for the request.`;
      break;

    case '/terms-and-conditions':
      title = 'Terms & Conditions';
      content = `Last Updated: April 2026

By accessing the Mye3 Academy platform, you agree to comply with and be bound by the following Terms and Conditions.

1. Account Usage:
- You are responsible for maintaining the confidentiality of your login credentials.
- Your account is for your personal use only. Sharing your account with others is strictly prohibited and may result in account suspension without refund.

2. Intellectual Property:
- All content on this platform, including videos, notes, and graphics, is the property of Mye3 Academy.
- You may not download (unless explicitly allowed), record, reproduce, or distribute our content without written permission.

3. Course Validity:
- Your access to course materials depends on your selected subscription duration (1, 3, 6, or 12 months). Access will be revoked automatically upon expiration.

4. Termination:
- We reserve the right to terminate your access to the platform if you violate any of these terms or engage in disruptive behavior during live sessions.`;
      break;

    case '/disclaimer':
      title = 'Disclaimer';
      content = `Last Updated: April 2026

The information provided by Mye3 Academy ("we," "us," or "our") on mye3etuitions.com is for general educational purposes only.

1. Educational Results:
- While we provide high-quality teaching and materials, academic results depend on the student's own effort and participation. We do not guarantee specific marks or ranks in exams.

2. Accuracy of Information:
- All information on the site is provided in good faith. However, we make no representation or warranty of any kind regarding the accuracy, adequacy, or completeness of any information on the site.

3. External Links:
- Our platform may contain links to external websites. We do not warrant or assume responsibility for the accuracy of any information offered by third-party websites linked through our site.

4. Technical Issues:
- We are not liable for any temporary unavailability of the service due to technical issues beyond our control (e.g., internet outages, maintenance).`;
      break;

    default:
      title = 'Legal Information';
      content = 'Official legal documentation for Mye3 Academy.';
  }

  return (
    <div className="bg-[#fcfcfd] min-h-screen font-sans">
      <div className="bg-[#002147] py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500 rounded-full blur-[140px] -mr-64 -mt-64 opacity-20 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">{title}</h1>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
