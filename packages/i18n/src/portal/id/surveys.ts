export const surveys = {
  entry: 'surveys',
  entrySingular: 'survey',
  summary: {
    title: 'Surveys summary',
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
        description:
          'This is the name of your new clinic where you can add new patients and manage their recalls.',
      },
      alias: {
        label: 'Alias',
        description: 'This is the alias of the survey in Intake24.',
      },
      type: 'Type',
      status: 'Status',
      recallSubmissionUrl: {
        label: 'Recall submission URL',
        description: 'This is the URL where Intake24 will send the recall to.',
      },
      intake24SurveyId: {
        label: 'Intake24 survey ID',
        description: 'This is the ID of the survey in Intake24.',
      },
      intake24Secret: {
        label: 'Intake24 secret',
        description: 'This is the secret of the survey in Intake24.',
      },
    },
    subtitle:
      'Your practise, your space. Create and tailor the new clinic according to your work needs.',
    dismiss: 'Dismiss',
  },
}
