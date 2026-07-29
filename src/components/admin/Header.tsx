import { useState } from "react";
import { Menu, Bell, Search, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, adminEmail, adminAvatar } = useAdmin();

  return (
    <header className="h-20 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger className="relative inline-flex items-center justify-center rounded-md w-9 h-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background">
                {unreadNotificationsCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h4 className="font-semibold text-sm">Notifications</h4>
              {unreadNotificationsCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={markAllNotificationsAsRead}>
                  Tout marquer lu
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Aucune notification.</p>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`flex items-start gap-3 p-4 border-b border-border/50 transition-colors hover:bg-muted/30 cursor-pointer ${!notif.isRead ? 'bg-muted/10' : ''}`}
                    onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                  >
                    <div className={`mt-0.5 rounded-full p-1.5 ${
                      notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                      notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm leading-none ${!notif.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 pt-1">
                        {notif.time}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                    )}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex items-center gap-3 border-l border-border pl-4 ml-2">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">Administrateur</span>
            <span className="text-xs text-muted-foreground">{adminEmail || "admin@encherepro.fr"}</span>
          </div>
          <Avatar>
            {adminAvatar && <AvatarImage src={adminAvatar} alt="@admin" />}
            <AvatarFallback>{adminEmail ? adminEmail.charAt(0).toUpperCase() : "AD"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
