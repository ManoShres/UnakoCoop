import { supabase } from '../lib/supabase';
import type { Inquiry, Notification, Notice } from '../types';
import { CreateInquirySchema } from '../schemas/financialSchema';
import type { ServiceResult } from './serviceResult';

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

// ==================== INQUIRIES ====================

export interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: Inquiry['category'];
  status: Inquiry['status'];
  date: string;
  reply: string | null;
}

export const rowToInquiry = (row: InquiryRow): Inquiry => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  subject: row.subject,
  message: row.message,
  category: row.category,
  status: row.status,
  date: row.date,
  reply: row.reply || undefined,
});

export const inquiryToRow = (
  i: Omit<Inquiry, 'id' | 'date' | 'status'>
): Omit<InquiryRow, 'id' | 'date' | 'status'> => ({
  name: i.name,
  email: i.email,
  phone: i.phone,
  subject: i.subject,
  message: i.message,
  category: i.category,
  reply: i.reply || null,
});

export const fetchInquiriesFromSupabase = async (): Promise<
  ServiceResult<Inquiry[]>
> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as InquiryRow[]).map(rowToInquiry), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const createInquiryInSupabase = async (
  inq: Omit<Inquiry, 'id' | 'date' | 'status'>
): Promise<ServiceResult<Inquiry>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  // Validate at service boundary
  const validation = CreateInquirySchema.safeParse({
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    subject: inq.subject,
    message: inq.message,
  });
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      data: null,
      error: `Validation error: ${firstIssue?.path.join('.') ?? 'field'} - ${firstIssue?.message ?? 'invalid input'}`,
    };
  }

  try {
    const insertPayload = {
      ...inquiryToRow(inq),
      status: 'NEW' as const,
      date: new Date().toISOString().split('T')[0],
    };
    const { data, error } = await supabase
      .from('inquiries')
      .insert(insertPayload)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToInquiry(data as InquiryRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const replyToInquiryInSupabase = async (
  inquiryId: string,
  reply: string
): Promise<ServiceResult<Inquiry>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ reply, status: 'RESOLVED' })
      .eq('id', inquiryId)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToInquiry(data as InquiryRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

// ==================== NOTIFICATIONS ====================

export interface NotificationRow {
  id: string;
  title: string;
  message: string;
  date: string;
  type: Notification['type'];
  is_read: boolean;
  action_url: string | null;
}

export const rowToNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  title: row.title,
  message: row.message,
  date: row.date,
  type: row.type,
  isRead: row.is_read,
  actionUrl: row.action_url || undefined,
});

export const notificationToRow = (
  n: Omit<Notification, 'id'>
): Omit<NotificationRow, 'id'> => ({
  title: n.title,
  message: n.message,
  date: n.date,
  type: n.type,
  is_read: n.isRead,
  action_url: n.actionUrl || null,
});

export const fetchNotificationsFromSupabase = async (): Promise<
  ServiceResult<Notification[]>
> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return {
      data: (data as NotificationRow[]).map(rowToNotification),
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const createNotificationInSupabase = async (
  n: Omit<Notification, 'id'>
): Promise<ServiceResult<Notification>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationToRow(n))
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToNotification(data as NotificationRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const markNotificationReadInSupabase = async (
  id: string
): Promise<ServiceResult<Notification>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToNotification(data as NotificationRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

// ==================== NOTICES ====================

export interface NoticeRow {
  id: string;
  title: string;
  title_nepali: string;
  category: Notice['category'];
  content: string;
  published_date: string;
  is_urgent: boolean;
  is_active: boolean;
}

export const rowToNotice = (row: NoticeRow): Notice => ({
  id: row.id,
  title: row.title,
  titleNepali: row.title_nepali,
  category: row.category,
  content: row.content,
  publishedDate: row.published_date,
  isUrgent: row.is_urgent,
  isActive: row.is_active,
});

export const noticeToRow = (
  n: Omit<Notice, 'id' | 'publishedDate'>
): Omit<NoticeRow, 'id' | 'published_date'> => ({
  title: n.title,
  title_nepali: n.titleNepali,
  category: n.category,
  content: n.content,
  is_urgent: n.isUrgent,
  is_active: n.isActive,
});

export const fetchNoticesFromSupabase = async (): Promise<
  ServiceResult<Notice[]>
> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('published_date', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data as NoticeRow[]).map(rowToNotice), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const createNoticeInSupabase = async (
  notice: Omit<Notice, 'id' | 'publishedDate'>
): Promise<ServiceResult<Notice>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const payload = {
      ...noticeToRow(notice),
      published_date: new Date().toISOString().slice(0, 10),
    };
    const { data, error } = await supabase
      .from('notices')
      .insert(payload)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToNotice(data as NoticeRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const updateNoticeInSupabase = async (
  noticeId: string,
  updates: Partial<Notice>
): Promise<ServiceResult<Notice>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const row: Record<string, unknown> = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.titleNepali !== undefined) row.title_nepali = updates.titleNepali;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.content !== undefined) row.content = updates.content;
    if (updates.isUrgent !== undefined) row.is_urgent = updates.isUrgent;
    if (updates.isActive !== undefined) row.is_active = updates.isActive;
    const { data, error } = await supabase
      .from('notices')
      .update(row)
      .eq('id', noticeId)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: rowToNotice(data as NoticeRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

export const deleteNoticeInSupabase = async (
  noticeId: string
): Promise<ServiceResult<true>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };
  try {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', noticeId);
    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};
