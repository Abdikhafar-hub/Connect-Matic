
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useData, Contact } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  UserPlus, 
  Filter, 
  Mail, 
  Trash2, 
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Contacts = () => {
  const { contacts, deleteContact } = useData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.company.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.notes.toLowerCase().includes(query)
    );
  });

  const handleDeleteContact = (id: string, name: string) => {
    deleteContact(id);
    toast({
      title: "Contact deleted",
      description: `${name} has been removed from your contacts.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your network of {contacts.length} contacts
          </p>
        </div>
        <Button asChild>
          <Link to="/add-contact" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Contact
          </Link>
        </Button>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Search contacts..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Contacts list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContacts.length > 0 ? (
            <div className="space-y-4">
              {filteredContacts.map((contact) => (
                <ContactRow 
                  key={contact.id} 
                  contact={contact} 
                  onDelete={handleDeleteContact}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
              {contacts.length === 0 ? (
                <>
                  <h3 className="font-medium text-lg">No contacts yet</h3>
                  <p className="text-muted-foreground mb-6">Start adding contacts to your network</p>
                </>
              ) : (
                <>
                  <h3 className="font-medium text-lg">No matching contacts</h3>
                  <p className="text-muted-foreground mb-6">Try changing your search query</p>
                </>
              )}
              <Button asChild>
                <Link to="/add-contact">Add First Contact</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface ContactRowProps {
  contact: Contact;
  onDelete: (id: string, name: string) => void;
}

const ContactRow: React.FC<ContactRowProps> = ({ contact, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-md hover:bg-primary/5 transition">
      <Link 
        to={`/contacts/${contact.id}`}
        className="flex items-center flex-1"
      >
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium mr-3">
          {contact.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="font-medium">{contact.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <span>{contact.company}</span>
            {contact.position && (
              <>
                <span>•</span>
                <span>{contact.position}</span>
              </>
            )}
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          asChild
        >
          <Link to={`/contacts/${contact.id}/email`}>
            <Mail className="h-4 w-4" />
            <span className="sr-only">Send email</span>
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/contacts/${contact.id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/contacts/${contact.id}/edit`}>Edit contact</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/contacts/${contact.id}/email`}>Create follow-up</Link>
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-500 focus:text-red-500"
                >
                  Delete contact
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {contact.name} from your contacts and remove all associated emails.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(contact.id, contact.name)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Contacts;
