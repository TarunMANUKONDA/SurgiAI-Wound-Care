import { Screen } from '../types';

interface LegalScreenProps {
    onNavigate: (screen: Screen) => void;
    type: 'privacy' | 'terms';
}

export function LegalScreen({ onNavigate, type }: LegalScreenProps) {
    const isPrivacy = type === 'privacy';

    return (
        <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 pt-4 pb-6">
                <button
                    onClick={() => onNavigate('profile')}
                    className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">
                        {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
                    </h1>
                    <p className="text-sm text-gray-500">Last updated: February 2026</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md prose prose-sm max-w-none">
                {isPrivacy ? (
                    <div className="space-y-4 text-gray-600">
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Data Collection</h3>
                            <p>We collect wound images and medical information you provide to analyze wound progress using AI. This data is handled with strict confidentiality.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">2. How We Use Data</h3>
                            <p>Stored images are used for:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Analyzing healing progress</li>
                                    <li>Providing AI-driven care recommendations</li>
                                    <li>Generating historical reports for your tracking</li>
                                </ul>
                            </p>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Data Security</h3>
                            <p>All data is transmitted securely and stored in our database. We use industry-standard encryption to protect your sensitive medical information.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Your Rights</h3>
                            <p>You can request data deletion at any time through the app settings or by contacting our support team.</p>
                        </section>
                    </div>
                ) : (
                    <div className="space-y-4 text-gray-600">
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Medical Disclaimer</h3>
                            <p className="font-bold text-red-600">IMPORTANT: This app is an AI assistant and NOT a replacement for professional medical advice, diagnosis, or treatment.</p>
                            <p className="mt-2">Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Use of AI</h3>
                            <p>The AI analysis is based on machine learning models and may occasionaly provide inaccurate results. Do not rely solely on the app for critical care decisions.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">3. User Responsibilities</h3>
                            <p>You are responsible for ensuring the clarity of uploaded images and providing accurate patient information for better analysis results.</p>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Limitation of Liability</h3>
                            <p>WoundCare AI shall not be liable for any results occurring from use of the app in emergency situations or as the sole source of medical guidance.</p>
                        </section>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                &copy; 2026 WoundCare AI. All rights reserved.
            </div>
        </div>
    );
}
