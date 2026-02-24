import { Screen } from '../types';
import { useAppSettings } from '../context/AppSettingsContext';

interface NotificationSettingsScreenProps {
    onNavigate: (screen: Screen) => void;
}

export function NotificationSettingsScreen({ onNavigate }: NotificationSettingsScreenProps) {
    const { settings, updateNotificationSetting } = useAppSettings();

    const notificationOptions = [
        {
            key: 'push' as const,
            title: 'Critical & Infection Alerts',
            description: 'Instant alerts when your wound shows infection or critical signs',
            icon: (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
        },
        {
            key: 'email' as const,
            title: 'Email Notifications',
            description: 'Receive analysis summaries and care advice by email',
            icon: (
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            key: 'dailyTips' as const,
            title: 'Daily Care Tips',
            description: 'Daily wound care reminder at 9 AM — new tip each day',
            icon: (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
        },
        {
            key: 'progressReminders' as const,
            title: 'Scan Reminders',
            description: 'Reminded to upload a new scan when overdue (6h for critical, 48h for normal)',
            icon: (
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
        },
    ];

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
                    <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
                    <p className="text-sm text-gray-500">Manage your notification preferences</p>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl p-4 shadow-md">
                <div className="space-y-4">
                    {notificationOptions.map((option, index) => (
                        <div
                            key={option.key}
                            className={`flex items-center justify-between py-4 ${index !== notificationOptions.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                                    {option.icon}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">{option.title}</h3>
                                    <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={() => updateNotificationSetting(option.key, !settings.notifications[option.key])}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications[option.key] ? 'bg-[#2F80ED]' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications[option.key] ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Section */}
            <div className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="font-medium text-blue-900 mb-1">About Notifications</h4>
                        <p className="text-sm text-blue-700">
                            Enable notifications to stay updated on your wound healing progress and receive timely care reminders.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
