"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldSeparator,
} from "@/components/ui/field";

export default function CompanySettingsPage(): React.ReactElement {
  const tAdmin = useTranslations("admin.company");
  const tCommon = useTranslations("common");
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const [formData, setFormData] = React.useState({
    name: "PT Syailendra Group Mandiri",
    tagline: "Integrated Specialty Commodities & Agribusiness Traceability",
    email: "official@syailendra.com",
    phone: "+62 286 321 8899",
    website: "https://syailendragroup.com",
    address: "Kawasan Industri & Pergudangan Agribisnis, Temanggung - Wonosobo, Jawa Tengah 56254",
    currency: "IDR (Rupiah Indonesia)",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      toast.success(tAdmin("messages.saved"));
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tAdmin("title")}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{tAdmin("subtitle")}</p>
      </div>

      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Building className="h-4 w-4 text-emerald-600" />
                Identitas Entitas Usaha Odoo 18 (res.company)
              </CardTitle>
              <CardDescription className="text-xs">
                Data resmi yang digunakan pada kop surat jalan, sertifikat QR panen, dan faktur
                komoditas
              </CardDescription>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              Verified Entity
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <FieldGroup>
              <FieldSet>
                <FieldLegend className="text-sm font-bold">Identitas Pokok Perusahaan</FieldLegend>
                <FieldDescription className="text-xs">
                  Nama legal dan positioning komoditas Syailendra Group
                </FieldDescription>
                <FieldGroup className="mt-4">
                  <Field>
                    <FieldLabel htmlFor="comp-name" className="text-xs font-semibold">
                      {tAdmin("fields.name")}
                    </FieldLabel>
                    <Input
                      id="comp-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="comp-tagline" className="text-xs font-semibold">
                      {tAdmin("fields.tagline")}
                    </FieldLabel>
                    <Input
                      id="comp-tagline"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend className="text-sm font-bold">
                  Saluran Komunikasi & Portal Web
                </FieldLegend>
                <FieldDescription className="text-xs">
                  Kontak resmi untuk mitra petani dan buyer roastery internasional
                </FieldDescription>
                <FieldGroup className="mt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="comp-email" className="text-xs font-semibold">
                        {tAdmin("fields.email")}
                      </FieldLabel>
                      <Input
                        id="comp-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="comp-phone" className="text-xs font-semibold">
                        {tAdmin("fields.phone")}
                      </FieldLabel>
                      <Input
                        id="comp-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="comp-website" className="text-xs font-semibold">
                      {tAdmin("fields.website")}
                    </FieldLabel>
                    <Input
                      id="comp-website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="comp-address" className="text-xs font-semibold">
                      {tAdmin("fields.address")}
                    </FieldLabel>
                    <Textarea
                      id="comp-address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="h-20 resize-none text-xs"
                      required
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <Field orientation="horizontal" className="justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="cursor-pointer gap-2 font-semibold"
                >
                  <Save className="h-4 w-4" />
                  <span>{isPending ? tCommon("status.loading") : tCommon("actions.save")}</span>
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
