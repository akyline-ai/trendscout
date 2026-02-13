import { FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="p-6 prose dark:prose-invert max-w-none">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Effective Date: January 15, 2026</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Last Updated: January 15, 2026</p>

            <p className="lead">
              Welcome to Rizko.ai. These Terms of Service ("Terms") govern your access to and use of our social media analytics platform, website, and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg my-6">
              <p className="text-sm m-0"><strong>Important:</strong> Please read these Terms carefully before using our Service. If you do not agree to these Terms, you may not access or use the Service.</p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            <p>By creating an account or using the Service, you acknowledge that you:</p>
            <ul>
              <li>Have read, understood, and agree to be bound by these Terms</li>
              <li>Are at least 13 years old (or 16 in the European Economic Area)</li>
              <li>Have the legal capacity to enter into this agreement</li>
              <li>Will comply with all applicable laws and regulations</li>
            </ul>
            <p>If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>

            <h2>2. Description of Service</h2>
            <p>Rizko.ai is a social media analytics platform that allows users to:</p>
            <ul>
              <li>Connect their social media accounts (TikTok, Instagram, YouTube) via official OAuth APIs</li>
              <li>View analytics and statistics for their own content</li>
              <li>Receive AI-powered recommendations to improve content performance</li>
              <li>Track performance metrics and trends over time</li>
            </ul>
            <p>The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>

            <h2>3. User Accounts</h2>

            <h3>3.1 Account Creation</h3>
            <ul>
              <li>You must provide accurate, current, and complete information during registration</li>
              <li>You must maintain and promptly update your account information</li>
              <li>One natural person may maintain only one account</li>
              <li>Account sharing is prohibited</li>
            </ul>

            <h3>3.2 Account Security</h3>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
              <li>You must notify us immediately of any unauthorized access to your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>We recommend using a strong, unique password and enabling two-factor authentication when available</li>
            </ul>

            <h3>3.3 Account Termination</h3>
            <p>You may delete your account at any time through the Settings page. Upon deletion:</p>
            <ul>
              <li>Your personal data will be deleted within 30 days</li>
              <li>Connected social media accounts will be automatically disconnected</li>
              <li>Any active subscriptions will be cancelled at the end of the current billing period</li>
            </ul>

            <h2>4. Connected Social Media Accounts</h2>

            <h3>4.1 OAuth Authorization</h3>
            <p>When you connect your social media accounts:</p>
            <ul>
              <li>You authorize us to access the data specified during the OAuth authorization process</li>
              <li>We only access data necessary to provide the Service</li>
              <li>We never post, modify, or delete content on your behalf</li>
              <li>You can revoke access at any time from the Connect Accounts page</li>
            </ul>

            <h3>4.2 Third-Party Terms</h3>
            <p>Your use of connected social media accounts is also subject to the terms and policies of those platforms:</p>
            <ul>
              <li><a href="https://www.tiktok.com/legal/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">TikTok Terms of Service <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://help.instagram.com/581066165581870" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">Instagram Terms of Use <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">YouTube Terms of Service <ExternalLink className="h-3 w-3" /></a></li>
            </ul>

            <h2>5. Acceptable Use Policy</h2>

            <h3>5.1 Permitted Uses</h3>
            <p>You may use the Service to:</p>
            <ul>
              <li>View and analyze your own social media content performance</li>
              <li>Generate AI-powered insights and recommendations</li>
              <li>Track your content metrics over time</li>
            </ul>

            <h3>5.2 Prohibited Uses</h3>
            <p>You agree NOT to:</p>
            <ul>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Access accounts belonging to other users without authorization</li>
              <li>Attempt to bypass, disable, or circumvent any security features</li>
              <li>Use the Service for any illegal, fraudulent, or harmful purposes</li>
              <li>Scrape, crawl, or automatically collect data from the Service</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Attempt to gain unauthorized access to our systems or networks</li>
              <li>Use automated means (bots, scripts) to access the Service without permission</li>
              <li>Resell, redistribute, or sublicense access to the Service</li>
              <li>Upload malicious code, viruses, or harmful content</li>
            </ul>

            <h2>6. Subscription and Payment</h2>

            <h3>6.1 Free and Paid Plans</h3>
            <p>The Service offers both free and paid subscription plans. Features and limitations vary by plan.</p>

            <h3>6.2 Billing</h3>
            <ul>
              <li>Paid subscriptions are billed in advance on a monthly or annual basis</li>
              <li>All payments are processed securely through Stripe</li>
              <li>Prices are in USD unless otherwise specified</li>
              <li>Applicable taxes may be added to your subscription</li>
            </ul>

            <h3>6.3 Cancellation and Refunds</h3>
            <ul>
              <li>You may cancel your subscription at any time from the Settings page</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>No prorated refunds are provided for partial billing periods</li>
              <li>Refund requests for exceptional circumstances may be submitted to <a href="mailto:support@rizko.ai" className="text-blue-500 hover:underline">support@rizko.ai</a></li>
            </ul>

            <h3>6.4 Price Changes</h3>
            <p>We may change subscription prices with 30 days' notice. Price changes will take effect at the start of your next billing period after the notice.</p>

            <h2>7. Intellectual Property</h2>

            <h3>7.1 Our Intellectual Property</h3>
            <p>The Service, including its design, features, code, documentation, trademarks, and content (excluding user content), is owned by Rizko.ai and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission.</p>

            <h3>7.2 Your Content</h3>
            <p>You retain all ownership rights to your content. By using the Service, you grant us a limited, non-exclusive license to access and process your connected social media data solely to provide the Service.</p>

            <h3>7.3 Feedback</h3>
            <p>If you provide feedback, suggestions, or ideas about the Service, we may use them without obligation to compensate you.</p>

            <h2>8. AI-Generated Content</h2>
            <p>Our Service uses artificial intelligence (Google Gemini) to generate recommendations and insights:</p>
            <ul>
              <li>AI-generated content is provided for informational purposes only</li>
              <li>We do not guarantee the accuracy, completeness, or suitability of AI recommendations</li>
              <li>You are responsible for evaluating and using AI-generated content at your own discretion</li>
              <li>AI outputs should not be considered professional advice (marketing, legal, financial, etc.)</li>
            </ul>

            <h2>9. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:</p>
            <ul>
              <li>WARRANTIES OF MERCHANTABILITY</li>
              <li>FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>NON-INFRINGEMENT</li>
              <li>ACCURACY OR RELIABILITY OF ANALYTICS DATA</li>
            </ul>

            <h2>10. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul>
              <li>RIZKO.AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM</li>
              <li>WE ARE NOT LIABLE FOR DAMAGES ARISING FROM THIRD-PARTY ACTIONS, DATA LOSS, OR SERVICE INTERRUPTIONS</li>
            </ul>

            <h2>11. Indemnification</h2>
            <p>You agree to indemnify and hold harmless Rizko.ai and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service, violation of these Terms, or violation of any third-party rights.</p>

            <h2>12. Dispute Resolution</h2>

            <h3>12.1 Informal Resolution</h3>
            <p>Before initiating formal proceedings, you agree to contact us at <a href="mailto:team@rizko.ai" className="text-blue-500 hover:underline">team@rizko.ai</a> to attempt to resolve disputes informally for at least 30 days.</p>

            <h3>12.2 Arbitration Agreement</h3>
            <p>If informal resolution fails, disputes shall be resolved through binding arbitration rather than in court, except for claims that qualify for small claims court.</p>

            <h2>13. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where Rizko.ai is registered, without regard to conflict of law principles.</p>

            <h2>14. Termination</h2>
            <p>We may suspend or terminate your access to the Service at any time for violation of these Terms or conduct that we believe is harmful to other users or our business.</p>

            <h2>15. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and sending an email notification. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.</p>

            <h2>16. Contact Us</h2>
            <p>If you have questions about these Terms, contact us:</p>
            <ul>
              <li><strong>General Inquiries:</strong> <a href="mailto:team@rizko.ai" className="text-blue-500 hover:underline">team@rizko.ai</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@rizko.ai" className="text-blue-500 hover:underline">support@rizko.ai</a></li>
              <li><strong>Privacy:</strong> <a href="mailto:privacy@rizko.ai" className="text-blue-500 hover:underline">privacy@rizko.ai</a></li>
            </ul>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              By using Rizko.ai, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>

        <div className="text-center space-x-4">
          <Link to="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>
          <span className="text-gray-400">|</span>
          <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
