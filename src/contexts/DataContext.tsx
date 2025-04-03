import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "../hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseFunction } from "@/hooks/useSupabaseFunction";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  position: string;
  notes: string;
  createdAt: string;
  tags: string[];
}

export interface Email {
  id: string;
  contactId: string;
  subject: string;
  body: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledDate: string;
  createdAt: string;
}

interface DataContextType {
  contacts: Contact[];
  emails: Email[];
  loading: boolean;
  addContact: (contact: Omit<Contact, "id" | "createdAt">) => Promise<string | undefined>;
  updateContact: (id: string, contact: Partial<Omit<Contact, "id" | "createdAt">>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addEmail: (email: Omit<Email, "id" | "createdAt">) => Promise<string | undefined>;
  updateEmail: (id: string, email: Partial<Omit<Email, "id" | "createdAt">>) => Promise<void>;
  deleteEmail: (id: string) => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
  getEmailsForContact: (contactId: string) => Email[];
  generateEmail: (contactId: string, notes: string) => Promise<string>;
  sendEmail: (contactId: string, email: { to: string; subject: string; body: string }) => Promise<boolean>;
  scheduleEmail: (contactId: string, email: { subject: string; body: string; scheduledDate: string }) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  
  const generateEmailFunction = useSupabaseFunction<{success: boolean; email: string}>('generate-email');
  const sendEmailFunction = useSupabaseFunction<{success: boolean; message: string}>('send-email');

  const fetchData = async () => {
    if (!isAuthenticated) {
      setContacts([]);
      setEmails([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;
      
      const { data: emailsData, error: emailsError } = await supabase
        .from('follow_up_emails')
        .select('*')
        .order('created_at', { ascending: false });

      if (emailsError) throw emailsError;

      const formattedContacts: Contact[] = contactsData.map(contact => ({
        id: contact.id,
        name: contact.full_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        website: contact.website || '',
        position: contact.position || '',
        notes: '',
        createdAt: contact.created_at,
        tags: []
      }));

      const formattedEmails: Email[] = emailsData.map(email => ({
        id: email.id,
        contactId: email.contact_id,
        subject: email.subject,
        body: email.content,
        status: email.status as "draft" | "scheduled" | "sent" | "failed",
        scheduledDate: email.scheduled_for,
        createdAt: email.created_at
      }));

      setContacts(formattedContacts);
      setEmails(formattedEmails);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: "There was an error loading your data. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const addContact = async (contact: Omit<Contact, "id" | "createdAt">): Promise<string | undefined> => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          full_name: contact.name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          website: contact.website,
          position: contact.position,
          user_id: user?.id
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const newContact: Contact = {
          id: data[0].id,
          name: data[0].full_name || '',
          email: data[0].email || '',
          phone: data[0].phone || '',
          company: data[0].company || '',
          website: data[0].website || '',
          position: data[0].position || '',
          notes: '',
          createdAt: data[0].created_at,
          tags: []
        };

        setContacts(prev => [newContact, ...prev]);

        toast({
          title: "Contact added",
          description: `${contact.name} has been added to your contacts.`
        });
        
        return data[0].id;
      }
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast({
        variant: "destructive",
        title: "Failed to add contact",
        description: error.message
      });
    }
    return undefined;
  };

  const updateContact = async (id: string, contactUpdates: Partial<Omit<Contact, "id" | "createdAt">>) => {
    try {
      const updates: any = {};
      if (contactUpdates.name) updates.full_name = contactUpdates.name;
      if (contactUpdates.email !== undefined) updates.email = contactUpdates.email;
      if (contactUpdates.phone !== undefined) updates.phone = contactUpdates.phone;
      if (contactUpdates.company !== undefined) updates.company = contactUpdates.company;
      if (contactUpdates.website !== undefined) updates.website = contactUpdates.website;
      if (contactUpdates.position !== undefined) updates.position = contactUpdates.position;
      
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.map(contact => 
        contact.id === id ? { ...contact, ...contactUpdates } : contact
      ));

      toast({
        title: "Contact updated",
        description: "Contact information has been updated."
      });
    } catch (error: any) {
      console.error("Error updating contact:", error);
      toast({
        variant: "destructive",
        title: "Failed to update contact",
        description: error.message
      });
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.filter(contact => contact.id !== id));
      setEmails(emails.filter(email => email.contactId !== id));

      toast({
        title: "Contact deleted",
        description: "Contact and associated emails have been removed."
      });
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete contact",
        description: error.message
      });
    }
  };

  const addEmail = async (email: Omit<Email, "id" | "createdAt">): Promise<string | undefined> => {
    try {
      const emailStatus: "draft" | "scheduled" | "sent" | "failed" = 
        (email.status === "draft" || email.status === "scheduled" || 
         email.status === "sent" || email.status === "failed") 
          ? email.status 
          : "draft";

      const { data, error } = await supabase
        .from('follow_up_emails')
        .insert({
          contact_id: email.contactId,
          subject: email.subject,
          content: email.body,
          status: emailStatus,
          scheduled_for: email.scheduledDate
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const newEmail: Email = {
          id: data[0].id,
          contactId: data[0].contact_id,
          subject: data[0].subject,
          body: data[0].content,
          status: data[0].status as "draft" | "scheduled" | "sent" | "failed",
          scheduledDate: data[0].scheduled_for,
          createdAt: data[0].created_at
        };

        setEmails(prev => [newEmail, ...prev]);

        toast({
          title: "Email created",
          description: email.status === "scheduled" 
            ? `Email scheduled to be sent on ${new Date(email.scheduledDate).toLocaleDateString()}.`
            : "Email has been created."
        });
        
        return data[0].id;
      }
    } catch (error: any) {
      console.error("Error adding email:", error);
      toast({
        variant: "destructive",
        title: "Failed to create email",
        description: error.message
      });
    }
    return undefined;
  };

  const updateEmail = async (id: string, emailUpdates: Partial<Omit<Email, "id" | "createdAt">>) => {
    try {
      const updates: any = {};
      if (emailUpdates.subject !== undefined) updates.subject = emailUpdates.subject;
      if (emailUpdates.body !== undefined) updates.content = emailUpdates.body;
      if (emailUpdates.status !== undefined) updates.status = emailUpdates.status;
      if (emailUpdates.scheduledDate !== undefined) updates.scheduled_for = emailUpdates.scheduledDate;
      
      const { error } = await supabase
        .from('follow_up_emails')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setEmails(emails.map(email => 
        email.id === id ? { ...email, ...emailUpdates } : email
      ));

      toast({
        title: "Email updated",
        description: "Email has been updated."
      });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        variant: "destructive",
        title: "Failed to update email",
        description: error.message
      });
    }
  };

  const deleteEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from('follow_up_emails')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmails(emails.filter(email => email.id !== id));

      toast({
        title: "Email deleted",
        description: "Email has been removed."
      });
    } catch (error: any) {
      console.error("Error deleting email:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete email",
        description: error.message
      });
    }
  };

  const getContactById = (id: string) => {
    return contacts.find(contact => contact.id === id);
  };

  const getEmailsForContact = (contactId: string) => {
    return emails.filter(email => email.contactId === contactId);
  };

  const generateEmail = async (contactId: string, notes: string): Promise<string> => {
    const contact = getContactById(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }
    
    try {
      const response = await generateEmailFunction.execute({
        contactId,
        notes
      });
      
      if (response?.success && response.email) {
        return response.email;
      } else {
        throw new Error("Failed to generate email");
      }
    } catch (error) {
      console.error("Error generating email:", error);
      throw error;
    }
  };

  const sendEmail = async (contactId: string, emailData: { to: string; subject: string; body: string }): Promise<boolean> => {
    const contact = getContactById(contactId);
    if (!contact) {
      throw new Error("Contact not found");
    }
    
    try {
      const response = await sendEmailFunction.execute({
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        contactName: contact.name
      });
      
      if (response?.success) {
        await addEmail({
          contactId,
          subject: emailData.subject,
          body: emailData.body,
          status: "sent",
          scheduledDate: new Date().toISOString()
        });
        
        toast({
          title: "Email sent",
          description: `Your email to ${contact.name} has been sent.`
        });
        
        return true;
      } else {
        throw new Error(response?.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        variant: "destructive",
        title: "Email sending failed",
        description: error instanceof Error ? error.message : "Failed to send email"
      });
      throw error;
    }
  };

  const scheduleEmail = async (contactId: string, emailData: { subject: string; body: string; scheduledDate: string }) => {
    const newEmail: Omit<Email, "id" | "createdAt"> = {
      contactId,
      subject: emailData.subject,
      body: emailData.body,
      status: "scheduled",
      scheduledDate: emailData.scheduledDate
    };
    
    await addEmail(newEmail);
  };

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <DataContext.Provider
      value={{
        contacts,
        emails,
        loading,
        addContact,
        updateContact,
        deleteContact,
        addEmail,
        updateEmail,
        deleteEmail,
        getContactById,
        getEmailsForContact,
        generateEmail,
        sendEmail,
        scheduleEmail,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
