'use client'

import * as React from 'react'
import { Building, Mail, MapPin, Phone, Plus, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function ContactsPage(): React.ReactElement {
  const tAdmin = useTranslations('admin.contacts')
  const tCommon = useTranslations('common')
  const [search, setSearch] = React.useState<string>('')

  const contacts = [
    {
      id: 1,
      name: 'Kelompok Tani Syailendra Mandiri (Pak Joko)',
      category: 'Petani Mitra',
      phone: '+62 813-2890-1122',
      email: 'tani.sindoro@syailendra.id',
      city: 'Temanggung (Lereng Sindoro)',
      isCompany: true
    },
    {
      id: 2,
      name: 'Koperasi Tani Sejahtera Dieng',
      category: 'Petani Mitra',
      phone: '+62 857-4321-8899',
      email: 'koperasi.dieng@agri.id',
      city: 'Wonosobo (Plataran Dieng)',
      isCompany: true
    },
    {
      id: 3,
      name: 'PT Nusantara Roastery Kopi',
      category: 'Pembeli B2B',
      phone: '+62 21-5544-3322',
      email: 'procurement@nusantararoastery.co.id',
      city: 'Jakarta Selatan',
      isCompany: true
    },
    {
      id: 4,
      name: 'CV Karung Goni & Logistik Semesta',
      category: 'Pemasok Kemasan',
      phone: '+62 24-7654-3210',
      email: 'sales@karungsemesta.com',
      city: 'Semarang',
      isCompany: true
    }
  ]

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tAdmin('title')}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">{tAdmin('subtitle')}</p>
        </div>
        <Button size="sm" className="cursor-pointer gap-2 text-xs font-semibold">
          <Plus className="h-4 w-4" />
          <span>Tambah Rekanan</span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input placeholder={tCommon('actions.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-xs" />
        </div>
        <Badge variant="outline" className="text-xs">
          Total: {filtered.length} Kontak
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:border-border shadow-xs transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={item.category === 'Petani Mitra' ? 'default' : 'secondary'} className="text-[10px]">
                  {item.category}
                </Badge>
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Building className="h-3 w-3" />
                  {item.isCompany ? 'Badan Usaha' : 'Individu'}
                </span>
              </div>
              <CardTitle className="pt-2 text-sm font-bold">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin className="text-primary h-3.5 w-3.5" />
                <span>{item.city}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <span>{item.phone}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span>{item.email}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
