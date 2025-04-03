
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useData, Email } from "@/contexts/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Mail,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FollowUps = () => {
  const { emails, contacts, loading } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter emails based on search and active tab
  const filteredEmails = emails.filter((email) => {
    const contact = contacts.find(c => c.id === email.contactId);
    const contactName = contact?.name || "";
    const contactCompany = contact?.company || "";
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      email.subject.toLowerCase().includes(query) ||
      contactName.toLowerCase().includes(query) ||
      contactCompany.toLowerCase().includes(query);
      
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "scheduled") return matchesSearch && email.status === "scheduled";
    if (activeTab === "sent") return matchesSearch && email.status === "sent";
    if (activeTab === "failed") return matchesSearch && email.status === "failed";
    
    return matchesSearch;
  });
  
  // Sort emails by scheduledDate (most recent first for sent, upcoming first for scheduled)
  const sortedEmails = [...filteredEmails].sort((a, b) => {
    if (a.status === "scheduled" && b.status === "scheduled") {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
    return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
  });
  
  // Show loading state if data is being fetched
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading follow-up emails...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">
            Manage your follow-up emails
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Search follow-ups..." 
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

      {/* Follow-ups tabs */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Follow-up Emails</CardTitle>
          <CardDescription>
            View all your scheduled and sent follow-up emails
          </CardDescription>
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="mt-6"
          >
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">
                All ({emails.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled ({emails.filter(e => e.status === "scheduled").length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                Sent ({emails.filter(e => e.status === "sent").length})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed ({emails.filter(e => e.status === "failed").length})
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="pt-6">
              <TabsContent value="all" className="mt-0">
                <FollowUpList emails={sortedEmails} contacts={contacts} />
              </TabsContent>
              
              <TabsContent value="scheduled" className="mt-0">
                <FollowUpList 
                  emails={sortedEmails.filter(e => e.status === "scheduled")} 
                  contacts={contacts} 
                />
              </TabsContent>
              
              <TabsContent value="sent" className="mt-0">
                <FollowUpList 
                  emails={sortedEmails.filter(e => e.status === "sent")} 
                  contacts={contacts} 
                />
              </TabsContent>
              
              <TabsContent value="failed" className="mt-0">
                <FollowUpList 
                  emails={sortedEmails.filter(e => e.status === "failed")} 
                  contacts={contacts} 
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};

interface FollowUpListProps {
  emails: Email[];
  contacts: any[];
}

const FollowUpList: React.FC<FollowUpListProps> = ({ emails, contacts }) => {
  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-medium text-lg">No emails found</h3>
        <p className="text-muted-foreground mb-6">
          No follow-up emails match your criteria
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {emails.map((email) => {
        const contact = contacts.find(c => c.id === email.contactId);
        
        return (
          <div 
            key={email.id}
            className="flex items-center justify-between p-4 bg-muted rounded-md hover:bg-primary/5 transition"
          >
            <div className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3
                ${email.status === 'sent' 
                  ? 'bg-green-100 text-green-700'
                  : email.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {email.status === 'sent' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : email.status === 'scheduled' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{email.subject}</div>
                <div className="text-sm text-muted-foreground">
                  To: {contact ? contact.name : "Unknown Contact"}
                  {contact?.company && ` (${contact.company})`}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {email.status === 'scheduled' 
                  ? `Scheduled for ${new Date(email.scheduledDate).toLocaleDateString()}`
                  : `${email.status === 'sent' ? 'Sent' : 'Failed'} on ${new Date(email.scheduledDate).toLocaleDateString()}`
                }
              </div>
              
              <Link to={`/follow-ups/${email.id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FollowUps;
