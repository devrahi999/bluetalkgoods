"use client";

import React, { createContext, useContext, useState } from 'react';

interface AdminSidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(p => !p);
  const close = () => setIsOpen(false);
  return (
    <AdminSidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export const useAdminSidebar = () => useContext(AdminSidebarContext);
