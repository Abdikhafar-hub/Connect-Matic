
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Globe, 
  Edit, 
  Trash2,
  Calendar,
  User
} from "lucide-react";
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

const ContactDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getContactById, deleteContact, getEmailsForContact } = useData();
  const [activeTab, setActiveTab] = useState("info");
  
  if (!id) {
    navigate("/contacts");
    return null;
  }
  
  const contact = getContactById(id);
  
  if (!contact) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Contact not found</h2>
        <p className="text-muted-foreground mb-6">
          The contact you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link to="/contacts">Go to Contacts</Link>
        </Button>
      </div>
    );
  }
  
  const emails = getEmailsForContact(id);
  
  const handleDelete = () => {
    deleteContact(id);
    toast({
      title: "Contact deleted",
      description: `${contact.name} has been removed from your contacts.`
    });
    navigate("/contacts");
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-1"
          onClick={() => navigate("/contacts")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Button>
        
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/contacts/${id}/email`} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Create Follow-up
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to={`/contacts/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
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
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl font-medium mb-4">
                {contact.name.charAt(0)}
              </div>
              <CardTitle className="text-2xl">{contact.name}</CardTitle>
              <CardDescription>{contact.position} at {contact.company}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                {contact.email && (
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{contact.email}</div>
                    </div>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{contact.phone}</div>
                    </div>
                  </div>
                )}
                
                {contact.company && (
                  <div className="flex items-start">
                    <Building className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Company</div>
                      <div className="font-medium">{contact.company}</div>
                    </div>
                  </div>
                )}
                
                {contact.website && (
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Website</div>
                      <div className="font-medium">
                        <a 
                          href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {contact.website}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Added on</div>
                    <div className="font-medium">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs section */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="info">Notes & Info</TabsTrigger>
                  <TabsTrigger value="activity">Email Activity</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="pt-6">
                <TabsContent value="info" className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">Synergy Notes</h3>
                    <div className="mt-2 p-4 bg-muted rounded-md">
                      {contact.notes ? (
                        <p className="whitespace-pre-line">{contact.notes}</p>
                      ) : (
                        <p className="text-muted-foreground italic">No notes added yet.</p>
                      )}
                    </div>
                    <Button variant="outline" asChild className="mt-4">
                      <Link to={`/contacts/${id}/edit`}>
                        Edit Notes
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="font-medium text-lg mb-2">Tags</h3>
                    {contact.tags && contact.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {contact.tags.map((tag, index) => (
                          <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                            {tag}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tags added.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="activity">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg">Email History</h3>
                      <Button asChild size="sm">
                        <Link to={`/contacts/${id}/email`}>
                          <Mail className="h-4 w-4 mr-2" />
                          New Email
                        </Link>
                      </Button>
                    </div>
                    
                    {emails && emails.length > 0 ? (
                      <div className="space-y-4">
                        {emails.map(email => (
                          <div key={email.id} className="border rounded-md p-4">
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{email.subject}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                email.status === 'sent' 
                                  ? 'bg-green-100 text-green-800' 
                                  : email.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800'
                                    : email.status === 'draft'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-red-100 text-red-800'
                              }`}>
                                {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {email.body.substring(0, 100)}...
                            </p>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              <span>
                                {email.status === 'scheduled' 
                                  ? `Scheduled for ${new Date(email.scheduledDate).toLocaleDateString()}`
                                  : email.status === 'sent'
                                    ? `Sent on ${new Date(email.scheduledDate).toLocaleDateString()}`
                                    : email.status === 'draft'
                                      ? 'Draft'
                                      : `Failed on ${new Date(email.scheduledDate).toLocaleDateString()}`
                                }
                              </span>
                              <Link to={`/follow-ups/${email.id}`} className="text-primary hover:underline">
                                View details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Mail className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground mb-4">
                          No emails have been sent to this contact yet.
                        </p>
                        <Button asChild>
                          <Link to={`/contacts/${id}/email`}>
                            Create Follow-up Email
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
