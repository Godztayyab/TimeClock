import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import { Header } from "@/components/header/Header";
import { TimeEntryProvider } from "@/_context/TimeEntryContext";
import { Toaster } from "@/components/ui/toaster";
import { getActiveTimeEntry, getUserTimeEntries } from "@/actions/time-entry";
import { Department, TimeEntry } from "@prisma/client";
import { getAllDepartmentsInfo, getPermittedDepartmentsInfo } from "@/actions/department";
import localFont from "next/font/local";
import "./globals.css";
import { Metadata } from "next";
import { en } from "@/en";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export const metadata: Metadata = {
  title: en.MetaData.title,
  description: en.MetaData.description,
};




interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();
  const user = await currentUser();
  let currentEntry = null;
  let recentEntries: TimeEntry[] = [];
  let departments: Department[] = [];
  let permittedDepartments: Department[] = [];


  if (user && user.id) {
    await getActiveTimeEntry(user.id).then((entry) => {
      if (entry.data)
        currentEntry = entry.data;
    }
    );

    await getUserTimeEntries(user.id).then((entries) => {
      if (entries.data)
        recentEntries = entries.data
    });

    await getAllDepartmentsInfo().then((departments_resp) => {
      if (departments_resp && departments_resp.departments) {
        departments = departments_resp.departments;
      }
    });

    await getPermittedDepartmentsInfo(user.id).then((data) => {
      if (data && data.departments) {
        permittedDepartments = data.departments;
      }
    }
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-yellow-50`}>

        <SessionProvider session={session}>
          <TimeEntryProvider currentEntry={currentEntry} recentEntries={recentEntries} departments={departments} permittedDepartments={permittedDepartments}>

            <Header user={user ?? null} />
            {children}
            <Toaster />
          </TimeEntryProvider>

        </SessionProvider>
      </body>

    </html>
  );
}
