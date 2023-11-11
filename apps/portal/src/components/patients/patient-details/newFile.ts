import { watch } from 'vue';
import { Theme } from '@intake24-dietician/common/types/theme';
import { Gender } from '@/schema/patient';
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile';
import { patientQuery, contactDetailsFormValues, personalDetailsFormValues, theme, sendAutomatedFeedback, recallFrequency } from './PatientDetails.vue';

watch(
() => patientQuery.data.value?.data.data,
newData => {
if (!newData) return;

console.log({ newData });

contactDetailsFormValues.value = {
firstName: newData.patientProfile?.firstName ??
contactDetailsFormValues.value.firstName,
middleName: newData.patientProfile?.middleName ??
contactDetailsFormValues.value.middleName,
lastName: newData.patientProfile?.lastName ??
contactDetailsFormValues.value.lastName,
avatar: newData.patientProfile?.avatar ?? getDefaultAvatar(newData.email),
mobileNumber: newData.patientProfile?.mobileNumber ??
contactDetailsFormValues.value.mobileNumber,
emailAddress: newData.email,
address: newData.patientProfile?.address ??
contactDetailsFormValues.value.address,
};

personalDetailsFormValues.value = {
age: newData.patientProfile?.age ?? personalDetailsFormValues.value.age,
gender: (newData.patientProfile?.gender as Gender) ??
personalDetailsFormValues.value.gender,
weight: newData.patientProfile?.weight ??
personalDetailsFormValues.value.weight,
height: newData.patientProfile?.height ??
personalDetailsFormValues.value.height,
additionalNotes: newData.patientProfile?.additionalNotes ??
personalDetailsFormValues.value.additionalNotes,
patientGoal: newData.patientProfile?.patientGoal ??
personalDetailsFormValues.value.patientGoal,
};

theme.value = newData.patientProfile!.patientPreferences!.theme as Theme;
sendAutomatedFeedback.value =
newData.patientProfile!.patientPreferences!.sendAutomatedFeedback;
recallFrequency.value = {
reminderEvery: {
quantity: newData.patientProfile!.patientPreferences!.recallFrequency!.quantity,
unit: newData.patientProfile!.patientPreferences!.recallFrequency!.unit,
},
reminderEnds: newData.patientProfile!.patientPreferences!.recallFrequency!.end,
};
},
{ immediate: true }
);
