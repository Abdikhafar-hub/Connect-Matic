
import React from "react";
import { useData, Contact, Email } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScanLine, Mail, ArrowUp, UserPlus, Clock, MailCheck, MailX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { contacts, emails } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  // Get user's name from metadata if available
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  // Get statistics
  const totalContacts = contacts.length;
  const totalFollowUps = emails.length;
  const pendingEmails = emails.filter(email => email.status === "scheduled").length;
  const sentEmails = emails.filter(email => email.status === "sent").length;
  
  // Get contacts sorted by date (newest first)
  const recentContacts = [...contacts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  
  // Get upcoming emails
  const upcomingEmails = [...emails]
    .filter(email => email.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  // Simulated card scan feature
  const handleQuickScan = () => {
    toast({
      title: "Camera activated",
      description: "Position the business card within the frame.",
    });
    // In a real app, this would activate the camera
    setTimeout(() => {
      navigate("/scan");
    }, 1500);
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userName}! Here's what's happening with your networking.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleQuickScan} className="flex items-center gap-2">
            <ScanLine className="w-4 h-4" />
            Quick Scan
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Contacts</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {totalContacts}
              <Users className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="w-3 h-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">
                {contacts.filter(c => {
                  const date = new Date(c.createdAt);
                  const now = new Date();
                  return now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
                }).length}
              </span>
              <span className="ml-1">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Follow-ups</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {pendingEmails}
              <Clock className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Scheduled to send in the next 48 hours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sent Follow-ups</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {sentEmails}
              <MailCheck className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {Math.round((sentEmails / totalFollowUps) * 100) || 0}% of total follow-ups
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed Follow-ups</CardDescription>
            <CardTitle className="text-3xl flex items-center justify-between">
              {emails.filter(email => email.status === "failed").length}
              <MailX className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/follow-ups" className="text-xs text-primary hover:underline">
              View and fix failed emails
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent contacts */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Contacts</CardTitle>
              <CardDescription>
                Your latest networking connections
              </CardDescription>
            </div>
            <Link to="/contacts">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentContacts.length > 0 ? (
              <div className="space-y-4">
                {recentContacts.map((contact) => (
                  <Link 
                    to={`/contacts/${contact.id}`} 
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-primary/5 transition"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium mr-3">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.company}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <UserPlus className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                <h3 className="font-medium text-lg">No contacts yet</h3>
                <p className="text-muted-foreground mb-4">Start scanning business cards to add contacts</p>
                <Button asChild>
                  <Link to="/add-contact">Add Contact</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming follow-ups */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Follow-ups</CardTitle>
              <CardDescription>
                Emails scheduled to be sent soon
              </CardDescription>
            </div>
            <Link to="/follow-ups">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEmails.length > 0 ? (
              <div className="space-y-4">
                {upcomingEmails.map((email) => {
                  const contact = contacts.find(c => c.id === email.contactId);
                  return (
                    <div 
                      key={email.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium mr-3">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{contact?.name || "Unknown Contact"}</div>
                          <div className="text-sm text-muted-foreground">{email.subject}</div>
                        </div>
                      </div>
                      <div className="text-sm text-primary">
                        {new Date(email.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Mail className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                <h3 className="font-medium text-lg">No upcoming follow-ups</h3>
                <p className="text-muted-foreground mb-4">Schedule emails for your contacts</p>
                <Button asChild>
                  <Link to="/contacts">Create Follow-up</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
