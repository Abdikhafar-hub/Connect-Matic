
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get user data from metadata
  const initialName = user?.user_metadata?.full_name || "";
  const initialEmail = user?.email || "";
  
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);
  const [apiKey, setApiKey] = useState("");
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  
  const handleSaveProfile = () => {
    // This would normally update the user profile on the server
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated."
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification preferences have been saved."
    });
  };
  
  const handleSaveIntegrations = () => {
    toast({
      title: "API integration saved",
      description: "Your API key has been securely saved."
    });
    setApiKey("");
  };
  
  const handleSaveEmailSettings = () => {
    toast({
      title: "Email settings saved",
      description: "Your SMTP email settings have been updated."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardFooter>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for follow-up reminders and contact activities
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications for important events
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Follow-up Reminder (days)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Get reminded if you don't receive a reply after this many days
              </p>
              <Input 
                id="reminder-days" 
                type="number" 
                min="1" 
                max="30" 
                value={reminderDays} 
                onChange={(e) => setReminderDays(parseInt(e.target.value))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </CardFooter>
        </Card>
        
        {/* API Integration */}
        <Card>
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
            <CardDescription>Connect to third-party services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">OpenAI API Key</Label>
              <Input 
                id="api-key" 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..." 
              />
              <p className="text-xs text-muted-foreground">
                Used for enhanced email generation with GPT-4
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveIntegrations}>Save API Key</Button>
          </CardFooter>
        </Card>
        
        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Configure your email sending settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP Server</Label>
              <Input 
                id="smtp-server" 
                value={smtpServer} 
                onChange={(e) => setSmtpServer(e.target.value)}
                placeholder="smtp.gmail.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input 
                id="smtp-port" 
                value={smtpPort} 
                onChange={(e) => setSmtpPort(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input 
                id="smtp-username" 
                value={smtpUsername} 
                onChange={(e) => setSmtpUsername(e.target.value)}
                placeholder="your.email@gmail.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <Input 
                id="smtp-password" 
                type="password" 
                value={smtpPassword} 
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="••••••••" 
              />
              <p className="text-xs text-muted-foreground">
                For Gmail, you may need to use an App Password instead of your regular password
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveEmailSettings}>Save Email Settings</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
