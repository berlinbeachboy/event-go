import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { User } from "@/models/models";
import { Button } from "./ui/button";

export interface AnimalTableProps extends React.ComponentProps<typeof Sidebar> {
    user: User;
    handleLogout: () => void;
    changeView: (view: any) => void
}


export function AppSidebar({ user, handleLogout, changeView,...props }: AnimalTableProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <h3>Moin {user.nickname}</h3>
        <h5>Hoffe dein Tag ist schön.</h5>
          
      </SidebarHeader>
      <SidebarSeparator></SidebarSeparator>
      <SidebarContent>

      <SidebarGroup>
            <SidebarGroupLabel>Mein Schönfeld</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Button variant={"outline"} onClick={()=>{changeView('spotSelect')}}> Mein Platz </Button>
                   
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    
                    <Button variant={"outline"} onClick={()=>{changeView('changeMe')}}> Meine Daten </Button>
                </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator></SidebarSeparator>
      <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Button variant={"outline"} onClick={()=>{changeView('userTable')}}> Alle User </Button>
                    
                </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Button variant={"outline"} onClick={()=>{changeView('spotTable')}}> Alle Spots </Button>
                    
                </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              
            </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                <Button variant={"destructive"} onClick={handleLogout}> Logout </Button>
                </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              
            </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator></SidebarSeparator>
      
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
