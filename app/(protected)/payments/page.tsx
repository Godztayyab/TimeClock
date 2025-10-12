import { PaymentEntryList } from '@/components/PaymentEntryList'
import { Suspense } from 'react';
import PaymentEntryListSkeleton from '@/components/skeleton/components/PaymentEntryListSkelethon';

export default async function Dashboard() {

  return (
    <div className="space-y-6 my-6 container mx-auto">
      <Suspense fallback={<PaymentEntryListSkeleton />}>
        <PaymentEntryList />
      </Suspense>
    </div>
  )
}

// getUserPermittedDepartmentsInfoWithRates } from '@/actions/department'