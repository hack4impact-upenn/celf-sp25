import React from 'react';
// import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// import theme from './assets/theme.ts';
import { store, persistor } from './util/redux/store.ts';
import NotFoundPage from './NotFound/NotFoundPage.tsx';
import HomePage from './Home/HomePage.tsx';
import TeacherSearchSpeakerPage from './TeacherPage/TeacherSearchSpeakerPage.tsx';
import TeacherRequestSpeakerPage from './TeacherPage/TeacherRequestSpeakerPage.tsx';
import TeacherProfilePage from './TeacherPage/TeacherProfilePage.tsx';
import AdminDashboardPage from './AdminDashboard/AdminDashboardPage.tsx';
import AdminAddSpeakerPage from './AdminDashboard/AdminAddSpeakerPage.tsx';
import AdminAllSpeakerPage from './AdminDashboard/AdminAllSpeakerPage.tsx';
import AdminRequestsPage from './AdminDashboard/AdminRequestsPage';
import AdminIndustryFocusPage from './AdminDashboard/AdminIndustryFocusPage.tsx';
import AdminExportSpeakersPage from './AdminDashboard/AdminExportSpeakersPage.tsx';
import SpeakerEditProfilePage from './SpeakerDashboard/SpeakerEditProfilePage.tsx';
import SpeakerRequestsPage from './SpeakerDashboard/SpeakerRequestsPage.tsx';

import {
  UnauthenticatedRoutesWrapper,
  ProtectedRoutesWrapper,
  DynamicRedirect,
  AdminRoutesWrapper,
  TeacherRoutesWrapper,
  SpeakerRoutesWrapper,
} from './util/routes.tsx';
import VerifyAccountPage from './Authentication/VerifyAccountPage.tsx';
import RegisterPage from './Authentication/RegisterPage.tsx';
import Sidebar from './components/teacher_sidebar/Sidebar.tsx';
import LoginPage from './Authentication/LoginPage.tsx';
import EmailResetPasswordPage from './Authentication/EmailResetPasswordPage.tsx';
import ResetPasswordPage from './Authentication/ResetPasswordPage.tsx';
import AlertPopup from './components/AlertPopup.tsx';
import LoginSelectPage from './Home/LoginSelect.tsx';
import SpeakerRegisterPage from './Authentication/SpeakerRegister.tsx';
import TeacherRegisterPage from './Authentication/TeacherRegister.tsx';
import AdminRegisterPage from './Authentication/AdminRegister.tsx';
import SpeakerSubmitInfoPage from './Authentication/SpeakerSubmitInfo.tsx';
import SpeakerDashboardPage from './SpeakerDashboard/SpeakerDashboardPage.tsx';
import AccountSettingsPage from './AccountSettings/AccountSettingsPage.tsx';
import InvitePage from './Authentication/InvitePage.tsx';
import { useAppSelector } from './util/redux/hooks.ts';
import { selectUser } from './util/redux/userSlice.ts';

function App() {
  return (
    <div className="App">
      {/* <SearchBar onSearch={handleSearch} placeholder="Type your search..." /> */}
      <BrowserRouter>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {/* <ThemeProvider theme={theme}> */}
            <CssBaseline>
              <AlertPopup />
              <Routes>
                {/* <Route path="/home" element={<HomePage />} /> */}
                {/* Routes accessed only if user is not authenticated */}
                <Route element={<UnauthenticatedRoutesWrapper />}>
                  <Route path="/login-select" element={<LoginSelectPage />} />
                  <Route
                    path="/admin-register"
                    element={<AdminRegisterPage />}
                  />
                  <Route
                    path="/admin-register/:token"
                    element={<AdminRegisterPage />}
                  />
                  <Route
                    path="/teacher-register"
                    element={<TeacherRegisterPage />}
                  />
                  <Route
                    path="/speaker-register"
                    element={<SpeakerRegisterPage />}
                  />

                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/verify-account/:token"
                    element={<VerifyAccountPage />}
                  />
                  <Route
                    path="/email-reset"
                    element={<EmailResetPasswordPage />}
                  />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPasswordPage />}
                  />
                  <Route
                    path="/invite/:token"
                    element={<InvitePage />}
                  />
                </Route>

                {/* Routes accessed only if user is authenticated */}
                <Route element={<ProtectedRoutesWrapper />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route
                    path="/account-settings"
                    element={<AccountSettingsPage />}
                  />
                </Route>

                {/* Routes accessed only if user is a teacher */}
                <Route element={<TeacherRoutesWrapper />}>
                  <Route
                    path="/teacher-search-speaker"
                    element={<TeacherSearchSpeakerPage />}
                  />
                  <Route
                    path="/teacher-speaker-requests"
                    element={<TeacherRequestSpeakerPage />}
                  />
                  <Route
                    path="/teacher-profile"
                    element={<TeacherProfilePage />}
                  />
                </Route>

                {/* Routes accessed only if user is a speaker */}
                <Route element={<SpeakerRoutesWrapper />}>
                  <Route
                    path="/speaker-submit-info"
                    element={<SpeakerSubmitInfoPage />}
                  />
                  <Route
                    path="/speaker-dashboard"
                    element={<SpeakerDashboardPage />}
                  />
                  <Route
                    path="/speaker-requests"
                    element={<SpeakerRequestsPage />}
                  />
                  <Route
                    path="/profile/edit"
                    element={<SpeakerEditProfilePage />}
                  />
                </Route>

                {/* Routes accessed only if user is an admin */}
                <Route element={<AdminRoutesWrapper />}>
                  <Route
                    path="/admin-dashboard"
                    element={<AdminDashboardPage />}
                  />
                  <Route
                    path="/admin-add-speakers"
                    element={<AdminAddSpeakerPage />}
                  />
                  <Route
                    path="/admin-all-speakers"
                    element={<AdminAllSpeakerPage />}
                  />
                  <Route
                    path="/admin-requests"
                    element={<AdminRequestsPage />}
                  />
                  <Route
                    path="/admin-industry-focus"
                    element={<AdminIndustryFocusPage />}
                  />
                  <Route
                    path="/admin-export-speakers"
                    element={<AdminExportSpeakersPage />}
                  />
                </Route>

                <Route
                  path="/"
                  element={
                    <DynamicRedirect unAuthPath="/login" authPath="/home" />
                  }
                />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </CssBaseline>
            {/* </ThemeProvider> */}
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;
