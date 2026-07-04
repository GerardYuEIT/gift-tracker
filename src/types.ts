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

export type GiftPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export const GIFT_PRIORITIES: GiftPriority[] = ['LOW', 'MEDIUM', 'HIGH']

export interface Gift {
  id: string
  idea: string
  price: number | null
  budget: number | null
  quantity: number | null
  priority: GiftPriority | null
  notes: string | null
  link: string | null
  imageUrl: string | null
  status: GiftStatus
}

export type Relationship =
  | 'FRIEND'
  | 'FAMILY'
  | 'SPOUSE'
  | 'PARTNER'
  | 'RELATIVE'
  | 'COWORKER'
  | 'CLASSMATE'
  | 'TEACHER'
  | 'OTHER'

export const RELATIONSHIPS: Relationship[] = [
  'FRIEND',
  'FAMILY',
  'SPOUSE',
  'PARTNER',
  'RELATIVE',
  'COWORKER',
  'CLASSMATE',
  'TEACHER',
  'OTHER',
]

export interface Person {
  id: string
  name: string
  occasion: Occasion
  relationship: Relationship | null
  eventDate: string | null
  notes: string | null
  imageUrl: string | null
  gifts: Gift[]
}

export type NewPerson = Omit<Person, 'id' | 'gifts' | 'imageUrl'>
export type NewGift = Omit<Gift, 'id' | 'imageUrl'>
