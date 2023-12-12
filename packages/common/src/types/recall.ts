export interface IRecordOfAny {
  [key: string]: any
}

export interface IRecall {
  id: string
  surveyId: string
  userId: string
  startTime: Date
  endTime: Date
  submissionTime: Date
  log: IRecordOfAny | null
  uxSessionId: string | null
  userAgent: string | null
  createdAt: Date
  updatedAt: Date
  user: IRecallUser
  meals: IRecallMeal[]
  survey: {
    id: string
    slug: string
  }
  customFields: IRecordOfAny[] | null
}

export interface IRecallExtended extends IRecall {
  dietionSurveyId: string
  addedToRecallDb: Date
  username: string
}

export interface IRecallUser {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  simpleName?: string | null
  multiFactorAuthentification?: boolean | null
  emailNotifications?: boolean | null
  smsNotifications?: boolean | null
  verifiedAt?: Date | null
  disabledAt?: Date | null
  createdAt?: Date | null
  updatedAt?: Date | null
  aliases: IUserAliases
  customFields: IRecordOfAny[] | null
}

interface IUserAliases {
  id: string
  userId: string
  surveyId: string
  username: string
  uriAuthToken?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IRecallMeal {
  id: string
  surveySubmissionId: string
  name: string
  hours: number
  minutes: number
  duration: number
  customFields: IRecordOfAny[] | null
  missingFoods: IRecordOfAny[] | null
  foods: IRecordOfAny[]
}

export interface IRecallMealFood {
  id: string
  parentId: string
  mealId: string
  index: number
  code: string
  englishName: string
  localeName: string | null
  readyMeal: boolean
  searchTearm: string | null
  portionSizeMethodId: string
  reasonableAmount: boolean
  foodGroupId: string
  foodGroupEnglishName: string
  foodGroupLocalName: string | null
  brand: string | null
  nutrientTableId: string
  nutrientTableCode: string
  barcode: string | null
  customFields: IRecordOfAny[] | null
  fields: IRecordOfAny[] | null
  portionSizes: IRecallPortionSize[]
  nutrients: IRecallNutrient[]
}

export interface IRecallPortionSize {
  id: string
  foodId: string
  name: string
  value: string
}
export interface IRecallNutrient {
  id: string
  foodId: string
  amount: number
  nutrientTypeId: string
  nutrientType: {
    id: string
    description: string
    unitId: string
  }
}
