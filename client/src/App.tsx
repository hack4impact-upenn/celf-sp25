import React from 'react';
// import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
// import theme from './assets/theme.ts';
import { store, persistor } from './util/redux/store';
import NotFoundPage from './NotFound/NotFoundPage';
import HomePage from './Home/HomePage';
import TeacherSearchSpeakerPage from './TeacherPage/TeacherSearchSpeakerPage';
import TeacherRequestSpeakerPage from './TeacherPage/TeacherRequestSpeakerPage';
import TeacherProfilePage from './TeacherPage/TeacherProfilePage';
import AdminDashboardPage from './AdminDashboard/AdminDashboardPage';
import AdminAddSpeakerPage from './AdminDashboard/AdminAddSpeakerPage';
import AdminAllSpeakerPage from './AdminDashboard/AdminAllSpeakerPage';
import AdminRequestsPage from './AdminDashboard/AdminRequestsPage';
import AdminIndustryFocusPage from './AdminDashboard/AdminIndustryFocusPage';
import AdminExportSpeakersPage from './AdminDashboard/AdminExportSpeakersPage';
import SpeakerEditProfilePage from './SpeakerDashboard/SpeakerEditProfilePage';
import SpeakerRequestsPage from './SpeakerDashboard/SpeakerRequestsPage';

import {
  UnauthenticatedRoutesWrapper,
  PasswordResetRoutesWrapper,
  ProtectedRoutesWrapper,
  DynamicRedirect,
  AdminRoutesWrapper,
  TeacherRoutesWrapper,
  SpeakerRoutesWrapper,
} from './util/routes';
import VerifyAccountPage from './Authentication/VerifyAccountPage';
import RegisterPage from './Authentication/RegisterPage';
import Sidebar from './components/teacher_sidebar/Sidebar';
import LoginPage from './Authentication/LoginPage';
import EmailResetPasswordPage from './Authentication/EmailResetPasswordPage';
import ResetPasswordPage from './Authentication/ResetPasswordPage';
import AlertPopup from './components/AlertPopup';
import LoginSelectPage from './Home/LoginSelect';
import SpeakerRegisterPage from './Authentication/SpeakerRegister';
import TeacherRegisterPage from './Authentication/TeacherRegister';
import AdminRegisterPage from './Authentication/AdminRegister';
import SpeakerSubmitInfoPage from './Authentication/SpeakerSubmitInfo';
import SpeakerDashboardPage from './SpeakerDashboard/SpeakerDashboardPage';
import AccountSettingsPage from './AccountSettings/AccountSettingsPage';
import InvitePage from './Authentication/InvitePage';
import { useAppSelector } from './util/redux/hooks';
import { selectUser } from './util/redux/userSlice';

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
                </Route>

                {/* Routes for invite and password reset - shows warning if user is already logged in */}
                <Route element={<PasswordResetRoutesWrapper />}>
                  <Route
                    path="/invite/:token"
                    element={<InvitePage />}
                  />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPasswordPage />}
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
