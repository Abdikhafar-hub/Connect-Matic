
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { ArrowLeft } from "lucide-react";

const ContactForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addContact, updateContact, getContactById } = useData();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    position: "",
    notes: ""
  });
  
  useEffect(() => {
    if (isEditMode && id) {
      const contact = getContactById(id);
      if (contact) {
        setFormData({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          website: contact.website,
          position: contact.position,
          notes: contact.notes
        });
      } else {
        toast({
          variant: "destructive",
          title: "Contact not found",
          description: "The contact you're trying to edit doesn't exist."
        });
        navigate("/contacts");
      }
    }
  }, [id, isEditMode, getContactById, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter a name for the contact."
      });
      return;
    }
    
    if (isEditMode && id) {
      updateContact(id, formData);
      toast({
        title: "Contact updated",
        description: "The contact information has been updated successfully."
      });
    } else {
      addContact({
        ...formData,
        tags: []
      });
      toast({
        title: "Contact added",
        description: "The new contact has been added to your network."
      });
    }
    
    navigate("/contacts");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center gap-1"
        onClick={() => navigate("/contacts")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contacts
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Contact" : "Add New Contact"}</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name*</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  name="company"
                  value={formData.company} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input 
                  id="position" 
                  name="position"
                  value={formData.position} 
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  name="website"
                  value={formData.website} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                name="notes"
                value={formData.notes} 
                onChange={handleChange}
                rows={4}
                placeholder="Add synergy notes about this contact, such as where you met, mutual interests, or potential opportunities."
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/contacts")}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? "Save Changes" : "Add Contact"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ContactForm;
