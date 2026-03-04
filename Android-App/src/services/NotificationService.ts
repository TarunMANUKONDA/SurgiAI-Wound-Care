/**
 * NotificationService
 *
 * Handles three types of alerts:
 *  1. In-app banners  — shown immediately after analysis (critical/infection/stalled)
 *  2. Scan reminders  — shown on app-open when the user is overdue for a scan
 *  3. Local push      — scheduled via @capacitor/local-notifications (works when app is closed)
 */

import { LocalNotifications } from '@capacitor/local-notifications';

export type AlertSeverity = 'critical' | 'infection' | 'warning' | 'reminder' | 'info';

export interface AppAlert {
    id: string;
    severity: AlertSeverity;
    title: string;
    message: string;
    actionLabel?: string;
    actionScreen?: string;   // screen to navigate to on action tap
    autoDismissMs?: number;  // undefined = stays until dismissed
    timestamp: Date;
}

// ── localStorage keys ─────────────────────────────────────────────────────────
const LAST_SCAN_KEY = 'woundcare_last_scan_ts';
const LAST_RISK_KEY = 'woundcare_last_risk';
const NOTIF_PERM_KEY = 'woundcare_notif_permitted';

class NotificationService {
    private listeners: Array<(alerts: AppAlert[]) => void> = [];
    private activeAlerts: AppAlert[] = [];
    private notifPermission: boolean = false;

    // ── Init ───────────────────────────────────────────────────────────────────
    async init(): Promise<void> {
        // Try to request local-notification permission (silently fails on web)
        try {
            const status = await LocalNotifications.checkPermissions();
            if (status.display !== 'granted') {
                const result = await LocalNotifications.requestPermissions();
                this.notifPermission = result.display === 'granted';
            } else {
                this.notifPermission = true;
            }
            localStorage.setItem(NOTIF_PERM_KEY, String(this.notifPermission));
        } catch (e) {
            console.warn('Notification permission request failed:', e);
            this.notifPermission = false;
        }
    }

    // ── Listener management ────────────────────────────────────────────────────
    subscribe(cb: (alerts: AppAlert[]) => void): () => void {
        this.listeners.push(cb);
        cb([...this.activeAlerts]); // immediate emit
        return () => { this.listeners = this.listeners.filter(l => l !== cb); };
    }

    private emit() {
        this.listeners.forEach(l => l([...this.activeAlerts]));
    }

    // ── Dismiss ────────────────────────────────────────────────────────────────
    dismiss(id: string) {
        this.activeAlerts = this.activeAlerts.filter(a => a.id !== id);
        this.emit();
    }

    dismissAll() {
        this.activeAlerts = [];
        this.emit();
    }

    // ── Internal push helper ───────────────────────────────────────────────────
    private push(alert: Omit<AppAlert, 'id' | 'timestamp'>) {
        // Deduplicate by severity — only one of each severity at a time
        this.activeAlerts = this.activeAlerts.filter(a => a.severity !== alert.severity);
        const full: AppAlert = {
            ...alert,
            id: `${alert.severity}-${Date.now()}`,
            timestamp: new Date(),
        };
        this.activeAlerts = [full, ...this.activeAlerts];
        this.emit();
        // Auto-dismiss if specified
        if (full.autoDismissMs) {
            setTimeout(() => this.dismiss(full.id), full.autoDismissMs);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Call this after every wound analysis completes.
     * Fires the appropriate in-app alert based on risk level.
     */
    onAnalysisComplete(
        riskLevel: 'normal' | 'warning' | 'infected' | 'critical',
        healingScore: number,
        nextScanHours: number,
        notificationsEnabled: boolean
    ) {
        // Record last scan time & risk
        localStorage.setItem(LAST_SCAN_KEY, Date.now().toString());
        localStorage.setItem(LAST_RISK_KEY, riskLevel);

        if (!notificationsEnabled) return;

        // ── Critical alert ────────────────────────────────────────────────────
        if (riskLevel === 'critical') {
            this.push({
                severity: 'critical',
                title: '🚨 Urgent — Seek Medical Help Now',
                message:
                    'Your wound shows critical signs (possible necrosis or severe infection). Please contact your doctor or visit emergency care immediately.',
                actionLabel: 'Get Help',
                actionScreen: 'help-support',
            });
            this.scheduleLocalNotif(
                'Urgent Wound Alert',
                'Your wound needs immediate medical attention. Do not delay.',
                5 * 60          // 5 min from now
            );
            return; // Don't add lower-severity alerts on top of critical
        }

        // ── Infection alert ───────────────────────────────────────────────────
        if (riskLevel === 'infected') {
            this.push({
                severity: 'infection',
                title: '⚠️ Infection Signs Detected',
                message:
                    'Your wound analysis detected signs of infection (discharge or inflammation). Please consult your doctor within 24 hours.',
                actionLabel: 'View Care Tips',
                actionScreen: 'advice',
                autoDismissMs: 0,
            });
            this.scheduleLocalNotif(
                'Infection Warning',
                'Signs of wound infection detected — please consult your doctor today.',
                2 * 60 * 60     // 2 hours
            );
            return;
        }

        // ── Warning / stalled ─────────────────────────────────────────────────
        if (riskLevel === 'warning' || healingScore < 40) {
            this.push({
                severity: 'warning',
                title: '📋 Wound Needs Closer Monitoring',
                message:
                    'Your healing progress has stalled or shows mild concern. Review your care routine and consider a follow-up with your doctor.',
                actionLabel: 'View Progress',
                actionScreen: 'wound-progress',
                autoDismissMs: 12000,
            });
        }

        // ── Schedule next-scan reminder ───────────────────────────────────────
        this.scheduleNextScanReminder(nextScanHours);
    }

    /**
     * Call this on every app open (after auth check).
     * Shows a reminder if the user is overdue for a scan.
     */
    checkScanReminder(notificationsEnabled: boolean) {
        if (!notificationsEnabled) return;

        const lastScanTs = parseInt(localStorage.getItem(LAST_SCAN_KEY) || '0', 10);
        const lastRisk = (localStorage.getItem(LAST_RISK_KEY) || 'normal') as
            'normal' | 'warning' | 'infected' | 'critical';

        if (!lastScanTs) return; // Never scanned — no reminder yet

        const hoursSinceScan = (Date.now() - lastScanTs) / (1000 * 60 * 60);

        // Reminder thresholds by risk
        const thresholds: Record<string, number> = {
            critical: 6,
            infected: 12,
            warning: 24,
            normal: 48,
        };
        const threshold = thresholds[lastRisk] ?? 48;

        if (hoursSinceScan >= threshold) {
            const hoursOverdue = Math.round(hoursSinceScan - threshold);
            this.push({
                severity: 'reminder',
                title: '📸 Time for Your Wound Scan',
                message: hoursOverdue > 0
                    ? `You are ${hoursOverdue}h overdue for a scan based on your last risk level (${lastRisk}). Upload a new image to track progress.`
                    : `It has been ${Math.round(hoursSinceScan)} hours since your last scan. Time to check in!`,
                actionLabel: 'Scan Now',
                actionScreen: 'upload',
                autoDismissMs: 20000,
            });
        }
    }

    /**
     * Record that a scan was just taken (call from WoundProgressScreen upload too).
     */
    recordScan(riskLevel: string) {
        localStorage.setItem(LAST_SCAN_KEY, Date.now().toString());
        localStorage.setItem(LAST_RISK_KEY, riskLevel);
    }

    // ── Scheduled local notifications ─────────────────────────────────────────
    private async scheduleLocalNotif(title: string, body: string, delaySeconds: number) {
        if (!this.notifPermission) return;
        try {
            await LocalNotifications.schedule({
                notifications: [{
                    id: Math.floor(Math.random() * 1e8),
                    title,
                    body,
                    schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
                    sound: undefined,
                    smallIcon: 'ic_notification',
                }],
            });
        } catch (e) {
            console.warn('Local notification scheduling failed:', e);
        }
    }

    private scheduleNextScanReminder(inHours: number) {
        const messages: Record<number, string> = {
            12: 'Time to check your wound — 12 hours since last scan.',
            24: 'Daily check-in reminder: upload your wound photo.',
            48: '48 hours since your last scan. Time for a progress check!',
        };
        const msg = messages[inHours] ?? `Time for your next wound scan (${inHours}h interval).`;
        this.scheduleLocalNotif('Wound Scan Reminder', msg, inHours * 60 * 60);
    }

    // ── Daily care tip (optional, scheduled at 9 AM) ──────────────────────────
    async scheduleDailyTipNotif(enabled: boolean) {
        // Cancel all existing tip notifications first
        try {
            const pending = await LocalNotifications.getPending();
            const tipIds = pending.notifications
                .filter((n: { id: number; title?: string }) => n.title?.includes('Daily Tip'))
                .map((n: { id: number }) => ({ id: n.id }));
            if (tipIds.length) await LocalNotifications.cancel({ notifications: tipIds });
        } catch { /* ignore */ }

        if (!enabled || !this.notifPermission) return;

        const tips = [
            'Keep your wound clean and dry — change dressings as instructed.',
            'Good nutrition speeds healing. Eat protein-rich foods today.',
            'Watch for redness, swelling, or warmth — early signs of infection.',
            'Stay hydrated — water helps your body heal faster.',
            'Avoid picking at scabs or wound edges.',
        ];

        const tip = tips[new Date().getDay() % tips.length];
        const tomorrow9am = new Date();
        tomorrow9am.setDate(tomorrow9am.getDate() + 1);
        tomorrow9am.setHours(9, 0, 0, 0);

        await this.scheduleLocalNotif('💡 Daily Wound Care Tip', tip, (tomorrow9am.getTime() - Date.now()) / 1000);
    }
}

export const notificationService = new NotificationService();
