import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm');
};

export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};