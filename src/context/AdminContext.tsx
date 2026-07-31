"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

export type SaleStatus = "En cours" | "À venir" | "Terminée" | "Brouillon" | "published" | "upcoming" | "open" | "draft" | "finished";

export interface Sale {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  date: string;
  isoDate: string;
  endDate?: string;
  registrationDeadline?: string;
  location?: string;
  type?: string;
  price?: number;
  status: SaleStatus;
  revenue: number;
  participants: number;
  lotsSold: number;
  conversionRate: number;
  image?: string;
  lotsCount: number;
  createdAt?: string;
}

export interface Participant {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address?: string;
  city?: string;
  postalCode?: string;
  sale: string; // the name of the sale
  saleId: string; // The foreign key
  date: Date;
  paymentStatus: "paid" | "pending" | "failed";
  participationStatus: "access_sent" | "confirmed" | "registered" | "cancelled";
}

export interface Lot {
  id: string | number;
  saleId: string;
  ref: string;
  title: string;
  category: string;
  startPrice: number;
  estLow: number;
  estHigh: number;
  condition: string;
  image: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "success" | "warning" | "info";
}

interface DashboardStats {
  revenue: number;
  participants: number;
  lotsSold: number;
  conversionRate: number;
}

interface AdminContextProps {
  sales: Sale[];
  addSale: (sale: Sale) => Promise<void>;
  updateSale: (id: string, updates: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  deleteMultipleSales: (ids: string[]) => Promise<void>;
  duplicateSale: (id: string) => Promise<void>;

  participants: Participant[];
  updateParticipantPayment: (id: string | number, status: Participant["paymentStatus"]) => Promise<void>;
  updateParticipantAccess: (id: string | number, status: Participant["participationStatus"]) => Promise<void>;
  updateParticipantProfile: (id: string | number, updates: Partial<Participant>) => Promise<boolean>;
  deleteParticipant: (id: string | number) => Promise<void>;
  deleteMultipleParticipants: (ids: (string | number)[]) => Promise<void>;
  updateMultipleParticipantsAccess: (ids: (string | number)[], status: Participant["participationStatus"]) => Promise<void>;

  lots: Lot[];
  setLots: React.Dispatch<React.SetStateAction<Lot[]>>;
  addLot: (lot: Lot) => Promise<void>;
  updateLot: (id: string | number, updates: Partial<Lot>) => Promise<void>;
  deleteLot: (id: string | number) => Promise<void>;
  reorderLots: (saleId: string, newLotsOrder: Lot[]) => void;

  notifications: NotificationItem[];
  selectedSaleId: string;
  setSelectedSaleId: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dashboardStats: DashboardStats;
  unreadNotificationsCount: number;
  registrationFee: number;
  setRegistrationFee: (fee: number) => void;
  isLoading: boolean;
  adminEmail: string;
  adminAvatar: string | null;
  setAdminAvatar: (url: string | null) => void;
  autoEmailDraft: boolean;
  setAutoEmailDraft: (val: boolean) => void;
  autoEmailAccess: boolean;
  setAutoEmailAccess: (val: boolean) => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [lots, setLotsState] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedSaleId, setSelectedSaleId] = useState<string>("all");
  const [registrationFee, setRegistrationFee] = useState<number>(25);
  
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminAvatar, setAdminAvatarState] = useState<string | null>(null);
  
  const [autoEmailDraft, setAutoEmailDraftState] = useState(false);
  const [autoEmailAccess, setAutoEmailAccessState] = useState(false);

  useEffect(() => {
    fetchData();

    // Set up real-time listener for database changes
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => fetchData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lots' }, () => fetchData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchData(false))
      .subscribe();

    // Auth state listener to keep email in sync
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        setAdminEmail(session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setAdminEmail('');
      }
    });

    return () => {
      supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateSettings = async (updates: any) => {
    // We use upsert to ensure the row exists if it was somehow deleted
    const { error } = await supabase.from('settings').upsert({ id: 1, ...updates });
    if (error) console.error("Erreur lors de la mise à jour des paramètres.");
  };

  const setAdminAvatar = async (url: string | null) => {
    setAdminAvatarState(url);
    await updateSettings({ admin_avatar: url });
  };

  const setAutoEmailDraft = async (val: boolean) => {
    setAutoEmailDraftState(val);
    await updateSettings({ auto_email_draft: val });
  };

  const setAutoEmailAccess = async (val: boolean) => {
    setAutoEmailAccessState(val);
    await updateSettings({ auto_email_access: val });
  };

  const handleSetRegistrationFee = async (fee: number) => {
    setRegistrationFee(fee);
    await updateSettings({ registration_fee: fee });
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    // Fetch Settings
    const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (settingsError) {
      console.warn("Avertissement Supabase (Settings):", settingsError.message || settingsError.code || settingsError);
      if (settingsError.code === 'PGRST116') {
        // Row not found, create it
        await supabase.from('settings').insert([{ id: 1, registration_fee: 25 }]);
      }
    }
    if (settingsData) {
      setAdminAvatarState(settingsData.admin_avatar);
      setRegistrationFee(settingsData.registration_fee ?? 25);
      setAutoEmailDraftState(!!settingsData.auto_email_draft);
      setAutoEmailAccessState(!!settingsData.auto_email_access);
    }

    
    // Fetch User Info
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      setAdminEmail(user.email);
    }
    
    // Fetch Notifications
    const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (notifData) {
      setNotifications(notifData.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        type: n.type,
        time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })
      })));
    }
    
    // Fetch Sales
    const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    if (salesData) {
      const now = new Date();
      setSales(salesData.map(s => {
        let computedStatus = s.status;
        const start = new Date(s.iso_date);
        const end = s.end_date ? new Date(s.end_date) : null;
        
        // Automatic status transition based on time
        if (s.status === "published" && now >= start) {
           computedStatus = "open";
        }
        if (s.status === "open" && end && now >= end) {
           computedStatus = "finished";
        }
        
        // Lazy update Supabase if the status transitioned automatically
        if (computedStatus !== s.status) {
          supabase.from('sales').update({ status: computedStatus }).eq('id', s.id).then();
        }

        return {
          id: s.id,
          title: s.title,
          date: s.date,
          isoDate: s.iso_date,
          endDate: s.end_date,
          status: computedStatus as SaleStatus,
          revenue: s.revenue,
          participants: s.participants,
          lotsSold: s.lots_sold,
          conversionRate: s.conversion_rate,
          image: s.image,
          lotsCount: s.lots_count,
          subtitle: s.subtitle,
          description: s.description,
          registrationDeadline: s.registration_deadline,
          location: s.location,
          type: s.type,
          price: s.price,
          createdAt: s.created_at
        };
      }));
    }

    // Fetch Lots
    const { data: lotsData } = await supabase.from('lots').select('*').order('created_at', { ascending: true });
    if (lotsData) {
      setLotsState(lotsData.map(l => ({
        id: l.id,
        saleId: l.sale_id,
        ref: l.ref,
        title: l.title,
        category: l.category,
        startPrice: l.start_price,
        estLow: l.est_low,
        estHigh: l.est_high,
        condition: l.condition,
        image: l.image
      })));
    }

    // Fetch Participants
    const { data: participantsData } = await supabase.from('participants').select('*, sales(title)').order('date', { ascending: false });
    if (participantsData) {
      setParticipants(participantsData.map(p => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        phone: p.phone,
        country: p.country,
        address: p.address,
        city: p.city,
        postalCode: p.postal_code,
        saleId: p.sale_id,
        sale: p.sales?.title || 'Vente Inconnue',
        date: new Date(p.date),
        paymentStatus: p.payment_status,
        participationStatus: p.participation_status
      })));
    }

    if (showLoading) setIsLoading(false);
  };

  const addSale = async (sale: Sale) => {
    const { data, error } = await supabase.from('sales').insert({
      title: sale.title,
      subtitle: sale.subtitle,
      description: sale.description,
      date: sale.date,
      iso_date: sale.isoDate,
      end_date: sale.endDate,
      registration_deadline: sale.registrationDeadline,
      location: sale.location,
      type: sale.type,
      price: sale.price,
      status: sale.status,
      revenue: sale.revenue,
      participants: sale.participants,
      lots_sold: sale.lotsSold,
      conversion_rate: sale.conversionRate,
      image: sale.image,
      lots_count: sale.lotsCount
    }).select().single();
    
    if (data) {
      setSales(prev => [{
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        date: data.date,
        isoDate: data.iso_date,
        endDate: data.end_date,
        registrationDeadline: data.registration_deadline,
        location: data.location,
        type: data.type,
        price: data.price,
        status: data.status,
        revenue: data.revenue,
        participants: data.participants,
        lotsSold: data.lots_sold,
        conversionRate: data.conversion_rate,
        image: data.image,
        lotsCount: data.lots_count
      }, ...prev]);
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    const mappedUpdates: any = {};
    if (updates.title !== undefined) mappedUpdates.title = updates.title;
    if (updates.subtitle !== undefined) mappedUpdates.subtitle = updates.subtitle;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.date !== undefined) mappedUpdates.date = updates.date;
    if (updates.isoDate !== undefined) mappedUpdates.iso_date = updates.isoDate;
    if (updates.endDate !== undefined) mappedUpdates.end_date = updates.endDate;
    if (updates.registrationDeadline !== undefined) mappedUpdates.registration_deadline = updates.registrationDeadline;
    if (updates.location !== undefined) mappedUpdates.location = updates.location;
    if (updates.type !== undefined) mappedUpdates.type = updates.type;
    if (updates.price !== undefined) mappedUpdates.price = updates.price;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.revenue !== undefined) mappedUpdates.revenue = updates.revenue;
    if (updates.participants !== undefined) mappedUpdates.participants = updates.participants;
    if (updates.lotsSold !== undefined) mappedUpdates.lots_sold = updates.lotsSold;
    if (updates.conversionRate !== undefined) mappedUpdates.conversion_rate = updates.conversionRate;
    if (updates.image !== undefined) mappedUpdates.image = updates.image;
    if (updates.lotsCount !== undefined) mappedUpdates.lots_count = updates.lotsCount;

    const { error } = await supabase.from('sales').update(mappedUpdates).eq('id', id);
    if (!error) {
      setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  };

  const deleteSale = async (id: string) => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (!error) {
      setSales(prev => prev.filter(s => s.id !== id));
    }
  };

  const deleteMultipleSales = async (ids: string[]) => {
    const { error } = await supabase.from('sales').delete().in('id', ids);
    if (!error) {
      setSales(prev => prev.filter(s => !ids.includes(s.id)));
    }
  };

  const duplicateSale = async (id: string) => {
    const saleToDuplicate = sales.find(s => s.id === id);
    if (!saleToDuplicate) return;

    // Create a copy with a new title and reset stats
    const newSale = { ...saleToDuplicate };
    newSale.title = `${saleToDuplicate.title} (Copie)`;
    newSale.status = "draft";
    newSale.revenue = 0;
    newSale.participants = 0;
    newSale.lotsSold = 0;
    newSale.conversionRate = 0;

    await addSale(newSale);
  };

  const updateParticipantPayment = async (id: string | number, status: Participant["paymentStatus"]) => {
    const { error } = await supabase.from('participants').update({ payment_status: status }).eq('id', id);
    if (error) {
      alert("Erreur lors de la mise à jour. Avez-vous désactivé la sécurité RLS dans Supabase ?");
      console.error("Erreur de mise à jour du statut de paiement.");
    } else {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, paymentStatus: status } : p));
    }
  };

  const updateParticipantAccess = async (id: string | number, status: Participant["participationStatus"]) => {
    const { error } = await supabase.from('participants').update({ participation_status: status }).eq('id', id);
    if (error) {
      alert("Erreur lors de la mise à jour. Avez-vous désactivé la sécurité RLS dans Supabase ?");
      console.error("Erreur de mise à jour de l'accès.");
    } else {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, participationStatus: status } : p));
    }
  };

  const updateParticipantProfile = async (id: string | number, updates: Partial<Participant>) => {
    const dbUpdates: any = {};
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.country !== undefined) dbUpdates.country = updates.country;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;

    const { error } = await supabase.from('participants').update(dbUpdates).eq('id', id);
    if (error) {
      alert("Erreur lors de la mise à jour. Avez-vous désactivé la sécurité RLS dans Supabase ?");
      console.error("Erreur lors de la mise à jour du profil.");
      return false;
    } else {
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return true;
    }
  };

  const deleteParticipant = async (id: string | number) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (!error) {
      setParticipants(prev => prev.filter(p => p.id !== id));
    }
  };

  const deleteMultipleParticipants = async (ids: (string | number)[]) => {
    const { error } = await supabase.from('participants').delete().in('id', ids);
    if (!error) {
      setParticipants(prev => prev.filter(p => !ids.includes(p.id)));
    }
  };

  const updateMultipleParticipantsAccess = async (ids: (string | number)[], status: Participant["participationStatus"]) => {
    const { error } = await supabase.from('participants').update({ participation_status: status }).in('id', ids);
    if (error) {
      alert("Erreur lors de la mise à jour multiple.");
      console.error("Erreur lors de la mise à jour multiple.");
    } else {
      setParticipants(prev => prev.map(p => ids.includes(p.id) ? { ...p, participationStatus: status } : p));
    }
  };

  const addLot = async (lot: Lot) => {
    const { data, error } = await supabase.from('lots').insert({
      sale_id: lot.saleId,
      ref: lot.ref,
      title: lot.title,
      category: lot.category,
      start_price: lot.startPrice,
      est_low: lot.estLow,
      est_high: lot.estHigh,
      condition: lot.condition,
      image: lot.image
    }).select().single();

    if (data) {
      setLotsState(prev => [...prev, {
        id: data.id,
        saleId: data.sale_id,
        ref: data.ref,
        title: data.title,
        category: data.category,
        startPrice: data.start_price,
        estLow: data.est_low,
        estHigh: data.est_high,
        condition: data.condition,
        image: data.image
      }]);
    }
  };

  const updateLot = async (id: string | number, updates: Partial<Lot>) => {
    const mappedUpdates: any = {};
    if (updates.saleId !== undefined) mappedUpdates.sale_id = updates.saleId;
    if (updates.ref !== undefined) mappedUpdates.ref = updates.ref;
    if (updates.title !== undefined) mappedUpdates.title = updates.title;
    if (updates.category !== undefined) mappedUpdates.category = updates.category;
    if (updates.startPrice !== undefined) mappedUpdates.start_price = updates.startPrice;
    if (updates.estLow !== undefined) mappedUpdates.est_low = updates.estLow;
    if (updates.estHigh !== undefined) mappedUpdates.est_high = updates.estHigh;
    if (updates.condition !== undefined) mappedUpdates.condition = updates.condition;
    if (updates.image !== undefined) mappedUpdates.image = updates.image;

    const { error } = await supabase.from('lots').update(mappedUpdates).eq('id', id);
    if (!error) {
      setLotsState(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }
  };

  const deleteLot = async (id: string | number) => {
    const { error } = await supabase.from('lots').delete().eq('id', id);
    if (!error) {
      setLotsState(prev => prev.filter(l => l.id !== id));
    }
  };
  
  const reorderLots = (saleId: string, newLotsOrder: Lot[]) => {
    // In a real app we'd save the order index to Supabase, but for now just update state
    setLotsState(prev => {
      const otherLots = prev.filter(l => l.saleId !== saleId);
      return [...otherLots, ...newLotsOrder];
    });
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };
  
  const markAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const dashboardStats = useMemo(() => {
    if (selectedSaleId === "all") {
      return {
        revenue: participants.filter(p => p.paymentStatus === 'paid').length * registrationFee,
        participants: participants.length,
        lotsSold: sales.reduce((acc, sale) => acc + sale.lotsSold, 0),
        conversionRate: Math.round(sales.reduce((acc, sale) => acc + sale.conversionRate, 0) / (sales.length || 1)),
      };
    }
    const sale = sales.find(s => s.id === selectedSaleId);
    const saleParticipants = participants.filter(p => String(p.saleId) === selectedSaleId);
    const saleRevenue = saleParticipants.filter(p => p.paymentStatus === 'paid').length * registrationFee;
    return sale ? { 
      revenue: saleRevenue, 
      participants: saleParticipants.length, 
      lotsSold: sale.lotsSold, 
      conversionRate: sale.conversionRate 
    } : { revenue: 0, participants: 0, lotsSold: 0, conversionRate: 0 };
  }, [sales, participants, selectedSaleId, registrationFee]);

  return (
    <AdminContext.Provider value={{
      sales, addSale, updateSale, deleteSale, deleteMultipleSales, duplicateSale,
      participants, updateParticipantPayment,
    updateParticipantAccess,
    updateParticipantProfile,
    deleteParticipant,
    deleteMultipleParticipants,
    updateMultipleParticipantsAccess,
      lots, setLots: setLotsState, addLot, updateLot, deleteLot, reorderLots,
      notifications, markNotificationAsRead, markAllNotificationsAsRead, unreadNotificationsCount,
      selectedSaleId, setSelectedSaleId, dashboardStats,
      registrationFee, setRegistrationFee: handleSetRegistrationFee, isLoading,
      adminEmail, adminAvatar, setAdminAvatar,
      autoEmailDraft, setAutoEmailDraft,
      autoEmailAccess, setAutoEmailAccess
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) throw new Error("useAdmin must be used within an AdminProvider");
  return context;
}
