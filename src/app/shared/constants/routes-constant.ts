import { NavigateModel } from "../models/navigate-model"

export const ROUTES_CONSTANTS = {
  HOME: '/',
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/not-found',
  ADMIN: {
    DASHBOARD: '/admin',
    URL_GRP: '/admin/url-grp',
    URL: '/admin/url',
    LAMGUAGE: '/admin/language',
    TECHNOLOGY: '/admin/technology',
    PROJECT: '/admin/project',
  },
}

export const NAVIGATE_MENU_ITEM: NavigateModel[] = [
  { label: 'Dashboard', icon: 'dashboard', navigateTo: ROUTES_CONSTANTS.ADMIN.DASHBOARD },
  { label: 'Url Grp', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.URL_GRP },
  { label: 'Url', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.URL },
  { label: 'Language', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.LAMGUAGE },
  { label: 'Technology', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.TECHNOLOGY },
  { label: 'Project', icon: 'settings', navigateTo: ROUTES_CONSTANTS.ADMIN.PROJECT },
]
