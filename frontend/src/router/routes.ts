import { RouteRecordRaw } from 'vue-router';
import { UserRole } from 'src/helpers/users/user';

/* Dinamically import the layouts */
const MainLayout = () => import('layouts/MainLayout.vue');

/* Dinamically import the pages */
const HomeView = () => import('pages/HomeView.vue');
const LandingPage = () => import('pages/LandingPage.vue');
const LandingConfirmationPage = () =>
  import('pages/LandingConfirmationPage.vue');
const AthletesView = () => import('pages/AthletesView.vue');
const LibraryView = () => import('pages/LibraryView.vue');
const ProgramView = () => import('pages/ProgramView.vue');
const ProgramViewerView = () => import('pages/ProgramViewerView.vue');
const ProgramLibraryView = () => import('pages/ProgramLibraryView.vue');
const UserLoginView = () => import('pages/UserLoginView.vue');
const UserRegisterView = () => import('pages/UserRegisterView.vue');
const UserProfileView = () => import('pages/UserProfileView.vue');
const PrivacyPolicyView = () => import('pages/PrivacyPolicyView.vue');
const CookiePolicyView = () => import('pages/CookiePolicyView.vue');
const TermsAndConditionView = () => import('pages/TermsAndConditionsView.vue');
const NotFoundPage = () => import('pages/NotFoundPage.vue');

/* Set routes names */
export enum NamedRoutes {
  home = 'home',
  landing = 'landing',
  landingConfirmation = 'landingConfirmation',
  athletes = 'athletes',
  exerciseLibrary = 'exerciseLibrary',
  program = 'program',
  programLibrary = 'programLibrary',
  view = 'view',
  viewProgram = 'viewProgram',
  login = 'login',
  register = 'register',
  profile = 'profile',
  privacyPolicy = 'privacyPolicy',
  cookiePolicy = 'cookiePolicy',
  termsConditions = 'termsConditions',
  notFound = 'notFound',
}

/**
 * Currently available meta info in routes:
 *  - title : To set the page title in browser.
 *  - showHeader: Set both header-related meta properties:
 *    - showHeaderSm: If true, show header on small screens. Default is true.
 *    - showHeaderLg: If true, show header on large screens. Default is false.
 *  - showFooter: If true, show bottom footer. Default is true.
 *  - showLeftDrawer: If true, show left drawer. Default is true.
 *  - restrictAccessByRole : List of user roles that can access the page. If not provided,
 *                           anyone can access the page. Admin can always access.
 *  - restrictAccessToLevel : Maximum access level number user must have to be able to access
 *                            the page (eg if 3, only users with level 1, 2 or 3 can access).
 *  - redirectNotAuthorized : View to redirect user when trying to access a view that is
 *                            restricted by user role.
 *  - redirectAuthenticated : View to redirect user if authenticated. This is a special
 *                            restriction by role where no role can access a page.
 *  - redirectNotAuthenticated : View to redirect user if not authenticated. This is a special
 *                               restriction by role where any role can access, if role is
 *                               defined.
 */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    redirect: { name: NamedRoutes.home },
    children: [
      {
        path: '',
        name: NamedRoutes.home,
        component: HomeView,
        meta: {
          title: 'Home',
          restrictAccessToLevel: 4,
          redirectNotAuthorized: NamedRoutes.landing,
          redirectNotAuthenticated: NamedRoutes.landing,
        },
      },
    ],
  },

  {
    path: '/_MainLayout',
    component: MainLayout,
    redirect: { name: NamedRoutes.notFound },
    children: [
      {
        path: '/welcome',
        name: NamedRoutes.landing,
        component: LandingPage,
        meta: {
          title: 'Welcome',
          showHeader: true,
          showLeftDrawer: false,
        },
      },
      {
        path: '/confirmation',
        name: NamedRoutes.landingConfirmation,
        component: LandingConfirmationPage,
        meta: {
          title: 'Welcome',
          showHeader: true,
          showLeftDrawer: false,
        },
      },
      {
        path: '/athletes',
        name: NamedRoutes.athletes,
        component: AthletesView,
        meta: {
          title: 'Athletes',
          restrictAccessByRole: [UserRole.coach],
          restrictAccessToLevel: 4,
          redirectNotAuthorized: NamedRoutes.home,
        },
      },
      {
        path: '/library',
        name: NamedRoutes.exerciseLibrary,
        component: LibraryView,
        meta: {
          title: 'Library',
          restrictAccessByRole: [UserRole.coach],
          restrictAccessToLevel: 4,
          redirectNotAuthorized: NamedRoutes.home,
        },
      },
      {
        path: '/program/:programId?',
        name: NamedRoutes.program,
        component: ProgramView,
        meta: {
          title: 'Program',
          restrictAccessByRole: [UserRole.coach],
          restrictAccessToLevel: 4,
          redirectNotAuthorized: NamedRoutes.home,
          // TODO showRightDrawer: RightDrawerProgramElements,
        },
      },
      {
        path: '/program-library',
        name: NamedRoutes.programLibrary,
        component: ProgramLibraryView,
        meta: {
          title: 'Program Library',
          restrictAccessByRole: [UserRole.coach],
          redirectNotAuthorized: 'home',
        },
      },
      {
        path: '/view',
        name: NamedRoutes.view,
        meta: {
          title: 'View',
          showHeader: false,
          showFooter: true,
          showLeftDrawer: false,
        },
        children: [
          {
            path: 'program',
            name: NamedRoutes.viewProgram,
            component: ProgramViewerView,
            meta: {
              title: 'View program',
            },
          },
        ],
      },
      {
        path: '/login',
        name: NamedRoutes.login,
        component: UserLoginView,
        props: true,
        meta: {
          title: 'Login',
          redirectAuthenticated: NamedRoutes.home,
        },
      },
      {
        path: '/register',
        name: NamedRoutes.register,
        component: UserRegisterView,
        meta: {
          title: 'Register',
          redirectAuthenticated: NamedRoutes.home,
        },
      },
      {
        path: '/profile',
        name: NamedRoutes.profile,
        component: UserProfileView,
        meta: {
          title: 'Profile',
          redirectNotAuthenticated: NamedRoutes.login,
        },
      },
      {
        path: '/privacy-policy',
        name: NamedRoutes.privacyPolicy,
        component: PrivacyPolicyView,
        meta: {
          title: 'Privacy Policy',
        },
      },
      {
        path: '/cookie-policy',
        name: NamedRoutes.cookiePolicy,
        component: CookiePolicyView,
        meta: {
          title: 'Cookie Policy',
        },
      },
      {
        path: '/terms-and-conditions',
        name: NamedRoutes.termsConditions,
        component: TermsAndConditionView,
        meta: {
          title: 'Terms and Conditions',
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/_NotFoundLayout',
    component: MainLayout,
    children: [
      {
        path: '/:catchAll(.*)*',
        name: NamedRoutes.notFound,
        component: NotFoundPage,
        meta: {
          title: 'Page not found',
        },
      },
    ],
  },
];

export default routes;
