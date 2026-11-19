import { NavigateModel } from "../models/navigate-model"

export const ROUTES_CONSTANTS = {
  HOME: '/',
  AUTH: '/auth',
  LIBRARY: '/library',
  FORBIDDEN: '/forbidden',
  ADMIN: {
    DASHBOARD: '/admin',
    URL_GRP: '/admin/url-grp',
    URL: '/admin/url',
    LANGUAGE: '/admin/language',
    TECHNOLOGY: '/admin/technology',
    PROJECT: {
      ROOT: '/admin/project',
      FORM: '/admin/project/form'
    },
  },
  PRIVACY_POLICY: {
    NAVAJA_SUIZA: '/privacy-policy/navaja-suiza',
  },
}

export const NAVIGATE_MENU_ITEM: NavigateModel[] = [
  { label: 'Dashboard', icon: 'dashboard', navigateTo: ROUTES_CONSTANTS.ADMIN.DASHBOARD },
  { label: 'Url Grp', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.URL_GRP },
  { label: 'Url', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.URL },
  { label: 'Language', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.LANGUAGE },
  { label: 'Technology', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.TECHNOLOGY },
  { label: 'Project', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.PROJECT.ROOT },
]
