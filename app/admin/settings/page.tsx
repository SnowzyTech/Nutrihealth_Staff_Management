'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Bell, Lock, Users, Database, Settings, Shield, AlertTriangle } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-50">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your organization settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-slate-800 border border-slate-700 p-1 w-max sm:w-auto">
            <TabsTrigger value="general" className="flex items-center gap-1.5 sm:gap-2 text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm px-2.5 sm:px-3">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5 sm:gap-2 text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm px-2.5 sm:px-3">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1.5 sm:gap-2 text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm px-2.5 sm:px-3">
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1.5 sm:gap-2 text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm px-2.5 sm:px-3">
              <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Data
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="border-slate-700 bg-slate-800 shadow-xl">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-50">Organization Settings</CardTitle>
                  <CardDescription className="text-slate-400">Update your organization details and preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="text-sm font-medium text-slate-300">Organization Name</Label>
                  <Input id="org-name" defaultValue="Nutrihealth Consult" className="border-slate-600 bg-slate-700 text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email" className="text-sm font-medium text-slate-300">Organization Email</Label>
                  <Input id="org-email" type="email" defaultValue="admin@nutrihealthconsult.com" className="border-slate-600 bg-slate-700 text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium text-slate-300">Industry</Label>
                  <Input id="industry" defaultValue="Healthcare" className="border-slate-600 bg-slate-700 text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium text-slate-300">Timezone</Label>
                  <Input id="timezone" defaultValue="Africa/Lagos (WAT)" className="border-slate-600 bg-slate-700 text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border-slate-700 bg-slate-800 shadow-xl">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-50">Notification Preferences</CardTitle>
                  <CardDescription className="text-slate-400">Control how you receive notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-50">Staff Changes</p>
                    <p className="text-xs sm:text-sm text-slate-400">Email notifications when staff accounts are created or modified</p>
                  </div>
                  <Switch defaultChecked className="flex-shrink-0" />
                </div>

                <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-50">Document Submissions</p>
                    <p className="text-xs sm:text-sm text-slate-400">Get notified when staff submit documents for review</p>
                  </div>
                  <Switch defaultChecked className="flex-shrink-0" />
                </div>

                <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-50">Training Expiry</p>
                    <p className="text-xs sm:text-sm text-slate-400">Notifications for upcoming training module expirations</p>
                  </div>
                  <Switch defaultChecked className="flex-shrink-0" />
                </div>

                <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-50">Signature Reminders</p>
                    <p className="text-xs sm:text-sm text-slate-400">Remind staff about pending document signatures</p>
                  </div>
                  <Switch defaultChecked className="flex-shrink-0" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-slate-700 bg-slate-800 shadow-xl">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg text-slate-50">Security Settings</CardTitle>
                  <CardDescription className="text-slate-400">Manage security and access control</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="space-y-4">
                <div className="p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-50">Two-Factor Authentication</p>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">Add an extra layer of security to admin accounts</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-600 bg-transparent w-full sm:w-auto flex-shrink-0">Enable 2FA</Button>
                  </div>
                </div>

                <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <Label htmlFor="session-timeout" className="text-sm font-medium text-slate-50">Session Timeout</Label>
                  <p className="text-sm text-slate-400 mt-1 mb-3">Automatically log out inactive users</p>
                  <div className="flex items-center gap-3">
                    <Input id="session-timeout" type="number" defaultValue="30" className="w-24 border-slate-600 bg-slate-600 text-slate-50" />
                    <span className="text-sm text-slate-400">minutes</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <Label className="text-sm font-medium text-slate-50">Password Requirements</Label>
                  <p className="text-sm text-slate-400 mt-1 mb-3">Minimum password security standards</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Minimum 8 characters</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Require uppercase letter</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Require number</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Update Security Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <div className="space-y-6">
            <Card className="border-slate-700 bg-slate-800 shadow-xl">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <Database className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-50">Data Management</CardTitle>
                    <CardDescription className="text-slate-400">Manage your data and backups</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="p-3 sm:p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <p className="text-sm font-medium text-slate-50">Database Backups</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Your data is automatically backed up daily. Last backup: Today at 2:30 AM
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-600 bg-transparent">Download Backup</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-900 bg-red-950/20 shadow-xl">
              <CardHeader className="border-b border-red-900">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-red-300">Danger Zone</CardTitle>
                    <CardDescription className="text-red-400">Irreversible actions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-xs sm:text-sm text-slate-400 mb-4">
                  Permanently delete all data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="bg-red-900/80 hover:bg-red-900 text-red-100 border border-red-800">Delete All Data</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
