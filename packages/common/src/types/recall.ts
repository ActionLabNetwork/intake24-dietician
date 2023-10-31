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
  user: IRecordOfAny
  meals: IRecordOfAny[]
  survey: {
    id: string
    slug: string
  }
  customFields: IRecordOfAny[] | null
}
