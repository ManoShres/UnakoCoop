import React from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { Bell, CheckCheck, Info, AlertTriangle, BadgePercent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/useLanguageStore';

export const NotificationsPage: React.FC = () => {
  const { t } = useLanguageStore();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCoopStore();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-950 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('सूचना तथा जानकारी केन्द्र', 'Notification Center')}
          </h1>
          <p className="text-xs text-slate-500">{t('सहकारी सूचनाहरू, किस्ता तालिका र बचत ब्याज जम्मा सूचना', 'Cooperative announcements, loan schedules, and interest credits')}</p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-[#13ec37] hover:underline"
        >
          <CheckCheck className="size-4" />
          <span>{t('सबै पढेको चिन्ह लगाउनुहोस्', 'Mark All as Read')}</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={`glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all cursor-pointer ${
              !n.isRead ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20' : 'opacity-80'
            }`}
          >
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'ALERT'
                  ? 'bg-amber-500/10 text-amber-500'
                  : n.type === 'FINANCE'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#13ec37]'
                  : 'bg-blue-500/10 text-blue-500'
              }`}
            >
              <Bell className="size-5" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                <span className="text-[10px] text-slate-400">{n.date}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
              {n.actionUrl && (
                <Link
                  to={n.actionUrl}
                  className="inline-block mt-2 text-[11px] font-bold text-emerald-600 dark:text-[#13ec37] hover:underline"
                >
                  View Related Record →
                </Link>
              )}
            </div>

            {!n.isRead && <span className="size-2 rounded-full bg-emerald-500 mt-2 shrink-0"></span>}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
