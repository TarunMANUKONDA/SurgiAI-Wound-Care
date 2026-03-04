import { useEffect, useState } from 'react';
import { AppAlert, notificationService } from '../services/NotificationService';
import { Screen } from '../types';

interface AlertBannerProps {
    onNavigate: (screen: Screen) => void;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string; titleColor: string }> = {
    critical: {
        bg: 'bg-red-50',
        border: 'border-red-400',
        icon: '🚨',
        titleColor: 'text-red-800',
    },
    infection: {
        bg: 'bg-orange-50',
        border: 'border-orange-400',
        icon: '⚠️',
        titleColor: 'text-orange-800',
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-400',
        icon: '📋',
        titleColor: 'text-yellow-800',
    },
    reminder: {
        bg: 'bg-blue-50',
        border: 'border-blue-400',
        icon: '📸',
        titleColor: 'text-blue-800',
    },
    info: {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        icon: 'ℹ️',
        titleColor: 'text-gray-800',
    },
};

/**
 * AlertBanner — a stacked overlay shown at the top of the app.
 * Shows at most 3 alerts at once, newest first.
 * Mounts inside App.tsx so it overlays every screen.
 */
export function AlertBanner({ onNavigate }: AlertBannerProps) {
    const [alerts, setAlerts] = useState<AppAlert[]>([]);

    useEffect(() => {
        return notificationService.subscribe(setAlerts);
    }, []);

    if (alerts.length === 0) return null;

    // Show max 3, newest first
    const visible = alerts.slice(0, 3);

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex flex-col gap-2 p-3 pt-[calc(env(safe-area-inset-top)+12px)] pointer-events-none">
            {visible.map((alert) => {
                const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info;
                return (
                    <div
                        key={alert.id}
                        className={`
              ${style.bg} ${style.border}
              border-l-4 rounded-xl shadow-lg px-4 py-3
              pointer-events-auto
              animate-[slideDown_0.3s_ease-out]
            `}
                        style={{
                            animation: 'slideDown 0.3s ease-out',
                        }}
                    >
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${style.titleColor} leading-tight mb-0.5`}>
                                    {alert.title}
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {alert.message}
                                </p>

                                {/* Action button */}
                                {alert.actionLabel && alert.actionScreen && (
                                    <button
                                        onClick={() => {
                                            notificationService.dismiss(alert.id);
                                            onNavigate(alert.actionScreen as Screen);
                                        }}
                                        className={`
                      mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg
                      ${alert.severity === 'critical' ? 'bg-red-600 text-white' :
                                                alert.severity === 'infection' ? 'bg-orange-500 text-white' :
                                                    alert.severity === 'warning' ? 'bg-yellow-500 text-white' :
                                                        'bg-blue-500 text-white'}
                    `}
                                    >
                                        {alert.actionLabel}
                                    </button>
                                )}
                            </div>

                            {/* Dismiss button */}
                            <button
                                onClick={() => notificationService.dismiss(alert.id)}
                                className="flex-shrink-0 w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-gray-500 hover:bg-white transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Collapse indicator if more than 3 */}
            {alerts.length > 3 && (
                <div className="text-center pointer-events-auto">
                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full shadow-sm">
                        +{alerts.length - 3} more alerts
                    </span>
                </div>
            )}

            {/* Slide-down animation */}
            <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
