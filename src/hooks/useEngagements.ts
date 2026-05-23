import { useState, useEffect, useCallback, useRef } from 'react';
import { Engagement } from '../types';
import { crmClient } from '../api/crmClient';
import { toast } from 'sonner';

export const useEngagements = (stakeholderId?: string) => {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEngagements = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      let data;
      if (stakeholderId) {
        data = await crmClient.entities.Engagement.filter({ stakeholderId });
      } else {
        data = await crmClient.entities.Engagement.list();
      }
      setEngagements(data as Engagement[]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch engagements:', err);
      setError('Could not load engagements.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [stakeholderId]);

  // Sync / Polling Logic
  useEffect(() => {
    fetchEngagements();
    
    pollingRef.current = setInterval(() => {
      fetchEngagements(true);
    }, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchEngagements]);

  // CRUD with Optimistic UI
  const addEngagement = async (form: Partial<Engagement>) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...form, id: tempId } as Engagement;
    
    setEngagements(prev => [optimisticItem, ...prev]);
    
    try {
      const newItem = await crmClient.entities.Engagement.create(form);
      setEngagements(prev => prev.map(item => item.id === tempId ? (newItem as Engagement) : item));
      toast.success('Engagement logged successfully');
      return newItem;
    } catch (err) {
      setEngagements(prev => prev.filter(item => item.id !== tempId));
      toast.error('Failed to log engagement. Rolling back.');
      throw err;
    }
  };

  const deleteEngagement = async (id: string) => {
    const previous = [...engagements];
    setEngagements(prev => prev.filter(item => item.id !== id));
    
    try {
      await crmClient.entities.Engagement.delete(id);
      toast.success('Engagement deleted');
    } catch (err) {
      setEngagements(previous);
      toast.error('Failed to delete engagement. Rolling back.');
      throw err;
    }
  };

  return {
    engagements,
    loading,
    error,
    refresh: () => fetchEngagements(),
    addEngagement,
    deleteEngagement
  };
};
