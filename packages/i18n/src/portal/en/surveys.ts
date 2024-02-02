export const surveys = {
  entry: 'surveys',
  entrySingular: 'survey',
  summary: {
    title: 'Clinic summary',
    number: ' Total number of',
    addNew: 'Add New',
    active: 'Active:',
    archived: 'Archived:',
  },
  disclaimerNotrifications: {
    title: '{username} surveys and templates',
    subtitle:
      ' This is the page for your surveys and surveys templates (master settings). You have {newSurveysNumber} new surveys submisssions and {templatesNumber} templates.',
    dismiss: 'Dismiss',
  },
  backToSurveyList: 'Back to survey list',
  addNewSurvey: {
    title: 'Create your new clinic',
    save: 'Save',
    surveyDetails: {
      title: 'Survey details',
      name: {
        label: 'Clinic name',
        description: 'This is the name of your current clinic',
      },
      type: 'Type',
      status: 'Status',
      intake24SurveyHost: {
        label: 'Intake24 survey host',
        description:
          'Host URL of the Intake24 instance (e.g. https://survey.intake24.dev)',
      },
      intake24SurveyId: {
        label: 'Intake24 survey ID',
        description: 'This is the ID of the survey in Intake24.',
      },
      intake24Secret: {
        label: 'Intake24 secret',
        description: 'This is the secret of the survey in Intake24.',
      },
      alias: {
        label: 'Alias',
        description:
          'This is an alias that you can choose to identify this clinic in the Intake24 system.',
      },
    },
    subtitle:
      'Your practise, your space. Create and tailor the new clinic according to your work needs.',
    dismiss: 'Dismiss',
  },
}
