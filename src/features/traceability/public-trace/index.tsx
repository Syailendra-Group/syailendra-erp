'use client'

import {
  AlertCircle,
  Award,
  CheckCircle2,
  Droplets,
  ExternalLink,
  Flame,
  Leaf,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
  TreeDeciduous,
  UserCheck
} from 'lucide-react'

import { LanguageToggle } from '@/components/shared/language-toggle'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'

import type { PublicTraceabilityProjection } from '@/lib/odoo/types'
import type { ReactElement } from 'react'

export interface PublicTraceViewProps {
  data: PublicTraceabilityProjection | null
  lotCode: string
}

export function PublicTraceView({ data, lotCode }: PublicTraceViewProps): ReactElement {
  if (!data) {
    return (
      <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-4 transition-colors">
        <Card className="w-full max-w-md p-6 text-center shadow-lg">
          <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold">Lot Not Found</CardTitle>
          <CardDescription className="mt-2 text-xs">
            Batch ID <span className="text-foreground font-mono font-semibold">{lotCode}</span> could not be verified in the Syailendra Traceability
            Engine or is still under laboratory analysis.
          </CardDescription>
          <div className="mt-6">
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="bg-background text-foreground min-h-screen transition-colors">
      {/* Top Navbar */}
      <header className="border-border/40 dark:bg-background/80 dark:supports-[backdrop-filter]:bg-background/70 sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-1.5">
              <Leaf className="size-4" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-tight">DDistillers</span>
              <span className="text-muted-foreground ml-1.5 hidden text-[10px] font-medium sm:inline">• PT. Syailendra Bumi Investama</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:space-y-6 sm:p-6 sm:py-8">
        {/* Certificate Card Header */}
        <Card className="border-primary/20 from-primary/5 via-card to-card overflow-hidden bg-gradient-to-b shadow-sm">
          <CardHeader className="pt-6 pb-2 text-center">
            <div className="border-primary/20 bg-primary/10 text-primary mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>100% Verified Authentic & Traceable</span>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight sm:text-3xl">{data.product_name}</CardTitle>
            <p className="text-primary font-mono text-xs font-semibold sm:text-sm">Batch ID: {data.lot_code}</p>
          </CardHeader>
          <CardContent className="pb-6 text-center">
            <p className="text-muted-foreground text-xs italic sm:text-sm">
              &ldquo;Specialty Essential Oil ethically sourced from smallholder farmers in Central Java, steam-distilled and quality-tested in
              compliance with ISO 22000 & GMP standards.&rdquo;
            </p>
          </CardContent>
        </Card>

        {/* 2-Column Grid: Origin & Botanical */}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {/* Terroir & Origin */}
          <Card className="shadow-xs">
            <CardHeader className="p-3.5 pb-2 sm:p-4 sm:pb-2">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <MapPin className="text-primary size-3.5" />
                <span>Terroir & Origin</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3.5 pt-0 text-xs sm:p-4 sm:pt-0">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Region:</span>
                <span className="text-end font-semibold">{data.origin_region}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Elevation:</span>
                <span className="flex items-center gap-1 font-semibold">
                  <Mountain className="text-muted-foreground size-3" />
                  {data.elevation_masl} m ASL
                </span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Farmer Partner:</span>
                <span className="flex items-center gap-1 font-semibold">
                  <UserCheck className="text-primary size-3" />
                  {data.farmer_group}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harvest Date:</span>
                <span className="font-semibold">{data.harvest_date}</span>
              </div>
            </CardContent>
          </Card>

          {/* Botanical & Extraction */}
          <Card className="shadow-xs">
            <CardHeader className="p-3.5 pb-2 sm:p-4 sm:pb-2">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <TreeDeciduous className="text-primary size-3.5" />
                <span>Botanical & Extraction</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3.5 pt-0 text-xs sm:p-4 sm:pt-0">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Botanical Name:</span>
                <span className="font-semibold italic">{data.botanical_name}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Plant Part:</span>
                <span className="font-semibold">{data.plant_part}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Method:</span>
                <span className="flex items-center gap-1 font-semibold">
                  <Flame className="size-3 text-amber-500" />
                  {data.distillation_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quality Score:</span>
                <span className="text-primary flex items-center gap-1 font-bold">
                  <Award className="size-3" />
                  {data.cupping_or_grade_score} / 100
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sensory Profile & Organoleptic */}
        <Card className="shadow-xs">
          <CardHeader className="p-3.5 pb-2 sm:p-4 sm:pb-2">
            <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <Droplets className="text-primary size-3.5" />
              <span>Sensory & Organoleptic Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 text-xs sm:p-4 sm:pt-0">
            <div className="bg-muted/30 grid grid-cols-1 gap-2 rounded-lg p-3 sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Appearance & Color</span>
                <span className="font-semibold">{data.organoleptic.color}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Clarity</span>
                <span className="font-semibold">{data.organoleptic.clarity}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Odor Character</span>
                <span className="font-semibold">{data.organoleptic.odor}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GC-MS Active Compounds Breakdown */}
        <Card className="shadow-xs">
          <CardHeader className="p-3.5 pb-2 sm:p-4 sm:pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="text-primary size-3.5" />
                <span>GC-MS Chemical Profile (Active Compounds)</span>
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px]">
                Gas Chromatography
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 p-3.5 pt-0 text-xs sm:p-4 sm:pt-0">
            {data.active_compounds.map((cmp) => (
              <div key={cmp.compound} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>{cmp.compound}</span>
                  <span className="text-primary font-mono font-bold">{cmp.percentage}%</span>
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.min(cmp.percentage * 3, 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Digital Certificate of Analysis (COA) */}
        <Card className="border-border/60 bg-muted/20 p-4 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <ShieldCheck className="text-primary size-4" />
                <span>Official Laboratory Certificate of Analysis (COA)</span>
              </div>
              <p className="text-muted-foreground text-xs">Verified laboratory test results confirming purity and zero synthetic adulteration.</p>
            </div>
            {data.public_coa_url ? (
              <Button asChild size="sm" className="cursor-pointer gap-1.5 text-xs font-semibold">
                <a href={data.public_coa_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  <span>View COA PDF</span>
                </a>
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs">
                COA Verified by QA
              </Badge>
            )}
          </div>
        </Card>

        {/* Lifecycle & Safety Dates */}
        <div className="text-muted-foreground grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4 sm:gap-3">
          <div className="bg-card rounded-lg border p-2">
            <span className="block text-[10px] uppercase">Safety Class</span>
            <span className="text-foreground text-[11px] font-semibold sm:text-xs">{data.safety_classification}</span>
          </div>
          <div className="bg-card rounded-lg border p-2">
            <span className="block text-[10px] uppercase">Production Date</span>
            <span className="text-foreground text-[11px] font-semibold sm:text-xs">{data.production_date}</span>
          </div>
          <div className="bg-card rounded-lg border p-2">
            <span className="block text-[10px] uppercase">Expiry Date</span>
            <span className="text-foreground text-[11px] font-semibold sm:text-xs">{data.expiration_date}</span>
          </div>
          <div className="bg-card rounded-lg border p-2">
            <span className="block text-[10px] uppercase">Authenticity</span>
            <span className="text-[11px] font-semibold text-emerald-600 sm:text-xs dark:text-emerald-400">100% Genuine</span>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-muted-foreground border-t pt-4 text-center text-[11px]">
          <p>&copy; {new Date().getFullYear()} PT. Syailendra Bumi Investama (DDistillers). All rights reserved.</p>
          <p className="mt-0.5 text-[10px]">Empowering rural farmers through transparent, high-integrity supply chains.</p>
        </footer>
      </div>
    </main>
  )
}
