import { type ReactElement } from 'react'
import { CalendarCheck, Clock, UserCheck } from 'lucide-react'

import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HrOverviewPage(): ReactElement {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'HR & Attendance' }]} />

      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">HR, Presensi & Jam Kerja</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Monitoring kehadiran harian staf perkebunan, gudang sortir, dan manajemen Syailendra Group terintegrasi Odoo 18.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="dark:bg-card border-border/40 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Kehadiran Hari Ini</CardTitle>
            <CalendarCheck className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94% Hadir</div>
            <p className="text-muted-foreground mt-1 text-xs">Sinkronisasi real-time modul hr_attendance</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-card border-border/40 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Total Jam Kerja</CardTitle>
            <Clock className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">184 Jam</div>
            <p className="text-muted-foreground mt-1 text-xs">Akumulasi shift operasional minggu ini</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-card border-border/40 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Staf Lapangan Aktif</CardTitle>
            <UserCheck className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 Personel</div>
            <p className="text-muted-foreground mt-1 text-xs">Unit Temanggung, Wonosobo & Pusat</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
