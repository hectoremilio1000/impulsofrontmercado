import { Routes, Route } from "react-router-dom";
import Main from ".";
import FacebookAds from "./pages/FacebookAds";
import GoogleAds from "./pages/GoogleAds";
import TiktokAds from "./pages/TiktokAds";
import LayoutMarketing from "./components/Layout";
import NotFoundPage from "../../pages/NotFoundPage";
import Reservaciones from "./pages/Reservaciones";
import EventType from "./pages/EventType";
import EventTypeAvailableTimes from "./pages/EventTypeAvailableTimes";

function MarketingRoutes({ open, setOpen }) {
  return (
    <Routes>
      <Route
        index
        element={
          <LayoutMarketing open={open} setOpen={setOpen}>
            <Main />
          </LayoutMarketing>
        }
      />
      <Route
        path="/googleads"
        element={
          <LayoutMarketing open={open} setOpen={setOpen}>
            <GoogleAds />
          </LayoutMarketing>
        }
      />
      <Route
        path="/tiktokads"
        element={
          <LayoutMarketing open={open} setOpen={setOpen}>
            <TiktokAds />
          </LayoutMarketing>
        }
      />
      <Route
        path="/facebookads"
        element={
          <LayoutMarketing open={open} setOpen={setOpen}>
            <FacebookAds />
          </LayoutMarketing>
        }
      />
      <Route
        path="/reservations"
        element={
          <LayoutMarketing open={open} setOpen={setOpen}>
            <Reservaciones />
          </LayoutMarketing>
        }
      />
      <Route
        path="/reservations/event_types/:uuid"
        element={
          <LayoutMarketing open={open} setOpen={setOpen}>
            <EventType />
          </LayoutMarketing>
        }
      />
      <Route
        path="/reservations/event_type_available_times"
        element={
          <LayoutMarketing open={open} setOpen={setOpen}>
            <EventTypeAvailableTimes />
          </LayoutMarketing>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default MarketingRoutes;
