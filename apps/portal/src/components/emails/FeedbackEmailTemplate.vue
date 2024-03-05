<template>
  <EHtml>
    <EHead />
    <EPreview>Intake24-Dietician: Your Recall Feedback</EPreview>
    <EBody :style="main">
      <EContainer>
        <ESection :style="logo">
          <EImg src="logo.png" />
        </ESection>

        <ESection :style="content">
          <ERow
            :style="{
              ...boxInfos,
              paddingBottom: 0,
            }"
          >
            <EColumn>
              <EHeading
                style="font-size: 32; font-weight: bold; text-align: center"
              >
                Hi {{ patientStore.patientQuery.data?.firstName }},
              </EHeading>
              <EHeading
                as="h2"
                :style="{
                  fontSize: '26px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }"
              >
                Your dietician, {{ authStore.profile?.firstName }}
                {{ authStore.profile?.lastName }} has sent you feedback for a
                recall you submitted.
              </EHeading>

              <EText :style="paragraph">
                <b>Date: </b>
                {{ recallStore.selectedRecallDateRangePretty }}
              </EText>
              <EText :style="{ ...paragraph, marginTop: '-5px' }">
                <b>Feedback type: </b>
                Tailored
              </EText>
              <EText :style="{ ...paragraph, marginTop: '2rem' }">
                Thank you, <br />
                The Intake24-Dietician team
              </EText>
            </EColumn>
          </ERow>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>

<script setup lang="ts">
import {
  EBody,
  EColumn,
  EContainer,
  EHead,
  EHeading,
  EHtml,
  EImg,
  EPreview,
  ERow,
  ESection,
  EText,
} from 'vue-email'
import { usePatientStore } from '@/stores/patient'
import { useAuthStore } from '@/stores/auth'
import { useRecallStore } from '@/stores/recall'

const patientStore = usePatientStore()
const authStore = useAuthStore()
const recallStore = useRecallStore()

const main = {
  backgroundColor: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const paragraph = {
  fontSize: '16px',
}

const logo = {
  padding: '10px 15px',
}

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden',
}

const boxInfos = {
  padding: '20px 40px',
}
</script>
