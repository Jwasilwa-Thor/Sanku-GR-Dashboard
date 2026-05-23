import { useState, useEffect, useCallback, useRef } from 'react';
import { Stakeholder } from '../types';
import { crmClient } from '../api/crmClient';
import { toast } from 'sonner';

export const useStakeholders = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStakeholders = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await crmClient.entities.Stakeholder.list();
      setStakeholders(data as Stakeholder[]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stakeholders:', err);
      setError('Could not load stakeholders.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Sync / Polling Logic
  useEffect(() => {
    fetchStakeholders();
    
    // Auto-refresh every 30 seconds for team synchronization
    pollingRef.current = setInterval(() => {
      fetchStakeholders(true);
    }, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchStakeholders]);

  // CRUD with Optimistic UI
  const createStakeholder = async (form: Partial<Stakeholder>) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...form, id: tempId } as Stakeholder;
    
    setStakeholders(prev => [optimisticItem, ...prev]);
    
    try {
      const newItem = await crmClient.entities.Stakeholder.create(form);
      setStakeholders(prev => prev.map(item => item.id === tempId ? (newItem as Stakeholder) : item));
      toast.success('Stakeholder added successfully');
      return newItem;
    } catch (err) {
      setStakeholders(prev => prev.filter(item => item.id !== tempId));
      toast.error('Failed to add stakeholder. Rolling back.');
      throw err;
    }
  };

  const updateStakeholder = async (id: string, form: Partial<Stakeholder>) => {
    const previous = [...stakeholders];
    setStakeholders(prev => prev.map(item => item.id === id ? { ...item, ...form } : item));
    
    try {
      const updated = await crmClient.entities.Stakeholder.update(id, form);
      toast.success('Stakeholder updated');
      return updated;
    } catch (err) {
      setStakeholders(previous);
      toast.error('Failed to update stakeholder. Rolling back.');
      throw err;
    }
  };

  const deleteStakeholder = async (id: string) => {
    const previous = [...stakeholders];
    setStakeholders(prev => prev.filter(item => item.id !== id));
    
    try {
      await crmClient.entities.Stakeholder.delete(id);
      toast.success('Stakeholder deleted');
    } catch (err) {
      setStakeholders(previous);
      toast.error('Failed to delete stakeholder. Rolling back.');
      throw err;
    }
  };

  return { 
    stakeholders, 
    loading, 
    error, 
    refresh: () => fetchStakeholders(),
    createStakeholder,
    updateStakeholder,
    deleteStakeholder
  };
};
