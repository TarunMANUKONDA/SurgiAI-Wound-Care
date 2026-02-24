import { Screen } from '../types';

interface HelpSupportScreenProps {
    onNavigate: (screen: Screen) => void;
}

export function HelpSupportScreen({ onNavigate }: HelpSupportScreenProps) {
    const features = [
        'AI-powered wound classification and analysis',
        'Infection risk detection and alerts',
        'Personalized healing recommendations',
        'Beautiful progress visualization and reports'
    ];

    return (
        <div className="min-h-screen bg-[#E0F7FA] relative overflow-hidden transition-colors duration-200">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#B2EBF2] rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-[#80DEEA] rounded-full opacity-30 blur-3xl"></div>

            {/* Header */}
            <div className="relative z-10 px-6 pt-12 pb-6">
                <button
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-2 group"
                >
                    <div className="p-2 rounded-lg transition-colors">
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </div>
                    <span className="text-lg font-medium text-gray-800">Back</span>
                </button>
            </div>

            {/* Content Container */}
            <div className="relative z-10 px-6 space-y-6 pb-20">

                {/* About Card */}
                <div className="bg-white text-gray-800 rounded-[2rem] p-8 shadow-xl transition-colors">
                    <h2 className="text-xl font-bold mb-4">About</h2>
                    <p className="text-base leading-relaxed mb-6 text-gray-600">
                        WoundCare AI is your personal AI-powered surgical recovery companion, designed to help you track wound healing, predict potential complications, and receive personalized care recommendations.
                    </p>
                    <p className="text-base leading-relaxed text-gray-600">
                        Our mission is to make surgical wound monitoring accessible and effective for everyone through intelligent insights and easy-to-use analysis tools.
                    </p>
                </div>

                {/* Features Card */}
                <div className="bg-white text-gray-800 rounded-[2rem] p-8 shadow-xl transition-colors">
                    <h2 className="text-xl font-bold mb-4">Features</h2>
                    <ul className="space-y-4">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="mt-2 w-2 h-2 rounded-full bg-[#00A884] flex-shrink-0"></div>
                                <span className="text-base text-gray-600">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Card */}
                <div className="bg-white text-gray-800 rounded-[2rem] p-8 shadow-xl transition-colors">
                    <h2 className="text-xl font-bold mb-4">Contact</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Email:</span>
                            <a href="mailto:support@woundcare.ai" className="font-medium text-[#00A884] hover:underline">support@woundcare.ai</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Website:</span>
                            <a href="https://www.woundcare.ai" className="font-medium text-[#00A884] hover:underline">www.woundcare.ai</a>
                        </div>
                    </div>

                    <button
                        onClick={() => onNavigate('chat')}
                        className="w-full mt-8 bg-[#00A884] hover:bg-[#008F70] text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg shadow-[#00A884]/20 transition-all active:scale-[0.98]"
                    >
                        Help
                    </button>
                </div>

                {/* Version Info */}
                <p className="text-center text-sm text-gray-400 pt-4">
                    WoundCare AI v1.0.0
                </p>
            </div>
        </div>
    );
}
