export type Occasion =
  | 'BIRTHDAY'
  | 'CHRISTMAS'
  | 'ANNIVERSARY'
  | 'VALENTINES_DAY'
  | 'GRADUATION'
  | 'WEDDING'
  | 'OTHER'

export const OCCASIONS: Occasion[] = [
  'BIRTHDAY',
  'CHRISTMAS',
  'ANNIVERSARY',
  'VALENTINES_DAY',
  'GRADUATION',
  'WEDDING',
  'OTHER',
]

export type GiftStatus = 'PLANNED' | 'BOUGHT' | 'GIVEN'

export const GIFT_STATUSES: GiftStatus[] = ['PLANNED', 'BOUGHT', 'GIVEN']

export interface Gift {
  id: string
  idea: string
  price: number | null
  link: string | null
  status: GiftStatus
}

export interface Person {
  id: string
  name: string
  occasion: Occasion
  notes: string | null
  gifts: Gift[]
}

export type NewPerson = Omit<Person, 'id' | 'gifts'>
export type NewGift = Omit<Gift, 'id'>
