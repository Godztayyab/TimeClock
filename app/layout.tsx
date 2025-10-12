import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import { Header } from "@/components/header/Header";
import { TimeEntryProvider } from "@/_context/TimeEntryContext";
import { Toaster } from "@/components/ui/toaster";
import { getActiveTimeEntry, getUserTimeEntries } from "@/actions/time-entry";
import { Department, EmployeeDepartment, TimeEntry } from "@prisma/client";
import { getAllDepartmentsInfo, getPermittedDepartmentsInfo, getUserPermittedDepartmentsInfoWithRates } from "@/actions/department";
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
  let permittedDepartmentsWithRates: EmployeeDepartment[] | null = null; 


if (user && user.id) {
    const [activeEntry, userEntries, allDepts, permittedDepts, permittedDeptsRates] = await Promise.all([
      getActiveTimeEntry(user.id),
      getUserTimeEntries(user.id),
      getAllDepartmentsInfo(),
      getPermittedDepartmentsInfo(user.id),
      getUserPermittedDepartmentsInfoWithRates(user.id)
    ]);

    if (activeEntry.data) currentEntry = activeEntry.data;
    if (userEntries.data) recentEntries = userEntries.data;
    if (allDepts?.departments) departments = allDepts.departments;
    if (permittedDepts?.departments) permittedDepartments = permittedDepts.departments;
    if (permittedDeptsRates?.success) permittedDepartmentsWithRates = permittedDeptsRates.departments;
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-yellow-50`}>

        <SessionProvider session={session}>
          <TimeEntryProvider currentEntry={currentEntry} recentEntries={recentEntries} departments={departments} permittedDepartments={permittedDepartments} permittedDepartmentsWithRates={permittedDepartmentsWithRates}>

            <Header user={user ?? null} />
            {children}
            <Toaster />
          </TimeEntryProvider>

        </SessionProvider>
      </body>

    </html>
  );
}
