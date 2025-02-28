import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage/LandingPage.vue'
import DeclaredResults from '@/components/LandingPage/DeclaredResults.vue'
import VoterDashboard from '@/components/Voter/VoterDashboard.vue'
import CandidateDashboard from '@/components/Candidate/CandidateDashboard.vue'
import AdminDashboard from '@/components/Admin/AdminDashboard.vue'
import VoterLogin from '@/components/Voter/VoterLogin.vue'
import VoterRegistration from '@/components/Voter/VoterRegistration.vue'
import ResetPassword from '@/components/ResetPassword.vue'
import CandidateLogin from '@/components/Candidate/CandidateLogin.vue'
import RegisterCandidate from '@/components/Voter/RegisterCandidate.vue'
import AdminLogin from '@/components/Admin/AdminLogin.vue'
import FileUpload from '@/components/Voter/FileUpload.vue'
import Nominations from '@/components/Candidate/Nominations.vue'
import ApplyNominations from '@/components/Candidate/ApplyNominations.vue'
import ContestedCandidates from '@/components/Candidate/ContestedCandidates.vue'
import CandidateProfile from '@/components/Candidate/CandidateProfile.vue'
import AdminDashboardLayout from '@/components/Admin/AdminDashboardLayout.vue'
import VotersManagement from '@/components/Admin/VotersManagement.vue'
import CandidateManagement from '@/components/Admin/CandidateManagement.vue'
import Manifesto from '@/components/Candidate/Manifesto.vue'
import ManageCampaign from '@/components/Candidate/ManageCampaign.vue'
import ElectionManagement from '@/components/Admin/ElectionManagement.vue'
import CandidateDashboardLayout from '@/components/Candidate/CandidateDashboardLayout.vue'
// import ViewCandidate from '@/components/Voter/ViewCandidate.vue'
import VoterDashboardLayout from '@/components/Voter/VoterDashboardLayout.vue'
import UpComingElections from '@/components/Voter/UpComingElections.vue'
import ElectionResults from '@/components/CommonComponents/ElectionResults.vue'
import VoteNow from '@/components/Voter/VoteNow.vue'
import VoterFeedback from '@/components/Voter/VoterFeedback.vue'
import ForgotPassword from '@/components/CommonComponents/ForgotPassword.vue'
import LandingPageElections from '@/components/LandingPage/LandingPageElections.vue'
import UserProfile from '@/components/CommonComponents/UserProfile.vue'
import NotFound from '@/components/CommonComponents/NotFound.vue'
import AdminElectionResultsWrapper from '@/components/Admin/AdminElectionResultsWrapper.vue'

import ApplicationFeeback from '@/components/CommonComponents/ApplicationFeeback.vue'
import ContestedCandidatesList from '@/components/Voter/ContestedCandidatesList.vue'
import ContestedCandidateProfile from '@/components/Voter/ContestedCandidateProfile.vue'
import Reports from '@/components/Admin/Reports.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage
    },

    {
      path: '/voterLogin',
      name: 'voterLogin',
      component: VoterLogin
    },
    {
      path: '/forgotpassword/:roleId',
      name: 'forgotPassword',
      component: ForgotPassword
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      props: (route) => {
        const pathMatch = Array.isArray(route.params.pathMatch)
          ? route.params.pathMatch.join('/')
          : route.params.pathMatch
        return { pathMatch }
      }
    },
    {
      path: '/resetPassword',
      name: 'resetPassword',
      component: ResetPassword
    },
    {
      path: '/registerVoter',
      name: 'voterRegistration',
      component: VoterRegistration
    },
    {
      path: '/declaredresults',
      name: 'declaredresults',
      component: DeclaredResults
    },
    {
      path: '/elections',
      name: 'elections',
      component: LandingPageElections
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardLayout,
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboard
        },
        {
          path: 'votermanagement',
          name: 'votermanagement',
          component: VotersManagement
        },
        {
          path: 'candidatemanagement',
          name: 'candidatemanagement',
          component: CandidateManagement,
          props: (route) => ({
            defaultOperation: route.query.defaultOperation,
            filter: route.query.filter
          })
        },
        {
          path: 'electionmanagement/:electionId/ContestedCandidates',
          component: ContestedCandidates,
          props: (route) => ({
            electionId: Number(route.params.electionId),
            candidateId: Number(route.params.candidateId)
          })
        },
        {
          path: 'electionmanagement/:electionId/:candidateId/profile',
          name: 'CandidateDetails',
          component: CandidateProfile,
          props: (route) => ({
            electionId: Number(route.params.electionId),
            candidateId: Number(route.params.candidateId)
          })
        },
        {
          path: 'electionmanagement',
          name: 'electionmanagement',
          component: ElectionManagement,
          meta: { defaultTab: 'active' }
        },
        {
          path: 'reports',
          name: 'reports',
          component: Reports
        },
        {
          path: 'electionresults',
          name: 'admin-electionresults',
          component: AdminElectionResultsWrapper,
          meta: {
            requiresAuth: true,
            role: 'admin'
          }
        },
        { path: 'profile', component: UserProfile }
      ]
    },
    {
      path: '/voter',
      name: 'voter',
      component: VoterDashboardLayout,
      children: [
        { path: 'dashboard', name: 'dashboard', component: VoterDashboard },
        { path: 'votenow', name: 'votenow', component: VoteNow },
        { path: 'upcomingelections', name: 'upcomingelections', component: UpComingElections },
        { path: 'voterelectionresults', component: ElectionResults },
        { path: 'registercandidate', name: 'register-candidate', component: RegisterCandidate },
        { path: 'feedback', name: 'feedback', component: VoterFeedback },
        { path: 'profile', component: UserProfile },
        {
          path: 'applicationfeedback',
          component: ApplicationFeeback
        },
        {
          path: 'upcomingelections/:electionId/contestedcandidateslist',
          name: 'contestedcandidateslist',
          component: ContestedCandidatesList,
          props: (route) => ({
            electionId: Number(route.params.electionId),
            candidateId: Number(route.params.candidateId)
          })
        },
        {
          path: 'upcomingelections/:electionId/:candidateId/contestedcandidateprofile',
          name: 'ContestedCandidateProfile',
          component: ContestedCandidateProfile,
          props: (route) => ({
            electionId: Number(route.params.electionId),
            candidateId: Number(route.params.candidateId)
          })
        }
      ]
    },
    {
      path: '/candidate',
      name: 'candidate',
      component: CandidateDashboardLayout,
      children: [
        { path: 'manifesto', name: 'manifestoInfo', component: Manifesto },
        { path: 'managecampaign', name: 'manageCampaign', component: ManageCampaign },
        {
          path: 'electionresults',
          name: 'electionresults',
          component: ElectionResults
        },
        {
          path: 'dashboard',
          component: CandidateDashboard
        },
        {
          path: ':electionId/ContestedCandidates',
          name: 'ContestedCandidates',
          component: ContestedCandidates,
          props: (route) => ({
            electionId: Number(route.params.electionId),
            candidateId: Number(route.params.candidateId),
            role: 'candidate'
          })
        },

        {
          path: ':electionId/:candidateId/profile',
          name: 'CandidateProfile',
          component: CandidateProfile,
          props: (route) => ({
            electionId: Number(route.params.electionId),
            candidateId: Number(route.params.candidateId)
          })
        },
        {
          path: 'nominations',
          name: 'nominations',
          component: Nominations
        },
        {
          path: 'nominations/candidateId/:candidateId/electionCode/:electionCode/apply',
          name: 'applynominations',
          component: ApplyNominations,
          props: (route) => ({
            candidateId: route.params.candidateId,
            electionCode: route.params.electionCode
          })
        },
        { path: 'profile', component: UserProfile }
      ]
    },

    {
      path: '/registercandidate',
      name: 'registercandidate',
      component: RegisterCandidate
    },
    {
      path: '/candidateLogin',
      name: 'candidateLogin',
      component: CandidateLogin
    },
    {
      path: '/adminLogin',
      name: 'adminLogin',
      component: AdminLogin
    },
    {
      path: '/fileUpload',
      name: 'fileUpload',
      component: FileUpload
    },
    {
      path: '/candidateLogin',
      name: 'candidateLogin',
      component: CandidateLogin
    }
  ]
})
let previousRoute: string | null = null

router.beforeEach((to, from, next) => {
  previousRoute = from.fullPath || null
  next()
})

export { router, previousRoute }
