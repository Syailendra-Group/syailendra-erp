import { z } from 'zod'

export const partnerPinSchema = z.object({
  pin: z
    .string()
    .min(6, 'PIN wajib 6 digit angka')
    .max(6, 'PIN wajib 6 digit angka')
    .regex(/^\d{6}$/, 'PIN harus berupa angka'),
  confirmPin: z.string()
})

export const partnerPinIssueSchema = z
  .object({
    pin: z
      .string()
      .min(6, 'PIN wajib 6 digit angka')
      .max(6, 'PIN wajib 6 digit angka')
      .regex(/^\d{6}$/, 'PIN harus berupa angka'),
    confirmPin: z.string()
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'Konfirmasi PIN tidak cocok',
    path: ['confirmPin']
  })

export type PartnerPinIssueInput = z.infer<typeof partnerPinIssueSchema>

export function isWeakPin(pin: string): boolean {
  const digits = pin.split('').map(Number)
  if (new Set(digits).size === 1) return true
  let sequential = true
  let reverseSequential = true
  for (let i = 1; i < digits.length; i++) {
    if ((digits[i] - digits[i - 1] + 10) % 10 !== 1) sequential = false
    if ((digits[i - 1] - digits[i] + 10) % 10 !== 1) reverseSequential = false
  }
  return sequential || reverseSequential
}
