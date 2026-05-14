import { useState, useEffect, useCallback, useRef } from 'react';
import { Engagement } from '../types';
import { base44 } from '../api/base44Client';
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
        data = await base44.entities.Engagement.filter({ stakeholderId });
      } else {
        data = await base44.entities.Engagement.list();
      }
      setEngagements(data as Engagement[]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch engagements:', err);
      setError('Could not load engagement history.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [stakeholderId]);

  useEffect(() => {
    fetchEngagements();
    
    // Auto-refresh every 30 seconds
    pollingRef.current = setInterval(() => {
      fetchEngagements(true);
    }, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchEngagements]);

  const addEngagement = async (form: Partial<Engagement>) => {
    const tempId = `temp-eng-${Date.now()}`;
    const optimistic = { ...form, id: tempId, date: new Date().toISOString().split('T')[0] } as Engagement;
    
    setEngagements(prev => [optimistic, ...prev]);
    
    try {
      const newItem = await base44.entities.Engagement.create(form);
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
      await base44.entities.Engagement.delete(id);
      toast.success('Engagement record removed');
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
